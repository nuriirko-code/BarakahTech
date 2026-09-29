import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import teachingCategories from '../../../utils/teachingCategories'

const levels = [
	{ value: 'beginner', label: 'Beginner', description: 'For learners starting with the basics.' },
	{ value: 'intermediate', label: 'Intermediate', description: 'For learners with some prior knowledge.' },
	{ value: 'advanced', label: 'Advanced', description: 'For learners ready for deeper study.' },
]

const languages = [
	{ value: 'amharic', label: 'Amharic' },
	{ value: 'english', label: 'English' },
	{ value: 'both', label: 'Both' },
]

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

	const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100'
	const optionClass = (selected) => `rounded-xl border p-4 text-left transition-colors ${selected ? 'border-green-700 bg-green-50 text-green-900' : 'border-gray-200 bg-white hover:border-green-400'}`
	const progressWidth = `${(currentStep / 3) * 100}%`

	return (
		<div className="mx-auto max-w-4xl space-y-7">
			<header>
				<p className="text-sm font-semibold text-green-700">New course{user?.name ? ` · ${user.name}` : ''}</p>
				<h1 className="mt-2 text-3xl font-bold text-gray-900">Create a Course</h1>
			</header>

			<section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
				<div className="flex items-center justify-between text-sm font-semibold text-gray-600">
					<span>Step {currentStep} of 3</span>
					<span>{Math.round((currentStep / 3) * 100)}%</span>
				</div>
				<div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
					<div className="h-full rounded-full bg-green-700 transition-all" style={{ width: progressWidth }} />
				</div>

				{error && <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}

				{currentStep === 1 && (
					<div className="mt-7 space-y-7">
						<h2 className="text-2xl font-bold text-gray-900">Course Details</h2>
						<label className="block space-y-2 text-sm font-semibold">Course title
							<input className={inputClass} value={courseData.title} onChange={(event) => handleChange('title', event.target.value)} placeholder="eg: Complete Web Development Bootcamp" />
						</label>
						<label className="block space-y-2 text-sm font-semibold">Course description
							<textarea className={`${inputClass} min-h-36`} value={courseData.description} onChange={(event) => handleChange('description', event.target.value)} placeholder="Describe what this course covers and who it is for." />
							<span className="block text-right font-normal text-gray-500">{courseData.description.length} / 50 minimum characters</span>
						</label>

						<fieldset>
							<legend className="mb-3 font-semibold">Choose a category</legend>
							<div className="grid gap-3 sm:grid-cols-2">
								{Object.entries(teachingCategories).map(([categoryId, category]) => (
									<button key={categoryId} type="button" aria-pressed={courseData.category === categoryId} className={optionClass(courseData.category === categoryId)} onClick={() => handleChange('category', categoryId)}>
										<span className="mr-3 text-2xl" aria-hidden="true">{category.icon}</span>{category.label}
									</button>
								))}
							</div>
						</fieldset>

						{courseData.category && (
							<label className="block space-y-2 text-sm font-semibold">Subject
								<select className={inputClass} value={courseData.subject} onChange={(event) => handleChange('subject', event.target.value)}>
									<option value="">Select a subject</option>
									{teachingCategories[courseData.category].subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
								</select>
							</label>
						)}

						<fieldset>
							<legend className="mb-3 font-semibold">Course level</legend>
							<div className="grid gap-3 md:grid-cols-3">
								{levels.map((level) => (
									<button key={level.value} type="button" aria-pressed={courseData.level === level.value} className={optionClass(courseData.level === level.value)} onClick={() => handleChange('level', level.value)}>
										<span className="block font-bold">{level.label}</span>
										<span className="mt-1 block text-sm font-normal text-gray-600">{level.description}</span>
									</button>
								))}
							</div>
						</fieldset>

						<fieldset>
							<legend className="mb-3 font-semibold">Course language</legend>
							<div className="flex flex-wrap gap-3">
								{languages.map((language) => (
									<button key={language.value} type="button" aria-pressed={courseData.language === language.value} className={`${optionClass(courseData.language === language.value)} px-5`} onClick={() => handleChange('language', language.value)}>{language.label}</button>
								))}
							</div>
						</fieldset>
					</div>
				)}

				{currentStep === 2 && (
					<div className="mt-7 space-y-7">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">What will students learn?</h2>
							<p className="mt-2 text-gray-600">Add at least 3 learning objectives for your course.</p>
						</div>

						<div className="space-y-3">
							{courseData.objectives.map((objective, index) => (
								<div key={`objective-${index}`} className="flex items-center gap-3">
									<label className="flex-1 space-y-1 text-sm font-medium">Objective {index + 1}
										<input className={inputClass} value={objective} onChange={(event) => handleObjectiveChange(index, event.target.value)} placeholder="By the end, students will be able to..." />
									</label>
									<button type="button" disabled={courseData.objectives.length <= 3} onClick={() => removeObjective(index)} aria-label={`Remove objective ${index + 1}`} className="mt-6 rounded-lg border border-gray-300 px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Remove</button>
								</div>
							))}
						</div>
						<button type="button" disabled={courseData.objectives.length >= 8} onClick={addObjective} className="font-semibold text-green-800 hover:underline disabled:cursor-not-allowed disabled:opacity-40">+ Add another objective</button>

						<label className="block space-y-2 text-sm font-semibold">Total course hours
							<input className={inputClass} type="number" min="1" value={courseData.estimatedDuration} onChange={(event) => handleChange('estimatedDuration', event.target.value)} />
							<span className="block font-normal text-gray-500">Estimated duration helps students decide whether the course fits their schedule.</span>
						</label>

						<section className="space-y-4 rounded-xl bg-gray-50 p-5">
							<label className="flex items-center gap-3 font-semibold text-gray-800">
								<input className="h-5 w-5 accent-green-700" type="checkbox" checked={courseData.isFree} onChange={(event) => handleChange('isFree', event.target.checked)} />
								This course is free
							</label>
							{courseData.isFree ? (
								<p className="text-sm text-green-800">Students can enroll for free.</p>
							) : (
								<label className="block space-y-2 text-sm font-semibold">Course price (ETB)
									<input className={inputClass} type="number" min="0" step="0.01" value={courseData.price} onChange={(event) => handleChange('price', event.target.value)} />
								</label>
							)}
						</section>
					</div>
				)}

				{currentStep === 3 && (
					<section className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
						<h2 className="text-2xl font-bold text-amber-950">Add Lessons</h2>
						<p className="mt-3 leading-7 text-amber-900">
							Lesson creation and uploads will be available in a later step after the Course model and backend API are ready.
						</p>
						{/* This placeholder will be replaced with lesson editing and upload after Course exists on the backend. */}
						<button type="button" onClick={handleSaveDraft} className="mt-6 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
							Save Course Draft
						</button>
						<button type="button" onClick={() => navigate('/dashboard/teacher/courses')} className="ml-3 mt-6 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-white">
							Return to courses
						</button>
					</section>
				)}

				<div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
					<button type="button" disabled={currentStep === 1} onClick={handleBack} className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Back</button>
					{currentStep < 3 && <button type="button" onClick={handleNext} className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white hover:bg-green-800">Next</button>}
				</div>
			</section>
		</div>
	)
}

export default TeacherCreateCourse
