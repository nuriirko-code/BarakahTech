import API_BASE_URL from '../../../config/api.js'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { formatCurrency } from '../../../utils/currencyUtils'
import { getCategoryGradient, getCategoryIcon } from '../../../utils/courseUtils'
import Avatar from '../../../components/common/Avatar'

const emptyFilters = { category: '', language: '', minRate: '', maxRate: '', level: '' }

const categoryOptions = ['technology', 'languages', 'sciences', 'business', 'leadership']
const languageOptions = ['English', 'Amharic', 'Arabic', 'Afaan Oromo', 'French']
const levelOptions = ['beginner', 'intermediate', 'advanced']

// Existing tutor records may still have the former hourly-rate fields. This
// fallback lets their cards remain usable until their public offer is updated.
const getTutorSessionPrice = (tutor) => {
  const directPrice = Number(tutor.sessionPrice)
  if (Number.isFinite(directPrice) && directPrice > 0) return directPrice

  const duration = Number(tutor.sessionDuration || tutor.sessionDurations?.[0] || 60)
  return Number(((Number(tutor.hourlyRate || 0) / 60) * duration).toFixed(2))
}

// The marketplace refetches when a filter changes. This keeps the list aligned
// with server filtering, just like a course browse page, without filtering a
// stale or incomplete client-side copy of all tutor data.
const FindTutor = () => {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const navigate = useNavigate()

  useEffect(() => {
    let isCurrent = true

    const fetchTutors = async () => {
      setLoading(true)
      setError('')
      const query = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== '')
      ).toString()

      try {
        const response = await axios.get(`${API_BASE_URL}/live-tutors/browse${query ? `?${query}` : ''}`)
        if (isCurrent) setTutors(response.data.tutors || [])
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load live tutors. Please try again.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    fetchTutors()
    return () => { isCurrent = false }
  }, [filters])

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }))
  const clearFilters = () => setFilters(emptyFilters)
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <section className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#14532D] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-wide text-green-200">Live learning</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Find a Live Tutor</h1><p className="mt-3 max-w-2xl text-base leading-7 text-green-50">Connect with qualified tutors for personalized one-on-one sessions.</p></div>
          <span className="w-fit rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white ring-1 ring-white/20">{tutors.length} tutor{tutors.length === 1 ? '' : 's'}</span>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">Category<select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"><option value="">All categories</option>{categoryOptions.map((category) => <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Language<select value={filters.language} onChange={(event) => updateFilter('language', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"><option value="">All languages</option>{languageOptions.map((language) => <option key={language} value={language}>{language}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Level<select value={filters.level} onChange={(event) => updateFilter('level', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"><option value="">All levels</option>{levelOptions.map((level) => <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>)}</select></label>
          <label className="text-sm font-semibold text-slate-700">Min. session price<input type="number" min="0" value={filters.minRate} onChange={(event) => updateFilter('minRate', event.target.value)} placeholder="Any" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" /></label>
          <label className="text-sm font-semibold text-slate-700">Max. session price<input type="number" min="0" value={filters.maxRate} onChange={(event) => updateFilter('maxRate', event.target.value)} placeholder="Any" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" /></label>
        </div>
        {hasFilters && <button type="button" onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#15803D] hover:underline"><i className="fas fa-filter-circle-xmark" aria-hidden="true" />Clear filters</button>}
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><i className="fas fa-circle-exclamation mr-2" aria-hidden="true" />{error}</div>}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading tutors">{[1, 2, 3, 4, 5, 6].map((card) => <div key={card} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="h-32 animate-pulse bg-slate-200" /><div className="space-y-3 p-5"><div className="h-10 animate-pulse rounded bg-slate-200" /><div className="h-4 animate-pulse rounded bg-slate-100" /><div className="h-4 animate-pulse rounded bg-slate-100" /></div></div>)}</div>
      ) : tutors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm"><i className="fas fa-magnifying-glass text-4xl text-slate-300" aria-hidden="true" /><h2 className="mt-4 text-lg font-bold text-slate-800">No tutors found matching your filters</h2><p className="mt-2 text-sm text-slate-500">Try adjusting your search criteria.</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-[#F0FDF4] px-4 py-2.5 text-sm font-bold text-[#15803D] hover:bg-green-100">Clear filters</button>}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tutors.map((tutor) => {
            const displaySubjects = (tutor.subjects || []).slice(0, 3)
            const additionalSubjectCount = Math.max(0, (tutor.subjects || []).length - displaySubjects.length)
            const rating = Math.round(Number(tutor.rating) || 0)
            return (
              <article key={tutor._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#22C55E]/40 hover:shadow-md">
                <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${getCategoryGradient(tutor.mainCategory)}`}><i className={`${getCategoryIcon(tutor.mainCategory)} text-5xl text-white/90`} aria-hidden="true" />{tutor.introVideoUrl && <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm text-slate-900 shadow-sm" title="Introduction video available"><i className="fas fa-play ml-0.5" aria-hidden="true" /></span>}</div>
                <div className="p-5"><div className="flex items-center gap-3"><Avatar name={tutor.user?.name || 'Tutor'} imageUrl={tutor.profilePhoto} size="md" /><div className="min-w-0"><h2 className="truncate font-extrabold text-slate-900">{tutor.user?.name || 'Qualified tutor'}</h2>{tutor.isVerified && <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#15803D]"><i className="fas fa-shield-halved" aria-hidden="true" />Verified tutor</span>}</div></div>
                  <div className="mt-4 flex items-center gap-2 text-sm"><span className="font-bold text-amber-500">{[1, 2, 3, 4, 5].map((star) => <i key={star} className={`fas fa-star ${star <= rating ? '' : 'text-slate-200'}`} aria-hidden="true" />)}</span><span className="text-slate-500">{Number(tutor.rating || 0).toFixed(1)} ({tutor.totalSessionsTaught || 0} sessions)</span></div>
                  {/* Limiting tags to three keeps marketplace cards easy to scan; the full list belongs on the public profile. */}
                  <div className="mt-4 flex flex-wrap gap-1.5">{displaySubjects.map((subject) => <span key={subject} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{subject}</span>)}{additionalSubjectCount > 0 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">+{additionalSubjectCount} more</span>}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">{(tutor.teachingLanguages || []).map((language) => <span key={language} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">{language}</span>)}<span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-semibold capitalize text-[#15803D]">{tutor.teachingLevel === 'all' ? 'All levels' : tutor.teachingLevel}</span></div>
                  {/* Availability appears before the profile click so students do not waste time opening tutors who paused bookings. */}
                  <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${tutor.isAcceptingBookings ? 'text-[#15803D]' : 'text-slate-500'}`}><span className={`h-2.5 w-2.5 rounded-full ${tutor.isAcceptingBookings ? 'bg-[#22C55E]' : 'bg-slate-400'}`} />{tutor.isAcceptingBookings ? 'Available' : 'Not accepting bookings'}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><p className="font-extrabold text-[#15803D]">{formatCurrency(getTutorSessionPrice(tutor), tutor.currency)}<span className="ml-1 text-xs font-medium text-slate-500">/session</span></p><button type="button" onClick={() => navigate(`/tutors/${tutor._id}`)} className="rounded-xl border border-[#22C55E]/40 px-3 py-2 text-sm font-bold text-[#15803D] transition hover:bg-[#F0FDF4]">View Profile</button></div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default FindTutor
