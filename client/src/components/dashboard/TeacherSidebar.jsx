import { NavLink, useNavigate } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { useAuth } from '../../context/AuthContext'
import useUnreadMessageCount from '../../hooks/useUnreadMessageCount'

const navigationItems = [
  // `end` ensures Overview is active only at the exact dashboard root URL.
  { to: '/dashboard/teacher', label: 'Overview', icon: 'fas fa-chart-pie', end: true },
  { to: '/dashboard/teacher/courses', label: 'My Courses', icon: 'fas fa-book-open' },
  { to: '/messages', label: 'Messages', icon: 'fas fa-comments' },
  { to: '/dashboard/teacher/profile', label: 'My Profile', icon: 'fas fa-user' },
]

const TeacherSidebar = ({ onClose = () => {} }) => {
  const { user, logout } = useAuth()
  const unreadCount = useUnreadMessageCount()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    //If this sidebar is inside the mobile drawer, close the drawer.
    onClose()
    navigate('/login')
  }

  return (
    <aside className="flex h-full min-h-0 w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Brand block */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-6">
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

      {/* This middle region scrolls when navigation grows, preserving the
          header and logout controls on smaller desktop screens. */}
      <div className="min-h-0 flex-1 overflow-y-auto py-2">
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
                  {item.to === '/messages' && unreadCount > 0 && (
                    // A capped count remains legible without pushing sidebar content around.
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-700 px-1.5 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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

          {/* Live tutoring is a separate capability from creating courses.
              The boolean arrives on user from the safe login / get-me response. */}
          <div className="mx-1 my-4 border-t border-slate-200" />
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Live Tutoring
          </p>

          {user?.isLiveTutor ? (
            <>
              <NavLink
                to="/dashboard/teacher/live-schedule"
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
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${isActive ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`} aria-hidden="true">
                      <i className="fas fa-calendar-days" />
                    </span>
                    <span className="truncate">My Schedule</span>
                    {isActive && <i className="fas fa-chevron-right ml-auto text-[10px] text-[#22C55E]" aria-hidden="true" />}
                  </>
                )}
              </NavLink>
              <NavLink
                to="/dashboard/teacher/live-sessions"
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
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${isActive ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`} aria-hidden="true">
                      <i className="fas fa-video" />
                    </span>
                    <span className="truncate">Live Sessions</span>
                    {isActive && <i className="fas fa-chevron-right ml-auto text-[10px] text-[#22C55E]" aria-hidden="true" />}
                  </>
                )}
              </NavLink>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose()
                navigate('/apply/live-tutor')
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl border border-[#22C55E]/20 bg-[#F0FDF4] px-4 py-3 text-left text-sm font-semibold text-[#15803D] transition-all duration-200 hover:border-[#22C55E]/40 hover:bg-[#DCFCE7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#22C55E] text-white" aria-hidden="true">
                <i className="fas fa-plus" />
              </span>
              Apply as Live Tutor
            </button>
          )}
        </nav>
      </div>

      {/* Teacher identity + logout */}
      <div className="shrink-0 border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          {/* Showing a user avatar in the sidebar reinforces the sense that this is a personal
              workspace rather than a generic admin shell, which builds ownership and trust. */}
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'Teacher'} imageUrl={user?.profilePhoto} size="md" />
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
