import API_BASE_URL from '../../config/api.js'
import { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { getSupportedCurrencies } from '../../utils/currencyUtils'
import teachingCategories from '../../utils/teachingCategories'
import Avatar from '../../components/common/Avatar'
import { resizeImageFile } from '../../utils/imageUtils'
import { getSubjectLabel } from '../../utils/courseUtils'
import { POLICY_VERSIONS } from '../../config/policyVersions'
import { ageOnDate } from '../../utils/legalAge'

const stepDetails = [
  { key: 'teaching', icon: 'fas fa-book-open' },
  { key: 'sessions', icon: 'fas fa-video' },
  { key: 'availability', icon: 'fas fa-calendar-days' },
  { key: 'profile', icon: 'fas fa-user-check' },
  { key: 'assessment', icon: 'fas fa-clipboard-check' },
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
  { value: 'beginner', key: 'beginner' },
  { value: 'intermediate', key: 'intermediate' },
  { value: 'advanced', key: 'advanced' },
  { value: 'all', key: 'all' },
]

const teachingLanguages = ['Amharic', 'English', 'Afaan Oromo']

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
  { short: 'mon', value: 'Monday' },
  { short: 'tue', value: 'Tuesday' },
  { short: 'wed', value: 'Wednesday' },
  { short: 'thu', value: 'Thursday' },
  { short: 'fri', value: 'Friday' },
  { short: 'sat', value: 'Saturday' },
  { short: 'sun', value: 'Sunday' },
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
  dateOfBirth: '',
  profilePhoto: '',
  bio: '',
  teachingApproach: '',
  introVideoUrl: '',
  scenarioAnswers: scenarioQuestions.map((scenario) => ({ scenario, answer: '' })),
  acceptedTerms: false,
  acknowledgedPrivacy: false,
  agreedToTeacherAgreement: false,
})

const LiveTutorApplication = () => {
  const { t } = useTranslation()
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
    if (!user?.dateOfBirth && !user?.profilePhoto) return
    setFormData((currentData) => ({
      ...currentData,
      profilePhoto: currentData.profilePhoto || user?.profilePhoto || '',
      dateOfBirth: currentData.dateOfBirth || (user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : ''),
    }))
  }, [user?.dateOfBirth, user?.profilePhoto])

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
      const age = ageOnDate(formData.dateOfBirth)
      if (age === null || age < 18 || age > 120) {
        nextFieldErrors.dateOfBirth = t('auth.liveTutorApplication.validation.age')
      }
      if (!formData.mainCategory) nextFieldErrors.mainCategory = t('auth.liveTutorApplication.validation.category')
      if (!formData.subjects.length) nextFieldErrors.subjects = t('auth.liveTutorApplication.validation.subjects')
      if (!formData.teachingLevel) nextFieldErrors.teachingLevel = t('auth.liveTutorApplication.validation.level')
      if (!formData.teachingLanguages.length) nextFieldErrors.teachingLanguages = t('auth.liveTutorApplication.validation.languages')
    }

    if (step === 2) {
      if (!Number.isInteger(Number(formData.sessionDuration)) || Number(formData.sessionDuration) < 1) nextFieldErrors.sessionDuration = t('auth.liveTutorApplication.validation.duration')
      if (Number(formData.sessionPrice) <= 0) nextFieldErrors.sessionPrice = t('auth.liveTutorApplication.validation.price')
    }

    if (step === 3) {
      // Timezone is required because the same clock time can mean a different
      // moment for a student and tutor in different parts of the world.
      if (!formData.timezone) nextFieldErrors.timezone = t('auth.liveTutorApplication.validation.timezone')
      if (!formData.weeklyAvailability.length) nextFieldErrors.weeklyAvailability = t('auth.liveTutorApplication.validation.availability')
    }

    if (step === 4) {
      if (!formData.profilePhoto && !user?.profilePhoto) {
        nextFieldErrors.profilePhoto = t('auth.liveTutorApplication.validation.photo')
      }
      if (formData.yearsOfExperience === '' || Number(formData.yearsOfExperience) < 0) {
        nextFieldErrors.yearsOfExperience = t('auth.liveTutorApplication.validation.experience')
      }
      if (formData.bio.trim().length < 100) {
        nextFieldErrors.bio = t('auth.liveTutorApplication.validation.bio')
      }
      if (formData.teachingApproach.trim().length < 50) {
        nextFieldErrors.teachingApproach = t('auth.liveTutorApplication.validation.approach')
      }
    }

    if (step === 5) {
      // Longer responses reveal a tutor's teaching philosophy; one-sentence
      // answers do not give reviewers enough evidence to assess it fairly.
      formData.scenarioAnswers.forEach((scenario, index) => {
        if (scenario.answer.trim().length < 50) {
          nextFieldErrors[`scenarioAnswer-${index}`] = t('auth.liveTutorApplication.validation.answer')
        }
      })
      if (!formData.acceptedTerms) nextFieldErrors.acceptedTerms = t('auth.liveTutorApplication.validation.terms')
      if (!formData.acknowledgedPrivacy) nextFieldErrors.acknowledgedPrivacy = t('auth.liveTutorApplication.validation.privacy')
      if (!formData.agreedToTeacherAgreement) nextFieldErrors.agreedToTeacherAgreement = t('auth.liveTutorApplication.validation.guidelines')
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
      setError(t('auth.liveTutorApplication.loginAgain'))
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
        dateOfBirth: formData.dateOfBirth,
        acceptedTermsVersion: POLICY_VERSIONS.terms,
        acknowledgedPrivacyVersion: POLICY_VERSIONS.privacy,
        acceptedCommunityCodeVersion: POLICY_VERSIONS.community,
        teacherAgreementVersion: POLICY_VERSIONS.teacher,
      }

      await axios.post(
        `${API_BASE_URL}/live-tutors/apply`,
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
      setError(requestError.response?.data?.message || t('auth.liveTutorApplication.submitError'))
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
  const stepLabel = (key) => t(`auth.liveTutorApplication.steps.${key}`)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mx-auto flex w-fit items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E]" aria-label={t('auth.liveTutorApplication.home')}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white shadow-md shadow-[#22C55E]/30">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Barakah Academy</span>
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:mt-8 sm:p-10">
          <header>
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-[#15803D]">{t('auth.liveTutorApplication.title')}</p>
              <p className="text-base font-medium text-slate-500">{t('auth.liveTutorApplication.stepOf', { currentStep })}</p>
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
                        {completed ? <i className="fas fa-check" aria-label={t('auth.liveTutorApplication.stepCompleted', { step: stepLabel(step.key) })} /> : stepNumber}
                      </span>
                      <span className={`mt-2 hidden text-xs font-semibold sm:block ${active ? 'text-[#15803D]' : 'text-slate-400'}`}>{stepLabel(step.key)}</span>
                    </div>
                    {index < stepDetails.length - 1 && (
                      <span className={`mt-4 h-0.5 flex-1 ${stepNumber < currentStep ? 'bg-[#22C55E]' : 'bg-slate-200'}`} />
                    )}
                  </Fragment>
                )
              })}
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={t('auth.liveTutorApplication.progress', { currentStep })}>
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
                <p className="text-base font-semibold text-[#15803D]">{stepLabel(currentStepDetails.key)}</p>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t(`auth.liveTutorApplication.headings.${currentStep}`)}</h1>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-8">
                <label className="block max-w-sm text-base font-bold text-slate-900">
                  {t('auth.liveTutorApplication.dateOfBirth')}
                  <input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={formData.dateOfBirth}
                    onChange={(event) => handleChange('dateOfBirth', event.target.value)}
                    className={`${inputClass} mt-2 ${errorInputClass('dateOfBirth')}`}
                    required
                  />
                  {renderFieldError('dateOfBirth')}
                </label>
                <fieldset>
                  <legend className="text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.category')}</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {Object.entries(teachingCategories).map(([categoryId, category]) => {
                      const selected = formData.mainCategory === categoryId
                      return (
                        <button key={categoryId} type="button" aria-pressed={selected} onClick={() => selectCategory(categoryId)} className={selectedClass(selected)}>
                          <span className={`mr-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${selected ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">
                            <i className={categoryIcons[categoryId]} />
                          </span>
                          <span className="font-semibold">{t(`categories.${categoryId}`, { defaultValue: category.label })}</span>
                        </button>
                      )
                    })}
                  </div>
                  {renderFieldError('mainCategory')}
                </fieldset>

                <section>
                  <label htmlFor="live-tutor-subject" className="block text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.subjects')}</label>
                  <p className="mt-1 text-base leading-7 text-slate-500">{t('auth.liveTutorApplication.subjectsHelp')}</p>
                  {/* A tag input supports niche subjects that a fixed dropdown would
                      exclude, while suggestions make common choices quick to add. */}
                  <div className="mt-3 flex gap-2">
                    <input id="live-tutor-subject" value={subjectInput} onChange={(event) => setSubjectInput(event.target.value)} onKeyDown={handleSubjectKeyDown} className={`${inputClass} ${errorInputClass('subjects')}`} placeholder={t('auth.liveTutorApplication.subjectPlaceholder')} />
                    <button type="button" onClick={addSubject} className="shrink-0 rounded-xl bg-blue-600 px-5 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{t('auth.teacher.addSubject')}</button>
                  </div>
                  {renderFieldError('subjects')}

                  {formData.subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.subjects.map((subject) => (
                        <button key={subject} type="button" onClick={() => toggleArrayItem('subjects', subject)} className="inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-2 text-base font-semibold text-[#15803D] ring-1 ring-[#22C55E]/20 transition hover:bg-[#DCFCE7]" aria-label={t('auth.liveTutorApplication.removeSubject', { subject })}>
                          {subject}<i className="fas fa-xmark text-xs" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}

                  {formData.mainCategory && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">{t('auth.liveTutorApplication.suggestedSubjects')}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {teachingCategories[formData.mainCategory].subjects.map((subject) => {
                          const selected = formData.subjects.includes(subject)
                          return (
                            <button key={subject} type="button" onClick={() => toggleArrayItem('subjects', subject)} className={`rounded-full border px-4 py-2 text-base font-medium transition ${selected ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50 hover:text-[#15803D]'}`}>
                              {selected && <i className="fas fa-check mr-1.5 text-xs" aria-hidden="true" />}{getSubjectLabel(subject, t)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </section>

                <fieldset>
                  <legend className="text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.level')}</legend>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {teachingLevels.map((level) => (
                      <button key={level.value} type="button" aria-pressed={formData.teachingLevel === level.value} onClick={() => handleChange('teachingLevel', level.value)} className={`${selectedClass(formData.teachingLevel === level.value)} text-center font-semibold`}>
                        {t(`auth.liveTutorApplication.levels.${level.key}`)}
                      </button>
                    ))}
                  </div>
                  {renderFieldError('teachingLevel')}
                </fieldset>

                <fieldset>
                  <legend className="text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.languages')}</legend>
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
                  <h2 className="text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.paidOffer')}</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">{t('auth.liveTutorApplication.paidOfferHelp')}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                    <label className="space-y-2 text-base font-semibold text-slate-700">{t('auth.liveTutorApplication.currency')}
                      <select value={formData.currency} onChange={(event) => handleChange('currency', event.target.value)} className={inputClass}>
                        {getSupportedCurrencies().map((currency) => <option key={currency.code} value={currency.code}>{currency.symbol} {currency.code} — {currency.name}</option>)}
                      </select>
                    </label>
                    <label className="space-y-2 text-base font-semibold text-slate-700">{t('auth.liveTutorApplication.sessionPrice')}
                      <input type="number" min="0.01" step="0.01" value={formData.sessionPrice} onChange={(event) => handleChange('sessionPrice', event.target.value)} className={`${inputClass} ${errorInputClass('sessionPrice')}`} placeholder="25" />
                      {renderFieldError('sessionPrice')}
                    </label>
                  </div>
                  <label className="mt-5 block max-w-sm space-y-2 text-base font-semibold text-slate-700">{t('auth.liveTutorApplication.sessionDuration')}
                    <input type="number" min="1" step="1" value={formData.sessionDuration} onChange={(event) => handleChange('sessionDuration', event.target.value)} className={`${inputClass} ${errorInputClass('sessionDuration')}`} placeholder={t('auth.liveTutorApplication.durationPlaceholder')} />
                    {renderFieldError('sessionDuration')}
                  </label>
                </section>
                   
                <section className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
                  <div className="flex gap-3">
                    <i className="fas fa-gift mt-1 text-green-700" aria-hidden="true" />
                    <div>
                      <h2 className="text-lg font-bold text-green-900">{t('auth.liveTutorApplication.freeIntroTitle')}</h2>
                      <p className="mt-1 text-base leading-7 text-green-800">{t('auth.liveTutorApplication.freeIntroDescription')}</p>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <label className="block space-y-2 text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.timezone')}
                  <select value={formData.timezone} onChange={(event) => handleChange('timezone', event.target.value)} className={`${inputClass} ${errorInputClass('timezone')}`}>
                    <option value="">{t('auth.liveTutorApplication.selectTimezone')}</option>
                    {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone.replace('_', ' ')}</option>)}
                  </select>
                  <span className="block text-base font-normal leading-7 text-slate-500">{t('auth.liveTutorApplication.timezoneHelp')}</span>
                  {renderFieldError('timezone')}
                </label>

                <section>
                  <h2 className="text-lg font-bold text-slate-900">{t('auth.liveTutorApplication.weeklyAvailability')}</h2>
                  <p className="mt-1 text-base leading-7 text-slate-500">{t('auth.liveTutorApplication.weeklyAvailabilityHelp')}</p>
                  <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {weekDays.map((day) => {
                      const selected = selectedDays.has(day.value)
                      return <button key={day.value} type="button" aria-pressed={selected} onClick={() => toggleDay(day.value)} className={`rounded-xl border px-2 py-3.5 text-base font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${selected ? 'border-[#22C55E] bg-[#F0FDF4] text-[#15803D]' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50'}`}>{t(`common.shortDays.${day.short}`)}</button>
                    })}
                  </div>
                  {renderFieldError('weeklyAvailability')}

                  {formData.weeklyAvailability.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {weekDays.filter((day) => selectedDays.has(day.value)).map((day) => {
                        const slot = selectedDays.get(day.value)
                        return (
                          <div key={day.value} className="grid items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[90px_1fr_1fr]">
                            <span className="text-base font-bold text-slate-800">{t(`common.days.${day.value.toLowerCase()}`)}</span>
                            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('auth.liveTutorApplication.from')}
                              <input type="time" value={slot.startTime} onChange={(event) => updateDayTime(day.value, 'startTime', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-[#22C55E]" />
                            </label>
                            <label className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t('auth.liveTutorApplication.to')}
                              <input type="time" value={slot.endTime} onChange={(event) => updateDayTime(day.value, 'endTime', event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 outline-none focus:border-[#22C55E]" />
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-base font-bold text-slate-900">{t('auth.liveTutorApplication.weeklyGoal')}
                    <input type="number" min="1" max="20" value={formData.minimumSessionsPerWeek} onChange={(event) => handleChange('minimumSessionsPerWeek', event.target.value)} className={inputClass} />
                    <span className="block text-base font-normal leading-7 text-slate-500">{t('auth.liveTutorApplication.weeklyGoalHelp')}</span>
                  </label>
                  <label className="space-y-2 text-base font-bold text-slate-900">{t('auth.liveTutorApplication.advanceBooking')}
                    <select value={formData.advanceBookingHours} onChange={(event) => handleChange('advanceBookingHours', event.target.value)} className={inputClass}>
                      <option value="12">{t('auth.liveTutorApplication.hours', { count: 12 })}</option>
                      <option value="24">{t('auth.liveTutorApplication.hours', { count: 24 })}</option>
                      <option value="48">{t('auth.liveTutorApplication.hours', { count: 48 })}</option>
                      <option value="168">{t('auth.liveTutorApplication.week')}</option>
                    </select>
                    <span className="block text-base font-normal leading-7 text-slate-500">{t('auth.liveTutorApplication.advanceBookingHelp')}</span>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-7">
                <section className={`rounded-2xl border p-5 sm:p-6 ${fieldErrors.profilePhoto ? 'border-red-300 bg-red-50/40' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex flex-wrap items-center gap-5">
                    <Avatar name={user?.name || t('auth.liveTutorApplication.tutorFallback')} imageUrl={formData.profilePhoto || user?.profilePhoto} size="xl" />
                    <label className="min-w-0 flex-1 space-y-2 text-base font-bold text-slate-900">
                      <span className="block">{t('auth.liveTutorApplication.profilePhoto')} {!user?.profilePhoto && <span className="text-red-600">*</span>}</span>
                      <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="block w-full text-base font-normal text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-semibold file:text-white hover:file:bg-blue-700" />
                      <span className="block text-base font-normal leading-7 text-slate-500">
                        {user?.profilePhoto
                          ? t('auth.liveTutorApplication.existingPhoto')
                          : t('auth.liveTutorApplication.photoHelp')}
                      </span>
                    </label>
                  </div>
                  {(formData.profilePhoto || user?.profilePhoto) && <p className="mt-4 text-base font-semibold text-[#15803D]"><i className="fas fa-circle-check mr-2" aria-hidden="true" />{t('auth.liveTutorApplication.photoReady')}</p>}
                  {renderFieldError('profilePhoto')}
                </section>

                <label className="block max-w-sm space-y-2 text-base font-bold text-slate-900">{t('auth.liveTutorApplication.experience')}
                  <input type="number" min="0" value={formData.yearsOfExperience} onChange={(event) => handleChange('yearsOfExperience', event.target.value)} className={`${inputClass} ${errorInputClass('yearsOfExperience')}`} placeholder={t('auth.liveTutorApplication.experiencePlaceholder')} />
                  {renderFieldError('yearsOfExperience')}
                </label>

                <label className="block space-y-2 text-base font-bold text-slate-900">{t('auth.liveTutorApplication.bio')}
                  <textarea value={formData.bio} onChange={(event) => handleChange('bio', event.target.value)} className={`${inputClass} min-h-40 resize-y ${formData.bio.trim().length >= 100 ? 'border-[#22C55E] ring-1 ring-[#22C55E]/20' : ''} ${errorInputClass('bio')}`} placeholder={t('auth.liveTutorApplication.bioPlaceholder')} />
                  <span className={`block text-right text-sm font-medium ${formData.bio.trim().length >= 100 ? 'text-[#15803D]' : 'text-slate-500'}`}>{t('auth.liveTutorApplication.characterCount', { count: formData.bio.length, minimum: 100 })}</span>
                  {renderFieldError('bio')}
                </label>

                <label className="block space-y-2 text-base font-bold text-slate-900">{t('auth.liveTutorApplication.approach')}
                  <textarea value={formData.teachingApproach} onChange={(event) => handleChange('teachingApproach', event.target.value)} className={`${inputClass} min-h-36 resize-y ${formData.teachingApproach.trim().length >= 50 ? 'border-[#22C55E] ring-1 ring-[#22C55E]/20' : ''} ${errorInputClass('teachingApproach')}`} placeholder={t('auth.liveTutorApplication.approachPlaceholder')} />
                  <span className={`block text-right text-sm font-medium ${formData.teachingApproach.trim().length >= 50 ? 'text-[#15803D]' : 'text-slate-500'}`}>{t('auth.liveTutorApplication.characterCount', { count: formData.teachingApproach.length, minimum: 50 })}</span>
                  {renderFieldError('teachingApproach')}
                </label>

                <label className="block space-y-2 text-base font-bold text-slate-900">{t('auth.liveTutorApplication.introVideo')} <span className="font-normal text-slate-500">({t('auth.liveTutorApplication.optionalRecommended')})</span>
                  <input type="url" value={formData.introVideoUrl} onChange={(event) => handleChange('introVideoUrl', event.target.value)} className={inputClass} placeholder={t('auth.liveTutorApplication.videoPlaceholder')} />
                  <span className="block text-base font-normal leading-7 text-slate-500">{t('auth.liveTutorApplication.videoHelp')}</span>
                </label>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <p className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-base leading-7 text-blue-950">{t('auth.liveTutorApplication.scenarioHelp')}</p>
                {formData.scenarioAnswers.map((scenario, index) => {
                  const answerLength = scenario.answer.trim().length
                  const answerIsComplete = answerLength >= 50
                  return (
                    <section key={scenario.scenario} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-sm font-extrabold text-[#15803D]">{index + 1}</span>
                        <p className="rounded-xl bg-slate-50 p-4 text-base font-semibold leading-7 text-slate-800">{t(`auth.liveTutorApplication.scenarios.${index}`)}</p>
                      </div>
                      <label className="mt-4 block text-base font-bold text-slate-900">{t('auth.liveTutorApplication.yourAnswer')}
                        <textarea value={scenario.answer} onChange={(event) => updateScenarioAnswer(index, event.target.value)} className={`${inputClass} mt-2 min-h-32 resize-y ${answerIsComplete ? 'border-[#22C55E] ring-1 ring-[#22C55E]/20' : ''} ${errorInputClass(`scenarioAnswer-${index}`)}`} placeholder={t('auth.liveTutorApplication.answerPlaceholder')} />
                        <span className={`mt-2 block text-right text-sm font-medium ${answerIsComplete ? 'text-[#15803D]' : 'text-slate-500'}`}>{t('auth.liveTutorApplication.characterCount', { count: scenario.answer.length, minimum: 50 })}</span>
                        {renderFieldError(`scenarioAnswer-${index}`)}
                      </label>
                    </section>
                  )
                })}
                <section className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-sm leading-6 text-amber-950">{t('auth.liveTutorApplication.policyDraft')}</p>
                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-800">
                    <input type="checkbox" checked={formData.acceptedTerms} onChange={(event) => handleChange('acceptedTerms', event.target.checked)} className="mt-1 accent-green-700" />
                    <span>{t('legal.agreeTo')}{' '}<Link className="font-bold underline" to="/policies/terms">{t('footer.terms')}</Link>{' '}{t('legal.and')}{' '}<Link className="font-bold underline" to="/policies/community-code">{t('footer.communityCode')}</Link>.{renderFieldError('acceptedTerms')}</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-800">
                    <input type="checkbox" checked={formData.acknowledgedPrivacy} onChange={(event) => handleChange('acknowledgedPrivacy', event.target.checked)} className="mt-1 accent-green-700" />
                    <span>{t('legal.acknowledgePrivacy')}{' '}<Link className="font-bold underline" to="/policies/privacy">{t('footer.privacy')}</Link>.{renderFieldError('acknowledgedPrivacy')}</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-800">
                    <input type="checkbox" checked={formData.agreedToTeacherAgreement} onChange={(event) => handleChange('agreedToTeacherAgreement', event.target.checked)} className="mt-1 accent-green-700" />
                    <span>{t('auth.liveTutorApplication.agreeGuidelines')}{' '}<Link className="font-bold underline" to="/policies/teacher-guidelines">{t('footer.teacherGuidelines')}</Link>.{renderFieldError('agreedToTeacherAgreement')}</span>
                  </label>
                </section>
              </div>
            )}

            <footer className="mt-9 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <button type="button" onClick={handleBack} disabled={currentStep === 1 || loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-base font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-40">
                <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> {t('auth.back')}
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 text-base font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#15803D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
                {currentStep === 5 ? (
                  loading ? <><i className="fas fa-spinner animate-spin" aria-hidden="true" /> {t('auth.liveTutorApplication.submitting')}</> : <><i className="fas fa-paper-plane" aria-hidden="true" /> {t('auth.liveTutorApplication.submit')}</>
                ) : (
                  <>{t('auth.liveTutorApplication.next')} <i className="fas fa-arrow-right text-xs" aria-hidden="true" /></>
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
