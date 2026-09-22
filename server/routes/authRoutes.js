const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getMe } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)

// This route is protected so only a request with a valid JWT can verify its
// current user identity through the getMe controller.
router.get('/me', authMiddleware, getMe)

module.exports = router