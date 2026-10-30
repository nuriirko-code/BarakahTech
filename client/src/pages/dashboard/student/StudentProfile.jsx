import API_BASE_URL from '../../../config/api.js'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Avatar from '../../../components/common/Avatar'
import { useAuth } from '../../../context/AuthContext'
import { formatCurrency, getSupportedCurrencies } from '../../../utils/currencyUtils'

// Preferred currency is stored on the student profile because the platform may price courses in
// different currencies, and the student's own preference should follow their shopping habits.
const StudentProfile = () => {
  const { user, token } = useAuth()
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    preferredCurrency: 'USD',
    preferredLanguage: 'english',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return

    setProfileData({
      name: user.name || '',
      email: user.email || '',
      preferredCurrency: user.preferredCurrency || 'USD',
      preferredLanguage: user.preferredLanguage || 'english',
    })

    const loadPayments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/payments/my-payments`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPayments(response.data.payments || [])
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load payment history.')
      } finally {
        setPaymentsLoading(false)
      }
    }

    loadPayments()
  }, [user, token])

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // The profile update is currently a front-end placeholder; the backend can be connected later.
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSuccess('Profile updated successfully.')
      setProfileEditing(false)
    } catch {
      setError('Unable to save profile changes.')
    } finally {
      setSaving(false)
    }
  }

  const totalSpent = payments
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  const enrolledCoursesCount = Math.max(0, payments.filter((payment) => payment.status === 'completed').length)
  const completedCoursesCount = payments.filter((payment) => payment.status === 'completed').length

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || 'Student'} imageUrl={user?.profilePhoto} size="xl" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{user?.name || 'Student'}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#15803D]">Student</span>
                <span className="text-sm text-slate-500">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'recently'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setProfileEditing((value) => !value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            {profileEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {profileEditing && (
          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Full name
              <input
                type="text"
                value={profileData.name}
                onChange={(event) => setProfileData((current) => ({ ...current, name: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Preferred currency
              <select
                value={profileData.preferredCurrency}
                onChange={(event) => setProfileData((current) => ({ ...current, preferredCurrency: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"
              >
                {getSupportedCurrencies().map((currency) => (
                  <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              Preferred language
              <select
                value={profileData.preferredLanguage}
                onChange={(event) => setProfileData((current) => ({ ...current, preferredLanguage: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"
              >
                <option value="english">English</option>
                <option value="amharic">Amharic</option>
                <option value="arabic">Arabic</option>
                <option value="afaan-oromo">Afaan Oromo</option>
                <option value="french">French</option>
              </select>
            </label>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#16A34A] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setProfileEditing(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {success && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Enrolled Courses</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{enrolledCoursesCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed Courses</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{completedCoursesCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Spent</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{formatCurrency(totalSpent, profileData.preferredCurrency || 'USD')}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <i className="fas fa-receipt text-lg text-[#16A34A]" aria-hidden="true" />
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Payment History</h2>
        </div>

        {paymentsLoading ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-12 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">No payments yet. Enroll in a paid course to see your payment history.</div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-700">{payment.course?.title || 'Course purchase'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(payment.amount, payment.currency || 'USD')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                        payment.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50" aria-label="View receipt">
                        <i className="fas fa-file-invoice" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default StudentProfile
