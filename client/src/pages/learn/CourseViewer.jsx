import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { getGoogleDriveEmbedUrl, getYouTubeEmbedUrl } from '../../utils/videoUtils'

const CourseViewer = () => {
	const { courseId } = useParams()
	const navigate = useNavigate()
	const { token } = useAuth()

	const [course, setCourse] = useState(null)
	const [enrollment, setEnrollment] = useState(null)
	const [activeLessonIndex, setActiveLessonIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [markingComplete, setMarkingComplete] = useState(false)
	const [sidebarOpen, setSidebarOpen] = useState(false)

	useEffect(() => {
		let isCurrent = true

		const loadEnrolledCourse = async () => {
			try {
				// This endpoint verifies both publication status and enrollment before
				// returning full lessons; the URL by itself never grants content access.
				const response = await axios.get(`http://localhost:5000/api/courses/${courseId}/learn`, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				})
				const loadedCourse = response.data.course
				const loadedEnrollment = response.data.enrollment

				if (!isCurrent) return
				setCourse(loadedCourse)
				setEnrollment(loadedEnrollment)

				// Resume at the last saved lesson when its ID is present; otherwise start at lesson zero.
				if (loadedEnrollment.lastAccessedLesson && loadedCourse.lessons?.length) {
					const lastLessonIndex = loadedCourse.lessons.findIndex(
						(lesson) => lesson._id.toString() === loadedEnrollment.lastAccessedLesson.toString()
					)
					if (lastLessonIndex >= 0) setActiveLessonIndex(lastLessonIndex)
				}
			} catch (requestError) {
				if (isCurrent) {
					setError(requestError.response?.data?.message || 'Unable to load this course.')
				}
			} finally {
				if (isCurrent) setLoading(false)
			}
		}

		loadEnrolledCourse()

		return () => {
			// Ignore a late response if the student navigates to another course first.
			isCurrent = false
		}
	}, [courseId, token])

	// These values are derived from the fetched records instead of duplicated in
	// state, so lesson selection or completion cannot leave stale derived values.
	const activeLesson = course?.lessons?.[activeLessonIndex] || null
	const completedCount = enrollment?.completedLessons?.length || 0
	const totalLessons = course?.lessons?.length || 0
	const progressPercentage = totalLessons > 0
		? Math.min(100, Math.round((completedCount / totalLessons) * 100))
		: 0

	// Mongoose ObjectIds arrive as strings in JSON, but toString also supports
	// ObjectId-shaped values during local development and tests.
	const isLessonCompleted = (lessonId) => (
		enrollment?.completedLessons?.some((completedId) => completedId.toString() === lessonId.toString()) || false
	)

	const handleMarkComplete = async () => {
		if (!activeLesson || isLessonCompleted(activeLesson._id)) return

		setMarkingComplete(true)
		try {
			const response = await axios.post(
				`http://localhost:5000/api/courses/${courseId}/lessons/${activeLesson._id}/complete`,
				{},
				{ headers: token ? { Authorization: `Bearer ${token}` } : {} }
			)
			setEnrollment(response.data.enrollment)
		} catch (requestError) {
			// Progress sync should not interrupt the lesson; the student can retry later.
			console.error('Could not sync lesson completion:', requestError)
		} finally {
			setMarkingComplete(false)
		}
	}

	const handleNextLesson = () => {
		if (activeLessonIndex < totalLessons - 1) {
			setActiveLessonIndex((index) => index + 1)
		}
	}

	const handlePreviousLesson = () => {
		if (activeLessonIndex > 0) {
			setActiveLessonIndex((index) => index - 1)
		}
	}

	const selectLesson = (index) => {
		setActiveLessonIndex(index)
		setSidebarOpen(false)
	}

	const renderVideo = () => {
		if (activeLesson.videoSource === 'youtube') {
			return (
				<iframe
					className="absolute inset-0 h-full w-full"
					src={getYouTubeEmbedUrl(activeLesson.videoUrl)}
					title={activeLesson.title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerPolicy="strict-origin-when-cross-origin"
					allowFullScreen
				/>
			)
		}

		if (activeLesson.videoSource === 'googledrive') {
			return (
				<iframe
					className="absolute inset-0 h-full w-full"
					src={getGoogleDriveEmbedUrl(activeLesson.videoUrl)}
					title={activeLesson.title}
					allow="autoplay"
					allowFullScreen
				/>
			)
		}

		return (
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 text-center text-white">
				<i className="fas fa-cloud-arrow-up text-3xl text-[#86EFAC]" aria-hidden="true" />
				<p className="font-semibold">Video upload player coming soon</p>
			</div>
		)
	}

	const sidebarContent = (
		<div className="flex h-full flex-col bg-slate-50">
			<div className="border-b border-slate-200 p-5">
				<h2 className="font-extrabold text-slate-900">Course Content</h2>
				<p className="mt-1 text-xs text-slate-500">{totalLessons} lessons · {course?.estimatedDuration || 0} hours</p>
				<div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressPercentage}>
					<div className="h-full rounded-full bg-[#22C55E] transition-all duration-200" style={{ width: `${progressPercentage}%` }} />
				</div>
			</div>

			<ol className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
				{(course?.lessons || []).map((lesson, index) => {
					const completed = isLessonCompleted(lesson._id)
					const active = index === activeLessonIndex
					const lessonIcon = lesson.contentType === 'video'
						? 'fas fa-video'
						: lesson.contentType === 'text'
							? 'fas fa-file-lines'
							: 'fas fa-layer-group'

					return (
						<li key={lesson._id}>
							<button
								type="button"
								onClick={() => selectLesson(index)}
								aria-current={active ? 'step' : undefined}
								className={`flex w-full items-start gap-3 rounded-xl border-l-4 p-3 text-left transition-colors duration-200 ${active ? 'border-l-[#22C55E] bg-[#F0FDF4] text-slate-900' : 'border-l-transparent text-slate-600 hover:bg-white'}`}
							>
								<span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${completed ? 'bg-[#22C55E] text-white' : active ? 'bg-white text-[#16A34A]' : 'bg-slate-200 text-slate-600'}`}>
									{completed ? <i className="fas fa-check" aria-label="Completed" /> : lesson.order || index + 1}
								</span>
								<span className="min-w-0 flex-1">
									<span className="block line-clamp-2 text-sm font-semibold">{lesson.title}</span>
									<span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
										<i className={lessonIcon} aria-hidden="true" />
										<span>{lesson.duration || 0} min</span>
										{lesson.isFree && <span className="rounded-full bg-white px-2 py-0.5 font-bold text-[#15803D]">Free</span>}
									</span>
								</span>
							</button>
						</li>
					)
				})}
			</ol>
		</div>
	)

	// Learning pages intentionally omit global navigation so the course and
	// lesson controls have the full screen and the student can stay focused.
	return (
		<div className="flex h-screen flex-col overflow-hidden bg-white text-slate-900">
			<header className="z-20 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white px-3 shadow-sm sm:gap-5 sm:px-5">
				<button type="button" onClick={() => navigate('/dashboard/student/courses')} className="inline-flex shrink-0 items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3">
					<i className="fas fa-arrow-left" aria-hidden="true" />
					<span className="hidden sm:inline">Back to My Learning</span>
					<span className="sm:hidden">Back</span>
				</button>

				<button type="button" aria-label="Open course content" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden">
					<i className="fas fa-list" aria-hidden="true" />
				</button>

				<h1 className="min-w-0 flex-1 truncate text-center text-sm font-bold text-slate-900 sm:text-base">
					{course?.title || 'Course Viewer'}
				</h1>

				<div className="w-24 shrink-0 sm:w-44">
					<p className="text-right text-[10px] font-semibold text-slate-500 sm:text-xs">{completedCount} / {totalLessons} lessons</p>
					<div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
						<div className="h-full rounded-full bg-[#22C55E] transition-all duration-200" style={{ width: `${progressPercentage}%` }} />
					</div>
				</div>
			</header>

			<div className="flex min-h-0 flex-1">
				<aside className="hidden w-[280px] shrink-0 border-r border-slate-200 lg:block">{sidebarContent}</aside>

				{sidebarOpen && (
					<div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
						<aside className="h-full w-[min(88vw,320px)] shadow-2xl" onClick={(event) => event.stopPropagation()}>
							<div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
								<span className="font-bold text-slate-900">Course Content</span>
								<button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close course content" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><i className="fas fa-xmark" aria-hidden="true" /></button>
							</div>
							<div className="h-[calc(100%-57px)]">{sidebarContent}</div>
						</aside>
					</div>
				)}

				<main className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
					{loading ? (
						// Skeleton blocks reserve the page structure while content loads,
						// reducing blank-screen time and making perceived wait shorter.
						<div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8" role="status" aria-label="Loading course">
							<div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
							<div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" />
							<div className="aspect-video animate-pulse rounded-2xl bg-slate-200" />
							<div className="h-5 w-full animate-pulse rounded bg-slate-200" />
							<div className="h-5 w-5/6 animate-pulse rounded bg-slate-200" />
						</div>
					) : error ? (
						<section className="mx-auto mt-12 max-w-xl rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm sm:mt-20">
							<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600"><i className="fas fa-lock" aria-hidden="true" /></span>
							<h2 className="mt-4 text-xl font-extrabold text-slate-900">Unable to open this course</h2>
							<p className="mt-2 text-sm text-slate-600">{error}</p>
							<button type="button" onClick={() => navigate('/dashboard/student/courses')} className="mt-6 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#16A34A]">Back to My Learning</button>
						</section>
					) : activeLesson ? (
						<article className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8 lg:p-10">
							<header className="border-b border-slate-200 pb-5">
								<p className="text-sm font-bold text-[#16A34A]">Lesson {activeLesson.order || activeLessonIndex + 1} of {totalLessons}</p>
								<h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{activeLesson.title}</h2>
								<div className="mt-3 flex flex-wrap gap-2">
									<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600"><i className="fas fa-layer-group mr-1.5" aria-hidden="true" />{activeLesson.contentType}</span>
									<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"><i className="fas fa-clock mr-1.5" aria-hidden="true" />{activeLesson.duration || 0} min</span>
									{activeLesson.isFree && <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-bold text-[#15803D]">Free preview</span>}
								</div>
								{activeLesson.description && <p className="mt-4 max-w-3xl leading-7 text-slate-600">{activeLesson.description}</p>}
							</header>

							{(activeLesson.contentType === 'video' || activeLesson.contentType === 'both') && (
								<section aria-label="Lesson video" className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
									<div className="relative aspect-video w-full">
										{renderVideo()}
									</div>
								</section>
							)}

							{(activeLesson.contentType === 'text' || activeLesson.contentType === 'both') && (
								<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  {/* dangerouslySetInnerHTML injects the HTML generated by the RichTextEditor.
                      It is safe here only because the content comes from authenticated teachers on
                      our own platform, not from untrusted public input. */}
                  {activeLesson.textContent && (
                    <div
                      className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: activeLesson.textContent }}
                    />
                  )}
                  {!activeLesson.textContent && (
                    <div className="mx-auto max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
                      No written lesson content was provided.
                    </div>
                  )}
								</section>
							)}

							<nav aria-label="Lesson navigation" className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
								<button type="button" onClick={handlePreviousLesson} disabled={activeLessonIndex === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
									<i className="fas fa-arrow-left text-xs" aria-hidden="true" />Previous Lesson
								</button>
								{isLessonCompleted(activeLesson._id) ? (
									<span className="inline-flex items-center gap-2 rounded-xl bg-[#F0FDF4] px-4 py-2.5 text-sm font-bold text-[#15803D] ring-1 ring-[#22C55E]/20"><i className="fas fa-circle-check" aria-hidden="true" />Completed</span>
								) : (
									<button type="button" onClick={handleMarkComplete} disabled={markingComplete} className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#22C55E]/20 transition hover:bg-[#16A34A] disabled:opacity-60">
										<i className={`fas ${markingComplete ? 'fa-circle-notch fa-spin' : 'fa-check'} text-xs`} aria-hidden="true" />
										{markingComplete ? 'Saving...' : 'Mark as Complete'}
									</button>
								)}
								<button type="button" onClick={handleNextLesson} disabled={activeLessonIndex >= totalLessons - 1} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
									Next Lesson<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
								</button>
							</nav>

							{/* Show completion feedback after the lesson so students can still revisit course content. */}
							{enrollment?.isCompleted && (
								<section className="rounded-2xl border border-[#22C55E]/20 bg-[#F0FDF4] p-6 text-center sm:p-8">
									<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-[#16A34A] shadow-sm"><i className="fas fa-trophy" aria-hidden="true" /></span>
									<p className="mt-4 text-sm font-bold uppercase tracking-wide text-[#16A34A]">Course complete</p>
									<h3 className="mt-2 text-xl font-extrabold text-slate-900">You have completed this course</h3>
									<p className="mt-2 text-sm text-slate-600">You completed {completedCount} of {totalLessons} lessons in {course.title}.</p>
									<div className="mt-5 flex flex-wrap justify-center gap-3">
										<button type="button" disabled={!enrollment.certificateUrl} title={!enrollment.certificateUrl ? 'Certificate will be available when issued' : undefined} onClick={() => enrollment.certificateUrl && window.open(enrollment.certificateUrl, '_blank', 'noopener,noreferrer')} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50">View Certificate</button>
										<Link to="/dashboard/student/browse" className="rounded-xl bg-[#22C55E] px-5 py-3 text-sm font-bold text-white hover:bg-[#16A34A]">Browse More Courses</Link>
									</div>
								</section>
							)}
						</article>
					) : (
						<section className="mx-auto mt-12 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
							<span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#F0FDF4] text-xl text-[#16A34A]"><i className="fas fa-book-open" aria-hidden="true" /></span>
							<h2 className="mt-4 text-xl font-extrabold text-slate-900">Welcome to {course?.title}</h2>
							<p className="mt-2 text-slate-500">Choose a lesson from Course Content to begin.</p>
						</section>
					)}
				</main>
			</div>
		</div>
	)
}

export default CourseViewer
