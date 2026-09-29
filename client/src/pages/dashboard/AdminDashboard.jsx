import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-green-100 text-green-900',
  rejected: 'bg-red-100 text-red-900',
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const displayValue = (value) => value || 'Not provided'

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 text-gray-900">
        <section className="max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold">Admin session required</h1>
          <p className="mt-3 text-gray-600">Please sign in again to review teacher applications.</p>
          <button onClick={handleLogout} className="mt-6 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">Return to login</button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-sm font-bold text-green-700">BarakahTech Academy</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Review teacher applications</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.name || 'Administrator'}</span>
            <button onClick={handleLogout} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
        {successMessage && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{successMessage}</div>}

        <section aria-label="Application summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statusFilters.map((status) => (
            <div key={status} className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm capitalize text-gray-600">{status === 'all' ? 'Total applications' : status}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{counts[status]}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Filter applications by status">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={activeFilter === status}
                  onClick={() => setActiveFilter(status)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${activeFilter === status ? 'bg-green-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
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
                        <p className="font-semibold">{application.user?.name || 'Unknown applicant'}</p>
                        <p className="mt-1 text-gray-500">{application.user?.email || 'No email'}</p>
                      </td>
                      <td className="px-5 py-4">{application.specificSubject}</td>
                      <td className="px-5 py-4 capitalize">{application.mainCategory}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[application.status] || 'bg-gray-100 text-gray-700'}`}>{application.status}</span></td>
                      <td className="px-5 py-4 text-gray-600">{formatDate(application.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => openApplication(application)} className="rounded-lg border border-green-700 px-3 py-2 font-semibold text-green-800 hover:bg-green-50">
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
      </div>

      {selectedApplication && (
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
    </main>
  )
}

export default AdminDashboard
