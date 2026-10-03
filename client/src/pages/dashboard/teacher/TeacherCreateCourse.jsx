import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../../context/AuthContext'
import teachingCategories from '../../../utils/teachingCategories'

const levels = [
	{ value: 'beginner', label: 'Beginner', icon: 'fas fa-seedling', description: 'For learners starting with the basics.' },
	{ value: 'intermediate', label: 'Intermediate', icon: 'fas fa-chart-line', description: 'For learners with some prior knowledge.' },
	{ value: 'advanced', label: 'Advanced', icon: 'fas fa-rocket', description: 'For learners ready for deeper study.' },
]

const languages = [
	{ value: 'amharic', label: 'Amharic' },
	{ value: 'english', label: 'English' },
	{ value: 'both', label: 'Both' },
]

// Maps category ids to Font Awesome icons (fallback for any id not listed).
const categoryIcons = {
	programming: 'fas fa-code',
	technology: 'fas fa-microchip',
	languages: 'fas fa-language',
	mathematics: 'fas fa-calculator',
	science: 'fas fa-flask',
	business: 'fas fa-briefcase',
	arts: 'fas fa-palette',
    design: 'fas fa-pen-ruler',
}

const TeacherCreateCourse = () => {
	const location = useLocation()
	const [currentStep, setCurrentStep] = useState(location.state?.courseId ? 3 : 1)
	const [error, setError] = useState('')
	const [courseId, setCourseId] = useState(location.state?.courseId || null)
	const [lessons, setLessons] = useState([])
	const [addingLesson, setAddingLesson] = useState(false)
	const [publishLoading, setPublishLoading] = useState(false)
	const [savingCourse, setSavingCourse] = useState(false)
	const [lessonForm, setLessonForm] = useState({
		title: '',
		description: '',
		contentType: 'both',
		videoUrl: '',
		videoSource: 'youtube',
		textContent: '',
		duration: 0,
		isFree: false,
	})
	// Objectives are an array because one course has multiple distinct learning outcomes.
	const [courseData, setCourseData] = useState({
		title: '',
		description: '',
		category: '',
		subject: '',
		level: '',
		language: '',
		price: 0,
		isFree: false,
		estimatedDuration: '',
		objectives: ['', '', ''],
	})
	const { user, token, setSuccess } = useAuth()
	const navigate = useNavigate()

	// The courses page can pass an existing draft ID when its owner chooses
	// Add Lessons. Load that draft so Step 3 resumes with its existing lessons. !courseId ensures this effect only runs when a draft ID is present, not when the component first mounts.If we're not editing an existing course, don't try to load one.
	useEffect(() => {
		if (!courseId) return undefined

		let isCurrent = true
		axios.get(`http://localhost:5000/api/courses/${courseId}`)
			.then((response) => {
				if (!isCurrent) return
				const course = response.data.course
				setCourseData({
					title: course.title || '',
					description: course.description || '',
					category: course.category || '',
					subject: course.subject || '',
					level: course.level || '',
					language: course.language || '',
					price: course.price ?? 0,
					isFree: course.isFree || false,
					estimatedDuration: course.estimatedDuration ?? '',
					objectives: course.objectives || ['', '', ''],
				})
				setLessons(course.lessons || [])
			})
			.catch((requestError) => {
				if (isCurrent) setError(requestError.response?.data?.message || 'Could not load this course draft.')
			})

		return () => {
			isCurrent = false
		}
	}, [courseId])

	const handleChange = (field, value) => {
		setCourseData((currentData) => ({
			...currentData,
			[field]: value,
			...(field === 'category' ? { subject: '' } : {}),// if the field being changed is category, also set subject back to an empty string; otherwise add nothing.
		}))
	}

	const handleObjectiveChange = (index, value) => {
		setCourseData((currentData) => ({
			...currentData,
			objectives: currentData.objectives.map((objective, objectiveIndex) => (
				objectiveIndex === index ? value : objective
			)),
		}))
	}

	const handleLessonChange = (field, value) => {
		setLessonForm((currentForm) => ({ ...currentForm, [field]: value }))
	}
// If there are already 8 objectives, it returns currentData unchanged, so nothing is added. If there are fewer than 8, it creates a new course object, copies the old fields, and builds a new objectives array with ...currentData.objectives plus one extra empty string '' at the end. The empty string becomes a new blank input on the screen.
	const addObjective = () => {
		setCourseData((currentData) => currentData.objectives.length >= 8
			? currentData
			: { ...currentData, objectives: [...currentData.objectives, ''] })
	}
// If there are 3 or fewer objectives, it returns currentData unchanged, so nothing is removed. If there are more than 3, it creates a new course object, copies the old fields, and builds a new objectives array that filters out the objective at the specified index. The filter method creates a new array with all objectives except the one at the index to be removed.
	const removeObjective = (index) => {
		setCourseData((currentData) => currentData.objectives.length <= 3
			? currentData
			: { ...currentData, objectives: currentData.objectives.filter((_, objectiveIndex) => objectiveIndex !== index) })
	}

	// Validate one step at a time so a teacher can fix issues before proceeding.
	const validateStep = (step) => {
		let validationMessage = ''

		if (step === 1) {
			if (courseData.title.trim().length < 10) {
				validationMessage = 'Course title must be at least 10 characters.'
			} else if (courseData.description.trim().length < 50) {
				validationMessage = 'Course description must be at least 50 characters.'
			} else if (!courseData.category || !courseData.subject || !courseData.level || !courseData.language) {
				validationMessage = 'Choose a category, subject, level, and course language.'
			}
		}

		if (step === 2) {
			// Requiring meaningful text prevents empty or one-word objectives from counting.
			const objectivesAreValid = courseData.objectives.length >= 3
				&& courseData.objectives.every((objective) => objective.trim().length >= 10)
			if (!objectivesAreValid) {
				validationMessage = 'Add at least 3 learning objectives, each at least 10 characters long.'
			} else if (!courseData.estimatedDuration || Number(courseData.estimatedDuration) <= 0) {
				validationMessage = 'Enter a total course duration greater than zero hours.'
			} else if (!courseData.isFree && (String(courseData.price).trim() === '' || !Number.isFinite(Number(courseData.price)) || Number(courseData.price) < 0)) {
				validationMessage = 'Enter a valid course price in ETB.'
			}
		}

		setError(validationMessage)
		return validationMessage === ''
	}
// If the current step is valid, it clears any error message and increments the current step by 1, but not beyond 3. If the current step is invalid, it sets an error message and does not change the current step.
	const handleNext = async () => {
		if (validateStep(currentStep)) {
			setError('')

			if (currentStep === 2 && !courseId) {
				setSavingCourse(true)
				try {
					// Create the draft now so subsequent lesson requests have a stable
					// courseId to target; waiting until final publish would leave lesson
					// uploads without a parent course document.
					const response = await axios.post(
						'http://localhost:5000/api/courses',
						{
							...courseData,
							price: courseData.isFree ? 0 : Number(courseData.price),
							estimatedDuration: Number(courseData.estimatedDuration),
						},
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					const createdCourseId = response.data.course?._id
					if (!createdCourseId) throw new Error('The server did not return the new course ID.')
					setCourseId(createdCourseId)
					setLessons(response.data.course.lessons || [])
					setCurrentStep(3)
				} catch (requestError) {
					setError(requestError.response?.data?.message || requestError.message || 'Could not save the course draft.')
				} finally {
					setSavingCourse(false)
				}
				return
			}

			setCurrentStep((step) => Math.min(step + 1, 3))
		}
	}
// If the current step is 1, it clears any error message and does not change the current step. If the current step is greater than 1, it clears any error message and decrements the current step by 1, but not below 1.
	const handleBack = () => {
		setError('')
		setCurrentStep((step) => Math.max(step - 1, 1))
	}

	const handleAddLesson = async () => {
		setError('')
		if (!lessonForm.title.trim()) {
			setError('Enter a title for this lesson.')
			return
		}
		if ((lessonForm.contentType === 'video' || lessonForm.contentType === 'both') && !lessonForm.videoUrl.trim()) {
			setError('Enter a video URL for this lesson.')
			return
		}
		if ((lessonForm.contentType === 'text' || lessonForm.contentType === 'both') && !lessonForm.textContent.trim()) {
			setError('Add text content for this lesson.')
			return
		}

		setAddingLesson(true)
		try {
			const response = await axios.post(
				`http://localhost:5000/api/courses/${courseId}/lessons`,
				{ ...lessonForm, title: lessonForm.title.trim(), duration: Number(lessonForm.duration) || 0 },
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			setLessons((currentLessons) => [...currentLessons, response.data.lesson])
			setLessonForm({
				title: '', description: '', contentType: 'both', videoUrl: '',
				videoSource: 'youtube', textContent: '', duration: 0, isFree: false,
			})
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not add this lesson.')
		} finally {
			setAddingLesson(false)
		}
	}

	const handlePublish = async () => {
		if (!courseId || lessons.length === 0) return
		setPublishLoading(true)
		setError('')

		try {
			await axios.put(
				`http://localhost:5000/api/courses/${courseId}/publish`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			)
			const message = 'Course published successfully.'
			setSuccess(message)
			navigate('/dashboard/teacher/courses', { state: { successMessage: message } })
		} catch (requestError) {
			setError(requestError.response?.data?.message || 'Could not publish this course.')
		} finally {
			setPublishLoading(false)
		}
	}

	const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'
	const optionClass = (selected) => `flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
		selected
			? 'border-[#22C55E] bg-[#F0FDF4] text-slate-900 shadow-sm ring-1 ring-[#22C55E]/30'
			: 'border-slate-200 bg-white hover:border-[#22C55E]/50 hover:bg-slate-50'
	}`
	const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#22C55E]/25 transition-all hover:bg-[#16A34A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 disabled:opacity-50'
	const secondaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40'

	const progressWidth = `${(currentStep / 3) * 100}%`

	return (
		<div className="space-y-7">
			<header>
				<p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">
					New course{user?.name ? ` · ${user.name}` : ''}
				</p>
				<h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Create a Course</h1>
			</header>

			<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
				{/* Progress bar */}
				<div className="flex items-center justify-between text-sm font-bold text-slate-600">
					<span>Step {currentStep} of 3</span>
					<span className="text-[#16A34A]">{Math.round((currentStep / 3) * 100)}%</span>
				</div>
				<div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
					<div className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-300" style={{ width: progressWidth }} />
				</div>

				{error && (
					<div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-800">
						<i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
						{error}
					</div>
				)}

				{currentStep === 1 && (
					<div className="mt-7 space-y-7">
						<h2 className="text-xl font-extrabold tracking-tight text-slate-900">Course Details</h2>
						<label className="block space-y-2 text-sm font-semibold text-slate-800">Course title
							<input className={inputClass} value={courseData.title} onChange={(event) => handleChange('title', event.target.value)} placeholder="eg: Complete Web Development Bootcamp" />
						</label>
						<label className="block space-y-2 text-sm font-semibold text-slate-800">Course description
							<textarea className={`${inputClass} min-h-36`} value={courseData.description} onChange={(event) => handleChange('description', event.target.value)} placeholder="Describe what this course covers and who it is for." />
							<span className="block text-right text-xs font-medium text-slate-400">{courseData.description.length} / 50 minimum characters</span>
						</label>

						<fieldset>
							<legend className="mb-3 font-semibold text-slate-800">Choose a category</legend>
							<div className="grid gap-3 sm:grid-cols-2">
								{Object.entries(teachingCategories).map(([categoryId, category]) => (
									<button key={categoryId} type="button" aria-pressed={courseData.category === categoryId} className={optionClass(courseData.category === categoryId)} onClick={() => handleChange('category', categoryId)}>
										<span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm ${courseData.category === categoryId ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">
											<i className={categoryIcons[categoryId] || 'fas fa-layer-group'} />
										</span>
										<span className="font-semibold">{category.label}</span>
									</button>
								))}
							</div>
						</fieldset>

						{courseData.category && (
							<label className="block space-y-2 text-sm font-semibold text-slate-800">Subject
								<select className={inputClass} value={courseData.subject} onChange={(event) => handleChange('subject', event.target.value)}>
									<option value="">Select a subject</option>
									{teachingCategories[courseData.category].subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
								</select>
							</label>
						)}

						<fieldset>
							<legend className="mb-3 font-semibold text-slate-800">Course level</legend>
							<div className="grid gap-3 md:grid-cols-3">
								{levels.map((level) => (
									<button key={level.value} type="button" aria-pressed={courseData.level === level.value} className={optionClass(courseData.level === level.value)} onClick={() => handleChange('level', level.value)}>
										<span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm ${courseData.level === level.value ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">
											<i className={level.icon} />
										</span>
										<span className="min-w-0">
											<span className="block font-bold">{level.label}</span>
											<span className="mt-1 block text-sm font-normal text-slate-500">{level.description}</span>
										</span>
									</button>
								))}
							</div>
						</fieldset>

						<fieldset>
							<legend className="mb-3 font-semibold text-slate-800">Course language</legend>
							<div className="flex flex-wrap gap-3">
								{languages.map((language) => (
									<button key={language.value} type="button" aria-pressed={courseData.language === language.value} className={`${optionClass(courseData.language === language.value)} px-5 py-2.5`} onClick={() => handleChange('language', language.value)}>
										<span className="font-semibold">{language.label}</span>
									</button>
								))}
							</div>
						</fieldset>
					</div>
				)}

				{currentStep === 2 && (
					<div className="mt-7 space-y-7">
						<div>
							<h2 className="text-xl font-extrabold tracking-tight text-slate-900">What will students learn?</h2>
							<p className="mt-2 text-slate-500">Add at least 3 learning objectives for your course.</p>
						</div>

						<div className="space-y-3">
							{courseData.objectives.map((objective, index) => (
								<div key={`objective-${index}`} className="flex items-center gap-3">
									<label className="flex-1 space-y-1 text-sm font-medium text-slate-700">Objective {index + 1}
										<input className={inputClass} value={objective} onChange={(event) => handleObjectiveChange(index, event.target.value)} placeholder="By the end, students will be able to..." />
									</label>
									<button
										type="button"
										disabled={courseData.objectives.length <= 3}
										onClick={() => removeObjective(index)}
										aria-label={`Remove objective ${index + 1}`}
										className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
									>
										<i className="fas fa-trash text-xs" aria-hidden="true" />
										Remove
									</button>
								</div>
							))}
						</div>
						<button
							type="button"
							disabled={courseData.objectives.length >= 8}
							onClick={addObjective}
							className="inline-flex items-center gap-2 font-bold text-[#16A34A] hover:text-[#15803D] disabled:cursor-not-allowed disabled:opacity-40"
						>
							<i className="fas fa-plus" aria-hidden="true" />
							Add another objective
						</button>

						<label className="block space-y-2 text-sm font-semibold text-slate-800">Total course hours
							<input className={inputClass} type="number" min="1" value={courseData.estimatedDuration} onChange={(event) => handleChange('estimatedDuration', event.target.value)} />
							<span className="block text-xs font-medium text-slate-400">Estimated duration helps students decide whether the course fits their schedule.</span>
						</label>

						<section className="space-y-4 rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
							<label className="flex items-center gap-3 font-semibold text-slate-800">
								<input className="h-5 w-5 accent-[#22C55E]" type="checkbox" checked={courseData.isFree} onChange={(event) => handleChange('isFree', event.target.checked)} />
								This course is free
							</label>
							{courseData.isFree ? (
								<p className="flex items-center gap-2 text-sm font-medium text-[#15803D]">
									<i className="fas fa-circle-check" aria-hidden="true" />
									Students can enroll for free.
								</p>
							) : (
								<label className="block space-y-2 text-sm font-semibold text-slate-800">Course price (ETB)
									<input className={inputClass} type="number" min="0" step="0.01" value={courseData.price} onChange={(event) => handleChange('price', event.target.value)} />
								</label>
							)}
						</section>
					</div>
				)}

				{currentStep === 3 && (
					<div className="mt-7 space-y-7">
						<header>
							<h2 className="text-xl font-extrabold tracking-tight text-slate-900">Add Course Lessons</h2>
							<p className="mt-2 text-sm text-slate-500">{courseData.title}</p>
						</header>

						<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
							<h3 className="font-bold text-slate-900">Lessons added so far</h3>
							{lessons.length === 0 ? (
								<p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No lessons added yet. Add your first lesson below.</p>
							) : (
								<ol className="mt-4 divide-y divide-slate-100">
									{lessons.map((lesson, index) => (
										<li key={lesson._id || `${lesson.title}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
											<div className="flex min-w-0 items-center gap-3">
												<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-sm font-bold text-[#16A34A]">{lesson.order || index + 1}</span>
												<span className="min-w-0">
													<span className="block truncate font-semibold text-slate-900">{lesson.title}</span>
													<span className="mt-1 block text-xs capitalize text-slate-500">{lesson.contentType} · {lesson.duration || 0} min</span>
												</span>
											</div>
											{lesson.isFree && <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-bold text-[#15803D]">Free preview</span>}
										</li>
									))}
								</ol>
							)}
						</section>

						<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
							<h3 className="text-lg font-extrabold text-slate-900">Add a New Lesson</h3>
							<div className="mt-5 space-y-5">
								<label className="block space-y-2 text-sm font-semibold text-slate-800">Lesson title
									<input className={inputClass} value={lessonForm.title} onChange={(event) => handleLessonChange('title', event.target.value)} placeholder="Lesson title" />
								</label>
								<label className="block space-y-2 text-sm font-semibold text-slate-800">Lesson description (optional)
									<textarea className={`${inputClass} min-h-24`} value={lessonForm.description} onChange={(event) => handleLessonChange('description', event.target.value)} placeholder="What will this lesson cover?" />
								</label>

								<fieldset>
									<legend className="mb-3 text-sm font-semibold text-slate-800">Content type</legend>
									<div className="grid gap-3 sm:grid-cols-3">
										{[
											{ value: 'video', label: 'Video Only', icon: 'fas fa-video' },
											{ value: 'text', label: 'Text Only', icon: 'fas fa-file-lines' },
											{ value: 'both', label: 'Video and Text', icon: 'fas fa-layer-group' },
										].map((type) => (
											<button key={type.value} type="button" aria-pressed={lessonForm.contentType === type.value} onClick={() => handleLessonChange('contentType', type.value)} className={`${optionClass(lessonForm.contentType === type.value)} justify-center`}>
												<i className={type.icon} aria-hidden="true" />{type.label}
											</button>
										))}
									</div>
								</fieldset>

								{(lessonForm.contentType === 'video' || lessonForm.contentType === 'both') && (
									<div className="space-y-4">
										<fieldset>
											<legend className="mb-3 text-sm font-semibold text-slate-800">Video source</legend>
											<div className="flex flex-wrap gap-2">
												{[
													{ value: 'youtube', label: 'YouTube Link' },
													{ value: 'googledrive', label: 'Google Drive Link' },
													{ value: 'upload', label: 'Upload File' },
												].map((source) => (
													<button key={source.value} type="button" aria-pressed={lessonForm.videoSource === source.value} onClick={() => handleLessonChange('videoSource', source.value)} className={`${optionClass(lessonForm.videoSource === source.value)} px-3 py-2 text-sm`}>
														{source.label}
													</button>
												))}
											</div>
										</fieldset>
										<label className="block space-y-2 text-sm font-semibold text-slate-800">Video URL
											<input className={inputClass} type="url" value={lessonForm.videoUrl} onChange={(event) => handleLessonChange('videoUrl', event.target.value)} placeholder={lessonForm.videoSource === 'youtube' ? 'https://youtube.com/...' : lessonForm.videoSource === 'googledrive' ? 'https://drive.google.com/...' : 'Paste the hosted upload URL'} />
											{lessonForm.videoSource === 'upload' && <span className="block text-xs font-normal text-slate-500">Direct file uploading will be connected when media storage is added.</span>}
										</label>
									</div>
								)}

								{(lessonForm.contentType === 'text' || lessonForm.contentType === 'both') && (
									<label className="block space-y-2 text-sm font-semibold text-slate-800">Lesson text content
										<textarea className={`${inputClass} min-h-40`} value={lessonForm.textContent} onChange={(event) => handleLessonChange('textContent', event.target.value)} placeholder="Write the lesson content for students..." />
									</label>
								)}

								<div className="grid gap-5 sm:grid-cols-2">
									<label className="block space-y-2 text-sm font-semibold text-slate-800">Lesson duration (minutes)
										<input className={inputClass} type="number" min="0" value={lessonForm.duration} onChange={(event) => handleLessonChange('duration', event.target.value)} />
									</label>
									<label className="flex items-center gap-3 self-end rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-800">
										<input className="h-5 w-5 accent-[#22C55E]" type="checkbox" checked={lessonForm.isFree} onChange={(event) => handleLessonChange('isFree', event.target.checked)} />
										Make this lesson free for non-enrolled students
									</label>
								</div>

								<button type="button" disabled={addingLesson || !courseId} onClick={handleAddLesson} className={primaryButtonClass}>
									<i className={`fas ${addingLesson ? 'fa-circle-notch fa-spin' : 'fa-plus'} text-xs`} aria-hidden="true" />
									{addingLesson ? 'Adding Lesson...' : 'Add This Lesson'}
								</button>
							</div>
						</section>

						{lessons.length > 0 && (
							<section className="rounded-2xl border border-[#22C55E]/20 bg-gradient-to-br from-[#F0FDF4] to-white p-6 shadow-sm sm:p-8">
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<h3 className="text-xl font-extrabold text-slate-900">Ready to publish?</h3>
										<p className="mt-2 text-slate-600">Your course will be visible to all students on BarakahTech once published.</p>
									</div>
									<span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#15803D] ring-1 ring-[#22C55E]/20">{lessons.length} lessons</span>
								</div>
								<div className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-3">
									<p><span className="block text-slate-500">Course</span><span className="mt-1 block font-semibold text-slate-900">{courseData.title}</span></p>
									<p><span className="block text-slate-500">Estimated duration</span><span className="mt-1 block font-semibold text-slate-900">{courseData.estimatedDuration} hours</span></p>
									<p><span className="block text-slate-500">Price</span><span className="mt-1 block font-semibold text-slate-900">{courseData.isFree ? 'Free' : `ETB ${Number(courseData.price).toLocaleString()}`}</span></p>
								</div>
								<button type="button" disabled={publishLoading} onClick={handlePublish} className={`${primaryButtonClass} mt-6`}>
									<i className={`fas ${publishLoading ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'} text-xs`} aria-hidden="true" />
									{publishLoading ? 'Publishing...' : 'Publish Course'}
								</button>
							</section>
						)}
					</div>
				)}

				<div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
					<button type="button" disabled={currentStep === 1} onClick={handleBack} className={secondaryButtonClass}>
						<i className="fas fa-arrow-left text-xs" aria-hidden="true" />
						Back
					</button>
					{currentStep < 3 && (
						<button type="button" disabled={savingCourse} onClick={handleNext} className={primaryButtonClass}>
							{savingCourse && <i className="fas fa-circle-notch fa-spin text-xs" aria-hidden="true" />}
							Next
							<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
						</button>
					)}
				</div>
			</section>
		</div>
	)
}

export default TeacherCreateCourse