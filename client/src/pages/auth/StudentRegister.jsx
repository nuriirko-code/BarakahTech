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
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setSuccess } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (Object.values(formData).some((value) => !value.trim())) {
      setError('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
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

  return (
    <main className="min-h-screen bg-green-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-center text-2xl font-bold text-green-700">BarakahTech</p>
        <h1 className="mt-6 text-center text-3xl font-bold text-green-900">Create your student account</h1>

        {error && <div className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input className="w-full rounded-lg border p-3" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" autoComplete="name" />
          <input className="w-full rounded-lg border p-3" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" autoComplete="email" />
          <input className="w-full rounded-lg border p-3" name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" autoComplete="new-password" />
          <input className="w-full rounded-lg border p-3" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" type="password" autoComplete="new-password" />
          <button className="w-full rounded-lg bg-green-700 p-3 font-semibold text-white disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-green-700 hover:underline">Login</Link>
        </p>
        <p className="mt-2 text-center text-gray-600">
          Want to teach instead? <Link to="/register/teacher" className="font-semibold text-green-700 hover:underline">Apply as a teacher</Link>
        </p>
      </div>
    </main>
  )
}

export default StudentRegister
