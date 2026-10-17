const mongoose = require('mongoose')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const { scanForExternalContacts, getSafeWarningMessage } = require('../utils/contentScanner')
const {
  sendAdminAnnouncementEmail,
  sendNewMessageEmail,
} = require('../utils/emailService')

const getCurrentUserId = (req) => req.user?.id || req.user?.userId

const isParticipant = (conversation, userId) => conversation.participants
  .some((participant) => participant.toString() === userId.toString())

// Inbox data is denormalized onto the thread so listing conversations does not load
// each entire message history just to show its latest preview.
const updateConversationPreview = async (conversation, message) => {
  conversation.lastMessage = message.content
  conversation.lastMessageAt = message.createdAt || new Date()
  conversation.lastMessageBy = message.sender
  await conversation.save()
}

const getSenderReadState = (userId) => ({
  user: userId,
  readAt: new Date(),
  isRead: true,
})

const getUnreadMessageQuery = (conversationIds, userId) => ({
  conversation: { $in: conversationIds },
  isDeleted: false,
  sender: { $ne: userId },
  'readBy.user': { $ne: userId },
})

// Reusing a direct thread prevents duplicate inbox entries for the same two people
// and course context while preserving their existing message history.
const createConversation = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req)
    const { recipientId, courseId = null, subject = '', type = 'direct' } = req.body

    if (!recipientId || !mongoose.isValidObjectId(recipientId)) {
      return res.status(400).json({ message: 'A valid recipientId is required' })
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot start a conversation with yourself' })
    }

    if (type !== 'direct') {
      return res.status(400).json({ message: 'Use the support endpoint to create a support conversation' })
    }

    if (courseId && !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: 'Course ID is invalid' })
    }

    if (courseId) {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only enrolled students can message a teacher about a course' })
      }

      const course = await Course.findById(courseId).select('teacher')

      if (!course) {
        return res.status(404).json({ message: 'Course not found' })
      }

      if (course.teacher.toString() !== recipientId.toString()) {
        return res.status(400).json({ message: 'Course questions must be sent to that course’s teacher' })
      }

      // Course-linked teacher contact is limited to enrolled students; hiding the button
      // in the UI is helpful, but this API check is the actual access-control boundary.
      const enrollment = await Enrollment.findOne({ student: currentUserId, course: courseId })
      if (!enrollment) {
        return res.status(403).json({ message: 'Enroll in this course before messaging its teacher' })
      }
    }

    const recipient = await User.findById(recipientId)

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' })
    }

    const existingConversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [currentUserId, recipientId], $size: 2 },
      course: courseId,
      isActive: true,
    })

    if (existingConversation) {
      return res.status(200).json({ conversation: existingConversation, existing: true })
    }

    const isAdminConversation = req.user.role === 'admin' || recipient.role === 'admin'
    const conversation = await Conversation.create({
      participants: [currentUserId, recipientId],
      type: 'direct',
      course: courseId,
      subject: String(subject).trim(),
      isAdminConversation,
    })

    return res.status(201).json({ conversation, existing: false })
  } catch (error) {
    console.error('Create conversation error:', error)
    return res.status(500).json({ message: 'Server error while creating conversation' })
  }
}

// Membership is checked before saving or returning content so guessing a conversation ID
// never grants access to another user's private messages.
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = getCurrentUserId(req)
    const content = String(req.body.content || '').trim()

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' })
    }

    if (content.length > 5000) {
      return res.status(400).json({ message: 'Messages cannot exceed 5000 characters' })
    }

    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!isParticipant(conversation, currentUserId)) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' })
    }

    if (!conversation.isActive) {
      return res.status(400).json({ message: 'This conversation is closed' })
    }

    const scanResult = scanForExternalContacts(content)
    const hasViolation = scanResult.hasViolation
    const shouldBlock = hasViolation && scanResult.severity === 'high'
    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUserId,
      content,
      readBy: [getSenderReadState(currentUserId)],
      flaggedForReview: hasViolation,
      flagReason: hasViolation ? scanResult.violations.join(', ') : '',
      // High-severity attempts are retained for moderators but hidden from conversation history.
      isDeleted: shouldBlock,
      deletedAt: shouldBlock ? new Date() : null,
    })

    // High severity is saved only as a hidden moderation record. Medium and low findings
    // are delivered with a warning; clean messages follow the normal delivery path.
    if (shouldBlock) {
      return res.status(400).json({
        message: getSafeWarningMessage(scanResult.severity),
        warning: getSafeWarningMessage(scanResult.severity),
      })
    }

    await updateConversationPreview(conversation, message)

    const recipients = conversation.participants.filter(
      (participant) => participant.toString() !== currentUserId.toString()
    )
    const [sender, recipientUsers] = await Promise.all([
      User.findById(currentUserId).select('name email'),
      User.find({ _id: { $in: recipients } }).select('name email'),
    ])

    // Email lets offline participants know they have a new message; the private content
    // stays in the authenticated platform conversation instead of being copied into email.
    if (sender) {
      void Promise.all(recipientUsers.map((recipient) => (
        sendNewMessageEmail(recipient, sender, conversation.subject)
      ))).catch((error) => console.error('New message notification error:', error))
    }

    const warning = hasViolation ? getSafeWarningMessage(scanResult.severity) : undefined
    return res.status(201).json({ message, ...(warning ? { warning } : {}) })
  } catch (error) {
    console.error('Send message error:', error)
    return res.status(500).json({ message: 'Server error while sending message' })
  }
}

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const currentUserId = getCurrentUserId(req)
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 30))
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    if (!isParticipant(conversation, currentUserId)) {
      return res.status(403).json({ message: 'You are not a participant in this conversation' })
    }

    const query = { conversation: conversation._id, isDeleted: false }
    const [messages, totalMessages] = await Promise.all([
      Message.find(query)
        .populate('sender', 'name role')
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Message.countDocuments(query),
    ])

    // Each recipient's read state is stored on the message, which supports direct and
    // group conversations without one participant clearing everyone else's unread status.
    const unreadMessages = messages.filter((message) => (
      message.sender._id.toString() !== currentUserId.toString()
      && !message.readBy.some((entry) => entry.user.toString() === currentUserId.toString() && entry.isRead)
    ))

    await Promise.all(unreadMessages.map(async (message) => {
      const readEntry = message.readBy.find((entry) => entry.user.toString() === currentUserId.toString())
      if (readEntry) {
        readEntry.isRead = true
        readEntry.readAt = new Date()
      } else {
        message.readBy.push(getSenderReadState(currentUserId))
      }
      await message.save()
    }))

    return res.status(200).json({
      messages,
      pagination: {
        page,
        limit,
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
      },
    })
  } catch (error) {
    console.error('Get conversation messages error:', error)
    return res.status(500).json({ message: 'Server error while loading messages' })
  }
}

const getMyConversations = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req)
    const conversations = await Conversation.find({
      participants: currentUserId,
      isActive: true,
    })
      .populate('participants', 'name role')
      .populate('course', 'title')
      .sort({ lastMessageAt: -1, updatedAt: -1 })

    // The inbox needs one unread count per thread; the message body remains unloaded until opened.
    const conversationsWithUnread = await Promise.all(conversations.map(async (conversation) => {
      const unreadCount = await Message.countDocuments(getUnreadMessageQuery([conversation._id], currentUserId))
      return { ...conversation.toObject(), unreadCount }
    }))

    return res.status(200).json({ conversations: conversationsWithUnread })
  } catch (error) {
    console.error('Get my conversations error:', error)
    return res.status(500).json({ message: 'Server error while loading conversations' })
  }
}

const createSupportTicket = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req)
    const subject = String(req.body.subject || '').trim()
    const initialMessage = String(req.body.initialMessage || '').trim()

    if (!subject || !initialMessage) {
      return res.status(400).json({ message: 'Subject and initial message are required' })
    }

    if (initialMessage.length > 5000) {
      return res.status(400).json({ message: 'Messages cannot exceed 5000 characters' })
    }

    const admin = await User.findOne({ role: 'admin', _id: { $ne: currentUserId } })

    if (!admin) {
      return res.status(503).json({ message: 'Support temporarily unavailable' })
    }

    const scanResult = scanForExternalContacts(initialMessage)
    if (scanResult.hasViolation && scanResult.severity === 'high') {
      return res.status(400).json({ warning: getSafeWarningMessage('high') })
    }

    const conversation = await Conversation.create({
      participants: [currentUserId, admin._id],
      type: 'support',
      isAdminConversation: true,
      subject,
    })
    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUserId,
      content: initialMessage,
      readBy: [getSenderReadState(currentUserId)],
      flaggedForReview: scanResult.hasViolation,
      flagReason: scanResult.hasViolation ? scanResult.violations.join(', ') : '',
    })
    await updateConversationPreview(conversation, message)

    const sender = await User.findById(currentUserId).select('name email')
    if (sender) {
      void sendNewMessageEmail(admin, sender, subject)
        .catch((error) => console.error('Support notification error:', error))
    }

    const warning = scanResult.hasViolation ? getSafeWarningMessage(scanResult.severity) : undefined
    return res.status(201).json({ conversation, message, ...(warning ? { warning } : {}) })
  } catch (error) {
    console.error('Create support ticket error:', error)
    return res.status(500).json({ message: 'Server error while creating support ticket' })
  }
}

// An announcement is stored once in a group conversation, rather than duplicated for
// every recipient; this keeps storage and moderation work proportional to broadcasts.
const sendAdminAnnouncement = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req)
    const subject = String(req.body.subject || '').trim()
    const content = String(req.body.content || '').trim()
    const targetRole = req.body.targetRole || 'all'

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' })
    }

    if (!['all', 'student', 'teacher', 'pending_teacher'].includes(targetRole)) {
      return res.status(400).json({ message: 'Target role must be all, student, teacher, or pending_teacher' })
    }

    if (content.length > 5000) {
      return res.status(400).json({ message: 'Announcement content cannot exceed 5000 characters' })
    }

    const recipientQuery = targetRole === 'all' ? {} : { role: targetRole }
    const recipients = await User.find({
      ...recipientQuery,
      isActive: true,
      _id: { $ne: currentUserId },
    }).select('_id email')

    if (recipients.length === 0) {
      return res.status(404).json({ message: 'No recipients found for this announcement' })
    }

    const conversation = await Conversation.create({
      participants: [currentUserId, ...recipients.map((recipient) => recipient._id)],
      type: 'announcement',
      isAdminConversation: true,
      subject,
    })
    const message = await Message.create({
      conversation: conversation._id,
      sender: currentUserId,
      content,
      type: 'announcement',
      readBy: [getSenderReadState(currentUserId)],
    })
    await updateConversationPreview(conversation, message)

    const announcementRecipients = recipients.filter((recipient) => recipient.email)
    void sendAdminAnnouncementEmail(announcementRecipients, subject, content)
      .catch((error) => console.error('Announcement email error:', error))

    return res.status(201).json({
      message: 'Announcement sent successfully',
      conversation,
      announcement: message,
      recipientCount: recipients.length,
    })
  } catch (error) {
    console.error('Send admin announcement error:', error)
    return res.status(500).json({ message: 'Server error while sending announcement' })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = getCurrentUserId(req)
    const conversations = await Conversation.find({
      participants: currentUserId,
      isActive: true,
    }).select('_id')
    const conversationIds = conversations.map((conversation) => conversation._id)
    const count = conversationIds.length === 0
      ? 0
      : await Message.countDocuments(getUnreadMessageQuery(conversationIds, currentUserId))

    return res.status(200).json({ count })
  } catch (error) {
    console.error('Get unread count error:', error)
    return res.status(500).json({ message: 'Server error while loading unread count' })
  }
}

const getFlaggedMessages = async (req, res) => {
  try {
    const messages = await Message.find({ flaggedForReview: true })
      .populate('sender', 'name email role')
      .populate('conversation', 'subject type participants')
      .sort({ createdAt: -1 })

    return res.status(200).json({ messages, count: messages.length })
  } catch (error) {
    console.error('Get flagged messages error:', error)
    return res.status(500).json({ message: 'Server error while loading flagged messages' })
  }
}

module.exports = {
  createConversation,
  sendMessage,
  getConversationMessages,
  getMyConversations,
  createSupportTicket,
  sendAdminAnnouncement,
  getUnreadCount,
  getFlaggedMessages,
}
