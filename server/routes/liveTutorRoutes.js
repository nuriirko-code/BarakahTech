const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  submitLiveTutorApplication,
  getMyLiveTutorApplication,
  getAllLiveTutorApplications,
  reviewLiveTutorApplication,
} = require('../controllers/liveTutorController')

// Students and approved course teachers can both apply because live tutoring is
// an additional capability, not a replacement for the account's existing role.
router.post('/apply', authMiddleware, authorize('student', 'teacher'), submitLiveTutorApplication)
router.get('/my-application', authMiddleware, getMyLiveTutorApplication)

// Review remains admin-only: approval also creates the public profile students
// will browse, so this action must stay separate from teacherApplication routes.
router.get('/admin/applications', authMiddleware, authorize('admin'), getAllLiveTutorApplications)
router.put(
  '/admin/applications/:id/review',
  authMiddleware,
  authorize('admin'),
  reviewLiveTutorApplication
)

module.exports = router
