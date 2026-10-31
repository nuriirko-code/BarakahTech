const jwt = require('jsonwebtoken')

const optionalAuth = (req, res, next) => {
  const authorizationHeader = req.headers.authorization

  if (authorizationHeader?.startsWith('Bearer ')) {
    const token = authorizationHeader.slice(7).trim()
    if (token) {
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
      } catch {
        // Public session listings remain available for signed-out or expired sessions.
      }
    }
  }

  // Public pages can show registration state when a valid token is available,
  // without making authentication a requirement for browsing.
  return next()
}

module.exports = optionalAuth
