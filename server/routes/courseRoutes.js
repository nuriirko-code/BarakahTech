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
  getTeacherCourseById,
  getCourseWithEnrollment,
  markLessonComplete,
  submitLessonAssessment,
  updateCourse,
  updateLesson,
  deleteLesson,
  deleteCourse,
  unpublishCourse,
} = require('../controllers/courseController')

// Register static paths before /:courseId so words such as "teacher" and
// "student" are not interpreted as dynamic course IDs by Express.
router.get('/teacher/my-courses', authMiddleware, authorize('teacher'), getTeacherCourses)
router.get('/teacher/my-courses/:courseId', authMiddleware, authorize('teacher'), getTeacherCourseById)
router.get('/student/my-enrollments', authMiddleware, authorize('student'), getMyEnrollments)

// More specific teacher routes are registered before the generic course ID routes so
// the server matches the intended CRUD operation instead of treating the path as a public detail request.
router.put('/:courseId', authMiddleware, authorize('teacher'), updateCourse)
router.put('/:courseId/lessons/:lessonId', authMiddleware, authorize('teacher'), updateLesson)
router.delete('/:courseId/lessons/:lessonId', authMiddleware, authorize('teacher'), deleteLesson)
router.delete('/:courseId', authMiddleware, authorize('teacher'), deleteCourse)
router.put('/:courseId/unpublish', authMiddleware, authorize('teacher'), unpublishCourse)

// Public reads let anyone browse the catalog and inspect course details.
router.get('/', getAllPublishedCourses)
router.get('/:courseId', getCourseById)

// Mutations require authentication and the role that owns the operation.
router.post('/', authMiddleware, authorize('teacher'), createCourse)
router.post('/:courseId/lessons', authMiddleware, authorize('teacher'), addLesson)
router.put('/:courseId/publish', authMiddleware, authorize('teacher'), publishCourse)
router.post('/:courseId/enroll', authMiddleware, authorize('student'), enrollInCourse)

// Learning endpoints are student-only, and the controller additionally verifies
// enrollment before revealing course lessons or changing progress.
router.get('/:courseId/learn', authMiddleware, authorize('student'), getCourseWithEnrollment)
router.post('/:courseId/lessons/:lessonId/complete', authMiddleware, authorize('student'), markLessonComplete)
router.post('/:courseId/lessons/:lessonId/assessment', authMiddleware, authorize('student'), submitLessonAssessment)

// The shared /api/courses prefix is mounted from server.js.
module.exports = router
