import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'
import { formatCurrency } from '../../../utils/currencyUtils'
import Avatar from '../../../components/common/Avatar'

const API_BASE_URL = 'http://localhost:5000/api'

// Convert the tutor's date, time, and timezone to one real instant. This keeps
// the join window accurate even when a student lives in another timezone.
const getSessionStart = (booking) => {
  const date = new Date(booking.sessionDate).toISOString().slice(0, 10)
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = String(booking.startTime).split(':').map(Number)
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: booking.timezone || 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(utcGuess))
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  const offset = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute)) - utcGuess
  return new Date(utcGuess - offset)
}

const formatSessionDate = (date) => new Date(date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const formatTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const statusStyles = {
  pending_payment: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-green-50 text-green-800 ring-green-200',
  completed: 'bg-blue-50 text-blue-800 ring-blue-200',
  cancelled: 'bg-red-50 text-red-800 ring-red-200',
}

const statusLabels = {
  pending_payment: 'Awaiting Payment Verification',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const StudentSessions = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    let isCurrent = true
    const loadBookings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bookings/my-sessions/student`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) setBookings(response.data.bookings || [])
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load your sessions.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadBookings()
    return () => { isCurrent = false }
  }, [token])

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 60000)
    return () => window.clearInterval(intervalId)
  }, [])

  // Upcoming contains confirmed or awaiting-verification sessions that have
  // not started. Past is intentionally limited to final completed/cancelled states.
  const upcomingBookings = bookings.filter((booking) => (
    ['confirmed', 'pending_payment'].includes(booking.status)
    && getSessionStart(booking).getTime() > now
  ))
  const pastBookings = bookings.filter((booking) => ['completed', 'cancelled'].includes(booking.status))
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  if (loading) return <section className="space-y-4 p-6 sm:p-8"><div className="h-36 animate-pulse rounded-2xl bg-slate-200" />{[1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-slate-200" />)}</section>

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
      <header className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-7 shadow-sm sm:p-9">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700"><i className="fas fa-video" aria-hidden="true" /></span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Live Sessions</h1>
        <p className="mt-2 max-w-xl leading-7 text-slate-600">Review your upcoming appointments, join sessions at the right time, and share feedback after learning.</p>
      </header>

      <div className="flex w-full gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-fit">
        {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([key, label]) => <button key={key} type="button" onClick={() => setActiveTab(key)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition sm:flex-none ${activeTab === key ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{label}</button>)}
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!error && displayedBookings.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><i className="fas fa-calendar-times text-4xl text-slate-300" aria-hidden="true" /><p className="mt-4 text-lg font-bold text-slate-800">No sessions yet</p><p className="mt-2 text-sm leading-6 text-slate-500">{activeTab === 'upcoming' ? 'Find a tutor and book a session that fits your learning goals.' : 'Completed and cancelled sessions will appear here.'}</p>{activeTab === 'upcoming' && <button type="button" onClick={() => navigate('/dashboard/student/find-tutor')} className="mt-6 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700">Find a Tutor</button>}</div>}

      <div className="space-y-4">
        {displayedBookings.map((booking) => {
          const sessionStart = getSessionStart(booking)
          const minutesUntilStart = Math.floor((sessionStart.getTime() - now) / 60000)
          // Joining opens 30 minutes before the lesson and stays available while
          // the planned lesson duration is still running, preventing wrong-time joins.
          const canJoin = booking.status === 'confirmed' && minutesUntilStart <= 30 && minutesUntilStart >= -Number(booking.duration || 0)
          const feedbackAvailable = booking.status === 'completed' && !booking.feedbackSubmitted
          const style = statusStyles[booking.status] || 'bg-slate-100 text-slate-700 ring-slate-200'
          const label = statusLabels[booking.status] || booking.status.replaceAll('_', ' ')

          return (
            <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3"><Avatar name={booking.tutor?.name || 'Tutor'} imageUrl={booking.tutorProfile?.profilePhoto} size="md" /><div className="min-w-0"><h2 className="truncate font-extrabold text-slate-900">{booking.tutor?.name || 'Your tutor'}</h2><p className="mt-1 text-sm font-semibold text-green-700">{booking.subject || 'Live tutoring'}</p><p className="mt-2 text-sm leading-6 text-slate-600">{formatSessionDate(booking.sessionDate)} · {formatTime(booking.startTime)} — {formatTime(booking.endTime)}</p></div></div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${style}`}>{label}</span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm"><span className="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700"><i className="fas fa-clock mr-2 text-slate-400" aria-hidden="true" />{booking.duration} min</span><span className="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700"><i className="fas fa-tag mr-2 text-slate-400" aria-hidden="true" />{Number(booking.price) === 0 ? 'Free introductory session' : formatCurrency(booking.price, booking.currency)}</span></div>
              <div className="mt-5 flex flex-wrap gap-3">
                {booking.status === 'confirmed' && <button type="button" disabled={!canJoin} title={canJoin ? 'Join your live session' : 'Available 30 minutes before the session'} onClick={() => navigate(`/session/${booking._id}`)} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"><i className="fas fa-video mr-2" aria-hidden="true" />Join Session</button>}
                {booking.status === 'pending_payment' && <button type="button" disabled className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-500">Payment Pending</button>}
                {feedbackAvailable && <button type="button" onClick={() => navigate(`/session/${booking._id}/feedback`)} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600"><i className="fas fa-star mr-2" aria-hidden="true" />Submit Feedback</button>}
                {booking.status === 'completed' && booking.feedbackSubmitted && <button type="button" disabled className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700"><i className="fas fa-circle-check mr-2" aria-hidden="true" />Feedback Submitted</button>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default StudentSessions
