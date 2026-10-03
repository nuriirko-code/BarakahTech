const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  createCourse,
  addLesson,
  publishCourse,
  getTeacherCourses,
  getCourseById,
  getAllPublishedCourses,
  enrollInCourse,
  getMyEnrollments,
} = require('../controllers/courseController')

// Register static paths before /:courseId so words such as "teacher" and
// "student" are not interpreted as dynamic course IDs by Express.
router.get('/teacher/my-courses', authMiddleware, authorize('teacher'), getTeacherCourses)
router.get('/student/my-enrollments', authMiddleware, authorize('student'), getMyEnrollments)

// Public reads let anyone browse the catalog and inspect course details.
router.get('/', getAllPublishedCourses)
router.get('/:courseId', getCourseById)

// Mutations require authentication and the role that owns the operation.
router.post('/', authMiddleware, authorize('teacher'), createCourse)
router.post('/:courseId/lessons', authMiddleware, authorize('teacher'), addLesson)
router.put('/:courseId/publish', authMiddleware, authorize('teacher'), publishCourse)
router.post('/:courseId/enroll', authMiddleware, authorize('student'), enrollInCourse)

// The shared /api/courses prefix is mounted from server.js.
module.exports = router
