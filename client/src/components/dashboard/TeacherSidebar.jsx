import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navigationItems = [
  // `end` ensures Overview is active only at the exact dashboard root URL.
  { to: '/dashboard/teacher', label: 'Overview', icon: 'fas fa-chart-pie', end: true },
  { to: '/dashboard/teacher/courses', label: 'My Courses', icon: 'fas fa-book-open' },
  { to: '/dashboard/teacher/sessions', label: 'Live Sessions', icon: 'fas fa-video' },
  { to: '/dashboard/teacher/profile', label: 'My Profile', icon: 'fas fa-user' },
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
    <aside className="flex h-full min-h-screen w-[280px] shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
      {/* Brand block */}
      <div>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-lg text-white shadow-md shadow-[#22C55E]/30">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-slate-900">
              BarakahTech
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#16A34A]">
              Teacher Portal
            </p>
          </div>
        </div>

        {/* Section label for hierarchy */}
        <p className="px-5 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Menu
        </p>

        {/* Primary navigation */}
        <nav aria-label="Teacher dashboard" className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${
                  isActive
                    ? 'bg-[#F0FDF4] text-[#16A34A] shadow-sm ring-1 ring-[#22C55E]/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#22C55E] text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}
                    aria-hidden="true"
                  >
                    <i className={item.icon} />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <i
                      className="fas fa-chevron-right ml-auto text-[10px] text-[#22C55E]"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Teacher identity + logout */}
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-sm font-bold text-white">
              {(user?.name || 'T').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || 'Teacher'}
              </p>
              <p className="mt-0.5 inline-block rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#16A34A] ring-1 ring-[#22C55E]/20">
                {user?.role || 'teacher'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <i className="fas fa-right-from-bracket text-xs" aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

export default TeacherSidebar