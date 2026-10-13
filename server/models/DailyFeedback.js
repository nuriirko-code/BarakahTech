const mongoose = require('mongoose')

const dailyFeedbackSchema = new mongoose.Schema(
  {
    // The student who completed the learning activity is the actor who decides if the lesson or session
    // was useful enough to unlock that day's earnings.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The teacher receives the feedback and the corresponding payout outcome (earnings or refund).
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The course or booking link ensures the feedback is connected to the original business activity.
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    earningsLedgerEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EarningsLedger',
      required: true,
    },

    // Feedback is tied to one day so it can release or refund exactly that day's teacher earnings.
    date: {
      type: Date,
      required: true,
    },

    // Rating is a secondary signal, but the core decision is whether the student found the content useful.
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    wasHelpful: {
      type: Boolean,
      required: true,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    wouldRecommend: {
      type: Boolean,
      default: true,
    },

    // Resolution explains what happened to the day's earnings: whether they were released, refunded,
    // rescheduled, or are still waiting for a decision.
    resolution: {
      type: String,
      enum: ['earnings_released', 'refund_issued', 'rescheduled', 'pending'],
      default: 'pending',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    replacementDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// A unique compound index prevents duplicate feedback for the same student, with the same teacher,
// for the same day. This supports trust and accountability because each day's learning outcome should
// have only one official quality decision.
dailyFeedbackSchema.index(
  { student: 1, teacher: 1, date: 1 },
  { unique: true }
)

const DailyFeedback = mongoose.model('DailyFeedback', dailyFeedbackSchema)

module.exports = DailyFeedback
