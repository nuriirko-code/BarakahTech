const mongoose = require('mongoose')
const CommunitySession = require('../models/CommunitySession')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const User = require('../models/User')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')

const getUserId = (user) => user?.id || user?.userId
const isAdmin = (user) => user?.role === 'admin'
const isSessionHost = (session, user) => Boolean(
  session.hostUser && String(session.hostUser._id || session.hostUser) === String(getUserId(user))
)
const hasValidSessionId = (id) => mongoose.isValidObjectId(id)
const isRegistered = (session, userId) => Boolean(
  userId && session.participants.some((participant) => String(participant.user?._id || participant.user) === String(userId))
)

const serializeSession = (session, userId, includeOutcomes = false) => {
  const publicSession = typeof session.toObject === 'function' ? session.toObject() : { ...session }
  const participants = publicSession.participants || []
  const outcomes = publicSession.outcomes
  delete publicSession.participants
  delete publicSession.outcomes
  const participantCount = participants.length

  return {
    ...publicSession,
    participantCount,
    seatsLeft: Math.max(0, publicSession.capacity - participantCount),
    isRegistered: isRegistered({ participants }, userId),
    ...(includeOutcomes ? { outcomes } : {}),
  }
}

const getSessionById = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null
  return CommunitySession.findById(id)
}

// Lists upcoming and in-progress sessions with safe attendance metadata but no
// private meeting links or personal registration records.
const listSessions = async (req, res) => {
  try {
    const past = req.query.past === 'true'
    const query = past
      ? { status: 'completed', type: { $ne: 'course_mentorship' } }
      : {
          type: { $ne: 'course_mentorship' },
          status: { $in: ['scheduled', 'live'] },
          ...(!isAdmin(req.user) && {
            startsAt: { $gte: new Date(Date.now() - (2 * 60 * 60 * 1000)) },
          }),
        }
    const sessionsQuery = CommunitySession.find(query).sort({ startsAt: past ? -1 : 1 })
    if (!past) sessionsQuery.select('-outcomes')
    const sessions = await sessionsQuery.lean()
    const sessionIds = sessions.map((session) => session._id)
    const registrations = req.user && sessionIds.length
      ? await CommunitySession.find({
          _id: { $in: sessionIds },
          'participants.user': getUserId(req.user),
        }).select('_id')
      : []
    const registeredIds = new Set(registrations.map((session) => String(session._id)))

    return res.status(200).json({
      sessions: sessions.map((session) => {
        const participantCount = session.participants?.length || 0
        const safeSession = { ...session }
        delete safeSession.participants
        if (!past) delete safeSession.outcomes
        return {
          ...safeSession,
          participantCount,
          seatsLeft: Math.max(0, session.capacity - participantCount),
          isRegistered: registeredIds.has(String(session._id)),
        }
      }),
    })
  } catch (error) {
    console.error('List community sessions error:', error)
    return res.status(500).json({ message: 'Unable to load community sessions.' })
  }
}

// Returns one public-safe session and its outcomes without disclosing the room link.
const getSession = async (req, res) => {
  try {
    const session = await getSessionById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Community session not found.' })
    // Course mentorship is only discoverable through course/student dashboards,
    // never through the public community detail page.
    if (session.type === 'course_mentorship') {
      return res.status(404).json({ message: 'Community session not found.' })
    }

    return res.status(200).json({
      session: serializeSession(session, getUserId(req.user), true),
    })
  } catch (error) {
    console.error('Get community session error:', error)
    return res.status(500).json({ message: 'Unable to load this community session.' })
  }
}

// Uses a single conditional MongoDB update, so only one request can claim the final seat.
const registerForSession = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const userId = getUserId(req.user)
    const requestedSession = await CommunitySession.findById(req.params.id).select('type course')
    if (!requestedSession) return res.status(404).json({ message: 'Community session not found.' })
    // Only a fully enrolled student of this exact course may claim a mentorship seat.
    if (requestedSession.type === 'course_mentorship') {
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: requestedSession.course,
        isFullyEnrolled: true,
      }).select('_id')
      if (!enrollment) {
        return res.status(403).json({ message: 'Enroll in this course to join its mentorship' })
      }
    }

    // Keep seat claiming atomic so concurrent registrations cannot exceed capacity.
    const session = await CommunitySession.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $in: ['scheduled', 'live'] },
        'participants.user': { $ne: userId },
        $expr: { $lt: [{ $size: '$participants' }, '$capacity'] },
      },
      { $push: { participants: { user: userId } } },
      { new: true, runValidators: true }
    )

    if (!session) {
      const existingSession = await CommunitySession.findById(req.params.id).select('status capacity participants')
      if (!existingSession) return res.status(404).json({ message: 'Community session not found.' })
      if (!['scheduled', 'live'].includes(existingSession.status)) {
        return res.status(400).json({ message: 'Registration for this session is closed.' })
      }
      if (isRegistered(existingSession, userId)) {
        return res.status(400).json({ message: 'You are already registered for this session.' })
      }
      if (existingSession.participants.length >= existingSession.capacity) {
        return res.status(400).json({ message: 'This community session is full.' })
      }
      return res.status(400).json({ message: 'Unable to register for this session.' })
    }

    return res.status(201).json({
      message: 'You are registered for this community session.',
      session: serializeSession(session, userId),
    })
  } catch (error) {
    console.error('Register for community session error:', error)
    return res.status(500).json({ message: 'Unable to register for this community session.' })
  }
}

const createMentorshipAnnouncement = async ({ session, course, teacherId }) => {
  const enrollments = await Enrollment.find({
    course: course._id,
    isFullyEnrolled: true,
    student: { $ne: teacherId },
  }).select('student')
  const participants = [...new Set([teacherId, ...enrollments.map(({ student }) => String(student))])]
  if (participants.length < 2) return

  const subject = `Weekly mentorship: ${course.title}`
  const content = `New mentorship: ${session.title} on ${session.startsAt.toISOString()}`
  const conversation = await Conversation.create({
    participants,
    type: 'announcement',
    course: course._id,
    subject,
  })
  const message = await Message.create({
    conversation: conversation._id,
    sender: teacherId,
    content,
    type: 'announcement',
    readBy: [{ user: teacherId, readAt: new Date(), isRead: true }],
  })
  conversation.lastMessage = message.content
  conversation.lastMessageAt = message.createdAt || new Date()
  conversation.lastMessageBy = teacherId
  await conversation.save()
}

const createMentorshipSession = async (req, res) => {
  try {
    const body = req.body || {}
    if (!mongoose.isValidObjectId(body.courseId)) {
      return res.status(400).json({ message: 'Choose a valid course.' })
    }
    // Course ownership is checked against the authenticated teacher, never a client-provided owner id.
    const course = await Course.findById(body.courseId)
    if (!course) return res.status(404).json({ message: 'Course not found.' })
    if (String(course.teacher) !== String(getUserId(req.user))) {
      return res.status(403).json({ message: 'You can only schedule mentorship for your own courses.' })
    }
    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Only published courses can have mentorship sessions.' })
    }

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const startsAt = new Date(body.startsAt)
    const durationMinutes = Number(body.durationMinutes)
    const capacity = body.capacity === undefined || body.capacity === '' ? 10 : Number(body.capacity)
    if (!title || !description || !body.startsAt || Number.isNaN(startsAt.getTime())) {
      return res.status(400).json({ message: 'Enter a title, description, and valid start date.' })
    }
    if (startsAt.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'The mentorship session must be scheduled in the future.' })
    }
    if (![30, 45, 60].includes(durationMinutes)) {
      return res.status(400).json({ message: 'Choose a duration of 30, 45, or 60 minutes.' })
    }
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10) {
      return res.status(400).json({ message: 'Capacity must be between 1 and 10 students.' })
    }

    const teacher = await User.findById(getUserId(req.user)).select('name')
    if (!teacher) return res.status(404).json({ message: 'Teacher account not found.' })
    const session = await CommunitySession.create({
      title,
      description,
      type: 'course_mentorship',
      course: course._id,
      hostUser: teacher._id,
      startsAt,
      durationMinutes,
      capacity,
      facilitatorName: teacher.name,
      recommendedCategory: course.category,
      createdBy: teacher._id,
    })

    let announcementWarning
    try {
      await createMentorshipAnnouncement({ session, course, teacherId: teacher._id })
    } catch (error) {
      console.error('Create mentorship announcement error:', error)
      announcementWarning = 'Session scheduled, but the student announcement could not be created.'
    }

    return res.status(201).json({
      message: 'Weekly mentorship scheduled.',
      session: serializeSession(session, teacher._id),
      ...(announcementWarning ? { warning: announcementWarning } : {}),
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    console.error('Create mentorship session error:', error)
    return res.status(500).json({ message: 'Unable to schedule the mentorship session.' })
  }
}

const getMyMentorshipSessions = async (req, res) => {
  try {
    // Filtering by the authenticated host keeps teachers from listing other teachers' sessions.
    const sessions = await CommunitySession.find({
      type: 'course_mentorship',
      hostUser: getUserId(req.user),
    })
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .lean()
    return res.status(200).json({
      sessions: sessions.map((session) => {
        const participantCount = session.participants?.length || 0
        delete session.participants
        delete session.outcomes
        return { ...session, participantCount, seatsLeft: Math.max(0, session.capacity - participantCount) }
      }),
    })
  } catch (error) {
    console.error('Get teacher mentorship sessions error:', error)
    return res.status(500).json({ message: 'Unable to load your mentorship sessions.' })
  }
}

const getEnrolledMentorshipSessions = async (req, res) => {
  try {
    // Resolve only courses fully enrolled by the authenticated student before listing mentorships.
    const enrollments = await Enrollment.find({
      student: getUserId(req.user),
      isFullyEnrolled: true,
    }).select('course')
    const courseIds = enrollments.map(({ course }) => course)
    if (courseIds.length === 0) return res.status(200).json({ sessions: [] })

    const now = new Date()
    const sessions = await CommunitySession.find({
      type: 'course_mentorship',
      course: { $in: courseIds },
      status: { $in: ['scheduled', 'live'] },
      $or: [{ startsAt: { $gte: new Date(now.getTime() - (2 * 60 * 60 * 1000)) } }, { status: 'live' }],
    })
      .populate('course', 'title')
      .populate('hostUser', 'name')
      .sort({ startsAt: 1 })
      .lean()
    return res.status(200).json({
      sessions: sessions.map((session) => {
        const participants = session.participants || []
        const isRegistered = participants.some((participant) => (
          String(participant.user?._id || participant.user) === String(getUserId(req.user))
        ))
        delete session.participants
        delete session.outcomes
        return {
          ...session,
          participantCount: participants.length,
          seatsLeft: Math.max(0, session.capacity - participants.length),
          isRegistered,
        }
      }),
    })
  } catch (error) {
    console.error('Get enrolled mentorship sessions error:', error)
    return res.status(500).json({ message: 'Unable to load course mentorship sessions.' })
  }
}

// Removes a participant only while the session is still scheduled to protect live attendance.
const cancelRegistration = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const session = await CommunitySession.findOneAndUpdate(
      { _id: req.params.id, status: 'scheduled' },
      { $pull: { participants: { user: getUserId(req.user) } } },
      { new: true }
    )
    if (!session) {
      const existingSession = await CommunitySession.findById(req.params.id).select('status')
      if (!existingSession) return res.status(404).json({ message: 'Community session not found.' })
      return res.status(400).json({ message: 'Registration can only be cancelled before the session starts.' })
    }

    return res.status(200).json({
      message: 'Your registration has been cancelled.',
      session: serializeSession(session, getUserId(req.user)),
    })
  } catch (error) {
    console.error('Cancel community registration error:', error)
    return res.status(500).json({ message: 'Unable to cancel this registration.' })
  }
}

// Creates a scheduled session; the LiveKit room name is derived from its id when joined.
const createSession = async (req, res) => {
  try {
    const body = req.body || {}
    if (body.type === 'course_mentorship') {
      return res.status(400).json({ message: 'Use the teacher mentorship endpoint to create course sessions.' })
    }
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const facilitatorName = typeof body.facilitatorName === 'string' ? body.facilitatorName.trim() : ''
    const { startsAt } = body
    if (!title || !description || !startsAt || !facilitatorName) {
      return res.status(400).json({
        message: 'Title, description, start time, and facilitator name are required.',
      })
    }
    const startDate = new Date(startsAt)
    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ message: 'Provide a valid session start date.' })
    }

    const session = await CommunitySession.create({
      title,
      description,
      startsAt: startDate,
      type: body.type,
      durationMinutes: body.durationMinutes,
      capacity: body.capacity,
      facilitatorName,
      guestMentor: body.guestMentor,
      agenda: body.agenda,
      recommendedCategory: body.recommendedCategory,
      createdBy: getUserId(req.user),
    })

    return res.status(201).json({
      message: 'Community session created.',
      session: serializeSession(session, getUserId(req.user), true),
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message })
    }
    console.error('Create community session error:', error)
    return res.status(500).json({ message: 'Unable to create the community session.' })
  }
}

// Administrators manage all community sessions; a mentorship host can only start or complete their own session.
const updateSessionStatus = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const { status } = req.body
    if (!['scheduled', 'live', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Choose a valid community session status.' })
    }
    const session = await CommunitySession.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Community session not found.' })
    if (!isAdmin(req.user)) {
      // Check the persisted host id so teachers cannot change another teacher's mentorship or public sessions.
      if (session.type !== 'course_mentorship' || !isSessionHost(session, req.user)) {
        return res.status(403).json({ message: 'You can only manage mentorship sessions for your own courses.' })
      }
      if (!['live', 'completed'].includes(status)) {
        return res.status(403).json({ message: 'Teachers can start or complete their own mentorship sessions.' })
      }
    }
    session.status = status
    await session.save()

    return res.status(200).json({
      message: 'Community session status updated.',
      session: serializeSession(session, getUserId(req.user), true),
    })
  } catch (error) {
    console.error('Update community session status error:', error)
    return res.status(500).json({ message: 'Unable to update this community session.' })
  }
}

// Saves the published takeaways and completes the session in the same database update.
const saveOutcomes = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const outcomes = req.body.outcomes || req.body
    if (!outcomes || typeof outcomes !== 'object' || Array.isArray(outcomes)) {
      return res.status(400).json({ message: 'Provide community session outcomes.' })
    }
    const session = await CommunitySession.findById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Community session not found.' })
    if (!isAdmin(req.user)) {
      // Restrict teacher-authored outcomes to the teacher who hosts this mentorship session.
      if (session.type !== 'course_mentorship' || !isSessionHost(session, req.user)) {
        return res.status(403).json({ message: 'You can only publish outcomes for your own mentorship sessions.' })
      }
    }
    session.outcomes = outcomes
    session.status = 'completed'
    await session.save()

    return res.status(200).json({
      message: 'Session outcomes saved.',
      session: serializeSession(session, getUserId(req.user), true),
    })
  } catch (error) {
    console.error('Save community session outcomes error:', error)
    return res.status(500).json({ message: 'Unable to save session outcomes.' })
  }
}

// Administrators can inspect all rosters; mentorship hosts can inspect only their own enrolled cohort.
const getSessionParticipants = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const participantsQuery = CommunitySession.findById(req.params.id)
      .select('title capacity status participants type hostUser')
    participantsQuery.populate('participants.user', isAdmin(req.user) ? 'name email' : 'name')
    const session = await participantsQuery
    if (!session) return res.status(404).json({ message: 'Community session not found.' })
    if (!isAdmin(req.user)) {
      // Require host ownership for teacher roster access, and do not widen it to unrelated session types.
      if (session.type !== 'course_mentorship' || !isSessionHost(session, req.user)) {
        return res.status(403).json({ message: 'You can only view participants in your own mentorship sessions.' })
      }
    }

    return res.status(200).json({
      session: {
        _id: session._id,
        title: session.title,
        capacity: session.capacity,
        status: session.status,
      },
      participants: session.participants,
    })
  } catch (error) {
    console.error('Get community session participants error:', error)
    return res.status(500).json({ message: 'Unable to load the session participants.' })
  }
}

module.exports = {
  listSessions,
  getSession,
  registerForSession,
  cancelRegistration,
  createMentorshipSession,
  getMyMentorshipSessions,
  getEnrolledMentorshipSessions,
  createSession,
  updateSessionStatus,
  saveOutcomes,
  getSessionParticipants,
}
