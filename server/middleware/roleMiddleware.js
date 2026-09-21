// Role-based authorization checks whether an authenticated user's role is allowed
// to access a particular resource. Authentication answers "Who are you?" while
// authorization answers "Are you allowed to do this?" We need this middleware
// so a logged-in student, teacher, or administrator can receive different access.

// Rest parameters collect any number of arguments into one array. Using
// ...allowedRoles lets a route allow one role, such as authorize('admin'), or
// several roles, such as authorize('teacher', 'admin'), without changing the
// middleware's function signature.
function authorize(...allowedRoles) {
  // The returned function is the actual Express middleware. Express calls it
  // with the current request, response, and next function for each request.
  return (req, res, next) => {
    // authMiddleware runs before this middleware and stores the verified JWT
    // payload on req.user. That payload contains the user's role at req.user.role.
    const userRole = req.user.role

    // Array.includes() checks whether the user's role is one of the roles
    // permitted by the route. Calling next() allows the request to continue to
    // the route handler, so it should only be called after this check succeeds.
    if (allowedRoles.includes(userRole)) {
      return next()
    }

    // A 403 Forbidden response means the user is authenticated, but their role
    // is not allowed to access this resource. This differs from 401 Unauthorized,
    // which means authentication is missing or invalid, such as a missing or
    // expired JWT handled by authMiddleware.
    return res.status(403).json({
      message: 'You do not have permission to access this resource'
    })
  }
}

// Example route usage:
// router.get('/admin-area', authMiddleware, authorize('admin'), adminHandler)
// authMiddleware verifies the token first, then authorize checks its role.

module.exports = authorize
