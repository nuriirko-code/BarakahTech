import API_BASE_URL from '../../config/api.js'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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

const StudentRegister = () => {
  // Controlled inputs keep form values in React so validation and submission use
  // one reliable source of truth instead of reading the DOM directly.
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
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setSuccess } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target
    if (fieldErrors[name]) setError('')
    setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handlePolicyChange = (field, value) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    const requiredFields = ['name', 'email', 'password', 'confirmPassword', 'dateOfBirth']
    const missingField = requiredFields.find((field) => !formData[field].trim())
    if (missingField) {
      setError(t('auth.fillAllFields'))
      setFieldErrors({ [missingField]: t('auth.required') })
      return
    }

    const nameError = getPersonNameError(formData.name)
    if (nameError) {
      const message = t(nameError === 'invalid' ? 'auth.teacher.validation.nameCharacters' : 'auth.teacher.validation.nameLength')
      setError(message)
      setFieldErrors({ name: message })
      return
    }

    if (!isValidEmail(formData.email)) {
      const message = t('auth.validEmail')
      setError(message)
      setFieldErrors({ email: message })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'))
      setFieldErrors({ confirmPassword: t('auth.passwordMismatch') })
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'))
      setFieldErrors({ password: t('auth.passwordTooShort') })
      return
    }

    const age = ageOnDate(formData.dateOfBirth)
    if (age === null || age < 0 || age > 120) {
      setError(t('auth.invalidDateOfBirth'))
      return
    }
    if (!formData.acceptedTerms || !formData.acknowledgedPrivacy) {
      setError(t('auth.acceptPoliciesToContinue'))
      return
    }
    if (age < 18) {
      const guardianNameError = getPersonNameError(formData.guardianName)
      if (guardianNameError) {
        const message = t(guardianNameError === 'invalid' ? 'auth.teacher.validation.nameCharacters' : 'auth.teacher.validation.nameLength')
        setError(message)
        setFieldErrors({ guardianName: message })
        return
      }
      if (!isValidEmail(formData.guardianEmail)) {
        const message = t('auth.validEmail')
        setError(message)
        setFieldErrors({ guardianEmail: message })
        return
      }
      if (!formData.guardianConsent) {
        setError(t('auth.guardianDeclarationRequired'))
        return
      }
    }

    setLoading(true)

    try {
      // Frontend validation gives immediate feedback; the backend still validates
      // independently because client-side checks cannot be trusted for security.
      await axios.post(`${API_BASE_URL}/auth/register`, {
        name: normalizePersonName(formData.name),
        email: normalizeEmail(formData.email),
        password: formData.password,
        // The page defines the role so users cannot choose another flow's role.
        role: 'student',
        dateOfBirth: formData.dateOfBirth,
        acceptedTermsVersion: POLICY_VERSIONS.terms,
        acknowledgedPrivacyVersion: POLICY_VERSIONS.privacy,
        acceptedCommunityCodeVersion: POLICY_VERSIONS.community,
        guardianConsent: {
          guardianName: normalizePersonName(formData.guardianName),
          guardianEmail: normalizeEmail(formData.guardianEmail),
          confirmed: formData.guardianConsent,
        },
      })
      setSuccess(t('auth.accountCreated'))
      navigate('/login')
    } catch (requestError) {
      // API-provided error messages remain in English until server-side localization is implemented.
      setError(requestError.response?.data?.message || t('auth.registrationFailed'))
    } finally {
      // finally runs after success or failure, so the button cannot remain stuck.
      setLoading(false)
    }
  }

  const renderFieldError = (field) => fieldErrors[field]
    ? <span role="alert" className="block text-sm font-medium text-red-700">{fieldErrors[field]}</span>
    : null

  return (
    <main className="min-h-screen bg-green-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E] text-sm text-white"><i className="fas fa-graduation-cap" aria-hidden="true" /></span>
          Barakah Academy
        </p>
        <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">{t('auth.createStudentAccount')}</h1>

        {error && !Object.values(fieldErrors).some(Boolean) && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-1"><span className="sr-only">{t('auth.name')}</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="name" value={formData.name} onChange={handleChange} placeholder={t('auth.name')} autoComplete="name" maxLength={80} />{renderFieldError('name')}</label>
          <label className="block space-y-1"><span className="sr-only">{t('auth.email')}</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="email" value={formData.email} onChange={handleChange} placeholder={t('auth.email')} type="email" autoComplete="email" />{renderFieldError('email')}</label>
          <label className="block space-y-1"><span className="sr-only">{t('auth.password')}</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="password" value={formData.password} onChange={handleChange} placeholder={t('auth.password')} type="password" autoComplete="new-password" />{renderFieldError('password')}</label>
          <label className="block space-y-1"><span className="sr-only">{t('auth.confirmPassword')}</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t('auth.confirmPassword')} type="password" autoComplete="new-password" />{renderFieldError('confirmPassword')}</label>
          <AccountPolicyFields values={formData} onChange={handlePolicyChange} fieldErrors={fieldErrors} />
          <button className="w-full rounded-xl bg-[#22C55E] p-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A] disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {t('auth.hasAccount')} <Link to="/login" className="font-bold text-[#15803D] hover:underline">{t('auth.login')}</Link>
        </p>
        <p className="mt-2 text-center text-gray-600">
          {t('auth.wantToTeach')} <Link to="/register/teacher" className="font-bold text-[#15803D] hover:underline">{t('auth.applyTeacher')}</Link>
        </p>
      </div>
    </main>
  )
}

export default StudentRegister
