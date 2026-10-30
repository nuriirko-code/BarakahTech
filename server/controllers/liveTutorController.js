const LiveTutorApplication = require('../models/LiveTutorApplication')
const LiveTutorProfile = require('../models/LiveTutorProfile')
const SessionFeedback = require('../models/SessionFeedback')
const TutorAvailability = require('../models/TutorAvailability')
const SessionBooking = require('../models/SessionBooking')
const User = require('../models/User')
const supportedCategories = ['technology', 'languages', 'sciences', 'business', 'leadership']
const supportedLevels = ['beginner', 'intermediate', 'advanced', 'all']
const supportedCurrencies = ['USD', 'EUR', 'GBP', 'ETB', 'CAD', 'AUD', 'SAR', 'AED']

// The project's existing JWT payload uses userId. Keeping that convention here
// makes these controllers compatible with authMiddleware and all other routes.
const getAuthenticatedUserId = (req) => req.user.userId
const toMinutes = (time) => {
  const [hours, minutes] = String(time || '').split(':').map(Number)
  return Number.isInteger(hours) && Number.isInteger(minutes) ? (hours * 60) + minutes : null
}

const getTutorAvailabilityStatus = async (profile, availability) => {
  const unavailable = { state: 'unknown', presenceAvailable: false, tutorPresent: false }
  if (!availability || !availability.isAcceptingBookings) {
    return { state: 'offline', presenceAvailable: false, tutorPresent: false }
  }
  if (availability.isTestSchedule && process.env.NODE_ENV === 'production') {
    return { state: 'offline', presenceAvailable: false, tutorPresent: false }
  }

  const now = new Date()
  let localParts
  try {
    localParts = new Intl.DateTimeFormat('en-US', {
      timeZone: availability.timezone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
  } catch (error) {
    console.error('Tutor availability timezone error:', error)
    return unavailable
  }
  const localValues = Object.fromEntries(localParts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  const localTime = (Number(localValues.hour) * 60) + Number(localValues.minute)
  const scheduledNow = availability.weeklySlots.some((slot) => (
    slot.day === localValues.weekday &&
    slot.isActive !== false &&
    localTime >= toMinutes(slot.startTime) &&
    localTime < toMinutes(slot.endTime)
  ))

  const nextBooking = await SessionBooking.findOne({
    tutor: profile.user?._id || profile.user,
    status: 'confirmed',
    startAt: { $gt: now },
  }).sort({ startAt: 1 }).select('startAt')
  const nextSessionAt = nextBooking?.startAt || null

  return {
    state: scheduledNow ? 'available_now' : 'offline',
    presenceAvailable: false,
    tutorPresent: false,
    nextSessionAt,
  }
}

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
      sessionDuration,
      sessionPrice,
      currency,
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
      sessionDuration === undefined ||
      sessionDuration === null ||
      sessionPrice === undefined ||
      sessionPrice === null ||
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

    const paidDuration = Number(sessionDuration)
    const paidPrice = Number(sessionPrice)
    if (!Number.isInteger(paidDuration) || paidDuration < 1 || !Number.isFinite(paidPrice) || paidPrice < 0) {
      return res.status(400).json({ message: 'Choose a valid paid session duration and price.' })
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
      sessionDuration: paidDuration,
      sessionPrice: paidPrice,
      currency,
      trialSessionOffered: true,
      trialSessionRate: 0,
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

const getMyLiveTutorProfile = async (req, res) => {
  try {
    const profile = await LiveTutorProfile.findOne({ user: getAuthenticatedUserId(req) })
      .populate('user', 'name profilePhoto')
      .lean()

    if (!profile) {
      return res.status(404).json({ message: 'Your approved live tutor profile was not found.' })
    }

    return res.status(200).json({ profile })
  } catch (error) {
    console.error('Get my live tutor profile error:', error)
    return res.status(500).json({ message: 'Server error while loading your live tutor profile.' })
  }
}

const updateMyLiveTutorProfile = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req)
    const {
      bio,
      teachingApproach,
      subjects,
      mainCategory,
      teachingLevel,
      teachingLanguages,
      introVideoUrl,
      profilePhoto,
      sessionDuration,
      sessionPrice,
      currency,
    } = req.body

    const normalizedSubjects = Array.isArray(subjects)
      ? [...new Set(subjects.map((subject) => String(subject).trim()).filter(Boolean))]
      : []
    const normalizedLanguages = Array.isArray(teachingLanguages)
      ? [...new Set(teachingLanguages.map((language) => String(language).trim()).filter(Boolean))]
      : []
    const normalizedDuration = Number(sessionDuration)
    const normalizedPrice = Number(sessionPrice)
    const normalizedCurrency = String(currency || '').toUpperCase()
    const normalizedVideoUrl = String(introVideoUrl || '').trim()
    const normalizedPhoto = String(profilePhoto || '').trim()

    if (typeof bio !== 'string' || bio.trim().length < 100) {
      return res.status(400).json({ message: 'Your public bio must be at least 100 characters.' })
    }
    if (typeof teachingApproach !== 'string' || teachingApproach.trim().length < 50) {
      return res.status(400).json({ message: 'Your teaching approach must be at least 50 characters.' })
    }
    if (!normalizedSubjects.length || normalizedSubjects.length > 20) {
      return res.status(400).json({ message: 'Add between 1 and 20 subjects you teach.' })
    }
    if (!supportedCategories.includes(mainCategory)) {
      return res.status(400).json({ message: 'Choose a valid teaching category.' })
    }
    if (!supportedLevels.includes(teachingLevel)) {
      return res.status(400).json({ message: 'Choose a valid teaching level.' })
    }
    if (!normalizedLanguages.length || normalizedLanguages.length > 10 || normalizedLanguages.some((language) => language.length > 40)) {
      return res.status(400).json({ message: 'Add between 1 and 10 valid teaching languages.' })
    }
    if (!Number.isInteger(normalizedDuration) || normalizedDuration < 1 || normalizedDuration > 240) {
      return res.status(400).json({ message: 'Session duration must be from 1 to 240 minutes.' })
    }
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      return res.status(400).json({ message: 'Enter a paid session price greater than zero. Free introductions are managed separately.' })
    }
    if (!supportedCurrencies.includes(normalizedCurrency)) {
      return res.status(400).json({ message: 'Choose a supported session currency.' })
    }
    if (normalizedPhoto.length > 2_500_000) {
      return res.status(400).json({ message: 'Profile photo must be smaller than 2 MB after compression.' })
    }
    if (normalizedPhoto && !normalizedPhoto.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Choose a valid profile image.' })
    }
    if (normalizedVideoUrl) {
      try {
        const parsedUrl = new URL(normalizedVideoUrl)
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Invalid protocol')
      } catch {
        return res.status(400).json({ message: 'Enter a valid http or https introduction video URL.' })
      }
    }

    const profile = await LiveTutorProfile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          bio: bio.trim(),
          teachingApproach: teachingApproach.trim(),
          subjects: normalizedSubjects,
          mainCategory,
          teachingLevel,
          teachingLanguages: normalizedLanguages,
          introVideoUrl: normalizedVideoUrl,
          ...(normalizedPhoto ? { profilePhoto: normalizedPhoto } : {}),
          sessionDuration: normalizedDuration,
          sessionPrice: normalizedPrice,
          currency: normalizedCurrency,
        },
      },
      { new: true, runValidators: true }
    ).populate('user', 'name profilePhoto')

    if (!profile) {
      return res.status(404).json({ message: 'Your approved live tutor profile was not found.' })
    }

    if (normalizedPhoto) {
      await User.findByIdAndUpdate(userId, { profilePhoto: normalizedPhoto })
      if (profile.user) profile.user.profilePhoto = normalizedPhoto
    }

    return res.status(200).json({ message: 'Your public tutor profile was updated.', profile })
  } catch (error) {
    console.error('Update my live tutor profile error:', error)
    return res.status(500).json({ message: 'Server error while saving your live tutor profile.' })
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
      const sessionPrice = {}
      const parsedMinRate = Number(minRate)
      const parsedMaxRate = Number(maxRate)
      if (minRate !== undefined && Number.isFinite(parsedMinRate) && parsedMinRate >= 0) sessionPrice.$gte = parsedMinRate
      if (maxRate !== undefined && Number.isFinite(parsedMaxRate) && parsedMaxRate >= 0) sessionPrice.$lte = parsedMaxRate
      if (Object.keys(sessionPrice).length) filter.sessionPrice = sessionPrice
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

    let availability = await TutorAvailability.findOne({ tutor: profile.user?._id || profile.user }).lean()
    if (availability?.isTestSchedule && process.env.NODE_ENV === 'production') {
      availability = null
    }
    const liveStatus = await getTutorAvailabilityStatus(profile, availability)
    return res.status(200).json({ profile, availability, liveStatus })
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
          sessionDuration: application.sessionDuration || application.sessionDurations?.[0] || 60,
          sessionPrice: application.sessionPrice ?? application.hourlyRate ?? 0,
          currency: application.currency,
          trialSessionOffered: true,
          trialSessionRate: 0,
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
  getMyLiveTutorProfile,
  updateMyLiveTutorProfile,
  getApprovedTutors,
  getTutorPublicProfile,
  getAllLiveTutorApplications,
  reviewLiveTutorApplication,
}
