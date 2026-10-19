const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  getMyAvailability,
  saveAvailability,
  getTutorAvailability,
} = require('../controllers/availabilityController')

router.get('/my', authMiddleware, authorize('live_tutor'), getMyAvailability)
// Saving uses an upsert: the first save inserts one document and every later
// save updates that same tutor's schedule rather than making another record.
router.post('/save', authMiddleware, authorize('live_tutor'), saveAvailability)
// This stays public so prospective students can see schedule compatibility
// before they create an account or begin a booking.
router.get('/tutor/:tutorId', getTutorAvailability)

module.exports = router
