import API_BASE_URL from '../../config/api.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setEmailError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.')
      return
    }
    setLoading(true)

    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: email.trim() })
      // The same success state is shown for known and unknown addresses so the form
      // cannot be used to discover which emails have Barakah Academy accounts.
      setSuccess(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request a password reset. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-2xl text-green-700">
          {success ? <i className="fas fa-circle-check" aria-hidden="true" /> : <i className="fas fa-lock" aria-hidden="true" />}
        </div>
        {success ? (
          <div className="text-center">
            <h1 className="mt-5 text-2xl font-extrabold">Check your inbox</h1>
            <p role="status" className="mt-3 text-sm leading-6 text-slate-600">
              If an account exists with this email, a reset link has been sent. Check your inbox.
            </p>
            <p className="mt-2 text-xs text-slate-500">Didn’t receive it? Check spam or try again.</p>
            <button type="button" onClick={() => { setSuccess(false); setError('') }} className="mt-6 w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800">
              Try another email
            </button>
            <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-green-800 hover:underline">Back to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="mt-5 text-center text-2xl font-extrabold">Forgot your password?</h1>
            <p className="mt-2 text-center text-sm text-slate-600">Enter your email and we’ll send you a reset link.</p>
            {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setEmailError('') }}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                />
                {emailError && <span role="alert" className="mt-1 block text-sm font-medium text-red-700">{emailError}</span>}
              </label>
              <button type="submit" disabled={loading || !email.trim()} className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="mt-5 block text-center text-sm font-semibold text-green-800 hover:underline">Back to Login</Link>
          </>
        )}
      </section>
    </main>
  )
}

export default ForgotPassword
