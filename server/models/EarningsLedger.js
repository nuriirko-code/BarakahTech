const mongoose = require('mongoose')

const earningsLedgerSchema = new mongoose.Schema(
  {
    // Each ledger entry belongs to a teacher and records the amount associated with their daily work.
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The student who generated this earning is also recorded so the system can match daily feedback,
    // refunds, and payout calculations to the precise learning activity.
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Payment links this ledger to the original transaction that created the revenue stream.
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },

    // The course or booking references connect this ledger to the teaching activity that produced value.
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

    // The ledger is tracked by date because the platform uses daily feedback to approve teacher income.
    date: {
      type: Date,
      required: true,
    },

    // The gross amount is the total customer payment for that day, before commission is removed.
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // The platform fee is kept separately so payout calculations and teacher summaries remain transparent.
    platformFeeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // The net amount is what the teacher actually earns after platform commission is deducted.
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Currency is saved explicitly so the same teacher and ledger can be compared across currencies.
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      trim: true,
    },

    // Status shows whether the daily earnings are still pending approval, already approved by feedback,
    // refunded after a negative result, or paid out to the teacher.
    status: {
      type: String,
      enum: ['pending', 'approved', 'refunded', 'paid_out'],
      default: 'pending',
    },

    // Positive feedback is the approval trigger for the mage of the day's earnings.
    approvedByFeedback: {
      type: Boolean,
      default: false,
    },
    feedbackSubmittedAt: {
      type: Date,
      default: null,
    },
    paidOutAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// A compound index on teacher and date keeps daily earnings queries fast when the platform calculates
// monthly payouts or filter teacher income by day. This is a performance-critical path.
earningsLedgerSchema.index({ teacher: 1, date: 1 })

const EarningsLedger = mongoose.model('EarningsLedger', earningsLedgerSchema)

module.exports = EarningsLedger
