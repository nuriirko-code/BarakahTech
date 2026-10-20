const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  createBooking,
  confirmBookingPayment,
  adminConfirmBookingPayment,
  getMyBookingsAsStudent,
  getMyBookingsAsTutor,
  cancelBooking,
} = require('../controllers/bookingController')

// The server checks time overlap before creating a record, which prevents two
// students from successfully booking the same tutor slot at the same time.
router.post('/tutor/:tutorProfileId', authMiddleware, authorize('student'), createBooking)
// Like course payments, manual transfers must be checked by an administrator
// before a booking becomes confirmed rather than trusting the student’s receipt.
router.post('/:bookingId/confirm-payment', authMiddleware, authorize('student'), confirmBookingPayment)
router.put('/:bookingId/admin-confirm', authMiddleware, authorize('admin'), adminConfirmBookingPayment)
router.get('/my-sessions/student', authMiddleware, authorize('student'), getMyBookingsAsStudent)
router.get('/my-sessions/tutor', authMiddleware, authorize('live_tutor'), getMyBookingsAsTutor)
// Cancellation verifies hours remaining against the tutor’s policy, preventing
// last-minute removals that would leave the other participant unprepared.
router.delete('/:bookingId/cancel', authMiddleware, cancelBooking)

module.exports = router
