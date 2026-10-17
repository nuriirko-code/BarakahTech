const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const {
  createConversation,
  sendMessage,
  getConversationMessages,
  getMyConversations,
  createSupportTicket,
  sendAdminAnnouncement,
  getUnreadCount,
  getFlaggedMessages,
} = require('../controllers/messageController')

// Messaging contains private account and course information, so every route requires
// authentication; public callers never receive access to inbox or conversation data.
router.use(authMiddleware)

// A dedicated lightweight count keeps notification badges independent of inbox payload size.
router.get('/unread-count', getUnreadCount)
router.get('/conversations', getMyConversations)
router.post('/conversations', createConversation)
router.get('/conversations/:conversationId/messages', getConversationMessages)
router.post('/conversations/:conversationId/messages', sendMessage)
router.post('/support', createSupportTicket)

// Only administrators may send broadcasts or inspect contact-sharing moderation records.
router.post('/announcements', authorize('admin'), sendAdminAnnouncement)
router.get('/flagged', authorize('admin'), getFlaggedMessages)

module.exports = router
