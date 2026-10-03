import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navigationItems = [
  { to: '/dashboard/student', label: 'Overview', icon: 'fas fa-chart-pie', end: true },
  { to: '/dashboard/student/browse', label: 'Browse Courses', icon: 'fas fa-magnifying-glass' },
  { to: '/dashboard/student/courses', label: 'My Learning', icon: 'fas fa-book-open' },
  { to: '/dashboard/student/profile', label: 'My Profile', icon: 'fas fa-user' },
]

const StudentSidebar = ({ onClose = () => {} }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    onClose()
    navigate('/login')
  }

  return (
    <aside className="flex h-full min-h-screen w-[280px] shrink-0 flex-col justify-between border-r border-slate-200 bg-white">
      <div>
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-lg text-white shadow-md shadow-[#22C55E]/30">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-slate-900">BarakahTech</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#16A34A]">Student Portal</p>
          </div>
        </div>

        <p className="px-5 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Menu</p>
        <nav aria-label="Student dashboard" className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${isActive ? 'bg-[#F0FDF4] text-[#16A34A] shadow-sm ring-1 ring-[#22C55E]/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${isActive ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`} aria-hidden="true">
                    <i className={item.icon} />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && <i className="fas fa-chevron-right ml-auto text-[10px] text-[#22C55E]" aria-hidden="true" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-sm font-bold text-white">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'Student'}</p>
              <p className="mt-0.5 inline-block rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-semibold capitalize text-[#16A34A] ring-1 ring-[#22C55E]/20">{user?.role || 'student'}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
            <i className="fas fa-right-from-bracket text-xs" aria-hidden="true" />
            Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

export default StudentSidebar
