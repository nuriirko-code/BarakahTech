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
    // TRIAL SYSTEM FIELDS
    // Trial completion is a different state than full enrollment: it means the
    // student reached the free-preview gate and needs to pay, while full enrollment
    // means access was granted and the teacher can communicate freely.
    trialLessonsCompleted: {
      type: Number,
      default: 0,
      // This count is intentionally separate from completedLessons because it only
      // tracks lessons completed during the free preview window before payment.
    },
    isTrialComplete: {
      type: Boolean,
      default: false,
      // When this turns true, the frontend can show the payment gate without
      // treating the student as a fully paid learner yet.
    },
    isFullyEnrolled: {
      type: Boolean,
      default: false,
      // Full enrollment is the master gate for access and communication after admin
      // confirms payment. Free courses set this immediately because there is no paid gate.
    },
    trialCompletedAt: {
      type: Date,
      default: null,
      // The exact moment the student hit the trial cap and the payment gate appeared.
    },
    fullEnrollmentActivatedAt: {
      type: Date,
      default: null,
      // This records when the course was upgraded from preview access to full access.
    },
    // LESSON ASSESSMENT TRACKING
    // We store scores in the enrollment because they are linked directly to this student’s
    // course progress, not to a generic reusable assessment table.
    assessmentScores: [{
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      score: {
        type: Number,
      },
      passed: {
        type: Boolean,
      },
      attempts: {
        type: Number,
        default: 1,
        // Attempt tracking helps identify when a student is struggling with the material.
      },
      passedAt: {
        type: Date,
        default: null,
      },
    }],
    // ENGAGEMENT TRACKING
    lastEngagementMessage: {
      type: String,
      default: '',
      // This avoids showing the same motivational prompt repeatedly to the same learner.
    },
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
