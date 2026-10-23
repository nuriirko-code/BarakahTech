import { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { getSupportedCurrencies } from '../../utils/currencyUtils'
import teachingCategories from '../../utils/teachingCategories'
import Avatar from '../../components/common/Avatar'
import { resizeImageFile } from '../../utils/imageUtils'

const stepDetails = [
  { label: 'Teaching', icon: 'fas fa-book-open' },
  { label: 'Sessions', icon: 'fas fa-video' },
  { label: 'Availability', icon: 'fas fa-calendar-days' },
  { label: 'Profile', icon: 'fas fa-user-check' },
  { label: 'Assessment', icon: 'fas fa-clipboard-check' },
]

// Both applications read category subjects from the same source. Updating a
// category once therefore keeps the course-teacher and live-tutor journeys aligned.
const categoryIcons = {
  technology: 'fas fa-microchip',
  languages: 'fas fa-language',
  sciences: 'fas fa-flask',
  business: 'fas fa-briefcase',
  leadership: 'fas fa-people-group',
}

const teachingLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' },
]

const teachingLanguages = ['Amharic', 'English', 'Afaan Oromo', 'Arabic', 'Other']

const timezones = [
  'Africa/Addis_Ababa',
  'Africa/Lagos',
  'Africa/Cairo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Tokyo',
]

// The short labels keep the schedule compact, while the full values match the
// backend schema and stay clear when an availability record is reviewed later.
const weekDays = [
  { short: 'Mon', value: 'Monday' },
  { short: 'Tue', value: 'Tuesday' },
  { short: 'Wed', value: 'Wednesday' },
  { short: 'Thu', value: 'Thursday' },
  { short: 'Fri', value: 'Friday' },
  { short: 'Sat', value: 'Saturday' },
  { short: 'Sun', value: 'Sunday' },
]

const scenarioQuestions = [
  'A student is confused about a concept you just explained. How do you handle this?',
  'A student misses three sessions in a row without notice. What do you do?',
  'A student gives you negative feedback after a session. How do you respond?',
]

// All fields live in one object so moving between steps never loses earlier
// answers. This is the same scalable pattern used by multi-step registration forms.
const createInitialFormData = () => ({
  mainCategory: '',
  subjects: [],
  teachingLevel: '',
  teachingLanguages: [],
  sessionDuration: '',
  sessionPrice: '',
  currency: 'USD',
  timezone: '',
  weeklyAvailability: [],
  minimumSessionsPerWeek: 1,
  advanceBookingHours: 24,
  yearsOfExperience: '',
  profilePhoto: '',
  bio: '',
  teachingApproach: '',
  introVideoUrl: '',
  scenarioAnswers: scenarioQuestions.map((scenario) => ({ scenario, answer: '' })),
})

const LiveTutorApplication = () => {
  const { token, user, updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(createInitialFormData)
  const [subjectInput, setSubjectInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()

  // A User has one shared profile photo. If the applicant already supplied it
  // while registering or applying to teach courses, reuse it for this second
  // application instead of asking them to upload the same photo again.
  useEffect(() => {
    if (!user?.profilePhoto) return

    setFormData((currentData) => (
      currentData.profilePhoto
        ? currentData
        : { ...currentData, profilePhoto: user.profilePhoto }
    ))
  }, [user?.profilePhoto])

  const handleChange = (field, value) => {
    setFormData((currentData) => ({ ...currentData, [field]: value }))
    setError('')
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  const clearFieldError = (field) => {
    setFieldErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  // Array fields support more than one valid choice. This helper adds a missing
  // item or removes a selected item without repeating array-update logic in JSX.
  const toggleArrayItem = (field, item) => {
    setFormData((currentData) => {
      const items = currentData[field]
      const hasItem = items.includes(item)
        
      return {
        ...currentData,
        [field]: hasItem ? items.filter((entry) => entry !== item) : [...items, item],
      }
    })
    setError('')
    clearFieldError(field)
  }

  const addSubject = () => {
    const subject = subjectInput.trim()
    if (!subject) return

    if (!formData.subjects.some((entry) => entry.toLowerCase() === subject.toLowerCase())) {
      setFormData((currentData) => ({
        ...currentData,
        subjects: [...currentData.subjects, subject],
      }))
    }

    setSubjectInput('')
    setError('')
    clearFieldError('subjects')
  }

  const handleSubjectKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addSubject()
    }
  }

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // The shared utility resizes the image before it enters JSON, keeping it
      // under the backend request limit and giving every tutor card a uniform image.
      const profilePhoto = await resizeImageFile(file)
      handleChange('profilePhoto', profilePhoto)
    } catch (photoError) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        profilePhoto: photoError.message,
      }))
    }
  }

  const selectCategory = (category) => {
    // Suggestions belong to a category, so clearing selected subjects prevents
    // accidentally submitting a mixture such as Physics under Technology.
    setFormData((currentData) => ({
      ...currentData,
      mainCategory: category,
      subjects: [],
    }))
    setSubjectInput('')
    setError('')
    setFieldErrors((currentErrors) => ({ ...currentErrors, mainCategory: '', subjects: '' }))
  }

  const toggleDay = (day) => {
    setFormData((currentData) => {
      const isSelected = currentData.weeklyAvailability.some((slot) => slot.day === day)

      return {
        ...currentData,
        weeklyAvailability: isSelected
          ? currentData.weeklyAvailability.filter((slot) => slot.day !== day)
          : [...currentData.weeklyAvailability, { day, startTime: '09:00', endTime: '17:00' }],
      }
    })
    setError('')
    clearFieldError('weeklyAvailability')
  }

  const updateDayTime = (day, field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      weeklyAvailability: currentData.weeklyAvailability.map((slot) => (
        slot.day === day ? { ...slot, [field]: value } : slot
      )),
    }))
    clearFieldError('weeklyAvailability')
  }

  const updateScenarioAnswer = (index, answer) => {
    setFormData((currentData) => ({
      ...currentData,
      scenarioAnswers: currentData.scenarioAnswers.map((scenario, scenarioIndex) => (
        scenarioIndex === index ? { ...scenario, answer } : scenario
      )),
    }))
    setError('')
    clearFieldError(`scenarioAnswer-${index}`)
  }

  const validateStep = (step) => {
    const nextFieldErrors = {}

    if (step === 1) {
      if (!formData.mainCategory) nextFieldErrors.mainCategory = 'Choose one teaching category.'
      if (!formData.subjects.length) nextFieldErrors.subjects = 'Add at least one subject you can teach.'
      if (!formData.teachingLevel) nextFieldErrors.teachingLevel = 'Choose the level you teach.'
      if (!formData.teachingLanguages.length) nextFieldErrors.teachingLanguages = 'Choose at least one teaching language.'
    }

    if (step === 2) {
      if (!Number.isInteger(Number(formData.sessionDuration)) || Number(formData.sessionDuration) < 1) nextFieldErrors.sessionDuration = 'Enter a whole session length greater than zero.'
      if (Number(formData.sessionPrice) <= 0) nextFieldErrors.sessionPrice = 'Enter a session price greater than zero.'
    }

    if (step === 3) {
      // Timezone is required because the same clock time can mean a different
      // moment for a student and tutor in different parts of the world.
      if (!formData.timezone) nextFieldErrors.timezone = 'Choose the timezone where you teach.'
      if (!formData.weeklyAvailability.length) nextFieldErrors.weeklyAvailability = 'Choose at least one day and teaching time.'
    }

    if (step === 4) {
      if (!formData.profilePhoto && !user?.profilePhoto) {
        nextFieldErrors.profilePhoto = 'Upload a clear profile photo so students can recognize you when searching for a tutor.'
      }
      if (formData.yearsOfExperience === '' || Number(formData.yearsOfExperience) < 0) {
        nextFieldErrors.yearsOfExperience = 'Enter your years of teaching experience.'
      }
      if (formData.bio.trim().length < 100) {
        nextFieldErrors.bio = 'Write at least 100 characters about yourself.'
      }
      if (formData.teachingApproach.trim().length < 50) {
        nextFieldErrors.teachingApproach = 'Describe your teaching approach in at least 50 characters.'
      }
    }

    if (step === 5) {
      // Longer responses reveal a tutor's teaching philosophy; one-sentence
      // answers do not give reviewers enough evidence to assess it fairly.
      formData.scenarioAnswers.forEach((scenario, index) => {
        if (scenario.answer.trim().length < 50) {
          nextFieldErrors[`scenarioAnswer-${index}`] = 'Write at least 50 characters for this answer.'
        }
      })
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('')
      return false
    }

    setFieldErrors({})
    setError('')
    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((step) => Math.min(step + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setError('')
    setCurrentStep((step) => Math.max(step - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    if (!token) {
      setError('Please log in again before submitting your application.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const applicationData = {
        ...formData,
        profilePhoto: formData.profilePhoto || user?.profilePhoto || '',
        sessionDuration: Number(formData.sessionDuration),
        sessionPrice: Number(formData.sessionPrice),
        minimumSessionsPerWeek: Number(formData.minimumSessionsPerWeek),
        advanceBookingHours: Number(formData.advanceBookingHours),
        yearsOfExperience: Number(formData.yearsOfExperience),
      }

      await axios.post(
        'http://localhost:5000/api/live-tutors/apply',
        applicationData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Keep the current session's account state in sync with the successful
      // backend update, even before AuthContext next verifies /api/auth/me.
      updateUser({
        liveTutorStatus: 'pending',
        profilePhoto: formData.profilePhoto || user?.profilePhoto,
      })
      navigate('/application-submitted?type=live-tutor')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit your live tutor application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()
    if (currentStep === 5) {
      handleSubmit()
    } else {
      handleNext()
    }
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'
  const selectedClass = (selected) => `rounded-xl border p-5 text-left text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${selected ? 'border-[#22C55E] bg-[#F0FDF4] text-slate-900 ring-1 ring-[#22C55E]/30' : 'border-slate-200 bg-white text-slate-700 hover:border-[#22C55E]/50 hover:bg-slate-50'}`
  const errorInputClass = (field) => fieldErrors[field] ? 'border-red-400 ring-1 ring-red-200 focus:border-red-500 focus:ring-red-100' : ''
  const renderFieldError = (field) => fieldErrors[field]
    ? <p role="alert" className="mt-2 text-sm font-medium text-red-700"><i className="fas fa-circle-exclamation mr-1.5 text-xs" aria-hidden="true" />{fieldErrors[field]}</p>
    : null

  const selectedDays = new Map(formData.weeklyAvailability.map((slot) => [slot.day, slot]))
  const currentStepDetails = stepDetails[currentStep - 1]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mx-auto flex w-fit items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]" aria-label="Go to Barakah Academy home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white shadow-md shadow-[#22C55E]/30">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Barakah Academy</span>
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:mt-8 sm:p-10">
          <header>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-[#15803D]">Live tutor application</p>
              <p className="text-base font-medium text-slate-500">Step {currentStep} of 5</p>
            </div>

            <div className="mt-5 flex items-start">
              {stepDetails.map((step, index) => {
                const stepNumber = index + 1
                const completed = stepNumber < currentStep
                const active = stepNumber === currentStep

                return (
                  <Fragment key={step.label}>
                    <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition sm:h-11 sm:w-11 ${completed || active ? 'bg-[#22C55E] text-white shadow-sm shadow-[#22C55E]/30' : 'bg-slate-100 text-slate-400'}`}>
                        {completed ? <i className="fas fa-check" aria-label={`${step.label} completed`} /> : stepNumber}
                      </span>
                      <span className={`mt-2 hidden text-xs font-semibold sm:block ${active ? 'text-[#15803D]' : 'text-slate-400'}`}>{step.label}</span>
                    </div>
                    {index < stepDetails.length - 1 && (
                      <span className={`mt-4 h-0.5 flex-1 ${stepNumber < currentStep ? 'bg-[#22C55E]' : 'bg-slate-200'}`} />
                    )}
                  </Fragment>
                )
              })}
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`Application progress: step ${currentStep} of 5`}>
              <div className="h-full rounded-full bg-[#22C55E] transition-all duration-300" style={{ width: `${(currentStep / 5) * 100}%` }} />
            </div>
          </header>

          {error && (
            <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-base leading-7 text-red-700">
              <i className="fas fa-circle-exclamation mt-0.5" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="mt-8">
            <div className="mb-7 flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#15803D]">
                <i className={currentStepDetails.icon} aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-semibold text-[#15803D]">{currentStepDetails.label}</p>
                {currentStep === 1 && <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">What will you teach?</h1>}
                {currentStep === 2 && <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">How will you teach?</h1>}
                {currentStep === 3 && <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">When are you available?</h1>}
                {currentStep === 4 && <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Tell us about yourself</h1>}
                {currentStep === 5 && <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">How do you handle real situations?</h1>}
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="text-lg font-bold text-slate-900">Choose your main teaching category</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {Object.entries(teachingCategories).map(([categoryId, category]) => {
                      const selected = formData.mainCategory === categoryId
                      return (
                        <button key={categoryId} type="button" aria-pressed={selected} onClick={() => selectCategory(categoryId)} className={selectedClass(selected)}>
                          <span className={`mr-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${selected ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">
                            <i className={categoryIcons[categoryId]} />
                          </span>
                          <span className="font-semibold">{category.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  {renderFieldError('mainCategory')}
                </fieldset>

                <section>
                  <label htmlFor="live-tutor-subject" className="block text-lg font-bold text-slate-900">Subjects you teach</label>
                  <p className="mt-1 text-base leading-7 text-slate-500">Add every subject you are prepared to teach in live sessions.</p>
                  {/* A tag input supports niche subjects that a fixed dropdown would
                      exclude, while suggestions make common choices quick to add. */}
                  <div className="mt-3 flex gap-2">
                    <input id="live-tutor-subject" value={subjectInput} onChange={(event) => setSubjectInput(event.target.value)} onKeyDown={handleSubjectKeyDown} className={`${inputClass} ${errorInputClass('subjects')}`} placeholder="For example, Full Stack Web Development" />
                    <button type="button" onClick={addSubject} className="shrink-0 rounded-xl bg-blue-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Add</button>
                  </div>
                  {renderFieldError('subjects')}

                  {formData.subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.subjects.map((subject) => (
                        <button key={subject} type="button" onClick={() => toggleArrayItem('subjects', subject)} className="inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-2 text-base font-semibold text-[#15803D] ring-1 ring-[#22C55E]/20 transition hover:bg-[#DCFCE7]" aria-label={`Remove ${subject}`}>
                          {subject}<i className="fas fa-xmark text-xs" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}

                  {formData.mainCategory && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">Suggested subjects</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {teachingCategories[formData.mainCategory].subjects.map((subject) => {
                          const selected = formData.subjects.includes(subject)
                          return (
                            <button key={subject} type="button" onClick={() => toggleArrayItem('subjects', subject)} className={`rounded-full border px-4 py-2 text-base font-medium transition ${selected ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50 hover:text-[#15803D]'}`}>
                              {selected && <i className="fas fa-check mr-1.5 text-xs" aria-hidden="true" />}{subject}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </section>

                <fieldset>
                  <legend className="text-lg font-bold text-slate-900">Teaching level</legend>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {teachingLevels.map((level) => (
                      <button key={level.value} type="button" aria-pressed={formData.teachingLevel === level.value} onClick={() => handleChange('teachingLevel', level.value)} className={`${selectedClass(formData.teachingLevel === level.value)} text-center font-semibold`}>
                        {level.label}
                      </button>
                    ))}
                  </div>
                  {renderFieldError('teachingLevel')}
                </fieldset>

                <fieldset>
                  <legend className="text-lg font-bold text-slate-900">Languages you can teach in</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {teachingLanguages.map((language) => {
                      const selected = formData.teachingLanguages.includes(language)
                      return (
                        <button key={language} type="button" aria-pressed={selected} onClick={() => toggleArrayItem('teachingLanguages', language)} className={`rounded-xl border px-4 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${selected ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50'}`}>
                          {selected && <i className="fas fa-check mr-2 text-xs" aria-hidden="true" />}{language}
                        </button>
                      )
                    })}
                  </div>
                  {renderFieldError('teachingLanguages')}
                </fieldset>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-slate-900">Your paid session offer</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">Students see exactly one session duration and one price. They will not need to calculate an hourly rate.</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    <label className="space-y-2 text-base font-semibold text-slate-700">Currency
                      <select value={formData.currency} onChange={(event) => handleChange('currency', event.target.value)} className={inputClass}>
                        {getSupportedCurrencies().map((currency) => <option key={currency.code} value={currency.code}>{currency.symbol} {currency.code} — {currency.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2 text-base font-semibold text-slate-700">Paid session price
                      <input type="number" min="0.01" step="0.01" value={formData.sessionPrice} onChange={(event) => handleChange('sessionPrice', event.target.value)} className={`${inputClass} ${errorInputClass('sessionPrice')}`} placeholder="25" />
                      {renderFieldError('sessionPrice')}
                    </label>
                  </div>
                  <label className="mt-5 block max-w-sm space-y-2 text-base font-semibold text-slate-700">Paid session length in minutes
                    <input type="number" min="1" step="1" value={formData.sessionDuration} onChange={(event) => handleChange('sessionDuration', event.target.value)} className={`${inputClass} ${errorInputClass('sessionDuration')}`} placeholder="For example, 60" />
                    {renderFieldError('sessionDuration')}
                  </label>
                </section>
                   
                <section className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
                  <div className="flex gap-3">
                    <i className="fas fa-gift mt-1 text-green-700" aria-hidden="true" />
                    <div>
                      <h2 className="text-lg font-bold text-green-900">Free introductory sessions are included</h2>
                      <p className="mt-1 text-base leading-7 text-green-800">Every new student can book one free 30-minute introductory session with you. This gives both of you a chance to meet before the student chooses paid sessions.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <label className="block space-y-2 text-lg font-bold text-slate-900">Your timezone
                  <select value={formData.timezone} onChange={(event) => handleChange('timezone', event.target.value)} className={`${inputClass} ${errorInputClass('timezone')}`}>
                    <option value="">Select your timezone</option>
                    {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone.replace('_', ' ')}</option>)}
                  </select>
                  <span className="block text-base font-normal leading-7 text-slate-500">Your availability is saved in this timezone to prevent confusing booking times for students.</span>
                  {renderFieldError('timezone')}
                </label>

                <section>
                  <h2 className="text-lg font-bold text-slate-900">Weekly availability</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">Select each day you are available, then choose your usual teaching hours.</p>
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {weekDays.map((day) => {
                      const selected = selectedDays.has(day.value)
                      return <button key={day.value} type="button" aria-pressed={selected} onClick={() => toggleDay(day.value)} className={`rounded-xl border px-2 py-3.5 text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${selected ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50'}`}>{day.short}</button>
                    })}
                  </div>
                  {renderFieldError('weeklyAvailability')}

                  {formData.weeklyAvailability.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {weekDays.filter((day) => selectedDays.has(day.value)).map((day) => {
                        const slot = selectedDays.get(day.value)
                        return (
                          <div key={day.value} className="grid items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[90px_1fr_1fr]">
                            <span className="text-base font-bold text-slate-800">{day.value}</span>
                            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">From
                              <input type="time" value={slot.startTime} onChange={(event) => updateDayTime(day.value, 'startTime', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-[#22C55E]" />
                            </label>
                            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">To
                              <input type="time" value={slot.endTime} onChange={(event) => updateDayTime(day.value, 'endTime', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-[#22C55E]" />
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-base font-bold text-slate-900">Your weekly teaching goal
                    <input type="number" min="1" max="20" value={formData.minimumSessionsPerWeek} onChange={(event) => handleChange('minimumSessionsPerWeek', event.target.value)} className={inputClass} />
                    <span className="block text-base font-normal leading-7 text-slate-500">This does not add more hours to your schedule. It is the smallest number of sessions you would like to teach in a usual week.</span>
                  </label>
                  <label className="space-y-2 text-base font-bold text-slate-900">How early can students book?
                    <select value={formData.advanceBookingHours} onChange={(event) => handleChange('advanceBookingHours', event.target.value)} className={inputClass}>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="168">1 week</option>
                    </select>
                    <span className="block text-base font-normal leading-7 text-slate-500">For example, 24 hours means a student must book at least one day before the session starts. This gives you time to prepare.</span>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-7">
                <section className={`rounded-2xl border p-5 sm:p-6 ${fieldErrors.profilePhoto ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-center gap-5">
                    <Avatar name={user?.name || 'Live Tutor'} imageUrl={formData.profilePhoto || user?.profilePhoto} size="xl" />
                    <label className="min-w-0 flex-1 space-y-2 text-base font-bold text-slate-900">
                      <span className="block">Profile photo {!user?.profilePhoto && <span className="text-red-600">*</span>}</span>
                      <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="block w-full text-base font-normal text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700" />
                      <span className="block text-base font-normal leading-7 text-slate-500">
                        {user?.profilePhoto
                          ? 'We found your existing Barakah Academy profile photo. You can keep it or choose a newer one for all of your teaching activity.'
                          : 'Students use this photo to recognize you in tutor search results. Choose a clear photo of yourself. Images are resized automatically; maximum original size is 10 MB.'}
                      </span>
                    </label>
                  </div>
                  {(formData.profilePhoto || user?.profilePhoto) && <p className="mt-4 text-base font-semibold text-[#15803D]"><i className="fas fa-circle-check mr-2" aria-hidden="true" />Profile photo ready to submit.</p>}
                  {renderFieldError('profilePhoto')}
                </section>

                <label className="block max-w-sm space-y-2 text-base font-bold text-slate-900">Years of teaching experience
                  <input type="number" min="0" value={formData.yearsOfExperience} onChange={(event) => handleChange('yearsOfExperience', event.target.value)} className={`${inputClass} ${errorInputClass('yearsOfExperience')}`} placeholder="For example, 3" />
                  {renderFieldError('yearsOfExperience')}
                </label>

                <label className="block space-y-2 text-base font-bold text-slate-900">Professional bio
                  <textarea value={formData.bio} onChange={(event) => handleChange('bio', event.target.value)} className={`${inputClass} min-h-40 resize-y ${formData.bio.trim().length >= 100 ? 'border-[#22C55E] ring-1 ring-[#22C55E]/20' : ''} ${errorInputClass('bio')}`} placeholder="Tell students about yourself, your background, and why you love teaching" />
                  <span className={`block text-right text-sm font-medium ${formData.bio.trim().length >= 100 ? 'text-[#15803D]' : 'text-slate-500'}`}>{formData.bio.length} / 100 minimum characters</span>
                  {renderFieldError('bio')}
                </label>

                <label className="block space-y-2 text-base font-bold text-slate-900">Your teaching approach
                  <textarea value={formData.teachingApproach} onChange={(event) => handleChange('teachingApproach', event.target.value)} className={`${inputClass} min-h-36 resize-y ${formData.teachingApproach.trim().length >= 50 ? 'border-[#22C55E] ring-1 ring-[#22C55E]/20' : ''} ${errorInputClass('teachingApproach')}`} placeholder="Describe how you structure your live sessions and what students can expect" />
                  <span className={`block text-right text-sm font-medium ${formData.teachingApproach.trim().length >= 50 ? 'text-[#15803D]' : 'text-slate-500'}`}>{formData.teachingApproach.length} / 50 minimum characters</span>
                  {renderFieldError('teachingApproach')}
                </label>

                <label className="block space-y-2 text-base font-bold text-slate-900">Introduction Video <span className="font-normal text-slate-500">(Optional but recommended)</span>
                  <input type="url" value={formData.introVideoUrl} onChange={(event) => handleChange('introVideoUrl', event.target.value)} className={inputClass} placeholder="Paste your YouTube or Google Drive video link" />
                  <span className="block text-base font-normal leading-7 text-slate-500">A 1–2 minute video introduction can dramatically increase your bookings.</span>
                </label>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <p className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-base leading-7 text-blue-950">Answer these three scenarios honestly. There are no wrong answers — we want to understand your teaching philosophy.</p>
                {formData.scenarioAnswers.map((scenario, index) => {
                  const answerLength = scenario.answer.trim().length
                  const answerIsComplete = answerLength >= 50
                  return (
                    <section key={scenario.scenario} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-sm font-extrabold text-[#15803D]">{index + 1}</span>
                        <p className="rounded-xl bg-slate-50 p-4 text-base font-semibold leading-7 text-slate-800">{scenario.scenario}</p>
                      </div>
                      <label className="mt-4 block text-base font-bold text-slate-900">Your answer
                        <textarea value={scenario.answer} onChange={(event) => updateScenarioAnswer(index, event.target.value)} className={`${inputClass} mt-2 min-h-32 resize-y ${answerIsComplete ? 'border-[#22C55E] ring-1 ring-[#22C55E]/20' : ''} ${errorInputClass(`scenarioAnswer-${index}`)}`} placeholder="Write a thoughtful answer in your own words..." />
                        <span className={`mt-2 block text-right text-sm font-medium ${answerIsComplete ? 'text-[#15803D]' : 'text-slate-500'}`}>{scenario.answer.length} / 50 minimum characters</span>
                        {renderFieldError(`scenarioAnswer-${index}`)}
                      </label>
                    </section>
                  )
                })}
              </div>
            )}

            <footer className="mt-9 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <button type="button" onClick={handleBack} disabled={currentStep === 1 || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-base font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40">
                <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> Back
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 text-base font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#15803D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
                {currentStep === 5 ? (
                  loading ? <><i className="fas fa-spinner animate-spin" aria-hidden="true" /> Submitting...</> : <><i className="fas fa-paper-plane" aria-hidden="true" /> Submit Application</>
                ) : (
                  <>Next <i className="fas fa-arrow-right text-xs" aria-hidden="true" /></>
                )}
              </button>
            </footer>
          </form>
        </section>
      </div>
    </main>
  )
}

export default LiveTutorApplication
