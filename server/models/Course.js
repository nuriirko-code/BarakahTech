const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  contentType: {
    type: String,
    enum: ['video', 'text', 'both'],
    default: 'both',
  },
  // Store each provider's URL as a string; source controls how that URL is interpreted.
  videoUrl: {
    type: String,
    default: '',
  },
  videoSource: {
    type: String,
    enum: ['upload', 'youtube', 'googledrive'],
    default: 'youtube',
  },
  textContent: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 0,
  },
  // Order is the teacher-defined sequence of lessons within the course.
  order: {
    type: Number,
    required: true,
  },
  // A free lesson can act as a preview before a student enrolls in the course.
  isFree: {
    type: Boolean,
    default: false,
  },
})

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
    },
    // Cloudinary assets are stored by URL rather than binary data in MongoDB.
    thumbnail: {
      type: String,
      default: '',
    },
    // Categories remain open-ended so new educational disciplines can be added
    // without a schema deployment or rejected teacher/student choices.
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    language: {
      type: String,
      enum: ['amharic', 'english', 'both'],
      required: true,
    },

    // The teacher reference connects this course to its owner account.
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'ETB',
    },

    objectives: {
      type: [String],
      required: true,
      validate: {
        validator: (objectives) => objectives.length >= 3,
        message: 'A course must have at least 3 learning objectives',
      },
    },
    estimatedDuration: {
      type: Number,
      required: true,
    },
    // Lessons are embedded because they are normally read and edited as part
    // of their parent course and need a stable order within that course.
    lessons: {
      type: [lessonSchema],
      default: [],
    },

    // Draft courses are private work in progress; published courses are
    // available to learners; archived courses are no longer actively offered.
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    // This cached count avoids counting all enrollment documents for popular sorting.
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    // rating is the average score; totalRatings is the number of submitted ratings.
    // Average rating is updated as (old average * count + new rating) / (count + 1).
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
  },
  { timestamps: true }
)

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
