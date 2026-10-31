import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import API_BASE_URL from '../../../config/api'
import { useAuth } from '../../../context/AuthContext'

const initialAgenda = [
  { minutes: 5, activity: 'Introductions' },
  { minutes: 10, activity: 'Find real problems' },
  { minutes: 15, activity: 'Brainstorm solutions' },
  { minutes: 15, activity: 'Customers and feasibility' },
  { minutes: 10, activity: 'Choose ideas' },
  { minutes: 5, activity: 'Agree on next steps' },
]

const makeInitialForm = () => ({
  title: '',
  description: '',
  type: 'idea_lab',
  startsAt: '',
  durationMinutes: 60,
  capacity: 10,
  facilitatorName: '',
  guestName: '',
  guestTitle: '',
  recommendedCategory: 'business',
  agenda: initialAgenda.map((item) => ({ ...item })),
})

const statusClass = {
  scheduled: 'bg-blue-100 text-blue-800',
  live: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-700',
  cancelled: 'bg-red-100 text-red-800',
}

const localDateTime = (value) => new Date(value).toLocaleString()
const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {})

const CommunityAdminTab = () => {
  const { token } = useAuth()
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState(makeInitialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState(null)
  const [participants, setParticipants] = useState([])
  const [outcomes, setOutcomes] = useState({
    summary: '',
    problemStatements: [''],
    resources: [{ title: '', url: '' }],
    nextSteps: [''],
  })

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    const headers = authHeaders(token)
    try {
      const [upcomingResponse, pastResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/community`, { headers }),
        axios.get(`${API_BASE_URL}/community`, { params: { past: 'true' }, headers }),
      ])
      const unique = new Map()
      ;[...(upcomingResponse.data.sessions || []), ...(pastResponse.data.sessions || [])]
        .forEach((session) => unique.set(String(session._id), session))
      setSessions([...unique.values()])
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load community sessions.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => {
    const aUpcoming = ['scheduled', 'live'].includes(a.status)
    const bUpcoming = ['scheduled', 'live'].includes(b.status)
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1
    const difference = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    return aUpcoming ? difference : -difference
  }), [sessions])

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const updateAgenda = (index, field, value) => {
    setForm((current) => ({
      ...current,
      agenda: current.agenda.map((item, itemIndex) => (
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )),
    }))
  }

  const createSession = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await axios.post(`${API_BASE_URL}/community`, {
        title: form.title,
        description: form.description,
        type: form.type,
        startsAt: new Date(form.startsAt).toISOString(),
        durationMinutes: Number(form.durationMinutes),
        capacity: Number(form.capacity),
        facilitatorName: form.facilitatorName,
        guestMentor: form.guestName.trim() || form.guestTitle.trim()
          ? { name: form.guestName.trim(), title: form.guestTitle.trim() }
          : undefined,
        recommendedCategory: form.recommendedCategory,
        agenda: form.agenda.map((item) => ({ minutes: Number(item.minutes), activity: item.activity.trim() })),
      }, { headers: authHeaders(token) })
      setSuccess(response.data.message || 'Community session created.')
      setForm(makeInitialForm())
      await loadSessions()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create the community session.')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (session, status) => {
    setActionId(session._id)
    setError('')
    setSuccess('')
    try {
      // Marking a session live also opens the backend join window for its registered participants.
      await axios.put(`${API_BASE_URL}/community/${session._id}/status`, { status }, {
        headers: authHeaders(token),
      })
      setSuccess(status === 'live' ? 'Session started. Registered participants can now join.' : `Session marked ${status}.`)
      await loadSessions()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update this session.')
    } finally {
      setActionId('')
    }
  }

   const showParticipants = async (session) => {
    setActionId(session._id)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/community/${session._id}/participants`, { headers: authHeaders(token) })
      setParticipants(response.data.participants || [])
      setModal({ type: 'participants', session })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load session participants.')
    } finally {
      setActionId('')
    }
  }

  const openOutcomes = (session) => {
    setOutcomes({
      summary: session.outcomes?.summary || '',
      problemStatements: session.outcomes?.problemStatements?.length ? [...session.outcomes.problemStatements] : [''],
      resources: session.outcomes?.resources?.length ? session.outcomes.resources.map((item) => ({ ...item })) : [{ title: '', url: '' }],
      nextSteps: session.outcomes?.nextSteps?.length ? [...session.outcomes.nextSteps] : [''],
    })
    setModal({ type: 'outcomes', session })
  }

  const saveOutcomes = async (event) => {
    event.preventDefault()
    if (!modal?.session) return
    setActionId(modal.session._id)
    setError('')
    setSuccess('')
    try {
      await axios.put(`${API_BASE_URL}/community/${modal.session._id}/outcomes`, {
        summary: outcomes.summary.trim(),
        problemStatements: outcomes.problemStatements.map((item) => item.trim()).filter(Boolean),
        resources: outcomes.resources
          .map((item) => ({ title: item.title.trim(), url: item.url.trim() }))
          .filter((item) => item.title && item.url),
        nextSteps: outcomes.nextSteps.map((item) => item.trim()).filter(Boolean),
      }, { headers: authHeaders(token) })
      setModal(null)
      setSuccess('Session outcomes saved and published.')
      await loadSessions()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save session outcomes.')
    } finally {
      setActionId('')
    }
  }

  const updateOutcomeList = (field, index, value) => {
    setOutcomes((current) => ({
      ...current,
      [field]: current[field].map((item, itemIndex) => itemIndex === index ? value : item),
    }))
  }

  const addOutcomeRow = (field) => {
    setOutcomes((current) => ({
      ...current,
      [field]: [...current[field], field === 'resources' ? { title: '', url: '' } : ''],
    }))
  }

  return (
    <section className="space-y-8">
      <header>
        <h2 className="text-xl font-extrabold text-slate-900">Community sessions</h2>
        {/* Admin-created gatherings seed the MVP calendar until recurring community programming is available. */}
        <p className="mt-1 text-sm text-slate-600">Create and facilitate idea labs, project sessions, and mentor reviews.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {success && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}</div>}

      <form onSubmit={createSession} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div>
          <h3 className="text-lg font-extrabold">Create session</h3>
          <p className="mt-1 text-sm text-slate-600">New sessions appear in the public community calendar.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Title
            <input required value={form.title} onChange={(event) => setField('title', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Session type
            <select value={form.type} onChange={(event) => setField('type', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal">
              <option value="idea_lab">Idea Lab</option><option value="build_project">Build Project</option><option value="mentor_review">Mentor Review</option><option value="showcase">Showcase</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">Description
            <textarea required rows="3" value={form.description} onChange={(event) => setField('description', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Date and time
            <input required type="datetime-local" value={form.startsAt} onChange={(event) => setField('startsAt', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Facilitator name
            <input required value={form.facilitatorName} onChange={(event) => setField('facilitatorName', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Duration (minutes)
            <input required min="1" type="number" value={form.durationMinutes} onChange={(event) => setField('durationMinutes', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Capacity (2–50)
            <input required min="2" max="50" type="number" value={form.capacity} onChange={(event) => setField('capacity', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Recommended learning category
            <select value={form.recommendedCategory} onChange={(event) => setField('recommendedCategory', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal">
              <option value="technology">Technology</option><option value="languages">Languages</option><option value="sciences">Sciences</option><option value="business">Business</option><option value="leadership">Leadership</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">Guest mentor name (optional)
            <input value={form.guestName} onChange={(event) => setField('guestName', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
          <label className="text-sm font-semibold text-slate-700">Guest mentor title (optional)
            <input value={form.guestTitle} onChange={(event) => setField('guestTitle', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-extrabold text-slate-800">Agenda</legend>
          {form.agenda.map((item, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[120px_1fr_auto]">
              <label className="sr-only" htmlFor={`agenda-minutes-${index}`}>Minutes for agenda item {index + 1}</label>
              <input id={`agenda-minutes-${index}`} min="1" type="number" value={item.minutes} onChange={(event) => updateAgenda(index, 'minutes', event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2.5" aria-label="Minutes" />
              <input value={item.activity} onChange={(event) => updateAgenda(index, 'activity', event.target.value)} placeholder="Activity" className="rounded-lg border border-slate-300 px-3 py-2.5" aria-label="Activity" />
              <button type="button" onClick={() => setForm((current) => ({ ...current, agenda: current.agenda.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => setForm((current) => ({ ...current, agenda: [...current.agenda, { minutes: 5, activity: '' }] }))} className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50">
            <i className="fas fa-plus mr-2" aria-hidden="true" />Add agenda row
          </button>
        </fieldset>
        <button type="submit" disabled={saving} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900 disabled:opacity-60">
          {saving ? 'Creating…' : 'Create session'}
        </button>
      </form>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold">All sessions</h3>
          <button type="button" onClick={loadSessions} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-white disabled:opacity-50">
            <i className="fas fa-rotate mr-2" aria-hidden="true" />Refresh
          </button>
        </div>
        {loading ? (
          <div className="mt-4 space-y-3" role="status" aria-label="Loading community sessions">
            {[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
        ) : sortedSessions.length === 0 ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No community sessions have been created.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sortedSessions.map((session) => (
              <article key={session._id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold">{session.title}</h4>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusClass[session.status] || 'bg-slate-100 text-slate-700'}`}>{session.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{localDateTime(session.startsAt)}</p>
                  <p className="mt-1 text-sm text-slate-600">{session.participantCount}/{session.capacity} participants</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.status === 'scheduled' && (
                    <button type="button" onClick={() => updateStatus(session, 'live')} disabled={actionId === session._id} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                      Start session
                    </button>
                  )}
                  <button type="button" onClick={() => showParticipants(session)} disabled={actionId === session._id} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    View participants
                  </button>
                  {['scheduled', 'live'].includes(session.status) && (
                    <>
                      <button type="button" onClick={() => openOutcomes(session)} className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50">Complete and add outcomes</button>
                      <button type="button" onClick={() => updateStatus(session, 'cancelled')} disabled={actionId === session._id} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">Cancel session</button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="community-modal-title" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="community-modal-title" className="text-xl font-black">{modal.type === 'participants' ? 'Session participants' : 'Complete session and publish outcomes'}</h3>
                <p className="mt-1 text-sm text-slate-600">{modal.session.title}</p>
              </div>
              <button type="button" aria-label="Close dialog" onClick={() => setModal(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><i className="fas fa-times" aria-hidden="true" /></button>
            </div>

            {modal.type === 'participants' ? (
              <div className="mt-5">
                {participants.length ? (
                  <ul className="divide-y divide-slate-100">
                    {participants.map((participant, index) => (
                      <li key={participant.user?._id || index} className="py-3">
                        <p className="font-bold text-slate-800">{participant.user?.name || 'Unknown user'}</p>
                        <p className="text-sm text-slate-600">{participant.user?.email || 'Email unavailable'}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="py-8 text-center text-sm text-slate-600">No participants have registered yet.</p>}
              </div>
            ) : (
              <form onSubmit={saveOutcomes} className="mt-5 space-y-5">
                <label className="block text-sm font-bold">Summary
                  <textarea required rows="3" value={outcomes.summary} onChange={(event) => setOutcomes((current) => ({ ...current, summary: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" />
                </label>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-bold">Problem statements</legend>
                  {outcomes.problemStatements.map((item, index) => (
                    <input key={index} value={item} onChange={(event) => updateOutcomeList('problemStatements', index, event.target.value)} placeholder="Problem statement" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  ))}
                  <button type="button" onClick={() => addOutcomeRow('problemStatements')} className="text-sm font-bold text-emerald-800">+ Add problem statement</button>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-bold">Resources</legend>
                  {outcomes.resources.map((resource, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-2">
                      <input value={resource.title} onChange={(event) => setOutcomes((current) => ({ ...current, resources: current.resources.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} placeholder="Resource title" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                      <input type="url" value={resource.url} onChange={(event) => setOutcomes((current) => ({ ...current, resources: current.resources.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item) }))} placeholder="https://resource.example" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                    </div>
                  ))}
                  <button type="button" onClick={() => addOutcomeRow('resources')} className="text-sm font-bold text-emerald-800">+ Add resource</button>
                </fieldset>
                <fieldset className="space-y-2">
                  <legend className="text-sm font-bold">Next steps</legend>
                  {outcomes.nextSteps.map((item, index) => (
                    <input key={index} value={item} onChange={(event) => updateOutcomeList('nextSteps', index, event.target.value)} placeholder="Next step" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                  ))}
                  <button type="button" onClick={() => addOutcomeRow('nextSteps')} className="text-sm font-bold text-emerald-800">+ Add next step</button>
                </fieldset>
                <button type="submit" disabled={actionId === modal.session._id} className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900 disabled:opacity-60">
                  {actionId === modal.session._id ? 'Saving…' : 'Save outcomes and complete'}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  )
}

export default CommunityAdminTab
