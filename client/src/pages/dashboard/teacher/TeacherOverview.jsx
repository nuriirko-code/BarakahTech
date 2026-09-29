import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'

const emptyStats = {
	totalCourses: 0,
	totalStudents: 0,
	upcomingSessions: 0,
	totalEarnings: 0,
}

const quickActions = [
	{
		icon: '📚',
		title: 'Create New Course',
		description: 'Share a course with learners.',
		to: '/dashboard/teacher/courses/create',
	},
	{
		icon: '🎯',
		title: 'Set Availability',
		description: 'Manage your live teaching sessions.',
		to: '/dashboard/teacher/sessions',
	},
	{
		icon: '👤',
		title: 'View Profile',
		description: 'Review your public teacher profile.',
		to: '/dashboard/teacher/profile',
	},
]

// The overview is the dashboard landing page: it summarizes activity and
// points teachers toward the next useful task without owning dashboard layout.
const TeacherOverview = () => {
	// Zero defaults keep the overview readable even before the teacher has activity.
	const [stats, setStats] = useState(emptyStats)
	const [loading, setLoading] = useState(true)
	const [recentActivity, setRecentActivity] = useState([])
	const { user, token, loading: authLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		let isCurrent = true

		const loadStats = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/teachers/stats', {
					headers: { Authorization: `Bearer ${token}` },
				})
				if (isCurrent) {
					setStats({ ...emptyStats, ...(response.data.stats || response.data) })
					setRecentActivity(response.data.recentActivity || [])
				}
			} catch {
				// Dashboard metrics are informational; a missing stats service should
				// not prevent teachers from using the rest of the portal.
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		if (!authLoading) loadStats()

		return () => {
			isCurrent = false
		}
	}, [authLoading, token])

	const formattedEarnings = new Intl.NumberFormat('en-ET', {
		style: 'currency',
		currency: 'ETB',
		maximumFractionDigits: 2,
	}).format(Number(stats.totalEarnings) || 0)

	const statCards = [
		{ icon: '📚', value: stats.totalCourses, label: 'Courses Created', to: '/dashboard/teacher/courses' },
		{ icon: '👥', value: stats.totalStudents, label: 'Enrolled Students' },
		{ icon: '🎯', value: stats.upcomingSessions, label: 'Upcoming Sessions', to: '/dashboard/teacher/sessions' },
		{ icon: '💰', value: formattedEarnings, label: 'Total Earnings' },
	]

	const gettingStartedSteps = [
		{
			number: '01',
			title: 'Complete your profile',
			description: 'Help learners understand your experience and teaching style.',
			to: '/dashboard/teacher/profile',
		},
		{
			number: '02',
			title: 'Create your first course',
			description: 'Organize your knowledge into a course learners can follow.',
			to: '/dashboard/teacher/courses/create',
		},
		{
			number: '03',
			title: 'Set live session availability',
			description: 'Let learners know when they can book time with you.',
			to: '/dashboard/teacher/sessions',
		},
	]

	return (
		<div className="mx-auto max-w-6xl space-y-8">
			<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-green-700">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
					<h1 className="mt-2 text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Teacher'}</h1>
					<p className="mt-2 text-gray-600">Here is a snapshot of your teaching activity.</p>
				</div>
				<button
					type="button"
					onClick={() => navigate('/dashboard/teacher/courses/create')}
					className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800"
				>
					Create New Course
				</button>
			</header>

			<section aria-label="Teacher statistics" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{statCards.map((card) => {
					const content = (
						<div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
							<span className="text-2xl" aria-hidden="true">{card.icon}</span>
							<p className="mt-4 text-2xl font-bold text-green-800">
								{loading && card.label !== 'Total Earnings' ? '—' : card.value}
							</p>
							<p className="mt-1 text-sm text-gray-600">{card.label}</p>
						</div>
					)

					return (
						<div key={card.label}>
							{card.to ? <Link to={card.to} className="block h-full">{content}</Link> : content}
						</div>
					)
				})}
			</section>

			<section>
				<h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-3">
					{quickActions.map((action) => (
						<Link key={action.title} to={action.to} className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
							<span className="text-2xl" aria-hidden="true">{action.icon}</span>
							<span className="min-w-0 flex-1">
								<span className="block font-bold text-gray-900">{action.title}</span>
								<span className="mt-1 block text-sm leading-5 text-gray-600">{action.description}</span>
							</span>
							<span className="text-lg text-green-700 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
						</Link>
					))}
				</div>
			</section>

			{!loading && stats.totalCourses === 0 && (
				<section className="rounded-xl border border-green-100 bg-white p-6 shadow-sm sm:p-8">
					<h2 className="text-xl font-bold text-green-900">Getting started on BarakahTech</h2>
					<p className="mt-2 text-gray-600">Take these first steps to help learners discover and book your teaching.</p>
					<ol className="mt-6 grid gap-5 md:grid-cols-3">
						{gettingStartedSteps.map((step) => (
							<li key={step.number} className="rounded-lg bg-green-50 p-5">
								<span className="text-sm font-bold text-green-700">{step.number}</span>
								<h3 className="mt-2 font-bold text-gray-900">{step.title}</h3>
								<p className="mt-2 text-sm leading-5 text-gray-600">{step.description}</p>
								<Link to={step.to} className="mt-4 inline-block text-sm font-semibold text-green-800 hover:underline">Go to step →</Link>
							</li>
						))}
					</ol>
				</section>
			)}

			{recentActivity.length > 0 && (
				<section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
					<ul className="mt-4 divide-y divide-gray-100">
						{recentActivity.map((activity, index) => (
							<li key={activity._id || index} className="py-3 text-sm text-gray-700">{activity.message || activity.title}</li>
						))}
					</ul>
				</section>
			)}
		</div>
	)
}

export default TeacherOverview
