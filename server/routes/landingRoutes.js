const express = require('express')
const { getLandingPageData, getPublicTeacherProfile } = require('../controllers/landingController')

const router = express.Router()

router.get('/', getLandingPageData)
router.get('/teachers/:teacherId', getPublicTeacherProfile)

module.exports = router
