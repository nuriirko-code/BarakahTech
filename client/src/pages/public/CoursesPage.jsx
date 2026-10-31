import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { formatCurrency, getCoursePricing } from '../../utils/currencyUtils'
import { getCategoryEmoji, getCategoryGradient, getCategoryIcon, getCategoryLabel } from '../../utils/courseUtils'
import Avatar from '../../components/common/Avatar'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const categories = ['technology', 'languages', 'sciences', 'business', 'leadership']
const courseLanguages = ['english', 'amharic', 'afaan oromo']

const CoursesPage = () => {
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ category: '', level: '', language: '', search: '' })

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) setFilters((current) => ({ ...current, category: categoryFromUrl }))
  }, [searchParams])

  useEffect(() => {
    let isCurrent = true
    const loadCourses = async () => {
      setLoading(true)
      setError('')
      const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '')).toString()
      try {
        const response = await axios.get(`${API_BASE_URL}/courses${query ? `?${query}` : ''}`)
        if (isCurrent) setCourses(response.data.courses || [])
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load courses right now.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    loadCourses()
    return () => { isCurrent = false }
  }, [filters])

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-[#14532D] via-[#166534] to-[#0f3d2a] px-5 py-14 text-center text-white sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-200">Barakah Academy</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">{t('courses.title')}</h1>
            <p className="mt-4 text-base leading-7 text-green-50 sm:text-lg">{t('courses.subtitle')}</p>
            <label className="relative mx-auto mt-8 block max-w-2xl text-left">
              <span className="sr-only">{t('courses.search')}</span>
              <i className="fas fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder={t('courses.search')} className="w-full rounded-2xl border border-white/20 bg-white px-5 py-4 pl-12 text-slate-900 shadow-lg outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-green-200/40" />
            </label>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {['', ...categories].map((category) => (
                <button key={category || 'all'} type="button" onClick={() => updateFilter('category', category)} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${filters.category === category ? 'bg-green-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-green-50 hover:text-green-800'}`}>
                  <i className={`${category ? getCategoryIcon(category) : 'fas fa-border-all'} mr-2`} aria-hidden="true" />
                  {category ? getCategoryLabel(category, t) : t('courses.all')}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">
                {t('courses.level')}
                <select value={filters.level} onChange={(event) => updateFilter('level', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-green-600">
                  <option value="">{t('courses.allLevels')}</option>
                  {['beginner', 'intermediate', 'advanced'].map((level) => <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                {t('courses.language')}
                <select value={filters.language} onChange={(event) => updateFilter('language', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-green-600">
                  <option value="">{t('courses.allLanguages')}</option>
                  {courseLanguages.map((language) => <option key={language} value={language}>{language.replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}
                </select>
              </label>
              <div className="flex items-end"><p className="pb-2.5 text-sm font-semibold text-slate-500">{t('courses.results', { count: new Intl.NumberFormat(i18n.language).format(courses.length) })}</p></div>
            </div>
          </div>

          {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label={t('common.loading')}>
              {[1, 2, 3, 4, 5, 6].map((card) => <div key={card} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="h-40 animate-pulse bg-slate-200" /><div className="space-y-3 p-5"><div className="h-5 animate-pulse rounded bg-slate-200" /><div className="h-4 animate-pulse rounded bg-slate-100" /></div></div>)}
            </div>
          ) : courses.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
              <i className="fas fa-magnifying-glass text-4xl text-slate-300" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold">{t('courses.empty')}</h2>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const pricing = getCoursePricing(course.price, course.discountPercentage)
                return (
                  <article key={course._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${getCategoryGradient(course.category)}`}>
                      {course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : <span className="text-5xl" aria-hidden="true">{getCategoryEmoji(course.category)}</span>}
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-green-800">{getCategoryLabel(course.category, t)}</span>
                      <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold capitalize text-white">{course.level}</span>
                    </div>
                    <div className="p-5">
                      <h2 className="line-clamp-2 text-lg font-extrabold tracking-tight">{course.title}</h2>
                      <div className="mt-3 flex items-center gap-2"><Avatar name={course.teacher?.name || 'Teacher'} imageUrl={course.teacher?.profilePhoto} size="sm" /><span className="text-sm text-slate-600">{t('courses.by', { name: course.teacher?.name || 'Teacher' })}</span></div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-bold text-amber-500"><i className="fas fa-star" aria-hidden="true" /> {Number(course.rating || 0).toFixed(1)}</span>
                        <span className="text-slate-500"><i className="fas fa-users mr-1" aria-hidden="true" />{t('courses.enrolled', { count: new Intl.NumberFormat(i18n.language).format(course.totalEnrollments || 0) })}</span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{course.language}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500"><i className="fas fa-clock mr-1" aria-hidden="true" />{course.estimatedDuration ? t('courses.hours', { count: course.estimatedDuration }) : t('courses.flexible')}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        {course.isFree ? <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-extrabold text-green-700">{t('courses.free')}</span> : <div><p className="font-extrabold text-slate-900">{formatCurrency(pricing.discountedPrice, course.currency)}</p><p className="text-xs text-slate-500">{t('courses.trialOffer')}</p></div>}
                        <Link to={`/courses/${course._id}`} className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700">{t('courses.viewCourse')}</Link>
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

export default CoursesPage
