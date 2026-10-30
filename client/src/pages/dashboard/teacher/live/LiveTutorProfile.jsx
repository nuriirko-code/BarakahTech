import API_BASE_URL from '../../../../config/api.js'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../../../context/AuthContext'

const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-normal text-slate-900 outline-none focus:border-green-600 focus:ring-4 focus:ring-green-600/10'
const categories = ['technology', 'languages', 'sciences', 'business', 'leadership']
const levels = ['beginner', 'intermediate', 'advanced', 'all']
const currencies = ['USD', 'EUR', 'GBP', 'ETB', 'CAD', 'AUD', 'SAR', 'AED']

const profileToForm = (profile) => ({
  bio: profile.bio || '',
  teachingApproach: profile.teachingApproach || '',
  subjects: (profile.subjects || []).join(', '),
  mainCategory: profile.mainCategory || '',
  teachingLevel: profile.teachingLevel || '',
  teachingLanguages: (profile.teachingLanguages || []).join(', '),
  introVideoUrl: profile.introVideoUrl || '',
  sessionDuration: profile.sessionDuration ?? profile.sessionDurations?.[0] ?? '',
  sessionPrice: profile.sessionPrice ?? profile.hourlyRate ?? '',
  currency: profile.currency || 'USD',
})

const parseList = (value) => [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))]

const LiveTutorProfile = () => {
  const { token } = useAuth()
  const [formData, setFormData] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let isCurrent = true

    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/live-tutors/my-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) {
          setFormData(profileToForm(response.data.profile))
          setPhotoPreview(response.data.profile.profilePhoto || response.data.profile.user?.profilePhoto || '')
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load your live tutor profile.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadProfile()

    return () => { isCurrent = false }
  }, [token])

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file for your profile photo.')
      event.target.value = ''
      return
    }
    if (file.size > 1_800_000) {
      setError('Choose a profile photo smaller than 1.8 MB.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhoto(reader.result)
        setPhotoPreview(reader.result)
        setError('')
        setSuccess('')
      }
    }
    reader.onerror = () => setError('The selected profile photo could not be read.')
    reader.readAsDataURL(file)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        subjects: parseList(formData.subjects),
        teachingLanguages: parseList(formData.teachingLanguages),
        sessionDuration: Number(formData.sessionDuration),
        sessionPrice: Number(formData.sessionPrice),
        ...(profilePhoto ? { profilePhoto } : {}),
      }
      const response = await axios.put(`${API_BASE_URL}/live-tutors/my-profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFormData(profileToForm(response.data.profile))
      setProfilePhoto('')
      setPhotoPreview(response.data.profile.profilePhoto || response.data.profile.user?.profilePhoto || '')
      setSuccess(response.data.message || 'Your tutor profile was updated.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your tutor profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="space-y-4" role="status" aria-label="Loading tutor profile"><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="h-96 animate-pulse rounded-2xl bg-slate-200" /></div>
  }

  if (!formData) {
    return (
      <section className="space-y-6">
        <header>
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">Live tutoring</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Tutor Profile</h1>
        </header>
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || 'Sign in with your approved live tutor account to manage this profile.'}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <i className="fas fa-id-card text-lg" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">Live tutoring</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Tutor Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Update the public information students see when they browse tutors.</p>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {success && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Profile photo</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            {photoPreview
              ? <img src={photoPreview} alt="Tutor profile preview" className="h-24 w-24 rounded-full object-cover ring-4 ring-green-50" />
              : <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl text-slate-400"><i className="fas fa-user" aria-hidden="true" /></span>}
            <label className="text-sm font-semibold text-slate-800">
              Choose a new photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:font-bold file:text-green-800 hover:file:bg-green-100" />
              <span className="mt-1 block font-normal text-slate-500">Image files up to 1.8 MB.</span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-900">About your teaching</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-800">
              Teaching category
              <select required value={formData.mainCategory} onChange={(event) => updateField('mainCategory', event.target.value)} className={inputClass}>
                <option value="">Choose a category</option>
                {categories.map((category) => <option key={category} value={category}>{category[0].toUpperCase() + category.slice(1)}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-800">
              Teaching level
              <select required value={formData.teachingLevel} onChange={(event) => updateField('teachingLevel', event.target.value)} className={inputClass}>
                <option value="">Choose a level</option>
                {levels.map((level) => <option key={level} value={level}>{level === 'all' ? 'All levels' : level[0].toUpperCase() + level.slice(1)}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-800 sm:col-span-2">
              Public bio <span className="font-normal text-slate-500">(at least 100 characters)</span>
              <textarea required minLength={100} rows={5} value={formData.bio} onChange={(event) => updateField('bio', event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-bold text-slate-800 sm:col-span-2">
              Teaching approach <span className="font-normal text-slate-500">(at least 50 characters)</span>
              <textarea required minLength={50} rows={4} value={formData.teachingApproach} onChange={(event) => updateField('teachingApproach', event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-bold text-slate-800">
              Subjects <span className="font-normal text-slate-500">(comma-separated)</span>
              <input required value={formData.subjects} onChange={(event) => updateField('subjects', event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-bold text-slate-800">
              Teaching languages <span className="font-normal text-slate-500">(comma-separated)</span>
              <input required value={formData.teachingLanguages} onChange={(event) => updateField('teachingLanguages', event.target.value)} className={inputClass} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Session offer</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-800">
              Session duration (minutes)
              <input required type="number" min="1" max="240" value={formData.sessionDuration} onChange={(event) => updateField('sessionDuration', event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-bold text-slate-800">
              Paid session price
              <input required type="number" min="0.01" step="0.01" value={formData.sessionPrice} onChange={(event) => updateField('sessionPrice', event.target.value)} className={inputClass} />
            </label>
            <label className="text-sm font-bold text-slate-800">
              Currency
              <select required value={formData.currency} onChange={(event) => updateField('currency', event.target.value)} className={inputClass}>
                {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-800">
              Introduction video URL <span className="font-normal text-slate-500">(optional)</span>
              <input type="url" value={formData.introVideoUrl} onChange={(event) => updateField('introVideoUrl', event.target.value)} className={inputClass} placeholder="https://..." />
            </label>
          </div>
        </section>

        <footer className="flex justify-end border-t border-slate-200 pt-5">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
            <i className={`fas ${saving ? 'fa-spinner animate-spin' : 'fa-floppy-disk'}`} aria-hidden="true" />
            {saving ? 'Saving profile...' : 'Save profile'}
          </button>
        </footer>
      </form>
    </section>
  )
}

export default LiveTutorProfile
