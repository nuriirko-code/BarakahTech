const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Store the teacher at enrollment time as a stable record of who delivered it,
    // even if course ownership or course metadata changes later.
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'ETB',
    },
    paymentStatus: {
      type: String,
      enum: ['free', 'pending', 'paid'],
      default: 'free',
    },
    paymentReference: {
      type: String,
      default: '',
    },

    // These ObjectIds correspond to the embedded lesson _id values on the course.
    // The array grows as the student completes more lessons.
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // progressPercentage is derived from completed lesson count divided by the
    // course's total lesson count, multiplied by 100.
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // Certificate details belong to this enrollment because completion is per student-course pair.
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

// A compound index applies uniqueness to the pair, not to either field alone.
// MongoDB then rejects duplicate enrollment records for the same student/course.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

const Enrollment = mongoose.model('Enrollment', enrollmentSchema)

module.exports = Enrollment
