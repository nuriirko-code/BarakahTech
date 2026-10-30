import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const NotFound = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const dashboardPath = user?.role === 'admin'
    ? '/dashboard/admin'
    : user?.role === 'teacher' || user?.isLiveTutor
      ? '/dashboard/teacher'
      : '/dashboard/student'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <section className="max-w-lg text-center">
          <p className="mb-4 text-8xl font-bold text-amber-500">404</p>
          <i className="fas fa-map-signs mb-6 text-5xl text-gray-300" aria-hidden="true" />
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Page not found</h1>
          <p className="mb-8 leading-relaxed text-gray-600">
            The page you are looking for does not exist or has been moved. Let us help you find what you need.
          </p>
          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400"
            >
              <i className="fas fa-arrow-left mr-2" aria-hidden="true" />
              Go back
            </button>
            <Link
              to="/"
              className="rounded-xl bg-[#0a2416] px-6 py-3 font-semibold text-white transition hover:opacity-90"
            >
              <i className="fas fa-home mr-2" aria-hidden="true" />
              Go home
            </Link>
            {user && (
              <Link
                to={dashboardPath}
                className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition hover:bg-amber-600"
              >
                <i className="fas fa-th-large mr-2" aria-hidden="true" />
                My dashboard
              </Link>
            )}
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="mb-4 text-sm text-gray-500">Or explore these pages</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Browse courses', to: '/courses', icon: 'fa-book-open' },
                { label: 'Find a tutor', to: '/tutors', icon: 'fa-chalkboard-teacher' },
                { label: 'Sign up free', to: '/register', icon: 'fa-user-plus' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-green-300 hover:text-green-800"
                >
                  <i className={`fas ${item.icon} text-xs`} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default NotFound
