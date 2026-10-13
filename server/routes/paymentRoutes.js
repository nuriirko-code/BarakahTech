const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  initiateCoursePayment,
  confirmStudentPayment,
  adminVerifyPayment,
  getPendingPayments,
  getMyPayments,
  getTeacherEarnings,
} = require('../controllers/paymentController')

// Initiation creates a platform code; confirmation submits the student's transfer proof later.
// Keeping these separate ensures an order exists before money is sent, without trusting a claim as payment.
router.post('/courses/:courseId/initiate', authMiddleware, authorize('student'), initiateCoursePayment)
router.post('/:paymentId/confirm', authMiddleware, authorize('student'), confirmStudentPayment)
router.get('/my-payments', authMiddleware, authorize('student'), getMyPayments)

// Teacher earnings are a sensitive finance view, so only teacher accounts can read them.
router.get('/earnings', authMiddleware, authorize('teacher'), getTeacherEarnings)

// Only admins can inspect submitted proofs or make the final decision that activates enrollment.
router.get('/pending', authMiddleware, authorize('admin'), getPendingPayments)
router.put('/:paymentId/verify', authMiddleware, authorize('admin'), adminVerifyPayment)

module.exports = router
