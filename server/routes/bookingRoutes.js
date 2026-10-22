const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const { submitSessionFeedback, markSessionComplete } = require('../controllers/sessionFeedbackController')
const {
  getBookingOffer,
  createBooking,
  confirmBookingPayment,
  adminConfirmBookingPayment,
  getMyBookingsAsStudent,
  getMyBookingsAsTutor,
  getSessionBooking,
  getSessionToken,
  cancelBooking,
} = require('../controllers/bookingController')

// A student sees the correct free-trial or paid offer before choosing a time.
router.get('/tutor/:tutorProfileId/offer', authMiddleware, authorize('student'), getBookingOffer)
// The server checks time overlap before creating a record, which prevents two
// students from successfully booking the same tutor slot at the same time.
router.post('/tutor/:tutorProfileId', authMiddleware, authorize('student'), createBooking)
// Like course payments, manual transfers must be checked by an administrator
// before a booking becomes confirmed rather than trusting the student’s receipt.
router.post('/:bookingId/confirm-payment', authMiddleware, authorize('student'), confirmBookingPayment)
router.put('/:bookingId/admin-confirm', authMiddleware, authorize('admin'), adminConfirmBookingPayment)
router.get('/my-sessions/student', authMiddleware, authorize('student'), getMyBookingsAsStudent)
router.get('/my-sessions/tutor', authMiddleware, authorize('live_tutor'), getMyBookingsAsTutor)
// Tutor marks completion -> student submits feedback -> helpful feedback
// approves the tutor's earnings ledger entry; unhelpful feedback records a refund outcome.
router.put('/:bookingId/complete', authMiddleware, authorize('live_tutor'), markSessionComplete)
router.post('/:bookingId/feedback', authMiddleware, authorize('student'), submitSessionFeedback)
// Both parties may read their own session and request a token. The backend,
// not the browser, decides whether the caller is the tutor room owner.
router.get('/:bookingId/session-token', authMiddleware, getSessionToken)
router.get('/:bookingId', authMiddleware, getSessionBooking)
// Cancellation verifies hours remaining against the tutor’s policy, preventing
// last-minute removals that would leave the other participant unprepared.
router.delete('/:bookingId/cancel', authMiddleware, cancelBooking)

module.exports = router
