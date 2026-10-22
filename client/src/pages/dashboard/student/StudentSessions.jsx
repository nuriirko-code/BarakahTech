import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const API_BASE_URL = 'http://localhost:5000/api'

// Converts the tutor's date, time, and timezone into the real instant used by
// the countdown, even when the student lives in a different timezone.
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

const formatCountdown = (booking, now) => {
  const remaining = getSessionStart(booking).getTime() - now
  if (remaining <= 0) return 'Session time has arrived'

  const minutes = Math.floor(remaining / 60000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  return days > 0 ? `${days}d ${hours}h remaining` : `${hours}h ${minutes % 60}m remaining`
}

const StudentSessions = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(0)

  useEffect(() => {
    const updateNow = () => setNow(Date.now())
    updateNow()
    const intervalId = window.setInterval(updateNow, 60000)
    return () => window.clearInterval(intervalId)
  }, [])

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

  if (loading) return <section className="space-y-4 p-6 sm:p-8"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="h-48 animate-pulse rounded-2xl bg-slate-200" /></section>

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6 sm:p-8">
      <header className="rounded-2xl border border-green-100 bg-gradient-to-br from-white to-green-50 p-7 shadow-sm sm:p-9">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700"><i className="fas fa-video" aria-hidden="true" /></span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">My Sessions</h1>
        <p className="mt-2 max-w-xl leading-7 text-slate-600">Confirmed sessions show a countdown until it is time to meet your tutor.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!error && bookings.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><i className="fas fa-calendar-plus text-4xl text-slate-300" aria-hidden="true" /><p className="mt-4 font-semibold text-slate-800">No live sessions yet.</p><p className="mt-2 text-sm text-slate-500">Your booked and confirmed sessions will appear here.</p></div>}

      <div className="space-y-4">
        {bookings.map((booking) => {
          const isConfirmed = booking.status === 'confirmed'
          return (
            <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-900">Session with {booking.tutor?.name || 'your tutor'}</p>
                  <p className="mt-1 text-sm text-slate-600">{new Date(booking.sessionDate).toLocaleDateString()} at {booking.startTime} ({booking.timezone})</p>
                  <p className="mt-1 text-sm text-slate-500">{booking.isTrialSession ? 'Free 30-minute introductory session' : `${booking.duration}-minute paid session`}</p>
                </div>
                <div className={`rounded-xl px-4 py-3 text-sm font-bold ${isConfirmed ? 'bg-green-50 text-green-800' : booking.status === 'pending_payment' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                  {isConfirmed ? formatCountdown(booking, now) : booking.status.replace('_', ' ')}
                </div>
              </div>
              {booking.isTrialSession && booking.status !== 'cancelled' && booking.tutorProfile?._id && (
                <button type="button" onClick={() => navigate(`/book/${booking.tutorProfile._id}`)} className="mt-4 rounded-xl border border-green-200 px-4 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50">
                  Continue learning with this tutor
                </button>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default StudentSessions
