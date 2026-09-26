const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} = require('../controllers/teacherApplicationController')

// Only pending teacher applicants may submit; other roles have not entered or
// are not eligible for the teacher-application review process.
router.post('/', authMiddleware, authorize('pending_teacher'), submitApplication)

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

// Mounted in server.js at /api/teacher-applications, forming each full API path.
module.exports = router
