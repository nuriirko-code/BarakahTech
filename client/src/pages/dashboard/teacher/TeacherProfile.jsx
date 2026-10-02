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

	const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'
	const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#22C55E]/25 transition-all hover:bg-[#16A34A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 disabled:opacity-50'
	const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50'

	const isLiveTeacher = profile.teachingMethod === 'live' || profile.teachingMethod === 'both'

	if (loading) {
		return (
			<div className="flex flex-col items-center gap-3 py-16 text-slate-500" role="status">
				<i className="fas fa-circle-notch fa-spin text-2xl text-[#22C55E]" aria-hidden="true" />
				Loading your profile...
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">My Profile</h1>
					<p className="mt-1 text-slate-500">Manage the teaching information learners can see.</p>
				</div>
				{!editing ? (
					<button
						type="button"
						onClick={() => { setEditing(true); setError(''); setSuccess('') }}
						className={primaryButtonClass}
					>
						<i className="fas fa-pen text-xs" aria-hidden="true" />
						Edit Profile
					</button>
				) : (
					<div className="flex gap-2">
						<button type="button" onClick={handleCancel} disabled={saving} className={secondaryButtonClass}>
							Cancel
						</button>
						<button type="button" onClick={handleSave} disabled={saving} className={primaryButtonClass}>
							{saving ? (
								<>
									<i className="fas fa-circle-notch fa-spin text-xs" aria-hidden="true" />
									Saving...
								</>
							) : (
								<>
									<i className="fas fa-check text-xs" aria-hidden="true" />
									Save Changes
								</>
							)}
						</button>
					</div>
				)}
			</header>

			{error && (
				<div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
					<i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
					{error}
				</div>
			)}
			{success && (
				<div role="status" className="flex items-start gap-3 rounded-xl border border-[#22C55E]/30 bg-[#F0FDF4] p-4 text-sm font-medium text-[#15803D]">
					<i className="fas fa-circle-check mt-0.5" aria-hidden="true" />
					{success}
				</div>
			)}

			{/* Display mode prioritizes scan-friendly profile reading; edit mode exposes only safe public profile fields. */}
			<section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(240px,0.8fr)_1.5fr] lg:p-8">
				<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
					<div
						className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#15803D] text-3xl font-extrabold text-white shadow-lg shadow-[#22C55E]/30 ring-4 ring-[#F0FDF4]"
						aria-label={`Avatar initials ${initials}`}
					>
						{initials}
					</div>
					<h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">{user?.name || 'Teacher'}</h2>
					<span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-sm font-bold text-[#16A34A] ring-1 ring-[#22C55E]/20">
						<i className="fas fa-badge-check" aria-hidden="true" />
						Verified Teacher
					</span>
					<p className="mt-5 font-bold text-slate-800">{profile.specificSubject || 'Subject not provided'}</p>
					<p className="mt-1 capitalize text-slate-500">{profile.mainCategory || 'Category not provided'}</p>
					<div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
						<span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-600">
							<i className="fas fa-chalkboard-user mr-1.5 text-xs" aria-hidden="true" />
							{profile.teachingMethod || 'Method not set'}
						</span>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-600">
							<i className="fas fa-language mr-1.5 text-xs" aria-hidden="true" />
							{profile.teachingLanguage || 'Language not set'}
						</span>
					</div>
				</div>

				<div className="min-w-0 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
					{!editing ? (
						<div className="space-y-6">
							<section>
								<h3 className="flex items-center gap-2 font-bold text-slate-900">
									<i className="fas fa-quote-left text-xs text-[#22C55E]" aria-hidden="true" />
									About me
								</h3>
								<p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">{profile.bio || 'No bio added yet.'}</p>
							</section>
							<dl className="grid gap-5 sm:grid-cols-2">
								{isLiveTeacher && (
									<div>
										<dt className="text-sm font-medium text-slate-500">Hourly rate</dt>
										<dd className="mt-1 font-bold text-slate-900">ETB {Number(profile.hourlyRate).toLocaleString()} <span className="text-sm font-medium text-slate-500">per hour</span></dd>
									</div>
								)}
								<div>
									<dt className="text-sm font-medium text-slate-500">Availability</dt>
									<dd className="mt-1 font-bold text-slate-900">{profile.availableHoursPerWeek} hours per week</dd>
								</div>
								<div className="sm:col-span-2">
									<dt className="text-sm font-medium text-slate-500">Available days</dt>
									<dd className="mt-2 flex flex-wrap gap-2">
										{profile.availableDays.length > 0 ? profile.availableDays.map((day) => (
											<span key={day} className="rounded-full bg-[#F0FDF4] px-3 py-1 text-sm font-semibold text-[#15803D] ring-1 ring-[#22C55E]/20">
												{day}
											</span>
										)) : <span className="text-slate-500">No days selected</span>}
									</dd>
								</div>
								{profile.portfolioLink && (
									<div className="sm:col-span-2">
										<dt className="text-sm font-medium text-slate-500">Portfolio</dt>
										<dd className="mt-1 break-all">
											<a href={profile.portfolioLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-[#16A34A] hover:text-[#15803D] hover:underline">
												<i className="fas fa-arrow-up-right-from-square text-xs" aria-hidden="true" />
												{profile.portfolioLink}
											</a>
										</dd>
									</div>
								)}
							</dl>
						</div>
					) : (
						<div className="space-y-5">
							<label className="block space-y-2 text-sm font-semibold text-slate-800">Bio
								<textarea className={`${inputClass} min-h-36`} value={profile.bio} onChange={(event) => handleChange('bio', event.target.value)} />
								<span className="block text-right text-xs font-medium text-slate-400">{profile.bio.length} characters</span>
							</label>
							{/* Hourly rates apply only when the teacher offers live sessions. */}
							{isLiveTeacher && (
								<label className="block space-y-2 text-sm font-semibold text-slate-800">Hourly rate (ETB)
									<input className={inputClass} type="number" min="0" value={profile.hourlyRate} onChange={(event) => handleChange('hourlyRate', event.target.value)} />
								</label>
							)}
							<label className="block space-y-2 text-sm font-semibold text-slate-800">Available hours per week
								<input className={inputClass} type="number" min="0" value={profile.availableHoursPerWeek} onChange={(event) => handleChange('availableHoursPerWeek', event.target.value)} />
							</label>
							<fieldset>
								<legend className="mb-2 text-sm font-semibold text-slate-800">Available days</legend>
								<div className="flex flex-wrap gap-2">
									{daysOfWeek.map((day) => {
										const selected = profile.availableDays.includes(day)
										return (
											<button
												key={day}
												type="button"
												aria-pressed={selected}
												onClick={() => toggleDay(day)}
												className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
													selected
														? 'border-[#22C55E] bg-[#22C55E] text-white shadow-sm shadow-[#22C55E]/30'
														: 'border-slate-300 bg-white text-slate-600 hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]'
												}`}
											>
												{day}
											</button>
										)
									})}
								</div>
							</fieldset>
							<label className="block space-y-2 text-sm font-semibold text-slate-800">Portfolio link
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