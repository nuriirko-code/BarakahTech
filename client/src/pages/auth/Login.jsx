import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  // One login page serves every role because the backend identifies the account
  // and the returned role determines the correct dashboard destination.
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, successMessage } = useAuth()

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
//the following validation checks ensure that both email and password fields are filled before proceeding with the login request. If either field is empty, an appropriate error message is set, and the function returns early to prevent the login attempt.
    if (!formData.email.trim()) {
      setError('Please provide email and password')
      setFieldErrors({ email: 'Enter your email address.' })
      return
    }
    if (!formData.password) {
      setError('Please provide email and password')
      setFieldErrors({ password: 'Enter your password.' })
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData)
      const { user, token } = response.data

      if (user.role === 'pending_teacher') {
        // Pending teachers must wait for review and cannot enter a dashboard yet.
        setError('Your teacher application is still under review. We will notify you when approved.')
        navigate('/login')
        return
      }

      login(user, token)

      if (user.role === 'student') navigate('/dashboard/student')
      if (user.role === 'teacher') navigate('/dashboard/teacher')
      if (user.role === 'admin') navigate('/dashboard/admin')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
// this shows the message under the input field if there is an error related to that specific field. It checks if there is an error message for the given field in the fieldErrors state and renders it accordingly.
  const renderFieldError = (field) => fieldErrors[field]
    ? <span role="alert" className="block text-sm font-medium text-red-700">{fieldErrors[field]}</span>
    : null

  return (
    <main className="min-h-screen bg-green-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E] text-sm text-white"><i className="fas fa-graduation-cap" aria-hidden="true" /></span>
          BarakahTech
        </p>
        <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>

        {successMessage && <div role="status" className="mt-6 rounded-xl border border-[#22C55E]/20 bg-[#F0FDF4] p-3 text-[#15803D]">{successMessage}</div>}
        {error && !Object.values(fieldErrors).some(Boolean) && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-1"><span className="sr-only">Email address</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" autoComplete="email" />{renderFieldError('email')}</label>
          <label className="block space-y-1"><span className="sr-only">Password</span><input className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" autoComplete="current-password" />{renderFieldError('password')}</label>
          <div className="-mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-green-800 hover:underline">Forgot password?</Link>
          </div>
          <button className="w-full rounded-xl bg-[#22C55E] p-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A] disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account? <Link to="/register" className="font-bold text-[#15803D] hover:underline">Register</Link>
        </p>
      </div>
    </main>
  )
}

export default Login
