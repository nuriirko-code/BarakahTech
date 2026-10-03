import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'

const statusStyles = {
	draft: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
	published: 'bg-[#F0FDF4] text-[#15803D] ring-1 ring-[#22C55E]/20',
	archived: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}

const categoryIcons = {
	technology: 'fas fa-microchip',
	languages: 'fas fa-language',
	sciences: 'fas fa-flask',
	business: 'fas fa-briefcase',
	leadership: 'fas fa-people-group',
}

const TeacherCourses = () => {
	const [courses, setCourses] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const { token, loading: authLoading } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		let isCurrent = true

		const loadCourses = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/courses/teacher/my-courses', {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				if (isCurrent) setCourses(response.data.courses || [])
			} catch (requestError) {
				if (isCurrent) setError(requestError.response?.data?.message || 'Unable to load your courses.')
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		if (!authLoading) loadCourses()

		return () => {
			isCurrent = false
		}
	}, [authLoading, token])

	const createCourse = () => navigate('/dashboard/teacher/courses/create')

	return (
		<div className="space-y-7">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Courses</h1>
						<span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-sm font-bold text-[#15803D] ring-1 ring-[#22C55E]/20">{courses.length}</span>
					</div>
					<p className="mt-2 text-slate-500">Create and organize learning for your students.</p>
				</div>
				<button type="button" onClick={createCourse} className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
					<i className="fas fa-plus text-xs" aria-hidden="true" />
					Create New Course
				</button>
			</header>

			{location.state?.successMessage && (
				<div role="status" className="flex items-center gap-3 rounded-xl border border-[#22C55E]/20 bg-[#F0FDF4] p-4 text-sm font-semibold text-[#15803D]">
					<i className="fas fa-circle-check" aria-hidden="true" />
					{location.state.successMessage}
				</div>
			)}

			{error && (
				<div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
					<i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
					{error}
				</div>
			)}

			{loading ? (
				<div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-slate-500" role="status">
					<i className="fas fa-circle-notch fa-spin text-[#22C55E]" aria-hidden="true" />
					Loading your courses...
				</div>
			) : courses.length === 0 ? (
				<section className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
					<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]" aria-hidden="true">
						<i className="fas fa-book-open" />
					</span>
					<h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">No courses yet</h2>
					<p className="mt-3 max-w-lg leading-7 text-slate-500">
						Create your first course and start sharing your knowledge with students on BarakahTech
					</p>
					<button type="button" onClick={createCourse} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
						<i className="fas fa-plus text-xs" aria-hidden="true" />
						Create My First Course
					</button>
				</section>
			) : (
				<section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{courses.map((course) => (
						<article key={course._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
							<div className="relative flex h-40 items-center justify-center bg-slate-100">
								{course.thumbnail ? (
									<img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
								) : (
									// A neutral icon tile stands in until teachers can upload thumbnails.
									<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl text-[#16A34A] shadow-sm" aria-hidden="true">
										<i className={categoryIcons[course.category] || 'fas fa-layer-group'} />
									</span>
								)}
								<span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[course.status] || statusStyles.draft}`}>
									{course.status}
								</span>
							</div>

							<div className="space-y-4 p-5">
								<div>
									<h2 className="line-clamp-2 text-lg font-extrabold tracking-tight text-slate-900">{course.title}</h2>
									<p className="mt-2 text-sm capitalize text-slate-500">{course.subject} · {course.category}</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{course.level}</span>
									<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{course.lessons?.length || 0} lessons</span>
								</div>

								<div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
									<span><i className="fas fa-users mr-1.5 text-slate-400" aria-hidden="true" />{course.totalEnrollments || 0} students</span>
									<span><i className="fas fa-clock mr-1.5 text-slate-400" aria-hidden="true" />{course.estimatedDuration} hours</span>
									<span className="font-bold text-slate-800">{course.isFree ? 'Free' : `${course.currency || 'ETB'} ${Number(course.price || 0).toLocaleString()}`}</span>
								</div>

								<div className="flex gap-2 border-t border-slate-100 pt-4">
									<button type="button" onClick={() => navigate(`/dashboard/teacher/courses/${course._id}`, { state: { course } })} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
										<i className="fas fa-eye text-xs" aria-hidden="true" />
										View
									</button>
									{course.status === 'draft' && (
										<button type="button" onClick={() => navigate('/dashboard/teacher/courses/create', { state: { courseId: course._id } })} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#16A34A]">
											<i className="fas fa-list-check text-xs" aria-hidden="true" />
											Add Lessons
										</button>
									)}
								</div>
							</div>
						</article>
					))}
				</section>
			)}
		</div>
	)
}

export default TeacherCourses
