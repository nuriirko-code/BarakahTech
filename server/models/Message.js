const mongoose = require('mongoose')

const readBySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // A per-user flag supports unread state in group threads, unlike one global boolean.
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
)

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
    // System messages are platform-generated enrollment/payment notices; announcements
    // are admin broadcasts, while text is ordinary participant-authored conversation.
    type: {
      type: String,
      enum: ['text', 'system', 'announcement'],
      default: 'text',
    },
    readBy: {
      type: [readBySchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // Scanner findings are retained for moderator review rather than silently discarded.
    flaggedForReview: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
)

// Conversation plus creation time supports ordered, paginated history reads.
messageSchema.index({ conversation: 1, createdAt: 1 })
messageSchema.index({ flaggedForReview: 1, createdAt: -1 })

const Message = mongoose.model('Message', messageSchema)

module.exports = Message
