import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import TeacherSidebar from '../../components/dashboard/TeacherSidebar'

// This component owns the shared dashboard layout, not the content of any one
// dashboard page. Outlet is where React Router renders the matched child route.
const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Route changes on mobile should dismiss the drawer so the newly selected
  // page is visible without requiring a second tap on the close button.
  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gray-50 lg:flex lg:h-screen lg:overflow-hidden">
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-expanded={sidebarOpen}
            aria-label="Open teacher navigation"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-lg"
          >
            ☰
          </button>
          <button type="button" onClick={() => navigate('/dashboard/teacher')} className="font-bold text-green-800">
            BarakahTech
          </button>
          <span className="max-w-[40%] truncate text-sm font-medium text-gray-700">
            {user?.name || 'Teacher'}
          </span>
        </header>

        {/* The overlay dims content; its background closes the drawer on outside clicks. */}
        <div
          aria-hidden={!sidebarOpen}
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        >
          {/* The translated sidebar slides in from the left and closes on navigation. */}
          <div
            className={`h-full w-[260px] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <TeacherSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>

        <main className="h-[calc(100vh-57px)] overflow-y-auto p-5 sm:p-8 lg:h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default TeacherDashboard
