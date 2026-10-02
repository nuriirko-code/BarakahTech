import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
	music: 'fas fa-music',
	design: 'fas fa-pen-ruler',
}

const TeacherCreateCourse = () => {
	const [currentStep, setCurrentStep] = useState(1)
	const [error, setError] = useState('')
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
	const { user } = useAuth()
	const navigate = useNavigate()

	const handleChange = (field, value) => {
		setCourseData((currentData) => ({
			...currentData,
			[field]: value,
			...(field === 'category' ? { subject: '' } : {}),
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

	const addObjective = () => {
		setCourseData((currentData) => currentData.objectives.length >= 8
			? currentData
			: { ...currentData, objectives: [...currentData.objectives, ''] })
	}

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

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setError('')
			setCurrentStep((step) => Math.min(step + 1, 3))
		}
	}

	const handleBack = () => {
		setError('')
		setCurrentStep((step) => Math.max(step - 1, 1))
	}

	const handleSaveDraft = () => {
		// This temporary action will be replaced with a backend save after Course exists.
		console.log('Course draft:', { ...courseData, teacherName: user?.name })
		setError('')
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
					<section className="mt-7 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
						<span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xl text-amber-600">
							<i className="fas fa-clock" aria-hidden="true" />
						</span>
						<h2 className="mt-4 text-xl font-extrabold tracking-tight text-amber-950">Add Lessons</h2>
						<p className="mt-3 leading-7 text-amber-900">
							Lesson creation and uploads will be available in a later step after the Course model and backend API are ready.
						</p>
						{/* This placeholder will be replaced with lesson editing and upload after Course exists on the backend. */}
						<div className="mt-6 flex flex-wrap gap-3">
							<button type="button" onClick={handleSaveDraft} className={primaryButtonClass}>
								<i className="fas fa-floppy-disk text-xs" aria-hidden="true" />
								Save Course Draft
							</button>
							<button type="button" onClick={() => navigate('/dashboard/teacher/courses')} className={secondaryButtonClass}>
								Return to courses
							</button>
						</div>
					</section>
				)}

				<div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
					<button type="button" disabled={currentStep === 1} onClick={handleBack} className={secondaryButtonClass}>
						<i className="fas fa-arrow-left text-xs" aria-hidden="true" />
						Back
					</button>
					{currentStep < 3 && (
						<button type="button" onClick={handleNext} className={primaryButtonClass}>
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