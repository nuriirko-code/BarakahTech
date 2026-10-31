const crypto = require('crypto')
const mongoose = require('mongoose')
const CommunitySession = require('../models/CommunitySession')

const getUserId = (user) => user?.id || user?.userId
const isAdmin = (user) => user?.role === 'admin'
const hasValidSessionId = (id) => mongoose.isValidObjectId(id)
const isRegistered = (session, userId) => Boolean(
  userId && session.participants.some((participant) => String(participant.user?._id || participant.user) === String(userId))
)

const serializeSession = (session, userId, includeOutcomes = false) => {
  const publicSession = typeof session.toObject === 'function' ? session.toObject() : { ...session }
  const participants = publicSession.participants || []
  const outcomes = publicSession.outcomes
  delete publicSession.meetingUrl
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
  return CommunitySession.findById(id).select('+meetingUrl')
}

// Lists upcoming and in-progress sessions with safe attendance metadata but no
// private meeting links or personal registration records.
const listSessions = async (req, res) => {
  try {
    const past = req.query.past === 'true'
    const query = past
      ? { status: 'completed' }
      : {
          status: { $in: isAdmin(req.user) ? ['scheduled', 'live', 'cancelled'] : ['scheduled', 'live'] },
          ...(!isAdmin(req.user) && {
            startsAt: { $gte: new Date(Date.now() - (2 * 60 * 60 * 1000)) },
          }),
        }
    const sessions = await CommunitySession.find(query)
      .sort({ startsAt: past ? -1 : 1 })
      .select(past ? '-meetingUrl' : '-meetingUrl -outcomes')
      .lean()
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
        delete safeSession.meetingUrl
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
    const session = await CommunitySession.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $in: ['scheduled', 'live'] },
        'participants.user': { $ne: userId },
        $expr: { $lt: [{ $size: '$participants' }, '$capacity'] },
      },
      { $push: { participants: { user: userId } } },
      { new: true, runValidators: true }
    ).select('+meetingUrl')

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
    ).select('+meetingUrl')
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

// Reveals the meeting link only to registered users once the session opens, or to an admin.
const getJoinLink = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const session = await getSessionById(req.params.id)
    if (!session) return res.status(404).json({ message: 'Community session not found.' })

    const userId = getUserId(req.user)
    if (!isRegistered(session, userId)) {
      return res.status(403).json({ message: 'Register first to access the session link.' })
    }

    const opensAt = new Date(session.startsAt.getTime() - (15 * 60 * 1000))
    const hasOpened = session.status === 'live' || Date.now() >= opensAt.getTime()
    if (!hasOpened && !isAdmin(req.user)) {
      return res.status(400).json({
        message: 'Session has not opened yet.',
        opensAt: opensAt.toISOString(),
      })
    }

    return res.status(200).json({ meetingUrl: session.meetingUrl })
  } catch (error) {
    console.error('Get community session join link error:', error)
    return res.status(500).json({ message: 'Unable to open the community session.' })
  }
}

// Creates a scheduled session with a fresh, hard-to-guess Jitsi room identifier.
const createSession = async (req, res) => {
  try {
    const body = req.body || {}
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

    const roomId = crypto.randomBytes(6).toString('hex')
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
      meetingUrl: `https://meet.jit.si/barakah-community-${roomId}`,
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

// Allows an administrator to move the session through its announced/live/cancelled lifecycle.
const updateSessionStatus = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const { status } = req.body
    if (!['scheduled', 'live', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Choose a valid community session status.' })
    }
    const session = await CommunitySession.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select('+meetingUrl')
    if (!session) return res.status(404).json({ message: 'Community session not found.' })

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
    const session = await CommunitySession.findByIdAndUpdate(
      req.params.id,
      { $set: { outcomes, status: 'completed' } },
      { new: true, runValidators: true }
    ).select('+meetingUrl')
    if (!session) return res.status(404).json({ message: 'Community session not found.' })

    return res.status(200).json({
      message: 'Session outcomes saved.',
      session: serializeSession(session, getUserId(req.user), true),
    })
  } catch (error) {
    console.error('Save community session outcomes error:', error)
    return res.status(500).json({ message: 'Unable to save session outcomes.' })
  }
}

// Lets administrators see the registered member roster for attendance follow-up.
const getSessionParticipants = async (req, res) => {
  try {
    if (!hasValidSessionId(req.params.id)) {
      return res.status(404).json({ message: 'Community session not found.' })
    }
    const session = await CommunitySession.findById(req.params.id)
      .select('title capacity status participants')
      .populate('participants.user', 'name email')
    if (!session) return res.status(404).json({ message: 'Community session not found.' })

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
  getJoinLink,
  createSession,
  updateSessionStatus,
  saveOutcomes,
  getSessionParticipants,
}
