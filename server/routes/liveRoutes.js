const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { getAccess } = require('../controllers/liveController')

// A single authenticated endpoint dispatches to the appropriate session rules.
router.post('/:type/:id/access', authMiddleware, getAccess)

module.exports = router
