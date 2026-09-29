const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const { getTeacherStats } = require('../controllers/teacherController')

// Authentication verifies the identity; role authorization limits this
// teacher-specific endpoint to teacher accounts only.
router.get('/stats', authMiddleware, authorize('teacher'), getTeacherStats)

module.exports = router
