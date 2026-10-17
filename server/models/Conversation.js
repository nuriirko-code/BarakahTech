const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    // A conversation is the shared thread; individual message documents reference it,
    // so long chats do not turn into one ever-growing embedded array.
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (participants) => participants.length >= 2,
        message: 'A conversation must include at least two participants',
      },
    },
    type: {
      type: String,
      enum: ['direct', 'support', 'announcement'],
      default: 'direct',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    isAdminConversation: {
      type: Boolean,
      default: false,
    },
    // Inbox previews can be rendered from this snapshot without querying every message.
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: null,
    },
    lastMessageBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

// Participant lookup powers inbox queries and access checks without scanning all threads.
conversationSchema.index({ participants: 1 })

const Conversation = mongoose.model('Conversation', conversationSchema)

module.exports = Conversation
