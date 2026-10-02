import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TeacherSidebar from '../../components/dashboard/TeacherSidebar'

const LogoMark = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M12 3 1 8l11 5 9-4.09V15h2V8L12 3zm-7 9.32V16c0 1.66 3.13 3 7 3s7-1.34 7-3v-3.68L12 15l-7-2.68z" />
  </svg>
)

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
// for mobile sidebar closes
  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>

      <div className="min-w-0 flex-1">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-expanded={sidebarOpen}
            aria-label="Open teacher navigation"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]"
          >
            <i className="fas fa-bars" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard/teacher')}
            className="flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white shadow-md shadow-[#22C55E]/30">
              <LogoMark />
            </span>
            BarakahTech
          </button>

          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#15803D] text-xs font-bold text-white">
            {/*Shows first letter of teacher name.*/}
            {(user?.name || 'T').charAt(0).toUpperCase()}
          </span>
        </header>

        {/* Drawer overlay */}
        <div
          aria-hidden={!sidebarOpen}
          className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className={`h-full w-[272px] shadow-2xl transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <TeacherSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        <main className="h-[calc(100vh-57px)] overflow-y-auto lg:h-full">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default TeacherDashboard