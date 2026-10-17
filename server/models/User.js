const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: '',
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // Only the SHA-256 digest is stored. A database leak therefore does not reveal
    // a usable reset link, and the expiry limits how long a digest can be redeemed.
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ['student', 'teacher', 'pending_teacher', 'admin'],
      default: 'student',
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
    // isActive supports soft deactivation: access can be disabled while the
    // account record remains available for auditing or later reactivation.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', userSchema)

module.exports = User
