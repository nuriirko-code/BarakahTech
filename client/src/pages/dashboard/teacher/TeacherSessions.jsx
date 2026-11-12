import API_BASE_URL from '../../../config/api'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'
import { liveRoomPath } from '../../../config/live'
import { useNavigate } from 'react-router-dom'

const initialForm = {
  courseId: '',
  title: '',
  description: '',
  startsAt: '',
  durationMinutes: '60',
  capacity: '10',
}

const formatDate = (date) => new Date(date).toLocaleString(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const TeacherSessions = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [loadedAt, setLoadedAt] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [participants, setParticipants] = useState({})
  const [participantsLoading, setParticipantsLoading] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [courseResponse, sessionsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses/teacher/my-courses`, { headers }),
        axios.get(`${API_BASE_URL}/community/mentorship/mine`, { headers }),
      ])
      setCourses((courseResponse.data.courses || []).filter((course) => course.status === 'published'))
      setSessions(sessionsResponse.data.sessions || [])
      setLoadedAt(Date.now())
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load weekly mentorship.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const nextSevenDays = useMemo(() => {
    const now = loadedAt
    const weekLater = now + 7 * 24 * 60 * 60 * 1000
    return sessions.filter((session) => (
      ['scheduled', 'live'].includes(session.status)
      && new Date(session.startsAt).getTime() >= now
      && new Date(session.startsAt).getTime() <= weekLater
    ))
  }, [loadedAt, sessions])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const schedule = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      const response = await axios.post(
        `${API_BASE_URL}/community/mentorship`,
        {
          ...form,
          startsAt: new Date(form.startsAt).toISOString(),
          durationMinutes: Number(form.durationMinutes),
          capacity: Number(form.capacity),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setNotice(response.data.warning || 'Mentorship scheduled successfully.')
      setForm(initialForm)
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to schedule the mentorship session.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (session, status) => {
    setError('')
    setNotice('')
    try {
      await axios.put(
        `${API_BASE_URL}/community/${session._id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      await loadData()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this mentorship session.')
    }
  }

  const toggleParticipants = async (sessionId) => {
    if (participants[sessionId]) {
      setParticipants((current) => ({ ...current, [sessionId]: null }))
      return
    }
    setParticipantsLoading(sessionId)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/community/${sessionId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setParticipants((current) => ({ ...current, [sessionId]: response.data.participants || [] }))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load session participants.')
    } finally {
      setParticipantsLoading('')
    }
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Teacher dashboard</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Weekly Mentorship</h1>
        <p className="mt-2 text-slate-500">Schedule and host a live session for students in your published courses.</p>
      </header>

      <aside className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <i className="fas fa-circle-info mt-1 text-amber-700" aria-hidden="true" />
        <p className="font-semibold">Barakah Academy rule: every course teacher holds one live mentorship session each week for their students.</p>
      </aside>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Your next 7 days</h2>
            <p className="mt-1 text-sm text-slate-500">Scheduled or live mentorship sessions this week.</p>
          </div>
          <span className="rounded-xl bg-emerald-50 px-4 py-2 text-lg font-black text-emerald-800">{loading ? '…' : nextSevenDays.length}</span>
        </div>
        {!loading && nextSevenDays.length === 0 && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No mentorship session is scheduled in the next 7 days.</p>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-extrabold text-slate-900">Schedule a session</h2>
        <p className="mt-1 text-sm text-slate-500">Choose one of your published courses and invite its fully enrolled students.</p>
        {loading ? (
          <div className="mt-5 h-36 animate-pulse rounded-xl bg-slate-100" role="status" aria-label="Loading courses" />
        ) : courses.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Publish a course before scheduling its weekly mentorship.</div>
        ) : (
          // Course teachers schedule sessions for their own learners, instead of relying on an administrator to coordinate every cohort.
          <form onSubmit={schedule} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Published course
              <select required name="courseId" value={form.courseId} onChange={updateForm} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                <option value="">Select a course</option>
                {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Session title
              <input required maxLength={120} name="title" value={form.title} onChange={updateForm} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">
              Description
              <textarea required maxLength={2000} rows={3} name="description" value={form.description} onChange={updateForm} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Date and time
              <input required type="datetime-local" name="startsAt" value={form.startsAt} onChange={updateForm} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Duration
              <select name="durationMinutes" value={form.durationMinutes} onChange={updateForm} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
                {[30, 45, 60].map((duration) => <option key={duration} value={duration}>{duration} minutes</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Capacity (1–10 students)
              <input required type="number" min="1" max="10" name="capacity" value={form.capacity} onChange={updateForm} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </label>
            <div className="flex items-end">
              <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">
                <i className="fas fa-calendar-plus" aria-hidden="true" />{submitting ? 'Scheduling…' : 'Schedule a session'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Your mentorship sessions</h2>
          <p className="mt-1 text-sm text-slate-500">Start the room, manage participants, and complete each session here.</p>
        </div>
        {loading ? (
          <div className="space-y-3" role="status" aria-label="Loading mentorship sessions">
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        ) : !error && sessions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">You haven’t scheduled any mentorship sessions yet.</div>
        ) : sessions.map((session) => (
          <article key={session._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{session.course?.title || 'Course mentorship'}</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">{session.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{formatDate(session.startsAt)} · {session.durationMinutes} min</p>
                <p className="mt-2 text-sm text-slate-600">{session.participantCount} / {session.capacity} participants · <span className="font-bold capitalize">{session.status.replaceAll('_', ' ')}</span></p>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.status === 'scheduled' && (
                  <button type="button" onClick={() => updateStatus(session, 'live')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800">Start</button>
                )}
                {['scheduled', 'live'].includes(session.status) && (
                  <button type="button" onClick={() => navigate(liveRoomPath('community', session._id))} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-bold text-white hover:bg-green-700">Join</button>
                )}
                <button type="button" disabled={participantsLoading === session._id} onClick={() => toggleParticipants(session._id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  {participantsLoading === session._id ? 'Loading…' : participants[session._id] ? 'Hide participants' : 'Participants'}
                </button>
                {['scheduled', 'live'].includes(session.status) && (
                  <button type="button" onClick={() => updateStatus(session, 'completed')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Complete</button>
                )}
              </div>
            </div>
            {participants[session._id] && (
              <ul className="mt-4 divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">
                {participants[session._id].length
                  ? participants[session._id].map((participant, index) => <li key={participant.user?._id || index} className="py-3 text-sm text-slate-700">{participant.user?.name || 'Student'}</li>)
                  : <li className="py-3 text-sm text-slate-500">No students have reserved a seat yet.</li>}
              </ul>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}

export default TeacherSessions
