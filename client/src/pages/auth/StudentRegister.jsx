import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const StudentRegister = () => {
  // Controlled inputs keep form values in React so validation and submission use
  // one reliable source of truth instead of reading the DOM directly.
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setSuccess } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target
    if (fieldErrors[name]) setError('')
    setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    const missingField = Object.keys(formData).find((field) => !formData[field].trim())
    if (missingField) {
      setError('Please fill in all fields')
      setFieldErrors({ [missingField]: 'This field is required.' })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setFieldErrors({ confirmPassword: 'Passwords do not match.' })
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setFieldErrors({ password: 'Use at least 6 characters.' })
      return
    }

    setLoading(true)

    try {
      // Frontend validation gives immediate feedback; the backend still validates
      // independently because client-side checks cannot be trusted for security.
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        // The page defines the role so users cannot choose another flow's role.
        role: 'student',
      })
      setSuccess('Account created successfully. Please login')
      navigate('/login')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed')
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
        <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">Create your student account</h1>

        {error && !Object.values(fieldErrors).some(Boolean) && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-1"><span className="sr-only">Full name</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" autoComplete="name" />{renderFieldError('name')}</label>
          <label className="block space-y-1"><span className="sr-only">Email address</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" autoComplete="email" />{renderFieldError('email')}</label>
          <label className="block space-y-1"><span className="sr-only">Password</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" autoComplete="new-password" />{renderFieldError('password')}</label>
          <label className="block space-y-1"><span className="sr-only">Confirm password</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" type="password" autoComplete="new-password" />{renderFieldError('confirmPassword')}</label>
          <button className="w-full rounded-xl bg-[#22C55E] p-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A] disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="font-bold text-[#15803D] hover:underline">Login</Link>
        </p>
        <p className="mt-2 text-center text-gray-600">
          Want to teach instead? <Link to="/register/teacher" className="font-bold text-[#15803D] hover:underline">Apply as a teacher</Link>
        </p>
      </div>
    </main>
  )
}

export default StudentRegister
