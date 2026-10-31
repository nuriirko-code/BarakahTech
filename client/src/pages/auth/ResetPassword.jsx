import API_BASE_URL from '../../config/api.js'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'))
      setFieldErrors({ password: t('auth.passwordTooShort') })
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      setFieldErrors({ confirmPassword: t('auth.passwordMismatch') })
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password/${encodeURIComponent(token)}`, {
        newPassword: password,
      })
      setSuccess(true)
      // A short delay lets the user read confirmation before returning to sign-in.
      window.setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (requestError) {
      // API-provided error messages remain in English until server-side localization is implemented.
      setError(requestError.response?.data?.message || t('auth.resetLinkExpired'))
    } finally {
      setLoading(false)
    }
  }

  const renderFieldError = (field) => fieldErrors[field]
    ? <span role="alert" className="mt-1 block text-sm font-medium text-red-700">{fieldErrors[field]}</span>
    : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-2xl font-extrabold">{t('auth.setNewPassword')}</h1>
        {success ? (
          <div role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm leading-6 text-green-900">
            <i className="fas fa-circle-check mr-2 text-green-700" aria-hidden="true" />
            {t('auth.resetSuccess')}
          </div>
        ) : (
          <>
            <p className="mt-2 text-center text-sm text-slate-600">{t('auth.chooseNewPassword')}</p>
            {error && !Object.values(fieldErrors).some(Boolean) && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                {t('auth.newPassword')}
                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setFieldErrors((current) => ({ ...current, password: '' })); setError('') }}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                />
                {renderFieldError('password')}
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t('auth.confirmPassword')}
                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => { setConfirmPassword(event.target.value); setFieldErrors((current) => ({ ...current, confirmPassword: '' })); setError('') }}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100"
                />
                {renderFieldError('confirmPassword')}
              </label>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-700 px-4 py-3 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
                {loading ? t('auth.resetting') : t('auth.resetPassword')}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  )
}

export default ResetPassword
