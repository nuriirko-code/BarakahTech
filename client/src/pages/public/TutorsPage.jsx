import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { formatCurrency } from '../../utils/currencyUtils'
import { getCategoryEmoji, getCategoryGradient, getCategoryIcon } from '../../utils/courseUtils'
import Avatar from '../../components/common/Avatar'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const categories = ['technology', 'languages', 'sciences', 'business', 'leadership']
const getTutorRate = (tutor) => Number(tutor.sessionPrice) || Number(tutor.hourlyRate) || 0
const getSessionDuration = (tutor) => Number(tutor.sessionDuration || tutor.sessionDurations?.[0]) || 60

const TutorsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ category: '', language: '', minRate: '', maxRate: '' })

  useEffect(() => {
    let isCurrent = true

    const loadTutors = async () => {
      setLoading(true)
      setError('')
      const query = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== ''),
      ).toString()

      try {
        const response = await axios.get(
          `${API_BASE_URL}/live-tutors/browse${query ? `?${query}` : ''}`,
        )
        if (isCurrent) setTutors(response.data.tutors || [])
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load tutors right now.')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadTutors()
    return () => { isCurrent = false }
  }, [filters])

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-[#14532D] via-[#166534] to-[#0f3d2a] px-5 py-14 text-center text-white sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-200">Live learning</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">{t('public_tutors_title')}</h1>
            <p className="mt-4 text-base leading-7 text-green-50 sm:text-lg">{t('public_tutors_subtitle')}</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {['', ...categories].map((category) => (
                <button
                  key={category || 'all'}
                  type="button"
                  onClick={() => updateFilter('category', category)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold ${
                    filters.category === category
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-green-50'
                  }`}
                >
                  <i className={`${category ? getCategoryIcon(category) : 'fas fa-border-all'} mr-2`} aria-hidden="true" />
                  {category ? t(`cat_${category}`) : 'All'}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">
                Language
                <select
                  value={filters.language}
                  onChange={(event) => updateFilter('language', event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600"
                >
                  <option value="">All Languages</option>
                  {['English', 'Amharic', 'Afaan Oromo', 'Arabic'].map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Minimum session price
                <input
                  type="number"
                  min="0"
                  value={filters.minRate}
                  onChange={(event) => updateFilter('minRate', event.target.value)}
                  placeholder="Any"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Maximum session price
                <input
                  type="number"
                  min="0"
                  value={filters.maxRate}
                  onChange={(event) => updateFilter('maxRate', event.target.value)}
                  placeholder="Any"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600"
                />
              </label>
            </div>
            {!loading && !error && (
              <p className="mt-4 text-sm font-semibold text-slate-500">Showing {tutors.length} tutors</p>
            )}
          </div>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div key={card} className="h-96 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
              <i className="fas fa-magnifying-glass text-4xl text-slate-300" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold">No tutors found</h2>
              <p className="mt-2 text-sm text-slate-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor) => {
                const subjects = (tutor.subjects || []).slice(0, 3)
                const rating = Math.round(Number(tutor.rating) || 0)

                return (
                  <article key={tutor._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${getCategoryGradient(tutor.mainCategory)}`}>
                      <span className="text-5xl" aria-hidden="true">{getCategoryEmoji(tutor.mainCategory)}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={tutor.user?.name || 'Tutor'} imageUrl={tutor.profilePhoto} size="md" />
                        <div>
                          <h2 className="font-extrabold">{tutor.user?.name || 'Qualified tutor'}</h2>
                          {tutor.isVerified && (
                            <p className="mt-1 text-xs font-bold text-green-700">
                              <i className="fas fa-shield-halved mr-1" aria-hidden="true" />
                              Verified tutor
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {subjects.map((subject) => (
                          <span key={subject} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{subject}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(tutor.teachingLanguages || []).map((language) => (
                          <span key={language} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">{language}</span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="font-bold text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className={`fas fa-star ${star <= rating ? '' : 'text-slate-200'}`} aria-hidden="true" />
                          ))}
                        </span>
                        <span className="text-slate-500">
                          {Number(tutor.rating || 0).toFixed(1)} ({tutor.totalSessionsTaught || 0} sessions)
                        </span>
                      </div>

                      <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${tutor.isAcceptingBookings ? 'text-green-700' : 'text-slate-500'}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${tutor.isAcceptingBookings ? 'bg-green-500' : 'bg-slate-400'}`} />
                        {tutor.isAcceptingBookings ? 'Available' : 'Unavailable'}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="font-extrabold text-green-700">
                            {formatCurrency(getTutorRate(tutor), tutor.currency)}
                          </p>
                          <p className="text-xs font-medium text-slate-500">{getSessionDuration(tutor)}-minute session</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/tutors/${tutor._id}`)}
                          className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default TutorsPage
