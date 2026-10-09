const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')

const createCourse = async (req, res) => {
  try {
     const {
      title,
      description,
      category,
      subject,
      level,
      language,
      isFree,
      price,
      objectives,
      estimatedDuration,
    } = req.body

    if (!title || !description || !category || !subject || !level || !language) {
      return res.status(400).json({
        message: 'Please provide the title, description, category, subject, level, and language.',
      })
    }

    if (!Array.isArray(objectives) || objectives.length < 3) {
      return res.status(400).json({
        message: 'A course must have at least 3 learning objectives.',
      })
    }

    // New courses always begin as drafts; only the owning teacher can publish them later.
    const course = await Course.create({
      title,
      description,
      category,
      subject,
      level,
      language,
      isFree,
      price,
      objectives,
      estimatedDuration,
      teacher: req.user.userId,
      status: 'draft',
    })

    return res.status(201).json({
      message: 'Course draft created successfully',
      course,
    })
  } catch (error) {
    console.error('Create course error:', error)
    return res.status(500).json({
      message: 'Server error while creating course',
    })
  }
}

const addLesson = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Mongoose ObjectIds are objects, so compare their string forms to the
    // verified teacher ID rather than comparing object references directly.
    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({
        message: 'You can only add lessons to your own courses',
      })
    }

    const {
      title,
      description,
      contentType = 'both',
      videoUrl,
      videoSource,
      textContent,
      duration,
      isFree,
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Lesson title is required' })
    }
    if ((contentType === 'video' || contentType === 'both') && !videoUrl) {
      return res.status(400).json({ message: 'A video URL is required for this lesson type' })
    }
    if ((contentType === 'text' || contentType === 'both') && !textContent) {
      return res.status(400).json({ message: 'Text content is required for this lesson type' })
    }

    course.lessons.push({
      title: title.trim(),
      description,
      contentType,
      videoUrl,
      videoSource,
      textContent,
      duration,
      order: course.lessons.length + 1,
      isFree,
    })
    await course.save()

    return res.status(201).json({
      message: 'Lesson added successfully',
      lesson: course.lessons[course.lessons.length - 1],
    })
  } catch (error) {
    console.error('Add course lesson error:', error)
    return res.status(500).json({
      message: 'Server error while adding lesson',
    })
  }
}

const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only publish your own courses' })
    }

    if (course.lessons.length < 1) {
      return res.status(400).json({ message: 'Add at least one lesson before publishing this course' })
    }

    course.status = 'published'
    await course.save()

    return res.status(200).json({
      message: 'Course published successfully',
      course,
    })
  } catch (error) {
    console.error('Publish course error:', error)
    return res.status(500).json({
      message: 'Server error while publishing course',
    })
  }
}

const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.userId })
      .sort({ createdAt: -1 })//newest courses first

    return res.status(200).json({
      courses,
      count: courses.length,
    })
  } catch (error) {
    console.error('Get teacher courses error:', error)
    return res.status(500).json({
      message: 'Server error while fetching teacher courses',
    })
  }
}

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
      .populate('teacher', 'name email')

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Public details are only for published courses. Hide paid lessons here so
    // this public endpoint cannot bypass the enrollment check in the viewer API.
    if (course.status !== 'published') {
      return res.status(404).json({ message: 'Course not found' })
    }

    const publicCourse = course.toObject()
    publicCourse.lessons = publicCourse.lessons.filter((lesson) => lesson.isFree)

    return res.status(200).json({ course: publicCourse })
  } catch (error) {
    console.error('Get course error:', error)
    return res.status(500).json({
      message: 'Server error while fetching course',
    })
  }
}

// Teachers use this protected endpoint to resume their own drafts. It returns
// full lesson data only to the verified owner, unlike the public course details.
const getTeacherCourseById = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findOne({ _id: courseId, teacher: req.user.userId })
      .populate('teacher', 'name email')

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    return res.status(200).json({ course })
  } catch (error) {
    console.error('Get teacher course error:', error)
    return res.status(500).json({
      message: 'Server error while fetching teacher course',
    })
  }
}

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own courses' })
    }

    const updatableFields = ['title', 'description', 'category', 'subject', 'level', 'language', 'isFree', 'price', 'objectives', 'estimatedDuration']
    // Only provided fields are overwritten so a partial update keeps the rest of the course intact.
    updatableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        course[field] = req.body[field]
      }
    })

    await course.save()

    return res.status(200).json({
      message: 'Course updated successfully',
      course,
    })
  } catch (error) {
    console.error('Update course error:', error)
    return res.status(500).json({
      message: 'Server error while updating course',
    })
  }
}

const updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own lessons' })
    }

    // Mongoose subdocuments provide .id() so we can fetch a nested lesson by its _id without
    // manually searching the array and comparing raw ObjectIds.
    const lesson = course.lessons.id(lessonId)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    const updatableFields = ['title', 'description', 'contentType', 'videoUrl', 'videoSource', 'textContent', 'duration', 'isFree']
    updatableFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        lesson[field] = req.body[field]
      }
    })

    await course.save()

    return res.status(200).json({
      message: 'Lesson updated successfully',
      lesson,
    })
  } catch (error) {
    console.error('Update lesson error:', error)
    return res.status(500).json({
      message: 'Server error while updating lesson',
    })
  }
}

const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own lessons' })
    }

    if (course.status === 'published' && course.lessons.length === 1) {
      return res.status(400).json({
        message: 'Cannot delete the only lesson in a published course. Unpublish first.',
      })
    }

    // .pull removes all array items matching the selector, which is the standard Mongoose way
    // to delete nested lesson documents from an embedded array.
    course.lessons.pull({ _id: lessonId })
    course.lessons.forEach((lesson, index) => {
      lesson.order = index + 1
    })
    await course.save()

    return res.status(200).json({
      message: 'Lesson deleted successfully',
    })
  } catch (error) {
    console.error('Delete lesson error:', error)
    return res.status(500).json({
      message: 'Server error while deleting lesson',
    })
  }
}

const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own courses' })
    }

    const enrollmentCount = await Enrollment.countDocuments({ course: courseId })
    if (enrollmentCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete a course with enrolled students. Unpublish it instead to hide from new students.',
      })
    }

    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      message: 'Course deleted successfully',
    })
  } catch (error) {
    console.error('Delete course error:', error)
    return res.status(500).json({
      message: 'Server error while deleting course',
    })
  }
}

const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only unpublish your own courses' })
    }

    // Unpublish hides the course from new student enrollment while preserving existing access,
    // unlike a delete which permanently removes the course record.
    course.status = 'draft'
    await course.save()

    return res.status(200).json({
      message: 'Course unpublished. Existing students still have access but new enrollments are paused.',
      course,
    })
  } catch (error) {
    console.error('Unpublish course error:', error)
    return res.status(500).json({
      message: 'Server error while unpublishing course',
    })
  }
}

// This route returns lesson content only after both checks pass: the course is
// published and the signed-in student has an enrollment for that course.
const getCourseWithEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)
      .populate('teacher', 'name')

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'This course is not available' })
    }

    // The enrollment lookup is the content-protection boundary: knowing a
    // course URL alone must not grant access to its full lessons.
    const enrollment = await Enrollment.findOne({
      student: req.user.userId,
      course: courseId,
    })

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' })
    }

    return res.status(200).json({ course, enrollment })
  } catch (error) {
    console.error('Get enrolled course error:', error)
    return res.status(500).json({
      message: 'Server error while loading course lessons',
    })
  }
}

const markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params
    const enrollment = await Enrollment.findOne({
      student: req.user.userId,
      course: courseId,
    })

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' })
    }

    // ObjectIds are objects, so compare their string forms to prevent duplicate
    // completion records for the same embedded lesson.
    const alreadyCompleted = enrollment.completedLessons.some(
      (completedLessonId) => completedLessonId.toString() === lessonId
    )
    if (alreadyCompleted) {
      return res.status(200).json({
        message: 'Lesson already completed',
        enrollment,
      })
    }

    const course = await Course.findById(courseId).select('lessons._id')
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    const lessonExists = course.lessons.some((lesson) => lesson._id.toString() === lessonId)
    if (!lessonExists) {
      return res.status(404).json({ message: 'Lesson not found in this course' })
    }

    if (course.lessons.length === 0) {
      return res.status(400).json({ message: 'This course has no lessons to complete' })
    }

    enrollment.completedLessons.push(lessonId)
    // Progress is completed lesson count divided by total course lessons,
    // multiplied by 100 and rounded to the nearest whole percentage.
    enrollment.progressPercentage = Math.round(
      (enrollment.completedLessons.length / course.lessons.length) * 100
    )
    enrollment.lastAccessedLesson = lessonId

    // Reaching 100% marks the enrollment complete and records when it happened.
    if (enrollment.progressPercentage === 100) {
      enrollment.isCompleted = true
      enrollment.completedAt = new Date()
    }

    await enrollment.save()

    return res.status(200).json({
      message: 'Lesson marked as complete',
      enrollment,
    })
  } catch (error) {
    console.error('Mark lesson complete error:', error)
    return res.status(500).json({
      message: 'Server error while updating lesson progress',
    })
  }
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getAllPublishedCourses = async (req, res) => {
  try {
    const { category, level, language, search } = req.query
    const filter = { status: 'published' }

    if (category) filter.category = category
    if (level) filter.level = level
    if (language) filter.language = language
    // Escape regex metacharacters so a search term matches literal title text safely. $options: 'i' makes search case-insensitive.
    if (search) filter.title = { $regex: escapeRegExp(search), $options: 'i' }
  // Most enrolled courses appear first.
    const courses = await Course.find(filter)
      .populate('teacher', 'name')
      .sort({ totalEnrollments: -1 })

    return res.status(200).json({
      courses,
      count: courses.length,
    })
  } catch (error) {
    console.error('Get published courses error:', error)
    return res.status(500).json({
      message: 'Server error while fetching published courses',
    })
  }
}

const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const course = await Course.findById(courseId)

    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }
    if (course.status !== 'published') {
      return res.status(400).json({ message: 'This course is not available for enrollment' })
    }

    const studentId = req.user.userId
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId })
    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' })
    }

    // Paid enrollment stays blocked until a payment provider can confirm payment.
    if (!course.isFree) {
      return res.status(400).json({
        message: 'Payment required. Payment integration coming soon.',
      })
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: course._id,
      teacher: course.teacher,
      paymentStatus: 'free',
      amountPaid: 0,
      currency: course.currency,
    })

    // Update the cached popularity count rather than recounting enrollments on every listing.
    course.totalEnrollments += 1
    await course.save()

    return res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
    })
  } catch (error) {
    if (error.code === 11000) { // 11000 is MongoDB duplicate-key error.
      return res.status(400).json({ message: 'You are already enrolled in this course' })
    }
    console.error('Enroll in course error:', error)
    return res.status(500).json({
      message: 'Server error while enrolling in course',
    })
  }
}

const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.userId })
      .populate({
        path: 'course',
        select: 'title description thumbnail category level totalEnrollments rating lessons._id teacher',
        populate: { path: 'teacher', select: 'name' },
      })
  
    return res.status(200).json({ enrollments })
  } catch (error) {
    console.error('Get student enrollments error:', error)
    return res.status(500).json({
      message: 'Server error while fetching enrollments',
    })
  }
}

module.exports = {
  createCourse,
  addLesson,
  publishCourse,
  getTeacherCourses,
  getCourseById,
  getAllPublishedCourses,
  enrollInCourse,
  getMyEnrollments,
  getTeacherCourseById,
  updateCourse,
  updateLesson,
  deleteLesson,
  deleteCourse,
  unpublishCourse,
  getCourseWithEnrollment,
  markLessonComplete,
}
