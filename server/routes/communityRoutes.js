const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuth')
const authorize = require('../middleware/roleMiddleware')
const {
  listSessions,
  getSession,
  registerForSession,
  cancelRegistration,
  createMentorshipSession,
  getMyMentorshipSessions,
  getEnrolledMentorshipSessions,
  createSession,
  updateSessionStatus,
  saveOutcomes,
  getSessionParticipants,
} = require('../controllers/communityController')

const router = express.Router()

// Public session discovery can personalize registration state for signed-in viewers.
router.get('/', optionalAuth, listSessions)
router.post('/', authMiddleware, authorize('admin'), createSession)

// Keep fixed subpaths registered before the catch-all session detail path.
router.post('/mentorship', authMiddleware, authorize('teacher'), createMentorshipSession)
router.get('/mentorship/mine', authMiddleware, authorize('teacher'), getMyMentorshipSessions)
router.get('/mentorship/enrolled', authMiddleware, authorize('student'), getEnrolledMentorshipSessions)
router.post('/:id/register', authMiddleware, registerForSession)
router.delete('/:id/register', authMiddleware, cancelRegistration)
router.put('/:id/status', authMiddleware, updateSessionStatus)
router.put('/:id/outcomes', authMiddleware, saveOutcomes)
router.get('/:id/participants', authMiddleware, getSessionParticipants)
router.get('/:id', optionalAuth, getSession)

module.exports = router
