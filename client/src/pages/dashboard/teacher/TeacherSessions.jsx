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
			icon: '🗓️',
			title: 'Set Your Availability',
			description: 'Let students know when you are available for live one-on-one sessions.',
			action: 'Manage Availability',
		},
		{
			icon: '🎯',
			title: 'Upcoming Sessions',
			description: 'View and manage your scheduled live teaching sessions.',
			action: 'View Sessions',
		},
	]

	return (
		<div className="mx-auto max-w-6xl space-y-7">
			<header>
				<div className="flex flex-wrap items-center gap-3">
					<h1 className="text-3xl font-bold text-gray-900">Live Sessions</h1>
					<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold capitalize text-green-900">{methodLabel}</span>
				</div>
				<p className="mt-2 text-gray-600">Manage your availability and live teaching schedule.</p>
			</header>

			{coursesOnly && (
				<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
					Your current teaching method is courses only, so live sessions are not part of your current offering.
				</div>
			)}

			<div className="grid gap-5 lg:grid-cols-2">
				{sections.map((section) => (
					<section key={section.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
						<div className="flex items-start justify-between gap-4">
							<span className="text-4xl" aria-hidden="true">{section.icon}</span>
							<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Coming Soon</span>
						</div>
						<h2 className="mt-5 text-xl font-bold text-gray-900">{section.title}</h2>
						<p className="mt-3 leading-6 text-gray-600">{section.description}</p>
						<button type="button" disabled className="mt-6 cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2.5 font-semibold text-gray-500">
							{section.action}
						</button>
					</section>
				))}
			</div>

			<aside className="rounded-xl border border-green-200 bg-green-50 p-6 text-green-950">
				<h2 className="font-bold">Live session booking is coming soon</h2>
				<p className="mt-2 leading-6">
					Students will be able to book sessions directly from your teacher profile. Availability calendars and booking management will be added when the session and booking APIs and models are ready.
				</p>
			</aside>
		</div>
	)
}

export default TeacherSessions
