import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'

// Full availability and booking tools will need session/booking APIs and
// persistence models; this page explains the coming functionality meanwhile.
const TeacherSessions = () => {
	const [teachingMethod, setTeachingMethod] = useState('')
	const [loading, setLoading] = useState(true)
	const { token, loading: authLoading } = useAuth()

	useEffect(() => {
		let isCurrent = true

		const loadTeachingMethod = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/teacher-applications/my-application', {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				if (isCurrent) setTeachingMethod(response.data.application?.teachingMethod || '')
			} catch {
				// The coming-soon page remains useful even if profile details cannot load.
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		if (!authLoading) loadTeachingMethod()

		return () => {
			isCurrent = false
		}
	}, [authLoading, token])

	const coursesOnly = teachingMethod === 'courses'
	const methodLabel = loading ? 'Loading method...' : teachingMethod
		? teachingMethod === 'both' ? 'Live sessions and courses' : teachingMethod === 'live' ? 'Live sessions' : 'Courses only'
		: 'Teaching method unavailable'

	const sections = [
		{
			icon: 'fas fa-calendar-days',
			chip: 'bg-[#F0FDF4] text-[#16A34A]',
			title: 'Set Your Availability',
			description: 'Let students know when you are available for live one-on-one sessions.',
			action: 'Manage Availability',
		},
		{
			icon: 'fas fa-video',
			chip: 'bg-blue-50 text-blue-600',
			title: 'Upcoming Sessions',
			description: 'View and manage your scheduled live teaching sessions.',
			action: 'View Sessions',
		},
	]

	return (
		<div className="space-y-7">
			<header>
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Live Sessions</h1>
					<span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 py-1 text-sm font-bold capitalize text-[#16A34A] ring-1 ring-[#22C55E]/20">
						<i className="fas fa-circle text-[6px]" aria-hidden="true" />
						{methodLabel}
					</span>
				</div>
				<p className="mt-2 text-slate-500">Manage your availability and live teaching schedule.</p>
			</header>

			{coursesOnly && (
				<div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900" role="status">
					<i className="fas fa-circle-info mt-0.5" aria-hidden="true" />
					<p>Your current teaching method is courses only, so live sessions are not part of your current offering.</p>
				</div>
			)}

			<div className="grid gap-5 lg:grid-cols-2">
				{sections.map((section) => (
					<section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
						<div className="flex items-start justify-between gap-4">
							<span className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${section.chip}`}>
								<i className={section.icon} aria-hidden="true" />
							</span>
							<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
								Coming Soon
							</span>
						</div>
						<h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{section.title}</h2>
						<p className="mt-3 leading-6 text-slate-500">{section.description}</p>
						<button
							type="button"
							disabled
							className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
						>
							<i className="fas fa-lock text-xs" aria-hidden="true" />
							{section.action}
						</button>
					</section>
				))}
			</div>

			<aside className="flex items-start gap-4 rounded-2xl border border-[#22C55E]/20 bg-gradient-to-br from-[#F0FDF4] to-white p-6 shadow-sm">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#22C55E] text-white shadow-md shadow-[#22C55E]/30">
					<i className="fas fa-wand-magic-sparkles" aria-hidden="true" />
				</span>
				<div>
					<h2 className="font-bold text-slate-900">Live session booking is coming soon</h2>
					<p className="mt-2 leading-6 text-slate-600">
						Students will be able to book sessions directly from your teacher profile. Availability calendars and booking management will be added when the session and booking APIs and models are ready.
					</p>
				</div>
			</aside>
		</div>
	)
}

export default TeacherSessions