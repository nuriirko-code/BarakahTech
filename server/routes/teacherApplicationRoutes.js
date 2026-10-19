const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
  updateTeacherProfile,
} = require('../controllers/teacherApplicationController')

// Course teaching is an independent capability, so an existing learner or live
// tutor can apply without creating a second account. Duplicate applications
// are still rejected by the controller.
router.post('/', authMiddleware, authorize('student', 'pending_teacher', 'teacher'), submitApplication)

router.get(
  '/my-application',
  authMiddleware,
  authorize('pending_teacher', 'teacher'),
  getMyApplication
)

// Admin endpoints require both a valid identity and explicit admin permission.
router.get('/all', authMiddleware, authorize('admin'), getAllApplications)

// Express places the URL's :id segment into req.params.id for this review.
router.put('/:id/review', authMiddleware, authorize('admin'), reviewApplication)

// Only approved teacher accounts may update the limited public profile fields.
router.put('/update-profile', authMiddleware, authorize('teacher'), updateTeacherProfile)

// Mounted in server.js at /api/teacher-applications, forming each full API path.
module.exports = router
