const express = require('express')
const router = express.Router()
const {
	registerUser,
	loginUser,
	getMe,
	forgotPassword,
	resetPassword,
} = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)

// Reset requests are intentionally unauthenticated because users have lost access to their account.
// A random token is emailed, only its hash is stored, and the reset endpoint compares hashes.
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

// This route is protected so only a request with a valid JWT can verify its
// current user identity through the getMe controller.
router.get('/me', authMiddleware, getMe)

module.exports = router