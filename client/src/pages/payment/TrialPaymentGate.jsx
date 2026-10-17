import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Avatar from '../../components/common/Avatar'
import { formatCurrency } from '../../utils/currencyUtils'

const TrialPaymentGate = () => {
  const { courseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [course, setCourse] = useState(location.state?.course || null)
  const [loading, setLoading] = useState(!location.state?.course)

  useEffect(() => {
    if (location.state?.course) return undefined

    let isCurrent = true

    const loadCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`)
        if (isCurrent) setCourse(response.data.course || response.data)
      } catch {
        if (isCurrent) setCourse(null)
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadCourse()
    return () => {
      isCurrent = false
    }
  }, [courseId, location.state])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-4xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="mt-6 h-10 w-2/3 rounded bg-slate-200" />
          <div className="mt-6 h-64 rounded-2xl bg-slate-200" />
        </div>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <i className="fas fa-circle-exclamation text-4xl text-amber-600" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Course unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">This course could not be loaded right now.</p>
          <button type="button" onClick={() => navigate('/dashboard/student/courses')} className="mt-5 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-800">
            Back to My Learning
          </button>
        </section>
      </main>
    )
  }

  const completedLessons = 3
  const progressValue = Math.min(100, Math.round((completedLessons / Math.max(course.lessons?.length || 1, 1)) * 100))
  const totalLessons = course.lessons?.length || 0

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl text-amber-700">
              <i className="fas fa-trophy" aria-hidden="true" />
            </span>
          </div>
          <h1 className="mt-5 text-center text-3xl font-extrabold tracking-tight text-slate-900">You have completed your free preview!</h1>
          <p className="mt-2 text-center text-base text-slate-600">Here is what you experienced so far:</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <ul className="space-y-3 text-sm font-medium text-slate-700">
                {[1, 2, 3].map((lessonNumber) => (
                  <li key={lessonNumber} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <i className="fas fa-check text-[10px]" aria-hidden="true" />
                    </span>
                    <span>Completed lesson {lessonNumber}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Trial progress</span>
                <span>{progressValue}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${progressValue}%` }} />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                You have already made strong progress. Full access unlocks the rest of the course and direct support from your teacher.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-extrabold text-slate-900">Unlock the full course</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-3xl text-white">
                  <i className="fas fa-graduation-cap" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-500">Course</p>
                  <h3 className="mt-1 text-xl font-extrabold text-slate-900">{course.title}</h3>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <Avatar name={course.teacher?.name || 'Teacher'} size="md" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teacher</p>
                  <p className="text-sm font-bold text-slate-900">{course.teacher?.name || 'BarakahTech Teacher'}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Lessons</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{totalLessons}</p>
                </div>
                <div className="rounded-xl bg-white p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Duration</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">{course.estimatedDuration || 'N/A'}h</p>
                </div>
                <div className="rounded-xl bg-white p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Certificate</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">Included</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <ul className="space-y-4 text-sm text-slate-700">
                {[
                  `Access to all ${totalLessons} lessons`,
                  'Direct messaging with your teacher',
                  'Weekly live mentorship sessions',
                  'Lesson assessments and coding challenges',
                  'Course completion certificate',
                  'Lifetime access to course content',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <i className="fas fa-check text-[10px]" aria-hidden="true" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                <p className="text-4xl font-black text-slate-900">{formatCurrency(course.price, course.currency || 'ETB')}</p>
                <p className="mt-1 text-sm text-slate-600">One-time payment · Lifetime access</p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/checkout/course/${courseId}`)}
                className="mt-5 w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Enroll Now
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard/student/courses')}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go Back to My Learning
              </button>

              <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2"><i className="fas fa-shield-halved text-green-700" aria-hidden="true" /> Secure payment</div>
                <div className="flex items-center gap-2"><i className="fas fa-rotate-left text-amber-600" aria-hidden="true" /> Satisfaction guaranteed</div>
                <div className="flex items-center gap-2"><i className="fas fa-headset text-blue-700" aria-hidden="true" /> Support available</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TrialPaymentGate
