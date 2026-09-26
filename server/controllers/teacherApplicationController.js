const TeacherApplication = require('../models/TeacherApplication')
const User = require('../models/User')

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
    
    const {
      phone,
      city,
      region,
      dateOfBirth,
      nationalId,
      mainCategory,
      specificSubject,
      teachingLanguage,
      teachingMethod,
      hourlyRate,
      availableHoursPerWeek,
      availableDays,
      educationLevel,
      institutionName,
      yearsOfExperience,
      qualificationCertificateUrl,
      governmentIdUrl,
      bio,
      assessmentAnswers,
      yearsInSpecificSubject,
      portfolioLink,
      demoVideoLink,
      agreedToStandards,
      agreedToBackgroundCheck,
      confirmedAvailability,
    } = req.body

    // Only applicant-editable fields are copied from the request. Status and
    // review metadata remain controlled by the review process, not the applicant.
    const application = await TeacherApplication.create({
      user: userId,
      phone,
      city,
      region,
      dateOfBirth,
      nationalId,
      mainCategory,
      specificSubject,
      teachingLanguage,
      teachingMethod,
      hourlyRate,
      availableHoursPerWeek,
      availableDays,
      educationLevel,
      institutionName,
      yearsOfExperience,
      qualificationCertificateUrl,
      governmentIdUrl,
      bio,
      assessmentAnswers,
      yearsInSpecificSubject,
      portfolioLink,
      demoVideoLink,
      agreedToStandards,
      agreedToBackgroundCheck,
      confirmedAvailability,
    })

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
      .populate('user', 'name email role')
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

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be approved or rejected'
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
    const applicant = status === 'approved'
      ? await User.findById(application.user)
      : null

    if (status === 'approved' && !applicant) {
      return res.status(404).json({
        message: 'Applicant user not found'
      })
    }

    application.status = status
    application.adminNote = adminNote || ''
    application.reviewedBy = req.user.userId
    application.reviewedAt = new Date()
    await application.save()

    if (applicant) {
      applicant.role = 'teacher'
      applicant.isApproved = true
      await applicant.save()
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

module.exports = {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
}
