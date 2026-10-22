const mongoose = require('mongoose')

const sessionFeedbackSchema = new mongoose.Schema(
  {
    // One booking can have one official student outcome. The unique index makes
    // duplicate submissions impossible even if a browser sends two requests.
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SessionBooking',
      required: true,
      unique: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // This is the financial decision, rather than merely a star rating: it
    // determines whether the paid-session earnings may be approved or refunded.
    wasHelpful: {
      type: Boolean,
      required: true,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    wouldBookAgain: {
      type: Boolean,
      default: true,
    },
    resolution: {
      type: String,
      enum: ['earnings_released', 'refund_issued', 'pending'],
      default: 'pending',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

const SessionFeedback = mongoose.model('SessionFeedback', sessionFeedbackSchema)

module.exports = SessionFeedback
