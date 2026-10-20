const LiveTutorApplication = require('../models/LiveTutorApplication')
const LiveTutorProfile = require('../models/LiveTutorProfile')
const TutorAvailability = require('../models/TutorAvailability')
const User = require('../models/User')

// The project's existing JWT payload uses userId. Keeping that convention here
// makes these controllers compatible with authMiddleware and all other routes.
const getAuthenticatedUserId = (req) => req.user.userId

const submitLiveTutorApplication = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req)
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // An approved tutor already has a public profile and cannot submit a
    // second application. A separate edit flow can be added later if needed.
    if (user.liveTutorStatus === 'approved') {
      return res.status(400).json({
        message: 'You are already an approved live tutor',
      })
    }

    const existingApplication = await LiveTutorApplication.findOne({ user: userId })
    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already submitted a live tutor application',
      })
    }

    const {
      teachingLanguages,
      subjects,
      mainCategory,
      teachingLevel,
      sessionDurations,
      hourlyRate,
      currency,
      trialSessionOffered,
      trialSessionRate,
      yearsOfExperience,
      teachingCertificate,
      governmentId,
      profilePhoto,
      bio,
      teachingApproach,
      scenarioAnswers,
      introVideoUrl,
      weeklyAvailability,
      timezone,
      minimumSessionsPerWeek,
      advanceBookingHours,
    } = req.body

    // Array fields need a non-empty check rather than a simple truthiness
    // check because an empty array is truthy in JavaScript.
    const missingRequiredField =
      !Array.isArray(teachingLanguages) ||
      teachingLanguages.length === 0 ||
      !Array.isArray(subjects) ||
      subjects.length === 0 ||
      !mainCategory ||
      !teachingLevel ||
      !Array.isArray(sessionDurations) ||
      sessionDurations.length === 0 ||
      hourlyRate === undefined ||
      hourlyRate === null ||
      !currency ||
      yearsOfExperience === undefined ||
      yearsOfExperience === null ||
      !profilePhoto ||
      !bio ||
      !teachingApproach ||
      !timezone ||
      !Array.isArray(scenarioAnswers)

    if (missingRequiredField) {
      return res.status(400).json({
        message: 'Please provide all required live tutor application fields',
      })
    }

    // Profile images are stored as compressed data URLs until Cloudinary is
    // introduced. This limit stays below Express's 3 MB JSON request limit.
    if (profilePhoto.length > 2_500_000) {
      return res.status(400).json({
        message: 'Profile photo must be smaller than 2 MB after compression.',
      })
    }

    if (bio.trim().length < 100) {
      return res.status(400).json({
        message: 'Bio must be at least 100 characters long',
      })
    }

    if (teachingApproach.trim().length < 50) {
      return res.status(400).json({
        message: 'Teaching approach must be at least 50 characters long',
      })
    }

    if (scenarioAnswers.length !== 3) {
      return res.status(400).json({
        message: 'Please provide answers for all 3 teaching scenarios',
      })
    }

    const application = await LiveTutorApplication.create({
      user: userId,
      teachingLanguages,
      subjects,
      mainCategory,
      teachingLevel,
      sessionDurations,
      hourlyRate,
      currency,
      trialSessionOffered,
      trialSessionRate,
      yearsOfExperience,
      teachingCertificate,
      governmentId,
      bio,
      teachingApproach,
      scenarioAnswers,
      introVideoUrl,
      weeklyAvailability,
      timezone,
      minimumSessionsPerWeek,
      advanceBookingHours,
    })

    // The User owns the photo because it is reused in navigation, messaging,
    // and the approved public profile. The application remains private.
    user.profilePhoto = profilePhoto

    // Storing the status on User gives the frontend a quick, reliable account
    // state without first fetching the full private application document.
    user.liveTutorStatus = 'pending'
    await user.save()

    return res.status(201).json({
      message:
        'Application submitted successfully. Our team will review it within 3-5 business days.',
      application,
    })
  } catch (error) {
    console.error('Submit live tutor application error:', error)
    return res.status(500).json({
      message: 'Server error while submitting live tutor application',
    })
  }
}

const getMyLiveTutorApplication = async (req, res) => {
  try {
    const application = await LiveTutorApplication.findOne({
      user: getAuthenticatedUserId(req),
    })

    if (!application) {
      return res.status(404).json({ message: 'No live tutor application found' })
    }

    return res.status(200).json({ application })
  } catch (error) {
    console.error('Get live tutor application error:', error)
    return res.status(500).json({
      message: 'Server error while fetching live tutor application',
    })
  }
}

// Tutor browsing is public so learners can discover teaching options before
// creating an account. A tutor who teaches "all" levels matches any level
// search, while rating and session history surface trusted experience first.
const getApprovedTutors = async (req, res) => {
  try {
    const { category, language, minRate, maxRate, subject, level } = req.query
    const filter = {}

    if (category) filter.mainCategory = category
    if (language) filter.teachingLanguages = { $in: [language] }
    if (subject) filter.subjects = { $in: [subject] }
    if (level) filter.teachingLevel = { $in: [level, 'all'] }

    if (minRate !== undefined || maxRate !== undefined) {
      const hourlyRate = {}
      const parsedMinRate = Number(minRate)
      const parsedMaxRate = Number(maxRate)
      if (minRate !== undefined && Number.isFinite(parsedMinRate) && parsedMinRate >= 0) hourlyRate.$gte = parsedMinRate
      if (maxRate !== undefined && Number.isFinite(parsedMaxRate) && parsedMaxRate >= 0) hourlyRate.$lte = parsedMaxRate
      if (Object.keys(hourlyRate).length) filter.hourlyRate = hourlyRate
    }

    const profiles = await LiveTutorProfile.find(filter)
      .populate('user', 'name')
      .sort({ rating: -1, totalSessionsTaught: -1 })
      .lean()

    const tutorIds = profiles.map((profile) => profile.user?._id || profile.user).filter(Boolean)
    const availabilityRecords = await TutorAvailability.find({ tutor: { $in: tutorIds } })
      .select('tutor isAcceptingBookings')
      .lean()
    const availabilityByTutor = new Map(availabilityRecords.map((record) => [String(record.tutor), record.isAcceptingBookings]))

    const tutors = profiles.map((profile) => ({
      ...profile,
      // A tutor without a saved schedule is not bookable yet, so the card can
      // save learners from opening a profile that cannot accept a booking.
      isAcceptingBookings: availabilityByTutor.get(String(profile.user?._id || profile.user)) === true,
    }))

    return res.status(200).json({ tutors, count: tutors.length })
  } catch (error) {
    console.error('Browse approved tutors error:', error)
    return res.status(500).json({ message: 'Server error while browsing tutors' })
  }
}

const getTutorPublicProfile = async (req, res) => {
  try {
    const profile = await LiveTutorProfile.findById(req.params.profileId)
      .populate('user', 'name')
      .lean()

    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' })

    const availability = await TutorAvailability.findOne({ tutor: profile.user?._id || profile.user }).lean()
    return res.status(200).json({ profile, availability })
  } catch (error) {
    console.error('Get public tutor profile error:', error)
    return res.status(500).json({ message: 'Server error while fetching tutor profile' })
  }
}

const getAllLiveTutorApplications = async (req, res) => {
  try {
    const applications = await LiveTutorApplication.find()
      .populate('user', 'name email role profilePhoto isLiveTutor liveTutorStatus')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      applications,
      count: applications.length,
    })
  } catch (error) {
    console.error('Get live tutor applications error:', error)
    return res.status(500).json({
      message: 'Server error while fetching live tutor applications',
    })
  }
}

const reviewLiveTutorApplication = async (req, res) => {
  try {
    const { status, adminNote } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Application status must be approved or rejected',
      })
    }

    const application = await LiveTutorApplication.findById(req.params.id)
    if (!application) {
      return res.status(404).json({ message: 'Live tutor application not found' })
    }

    application.status = status
    application.adminNote = adminNote || ''
    application.reviewedBy = getAuthenticatedUserId(req)
    application.reviewedAt = new Date()
    await application.save()

    const user = await User.findById(application.user)
    if (!user) {
      return res.status(404).json({ message: 'Application user not found' })
    }

    if (status === 'approved') {
      user.isLiveTutor = true
      user.liveTutorStatus = 'approved'
      await user.save()

      // Approval turns the private application into one public-safe browsing
      // profile. upsert creates it on the first approval and prevents a second
      // profile if an administrator later reopens the same review.
      await LiveTutorProfile.findOneAndUpdate(
        { user: application.user },
        {
          user: application.user,
          application: application._id,
          bio: application.bio,
          teachingApproach: application.teachingApproach,
          subjects: application.subjects,
          mainCategory: application.mainCategory,
          teachingLevel: application.teachingLevel,
          teachingLanguages: application.teachingLanguages,
          introVideoUrl: application.introVideoUrl,
          profilePhoto: user.profilePhoto,
          sessionDurations: application.sessionDurations,
          hourlyRate: application.hourlyRate,
          currency: application.currency,
          trialSessionOffered: application.trialSessionOffered,
          trialSessionRate: application.trialSessionRate,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )

      // JWTs are issued at login and cannot update an already-issued browser
      // token. On the tutor's next login, generateToken includes isLiveTutor.
    } else {
      user.isLiveTutor = false
      user.liveTutorStatus = 'rejected'
      await user.save()
    }

    return res.status(200).json({
      message: `Live tutor application ${status} successfully`,
      application,
    })
  } catch (error) {
    console.error('Review live tutor application error:', error)
    return res.status(500).json({
      message: 'Server error while reviewing live tutor application',
    })
  }
}

module.exports = {
  submitLiveTutorApplication,
  getMyLiveTutorApplication,
  getApprovedTutors,
  getTutorPublicProfile,
  getAllLiveTutorApplications,
  reviewLiveTutorApplication,
}
