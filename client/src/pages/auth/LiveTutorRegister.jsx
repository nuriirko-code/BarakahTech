import API_BASE_URL from '../../config/api.js'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import AccountPolicyFields from '../../components/legal/AccountPolicyFields'
import { POLICY_VERSIONS } from '../../config/policyVersions'
import { ageOnDate } from '../../utils/legalAge'
import {
  getPersonNameError,
  isValidEmail,
  normalizeEmail,
  normalizePersonName,
} from '../../utils/registrationValidation'

// A live tutor starts as a standard account. Live tutoring is approved later as
// a separate capability, so this account can also become a course teacher.
const LiveTutorRegister = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    guardianName: '',
    guardianEmail: '',
    guardianConsent: false,
    acceptedTerms: false,
    acknowledgedPrivacy: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handlePolicyChange = (field, value) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) return setError(t('auth.liveTutorRegistration.completeFields'))
    const nameError = getPersonNameError(formData.name)
    if (nameError) {
      return setError(t(nameError === 'invalid' ? 'auth.teacher.validation.nameCharacters' : 'auth.teacher.validation.nameLength'))
    }
    if (!isValidEmail(formData.email)) return setError(t('auth.validEmail'))
    if (formData.password !== formData.confirmPassword) return setError(t('auth.passwordMismatch'))
    if (formData.password.length < 6) return setError(t('auth.passwordTooShort'))
    const age = ageOnDate(formData.dateOfBirth)
    if (age === null || age < 18) return setError(t('auth.liveTutorRegistration.ageRequired'))
    if (!formData.dateOfBirth || !formData.acceptedTerms || !formData.acknowledgedPrivacy) {
      return setError(t('auth.liveTutorRegistration.acceptPolicies'))
    }
    setLoading(true)
    setError('')
    try {
      // Registering as student is intentional: live tutoring is a capability,
      // not a second account role, and the apply API accepts student accounts.
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: normalizePersonName(formData.name),
        email: normalizeEmail(formData.email),
        password: formData.password,
        role: 'student',
        dateOfBirth: formData.dateOfBirth,
        acceptedTermsVersion: POLICY_VERSIONS.terms,
        acknowledgedPrivacyVersion: POLICY_VERSIONS.privacy,
        acceptedCommunityCodeVersion: POLICY_VERSIONS.community,
      })
      login(response.data.user, response.data.token)
      navigate('/apply/live-tutor')
    } catch (requestError) {
      setError(requestError.response?.data?.message || t('auth.liveTutorRegistration.createError'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base outline-none transition focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'
  return (
    <main className="min-h-screen bg-green-50 px-5 py-12 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <Link to="/become-a-live-tutor" className="inline-flex items-center gap-2 text-base font-semibold text-[#15803D] hover:underline">
          <i className="fas fa-arrow-left text-sm" aria-hidden="true" /> {t('auth.back')}
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('auth.liveTutorRegistration.title')}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{t('auth.liveTutorRegistration.description')}</p>
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
          <label className="text-base font-semibold">{t('auth.name')}
            <input className={`${inputClass} mt-2`} value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} autoComplete="name" maxLength={80} />
          </label>
          <label className="text-base font-semibold">{t('auth.email')}
            <input className={`${inputClass} mt-2`} type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} autoComplete="email" />
          </label>
          <label className="text-base font-semibold">{t('auth.password')}
            <input className={`${inputClass} mt-2`} type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} autoComplete="new-password" />
          </label>
          <label className="text-base font-semibold">{t('auth.confirmPassword')}
            <input className={`${inputClass} mt-2`} type="password" value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} autoComplete="new-password" />
          </label>
          <AccountPolicyFields values={formData} onChange={handlePolicyChange} requireAdult />
          <button disabled={loading} className="mt-2 rounded-xl bg-[#22C55E] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#16A34A] disabled:opacity-60">
            {loading ? t('auth.creatingAccount') : t('auth.liveTutorRegistration.continue')}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LiveTutorRegister
