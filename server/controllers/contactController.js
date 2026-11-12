const { sendContactFormEmail } = require('../utils/emailService')

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 3
const RATE_LIMIT_MAX_IPS = 10000
const contactRequests = new Map()
let requestsSinceCleanup = 0

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const allowContactRequest = (ipAddress) => {
  const now = Date.now()
  requestsSinceCleanup += 1
  if (requestsSinceCleanup >= 100 || contactRequests.size >= RATE_LIMIT_MAX_IPS) {
    for (const [address, entry] of contactRequests) {
      if (entry.resetAt <= now) contactRequests.delete(address)
    }
    requestsSinceCleanup = 0
  }

  const record = contactRequests.get(ipAddress)

  if (!record || record.resetAt <= now) {
    if (contactRequests.size >= RATE_LIMIT_MAX_IPS) return false
    contactRequests.set(ipAddress, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false
  record.count += 1
  return true
}

const submitContactMessage = async (req, res) => {
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'
  if (!allowContactRequest(ipAddress)) {
    return res.status(429).json({ message: 'Too many messages were sent. Please wait a few minutes and try again.' })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const website = typeof body.website === 'string' ? body.website.trim() : ''

  if (website) return res.status(200).json({ message: 'Your message has been sent.' })
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please complete every field.' })
  }
  if (name.length > 100 || email.length > 254 || subject.length > 150 || message.length > 5000) {
    return res.status(400).json({ message: 'One or more fields exceed the allowed length.' })
  }
  if (!isValidEmail(email) || /[\r\n]/.test(subject)) {
    return res.status(400).json({ message: 'Enter a valid email address and subject.' })
  }

  try {
    const sent = await sendContactFormEmail({ name, email, subject, message })
    if (!sent) {
      return res.status(503).json({ message: 'The contact form is temporarily unavailable. Please email nuriirko@gmail.com directly.' })
    }
    return res.status(200).json({ message: 'Your message has been sent.' })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return res.status(500).json({ message: 'We could not send your message. Please try again later.' })
  }
}

module.exports = { submitContactMessage }
