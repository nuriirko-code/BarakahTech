const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required'
    })
  }

  const token = authorizationHeader.slice(7).trim()

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required'
    })
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    })
  }
}

module.exports = authMiddleware
