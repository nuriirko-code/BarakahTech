import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currencyUtils'
import Avatar from '../../components/common/Avatar'

const paymentMethods = [
  { id: 'telebirr', title: 'Telebirr', icon: 'fas fa-mobile-screen-button', style: 'bg-green-50 text-green-700' },
  { id: 'cbe_birr', title: 'CBE Birr', icon: 'fas fa-building-columns', style: 'bg-blue-50 text-blue-700' },
  { id: 'other_mobile', title: 'Other mobile money', icon: 'fas fa-wallet', style: 'bg-violet-50 text-violet-700' },
]

const readableTime = (instant) => new Date(instant).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const readableWallTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
const readableDate = (instant) => new Date(instant).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
const getRecurringAppointmentOptions = (appointments, duration) => {
  const optionsByWeeklyTime = new Map()

  appointments.forEach((appointment) => {
    const startsAt = new Date(appointment.startAt)
    const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000)
    const day = startsAt.toLocaleDateString([], { weekday: 'long' })
    const startTime = readableTime(startsAt)
    const endTime = readableTime(endsAt)
    const key = `${day}|${startTime}|${endTime}`

    if (!optionsByWeeklyTime.has(key)) {
      optionsByWeeklyTime.set(key, {
        ...appointment,
        day,
        displayStartTime: startTime,
        displayEndTime: endTime,
      })
    }
  })

  return [...optionsByWeeklyTime.values()]
}
const formatCountdown = (milliseconds) => {
  if (milliseconds <= 0) return 'Starting now'
  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

// The page shows real upcoming appointments generated from the tutor's weekly
// schedule. A student selects one appointment, never an arbitrary time.
const BookingPage = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [offer, setOffer] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [now, setNow] = useState(0)
  const [booking, setBooking] = useState(null)
  const [stage, setStage] = useState('details')
  const [paymentForm, setPaymentForm] = useState({ selectedMethod: '', referenceNumber: '', studentNote: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    const loadBookingDetails = async () => {
      try {
        const [profileResponse, offerResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/live-tutors/profile/${profileId}`),
          axios.get(`${API_BASE_URL}/bookings/tutor/${profileId}/offer`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        if (isCurrent) {
          setProfile(profileResponse.data.profile)
          setOffer(offerResponse.data.offer)
          setAppointments(offerResponse.data.appointments || [])
          setNow(Date.now())
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load this booking.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    if (token) loadBookingDetails()
    return () => { isCurrent = false }
  }, [profileId, token])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const handleCreateBooking = async () => {
    if (!selectedAppointment) {
      setError('Choose an appointment offered by this tutor.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bookings/tutor/${profileId}`,
        { sessionDate: selectedAppointment.date, startTime: selectedAppointment.startTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setBooking(response.data.booking)
      setStage(response.data.requiresPayment ? 'payment' : 'confirmation')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create this booking.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitPayment = async () => {
    if (!paymentForm.selectedMethod || !paymentForm.referenceNumber.trim()) {
      setError('Choose a payment method and enter your payment transaction ID.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await axios.post(`${API_BASE_URL}/bookings/${booking._id}/confirm-payment`, {
        paymentMethod: paymentForm.selectedMethod,
        manualPaymentReference: paymentForm.referenceNumber.trim(),
        studentNote: paymentForm.studentNote.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } })
      setStage('confirmation')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your payment confirmation.')
    } finally {
      setSubmitting(false)
    }
  }

  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'nuriirko@gmail.com'
  const paymentDestination = paymentForm.selectedMethod === 'telebirr'
    ? (import.meta.env.VITE_TELEBIRR_NUMBER || `Contact ${supportEmail} for Telebirr details.`)
    : paymentForm.selectedMethod === 'cbe_birr'
      ? (import.meta.env.VITE_CBE_ACCOUNT || `Contact ${supportEmail} for CBE Birr details.`)
      : `Contact ${supportEmail} for payment details.`

  if (loading) return <main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto h-96 max-w-xl animate-pulse rounded-2xl bg-slate-200" /></main>
  if (!profile || !offer) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-red-700">{error || 'Tutor profile not found.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-5 font-bold text-green-700 hover:underline">Go back</button></section></main>

  const isTrial = offer.price === 0
  const bookingWasTrial = booking?.isTrialSession === true
  const recurringAppointmentOptions = getRecurringAppointmentOptions(appointments, offer.duration)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"><i className="fas fa-arrow-left" aria-hidden="true" />Back to profile</button>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Avatar name={profile.user?.name || 'Tutor'} imageUrl={profile.profilePhoto} size="lg" /><div><p className="font-extrabold text-slate-900">{profile.user?.name || 'Qualified tutor'}</p><p className="mt-1 text-sm text-slate-500">{(profile.subjects || []).slice(0, 3).join(' · ')}</p></div></div></section>
        {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><i className="fas fa-circle-exclamation mr-2" aria-hidden="true" />{error}</div>}

        {stage === 'details' && <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Book a Session</h1>
          <div className={`mt-5 rounded-2xl border p-5 ${isTrial ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-sm font-bold ${isTrial ? 'text-green-800' : 'text-slate-800'}`}>{offer.label}</p>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <p className="text-lg font-extrabold text-slate-900">{offer.duration}-minute session</p>
              <p className={`text-2xl font-extrabold ${isTrial ? 'text-green-700' : 'text-slate-900'}`}>
                {isTrial ? 'Free' : formatCurrency(offer.price, offer.currency)}
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {isTrial
                ? 'Your first 30-minute session with this tutor is free. Choose an available time to meet, discuss your needs, and decide whether to continue.'
                : 'This tutor has one fixed session duration and price. Payment is verified before the session is confirmed.'}
            </p>
          </div>
          <div className="mt-6">
            <h2 className="text-sm font-bold text-slate-800">Weekly availability</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              These times repeat every week and are shown in your local time. Choose a time to book its next upcoming occurrence.
            </p>
            {recurringAppointmentOptions.length === 0 ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                This tutor has no bookable appointments in the next two weeks. Please check again later or choose another tutor.
              </div>
            ) : (
              <div className="mt-4 grid max-h-[34rem] gap-3 overflow-y-auto pr-1">
                {recurringAppointmentOptions.map((appointment) => {
                  const selected = selectedAppointment?.id === appointment.id
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => { setSelectedAppointment(appointment); setError('') }}
                      className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${selected ? 'border-green-600 bg-green-50 ring-1 ring-green-200' : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'}`}
                    >
                      <span>
                        <span className="block font-bold text-slate-900">{appointment.day}</span>
                        <span className="mt-1 block text-sm text-slate-600">{appointment.displayStartTime} - {appointment.displayEndTime}</span>
                      </span>
                      {selected && <i className="fas fa-circle-check text-green-600" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            )}
            {selectedAppointment && (
              <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-800" role="status">
                The next {selectedAppointment.day} session starts in {formatCountdown(new Date(selectedAppointment.startAt).getTime() - now)}.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCreateBooking}
            disabled={submitting || !selectedAppointment}
            className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? 'Creating booking...' : isTrial ? 'Book Free Introductory Session' : `Continue to Pay ${formatCurrency(offer.price, offer.currency)}`}
          </button>
        </section>}

        {stage === 'payment' && <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Complete Payment</h1><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><p><span className="font-semibold">Appointment:</span> {booking.startAt ? `${readableDate(booking.startAt)} at ${readableTime(booking.startAt)}` : `${booking.sessionDate.slice(0, 10)} at ${readableWallTime(booking.startTime)}`}</p><p className="mt-2"><span className="font-semibold">Your amount:</span> {formatCurrency(booking.price, booking.currency)}</p></div><div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Platform payment code</p><code className="mt-2 block break-all text-lg font-extrabold tracking-wider text-slate-900">{booking.payment?.platformPaymentCode}</code><p className="mt-2 text-xs text-slate-600">Use this code as your payment reference so we can match your transfer.</p></div><p className="mt-6 text-sm font-bold text-slate-800">Choose payment method</p><div className="mt-3 grid gap-3">{paymentMethods.map((method) => <button key={method.id} type="button" onClick={() => setPaymentForm((current) => ({ ...current, selectedMethod: method.id }))} className={`flex items-center gap-3 rounded-xl border p-4 text-left ${paymentForm.selectedMethod === method.id ? 'border-green-600 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${method.style}`}><i className={method.icon} aria-hidden="true" /></span><span className="font-bold text-slate-900">{method.title}</span></button>)}</div>{paymentForm.selectedMethod && <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4"><p className="text-sm leading-6 text-slate-700">Send <strong>{formatCurrency(booking.price, booking.currency)}</strong> to <strong className="break-all">{paymentDestination}</strong>.</p><label className="block text-sm font-bold text-slate-800">Transaction ID<input value={paymentForm.referenceNumber} onChange={(event) => setPaymentForm((current) => ({ ...current, referenceNumber: event.target.value }))} placeholder="For example, TXN123456789" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-green-600" /></label><label className="block text-sm font-bold text-slate-800">Note <span className="font-normal text-slate-500">(optional)</span><textarea value={paymentForm.studentNote} onChange={(event) => setPaymentForm((current) => ({ ...current, studentNote: event.target.value }))} rows="3" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-green-600" /></label><button type="button" onClick={handleSubmitPayment} disabled={submitting} className="w-full rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white hover:bg-green-700 disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Payment Confirmation'}</button></div>}</section>}

        {stage === 'confirmation' && <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600"><i className="fas fa-circle-check" aria-hidden="true" /></span><h1 className="mt-5 text-2xl font-extrabold text-slate-900">{bookingWasTrial ? 'Your Free Session Is Confirmed' : 'Payment Submitted'}</h1><p className="mt-3 leading-7 text-slate-600">{bookingWasTrial ? `Your free introductory session with ${profile.user?.name || 'your tutor'} is confirmed. You can join from My Live Sessions starting 30 minutes before the scheduled time.` : 'Your payment is being verified. When it is approved, you and your tutor will receive confirmation and a session countdown.'}</p><button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"><i className="fas fa-calendar-check mr-2" aria-hidden="true" />View My Live Sessions</button></section>}
      </div>
    </main>
  )
}

export default BookingPage
