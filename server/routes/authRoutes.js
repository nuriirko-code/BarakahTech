const express = require('express')
const router = express.Router()
const { registerUser, loginUser } = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')

router.post('/register', registerUser)
router.post('/login', loginUser)



module.exports = router