import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StudentSidebar from '../../components/dashboard/StudentSidebar'

// Students and teachers share one nested dashboard layout pattern so navigation,
// mobile behavior, and route composition stay consistent while their page content differs.
const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Close the mobile drawer after a student navigates to another nested page.
  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden lg:block">
        <StudentSidebar />
      </div>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button type="button" aria-expanded={sidebarOpen} aria-label="Open student navigation" onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]">
            <i className="fas fa-bars" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => navigate('/dashboard/student')} className="flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white shadow-md shadow-[#22C55E]/30">
              <i className="fas fa-graduation-cap text-xs" aria-hidden="true" />
            </span>
            BarakahTech
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#15803D] text-xs font-bold text-white">
            {(user?.name || 'S').charAt(0).toUpperCase()}
          </span>
        </header>

        <div aria-hidden={!sidebarOpen} className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setSidebarOpen(false)}>
          <div className={`h-full w-[280px] shadow-2xl transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
            <StudentSidebar onClose={() => setSidebarOpen(false)} />
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

export default StudentDashboard
