const mongoose = require('mongoose')

const weeklySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
)

// This is deliberately separate from LiveTutorApplication.weeklyAvailability.
// The application stores the schedule supplied for approval; this document is
// the working schedule a tutor can safely update after approval.
const tutorAvailabilitySchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    liveTutorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveTutorProfile',
      required: true,
    },
    // Slot times are stored in the tutor's selected local timezone. Students
    // will later see converted times in their own timezone during booking.
    timezone: {
      type: String,
      required: true,
    },
    weeklySlots: {
      type: [weeklySlotSchema],
      default: [],
    },
    // Advance notice prevents a student from creating a last-minute surprise
    // booking that leaves the tutor no realistic preparation time.
    advanceBookingHours: {
      type: Number,
      default: 24,
      min: 0,
    },
    cancellationHours: {
      type: Number,
      default: 24,
      min: 0,
    },
    // A buffer protects tutor wellbeing by preventing exhausting, back-to-back
    // sessions with no time to prepare, rest, or write notes.
    bufferMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
    maxDailySession: {
      type: Number,
      default: 8,
      min: 1,
      max: 12,
    },
    // This is a temporary vacation-mode switch: tutors can pause new bookings
    // while keeping their schedule ready to turn back on later.
    isAcceptingBookings: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

const TutorAvailability = mongoose.model('TutorAvailability', tutorAvailabilitySchema)

module.exports = TutorAvailability
