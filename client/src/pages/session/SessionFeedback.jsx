import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

const SessionFeedback = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    wasHelpful: null,
    comment: '',
    isPublic: false,
    wouldBookAgain: true,
  })

  useEffect(() => {
    let isCurrent = true
    const loadBooking = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) setBooking(response.data.booking)
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load this session.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadBooking()
    return () => { isCurrent = false }
  }, [bookingId, token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!feedbackForm.rating) {
      setError('Choose a star rating before submitting.')
      return
    }
    if (feedbackForm.wasHelpful === null) {
      setError('Tell us whether this session was helpful.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await axios.post(`${API_BASE_URL}/bookings/${bookingId}/feedback`, feedbackForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit your feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><i className="fas fa-spinner animate-spin text-3xl text-green-600" aria-hidden="true" /></main>
  if (error && !booking) return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5"><section className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"><i className="fas fa-circle-exclamation text-3xl text-red-500" aria-hidden="true" /><p className="mt-4 leading-7 text-slate-700">{error}</p><button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">Go to My Sessions</button></section></main>

  const tutorName = booking?.tutor?.name || 'your tutor'
  const sessionDate = booking?.sessionDate ? new Date(booking.sessionDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const isFreeTrial = booking?.isTrialSession || Number(booking?.price) === 0

  if (booking?.feedbackSubmitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600"><i className="fas fa-circle-check" aria-hidden="true" /></span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Feedback already submitted</h1>
          <p className="mt-3 leading-7 text-slate-600">Thank you for sharing your experience with {tutorName}.</p>
          <button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">Go to My Sessions</button>
        </section>
      </main>
    )
  }

  // The tutor confirms that the lesson actually ended before the student can
  // make the feedback decision that affects the booking's financial outcome.
  if (booking?.status !== 'completed') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl text-amber-600"><i className="fas fa-hourglass-half" aria-hidden="true" /></span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Waiting for session completion</h1>
          <p className="mt-3 leading-7 text-slate-600">{tutorName} needs to mark this session complete before you can submit feedback. Please return shortly.</p>
          <button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">Go to My Sessions</button>
        </section>
      </main>
    )
  }

  if (submitted) {
    const positive = feedbackForm.wasHelpful
    const successMessage = positive
      ? (isFreeTrial ? 'Thank you! Your feedback has been submitted. This introductory session was free, so no payment was needed.' : 'Thank you! Your feedback has been submitted and the tutor’s earnings have been approved for this session.')
      : (isFreeTrial ? 'Thank you for your feedback. No payment was taken for this introductory session.' : 'Thank you for your feedback. Your payment has been marked for refund processing.')

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600"><i className="fas fa-circle-check" aria-hidden="true" /></span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Feedback submitted</h1>
          <p className="mt-3 leading-7 text-slate-600">{successMessage}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => navigate('/dashboard/student/find-tutor')} className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">Book Another Session</button>
            <button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">Go to My Sessions</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <section className="mx-auto w-full max-w-lg">
        <button type="button" onClick={() => navigate('/dashboard/student/my-sessions')} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"><i className="fas fa-arrow-left" aria-hidden="true" />My Sessions</button>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3"><Avatar name={tutorName} imageUrl={booking?.tutorProfile?.profilePhoto} size="md" /><div><p className="font-extrabold text-slate-900">{tutorName}</p><p className="mt-0.5 text-sm text-slate-500">{booking?.subject || 'Live tutoring'} · {sessionDate}</p></div></div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">How was your session?</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your feedback helps us protect a fair learning experience for you and for tutors.</p>
          {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

          <fieldset className="mt-7"><legend className="text-sm font-bold text-slate-800">Your rating</legend><div className="mt-3 flex items-center gap-1" aria-label="Select a star rating">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => { setFeedbackForm((current) => ({ ...current, rating: value })); setError('') }} className={`h-11 w-11 rounded-lg text-2xl transition ${value <= feedbackForm.rating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300'}`} aria-label={`${value} star${value > 1 ? 's' : ''}`}><i className="fas fa-star" aria-hidden="true" /></button>)}</div>{feedbackForm.rating > 0 && <p className="mt-2 text-sm font-semibold text-amber-700">{feedbackForm.rating}/5 — {ratingLabels[feedbackForm.rating]}</p>}</fieldset>

          {/* Helpfulness is visually prominent because it is the consequential
              decision: it approves paid tutor earnings or records a refund. */}
          <fieldset className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5"><legend className="px-1 text-base font-extrabold text-slate-900">Was this session helpful and worth your time?</legend><p className="mt-2 text-sm leading-6 text-slate-600">Your answer determines the payment outcome for this session.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => { setFeedbackForm((current) => ({ ...current, wasHelpful: true })); setError('') }} className={`rounded-xl border-2 p-4 text-left transition ${feedbackForm.wasHelpful === true ? 'border-green-600 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'}`}><i className="fas fa-circle-check text-xl text-green-600" aria-hidden="true" /><span className="ml-2 font-bold text-slate-900">Yes, it was helpful</span></button><button type="button" onClick={() => { setFeedbackForm((current) => ({ ...current, wasHelpful: false })); setError('') }} className={`rounded-xl border-2 p-4 text-left transition ${feedbackForm.wasHelpful === false ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white hover:border-red-300'}`}><i className="fas fa-circle-xmark text-xl text-red-500" aria-hidden="true" /><span className="ml-2 font-bold text-slate-900">No, it was not helpful</span></button></div></fieldset>

          {feedbackForm.wasHelpful === false && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />Selecting No will mark this paid session for refund processing and the tutor will not receive its earnings. Choose it only if the session genuinely did not meet your expectations.</div>}

          <fieldset className="mt-7"><legend className="text-sm font-bold text-slate-800">Would you book this tutor again?</legend><div className="mt-3 inline-flex rounded-xl border border-slate-200 p-1"><button type="button" onClick={() => setFeedbackForm((current) => ({ ...current, wouldBookAgain: true }))} className={`rounded-lg px-4 py-2 text-sm font-bold ${feedbackForm.wouldBookAgain ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Yes</button><button type="button" onClick={() => setFeedbackForm((current) => ({ ...current, wouldBookAgain: false }))} className={`rounded-lg px-4 py-2 text-sm font-bold ${!feedbackForm.wouldBookAgain ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>No</button></div></fieldset>

          {/* Comments remain optional so the student can make the important
              financial decision quickly, while still having room for detail. */}
          <label className="mt-7 block text-sm font-bold text-slate-800">Share more <span className="font-normal text-slate-500">(optional)</span><textarea value={feedbackForm.comment} onChange={(event) => setFeedbackForm((current) => ({ ...current, comment: event.target.value }))} rows="4" placeholder="Share what you liked or what could be improved (optional)" className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-3 py-3 font-normal text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label>

          <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={feedbackForm.isPublic}
              onChange={(event) => setFeedbackForm((current) => ({ ...current, isPublic: event.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <span>
              <span className="font-semibold">Share my comment anonymously on the public homepage.</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
              Your name and account details will not be displayed. Avoid including personal details in the comment. This is optional and does not affect your feedback submission.
              </span>
            </span>
          </label>

          <button type="submit" disabled={submitting} className="mt-7 w-full rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300">{submitting ? 'Submitting feedback...' : 'Submit Feedback'}</button>
        </form>
      </section>
    </main>
  )
}

export default SessionFeedback
