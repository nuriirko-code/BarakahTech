const User = require('../models/User')

// These models are not part of the project yet. Keep the API bootable and
// return zero counts until their schemas are added.
let Course = null
let Booking = null

try {
  Course = require('../models/Course')
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND' || !error.message.includes('../models/Course')) throw error
  // TODO: create Course model before course statistics can be counted.
}

try {
  Booking = require('../models/Booking')
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND' || !error.message.includes('../models/Booking')) throw error
  // TODO: create Booking model before session statistics can be counted.
}

const getTeacherStats = async (req, res) => {
  try {
    // Existing JWTs store the account id as userId; authMiddleware verifies it
    // and attaches the decoded claim to req.user.
    const teacherId = req.user.userId
    const today = new Date()

    // Promise.all runs independent database counts concurrently rather than
    // waiting for each count sequentially. Missing models contribute zero.
    const [totalCourses, , upcomingSessions] = await Promise.all([
      Course
        ? Course.countDocuments({ teacher: teacherId })
        : Promise.resolve(0),
      Booking
        ? Booking.countDocuments({ teacher: teacherId, status: 'confirmed' })
        : Promise.resolve(0),
      Booking
        ? Booking.countDocuments({
          teacher: teacherId,
          status: 'confirmed',
          date: { $gt: today },
        })
        : Promise.resolve(0),
    ])

    // Student totals and earnings will be calculated after enrollment and
    // payment models exist; zero keeps the response shape stable for now.
    const totalStudents = 0
    const totalEarnings = 0

    return res.status(200).json({
      stats: {
        totalCourses,
        totalStudents,
        upcomingSessions,
        totalEarnings,
      },
    })
  } catch (error) {
    console.error('Get teacher stats error:', error)
    return res.status(500).json({
      message: 'Server error while fetching teacher statistics',
    })
  }
}

module.exports = { getTeacherStats }
