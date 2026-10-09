const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const authorize = require('../middleware/roleMiddleware')
const { getAllUsers, toggleUserActive } = require('../controllers/adminController')

// These routes have double protection: JWT authentication establishes identity,
// then role authorization ensures only administrators can manage user accounts.
router.get('/users', authMiddleware, authorize('admin'), getAllUsers)
router.put('/users/:userId/deactivate', authMiddleware, authorize('admin'), toggleUserActive)

module.exports = router
