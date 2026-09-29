import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'

const emptyProfile = {
	bio: '',
	hourlyRate: 0,
	teachingLanguage: '',
	availableHoursPerWeek: 0,
	availableDays: [],
	portfolioLink: '',
	specificSubject: '',
	mainCategory: '',
	teachingMethod: '',
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TeacherProfile = () => {
	// Public teaching details are part of the reviewed TeacherApplication, while
	// the User document contains account identity and authentication fields.
	const [profile, setProfile] = useState(emptyProfile)
	const [savedProfile, setSavedProfile] = useState(emptyProfile)
	const [editing, setEditing] = useState(false)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const { user, token, loading: authLoading } = useAuth()

	useEffect(() => {
		let isCurrent = true

		const loadProfile = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/teacher-applications/my-application', {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				const application = response.data.application
				const profileData = {
					bio: application.bio || '',
					hourlyRate: application.hourlyRate ?? 0,
					teachingLanguage: application.teachingLanguage || '',
					availableHoursPerWeek: application.availableHoursPerWeek ?? 0,
					availableDays: application.availableDays || [],
					portfolioLink: application.portfolioLink || '',
					specificSubject: application.specificSubject || '',
					mainCategory: application.mainCategory || '',
					teachingMethod: application.teachingMethod || '',
				}
				if (isCurrent) {
					setProfile(profileData)
					setSavedProfile(profileData)
				}
			} catch (requestError) {
				if (isCurrent) {
					setError(requestError.response?.data?.message || 'Unable to load your teacher profile.')
				}
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		if (!authLoading) loadProfile()

		return () => {
			isCurrent = false
		}
	}, [authLoading, token])

	const handleChange = (field, value) => {
		setProfile((currentProfile) => ({ ...currentProfile, [field]: value }))
	}

	const toggleDay = (day) => {
		setProfile((currentProfile) => ({
			...currentProfile,
			availableDays: currentProfile.availableDays.includes(day)
				? currentProfile.availableDays.filter((selectedDay) => selectedDay !== day)
				: [...currentProfile.availableDays, day],
		}))
	}

	const handleCancel = () => {
		setProfile(savedProfile)
		setEditing(false)
		setError('')
		setSuccess('')
	}

	const handleSave = async () => {
		setSaving(true)
		setError('')
		setSuccess('')

		try {
			const response = await axios.put(
				'http://localhost:5000/api/teacher-applications/update-profile',
				{
					bio: profile.bio,
					hourlyRate: Number(profile.hourlyRate) || 0,
					availableHoursPerWeek: Number(profile.availableHoursPerWeek) || 0,
					availableDays: profile.availableDays,
					portfolioLink: profile.portfolioLink,
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			const application = response.data.application
			const updatedProfile = {
				...profile,
				bio: application.bio,
				hourlyRate: application.hourlyRate,
				availableHoursPerWeek: application.availableHoursPerWeek,
				availableDays: application.availableDays,
				portfolioLink: application.portfolioLink,
			}
			setProfile(updatedProfile)
			setSavedProfile(updatedProfile)
			setEditing(false)
			setSuccess(response.data.message || 'Profile updated successfully.')
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Unable to save your profile changes.')
		} finally {
			setSaving(false)
		}
	}

	const initials = (user?.name || 'Teacher')
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toUpperCase())
		.join('')

	const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100'
	const isLiveTeacher = profile.teachingMethod === 'live' || profile.teachingMethod === 'both'

	if (loading) {
		return <p className="py-12 text-center text-gray-600" role="status">Loading your profile...</p>
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
					<p className="mt-1 text-gray-600">Manage the teaching information learners can see.</p>
				</div>
				{!editing ? (
					<button type="button" onClick={() => { setEditing(true); setError(''); setSuccess('') }} className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">
						Edit Profile
					</button>
				) : (
					<div className="flex gap-2">
						<button type="button" onClick={handleCancel} disabled={saving} className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
						<button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800 disabled:opacity-50">
							{saving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				)}
			</header>

			{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
			{success && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{success}</div>}

			{/* Display mode prioritizes scan-friendly profile reading; edit mode exposes only safe public profile fields. */}
			<section className="grid gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:grid-cols-[minmax(240px,0.8fr)_1.5fr] lg:p-8">
				<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
					<div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-800" aria-label={`Avatar initials ${initials}`}>
						{initials}
					</div>
					<h2 className="mt-5 text-2xl font-bold text-gray-900">{user?.name || 'Teacher'}</h2>
					<span className="mt-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">Verified Teacher</span>
					<p className="mt-5 font-semibold text-gray-800">{profile.specificSubject || 'Subject not provided'}</p>
					<p className="mt-1 capitalize text-gray-600">{profile.mainCategory || 'Category not provided'}</p>
					<div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
						<span className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize text-gray-700">{profile.teachingMethod || 'Method not set'}</span>
						<span className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize text-gray-700">{profile.teachingLanguage || 'Language not set'}</span>
					</div>
				</div>

				<div className="min-w-0 border-t border-gray-100 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
					{!editing ? (
						<div className="space-y-6">
							<section>
								<h3 className="font-bold text-gray-900">About me</h3>
								<p className="mt-2 whitespace-pre-wrap leading-7 text-gray-600">{profile.bio || 'No bio added yet.'}</p>
							</section>
							<dl className="grid gap-5 sm:grid-cols-2">
								{isLiveTeacher && <div><dt className="text-sm text-gray-500">Hourly rate</dt><dd className="mt-1 font-semibold text-gray-900">ETB {Number(profile.hourlyRate).toLocaleString()} per hour</dd></div>}
								<div><dt className="text-sm text-gray-500">Availability</dt><dd className="mt-1 font-semibold text-gray-900">{profile.availableHoursPerWeek} hours per week</dd></div>
								<div className="sm:col-span-2">
									<dt className="text-sm text-gray-500">Available days</dt>
									<dd className="mt-2 flex flex-wrap gap-2">
										{profile.availableDays.length > 0 ? profile.availableDays.map((day) => <span key={day} className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-800">{day}</span>) : <span className="text-gray-600">No days selected</span>}
									</dd>
								</div>
								{profile.portfolioLink && <div className="sm:col-span-2"><dt className="text-sm text-gray-500">Portfolio</dt><dd className="mt-1 break-all"><a href={profile.portfolioLink} target="_blank" rel="noreferrer" className="font-semibold text-green-800 underline">{profile.portfolioLink}</a></dd></div>}
							</dl>
						</div>
					) : (
						<div className="space-y-5">
							<label className="block space-y-2 text-sm font-semibold">Bio
								<textarea className={`${inputClass} min-h-36`} value={profile.bio} onChange={(event) => handleChange('bio', event.target.value)} />
								<span className="block text-right font-normal text-gray-500">{profile.bio.length} characters</span>
							</label>
							{/* Hourly rates apply only when the teacher offers live sessions. */}
							{isLiveTeacher && <label className="block space-y-2 text-sm font-semibold">Hourly rate (ETB)
								<input className={inputClass} type="number" min="0" value={profile.hourlyRate} onChange={(event) => handleChange('hourlyRate', event.target.value)} />
							</label>}
							<label className="block space-y-2 text-sm font-semibold">Available hours per week
								<input className={inputClass} type="number" min="0" value={profile.availableHoursPerWeek} onChange={(event) => handleChange('availableHoursPerWeek', event.target.value)} />
							</label>
							<fieldset>
								<legend className="mb-2 text-sm font-semibold">Available days</legend>
								<div className="flex flex-wrap gap-2">
									{daysOfWeek.map((day) => {
										const selected = profile.availableDays.includes(day)
										return <button key={day} type="button" aria-pressed={selected} onClick={() => toggleDay(day)} className={`rounded-lg border px-3 py-2 text-sm font-medium ${selected ? 'border-green-700 bg-green-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{day}</button>
									})}
								</div>
							</fieldset>
							<label className="block space-y-2 text-sm font-semibold">Portfolio link
								<input className={inputClass} type="url" value={profile.portfolioLink} onChange={(event) => handleChange('portfolioLink', event.target.value)} placeholder="https://example.com" />
							</label>
						</div>
					)}
				</div>
			</section>
		</div>
	)
}

export default TeacherProfile
