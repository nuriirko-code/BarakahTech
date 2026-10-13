const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    // The payer is the student or user who initiated the payment. Keeping this identity on every
    // transaction is essential for auditing, refunds, and later charge disputes.
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The recipient is the teacher or platform beneficiary. This field separates person-to-person
    // settlement from the platform's own revenue and makes payout calculations explicit.
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The platform name is saved as a record in case the business later changes brand names or
    // needs to audit historical financial data across multiple product names.
    platform: {
      type: String,
      default: 'BarakahTech',
      trim: true,
    },

    // The transaction type tells us the business purpose of the payment, such as a course sale,
    // a session booking, a refund, or a teacher payout.
    type: {
      type: String,
      enum: ['course_purchase', 'session_booking', 'refund', 'teacher_payout', 'platform_commission'],
      required: true,
    },

    // Payment status tracks the lifecycle from a pending attempt to a completed or failed result.
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    // The amount is the money value of the transaction in the selected currency.
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Currency is stored explicitly on every payment so reports can be computed accurately even if
    // the platform later supports multiple legal currencies or future localizations.
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      trim: true,
    },

    // The commission percentage is snapshot at the time of payment because rates can change later,
    // and the system needs a historical record of the exact fee used for this transaction.
    platformFeePercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },

    // We store fee and payout numbers separately so the system can explain revenue sharing clearly,
    // audit discrepancies, and compute teacher earnings without re-deriving from incomplete data.
    platformFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    teacherEarningAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // A payment may be associated with a course, enrollment, or a future booking. These references
    // link the financial record to the business event it represents.
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      default: null,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    // The selected gateway explains where the student sent funds so verification can match
    // payment records to the correct bank or mobile-money statement.
    gateway: {
      type: String,
      enum: ['telebirr', 'cbe_birr', 'amhara_bank', 'dashen_bank', 'awash_bank', 'other_mobile', 'card', 'manual'],
      default: 'manual',
    },
    paymentMethod: {
      type: String,
      enum: ['telebirr', 'cbe_birr', 'other_mobile', 'manual'],
      default: 'manual',
    },
    gatewayTransactionId: {
      type: String,
      default: '',
      trim: true,
    },
    // Mixed type can hold a provider response when an automated gateway is added, while manual
    // payments can leave this empty and keep their student proof in the dedicated fields below.
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // The student's transaction ID is proof they initiated a transfer; an admin still
    // compares it with the receiving account before granting course access.
    manualPaymentReference: {
      type: String,
      default: '',
      trim: true,
    },

    // A readable platform code lets admins match a bank SMS or statement entry to this order
    // without asking students to copy a long MongoDB ObjectId.
    platformPaymentCode: {
      type: String,
      default: '',
      trim: true,
    },

    studentNote: {
      type: String,
      default: '',
      trim: true,
    },

    // Recording the verifying admin creates an accountability trail for financial decisions.
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },

    // A payment can be received while the teacher payout is still pending. This field tracks the
    // separate event of transferring money to the teacher, not just whether the customer paid.
    paidOutToTeacher: {
      type: Boolean,
      default: false,
    },
    paidOutAt: {
      type: Date,
      default: null,
    },
    paidOutReference: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// A payment follows a practical lifecycle: pending while the payment is being processed,
// completed when the customer funds are accepted, refunded if reversed, and paidOut when the
// teacher receives their share. This ensures the platform can show both money movement and user impact.
const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment
