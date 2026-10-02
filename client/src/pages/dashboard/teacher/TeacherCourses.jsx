import { Link, useNavigate } from 'react-router-dom'

// The real course list will be added after the Course model and course API exist.
const TeacherCourses = () => {
	const navigate = useNavigate()

	return (
		<div className="mx-auto max-w-6xl space-y-8">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
					<p className="mt-2 text-gray-600">Create and organize learning for your students.</p>
				</div>
				<button type="button" onClick={() => navigate('/dashboard/teacher/courses/create')} className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
					Create New Course
				</button>
			</header>

			<section className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">
				<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]" aria-hidden="true">
					<i className="fas fa-book-open" />
				</span>
				<h2 className="mt-6 text-2xl font-bold text-gray-900">No courses yet</h2>
				<p className="mt-3 max-w-lg leading-7 text-gray-600">
					Create your first course and start sharing your knowledge with students on BarakahTech
				</p>
				<Link to="/dashboard/teacher/courses/create" className="mt-7 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">
					Create My First Course
				</Link>
			</section>
		</div>
	)
}

export default TeacherCourses
