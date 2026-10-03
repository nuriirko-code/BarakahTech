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

    return res.status(200).json({ course })
  } catch (error) {
    console.error('Get course error:', error)
    return res.status(500).json({
      message: 'Server error while fetching course',
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
}
