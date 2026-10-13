import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currencyUtils'
import { getCategoryGradient, getCategoryIcon } from '../../utils/courseUtils'

const paymentMethods = [
  {
    id: 'telebirr',
    title: 'Telebirr',
    subtitle: 'Pay with your Telebirr account',
    icon: 'fas fa-mobile-screen-button',
    iconClass: 'bg-green-50 text-green-700',
    popular: true,
  },
  {
    id: 'cbe_birr',
    title: 'CBE Birr',
    subtitle: 'Commercial Bank of Ethiopia mobile banking',
    icon: 'fas fa-building-columns',
    iconClass: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'other_mobile',
    title: 'Other Mobile Money',
    subtitle: 'Amhara Bank, Dashen Bank, Awash Bank and others',
    icon: 'fas fa-wallet',
    iconClass: 'bg-violet-50 text-violet-700',
  },
]

// Separating method choice, transfer instructions, and proof submission gives students
// time to send funds and collect a receipt before claiming that the payment was made.
const checkoutStages = ['method', 'instructions', 'confirm', 'success']

// This page collects a transfer claim, not card data. Staff verify the incoming funds
// before the server creates enrollment, which keeps course access tied to real receipts.
const CourseCheckout = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [course, setCourse] = useState(null)
  const [payment, setPayment] = useState(null)
  const [stage, setStage] = useState('method')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [studentNote, setStudentNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    // Course details are fetched independently from payment initiation, so merely
    // opening the page does not create an order before a student chooses a method.
    const loadCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`)
        if (isCurrent) setCourse(response.data.course || response.data)
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Unable to load this course.')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadCourse()
    return () => {
      isCurrent = false
    }
  }, [courseId])

  // The server creates the human-readable payment code because it owns the order record
  // and must prevent the browser from inventing codes that could collide with other students.
  const handleMethodSelect = async (method) => {
    setSelectedMethod(method)
    setSubmitting(true)
    setError('')

    try {
      const response = await axios.post(
        `http://localhost:5000/api/payments/courses/${courseId}/initiate`,
        { method },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPayment(response.data.payment || response.data)
      setStage('instructions')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create payment instructions.')
    } finally {
      setSubmitting(false)
    }
  }

  // Student confirmation stores their transaction ID for review; it deliberately does
  // not enroll them because only an administrator can verify money reached the account.
  const handleConfirmPayment = async (event) => {
    event.preventDefault()

    if (!referenceNumber.trim()) {
      setError('Enter the transaction ID from your payment receipt.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await axios.post(
        `http://localhost:5000/api/payments/${payment._id}/confirm`,
        {
          manualPaymentReference: referenceNumber.trim(),
          studentNote: studentNote.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPayment(response.data.payment || payment)
      setStage('success')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit your payment confirmation.')
    } finally {
      setSubmitting(false)
    }
  }

  // Clipboard access is limited to secure browser contexts; a copy failure is shown
  // as a useful instruction rather than blocking the payment process.
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(payment.platformPaymentCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Copy was unavailable. Select the payment code and copy it manually.')
    }
  }

  const selectedMethodDetails = paymentMethods.find((method) => method.id === selectedMethod)
  // Keep account destinations configurable per deployment instead of embedding them in source.
  // Vite exposes VITE_ values to the browser, so these must be student-facing details, never secrets.
  const telebirrNumber = import.meta.env.VITE_TELEBIRR_NUMBER
  const cbeAccount = import.meta.env.VITE_CBE_ACCOUNT
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@barakahtech.com'
  const paymentDestination = selectedMethod === 'telebirr'
    ? telebirrNumber || `Payment number is not configured. Contact ${supportEmail}.`
    : selectedMethod === 'cbe_birr'
      ? cbeAccount || `CBE account is not configured. Contact ${supportEmail}.`
      : `Contact support at ${supportEmail} for payment details.`
  const currentStageIndex = checkoutStages.indexOf(stage)
  const categoryGradient = getCategoryGradient(course?.category)
  const categoryIcon = getCategoryIcon(course?.category)

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto h-80 max-w-2xl animate-pulse rounded-2xl bg-slate-200" />
      </main>
    )
  }

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-red-700">{error || 'Course could not be found.'}</p>
          <button type="button" onClick={() => navigate(-1)} className="mt-5 font-semibold text-green-700 hover:text-green-800">
            <i className="fas fa-arrow-left mr-2" aria-hidden="true" />Go back
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <i className="fas fa-arrow-left" aria-hidden="true" />Back
        </button>

        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className={`flex h-28 items-center gap-4 bg-gradient-to-r ${categoryGradient} px-6 text-white`}>
            <i className={`${categoryIcon} text-3xl`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-white/80">{course.category || 'Course'}</p>
              <h1 className="mt-1 truncate text-xl font-extrabold">{course.title}</h1>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Instructor</p>
                <p className="font-semibold text-slate-900">{course.teacher?.name || 'BarakahTech Teacher'}</p>
              </div>
              <p className="text-xl font-extrabold text-slate-900">
                {formatCurrency(course.price, course.currency || 'ETB')}
              </p>
            </div>
          </div>
        </section>

        <ol aria-label="Payment steps" className="my-6 grid grid-cols-4 gap-2">
          {checkoutStages.map((stageName, index) => {
            const isComplete = index < currentStageIndex
            const isActive = index === currentStageIndex
            const label = ['Method', 'Instructions', 'Confirm', 'Done'][index]

            return (
              <li key={stageName} className="text-center">
                <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isComplete || isActive ? 'bg-green-700 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isComplete ? <i className="fas fa-check" aria-hidden="true" /> : index + 1}
                </span>
                <span className={`mt-2 block text-xs font-semibold ${isActive ? 'text-green-800' : 'text-slate-500'}`}>
                  {label}
                </span>
              </li>
            )
          })}
        </ol>

        {error && (
          <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />{error}
          </div>
        )}

        {stage === 'method' && (
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Choose Payment Method</h2>
            <p className="mt-1 text-sm text-slate-500">Choose how you plan to send the course payment.</p>
            <div className="mt-5 space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition hover:border-green-600 hover:bg-green-50/40 disabled:cursor-wait disabled:opacity-60 ${
                    selectedMethod === method.id ? 'border-green-700 ring-2 ring-green-100' : 'border-slate-200'
                  }`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${method.iconClass}`}>
                    <i className={method.icon} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                      {method.title}
                      {method.popular && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">Most popular</span>}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">{method.subtitle}</span>
                  </span>
                  {selectedMethod === method.id && <i className="fas fa-circle-check text-green-700" aria-hidden="true" />}
                </button>
              ))}

                {/* Card is visible to set expectations for international checkout, but is not
                  clickable until a card processor is integrated in a future phase. */}
                <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-400">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                  <i className="fas fa-credit-card" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-bold text-slate-500">
                    International Card
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">Coming soon</span>
                  </span>
                  <span className="mt-1 block text-sm">Coming soon for international students</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {stage === 'instructions' && payment && (
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Complete Your Payment</h2>
            <p className="mt-1 text-sm text-slate-500">Using {selectedMethodDetails?.title || 'your selected method'}</p>

            <div className="mt-5 rounded-lg border border-green-300 bg-green-50 p-4">
              <p className="text-xs font-bold uppercase text-green-800">Step 1</p>
              <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-slate-800">
                <i className="fas fa-arrow-right mt-1 text-green-700" aria-hidden="true" />
                <span>Send exactly {formatCurrency(course.price, course.currency || 'ETB')} to:</span>
              </p>
              <p className="mt-2 break-words pl-6 text-sm font-bold text-slate-900">{paymentDestination}</p>
            </div>

            {/* The platform code is deliberately prominent because this exact text helps
              administrators match the incoming transfer to the correct student order. */}
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase text-amber-800">Step 2</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <i className="fas fa-tag text-amber-700" aria-hidden="true" />
                Use this reference code in your payment description:
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="break-all text-xl font-extrabold tracking-wider text-slate-900">{payment.platformPaymentCode}</code>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Copy payment reference code"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                  title={copied ? 'Copied' : 'Copy code'}
                >
                  <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">This code helps us identify your payment.</p>
            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Step 3</p>
              <p className="mt-2 text-sm text-slate-700">After sending, return here and continue to enter your transaction ID.</p>
            </div>

            <button
              type="button"
              onClick={() => setStage('confirm')}
              className="mt-5 w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Continue
            </button>
          </section>
        )}

        {stage === 'confirm' && payment && (
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Confirm Your Payment</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedMethodDetails?.title || 'Payment method'} · {formatCurrency(course.price, course.currency || 'ETB')}
            </p>
            <p className="mt-2 break-words text-sm text-slate-600">Sent to: {paymentDestination}</p>

            <form onSubmit={handleConfirmPayment} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-800">
                Your Transaction ID
                <input
                  required
                  value={referenceNumber}
                  onChange={(event) => setReferenceNumber(event.target.value)}
                  placeholder="e.g. TXN123456789"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                Any notes (optional)
                <textarea
                  value={studentNote}
                  onChange={(event) => setStudentNote(event.target.value)}
                  rows="3"
                  className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Payment Confirmation'}
              </button>
            </form>

            <div className="mt-4 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <i className="fas fa-circle-info mt-0.5" aria-hidden="true" />
              <p>Your enrollment will be activated within a few hours after our team verifies your payment. You can access the course once verified.</p>
            </div>
          </section>
        )}

        {stage === 'success' && payment && (
          <section className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
              <i className="fas fa-circle-check" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold text-slate-900">Payment Confirmation Received</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Thank you! Our team will verify your payment and activate your enrollment within a few hours.
            </p>
            <p className="mt-5 text-sm text-slate-600">Payment Reference</p>
            <code className="mt-1 inline-block break-all text-lg font-extrabold text-slate-900">{payment.platformPaymentCode}</code>
            <p className="mt-2 text-xs text-slate-500">Screenshot or note this code for your records.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard/student/courses')}
                className="rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800"
              >
                Go to My Learning
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/student/browse')}
                className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Browse More Courses
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default CourseCheckout