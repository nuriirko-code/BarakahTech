import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Avatar from '../../../components/common/Avatar'
import { useAuth } from '../../../context/AuthContext'
import { getCategoryIcon, getCategoryGradient } from '../../../utils/courseUtils'
import teachingCategories from '../../../utils/teachingCategories'

const StudentBrowse = () => {
	const [courses, setCourses] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [enrolling, setEnrolling] = useState('')
	const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => new Set())
	const [filters, setFilters] = useState({ category: '', level: '', language: '', search: '' })
	const { token } = useAuth()
	const navigate = useNavigate()

	// Catalog filters change this public course query. It intentionally stays
	// separate from the private enrollment lookup below.
	useEffect(() => {
		let isCurrent = true
		const query = new URLSearchParams(
			Object.entries(filters).filter(([, value]) => value.trim())
		).toString()
         
		const loadCourses = async () => {
			setLoading(true)
			setError('')
			try {
				const response = await axios.get(`http://localhost:5000/api/courses${query ? `?${query}` : ''}`)
				if (isCurrent) setCourses(response.data.courses || [])
			} catch (requestError) {
				if (isCurrent) setError(requestError.response?.data?.message || 'Unable to load courses right now.')
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		loadCourses()
		return () => {
			isCurrent = false
		}
	}, [filters])

	// A second request obtains only this student's enrollment IDs so each public
	// course card can accurately communicate whether enrollment is already active.
	useEffect(() => {
		let isCurrent = true

		const loadEnrollmentIds = async () => {
			if (!token) return

			try {
				const response = await axios.get('http://localhost:5000/api/courses/student/my-enrollments', {
					headers: { Authorization: `Bearer ${token}` },
				})
				if (isCurrent) {
					// A Set gives O(1) membership checks for every visible course card;
					// repeatedly searching an array would take O(n) per card.
					setEnrolledCourseIds(new Set(
						(response.data.enrollments || [])
							.map((enrollment) => enrollment.course?._id || enrollment.course)
							.filter(Boolean)
					))
				}
			} catch (requestError) {
				if (isCurrent) setError(requestError.response?.data?.message || 'Unable to check your enrollments.')
			}
		}

		// Enrollment IDs are fetched separately because the public catalog does not
		// include private, student-specific enrollment records.
		loadEnrollmentIds()
		return () => {
			isCurrent = false
		}
	}, [token])

	const updateFilter = (field, value) => {
		setFilters((currentFilters) => ({ ...currentFilters, [field]: value }))
	}

	const clearFilters = () => {
		setFilters({ category: '', level: '', language: '', search: '' })
	}

	// Keep the active course ID rather than a boolean so only that card shows
	// the in-progress state while other free courses remain actionable.
	const handleEnroll = async (courseId) => {
		setEnrolling(courseId)
		setError('')
		setSuccessMessage('') // both set methods clear old messages so only one is shown at a time

		try {
			await axios.post(
				`http://localhost:5000/api/courses/${courseId}/enroll`, //sends a **POST request** to the backend saying “enroll the currently logged-in student in this course,”
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			setSuccessMessage('Successfully enrolled')
			// The server already confirmed enrollment, so update the local Set instead
			// of refetching the entire public catalog just to change one card state.
			setEnrolledCourseIds((currentIds) => new Set(currentIds).add(courseId))
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Unable to enroll in this course.')
		} finally {
			setEnrolling('')
		}
	}

	const inputClass = 'rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'

	return (
		<div className="space-y-7">
			<header>
				<h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Browse Courses</h1>
				<p className="mt-2 text-slate-500">Learn from qualified Ethiopian teachers in your language.</p>
			</header>

			{successMessage && <div role="status" className="flex items-center gap-3 rounded-xl border border-[#22C55E]/20 bg-[#F0FDF4] p-4 text-sm font-semibold text-[#15803D]"><i className="fas fa-circle-check" aria-hidden="true" />{successMessage}</div>}
			{error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800"><i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />{error}</div>}

			<section aria-label="Course filters" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
				<label className="relative">
					<span className="sr-only">Search courses</span>
					<i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
					<input className={`${inputClass} w-full pl-10`} value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search courses" />
				</label>
				<label>
					<span className="sr-only">Category</span>
					<select className={`${inputClass} w-full`} value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
						<option value="">All Categories</option>
						{Object.entries(teachingCategories).map(([id, category]) => <option key={id} value={id}>{category.label}</option>)}
					</select>
				</label>
				<label>
					<span className="sr-only">Level</span>
					<select className={`${inputClass} w-full`} value={filters.level} onChange={(event) => updateFilter('level', event.target.value)}>
						<option value="">All Levels</option>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
					</select>
				</label>
				<label>
					<span className="sr-only">Language</span>
					<select className={`${inputClass} w-full`} value={filters.language} onChange={(event) => updateFilter('language', event.target.value)}>
						<option value="">All Languages</option>
						<option value="amharic">Amharic</option>
						<option value="english">English</option>
						<option value="both">Both</option>
					</select>
				</label>
				<button type="button" onClick={clearFilters} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Clear Filters</button>
			</section>

			{loading ? (
				<div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-16 text-slate-500" role="status">
					<i className="fas fa-circle-notch fa-spin text-[#22C55E]" aria-hidden="true" />Loading courses...
				</div>
			) : courses.length === 0 ? (
				<section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
					<span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500" aria-hidden="true"><i className="fas fa-magnifying-glass" /></span>
					<h2 className="mt-5 text-xl font-extrabold text-slate-900">No courses found matching your filters</h2>
					<p className="mt-2 text-sm text-slate-500">Try adjusting or clearing your search filters.</p>
					<button type="button" onClick={clearFilters} className="mt-4 font-bold text-[#15803D] hover:underline">Clear Filters</button>
				</section>
			) : (
				<section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{courses.map((course) => {
						const isEnrolled = enrolledCourseIds.has(course._id)

						return (
						<article key={course._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
							{/* A gradient and category icon make an empty thumbnail intentional; a future Cloudinary URL automatically replaces it. */}
							<button type="button" onClick={() => navigate(`/dashboard/student/courses/${course._id}`)} className={`relative flex h-40 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${getCategoryGradient(course.category)}`} aria-label={`View ${course.title}`}>
								{course.thumbnail ? <img src={course.thumbnail} alt="" className="h-full w-full object-cover" /> : <i className={`${getCategoryIcon(course.category)} text-5xl text-white/90`} aria-hidden="true" />}
								<span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold capitalize text-[#15803D] shadow-sm">{course.category}</span>
								<span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold capitalize text-white">{course.level}</span>
							</button>

							<div className="space-y-4 p-5">
								<div>
									<h2 className="line-clamp-2 text-lg font-extrabold tracking-tight text-slate-900">{course.title}</h2>
									<div className="mt-2 flex items-center gap-2">
										<Avatar name={course.teacher?.name || 'Teacher'} size="sm" />
										<span className="text-sm text-slate-500">by {course.teacher?.name || 'Unknown'}</span>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700"><i className="fas fa-language mr-1" aria-hidden="true" />{course.language}</span>
									<span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600"><i className="fas fa-star" aria-hidden="true" />{Number(course.rating || 0).toFixed(1)} <span className="font-medium text-slate-400">({course.totalRatings || 0})</span></span>
								</div>
								<div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
									<span><i className="fas fa-clock mr-1" aria-hidden="true" />{course.estimatedDuration} hours total</span>
									<span><i className="fas fa-users mr-1" aria-hidden="true" />{course.totalEnrollments || 0} students enrolled</span>
								</div>
								<div className="space-y-3 border-t border-slate-100 pt-4">
									{course.isFree ? (
										<span className="text-xl font-extrabold text-[#15803D]">FREE</span>
									) : (
										<span className="text-lg font-extrabold text-slate-900">{course.currency || 'ETB'} {Number(course.price || 0).toLocaleString()}</span>
									)}
									{/* These three states tell a learner whether access already exists, can be started now, or needs payment support. */}
									{isEnrolled ? (
										<button type="button" disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
											<i className="fas fa-check" aria-hidden="true" />Enrolled
										</button>
									) : course.isFree ? (
										<button type="button" disabled={enrolling === course._id} onClick={() => handleEnroll(course._id)} className="w-full rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#15803D] disabled:opacity-50">
											{enrolling === course._id ? 'Enrolling...' : 'Enroll Now — Free'}
										</button>
									) : (
										<span title="Payment integration coming soon" className="cursor-not-allowed rounded-xl bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-500">
											Enroll · Payment coming soon
										</span>
									)}
								</div>
							</div>
						</article>
						)
					})}
				</section>
			)}
		</div>
	)
}

export default StudentBrowse
