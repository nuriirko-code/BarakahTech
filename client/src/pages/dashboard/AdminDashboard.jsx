import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'
import { formatCurrency } from '../../utils/currencyUtils'
import ManageUsers from './admin/ManageUsers'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  approved: 'bg-[#F0FDF4] text-[#15803D] ring-1 ring-[#22C55E]/20',
  rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

const statusFilters = ['all', 'pending', 'approved', 'rejected']
// formatDate takes a date value from the database and turns it into a readable date. If the value is missing, it shows “Not reviewed”. If the value is invalid, it shows “Unknown date”.
const formatDate = (dateValue) => {
  if (!dateValue) return 'Not reviewed'
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString()
}

const AdminDashboard = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingPayments, setPendingPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState('')
  // Live-tutor review has independent state so its loading/errors never
  // overwrite the existing course-teacher or payment administration screens.
  const [liveTutorApplications, setLiveTutorApplications] = useState([])
  const [liveTutorLoading, setLiveTutorLoading] = useState(false)
  const [liveTutorError, setLiveTutorError] = useState('')
  const [selectedLiveTutorApp, setSelectedLiveTutorApp] = useState(null)
  const [liveTutorReviewNote, setLiveTutorReviewNote] = useState('')
  const [liveTutorActionLoading, setLiveTutorActionLoading] = useState(false)
  const [liveTutorSuccess, setLiveTutorSuccess] = useState('')
  // Tabs keep related administration tools in one focused workspace instead of
  // turning this operational dashboard into a multi-page navigation flow.
  const [activeTab, setActiveTab] = useState('applications')
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let isCurrent = true

    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/teacher-applications/all',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (isCurrent) setApplications(response.data.applications || [])
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load teacher applications.')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) {
      fetchApplications()
    }

    return () => {
      isCurrent = false
    }
  }, [token])

  useEffect(() => {
    if (activeTab !== 'payments' || !token) return undefined

    let isCurrent = true

    const fetchPendingPayments = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/payments/pending',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (isCurrent) setPendingPayments(response.data.payments || [])
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load pending payments.')
        }
      } finally {
        if (isCurrent) setPaymentsLoading(false)
      }
    }

    fetchPendingPayments()
    return () => {
      isCurrent = false
    }
  }, [activeTab, token])

  useEffect(() => {
    if (activeTab !== 'live-tutor-applications' || !token) return undefined

    let isCurrent = true

    const fetchLiveTutorApplications = async () => {
      setLiveTutorLoading(true)
      setLiveTutorError('')

      try {
        const response = await axios.get(
          'http://localhost:5000/api/live-tutors/admin/applications',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (isCurrent) setLiveTutorApplications(response.data.applications || [])
      } catch (requestError) {
        if (isCurrent) {
          setLiveTutorError(requestError.response?.data?.message || 'Could not load live tutor applications.')
        }
      } finally {
        if (isCurrent) setLiveTutorLoading(false)
      }
    }

    fetchLiveTutorApplications()
    return () => {
      isCurrent = false
    }
  }, [activeTab, token])

  // Summary counts are derived from the one applications list, avoiding
  // duplicate state that could become inconsistent after a review action.
  const counts = {
    all: applications.length,
    pending: applications.filter((application) => application.status === 'pending').length,
    approved: applications.filter((application) => application.status === 'approved').length,
    rejected: applications.filter((application) => application.status === 'rejected').length,
  }

  const visibleApplications = applications.filter((application) => {
    const matchesStatus = activeFilter === 'all' || application.status === activeFilter
    const query = searchTerm.trim().toLowerCase()
    const applicantName = application.user?.name || ''
    const applicantEmail = application.user?.email || ''
    const subject = application.specificSubject || ''
    const matchesSearch = !query || [applicantName, applicantEmail, subject]
      .some((value) => value.toLowerCase().includes(query))
    return matchesStatus && matchesSearch
  })
   // when the admin opens an application, the details are displayed in a panel without changing the list. The admin can then approve or reject the application, and the server updates both the application and the linked user account if approved.
  const openApplication = (application) => {
    // The selected record drives the detail panel without changing the list.
    setSelectedApplication(application)
    setAdminNote(application.adminNote || '')
    setReviewStatus('')
    setError('')
    setSuccessMessage('')
  }

  const closeApplication = () => {
    setSelectedApplication(null)
    setReviewStatus('')
    setAdminNote('')
    setError('')
  }

  // The server records the decision and, on approval, promotes the linked User
  // account from pending_teacher to teacher and marks it approved.
  //.trim() is used to prevent empty notes from being sent to the server when rejecting an application. removes spaces so blank spaces do not count as a real note
  const reviewApplication = async (status) => {
    if (!['approved', 'rejected'].includes(status)) return
    if (status === 'rejected' && !adminNote.trim()) {
      setError('Please add a note explaining why this application is being rejected.')
      return
    }

    setActionLoading(true)
    setReviewStatus(status)
    setError('')
    setSuccessMessage('')

    try {
      const response = await axios.put(
        `http://localhost:5000/api/teacher-applications/${selectedApplication._id}/review`,
        { status, adminNote: adminNote.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updatedApplication = response.data.application
      const mergedApplication = {
        ...selectedApplication,
        ...updatedApplication,
        user: selectedApplication.user,
      }

      // Updating local state keeps the table and open details in sync without
      // another request after the backend has already returned the updated record.
      setApplications((currentApplications) => currentApplications.map((application) => (
        application._id === mergedApplication._id
          ? { ...application, ...mergedApplication }
          : application
      )))
      setSelectedApplication(mergedApplication)
      setSuccessMessage(response.data.message || `Application ${status} successfully.`)
      setAdminNote('')
      setReviewStatus('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this application.')
    } finally {
      setActionLoading(false)
    }
  }

  // Admins compare the submitted transaction ID and platform code with the bank SMS or
  // account statement. Approving activates enrollment; rejecting retains the record for audit.
  const handleVerifyPayment = async (paymentId, action) => {
    setVerifyingId(paymentId)
    setError('')
    setPaymentSuccess('')

    try {
      const response = await axios.put(
        `http://localhost:5000/api/payments/${paymentId}/verify`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setPendingPayments((currentPayments) => currentPayments.filter((payment) => payment._id !== paymentId))
      setPaymentSuccess(response.data.message || `Payment ${action}d successfully.`)
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Could not ${action} this payment.`)
    } finally {
      setVerifyingId('')
    }
  }

  const openLiveTutorApplication = (application) => {
    setSelectedLiveTutorApp(application)
    setLiveTutorReviewNote(application.adminNote || '')
    setLiveTutorError('')
    setLiveTutorSuccess('')
  }

  const closeLiveTutorApplication = () => {
    setSelectedLiveTutorApp(null)
    setLiveTutorReviewNote('')
    setLiveTutorError('')
  }

  // Approval is more than a label change: the backend marks the User as a
  // live tutor and creates the public-safe LiveTutorProfile automatically.
  const handleReviewLiveTutorApp = async (applicationId, action) => {
    if (!['approved', 'rejected'].includes(action)) return
    if (action === 'rejected' && !liveTutorReviewNote.trim()) {
      setLiveTutorError('Add a clear note so the tutor understands how to improve their application.')
      return
    }

    setLiveTutorActionLoading(true)
    setLiveTutorError('')
    setLiveTutorSuccess('')

    try {
      const response = await axios.put(
        `http://localhost:5000/api/live-tutors/admin/applications/${applicationId}/review`,
        { status: action, adminNote: liveTutorReviewNote.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updatedApplication = response.data.application

      // Merge rather than refetch so the table and open modal immediately show
      // the server-confirmed review result without an unnecessary extra call.
      setLiveTutorApplications((currentApplications) => currentApplications.map((application) => (
        application._id === applicationId
          ? { ...application, ...updatedApplication, user: application.user }
          : application
      )))
      setSelectedLiveTutorApp((currentApplication) => (
        currentApplication?._id === applicationId
          ? { ...currentApplication, ...updatedApplication, user: currentApplication.user }
          : currentApplication
      ))
      setLiveTutorSuccess(response.data.message || `Live tutor application ${action} successfully.`)
      setLiveTutorReviewNote('')
    } catch (requestError) {
      setLiveTutorError(requestError.response?.data?.message || 'Could not update this live tutor application.')
    } finally {
      setLiveTutorActionLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const openPendingPayments = () => {
    if (activeTab === 'payments') return
    setPaymentsLoading(true)
    setError('')
    setPaymentSuccess('')
    setActiveTab('payments')
  }

  const displayValue = (value) => value || 'Not provided'

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-slate-900">
        <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-extrabold">Admin session required</h1>
          <p className="mt-3 text-gray-600">Please sign in again to review teacher applications.</p>
          <button onClick={handleLogout} className="mt-6 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">Return to login</button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-bold text-[#16A34A]">BarakahTech Academy</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Review teacher applications and platform accounts</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.name || 'Administrator'}</span>
            <Link to="/messages" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-green-50 hover:text-green-800">
              <i className="fas fa-comments" aria-hidden="true" />Messages
            </Link>
            <button onClick={handleLogout} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        {/* Tabs preserve one admin workspace while swapping focused tools in its content area. */}
        <nav className="flex gap-4 overflow-x-auto border-b border-slate-200" aria-label="Admin dashboard sections">
          <button type="button" onClick={() => setActiveTab('applications')} className={`border-b-2 px-1 pb-3 text-sm transition ${activeTab === 'applications' ? 'border-green-700 font-semibold text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Teacher Applications
          </button>
          <button type="button" onClick={() => setActiveTab('users')} className={`border-b-2 px-1 pb-3 text-sm transition ${activeTab === 'users' ? 'border-green-700 font-semibold text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            User Management
          </button>
          <button type="button" onClick={openPendingPayments} className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm transition ${activeTab === 'payments' ? 'border-green-700 font-semibold text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Pending Payments
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">{pendingPayments.length}</span>
          </button>
          <button type="button" onClick={() => setActiveTab('live-tutor-applications')} className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 text-sm transition ${activeTab === 'live-tutor-applications' ? 'border-green-700 font-semibold text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <i className="fas fa-video" aria-hidden="true" /> Live Tutor Applications
          </button>
        </nav>

        {activeTab === 'payments' ? (
          <section className="space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-slate-900">Pending Payment Verifications</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-900">{pendingPayments.length}</span>
              </div>
              {pendingPayments.length > 0 && (
                <i className="fas fa-triangle-exclamation text-xl text-amber-600" aria-label="Payments need review" />
              )}
            </header>

            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <i className="fas fa-circle-info mt-1 text-amber-700" aria-hidden="true" />
              <p>Students send payment to our accounts manually. Verify each payment below by checking your Telebirr or bank account for the matching transaction.</p>
            </div>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            {paymentSuccess && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{paymentSuccess}</div>}

            {paymentsLoading ? (
              <div className="space-y-3" role="status" aria-label="Loading pending payments">
                {[1, 2, 3].map((row) => <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-200" />)}
              </div>
            ) : pendingPayments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
                <i className="fas fa-circle-check text-3xl text-green-700" aria-hidden="true" />
                <p className="mt-3 font-semibold text-slate-800">No pending payments. All caught up!</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1180px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">Course</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Method</th>
                        <th className="px-4 py-3 font-semibold">Platform Code</th>
                        <th className="px-4 py-3 font-semibold">Student Reference</th>
                        <th className="px-4 py-3 font-semibold">Submitted</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.map((payment) => {
                        const methodLabels = {
                          telebirr: 'Telebirr',
                          cbe_birr: 'CBE Birr',
                          other_mobile: 'Other mobile money',
                          manual: 'Manual',
                        }
                        const isVerifying = verifyingId === payment._id

                        return (
                          <tr key={payment._id} className="border-t border-slate-100 border-l-4 border-l-amber-400 align-middle">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={payment.payer?.name || 'Student'} size="sm" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">{payment.payer?.name || 'Unknown student'}</p>
                                  <p className="mt-0.5 text-xs text-slate-500">{payment.payer?.email || 'No email'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="max-w-48 px-4 py-4 font-medium text-slate-800">{payment.course?.title || 'Course unavailable'}</td>
                            <td className="px-4 py-4 font-bold text-green-800">{formatCurrency(payment.amount, payment.currency || 'ETB')}</td>
                            <td className="px-4 py-4">
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                                {methodLabels[payment.paymentMethod || payment.gateway] || 'Other'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {/* Prominence makes the platform-issued code quick to compare
                                  with the reference shown in the bank SMS or statement. */}
                              <code className="whitespace-nowrap rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-bold text-amber-950">{payment.platformPaymentCode || 'No code'}</code>
                            </td>
                            <td className="px-4 py-4 font-mono text-slate-700">{payment.manualPaymentReference}</td>
                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">{new Date(payment.updatedAt || payment.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {/* Approval marks the payment complete and activates enrollment on the server. */}
                                <button
                                  type="button"
                                  disabled={Boolean(verifyingId)}
                                  onClick={() => handleVerifyPayment(payment._id, 'approve')}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-green-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
                                >
                                  {isVerifying ? <i className="fas fa-spinner fa-spin" aria-hidden="true" /> : <i className="fas fa-check" aria-hidden="true" />}
                                  Approve
                                </button>
                                {/* Rejection retains the payment record and verifier metadata for accounting. */}
                                <button
                                  type="button"
                                  disabled={Boolean(verifyingId)}
                                  onClick={() => handleVerifyPayment(payment._id, 'reject')}
                                  className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
                                >
                                  {isVerifying ? <i className="fas fa-spinner fa-spin" aria-hidden="true" /> : <i className="fas fa-xmark" aria-hidden="true" />}
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : activeTab === 'live-tutor-applications' ? (
          <section className="space-y-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex items-center gap-3 text-xl font-extrabold text-slate-900"><i className="fas fa-video text-[#16A34A]" aria-hidden="true" />Live Tutor Applications</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-700">{liveTutorApplications.length} total</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-bold text-amber-900">{liveTutorApplications.filter((application) => application.status === 'pending').length} pending</span>
              </div>
            </header>

            {liveTutorError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{liveTutorError}</div>}
            {liveTutorSuccess && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{liveTutorSuccess}</div>}

            {liveTutorLoading ? (
              <div className="space-y-3" role="status" aria-label="Loading live tutor applications">
                {[1, 2, 3].map((row) => <div key={row} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}
              </div>
            ) : liveTutorApplications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                <i className="fas fa-inbox text-4xl text-slate-400" aria-hidden="true" />
                <p className="mt-4 text-lg font-bold text-slate-800">No live tutor applications yet</p>
                <p className="mt-2 text-sm text-slate-500">New applications will appear here for quality review.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1080px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Applicant</th>
                        <th className="px-5 py-3 font-semibold">Category & subjects</th>
                        <th className="px-5 py-3 font-semibold">Rate</th>
                        <th className="px-5 py-3 font-semibold">Languages</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Submitted</th>
                        <th className="px-5 py-3 font-semibold"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {liveTutorApplications.map((application) => (
                        <tr key={application._id} className="align-middle">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={application.user?.name || 'Applicant'} imageUrl={application.user?.profilePhoto} size="sm" />
                              <div className="min-w-0"><p className="font-semibold text-slate-900">{application.user?.name || 'Unknown applicant'}</p><p className="mt-0.5 text-xs text-slate-500">{application.user?.email || 'No email'}</p></div>
                            </div>
                          </td>
                          <td className="max-w-72 px-5 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-800">{application.mainCategory}</span><p className="mt-2 line-clamp-2 text-slate-600">{(application.subjects || []).join(', ') || 'No subjects listed'}</p></td>
                          <td className="px-5 py-4 font-bold text-[#15803D]">{formatCurrency(application.hourlyRate, application.currency || 'USD')}<span className="block text-xs font-normal text-slate-500">per hour</span></td>
                          <td className="px-5 py-4"><div className="flex max-w-48 flex-wrap gap-1.5">{(application.teachingLanguages || []).map((language) => <span key={language} className="rounded-full bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">{language}</span>)}</div></td>
                          <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[application.status] || 'bg-slate-100 text-slate-700'}`}>{application.status}</span></td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(application.createdAt)}</td>
                          <td className="px-5 py-4 text-right"><button type="button" onClick={() => openLiveTutorApplication(application)} className="rounded-xl border border-[#22C55E]/40 px-3 py-2 font-semibold text-[#15803D] transition hover:bg-[#F0FDF4]">Review</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : activeTab === 'applications' ? (
          <>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
        {successMessage && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{successMessage}</div>}

        <section aria-label="Application summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statusFilters.map((status) => (
            <div key={status} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm capitalize text-gray-600">{status === 'all' ? 'Total applications' : status}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts[status]}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Filter applications by status">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={activeFilter === status}
                  onClick={() => setActiveFilter(status)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-colors ${activeFilter === status ? 'bg-[#22C55E] text-white shadow-sm shadow-[#22C55E]/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
            <label className="w-full lg:max-w-sm">
              <span className="sr-only">Search applicants</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, or subject"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10"
              />
            </label>
          </div>

          {loading ? (
            <p className="p-10 text-center text-gray-600" role="status">Loading applications...</p>
          ) : applications.length === 0 ? (
            <p className="p-10 text-center text-gray-600">There are no teacher applications yet.</p>
          ) : visibleApplications.length === 0 ? (
            <p className="p-10 text-center text-gray-600">No applications match this filter or search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Applicant</th>
                    <th className="px-5 py-3 font-semibold">Subject</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Submitted</th>
                    <th className="px-5 py-3 font-semibold"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleApplications.map((application) => (
                    <tr key={application._id} className="align-middle">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={application.user?.name || 'Applicant'} imageUrl={application.user?.profilePhoto} size="sm" />
                          <div>
                            <p className="font-semibold">{application.user?.name || 'Unknown applicant'}</p>
                            <p className="mt-1 text-gray-500">{application.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{application.specificSubject}</td>
                      <td className="px-5 py-4 capitalize">{application.mainCategory}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[application.status] || 'bg-gray-100 text-gray-700'}`}>{application.status}</span></td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(application.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => openApplication(application)} className="rounded-xl border border-[#22C55E]/50 px-3 py-2 font-semibold text-[#15803D] transition hover:bg-[#F0FDF4]">
                          View / Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
		  </>
    ) : <ManageUsers />}
      </div>

      {activeTab === 'applications' && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:p-8" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeApplication()
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="application-detail-title" className="my-4 w-full max-w-4xl rounded-xl bg-white shadow-xl">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b bg-white px-5 py-4 sm:px-7">
              <div>
                <h2 id="application-detail-title" className="text-xl font-bold">Teacher application</h2>
                <p className="mt-1 text-sm text-gray-600">Submitted {formatDate(selectedApplication.createdAt)}</p>
              </div>
              <button type="button" onClick={closeApplication} className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50">Close</button>
            </div>

            <div className="space-y-7 p-5 sm:p-7">
              <section>
                <h3 className="font-bold text-green-900">Personal information</h3>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar name={selectedApplication.user?.name || 'Applicant'} imageUrl={selectedApplication.user?.profilePhoto} size="lg" />
                  <p className="font-semibold text-slate-900">{displayValue(selectedApplication.user?.name)}</p>
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div><dt className="text-xs text-gray-500">Name</dt><dd>{displayValue(selectedApplication.user?.name)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Email</dt><dd>{displayValue(selectedApplication.user?.email)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Phone</dt><dd>{displayValue(selectedApplication.phone)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Date of birth</dt><dd>{formatDate(selectedApplication.dateOfBirth)}</dd></div>
                  <div><dt className="text-xs text-gray-500">City / region</dt><dd>{[selectedApplication.city, selectedApplication.region].filter(Boolean).join(', ') || 'Not provided'}</dd></div>
                  <div><dt className="text-xs text-gray-500">National ID</dt><dd>{displayValue(selectedApplication.nationalId)}</dd></div>
                </dl>
              </section>

              <section>
                <h3 className="font-bold text-green-900">Teaching</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div><dt className="text-xs text-gray-500">Category / subject</dt><dd className="capitalize">{displayValue(selectedApplication.mainCategory)} / {displayValue(selectedApplication.specificSubject)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Teaching language</dt><dd className="capitalize">{displayValue(selectedApplication.teachingLanguage)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Method</dt><dd className="capitalize">{displayValue(selectedApplication.teachingMethod)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Availability</dt><dd>{selectedApplication.availableHoursPerWeek ?? 'Not provided'} hours / week, {(selectedApplication.availableDays || []).join(', ') || 'no days listed'}</dd></div>
                  {selectedApplication.hourlyRate > 0 && <div><dt className="text-xs text-gray-500">Hourly rate</dt><dd>{selectedApplication.hourlyRate}</dd></div>}
                </dl>
              </section>

              <section>
                <h3 className="font-bold text-green-900">Qualifications</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div><dt className="text-xs text-gray-500">Education</dt><dd className="capitalize">{displayValue(selectedApplication.educationLevel)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Institution</dt><dd>{displayValue(selectedApplication.institutionName)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Teaching experience</dt><dd>{selectedApplication.yearsOfExperience ?? 'Not provided'} years</dd></div>
                  <div><dt className="text-xs text-gray-500">Subject experience</dt><dd>{selectedApplication.yearsInSpecificSubject ?? 'Not provided'} years</dd></div>
                </dl>
                <p className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6">{displayValue(selectedApplication.bio)}</p>
                {selectedApplication.portfolioLink && <p className="mt-3 text-sm"><a className="text-green-800 underline" href={selectedApplication.portfolioLink} target="_blank" rel="noreferrer">Open portfolio</a></p>}
                {selectedApplication.demoVideoLink && <p className="mt-2 text-sm"><a className="text-green-800 underline" href={selectedApplication.demoVideoLink} target="_blank" rel="noreferrer">Open demo video</a></p>}
                {selectedApplication.qualificationCertificateUrl && <p className="mt-2 text-sm"><a className="text-green-800 underline" href={selectedApplication.qualificationCertificateUrl} target="_blank" rel="noreferrer">Open qualification certificate</a></p>}
                {selectedApplication.governmentIdUrl && <p className="mt-2 text-sm"><a className="text-green-800 underline" href={selectedApplication.governmentIdUrl} target="_blank" rel="noreferrer">Open government ID</a></p>}
              </section>

              <section>
                <h3 className="font-bold text-green-900">Subject assessment</h3>
                {(selectedApplication.assessmentAnswers || []).length ? (
                  <ol className="mt-3 space-y-4">
                    {selectedApplication.assessmentAnswers.map((answer, index) => (
                      <li key={`${selectedApplication._id}-answer-${index}`} className="rounded-lg border p-4">
                        <p className="font-medium">{index + 1}. {answer.question}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{answer.answer}</p>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-3 text-sm text-gray-600">No assessment answers provided.</p>}
              </section>

              <section className="border-t pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-bold">Current status</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[selectedApplication.status] || 'bg-gray-100 text-gray-700'}`}>{selectedApplication.status}</span>
                </div>
                {selectedApplication.reviewedAt && <p className="mt-3 text-sm text-gray-600">Reviewed {formatDate(selectedApplication.reviewedAt)}{selectedApplication.reviewedBy ? ` by ${selectedApplication.reviewedBy.name || selectedApplication.reviewedBy}` : ''}</p>}
                {selectedApplication.status === 'pending' ? (
                  <div className="mt-5 space-y-4">
                    <label className="block space-y-2 text-sm font-medium">Admin note (required when rejecting)
                      <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} className="min-h-24 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" placeholder="Add a review note or reason for rejection" />
                    </label>
                    <div className="flex flex-wrap justify-end gap-3">
                      <button type="button" disabled={actionLoading} onClick={() => reviewApplication('rejected')} className="rounded-lg bg-red-700 px-4 py-2.5 font-semibold text-white hover:bg-red-800 disabled:opacity-50">
                        {actionLoading && reviewStatus === 'rejected' ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button type="button" disabled={actionLoading} onClick={() => reviewApplication('approved')} className="rounded-lg bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                        {actionLoading && reviewStatus === 'approved' ? 'Approving...' : 'Approve'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">{selectedApplication.adminNote || 'No admin note.'}</p>
                )}
              </section>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'live-tutor-applications' && selectedLiveTutorApp && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-8" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeLiveTutorApplication()
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="live-tutor-detail-title" className="my-4 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div><h2 id="live-tutor-detail-title" className="text-xl font-extrabold text-slate-900">Live tutor application</h2><p className="mt-1 text-sm text-slate-500">Submitted {formatDate(selectedLiveTutorApp.createdAt)}</p></div>
              <button type="button" onClick={closeLiveTutorApplication} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
            </header>

            <div className="space-y-8 p-5 sm:p-7">
              {liveTutorError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{liveTutorError}</div>}
              {liveTutorSuccess && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{liveTutorSuccess}</div>}

              <section>
                <h3 className="font-bold text-[#15803D]">Applicant information</h3>
                <div className="mt-4 flex items-center gap-4"><Avatar name={selectedLiveTutorApp.user?.name || 'Applicant'} imageUrl={selectedLiveTutorApp.user?.profilePhoto} size="lg" /><div><p className="font-bold text-slate-900">{selectedLiveTutorApp.user?.name || 'Unknown applicant'}</p><p className="text-sm text-slate-600">{selectedLiveTutorApp.user?.email || 'No email'}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[selectedLiveTutorApp.user?.liveTutorStatus] || 'bg-slate-100 text-slate-700'}`}>{selectedLiveTutorApp.user?.liveTutorStatus || 'none'}</span></div></div>
              </section>

              <section className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-[#15803D]">Teaching details</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</dt><dd className="mt-1 capitalize text-slate-900">{selectedLiveTutorApp.mainCategory}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teaching level</dt><dd className="mt-1 capitalize text-slate-900">{selectedLiveTutorApp.teachingLevel}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hourly rate</dt><dd className="mt-1 font-bold text-[#15803D]">{formatCurrency(selectedLiveTutorApp.hourlyRate, selectedLiveTutorApp.currency || 'USD')}</dd></div>
                  <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trial session</dt><dd className="mt-1 text-slate-900">{selectedLiveTutorApp.trialSessionOffered ? `Yes — ${formatCurrency(selectedLiveTutorApp.trialSessionRate, selectedLiveTutorApp.currency || 'USD')}` : 'No'}</dd></div>
                </dl>
                <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subjects</p><div className="mt-2 flex flex-wrap gap-2">{(selectedLiveTutorApp.subjects || []).map((subject) => <span key={subject} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">{subject}</span>)}</div></div>
                <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Languages</p><div className="mt-2 flex flex-wrap gap-2">{(selectedLiveTutorApp.teachingLanguages || []).map((language) => <span key={language} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-800">{language}</span>)}</div></div>
                <div className="mt-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Session durations</p><div className="mt-2 flex flex-wrap gap-2">{(selectedLiveTutorApp.sessionDurations || []).map((duration) => <span key={duration} className="rounded-full bg-[#F0FDF4] px-3 py-1 text-sm font-semibold text-[#15803D]">{duration} min</span>)}</div></div>
              </section>

              <section className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-[#15803D]">Availability</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</dt><dd className="mt-1 text-slate-900">{selectedLiveTutorApp.timezone}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Minimum sessions per week</dt><dd className="mt-1 text-slate-900">{selectedLiveTutorApp.minimumSessionsPerWeek}</dd></div></dl>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">{(selectedLiveTutorApp.weeklyAvailability || []).map((slot) => <div key={slot.day} className="rounded-xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">{slot.day}</span><span className="ml-3 text-sm text-slate-600">{slot.startTime} – {slot.endTime}</span></div>)}</div>
              </section>

              <section className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-[#15803D]">Qualifications</h3>
                <p className="mt-4 text-sm font-semibold text-slate-700">{selectedLiveTutorApp.yearsOfExperience} years of teaching experience</p>
                <div className="mt-4 space-y-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</p><p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedLiveTutorApp.bio}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teaching approach</p><p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{selectedLiveTutorApp.teachingApproach}</p></div></div>
                {selectedLiveTutorApp.introVideoUrl && <a href={selectedLiveTutorApp.introVideoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#15803D] hover:underline"><i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />Open introduction video</a>}
              </section>

              <section className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-[#15803D]">Scenario assessment</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Scenario answers are the core of the live-tutor quality check: they show how an applicant thinks through real learner situations.</p>
                <ol className="mt-4 space-y-4">{(selectedLiveTutorApp.scenarioAnswers || []).map((scenario, index) => <li key={`${selectedLiveTutorApp._id}-scenario-${index}`} className="rounded-xl border border-slate-200 p-4"><p className="font-bold text-slate-900">{index + 1}. {scenario.scenario}</p><p className="mt-3 whitespace-pre-wrap rounded-lg bg-[#F0FDF4] p-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-[#15803D]">Applicant answer: </span>{scenario.answer}</p></li>)}</ol>
              </section>

              <section className="border-t border-slate-100 pt-6">
                <div className="flex flex-wrap items-center gap-3"><h3 className="font-bold text-slate-900">Review action</h3><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[selectedLiveTutorApp.status] || 'bg-slate-100 text-slate-700'}`}>{selectedLiveTutorApp.status}</span></div>
                {selectedLiveTutorApp.status === 'pending' ? (
                  <div className="mt-5 space-y-4"><label className="block text-sm font-semibold text-slate-800">Add a note <span className="font-normal text-slate-500">(required when rejecting)</span><textarea value={liveTutorReviewNote} onChange={(event) => setLiveTutorReviewNote(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" placeholder="Explain the decision or give helpful improvement feedback" /></label><p className="text-sm leading-6 text-slate-500">A rejection needs a note so the tutor understands how to improve before applying again.</p><div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={liveTutorActionLoading} onClick={() => handleReviewLiveTutorApp(selectedLiveTutorApp._id, 'rejected')} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-60">{liveTutorActionLoading ? 'Saving...' : 'Reject'}</button><button type="button" disabled={liveTutorActionLoading} onClick={() => handleReviewLiveTutorApp(selectedLiveTutorApp._id, 'approved')} className="rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#15803D] disabled:cursor-wait disabled:opacity-60">{liveTutorActionLoading ? 'Saving...' : 'Approve'}</button></div></div>
                ) : (<div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{selectedLiveTutorApp.adminNote || 'No admin note was provided.'}{selectedLiveTutorApp.reviewedAt && <p className="mt-2 text-slate-500">Reviewed {formatDate(selectedLiveTutorApp.reviewedAt)}</p>}</div>)}
              </section>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default AdminDashboard
