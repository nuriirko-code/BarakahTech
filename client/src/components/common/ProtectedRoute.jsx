import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Frontend authentication checks whether a user is signed in; authorization
// checks whether that signed-in user has an allowed role. Backend checks remain
// necessary because frontend code can be bypassed by calling the API directly.
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Wait for the saved token check to finish so a returning user is not
  // redirected to login before AuthContext has restored their session.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5 text-center" role="status">
        <div>
          <i className="fas fa-spinner fa-spin mb-3 text-3xl text-amber-500" aria-hidden="true" />
          <p className="text-sm text-gray-600">Checking your session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Keep the attempted location so a successful login can return here.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const hasAllowedRole = allowedRoles.length === 0
    || allowedRoles.includes(user.role)
    || (allowedRoles.includes('live_tutor') && Boolean(user.isLiveTutor))

  if (!hasAllowedRole) {
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />
    if (user.role === 'teacher' || user.isLiveTutor) {
      return <Navigate to="/dashboard/teacher" replace />
    }
    return <Navigate to="/dashboard/student" replace />
  }

  return children
}

export default ProtectedRoute
