const mongoose = require('mongoose')

// Scenario answers remain paired with their original prompts. An array of
// objects preserves that relationship, unlike one free-text field where an
// administrator could not tell which answer responds to which scenario.
const scenarioAnswerSchema = new mongoose.Schema(
  {
    scenario: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

const availabilitySlotSchema = new mongoose.Schema(
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
  },
  { _id: false }
)

// This is a private application for live tutoring, not a replacement for the
// existing TeacherApplication. Course teachers and live tutors have different
// requirements, review paths, and platform capabilities.
const liveTutorApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    teachingLanguages: {
      type: [String],
      required: true,
    },
    subjects: {
      type: [String],
      required: true,
    },
    mainCategory: {
      type: String,
      enum: ['technology', 'languages', 'sciences', 'business', 'leadership'],
      required: true,
    },
    teachingLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all'],
      required: true,
    },

    // Tutors choose one clear paid offer. Students see this exact duration and
    // price together, rather than needing to calculate an hourly rate.
    sessionDuration: {
      type: Number,
      min: 1,
    },
    sessionPrice: {
      type: Number,
      min: 0,
    },
    // Retained only to read applications submitted before direct session
    // pricing. New applications use sessionDuration and sessionPrice above.
    sessionDurations: {
      type: [Number],
      default: undefined,
    },
    hourlyRate: {
      type: Number,
      default: undefined,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    // Every approved tutor participates in the platform-wide free 30-minute
    // introductory session policy; applicants are informed before applying.
    trialSessionOffered: {
      type: Boolean,
      default: true,
    },
    trialSessionRate: {
      type: Number,
      default: 0,
    },

    yearsOfExperience: {
      type: Number,
      required: true,
    },
    // These URL fields start empty because Cloudinary upload support is a later
    // integration; keeping the shape now avoids a future migration.
    teachingCertificate: {
      type: String,
      default: '',
    },
    governmentId: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      required: true,
      minlength: 100,
    },
    teachingApproach: {
      type: String,
      required: true,
      minlength: 50,
    },

    scenarioAnswers: {
      type: [scenarioAnswerSchema],
      default: [],
    },
    // An introductory video helps review when available, but stays optional so
    // lack of a recording does not block a qualified tutor's application.
    introVideoUrl: {
      type: String,
      default: '',
    },

    // Application availability captures what the applicant submitted for
    // review. A future TutorAvailability model can hold the editable, booking-
    // ready schedule without overwriting this historical application record.
    weeklyAvailability: {
      type: [availabilitySlotSchema],
      default: [],
    },
    timezone: {
      type: String,
      required: true,
    },
    minimumSessionsPerWeek: {
      type: Number,
      default: 1,
    },
    advanceBookingHours: {
      type: Number,
      default: 24,
    },

    // An application begins pending. Admin review moves it to approved or
    // rejected; approval later creates the corresponding public profile.
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

const LiveTutorApplication = mongoose.model('LiveTutorApplication', liveTutorApplicationSchema)

module.exports = LiveTutorApplication
