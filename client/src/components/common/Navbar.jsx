import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-green-100 bg-white/95 px-6 py-4 shadow-sm backdrop-blur sm:px-10">
      <Link to="/" className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        <span className="text-green-700">BarakahTech</span> Academy
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700 font-medium">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="font-medium text-green-800 transition hover:text-green-950 hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
