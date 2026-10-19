const mongoose = require('mongoose')

// The public profile is deliberately separate from LiveTutorApplication. The
// application may include review-only data such as ID documents and admin notes,
// while this model is the safe public shop window students browse after approval.
const liveTutorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiveTutorApplication',
      required: true,
    },

    bio: {
      type: String,
      required: true,
    },
    teachingApproach: {
      type: String,
      required: true,
    },
    subjects: {
      type: [String],
      default: [],
    },
    mainCategory: {
      type: String,
      default: '',
    },
    teachingLevel: {
      type: String,
      default: '',
    },
    teachingLanguages: {
      type: [String],
      default: [],
    },
    // URLs are empty until Cloudinary uploads are introduced. The fields exist
    // now so approved profiles have a stable shape before that integration.
    introVideoUrl: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },

    sessionDurations: {
      type: [Number],
      default: [],
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    trialSessionOffered: {
      type: Boolean,
      default: false,
    },
    trialSessionRate: {
      type: Number,
      default: 0,
    },

    // These aggregate values are cached on the profile because repeatedly
    // counting sessions, students, and ratings during tutor browsing would be
    // slower as the marketplace grows.
    totalSessionsTaught: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    responseRate: {
      type: Number,
      default: 100,
    },
    responseTimeHours: {
      type: Number,
      default: 24,
    },

    // isActive is a tutor-controlled temporary pause from new bookings;
    // isVerified is a platform-controlled trust badge for manually reviewed tutors.
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Admin approval creates this profile by copying only the public-safe fields
// from the matching LiveTutorApplication.
const LiveTutorProfile = mongoose.model('LiveTutorProfile', liveTutorProfileSchema)

module.exports = LiveTutorProfile
