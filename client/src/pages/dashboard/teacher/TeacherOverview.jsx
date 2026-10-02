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
		icon: 'fas fa-book-open',
		chip: 'bg-[#F0FDF4] text-[#16A34A]',
		title: 'Create New Course',
		description: 'Share a course with learners.',
		to: '/dashboard/teacher/courses/create',
	},
	{
		icon: 'fas fa-calendar-check',
		chip: 'bg-blue-50 text-blue-600',
		title: 'Set Availability',
		description: 'Manage your live teaching sessions.',
		to: '/dashboard/teacher/sessions',
	},
	{
		icon: 'fas fa-user',
		chip: 'bg-violet-50 text-violet-600',
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
		{ icon: 'fas fa-book-open', chip: 'bg-[#F0FDF4] text-[#16A34A]', value: stats.totalCourses, label: 'Courses Created', to: '/dashboard/teacher/courses' },
		{ icon: 'fas fa-user-graduate', chip: 'bg-blue-50 text-blue-600', value: stats.totalStudents, label: 'Enrolled Students' },
		{ icon: 'fas fa-calendar-check', chip: 'bg-violet-50 text-violet-600', value: stats.upcomingSessions, label: 'Upcoming Sessions', to: '/dashboard/teacher/sessions' },
		{ icon: 'fas fa-sack-dollar', chip: 'bg-amber-50 text-amber-600', value: formattedEarnings, label: 'Total Earnings' },
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
		<div className="space-y-8">
			{/* Page header */}
			<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">
						{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
					</p>
					<h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
						Welcome back, {user?.name || 'Teacher'}
					</h1>
					<p className="mt-2 text-slate-500">Here is a snapshot of your teaching activity.</p>
				</div>
				<button
					type="button"
					onClick={() => navigate('/dashboard/teacher/courses/create')}
					className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#22C55E]/30 transition-all hover:bg-[#16A34A] hover:shadow-[#16A34A]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 active:scale-[0.98]"
				>
					<i className="fas fa-plus" aria-hidden="true" />
					Create New Course
				</button>
			</header>

			{/* Stat cards */}
			<section aria-label="Teacher statistics" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{statCards.map((card) => {
					const content = (
						<div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#22C55E]/30 hover:shadow-md">
							<span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-base ${card.chip}`}>
								<i className={card.icon} aria-hidden="true" />
							</span>
							<p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
								{loading && card.label !== 'Total Earnings' ? '—' : card.value}
							</p>
							<p className="mt-1 text-sm font-medium text-slate-500">{card.label}</p>
						</div>
					)

					return (
						<div key={card.label}>
							{card.to ? <Link to={card.to} className="block h-full">{content}</Link> : content}
						</div>
					)
				})}
			</section>

			{/* Quick actions */}
			<section>
				<h2 className="text-lg font-bold tracking-tight text-slate-900">Quick Actions</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-3">
					{quickActions.map((action) => (
						<Link
							key={action.title}
							to={action.to}
							className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#22C55E]/40 hover:shadow-md"
						>
							<span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${action.chip}`}>
								<i className={action.icon} aria-hidden="true" />
							</span>
							<span className="min-w-0 flex-1">
								<span className="block font-bold text-slate-900">{action.title}</span>
								<span className="mt-1 block text-sm leading-5 text-slate-500">{action.description}</span>
							</span>
							<i className="fas fa-arrow-right text-sm text-[#22C55E] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" aria-hidden="true" />
						</Link>
					))}
				</div>
			</section>

			{/* Getting started checklist */}
			{!loading && stats.totalCourses === 0 && (
				<section className="overflow-hidden rounded-2xl border border-[#22C55E]/20 bg-gradient-to-br from-[#F0FDF4] to-white p-6 shadow-sm sm:p-8">
					<h2 className="text-xl font-extrabold tracking-tight text-slate-900">Getting started on BarakahTech</h2>
					<p className="mt-2 text-slate-500">Take these first steps to help learners discover and book your teaching.</p>
					<ol className="mt-6 grid gap-4 md:grid-cols-3">
						{gettingStartedSteps.map((step) => (
							<li key={step.number} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-xs font-bold text-white shadow-md shadow-[#22C55E]/30">
									{step.number}
								</span>
								<h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>
								<p className="mt-2 text-sm leading-5 text-slate-500">{step.description}</p>
								<Link to={step.to} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#16A34A] hover:text-[#15803D]">
									Go to step
									<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
								</Link>
							</li>
						))}
					</ol>
				</section>
			)}

			{/* Recent activity */}
			{recentActivity.length > 0 && (
				<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-bold tracking-tight text-slate-900">Recent Activity</h2>
					<ul className="mt-4 divide-y divide-slate-100">
						{recentActivity.map((activity, index) => (
							<li key={activity._id || index} className="flex items-center gap-3 py-3 text-sm text-slate-600">
								<span className="h-2 w-2 shrink-0 rounded-full bg-[#22C55E]" aria-hidden="true" />
								{activity.message || activity.title}
							</li>
						))}
					</ul>
				</section>
			)}
		</div>
	)
}

export default TeacherOverview