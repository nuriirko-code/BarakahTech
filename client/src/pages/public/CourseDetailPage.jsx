import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, getCoursePricing } from '../../utils/currencyUtils'
import { getCategoryEmoji, getCategoryGradient } from '../../utils/courseUtils'
import Avatar from '../../components/common/Avatar'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'

const CourseDetailPage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    const loadCourse = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`)
        if (isCurrent) setCourse(response.data.course)
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load this course right now.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadCourse()
    return () => { isCurrent = false }
  }, [courseId])

  const beginEnrollment = () => {
    if (authLoading) return
    if (user?.role === 'student') {
      navigate(`/courses/${courseId}/enroll`, { state: { course } })
      return
    }

    // Course details stay public; enrollment remains a student-only action.
    navigate('/login', { state: { message: 'Log in with a student account to enroll in this course.' } })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        {loading ? (
          <div className="mx-auto max-w-7xl space-y-6 px-5 py-10 sm:px-8">
            <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        ) : error || !course ? (
          <section className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-5 py-12 text-center">
            <i className="fas fa-circle-exclamation text-4xl text-red-500" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-extrabold">Course unavailable</h1>
            <p role="alert" className="mt-3 text-slate-600">{error || 'This course could not be found.'}</p>
            <button type="button" onClick={() => navigate('/courses')} className="mt-6 rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800">
              Browse courses
            </button>
          </section>
        ) : (
          <>
            <section className={`bg-gradient-to-br ${getCategoryGradient(course.category)} text-white`}>
              <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_20rem] lg:items-center lg:py-16">
                <div>
                  <button type="button" onClick={() => navigate('/courses')} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
                    <i className="fas fa-arrow-left" aria-hidden="true" />
                    Browse courses
                  </button>
                  <p className="text-sm font-bold uppercase tracking-widest text-white/80">{course.category} · {course.level}</p>
                  <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">{course.title}</h1>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">{course.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
                    <span><i className="fas fa-star mr-1 text-amber-300" aria-hidden="true" />{Number(course.rating || 0).toFixed(1)} ({course.totalRatings || 0} ratings)</span>
                    <span><i className="fas fa-users mr-1" aria-hidden="true" />{course.totalEnrollments || 0} enrolled</span>
                    <span><i className="fas fa-clock mr-1" aria-hidden="true" />{course.estimatedDuration || 'Flexible'} hours</span>
                  </div>
                </div>
                <div className="flex h-56 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-7xl backdrop-blur-sm" aria-hidden="true">
                  {course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full rounded-2xl object-cover" /> : getCategoryEmoji(course.category)}
                </div>
              </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-8">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-xl font-extrabold">What you&apos;ll learn</h2>
                  {course.objectives?.length ? (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {course.objectives.map((objective) => (
                        <li key={objective} className="flex items-start gap-3 text-slate-700">
                          <i className="fas fa-circle-check mt-1 text-green-600" aria-hidden="true" />
                          {objective}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 leading-7 text-slate-600">{course.description}</p>
                  )}
                  <p className="mt-6 text-sm text-slate-500">
                    {course.totalLessonCount || 0} lessons · {course.language}
                  </p>
                </article>

                <article className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <Avatar name={course.teacher?.name || 'Teacher'} imageUrl={course.teacher?.profilePhoto} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Created by</p>
                    <h2 className="mt-1 text-lg font-extrabold">{course.teacher?.name || 'Barakah Academy teacher'}</h2>
                  </div>
                </article>
              </div>

              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                <p className="text-sm font-semibold text-slate-500">Course access</p>
                {course.isFree ? (
                  <p className="mt-2 text-2xl font-extrabold text-green-700">Free</p>
                ) : (
                  <div className="mt-2">
                    {(() => {
                      const pricing = getCoursePricing(course.price, course.discountPercentage)
                      return (
                        <>
                          <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(pricing.discountedPrice, course.currency)}</p>
                          {pricing.discountPercentage > 0 && (
                            <p className="mt-1 text-sm text-slate-500">
                              <span className="line-through">{formatCurrency(pricing.originalPrice, course.currency)}</span>
                              <span className="ml-2 font-semibold text-green-700">{pricing.discountPercentage}% off</span>
                            </p>
                          )}
                        </>
                      )
                    })()}
                    {/* A small course preview lowers the barrier for visitors to try a paid learning path. */}
                    <p className="mt-3 text-sm leading-6 text-slate-500">Try the first 20% of the course before deciding to continue.</p>
                  </div>
                )}
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={beginEnrollment}
                  className="mt-6 w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {authLoading ? 'Checking account…' : user?.role === 'student' ? 'Enroll in course' : 'Log in to enroll'}
                </button>
                {!user && <p className="mt-3 text-center text-xs text-slate-500">You can browse course details without an account.</p>}
              </aside>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default CourseDetailPage
