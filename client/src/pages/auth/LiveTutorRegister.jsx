import API_BASE_URL from '../../config/api.js'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

// A live tutor starts as a standard account. Live tutoring is approved later as
// a separate capability, so this account can also become a course teacher.
const LiveTutorRegister = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) return setError('Complete every account field to continue.')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.')
    if (formData.password.length < 6) return setError('Use a password with at least 6 characters.')
    setLoading(true)
    setError('')
    try {
      // Registering as student is intentional: live tutoring is a capability,
      // not a second account role, and the apply API accepts student accounts.
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name: formData.name, email: formData.email, password: formData.password, role: 'student' })
      login(response.data.user, response.data.token)
      navigate('/apply/live-tutor')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base outline-none transition focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'
  return <main className="min-h-screen bg-green-50 px-5 py-12 text-slate-900 sm:px-8"><section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><Link to="/become-a-live-tutor" className="inline-flex items-center gap-2 text-base font-semibold text-[#15803D] hover:underline"><i className="fas fa-arrow-left text-sm" aria-hidden="true" /> Back</Link><h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Create your tutor account</h1><p className="mt-3 text-base leading-7 text-slate-600">Create one Barakah Academy account, then complete your live-tutor application. You can apply to create courses later with this same account.</p>{error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-700">{error}</p>}<form onSubmit={handleSubmit} className="mt-7 grid gap-5"><label className="text-base font-semibold">Full name<input className={`${inputClass} mt-2`} value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} autoComplete="name" /></label><label className="text-base font-semibold">Email address<input className={`${inputClass} mt-2`} type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} autoComplete="email" /></label><label className="text-base font-semibold">Password<input className={`${inputClass} mt-2`} type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} autoComplete="new-password" /></label><label className="text-base font-semibold">Confirm password<input className={`${inputClass} mt-2`} type="password" value={formData.confirmPassword} onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })} autoComplete="new-password" /></label><button disabled={loading} className="mt-2 rounded-xl bg-[#22C55E] px-6 py-3.5 text-base font-bold text-white transition hover:bg-[#16A34A] disabled:opacity-60">{loading ? 'Creating account...' : 'Continue to live-tutor application'}</button></form></section></main>
}

export default LiveTutorRegister
