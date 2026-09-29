import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Frontend authentication checks whether a user is signed in; authorization
// checks whether that signed-in user has an allowed role. Backend checks remain
// necessary because frontend code can be bypassed by calling the API directly.
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  // Wait for the saved token check to finish so a returning user is not
  // redirected to login before AuthContext has restored their session.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-green-800" role="status">
        Checking your session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
