const mongoose = require('mongoose')

const assessmentAnswerSchema = new mongoose.Schema(
  {
    question: {
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

const teacherApplicationSchema = new mongoose.Schema(
  {
    // Referencing the account keeps its name and email in one source of truth.
    // The application can populate this reference when it needs account details.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Personal information
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
    },

    // Keep categories open so new disciplines can be added without rejecting
    // applications. specificSubject is also free text for any course or subject.
    mainCategory: {
      type: String,
      required: true,
      trim: true,
    },
    specificSubject: {
      type: String,
      required: true,
      trim: true,
    },
    teachingLanguage: {
      type: String,
      enum: ['afan oromo', 'amharic', 'arabic', 'english', 'both'],
      required: true,
    },

    // hourlyRate is used for live teaching; course-only applications may leave it at 0.
    teachingMethod: {
      type: String,
      enum: ['live', 'courses', 'both'],
      required: true,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    availableHoursPerWeek: {
      type: Number,
      required: true,
    },
    availableDays: [String],

    // File URLs are strings because uploaded documents will live in Cloudinary,
    // rather than being stored directly inside MongoDB documents.
    educationLevel: {
      type: String,
      enum: ['high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other'],
      required: true,
    },
    institutionName: {
      type: String,
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    qualificationCertificateUrl: {
      type: String,
      default: '',
    },
    governmentIdUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      required: true,
      minlength: 100,
    },

    // Keep each assessment response paired with its question for later review.
    assessmentAnswers: [assessmentAnswerSchema],
    yearsInSpecificSubject: {
      type: Number,
      required: true,
    },
    portfolioLink: {
      type: String,
      default: '',
    },
    demoVideoLink: {
      type: String,
      default: '',
    },

    // Requiring true ensures applicants explicitly accept each commitment.
    agreedToStandards: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: 'Agreement to standards is required',
      },
    },
    agreedToBackgroundCheck: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: 'Agreement to the background check is required',
      },
    },
    confirmedAvailability: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: 'Availability confirmation is required',
      },
    },

    // Applications begin pending and move to approved or rejected after review.
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    // These fields record which admin reviewed the application and when.
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
  {
    timestamps: true,
  }
)

// timestamps automatically maintain createdAt and updatedAt for every application.
const TeacherApplication = mongoose.model('TeacherApplication', teacherApplicationSchema)

module.exports = TeacherApplication
