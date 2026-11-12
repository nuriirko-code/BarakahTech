import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import { liveRoomPath } from '../../config/live'

const localDateTime = (date) => new Date(date).toLocaleString(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const WeeklyMentorship = ({ hasFullyEnrolledCourses, courseId, compact = false }) => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busySessionId, setBusySessionId] = useState('')

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/community/mentorship/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSessions(response.data.sessions || [])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load weekly mentorship sessions.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (hasFullyEnrolledCourses) loadSessions()
  }, [hasFullyEnrolledCourses, loadSessions])

  const visibleSessions = useMemo(() => {
    const filtered = courseId
      ? sessions.filter((session) => String(session.course?._id) === String(courseId))
      : [...sessions]
    return filtered.sort((first, second) => new Date(first.startsAt) - new Date(second.startsAt))
  }, [courseId, sessions])

  const reserveSeat = async (sessionId) => {
    setBusySessionId(sessionId)
    setError('')
    try {
      await axios.post(
        `${API_BASE_URL}/community/${sessionId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await loadSessions()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reserve your mentorship seat.')
    } finally {
      setBusySessionId('')
    }
  }

  const heading = compact ? 'This week’s mentorship' : 'Weekly Mentorship'

  return (
    <section className={`rounded-2xl border border-emerald-100 bg-white shadow-sm ${compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden="true">
          <i className="fas fa-chalkboard-user" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{heading}</h2>
          {!compact && <p className="mt-1 text-sm text-slate-500">Live sessions hosted by your course teachers.</p>}
        </div>
      </div>

      {hasFullyEnrolledCourses === false ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Enroll in a course to join its weekly mentorship.</p>
          {!compact && <Link to="/dashboard/student/browse" className="mt-3 inline-flex font-bold text-emerald-700 hover:underline">Browse courses</Link>}
        </div>
      ) : loading ? (
        <div className="mt-5 space-y-3" role="status" aria-label="Loading mentorship sessions">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          {!compact && <div className="h-20 animate-pulse rounded-xl bg-slate-100" />}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p role="alert" className="text-sm text-red-800">{error}</p>
          <button type="button" onClick={loadSessions} className="mt-3 text-sm font-bold text-red-800 underline">Try again</button>
        </div>
      ) : visibleSessions.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          {courseId ? 'No upcoming mentorship is scheduled for this course yet.' : 'No upcoming mentorship sessions are scheduled yet.'}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {(compact ? visibleSessions.slice(0, 1) : visibleSessions).map((session) => (
            <article key={session._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                {!compact && <p className="truncate font-bold text-slate-900">{session.course?.title || 'Course mentorship'}</p>}
                <p className="mt-1 truncate text-sm font-semibold text-slate-800">{session.title}</p>
                <p className="mt-1 text-sm text-slate-600">{session.hostUser?.name || session.facilitatorName} · {localDateTime(session.startsAt)}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{session.seatsLeft} seats left</p>
              </div>
              {session.isRegistered ? (
                <button type="button" onClick={() => navigate(liveRoomPath('community', session._id))} className="shrink-0 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
                  Join
                </button>
              ) : (
                <button
                  type="button"
                  disabled={session.seatsLeft <= 0 || busySessionId === session._id}
                  onClick={() => reserveSeat(session._id)}
                  className="shrink-0 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busySessionId === session._id ? 'Reserving…' : session.seatsLeft <= 0 ? 'Session full' : 'Reserve my seat'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default WeeklyMentorship
