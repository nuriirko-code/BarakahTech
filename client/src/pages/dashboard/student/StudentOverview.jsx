import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'

const emptyStats = {
	enrolledCourses: 0,
	completedCourses: 0,
	hoursLearned: 0,
	streak: 0,
}

// The overview derives enrollment totals from the existing enrollments endpoint
// instead of introducing a separate stats endpoint for the student dashboard.
const StudentOverview = () => {
	const [stats, setStats] = useState(emptyStats)
	const [recentEnrollments, setRecentEnrollments] = useState([])
	const [loading, setLoading] = useState(true)
	const { user, token, loading: authLoading } = useAuth()

	useEffect(() => {
		let isCurrent = true

		const loadEnrollments = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/courses/student/my-enrollments', {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				const enrollments = response.data.enrollments || []

				if (isCurrent) {
					// Course counts are directly derivable here. Hours learned and streak
					// need lesson activity and dated learning events that are not modeled yet.
					setStats({
						enrolledCourses: enrollments.length,
						completedCourses: enrollments.filter((enrollment) => enrollment.isCompleted).length,
						hoursLearned: 0,
						streak: 0,
					})
					// Limit the overview to three recent records; the My Learning page
					// remains the place to browse the full enrollment list.
					setRecentEnrollments(enrollments.slice(0, 3))
				}
			} catch {
				// Enrollment summary is helpful but non-critical; the default zero state remains usable.
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		if (!authLoading) loadEnrollments()

		return () => {
			isCurrent = false
		}
	}, [authLoading, token])

	const statCards = [
		{ icon: 'fas fa-book-open', label: 'Enrolled Courses', value: stats.enrolledCourses, chip: 'bg-[#F0FDF4] text-[#16A34A]' },
		{ icon: 'fas fa-circle-check', label: 'Completed', value: stats.completedCourses, chip: 'bg-blue-50 text-blue-600' },
		{ icon: 'fas fa-clock', label: 'Hours Learned', value: stats.hoursLearned, chip: 'bg-violet-50 text-violet-600' },
		{ icon: 'fas fa-fire', label: 'Day Streak', value: stats.streak, chip: 'bg-amber-50 text-amber-600' },
	]

	const continueLink = (enrollment) => `/dashboard/student/courses/${enrollment.course?._id}`

	return (
		<div className="space-y-8">
			<header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">
						{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
					</p>
					<h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
						Welcome back, {user?.name || 'Student'}
					</h1>
					<p className="mt-2 text-slate-500">Keep learning. Every lesson brings you closer to your goal.</p>
				</div>
				<Link to="/dashboard/student/browse" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
					<i className="fas fa-magnifying-glass text-xs" aria-hidden="true" />Browse New Courses
				</Link>
			</header>

			<section aria-label="Learning statistics" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				{statCards.map((card) => (
					<article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
						<span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-base ${card.chip}`} aria-hidden="true">
							<i className={card.icon} />
						</span>
						<p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">{loading ? '—' : card.value}</p>
						<p className="mt-1 text-sm font-medium text-slate-500">{card.label}</p>
					</article>
				))}
			</section>

			{recentEnrollments.length > 0 ? (
				<section>
					<div className="flex items-center justify-between gap-4">
						<h2 className="text-lg font-extrabold tracking-tight text-slate-900">Continue Learning</h2>
						<Link to="/dashboard/student/courses" className="text-sm font-bold text-[#15803D] hover:underline">View all</Link>
					</div>
					<div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{recentEnrollments.map((enrollment) => {
							const course = enrollment.course
							if (!course) return null
							const progress = Math.min(100, Math.max(0, Number(enrollment.progressPercentage) || 0))
							const completedCount = enrollment.completedLessons?.length || 0
							const totalLessons = course.lessons?.length || 0

							return (
								<article key={enrollment._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
									<div className="flex h-32 items-center justify-center bg-slate-100">
										{course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : <i className="fas fa-book-open text-2xl text-slate-400" aria-hidden="true" />}
									</div>
									<div className="space-y-4 p-5">
										<div>
											<h3 className="line-clamp-2 font-extrabold text-slate-900">{course.title}</h3>
											<p className="mt-1 text-sm text-slate-500">by {course.teacher?.name || 'BarakahTech Teacher'}</p>
										</div>
										<div>
											<div className="flex justify-between text-xs font-semibold text-slate-600">
												<span>{progress}% complete</span>
												<span>{completedCount} of {totalLessons || '—'} lessons</span>
											</div>
											<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${course.title} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
												<div className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A]" style={{ width: `${progress}%` }} />
											</div>
										</div>
										<Link to={continueLink(enrollment)} state={{ enrollment }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#16A34A]">
											Continue Learning<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
										</Link>
									</div>
								</article>
							)
						})}
					</div>
				</section>
			) : !loading ? (
				<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="max-w-3xl">
						<span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#16A34A]" aria-hidden="true"><i className="fas fa-compass" /></span>
						<h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-900">Start your learning journey</h2>
						<p className="mt-2 text-slate-500">Choose a course, enroll, and begin working through lessons at your own pace.</p>
					</div>
					<ol className="mt-6 grid gap-4 md:grid-cols-3">
						{[
							{ number: '01', title: 'Browse courses', text: 'Explore subjects and teachers that match your goals.' },
							{ number: '02', title: 'Enroll for free', text: 'Join a free course and keep your learning in one place.' },
							{ number: '03', title: 'Start learning', text: 'Work through lessons and track your progress.' },
						].map((step) => (
							<li key={step.number} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
								<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E] text-xs font-bold text-white">{step.number}</span>
								<h3 className="mt-3 font-bold text-slate-900">{step.title}</h3>
								<p className="mt-2 text-sm leading-5 text-slate-500">{step.text}</p>
							</li>
						))}
					</ol>
					<Link to="/dashboard/student/browse" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16A34A]">
						Explore Courses<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
					</Link>
				</section>
			) : null}
		</div>
	)
}

export default StudentOverview
