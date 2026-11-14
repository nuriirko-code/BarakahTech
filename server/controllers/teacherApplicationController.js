const TeacherApplication = require('../models/TeacherApplication')
const User = require('../models/User')
const { sendTeacherApprovalEmail } = require('../utils/emailService')
const policyVersions = require('../config/policyVersions')
const { isAdult } = require('../utils/legalAge')

const isValidProfilePhoto = (value) => (
  typeof value === 'string' && value.trim().startsWith('data:image/')
)

const getApplicationFields = (body) => {
  const fieldNames = [
    'phone',
    'city',
    'region',
    'dateOfBirth',
    'nationalId',
    'mainCategory',
    'specificSubject',
    'teachingLanguage',
    'teachingMethod',
    'hourlyRate',
    'availableHoursPerWeek',
    'availableDays',
    'educationLevel',
    'institutionName',
    'yearsOfExperience',
    'qualificationCertificateUrl',
    'governmentIdUrl',
    'bio',
    'assessmentAnswers',
    'yearsInSpecificSubject',
    'portfolioLink',
    'demoVideoLink',
    'agreedToStandards',
    'agreedToBackgroundCheck',
    'confirmedAvailability',
    'teacherAgreementVersion',
  ]

  return Object.fromEntries(
    fieldNames
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  )
}

const validateApplicationRequest = (body, existingProfilePhoto = '') => {
  if (!isAdult(body.dateOfBirth)) {
    return { status: 403, message: 'Teacher applicants must be at least 18 years old.' }
  }
  if (
    body.acceptedTermsVersion !== policyVersions.terms ||
    body.acknowledgedPrivacyVersion !== policyVersions.privacy ||
    body.acceptedCommunityCodeVersion !== policyVersions.community ||
    body.teacherAgreementVersion !== policyVersions.teacher
  ) {
    return { status: 400, message: 'Please accept the current account and teacher policies before submitting.' }
  }
  if (body.agreedToStandards !== true || body.agreedToBackgroundCheck !== true || body.confirmedAvailability !== true) {
    return { status: 400, message: 'Confirm the teacher standards, background check, and availability declarations before submitting.' }
  }
  if (body.profilePhoto !== undefined && typeof body.profilePhoto !== 'string') {
    return { status: 400, message: 'Profile photo must be a valid image.' }
  }
  const profilePhoto = typeof body.profilePhoto === 'string' ? body.profilePhoto.trim() : ''
  if (profilePhoto && !isValidProfilePhoto(profilePhoto)) {
    return { status: 400, message: 'Profile photo must be a valid image.' }
  }
  if (profilePhoto.length > 2_500_000) {
    return { status: 400, message: 'Profile photo must be smaller than 2 MB after compression.' }
  }
  if (!profilePhoto && !isValidProfilePhoto(existingProfilePhoto)) {
    return { status: 400, message: 'A profile photo is required to submit a teacher application.' }
  }

  return null
}

// A verified JWT from authMiddleware puts the user's ID in req.user.userId.
// Checking for an existing application prevents duplicate submissions for the
// same account and keeps the review queue to one application per user.
const submitApplication = async (req, res) => {
  try {
    const userId = req.user.userId
    const existingApplication = await TeacherApplication.findOne({ user: userId })

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already submitted a teacher application'
      })
    }
    
    const body = req.body || {}
    const { profilePhoto, dateOfBirth } = body
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const validationError = validateApplicationRequest(body, user.profilePhoto)
    if (validationError) {
      return res.status(validationError.status).json({ message: validationError.message })
    }

    const application = await TeacherApplication.create({
      user: userId,
      ...getApplicationFields(body),
      teacherAgreementAcceptedAt: new Date(),
    })

    user.dateOfBirth = new Date(dateOfBirth)
    user.policyAcceptances.push(
      { policy: 'terms', version: policyVersions.terms, acceptedAt: new Date() },
      { policy: 'privacy', version: policyVersions.privacy, acceptedAt: new Date() },
      { policy: 'community', version: policyVersions.community, acceptedAt: new Date() },
    )
    if (typeof profilePhoto === 'string' && profilePhoto.trim()) {
      user.profilePhoto = profilePhoto.trim()
    }

    await user.save()
    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
    })
  } catch (error) {
    console.error('Teacher application submission error:', error)
    return res.status(500).json({
      message: 'Server error while submitting teacher application'
    })
  }
}

const updateRejectedApplication = async (req, res) => {
  try {
    const userId = req.user.userId
    const body = req.body || {}
    const application = await TeacherApplication.findOne({ user: userId })

    if (!application) {
      return res.status(404).json({ message: 'No teacher application found' })
    }
    if (application.status !== 'rejected') {
      return res.status(409).json({ message: 'Only a rejected application can be updated and resubmitted.' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const validationError = validateApplicationRequest(body, user.profilePhoto)
    if (validationError) {
      return res.status(validationError.status).json({ message: validationError.message })
    }

    Object.assign(application, getApplicationFields(body), {
      status: 'pending',
      adminNote: '',
      reviewedBy: null,
      reviewedAt: null,
      teacherAgreementAcceptedAt: new Date(),
    })
    user.dateOfBirth = new Date(body.dateOfBirth)
    user.policyAcceptances.push(
      { policy: 'terms', version: policyVersions.terms, acceptedAt: new Date() },
      { policy: 'privacy', version: policyVersions.privacy, acceptedAt: new Date() },
      { policy: 'community', version: policyVersions.community, acceptedAt: new Date() },
    )
    if (typeof body.profilePhoto === 'string' && body.profilePhoto.trim()) {
      user.profilePhoto = body.profilePhoto.trim()
    }

    await application.save()
    await user.save()

    return res.status(200).json({
      message: 'Application updated and resubmitted for review.',
      application,
    })
  } catch (error) {
    console.error('Resubmit teacher application error:', error)
    return res.status(500).json({
      message: 'Server error while resubmitting teacher application'
    })
  }
}

const getMyApplication = async (req, res) => {
  try {
    const application = await TeacherApplication.findOne({ user: req.user.userId })

    if (!application) {
      return res.status(404).json({
        message: 'No application found'
      })
    }

    return res.status(200).json({ application })
  } catch (error) {
    console.error('Get teacher application error:', error)
    return res.status(500).json({
      message: 'Server error while fetching teacher application'
    })
  }
}

// populate replaces the stored User ObjectId with selected account fields,
// letting admins see who applied without a separate user query per application.
const getAllApplications = async (req, res) => {
  try {
    // Admins can see all applications, sorted by submission time (newest first).
    //do yo know what the populate method does in mongoose? it replaces the stored User ObjectId with selected account fields, letting admins see who applied without a separate user query per application.
    const applications = await TeacherApplication.find()
      .populate('user', 'name email role profilePhoto')
      .sort({ createdAt: -1 })

    return res.status(200).json({ applications })
  } catch (error) {
    console.error('Get teacher applications error:', error)
    return res.status(500).json({
      message: 'Server error while fetching teacher applications'
    })
  }
}

const reviewApplication = async (req, res) => {
  try {
    // Express fills req.params.id from the :id segment in the route URL.
    const { id: applicationId } = req.params
    const { status, adminNote } = req.body
    const reviewNote = typeof adminNote === 'string' ? adminNote.trim() : ''

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be approved or rejected'
      })
    }
    if (status === 'rejected' && !reviewNote) {
      return res.status(400).json({
        message: 'Add a review note before rejecting the application.'
      })
    }

    const application = await TeacherApplication.findById(applicationId)

    if (!application) {
      return res.status(404).json({
        message: 'Teacher application not found'
      })
    }

    // Approval changes the user's account as well as the application: the
    // applicant moves from pending_teacher to teacher and becomes approved.
    const applicant = await User.findById(application.user)

    if (status === 'approved' && !applicant) {
      return res.status(404).json({
        message: 'Applicant user not found'
      })
    }
    if (status === 'approved' && !isValidProfilePhoto(applicant.profilePhoto)) {
      return res.status(400).json({
        message: 'The applicant must add a profile photo before approval.'
      })
    }

    application.status = status
    application.adminNote = reviewNote
    application.reviewedBy = req.user.userId
    application.reviewedAt = new Date()
    await application.save()

    if (applicant) {
      if (status === 'approved') {
        applicant.role = 'teacher'
        applicant.isApproved = true
        await applicant.save()
      }
      void sendTeacherApprovalEmail(applicant, status === 'approved', reviewNote)
    }

    // Lifecycle: submission creates a pending application; an admin review
    // changes it to approved or rejected and records reviewer and review time.
    return res.status(200).json({
      message: `Application ${status} successfully`,
      application,
    })
  } catch (error) {
    console.error('Review teacher application error:', error)
    return res.status(500).json({
      message: 'Server error while reviewing teacher application'
    })
  }
}

// Teachers may update public profile details after approval, but qualification
// and subject fields stay tied to the reviewed application and admin decision.
const updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.userId
    const {
      bio,
      hourlyRate,
      availableHoursPerWeek,
      availableDays,
      portfolioLink,
      profilePhoto,
    } = req.body

    // findOne is appropriate because the teacher is identified by the user
    // reference, while findById would require the application document id.
    const application = await TeacherApplication.findOne({ user: teacherId })

    if (!application) {
      return res.status(404).json({
        message: 'No teacher application found'
      })
    }

    const user = await User.findById(teacherId)
    if (!user) {
      return res.status(404).json({ message: 'Teacher account not found' })
    }

    const editableFields = {
      bio,
      hourlyRate,
      availableHoursPerWeek,
      availableDays,
      portfolioLink,
    }

    Object.entries(editableFields).forEach(([field, value]) => {
      if (value !== undefined) application[field] = value
    })

    const normalizedPhoto = typeof profilePhoto === 'string' ? profilePhoto.trim() : ''
    if (profilePhoto !== undefined && typeof profilePhoto !== 'string') {
      return res.status(400).json({ message: 'Profile photo must be a valid image.' })
    }
    if (normalizedPhoto && !isValidProfilePhoto(normalizedPhoto)) {
      return res.status(400).json({ message: 'Profile photo must be a valid image.' })
    }
    if (normalizedPhoto.length > 2_500_000) {
      return res.status(400).json({ message: 'Profile photo must be smaller than 2 MB after compression.' })
    }
    if (!normalizedPhoto && !isValidProfilePhoto(user.profilePhoto)) {
      return res.status(400).json({ message: 'A profile photo is required to save your teacher profile.' })
    }
    if (normalizedPhoto) user.profilePhoto = normalizedPhoto

    await application.save()
    await user.save()

    return res.status(200).json({
      message: 'Teacher profile updated successfully',
      application,
    })
  } catch (error) {
    console.error('Update teacher profile error:', error)
    return res.status(500).json({
      message: 'Server error while updating teacher profile'
    })
  }
}

module.exports = {
  submitApplication,
  updateRejectedApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  updateTeacherProfile,
}
