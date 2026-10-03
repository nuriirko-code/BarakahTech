import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'

const StudentCourses = () => {
	const [enrollments, setEnrollments] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const { token, loading: authLoading } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		let isCurrent = true

		const loadEnrollments = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/courses/student/my-enrollments', {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				if (isCurrent) setEnrollments(response.data.enrollments || [])
			} catch (requestError) {
				if (isCurrent) setError(requestError.response?.data?.message || 'Unable to load your learning courses.')
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		if (!authLoading) loadEnrollments()
		return () => {
			isCurrent = false
		}
	}, [authLoading, token])

	return (
		<div className="space-y-7">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Learning</h1>
					<p className="mt-2 text-slate-500">Pick up where you left off and keep moving forward.</p>
				</div>
				<span className="rounded-full bg-[#F0FDF4] px-3 py-1.5 text-sm font-bold text-[#15803D] ring-1 ring-[#22C55E]/20">
					{enrollments.length} courses enrolled
				</span>
			</header>

			{error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"><i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />{error}</div>}

			{loading ? (
				<div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-slate-500" role="status">
					<i className="fas fa-circle-notch fa-spin text-[#22C55E]" aria-hidden="true" />Loading your learning...
				</div>
			) : enrollments.length === 0 ? (
				<section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
					<span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]" aria-hidden="true"><i className="fas fa-book-open" /></span>
					<h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">You have not enrolled in any courses yet</h2>
					<p className="mt-3 max-w-md leading-6 text-slate-500">Explore the catalog and find a course that fits your goals.</p>
					<button type="button" onClick={() => navigate('/dashboard/student/browse')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
						<i className="fas fa-magnifying-glass text-sm" aria-hidden="true" />Browse Courses
					</button>
				</section>
			) : (
				<section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{enrollments.map((enrollment) => {
						const course = enrollment.course
						if (!course) return null
						const completedCount = enrollment.completedLessons?.length || 0
						const totalLessons = course.lessons?.length || 0
						const progress = Math.min(100, Math.max(0, Number(enrollment.progressPercentage) || 0))

						return (
							<article key={enrollment._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
								<div className="flex h-36 items-center justify-center bg-slate-100">
									{course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl text-slate-400"><i className="fas fa-book-open" aria-hidden="true" /></span>}
								</div>
								<div className="space-y-4 p-5">
									<div>
										<h2 className="line-clamp-2 text-lg font-extrabold tracking-tight text-slate-900">{course.title}</h2>
										<p className="mt-1 text-sm text-slate-500">by {course.teacher?.name || 'BarakahTech Teacher'}</p>
									</div>

									<div>
										<div className="flex items-center justify-between text-xs font-semibold text-slate-600">
											<span>{progress}% complete</span>
											<span>{completedCount} of {totalLessons || '—'} lessons</span>
										</div>
										<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${course.title} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
											<div className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all" style={{ width: `${progress}%` }} />
										</div>
									</div>

									{enrollment.lastAccessedLesson && <p className="text-xs text-slate-500"><i className="fas fa-clock mr-1.5" aria-hidden="true" />Last accessed a lesson</p>}

									{enrollment.isCompleted ? (
										<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
											<span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-bold text-[#15803D] ring-1 ring-[#22C55E]/20"><i className="fas fa-circle-check mr-1" aria-hidden="true" />Completed</span>
											{enrollment.certificateUrl ? (
												<a href={enrollment.certificateUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#16A34A]">View Certificate</a>
											) : (
												<button type="button" disabled title="Certificate will be available when issued" className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400">View Certificate</button>
											)}
										</div>
									) : (
										<button type="button" onClick={() => navigate(`/dashboard/student/courses/${course._id}`, { state: { enrollment } })} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#16A34A]">
											Continue Learning<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
										</button>
									)}
								</div>
							</article>
						)
					})}
				</section>
			)}
		</div>
	)
}

export default StudentCourses
