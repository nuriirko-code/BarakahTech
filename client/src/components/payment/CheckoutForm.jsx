import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currencyUtils'

// PaymentElement is Stripe's hosted payment UI. It gives us a secure card form without
// having to collect raw card details ourselves, which helps the platform stay PCI compliant,
// meaning card data is handled under Stripe's security model instead of our own backend form.
const CheckoutForm = ({ course, clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError('')

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (submitError) {
      setError(submitError.message || 'Payment could not be completed.')
      setProcessing(false)
      return
    }

    // redirect: 'if_required' lets Stripe complete the payment directly when possible,
    // but it does not force a full-page redirect for every flow. This keeps the checkout
    // experience smooth while still using Stripe's secure payment processing.
    if (paymentIntent?.status === 'succeeded') {
      onSuccess?.()
    }

    setProcessing(false)
  }

  const price = Number(course?.price || 0)
  const platformFeeRate = 20
  const platformFee = price * (platformFeeRate / 100)
  const teacherEarnings = price - platformFee
  const currencyCode = course?.currency || 'USD'

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Course price</span>
          <span>{formatCurrency(price, currencyCode)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>Platform fee</span>
          <span>{formatCurrency(platformFee, currencyCode)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm text-slate-600">
          <span>You pay</span>
          <span className="font-semibold text-slate-900">{formatCurrency(price, currencyCode)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>Teacher earns</span>
          <span className="font-semibold text-[#16A34A]">{formatCurrency(teacherEarnings, currencyCode)}</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <i className="fas fa-shield-alt" aria-hidden="true" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>

      <div className="space-y-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={processing || !stripe || !elements}
          className="inline-flex items-center justify-center rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#22C55E]/20 transition hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(price, currencyCode)}`
          )}
        </button>
      </div>
    </form>
  )
}

export default CheckoutForm
