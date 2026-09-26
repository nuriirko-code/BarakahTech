import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import teachingCategories from '../../utils/teachingCategories'
import subjectQuestions from '../../utils/subjectQuestions'

const genericQuestions = [
  'How do you identify the prior knowledge learners need before beginning a new topic?',
  'Describe how you would adapt one lesson for learners with different levels of experience.',
  'How do you check during a lesson whether learners understand, rather than only remember, the material?',
  'How would you give constructive feedback when a learner has made a persistent misconception?',
  'Describe how you would evaluate whether your teaching approach helped learners meet a stated objective.',
]

const steps = [
  'Personal Information',
  'Your Teaching Category',
  'Your Teaching Method',
  'Your Qualifications',
  'Subject Assessment',
  'Commitment and Agreement',
]

const teachingLanguages = [
  { value: 'amharic', label: 'Amharic' },
  { value: 'english', label: 'English' },
  { value: 'afan oromo', label: 'Afaan Oromo' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'both', label: 'Both' },
]

const teachingMethods = [
  { value: 'live', label: 'Live Sessions Only' },
  { value: 'courses', label: 'Course Uploads Only' },
  { value: 'both', label: 'Both' },
]

const educationLevels = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' },
]

const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const TeacherRegister = () => {
  // Keeping all step values together makes it straightforward to preserve data
  // while moving between steps and submit one complete application at the end.
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    region: '',
    dateOfBirth: '',
    nationalId: '',
    mainCategory: '',
    specificSubject: '',
    teachingLanguage: '',
    teachingMethod: '',
    hourlyRate: 0,
    availableHoursPerWeek: '',
    availableDays: [],
    educationLevel: '',
    institutionName: '',
    yearsOfExperience: '',
    bio: '',
    assessmentAnswers: [],
    yearsInSpecificSubject: '',
    portfolioLink: '',
    demoVideoLink: '',
    agreedToStandards: false,
    agreedToBackgroundCheck: false,
    confirmedAvailability: false,
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otherSubjectSelected, setOtherSubjectSelected] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)
  const navigate = useNavigate()
  const { login, user, token } = useAuth()

  // This single updater handles ordinary inputs and also clears answers when
  // the subject changes, because answers to the former subject no longer apply.
  const handleChange = (field, value) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
      ...(field === 'specificSubject' ? { assessmentAnswers: [] } : {}),
    }))
  }

  const handleDayToggle = (day) => {
    setFormData((currentData) => ({
      ...currentData,
      availableDays: currentData.availableDays.includes(day)
        ? currentData.availableDays.filter((selectedDay) => selectedDay !== day)
        : [...currentData.availableDays, day],
    }))
  }

  const questions = subjectQuestions[formData.specificSubject] || genericQuestions

  // Each response stores both the displayed question and its answer because
  // the backend saves question-answer pairs for later application review.
  const handleAnswerChange = (index, value) => {
    setFormData((currentData) => {
      const assessmentAnswers = [...currentData.assessmentAnswers]
      assessmentAnswers[index] = { question: questions[index], answer: value }
      return { ...currentData, assessmentAnswers }
    })
  }

  // Each step validates only its own fields. Invalid input keeps the applicant
  // on the current step and explains what needs to be corrected.
  const validateStep = (step) => {
    let message = ''
            
    if (step === 1) {
      const personalFields = [
        'name', 'email', 'password', 'confirmPassword', 'phone', 'city', 'region', 'dateOfBirth', 'nationalId',
      ]
      if (personalFields.some((field) => !String(formData[field]).trim())) {
        message = 'Please complete all personal information fields.'
      } else if (formData.password !== formData.confirmPassword) {
        message = 'Passwords do not match.'
      } else if (formData.password.length < 6) {
        message = 'Password must be at least 6 characters.'
      }
    }

    if (step === 2 && (!formData.mainCategory || !formData.specificSubject || !formData.teachingLanguage)) {
      message = 'Please choose a category, subject, and teaching language.'
    }

    if (step === 3) {
      if (!formData.teachingMethod || formData.availableHoursPerWeek === '') {
        message = 'Please choose a teaching method and enter your weekly hours.'
      } else if (Number(formData.availableHoursPerWeek) <= 0 || formData.availableDays.length === 0) {
        message = 'Enter available hours greater than zero and select at least one day.'
      }
    }

    if (step === 4) {
      if (!formData.educationLevel || !formData.institutionName.trim() || formData.yearsOfExperience === '') {
        message = 'Please complete your qualification details.'
      } else if (Number(formData.yearsOfExperience) < 0) {
        message = 'Years of experience cannot be negative.'
      } else if (formData.bio.trim().length < 100) {
        message = 'Your bio must be at least 100 characters.'
      }
    }

    if (step === 5) {
      const allAnswersComplete = questions.length === 5 && questions.every((_, index) => {
        return (formData.assessmentAnswers[index]?.answer || '').trim().length >= 20
      })
      if (!allAnswersComplete || formData.yearsInSpecificSubject === '') {
        message = 'Answer all five questions with at least 20 characters and enter your subject experience.'
      } else if (Number(formData.yearsInSpecificSubject) < 0) {
        message = 'Years in this subject cannot be negative.'
      }
    }

    if (step === 6 && (!formData.confirmedAvailability || !formData.agreedToStandards || !formData.agreedToBackgroundCheck)) {
      message = 'Please accept all three commitments before submitting.'
    }

    if (message) {
      setError(message)
      return false
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('')
      setCurrentStep((step) => Math.min(step + 1, 6))
    }
  }

  const handleBack = () => {
    setError('')
    setCurrentStep((step) => Math.max(step - 1, 1))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateStep(6)) return

    setLoading(true)
    setError('')

    try {
      // Registration creates a pending_teacher account. Its returned JWT is
      // required by the protected application endpoint, so register first.
      // If the account was created but application submission failed, reuse its
      // saved session on retry instead of attempting duplicate registration.
      let accessToken = accountCreated || user?.role === 'pending_teacher' ? token : null

      if (!accessToken) {
        const registrationResponse = await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'teacher',
        })
        const { user: registeredUser, token: registeredToken } = registrationResponse.data

        if (!registeredUser || !registeredToken) {
          throw new Error('Registration response did not include the account and authentication token.')
        }

        accessToken = registeredToken
        login(registeredUser, registeredToken)
        setAccountCreated(true)
      }

      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`

      const applicationData = Object.fromEntries(
        Object.entries(formData).filter(([field]) => {
          return !['name', 'email', 'password', 'confirmPassword'].includes(field)
        })
      )
      await axios.post('http://localhost:5000/api/teacher-applications', {
        ...applicationData,
        availableHoursPerWeek: Number(formData.availableHoursPerWeek),
        yearsOfExperience: Number(formData.yearsOfExperience),
        yearsInSpecificSubject: Number(formData.yearsInSpecificSubject),
        hourlyRate: Number(formData.hourlyRate) || 0,
      })

      navigate('/application-submitted')
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to submit the application.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100'
  const optionClass = (selected) => `rounded-xl border p-4 text-left transition-colors ${selected ? 'border-green-700 bg-green-50 text-green-900' : 'border-gray-200 bg-white hover:border-green-400'}`

  return (
    <main className="min-h-screen bg-green-50 px-4 py-10 text-gray-900 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg sm:p-10">
        <p className="text-center text-2xl font-bold text-green-700">BarakahTech</p>
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
            <span>Step {currentStep} of 6</span>
            <span>{Math.round((currentStep / 6) * 100)}%</span>
          </div>
          {/* Dividing the current step by six gives a percentage for the progress bar width. */}
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-green-700 transition-all" style={{ width: `${(currentStep / 6) * 100}%` }} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-green-900 sm:text-3xl">{steps[currentStep - 1]}</h1>
        </div>

        {error && <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        <form onSubmit={currentStep === 6 ? handleSubmit : (event) => { event.preventDefault(); handleNext() }} className="mt-8">
          {currentStep === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Full name<input className={inputClass} value={formData.name} onChange={(event) => handleChange('name', event.target.value)} autoComplete="name" /></label>
              <label className="space-y-2 text-sm font-medium">Email address<input className={inputClass} type="email" value={formData.email} onChange={(event) => handleChange('email', event.target.value)} autoComplete="email" /></label>
              <label className="space-y-2 text-sm font-medium">Password<input className={inputClass} type="password" value={formData.password} onChange={(event) => handleChange('password', event.target.value)} autoComplete="new-password" /></label>
              <label className="space-y-2 text-sm font-medium">Confirm password<input className={inputClass} type="password" value={formData.confirmPassword} onChange={(event) => handleChange('confirmPassword', event.target.value)} autoComplete="new-password" /></label>
              <label className="space-y-2 text-sm font-medium">Phone<input className={inputClass} type="tel" value={formData.phone} onChange={(event) => handleChange('phone', event.target.value)} autoComplete="tel" /></label>
              <label className="space-y-2 text-sm font-medium">City<input className={inputClass} value={formData.city} onChange={(event) => handleChange('city', event.target.value)} autoComplete="address-level2" /></label>
              <label className="space-y-2 text-sm font-medium">Region<input className={inputClass} value={formData.region} onChange={(event) => handleChange('region', event.target.value)} autoComplete="address-level1" /></label>
              <label className="space-y-2 text-sm font-medium">Date of birth<input className={inputClass} type="date" value={formData.dateOfBirth} onChange={(event) => handleChange('dateOfBirth', event.target.value)} /></label>
              <label className="space-y-2 text-sm font-medium sm:col-span-2">National ID<input className={inputClass} value={formData.nationalId} onChange={(event) => handleChange('nationalId', event.target.value)} /></label>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-7">
              <div>
                <h2 className="mb-3 font-semibold">Choose a category</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(teachingCategories).map(([categoryId, category]) => (
                    <button key={categoryId} type="button" aria-pressed={formData.mainCategory === categoryId} className={optionClass(formData.mainCategory === categoryId)} onClick={() => {
                      handleChange('mainCategory', categoryId)
                      handleChange('specificSubject', '')
                      setOtherSubjectSelected(false)
                    }}>
                      <span className="mr-3 text-2xl" aria-hidden="true">{category.icon}</span>{category.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.mainCategory && (
                <div className="space-y-5">
                  <label className="block space-y-2 text-sm font-medium">
                    Specific subject
                    <select className={inputClass} value={otherSubjectSelected ? 'other-custom' : formData.specificSubject} onChange={(event) => {
                      const value = event.target.value
                      if (value === 'other-custom') {
                        setOtherSubjectSelected(true)
                        handleChange('specificSubject', '')
                      } else {
                        setOtherSubjectSelected(false)
                        handleChange('specificSubject', value)
                      }
                    }}>
                      <option value="">Select a subject</option>
                      {teachingCategories[formData.mainCategory].subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                      <option value="other-custom">Add another subject</option>
                    </select>
                  </label>
                  {otherSubjectSelected && (
                    <label className="block space-y-2 text-sm font-medium">Enter your subject
                      <input className={inputClass} value={formData.specificSubject} onChange={(event) => handleChange('specificSubject', event.target.value)} placeholder="Your subject or course" />
                    </label>
                  )}
                </div>
              )}

              <fieldset>
                <legend className="mb-3 font-semibold">Teaching language</legend>
                <div className="flex flex-wrap gap-3">
                  {teachingLanguages.map((language) => (
                    <button key={language.value} type="button" aria-pressed={formData.teachingLanguage === language.value} className={`${optionClass(formData.teachingLanguage === language.value)} px-5`} onClick={() => handleChange('teachingLanguage', language.value)}>
                      {language.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-7">
              <fieldset>
                <legend className="mb-3 font-semibold">How will you teach?</legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  {teachingMethods.map((method) => (
                    <button key={method.value} type="button" aria-pressed={formData.teachingMethod === method.value} className={optionClass(formData.teachingMethod === method.value)} onClick={() => handleChange('teachingMethod', method.value)}>{method.label}</button>
                  ))}
                </div>
              </fieldset>
              {(formData.teachingMethod === 'live' || formData.teachingMethod === 'both') && (
                <label className="block space-y-2 text-sm font-medium">Hourly rate
                  <input className={inputClass} type="number" min="0" value={formData.hourlyRate} onChange={(event) => handleChange('hourlyRate', event.target.value)} />
                </label>
              )}
              <label className="block space-y-2 text-sm font-medium">Available hours per week
                <input className={inputClass} type="number" min="1" value={formData.availableHoursPerWeek} onChange={(event) => handleChange('availableHoursPerWeek', event.target.value)} />
              </label>
              <fieldset>
                <legend className="mb-3 font-semibold">Available days</legend>
                <div className="flex flex-wrap gap-2">
                  {availableDays.map((day) => (
                    <button key={day} type="button" aria-pressed={formData.availableDays.includes(day)} className={`${optionClass(formData.availableDays.includes(day))} px-4 py-2`} onClick={() => handleDayToggle(day)}>{day}</button>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-3 font-semibold">Education level</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {educationLevels.map((level) => (
                    <button key={level.value} type="button" aria-pressed={formData.educationLevel === level.value} className={optionClass(formData.educationLevel === level.value)} onClick={() => handleChange('educationLevel', level.value)}>{level.label}</button>
                  ))}
                </div>
              </fieldset>
              <label className="block space-y-2 text-sm font-medium">Institution name
                <input className={inputClass} value={formData.institutionName} onChange={(event) => handleChange('institutionName', event.target.value)} />
              </label>
              <label className="block space-y-2 text-sm font-medium">Years of teaching experience
                <input className={inputClass} type="number" min="0" value={formData.yearsOfExperience} onChange={(event) => handleChange('yearsOfExperience', event.target.value)} />
              </label>
              <label className="block space-y-2 text-sm font-medium">Professional bio
                <textarea className={`${inputClass} min-h-36`} value={formData.bio} onChange={(event) => handleChange('bio', event.target.value)} />
                <span className="block text-right text-sm text-gray-500">{formData.bio.length} / 100 minimum characters</span>
              </label>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <p className="text-gray-600">Please answer these questions about your subject honestly without using AI assistance.</p>
              {questions.map((question, index) => (
                <label key={`${formData.specificSubject}-${index}`} className="block space-y-2 text-sm font-medium">
                  <span>{index + 1}. {question}</span>
                  <textarea className={`${inputClass} min-h-28`} value={formData.assessmentAnswers[index]?.answer || ''} onChange={(event) => handleAnswerChange(index, event.target.value)} />
                  <span className="block text-right text-xs text-gray-500">{(formData.assessmentAnswers[index]?.answer || '').trim().length} / 20 minimum characters</span>
                </label>
              ))}
              <label className="block space-y-2 text-sm font-medium">Years teaching this subject
                <input className={inputClass} type="number" min="0" value={formData.yearsInSpecificSubject} onChange={(event) => handleChange('yearsInSpecificSubject', event.target.value)} />
              </label>
              <label className="block space-y-2 text-sm font-medium">Portfolio link (optional)
                <input className={inputClass} type="url" value={formData.portfolioLink} onChange={(event) => handleChange('portfolioLink', event.target.value)} />
              </label>
              <label className="block space-y-2 text-sm font-medium">Demo video link (optional)
                <input className={inputClass} type="url" value={formData.demoVideoLink} onChange={(event) => handleChange('demoVideoLink', event.target.value)} />
              </label>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <section className="rounded-xl bg-green-50 p-5">
                <h2 className="font-semibold text-green-900">Application summary</h2>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{formData.name}</dd></div>
                  <div><dt className="text-gray-500">Category</dt><dd className="font-medium">{teachingCategories[formData.mainCategory]?.label}</dd></div>
                  <div><dt className="text-gray-500">Subject</dt><dd className="font-medium">{formData.specificSubject}</dd></div>
                  <div><dt className="text-gray-500">Teaching method</dt><dd className="font-medium">{teachingMethods.find((method) => method.value === formData.teachingMethod)?.label}</dd></div>
                </dl>
              </section>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <input className="mt-1 accent-green-700" type="checkbox" checked={formData.confirmedAvailability} onChange={(event) => handleChange('confirmedAvailability', event.target.checked)} />
                <span>I confirm I am available for the hours I specified</span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <input className="mt-1 accent-green-700" type="checkbox" checked={formData.agreedToStandards} onChange={(event) => handleChange('agreedToStandards', event.target.checked)} />
                <span>I agree to BarakahTech teaching standards and code of conduct</span>
              </label>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <input className="mt-1 accent-green-700" type="checkbox" checked={formData.agreedToBackgroundCheck} onChange={(event) => handleChange('agreedToBackgroundCheck', event.target.checked)} />
                <span>I consent to a background verification check</span>
              </label>
            </div>
          )}

          <div className="mt-9 flex items-center justify-between border-t pt-6">
            <button type="button" onClick={handleBack} disabled={currentStep === 1 || loading} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
              Back
            </button>
            {currentStep < 6 ? (
              <button type="submit" className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">Next</button>
            ) : (
              <button type="submit" disabled={loading} className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  )
}

export default TeacherRegister
