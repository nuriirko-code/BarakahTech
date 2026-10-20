import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currencyUtils'
import Avatar from '../../components/common/Avatar'

const paymentMethods = [
  { id: 'telebirr', title: 'Telebirr', icon: 'fas fa-mobile-screen-button', style: 'bg-green-50 text-green-700' },
  { id: 'cbe_birr', title: 'CBE Birr', icon: 'fas fa-building-columns', style: 'bg-blue-50 text-blue-700' },
  { id: 'other_mobile', title: 'Other Mobile Money', icon: 'fas fa-wallet', style: 'bg-violet-50 text-violet-700' },
]
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const tomorrowString = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
}
const toMinutes = (time) => { const [hours, minutes] = String(time || '').split(':').map(Number); return (hours * 60) + minutes }
const toTime = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const readableTime = (time) => new Date(`2000-01-01T${time}:00`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

// The staged layout mirrors course checkout: session details create the held
// booking, payment sends proof, and confirmation explains the admin review state.
const BookingPage = () => {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [stage, setStage] = useState('details')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [bookingForm, setBookingForm] = useState({ subject: '', sessionDate: '', startTime: '', duration: 60, studentGoals: '', studentLevel: 'beginner' })
  const [paymentForm, setPaymentForm] = useState({ selectedMethod: '', referenceNumber: '', studentNote: '' })

  useEffect(() => {
    let isCurrent = true
    const loadTutor = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/live-tutors/profile/${profileId}`)
        if (isCurrent) {
          const tutorProfile = response.data.profile
          const offeredDurations = tutorProfile.sessionDurations || []

          setProfile(tutorProfile)
          setAvailability(response.data.availability)

          // A tutor can choose not to offer 60-minute sessions. Select their
          // first valid duration so the form never starts with an unavailable option.
          setBookingForm((current) => ({
            ...current,
            duration: offeredDurations.includes(60) ? 60 : (offeredDurations[0] || 60),
          }))
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load this tutor for booking.')
      } finally { if (isCurrent) setLoading(false) }
    }
    loadTutor()
    return () => { isCurrent = false }
  }, [profileId])

  const selectedSlot = useMemo(() => {
    if (!bookingForm.sessionDate) return null
    const date = new Date(`${bookingForm.sessionDate}T12:00:00`)
    return availability?.weeklySlots?.find((slot) => slot.day === dayNames[date.getDay()] && slot.isActive !== false) || null
  }, [availability, bookingForm.sessionDate])

  // Time buttons are generated every hour from the tutor’s active daily slot.
  // We stop before the end so the selected session duration always fits inside it.
  const availableTimes = useMemo(() => {
    if (!selectedSlot) return []
    const start = toMinutes(selectedSlot.startTime)
    const end = toMinutes(selectedSlot.endTime)
    const duration = Number(bookingForm.duration)
    const times = []
    for (let current = start; current + duration <= end; current += 60) times.push(toTime(current))
    return times
  }, [selectedSlot, bookingForm.duration])

  const calculatePrice = () => Number((((Number(profile?.hourlyRate) || 0) / 60) * Number(bookingForm.duration || 0)).toFixed(2))
  const updateBooking = (field, value) => { setBookingForm((current) => ({ ...current, [field]: value })); setError('') }

  const handleDateChange = (date) => {
    updateBooking('sessionDate', date)
    setBookingForm((current) => ({ ...current, sessionDate: date, startTime: '' }))
  }

  const handleCreateBooking = async () => {
    if (!bookingForm.subject.trim() || !bookingForm.sessionDate || !bookingForm.startTime || !bookingForm.duration) {
      setError('Complete the subject, date, start time, and duration before continuing.')
      return
    }
    if (!selectedSlot || !availableTimes.includes(bookingForm.startTime)) {
      setError('Choose a date and time when this tutor is available.')
      return
    }
    setSubmitting(true); setError('')
    try {
      const response = await axios.post(`http://localhost:5000/api/bookings/tutor/${profileId}`, bookingForm, { headers: { Authorization: `Bearer ${token}` } })
      setBooking(response.data.booking)
      setStage('payment')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not create this booking.') }
    finally { setSubmitting(false) }
  }

  const handleSubmitPayment = async () => {
    if (!paymentForm.selectedMethod || !paymentForm.referenceNumber.trim()) {
      setError('Choose a payment method and enter your payment transaction ID.')
      return
    }
    setSubmitting(true); setError('')
    try {
      await axios.post(`http://localhost:5000/api/bookings/${booking._id}/confirm-payment`, {
        paymentMethod: paymentForm.selectedMethod,
        manualPaymentReference: paymentForm.referenceNumber.trim(),
        studentNote: paymentForm.studentNote.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } })
      setStage('confirmation')
    } catch (requestError) { setError(requestError.response?.data?.message || 'Could not submit your payment confirmation.') }
    finally { setSubmitting(false) }
  }

  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@barakahtech.com'
  const paymentDestination = paymentForm.selectedMethod === 'telebirr'
    ? (import.meta.env.VITE_TELEBIRR_NUMBER || `Payment number is not configured. Contact ${supportEmail}.`)
    : paymentForm.selectedMethod === 'cbe_birr'
      ? (import.meta.env.VITE_CBE_ACCOUNT || `CBE account is not configured. Contact ${supportEmail}.`)
      : `Contact ${supportEmail} for payment details.`
  const paymentCode = booking?.payment?.platformPaymentCode

  if (loading) return <main className="min-h-screen bg-slate-50 px-5 py-10"><div className="mx-auto h-96 max-w-xl animate-pulse rounded-2xl bg-slate-200" /></main>
  if (!profile) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><p className="text-red-700">{error || 'Tutor profile not found.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-5 font-bold text-[#15803D] hover:underline">Go back</button></section></main>

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><div className="mx-auto max-w-xl"><button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"><i className="fas fa-arrow-left" aria-hidden="true" />Back to profile</button>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Avatar name={profile.user?.name || 'Tutor'} imageUrl={profile.profilePhoto} size="lg" /><div><p className="font-extrabold text-slate-900">{profile.user?.name || 'Qualified tutor'}</p><p className="mt-1 text-sm text-slate-500">{(profile.subjects || []).slice(0, 3).join(' · ')}</p><p className="mt-1 text-sm font-bold text-[#15803D]">{formatCurrency(profile.hourlyRate, profile.currency)}/hour</p></div></div></section>
    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><i className="fas fa-circle-exclamation mr-2" aria-hidden="true" />{error}</div>}

    {stage === 'details' && <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h1 className="text-2xl font-extrabold tracking-tight">Book a Session</h1><div className="mt-6 space-y-5"><label className="block text-sm font-bold text-slate-800">What do you want to learn?<input value={bookingForm.subject} onChange={(event) => updateBooking('subject', event.target.value)} placeholder="e.g. JavaScript fundamentals, Python for beginners" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" /></label><label className="block text-sm font-bold text-slate-800">Session Date<input type="date" min={tomorrowString()} value={bookingForm.sessionDate} onChange={(event) => handleDateChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" /><span className="mt-2 block text-xs font-normal text-slate-500">Only days included in this tutor’s published schedule can be booked.</span></label><div><p className="text-sm font-bold text-slate-800">Start Time</p>{!bookingForm.sessionDate ? <p className="mt-2 text-sm text-slate-500">Choose a date to see available times.</p> : !selectedSlot ? <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This tutor is not available on that day. Choose another date.</p> : <div className="mt-3 flex flex-wrap gap-2">{availableTimes.map((time) => <button key={time} type="button" onClick={() => updateBooking('startTime', time)} className={`rounded-xl border px-3 py-2 text-sm font-bold ${bookingForm.startTime === time ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50'}`}>{readableTime(time)}</button>)}</div>}</div><div><p className="text-sm font-bold text-slate-800">Session Duration</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{(profile.sessionDurations || []).map((duration) => <button key={duration} type="button" onClick={() => { updateBooking('duration', duration); updateBooking('startTime', '') }} className={`rounded-xl border p-4 text-left ${Number(bookingForm.duration) === Number(duration) ? 'border-[#22C55E] bg-[#F0FDF4] ring-1 ring-[#22C55E]/20' : 'border-slate-200 hover:border-[#22C55E]/50'}`}><span className="block font-bold text-slate-900">{duration} minutes</span><span className="mt-1 block text-sm font-semibold text-[#15803D]">{formatCurrency((Number(profile.hourlyRate) / 60) * duration, profile.currency)}</span></button>)}</div></div><label className="block text-sm font-bold text-slate-800">What are your goals for this session? <span className="font-normal text-slate-500">(Optional)</span><textarea value={bookingForm.studentGoals} onChange={(event) => updateBooking('studentGoals', event.target.value)} rows="4" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-base font-normal outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" /></label><div><p className="text-sm font-bold text-slate-800">Your Current Level</p><div className="mt-3 grid grid-cols-3 gap-2">{['beginner', 'intermediate', 'advanced'].map((level) => <button key={level} type="button" onClick={() => updateBooking('studentLevel', level)} className={`rounded-xl border px-2 py-3 text-sm font-bold capitalize ${bookingForm.studentLevel === level ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600'}`}>{level}</button>)}</div></div><div className="rounded-2xl border border-green-200 bg-[#F0FDF4] p-5"><div className="flex justify-between text-sm text-slate-600"><span>Session</span><span>{bookingForm.duration} minutes</span></div><div className="mt-2 flex justify-between text-sm text-slate-600"><span>Rate</span><span>{formatCurrency(profile.hourlyRate, profile.currency)}/hour</span></div><div className="mt-3 flex justify-between border-t border-green-200 pt-3 text-lg font-extrabold text-slate-900"><span>Total</span><span className="text-[#15803D]">{formatCurrency(calculatePrice(), profile.currency)}</span></div><button type="button" onClick={handleCreateBooking} disabled={submitting || !availability?.isAcceptingBookings} className="mt-5 w-full rounded-xl bg-[#16A34A] px-5 py-3.5 font-bold text-white hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-slate-300">{submitting ? 'Creating booking...' : 'Proceed to Payment'}</button></div></div></section>}

    {stage === 'payment' && <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h1 className="text-2xl font-extrabold tracking-tight">Complete Payment</h1><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><p><span className="font-semibold">Session:</span> {booking.sessionDate.slice(0, 10)} at {readableTime(booking.startTime)}</p><p className="mt-2"><span className="font-semibold">Duration:</span> {booking.duration} minutes</p><p className="mt-2 text-lg font-extrabold text-[#15803D]">{formatCurrency(booking.price, booking.currency)}</p></div><div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Platform payment code</p><code className="mt-2 block break-all text-lg font-extrabold tracking-wider text-slate-900">{paymentCode}</code><p className="mt-2 text-xs text-slate-600">Use this code as your payment reference so we can match your transfer.</p></div><p className="mt-6 text-sm font-bold text-slate-800">Choose payment method</p><div className="mt-3 grid gap-3">{paymentMethods.map((method) => <button key={method.id} type="button" onClick={() => setPaymentForm((current) => ({ ...current, selectedMethod: method.id }))} className={`flex items-center gap-3 rounded-xl border p-4 text-left ${paymentForm.selectedMethod === method.id ? 'border-[#22C55E] bg-[#F0FDF4]' : 'border-slate-200 hover:border-[#22C55E]/50'}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${method.style}`}><i className={method.icon} aria-hidden="true" /></span><span className="font-bold text-slate-900">{method.title}</span></button>)}<div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-left text-slate-400"><i className="fas fa-credit-card" aria-hidden="true" /><span className="font-bold">Card payments coming soon</span></div></div>{paymentForm.selectedMethod && <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4"><p className="text-sm leading-6 text-slate-700">Send <strong>{formatCurrency(booking.price, booking.currency)}</strong> to: <strong className="break-all">{paymentDestination}</strong></p><label className="block text-sm font-bold text-slate-800">Transaction ID<input value={paymentForm.referenceNumber} onChange={(event) => setPaymentForm((current) => ({ ...current, referenceNumber: event.target.value }))} placeholder="e.g. TXN123456789" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#22C55E]" /></label><label className="block text-sm font-bold text-slate-800">Note <span className="font-normal text-slate-500">(Optional)</span><textarea value={paymentForm.studentNote} onChange={(event) => setPaymentForm((current) => ({ ...current, studentNote: event.target.value }))} rows="3" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-[#22C55E]" /></label><button type="button" onClick={handleSubmitPayment} disabled={submitting} className="w-full rounded-xl bg-[#16A34A] px-5 py-3.5 font-bold text-white hover:bg-[#15803D] disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Payment Confirmation'}</button></div>}</section>}

    {stage === 'confirmation' && <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0FDF4] text-3xl text-[#16A34A]"><i className="fas fa-circle-check" aria-hidden="true" /></span><h1 className="mt-5 text-2xl font-extrabold">Session Booking Submitted!</h1><p className="mt-3 leading-7 text-slate-600">Your payment is being verified. Once confirmed, your session with {profile.user?.name || 'your tutor'} on {booking.sessionDate.slice(0, 10)} at {readableTime(booking.startTime)} will be confirmed.</p><p className="mt-3 text-sm text-slate-500">We will notify you by email when your session is confirmed.</p><button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="mt-6 rounded-xl bg-[#16A34A] px-5 py-3 font-bold text-white hover:bg-[#15803D]">View My Sessions</button></section>}
  </div></main>
}

export default BookingPage
