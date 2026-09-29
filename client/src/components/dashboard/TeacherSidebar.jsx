import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navigationItems = [
  // `end` ensures Overview is active only at the exact dashboard root URL.
  { to: '/dashboard/teacher', label: 'Overview', icon: '📊', end: true },
  { to: '/dashboard/teacher/courses', label: 'My Courses', icon: '📚' },
  { to: '/dashboard/teacher/sessions', label: 'Live Sessions', icon: '🎯' },
  { to: '/dashboard/teacher/profile', label: 'My Profile', icon: '👤' },
]

const TeacherSidebar = ({ onClose = () => {} }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  return (
    <aside className="flex h-full min-h-screen w-[260px] shrink-0 flex-col justify-between border-r border-gray-200 bg-white p-5">
      <div>
        <div className="border-b border-gray-100 pb-6">
          <p className="text-xl font-bold text-green-800">BarakahTech</p>
          <p className="mt-1 text-xs font-semibold uppercase text-gray-500">Teacher Portal</p>
        </div>

        <nav aria-label="Teacher dashboard" className="mt-6 space-y-2">
          {/* NavLink behaves like Link and also exposes whether its URL is active. */}
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              // The parent mobile drawer passes onClose so choosing a page closes it.
              onClick={onClose}
              // isActive is true when this link matches the current route and drives its styling.
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${isActive ? 'bg-green-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <p className="truncate font-semibold text-gray-900">{user?.name || 'Teacher'}</p>
        <p className="mt-1 text-sm capitalize text-gray-500">{user?.role || 'teacher'}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-left font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </aside>
  )
}

export default TeacherSidebar
