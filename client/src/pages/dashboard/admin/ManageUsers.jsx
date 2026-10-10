import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Avatar from '../../../components/common/Avatar'
import { useAuth } from '../../../context/AuthContext'

// One role-to-style map keeps badges consistent across every table row.
const roleStyles = {
  student: 'bg-green-50 text-green-700 ring-green-200',
  teacher: 'bg-blue-50 text-blue-700 ring-blue-200',
  pending_teacher: 'bg-amber-50 text-amber-800 ring-amber-200',
  admin: 'bg-violet-50 text-violet-700 ring-violet-200',
}

// Filter metadata lets the buttons render from data instead of duplicated JSX.
const roleFilters = [
  { value: 'all', label: 'All' },
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'pending_teacher', label: 'Pending Teacher' },
  { value: 'admin', label: 'Admin' },
]

// Database timestamps are stored as ISO dates; this converts them into a
// browser-local, readable value for administrators.
const formatDate = (dateValue) => {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString()
}

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    let isCurrent = true
                                                                                  
    // This endpoint is admin-only on the server. The browser sends the JWT so
    // authMiddleware can identify the request before roleMiddleware checks admin access.
    const loadUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) setUsers(response.data.users || [])
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Unable to load users.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadUsers()
    return () => {
      isCurrent = false
    }
  }, [token])

  // visibleUsers is derived from the source user list and filter controls;
  // deriving it avoids maintaining a second, potentially stale users array.
  const visibleUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesSearch = !query || [user.name, user.email]
        .some((value) => value?.toLowerCase().includes(query))
      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, searchTerm])

  // Dashboard counts are also derived from users, so a deactivate/reactivate
  // response automatically keeps the table and summary in agreement.
  const stats = {
    total: users.length,
    students: users.filter((user) => user.role === 'student').length,
    teachers: users.filter((user) => user.role === 'teacher').length,
    pendingTeachers: users.filter((user) => user.role === 'pending_teacher').length,
  }

  // The same endpoint toggles isActive. Its name mentions deactivation because
  // that is the primary admin action, while reactivation restores the account.
  const handleDeactivate = async (userId) => {
    setActionLoading(userId)
    setError('')
    setSuccessMessage('')

    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // The server returns the safe updated user. Replacing that one record is
      // faster and clearer than refetching every account after one action.
      setUsers((currentUsers) => currentUsers.map((user) => (
        user._id === userId ? response.data.user : user
      )))
      setSuccessMessage(response.data.message)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this account.')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">User Management</h2>
          <p className="mt-1 text-sm text-slate-500">Review account status across the platform.</p>
        </div>
        <span className="rounded-full bg-[#F0FDF4] px-3 py-1.5 text-sm font-bold text-[#15803D] ring-1 ring-[#22C55E]/20">{users.length} total users</span>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</div>}
      {successMessage && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">{successMessage}</div>}

      {/* Summary cards provide a quick operational view before the detailed table. */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="User statistics">
        {[
          { label: 'Total Users', value: stats.total, icon: 'fas fa-users', color: 'text-slate-600 bg-slate-100' },
          { label: 'Students', value: stats.students, icon: 'fas fa-graduation-cap', color: 'text-green-700 bg-green-50' },
          { label: 'Teachers', value: stats.teachers, icon: 'fas fa-chalkboard-user', color: 'text-blue-700 bg-blue-50' },
          { label: 'Pending Teachers', value: stats.pendingTeachers, icon: 'fas fa-hourglass-half', color: 'text-amber-700 bg-amber-50' },
        ].map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${stat.color}`} aria-hidden="true"><i className={stat.icon} /></span>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </article>
        ))}
      </section>

      {/* Filters change the derived visibleUsers list only; they never mutate the server data. */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Filter users by role">
            {roleFilters.map((filter) => (
              <button key={filter.value} type="button" onClick={() => setRoleFilter(filter.value)} aria-pressed={roleFilter === filter.value} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${roleFilter === filter.value ? 'bg-[#16A34A] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {filter.label}
              </button>
            ))}
          </div>
          <label className="relative w-full lg:max-w-sm">
            <span className="sr-only">Search users</span>
            <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name or email" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10" />
          </label>
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-500" role="status">Loading users...</p>
        ) : visibleUsers.length === 0 ? (
          <p className="p-10 text-center text-slate-500">No users match this search or filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name || 'User'} imageUrl={user.profilePhoto} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="mt-0.5 text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${roleStyles[user.role] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{user.role?.replace('_', ' ')}</span></td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${user.isActive ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-4 text-right">
                      {/* Admin accounts are intentionally protected from deactivation through this UI. */}
                      {user.role === 'admin' ? <span className="text-xs font-medium text-slate-400">Protected</span> : (
                        <button type="button" disabled={actionLoading === user._id} onClick={() => handleDeactivate(user._id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${user.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                          {actionLoading === user._id ? 'Saving...' : user.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

export default ManageUsers
