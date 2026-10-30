import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import useUnreadMessageCount from '../../hooks/useUnreadMessageCount'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', flag: '🇪🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
]

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const unreadCount = useUnreadMessageCount()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false)
  const [mobileLanguagesOpen, setMobileLanguagesOpen] = useState(false)
  const [coursesHovered, setCoursesHovered] = useState(false)
  const [languageHovered, setLanguageHovered] = useState(false)
  // Refs keep timer IDs between renders without scheduling additional renders.
  const coursesTimeout = useRef(null)
  const languageTimeout = useRef(null)

  const categories = [
    { key: 'technology', icon: 'fa-laptop-code', label: t('cat_technology') },
    { key: 'languages', icon: 'fa-language', label: t('cat_languages') },
    { key: 'sciences', icon: 'fa-flask', label: t('cat_sciences') },
    { key: 'business', icon: 'fa-chart-line', label: t('cat_business') },
    { key: 'leadership', icon: 'fa-star', label: t('cat_leadership') },
  ]

  const handleCoursesEnter = () => {
    clearTimeout(coursesTimeout.current)
    setCoursesHovered(true)
  }

  const handleCoursesLeave = () => {
    coursesTimeout.current = setTimeout(() => setCoursesHovered(false), 150)
  }

  const handleLanguageEnter = () => {
    clearTimeout(languageTimeout.current)
    setLanguageHovered(true)
  }

  const handleLanguageLeave = () => {
    languageTimeout.current = setTimeout(() => setLanguageHovered(false), 150)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    setMobileCoursesOpen(false)
    setMobileLanguagesOpen(false)
    navigate('/')
  }

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    setLanguageHovered(false)
    setMobileLanguagesOpen(false)
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setMobileCoursesOpen(false)
    setMobileLanguagesOpen(false)
  }

  // Distinct roles use distinct dashboards; live-tutor students enter their tutor workspace.
  const getDashboardPath = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/dashboard/admin'
    if (user.role === 'teacher') return '/dashboard/teacher'
    if (user.role === 'student' && user.isLiveTutor) return '/dashboard/teacher/live-schedule'
    return '/dashboard/student'
  }

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/courses') return location.pathname.startsWith('/courses')
    if (path === '/tutors') return location.pathname.startsWith('/tutors')
    return location.pathname === path
  }

  const navLinkStyle = (active) => ({
    color: active ? '#ffffff' : '#f59e0b',
    borderBottom: active ? '2px solid #f59e0b' : '2px solid transparent',
  })

  // Inline colors preserve the exact brand palette, including the active link's white state.
  const handleNavHover = (event, active = false) => {
    event.currentTarget.style.color = active ? '#ffffff' : '#fbbf24'
  }

  const handleNavLeave = (event, active = false) => {
    event.currentTarget.style.color = active ? '#ffffff' : '#f59e0b'
  }

  const handleLiveSessionHover = (event) => {
    event.currentTarget.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  }

  const handleLiveSessionLeave = (event) => {
    event.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0]

  useEffect(() => () => {
    clearTimeout(coursesTimeout.current)
    clearTimeout(languageTimeout.current)
  }, [])

  // Exact brand colors are inline because they are specific to this design system,
  // rather than relying on the default Tailwind color palette.
  return (
    <nav style={{ backgroundColor: '#0a2416' }} className="sticky top-0 z-50 shadow-lg">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-1" aria-label="Barakah Academy home">
            <span className="whitespace-nowrap text-lg font-bold sm:text-xl" style={{ color: '#ffffff' }}>Barakah</span>
            <span className="whitespace-nowrap text-lg font-bold sm:text-xl" style={{ color: '#fbbf24' }}>Academy</span>
          </Link>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-lg border-b-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-[#fbbf24]"
              style={navLinkStyle(isActivePath('/'))}
              aria-current={isActivePath('/') ? 'page' : undefined}
              onMouseEnter={(event) => handleNavHover(event, isActivePath('/'))}
              onMouseLeave={(event) => handleNavLeave(event, isActivePath('/'))}
            >
              <i className="fas fa-home text-xs" aria-hidden="true" />
              {t('nav_home')}
            </Link>

            <div
              className="relative"
              onMouseEnter={handleCoursesEnter}
              onMouseLeave={handleCoursesLeave}
            >
              <button
                type="button"
                aria-expanded={coursesHovered}
                aria-haspopup="true"
                onClick={() => setCoursesHovered((open) => !open)}
                className="flex items-center gap-1 rounded-lg border-b-2 px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-[#fbbf24]"
                style={navLinkStyle(isActivePath('/courses'))}
                onMouseEnter={(event) => handleNavHover(event, isActivePath('/courses'))}
                onMouseLeave={(event) => handleNavLeave(event, isActivePath('/courses'))}
              >
                <i className="fas fa-graduation-cap text-xs" aria-hidden="true" />
                {t('nav_courses')}
                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${coursesHovered ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {coursesHovered && (
                <div
                  className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl"
                  onMouseEnter={handleCoursesEnter}
                  onMouseLeave={handleCoursesLeave}
                >
                  {categories.map((category) => (
                    <Link
                      key={category.key}
                      to={`/courses?category=${category.key}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
                      onClick={() => setCoursesHovered(false)}
                    >
                      <i className={`fas ${category.icon} w-4 text-xs text-amber-600`} aria-hidden="true" />
                      <span className="font-medium">{category.label}</span>
                    </Link>
                  ))}
                  <div className="mt-1 border-t border-gray-100 pt-1">
                    <Link
                      to="/courses"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
                      onClick={() => setCoursesHovered(false)}
                    >
                      <i className="fas fa-th-large w-4 text-xs" aria-hidden="true" />
                      {t('nav_browse_all')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* The warm amber gradient distinguishes the primary live-tutoring action. */}
            <Link
              to="/tutors"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              onMouseEnter={handleLiveSessionHover}
              onMouseLeave={handleLiveSessionLeave}
            >
              <i className="fas fa-video text-xs" aria-hidden="true" />
              Join Live Session
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="relative"
              onMouseEnter={handleLanguageEnter}
              onMouseLeave={handleLanguageLeave}
            >
              <button
                type="button"
                aria-label={t('nav_language')}
                aria-expanded={languageHovered}
                aria-haspopup="true"
                onClick={() => setLanguageHovered((open) => !open)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-semibold text-[#ffd166] transition-all duration-200 hover:text-white"
                style={{
                  borderColor: 'rgba(255,209,102,0.65)',
                  backgroundColor: 'rgba(255,209,102,0.16)',
                }}
                onMouseEnter={(event) => { event.currentTarget.style.color = '#ffffff' }}
                onMouseLeave={(event) => { event.currentTarget.style.color = '#ffd166' }}
              >
                <i className="fas fa-globe hidden text-xs sm:inline" aria-hidden="true" />
                <span className="uppercase">{currentLanguage}</span>
                <i className={`fas fa-chevron-down hidden text-xs transition-transform duration-200 sm:inline ${languageHovered ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {languageHovered && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-gray-100 bg-white py-2 shadow-xl"
                  onMouseEnter={handleLanguageEnter}
                  onMouseLeave={handleLanguageLeave}
                >
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                        currentLanguage === language.code
                          ? 'bg-amber-50 font-semibold text-amber-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base" aria-hidden="true">{language.flag}</span>
                      <span>{language.label}</span>
                      {currentLanguage === language.code && (
                        <i className="fas fa-check ml-auto text-xs text-amber-600" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden max-w-28 truncate text-sm font-medium text-[#ffd166] sm:inline">
                  {user.name?.trim().split(/\s+/)[0] || user.name}
                </span>
                <Link
                  to="/messages"
                  aria-label={`Messages${unreadCount ? `, ${unreadCount} unread` : ''}`}
                  title="Messages"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-[#ffd166] transition hover:bg-amber-400/10 hover:text-white sm:inline-flex"
                >
                  <i className="fas fa-comments" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to={getDashboardPath()}
                  className="hidden rounded-lg border px-3 py-1.5 text-sm font-semibold text-[#ffd166] transition-all duration-200 hover:bg-amber-400/15 hover:text-white sm:inline-flex"
                  style={{ borderColor: 'rgba(255,209,102,0.65)' }}
                >
                  <i className="fas fa-th-large mr-1.5 text-xs" aria-hidden="true" />
                  {t('nav_dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:text-red-300 sm:inline-flex"
                >
                  <i className="fas fa-sign-out-alt mr-1 text-xs" aria-hidden="true" />
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              // Visitors see both actions because authentication state cannot tell whether they have an account.
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/login"
                  className="whitespace-nowrap px-2 py-2 text-sm font-bold text-[#fbbf24] transition-colors hover:text-white sm:px-3"
                  style={{ color: '#fbbf24' }}
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-green-600 sm:inline-flex"
                >
                  {t('nav_sign_up')}
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-[#f59e0b] transition-colors hover:bg-amber-400/10 lg:hidden"
            onClick={() => {
              setMobileMenuOpen((open) => {
                if (open) {
                  setMobileCoursesOpen(false)
                  setMobileLanguagesOpen(false)
                }
                return !open
              })
            }}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          style={{ backgroundColor: '#0d2e1a' }}
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-green-900 px-4 py-3 lg:hidden"
        >
          <div className="space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-3 rounded-lg border-b-2 px-3 py-2.5 text-sm font-medium ${
                isActivePath('/') ? 'border-[#f59e0b] text-white' : 'border-transparent text-[#f59e0b]'
              }`}
              onClick={closeMobileMenu}
            >
              <i className="fas fa-home w-4 text-xs" aria-hidden="true" />
              {t('nav_home')}
            </Link>

            <div>
              <button
                type="button"
                aria-expanded={mobileCoursesOpen}
                aria-controls="mobile-course-links"
                onClick={() => setMobileCoursesOpen((open) => !open)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-amber-400/10 ${
                  isActivePath('/courses') ? 'text-white' : 'text-[#f59e0b]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <i className="fas fa-graduation-cap w-4 text-xs" aria-hidden="true" />
                  {t('nav_courses')}
                </span>
                <i className={`fas fa-chevron-down text-xs transition-transform ${mobileCoursesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {mobileCoursesOpen && (
                <div id="mobile-course-links" className="ml-4 border-l border-amber-400/20 py-1 pl-3">
                  {categories.map((category) => (
                    <Link
                      key={category.key}
                      to={`/courses?category=${category.key}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#f59e0b] hover:bg-amber-400/10 hover:text-[#fbbf24]"
                      onClick={closeMobileMenu}
                    >
                      <i className={`fas ${category.icon} w-4 text-xs opacity-70`} aria-hidden="true" />
                      {category.label}
                    </Link>
                  ))}
                  <Link
                    to="/courses"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#f59e0b] hover:bg-amber-400/10 hover:text-[#fbbf24]"
                    onClick={closeMobileMenu}
                  >
                    <i className="fas fa-th-large w-4 text-xs" aria-hidden="true" />
                    {t('nav_browse_all')}
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/tutors"
              className="my-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              onClick={closeMobileMenu}
            >
              <i className="fas fa-video w-4 text-xs" aria-hidden="true" />
              Join Live Session
            </Link>

            <div>
              <button
                type="button"
                aria-expanded={mobileLanguagesOpen}
                aria-controls="mobile-language-links"
                onClick={() => setMobileLanguagesOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#f59e0b] transition-colors hover:bg-amber-400/10"
              >
                <span className="flex items-center gap-3">
                  <i className="fas fa-globe w-4 text-xs" aria-hidden="true" />
                  {t('nav_language')} <span className="uppercase text-amber-200">{currentLanguage}</span>
                </span>
                <i className={`fas fa-chevron-down text-xs transition-transform ${mobileLanguagesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {mobileLanguagesOpen && (
                <div id="mobile-language-links" className="ml-4 border-l border-amber-400/20 py-1 pl-3">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-amber-400/10 ${
                        currentLanguage === language.code ? 'font-semibold text-white' : 'text-[#f59e0b]'
                      }`}
                    >
                      <span aria-hidden="true">{language.flag}</span>
                      <span>{language.label}</span>
                      {currentLanguage === language.code && <i className="fas fa-check ml-auto text-xs text-amber-400" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 border-t border-green-900 pt-3">
            {user ? (
              <div className="space-y-2">
                <p className="px-3 text-sm font-semibold text-[#f59e0b]">{user.name}</p>
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#f59e0b] hover:bg-amber-400/10"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-th-large w-4 text-xs" aria-hidden="true" />
                  {t('nav_dashboard')}
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#f59e0b] hover:bg-amber-400/10"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-comments w-4 text-xs" aria-hidden="true" />
                  Messages{unreadCount > 0 ? ` (${unreadCount > 9 ? '9+' : unreadCount} unread)` : ''}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-red-400/10"
                >
                  <i className="fas fa-sign-out-alt w-4 text-xs" aria-hidden="true" />
                  {t('nav_logout')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="rounded-lg border px-4 py-2.5 text-center text-sm font-medium text-[#f59e0b]"
                  style={{ borderColor: 'rgba(245,158,11,0.4)' }}
                  onClick={closeMobileMenu}
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-green-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={closeMobileMenu}
                >
                  {t('nav_sign_up')}
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
