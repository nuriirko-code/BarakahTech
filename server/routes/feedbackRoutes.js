const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  submitDailyFeedback,
  getMyFeedback,
  getTeacherFeedbackSummary,
} = require('../controllers/feedbackController')

// Daily feedback is student-authored, and it changes the money flow for the teacher based on the
// outcome of the learning day. That makes the route a protected student action.
router.post('/', authMiddleware, authorize('student'), submitDailyFeedback)
router.get('/my-feedback', authMiddleware, authorize('student'), getMyFeedback)
router.get('/teacher-summary', authMiddleware, authorize('teacher'), getTeacherFeedbackSummary)

module.exports = router
