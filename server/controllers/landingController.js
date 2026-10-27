const mongoose = require('mongoose')
const Course = require('../models/Course')
const LiveTutorProfile = require('../models/LiveTutorProfile')
const SessionFeedback = require('../models/SessionFeedback')
const TeacherApplication = require('../models/TeacherApplication')
const TutorAvailability = require('../models/TutorAvailability')
const User = require('../models/User')

const uniqueSubjects = (...subjectGroups) => {
  const subjectsByKey = new Map()

  subjectGroups.flat().forEach((subject) => {
    if (typeof subject !== 'string' || !subject.trim()) return
    const normalizedSubject = subject.trim()
    const key = normalizedSubject.toLocaleLowerCase()
    if (!subjectsByKey.has(key)) subjectsByKey.set(key, normalizedSubject)
  })

  return [...subjectsByKey.values()].sort((left, right) => left.localeCompare(right))
}

const getLandingPageData = async (req, res) => {
  try {
    const [
      courseCount,
      courses,
      studentCount,
      courseSubjects,
      teacherAccounts,
      acceptingTutorIds,
      feedbackRecords,
    ] = await Promise.all([
      Course.countDocuments({ status: 'published' }),
      Course.find({ status: 'published' })
        .select('title description thumbnail category subject level language teacher isFree price discountPercentage currency estimatedDuration totalEnrollments rating totalRatings')
        .populate('teacher', 'name profilePhoto')
        .sort({ totalEnrollments: -1 }),
      User.countDocuments({ role: 'student', isActive: true }),
      Course.distinct('subject', { status: 'published' }),
      User.find({ role: 'teacher', isApproved: true, isActive: true })
        .select('name profilePhoto')
        .sort({ createdAt: -1 })
        .lean(),
      TutorAvailability.distinct('tutor', { isAcceptingBookings: true }),
      SessionFeedback.find({ isPublic: true, comment: { $regex: /\S/ } })
        .select('rating comment createdAt booking')
        .populate({ path: 'booking', select: 'subject' })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ])

    const teacherIds = teacherAccounts.map((teacher) => teacher._id)
    const [
      teacherApplications,
      teacherCourseSummaries,
      tutorProfiles,
    ] = await Promise.all([
      TeacherApplication.find({ user: { $in: teacherIds }, status: 'approved' })
        .select('user mainCategory specificSubject teachingLanguage teachingMethod yearsOfExperience bio')
        .lean(),
      Course.aggregate([
        { $match: { status: 'published', teacher: { $in: teacherIds } } },
        {
          $group: {
            _id: '$teacher',
            courseCount: { $sum: 1 },
            subjects: { $addToSet: '$subject' },
          },
        },
      ]),
      acceptingTutorIds.length
        ? LiveTutorProfile.find({
          user: { $in: acceptingTutorIds },
          isActive: true,
        })
          .populate({
            path: 'user',
            match: { isActive: true, isLiveTutor: true },
            select: 'name profilePhoto',
          })
          .sort({ rating: -1, totalSessionsTaught: -1 })
          .lean()
        : [],
    ])

    const teacherApplicationById = new Map(
      teacherApplications.map((application) => [String(application.user), application]),
    )
    const teacherCourseSummaryById = new Map(
      teacherCourseSummaries.map((summary) => [String(summary._id), summary]),
    )
    const teachers = teacherAccounts.map((teacher) => {
      const application = teacherApplicationById.get(String(teacher._id))
      const courseSummary = teacherCourseSummaryById.get(String(teacher._id))

      return {
        id: String(teacher._id),
        name: teacher.name,
        profilePhoto: teacher.profilePhoto || '',
        category: application?.mainCategory || '',
        subject: application?.specificSubject || '',
        language: application?.teachingLanguage || '',
        yearsOfExperience: application?.yearsOfExperience ?? null,
        bio: application?.bio || '',
        courseCount: courseSummary?.courseCount || 0,
        courseSubjects: courseSummary?.subjects || [],
      }
    })

    const tutors = tutorProfiles
      .filter((profile) => profile.user)
      .map((profile) => ({
        id: String(profile._id),
        userId: String(profile.user._id),
        name: profile.user.name,
        profilePhoto: profile.profilePhoto || profile.user.profilePhoto || '',
        bio: profile.bio,
        subjects: profile.subjects || [],
        languages: profile.teachingLanguages || [],
        sessionDuration: profile.sessionDuration || profile.sessionDurations?.[0] || null,
        sessionPrice: profile.sessionPrice ?? profile.hourlyRate ?? null,
        currency: profile.currency || '',
        mainCategory: profile.mainCategory || '',
        teachingLevel: profile.teachingLevel || '',
        teachingApproach: profile.teachingApproach || '',
        introVideoUrl: profile.introVideoUrl || '',
        isVerified: Boolean(profile.isVerified),
        rating: profile.rating || 0,
        totalRatings: profile.totalRatings || 0,
        totalSessionsTaught: profile.totalSessionsTaught || 0,
      }))

    const tutorSubjects = tutors.flatMap((tutor) => tutor.subjects)
    const teacherSubjects = teacherApplications.map((application) => application.specificSubject)
    const subjects = uniqueSubjects(courseSubjects, teacherSubjects, tutorSubjects)

    return res.status(200).json({
      stats: {
        courses: courseCount,
        teachers: teacherAccounts.length,
        tutors: tutors.length,
        students: studentCount,
        subjects: subjects.length,
      },
      courses,
      subjects,
      teachers,
      tutors,
      feedback: feedbackRecords
        .filter((record) => record.booking && record.comment?.trim())
        .map((record) => ({
          id: String(record._id),
          rating: record.rating,
          comment: record.comment,
          subject: record.booking.subject || '',
          createdAt: record.createdAt,
        })),
    })
  } catch (error) {
    console.error('Get public landing page data error:', error)
    return res.status(500).json({ message: 'Server error while loading landing page data' })
  }
}

const getPublicTeacherProfile = async (req, res) => {
  try {
    const { teacherId } = req.params
    if (!mongoose.isValidObjectId(teacherId)) {
      return res.status(400).json({ message: 'Invalid teacher profile ID' })
    }

    const teacher = await User.findOne({
      _id: teacherId,
      role: 'teacher',
      isApproved: true,
      isActive: true,
    })
      .select('name profilePhoto')
      .lean()

    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' })

    const [application, courses] = await Promise.all([
      TeacherApplication.findOne({ user: teacher._id, status: 'approved' })
        .select('mainCategory specificSubject teachingLanguage teachingMethod yearsOfExperience bio')
        .lean(),
      Course.find({ teacher: teacher._id, status: 'published' })
        .select('title description thumbnail category subject level language rating totalEnrollments')
        .sort({ createdAt: -1 })
        .lean(),
    ])

    return res.status(200).json({
      teacher: {
        id: String(teacher._id),
        name: teacher.name,
        profilePhoto: teacher.profilePhoto || '',
        category: application?.mainCategory || '',
        subject: application?.specificSubject || '',
        language: application?.teachingLanguage || '',
        teachingMethod: application?.teachingMethod || '',
        yearsOfExperience: application?.yearsOfExperience ?? null,
        bio: application?.bio || '',
      },
      courses,
    })
  } catch (error) {
    console.error('Get public teacher profile error:', error)
    return res.status(500).json({ message: 'Server error while fetching teacher profile' })
  }
}

module.exports = { getLandingPageData, getPublicTeacherProfile }
