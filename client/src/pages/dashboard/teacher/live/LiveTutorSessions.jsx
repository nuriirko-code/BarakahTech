import API_BASE_URL from '../../../../config/api.js'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../context/AuthContext'


// Converts the tutor's own stored timezone into the session instant used by
// the live countdown, so a session remains accurate across timezones.
const getSessionStart = (booking) => {
  if (booking.startAt) return new Date(booking.startAt)
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

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`
}

const LiveTutorSessions = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now, setNow] = useState(0)
  const [completingId, setCompletingId] = useState('')
  const [isAnytimeTestMode, setIsAnytimeTestMode] = useState(false)

  useEffect(() => {
    const updateNow = () => setNow(Date.now())
    updateNow()
    const intervalId = window.setInterval(updateNow, 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let isCurrent = true
    let requestPending = false

    const loadBookings = async () => {
      if (requestPending || !token) return
      requestPending = true
      try {
        const response = await axios.get(`${API_BASE_URL}/bookings/my-sessions/tutor`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) {
          setBookings(response.data.bookings || [])
          setIsAnytimeTestMode(Boolean(response.data.isAnytimeTestMode))
          setError('')
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load your live sessions.')
      } finally {
        requestPending = false
        if (isCurrent) setLoading(false)
      }
    }

    if (!token) return () => { isCurrent = false }

    loadBookings()
    const refreshInterval = window.setInterval(loadBookings, 15000)
    window.addEventListener('focus', loadBookings)
    return () => {
      isCurrent = false
      window.clearInterval(refreshInterval)
      window.removeEventListener('focus', loadBookings)
    }
  }, [token])

  const markComplete = async (bookingId) => {
    if (!window.confirm('Mark this session as complete? The student will then be able to submit feedback.')) return

    setCompletingId(bookingId)
    setError('')
    try {
      const response = await axios.put(`${API_BASE_URL}/bookings/${bookingId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setBookings((current) => current.map((booking) => booking._id === bookingId ? response.data.booking : booking))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not mark this session complete.')
    } finally {
      setCompletingId('')
    }
  }

  if (loading) return <div className="space-y-4"><div className="h-28 animate-pulse rounded-2xl bg-slate-200" /><div className="h-48 animate-pulse rounded-2xl bg-slate-200" /></div>

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700"><i className="fas fa-video text-lg" aria-hidden="true" /></span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">Live tutoring</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Live Sessions</h1>
          <p className="mt-1 text-sm text-slate-600">{isAnytimeTestMode ? 'Local testing is enabled: all confirmed sessions can be joined anytime.' : 'Confirmed sessions include a countdown until it is time to meet your student.'}</p>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!error && bookings.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12"><i className="fas fa-video-slash text-4xl text-slate-300" aria-hidden="true" /><p className="mt-4 text-base font-semibold text-slate-800">No sessions yet.</p><p className="mt-2 text-sm text-slate-500">Free introductory and confirmed paid sessions will appear here.</p></div>}

      <div className="space-y-4">
        {bookings.map((booking) => {
          const isConfirmed = booking.status === 'confirmed'
          return (
            <article key={booking._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-900">Session with {booking.student?.name || 'your student'}</p>
                  {isAnytimeTestMode
                    ? <p className="mt-1 text-sm text-green-700">Available to join anytime (local testing)</p>
                    : <p className="mt-1 text-sm text-slate-600">{getSessionStart(booking).toLocaleString()} (your local time)</p>}
                  <p className="mt-1 text-sm text-slate-500">{booking.isTrialSession ? 'Free 30-minute introductory session' : `${booking.duration}-minute paid session`}</p>
                </div>
                <div className={`rounded-xl px-4 py-3 text-sm font-bold ${isConfirmed ? 'bg-green-50 text-green-800' : booking.status === 'pending_payment' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                  {isConfirmed ? (isAnytimeTestMode ? 'Available now' : formatCountdown(booking, now)) : booking.status.replace('_', ' ')}
                </div>
              </div>
              {isConfirmed && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => navigate(`/session/${booking._id}`)} className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700">
                    <i className="fas fa-video mr-2" aria-hidden="true" />Join session
                  </button>
                  {/* Completion deliberately requires a tutor action: only then
                      can the student make the feedback-based earnings decision. */}
                  <button type="button" onClick={() => markComplete(booking._id)} disabled={completingId === booking._id} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                    <i className="fas fa-circle-check mr-2 text-green-600" aria-hidden="true" />{completingId === booking._id ? 'Completing...' : 'Mark complete'}
                  </button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default LiveTutorSessions
