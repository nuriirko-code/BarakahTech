const mongoose = require('mongoose')

// A booking moves through several real-world moments: awaiting payment,
// confirmed, in progress, completed, cancelled, or no-show. Keeping these
// explicit states makes notifications, refunds, and reporting dependable.
const sessionBookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tutorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveTutorProfile', required: true },

    subject: { type: String, required: true, trim: true },
    sessionDate: { type: Date, required: true },
    // Wall-clock values stay as strings because calculating from a Date alone
    // becomes ambiguous across tutor/student timezones and daylight savings.
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    timezone: { type: String, required: true },
    studentGoals: { type: String, default: '', trim: true },
    studentLevel: { type: String, default: '', trim: true },

    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    platformFee: { type: Number, default: 0, min: 0 },
    tutorEarning: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentReference: { type: String, default: '', trim: true },
    paymentMethod: { type: String, default: 'manual', trim: true },

    // pending_payment means the time is held temporarily but is not a confirmed
    // session until the platform verifies the student's manual transfer.
    status: { type: String, enum: ['pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], default: 'pending_payment' },
    // no_show is different from cancelled: the scheduled time passes without a
    // participant attending, whereas cancellation happens before the session.
    cancelledBy: { type: String, enum: ['student', 'tutor', 'admin'], default: null },
    cancellationReason: { type: String, default: '', trim: true },
    cancelledAt: { type: Date, default: null },

    // Room details remain empty initially. Creating a room only after payment
    // verification prevents abandoned/unpaid bookings from creating resources.
    roomUrl: { type: String, default: '' },
    roomName: { type: String, default: '' },
    recordingUrl: { type: String, default: '' },

    feedbackSubmitted: { type: Boolean, default: false },
    tutorEarningReleased: { type: Boolean, default: false },
  },
  { timestamps: true }
)

sessionBookingSchema.index({ tutor: 1, sessionDate: 1, startTime: 1 })

const SessionBooking = mongoose.model('SessionBooking', sessionBookingSchema)

module.exports = SessionBooking
