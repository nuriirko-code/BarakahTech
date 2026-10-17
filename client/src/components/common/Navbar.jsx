import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useUnreadMessageCount from '../../hooks/useUnreadMessageCount'

const Navbar = () => {
  const { user, logout } = useAuth()
  const unreadCount = useUnreadMessageCount()

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-green-100 bg-white/95 px-6 py-4 shadow-sm backdrop-blur sm:px-10">
      <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E] text-sm text-white shadow-md shadow-[#22C55E]/25" aria-hidden="true">
          <i className="fas fa-graduation-cap" />
        </span>
        <span><span className="text-[#16A34A]">BarakahTech</span> Academy</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-700 font-medium">
              {user.name}
            </span>
            <Link to="/messages" aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ''}`} title="Messages" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-green-50 hover:text-green-800">
              <i className="fas fa-comments" aria-hidden="true" />
              {unreadCount > 0 && (
                // The 9+ cap keeps a large unread total from stretching the compact navigation badge.
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            {user.role === 'admin' && (
              // Role-aware navigation helps admins find their workspace; server authorization remains the security boundary.
              <Link
                to="/dashboard/admin"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-[#16A34A] transition hover:bg-[#F0FDF4]"
              >
                <i className="fas fa-gauge-high text-sm" aria-hidden="true" />
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 font-bold text-white transition hover:bg-[#16A34A]">
              <i className="fas fa-right-from-bracket text-xs" aria-hidden="true" />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 font-semibold text-[#16A34A] transition hover:bg-[#F0FDF4]">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-[#22C55E] px-4 py-2.5 font-bold text-white transition hover:bg-[#16A34A]">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
