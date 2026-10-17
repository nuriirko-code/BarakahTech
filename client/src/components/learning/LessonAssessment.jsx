import { useMemo, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const LessonAssessment = ({ lesson, courseId, onPass, onRetry }) => {
  const { token } = useAuth()
  const [phase, setPhase] = useState('intro')
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [results, setResults] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalQuestions = lesson?.assessmentQuestions?.length || 0
  const passingScore = lesson?.passingScore || 80
 
  const progressValue = useMemo(() => {
    if (!totalQuestions) return 0
    return ((currentQuestion + 1) / totalQuestions) * 100
  }, [currentQuestion, totalQuestions])

  const updateAnswer = (questionIndex, value) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = [...currentAnswers]
      nextAnswers[questionIndex] = value
      return nextAnswers
    })
  }

  const isAnswered = (questionIndex) => {
    const answer = answers[questionIndex]
    return typeof answer === 'string' ? answer.trim().length > 0 : Boolean(answer)
  }

  const goToNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((value) => value + 1)
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((value) => value - 1)
    }
  }

  const handleSubmit = async () => {
    const unanswered = lesson.assessmentQuestions.some((question, index) => !isAnswered(index))
    if (unanswered) {
      setError('Please answer every question before submitting.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload = answers.map((answer, index) => ({ questionIndex: index, answer }))
      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/lessons/${lesson._id}/assessment`,
        { answers: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setResults(response.data)
      setPhase('results')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit the assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetAssessment = () => {
    setAnswers([])
    setCurrentQuestion(0)
    setResults(null)
    setPhase('intro')
    setError('')
  }

  const renderOptions = (question, questionIndex) => {
    if (question.questionType === 'multiple_choice') {
      return (
        <div className="grid gap-3">
          {question.options.map((option) => {
            const selected = answers[questionIndex] === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateAnswer(questionIndex, option)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${selected ? 'border-green-600 bg-green-50 text-green-900 shadow-sm ring-2 ring-green-200' : 'border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50'}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )
    }
     
    if (question.questionType === 'true_false') {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {['True', 'False'].map((option) => {
            const selected = answers[questionIndex] === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => updateAnswer(questionIndex, option)}
                className={`rounded-xl border px-5 py-4 text-base font-semibold transition ${selected ? 'border-green-600 bg-green-50 text-green-900 shadow-sm ring-2 ring-green-200' : 'border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50'}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )
    }

    return (
      <textarea
        value={answers[questionIndex] || ''}
        onChange={(event) => updateAnswer(questionIndex, event.target.value)}
        rows={6}
        placeholder="Type your answer here"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
      />
    )
  }

  if (!lesson || !lesson.assessmentQuestions?.length) return null

  if (phase === 'intro') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl text-green-700">
            <i className="fas fa-clipboard-list" aria-hidden="true" />
          </span>
        </div>
        <h3 className="mt-5 text-center text-2xl font-extrabold text-slate-900">Lesson Assessment</h3>
        <p className="mt-2 text-center text-sm text-slate-600">Test your understanding before moving on</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Questions</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{totalQuestions}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Passing</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{passingScore}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">No time limit</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPhase('taking')}
          className="mt-6 w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
        >
          Start Assessment
        </button>
      </div>
    )
  }

  if (phase === 'taking') {
    const question = lesson.assessmentQuestions[currentQuestion]

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${progressValue}%` }} />
          </div>
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <div className="rounded-xl bg-slate-50 p-4">
          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green-800">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <p className="mt-4 text-xl font-bold leading-8 text-slate-900">{question.question}</p>
        </div>

        <div className="mt-5 space-y-3">{renderOptions(question, currentQuestion)}</div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {currentQuestion === totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextQuestion}
              className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-800"
            >
              Next
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!results) return null

  const passed = results.passed

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      {passed ? (
        <>
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              <i className="fas fa-circle-check" aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-5 text-center text-2xl font-extrabold text-green-700">Assessment Passed!</h3>
          <div className="mt-4 text-center">
            <p className="text-5xl font-black text-slate-900">{results.score}%</p>
            <p className="mt-2 text-sm text-slate-600">You needed {results.passingScore}% to pass</p>
          </div>
          <button
            type="button"
            onClick={onPass}
            className="mt-6 w-full rounded-xl bg-green-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-800"
          >
            Continue to Next Lesson
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-700">
              <i className="fas fa-circle-xmark" aria-hidden="true" />
            </span>
          </div>
          <h3 className="mt-5 text-center text-2xl font-extrabold text-amber-700">Not quite there yet</h3>
          <div className="mt-4 text-center">
            <p className="text-3xl font-black text-slate-900">You scored {results.score}%.</p>
            <p className="mt-2 text-sm text-slate-600">You need {results.passingScore}% to pass.</p>
            <p className="mt-3 text-sm text-slate-600">Review the lesson content and try again. You can retake as many times as needed.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                resetAssessment()
                onRetry?.()
              }}
              className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700"
            >
              Retake Assessment
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Review Lesson
            </button>
          </div>
        </>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <details className="group">
          <summary className="cursor-pointer list-none text-sm font-bold text-slate-800">
            Review Answers
          </summary>
          <div className="mt-4 space-y-4">
            {results.results.map((item, index) => (
              <div key={`${item.question}-${index}`} className={`rounded-xl border p-4 ${item.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">Question {index + 1}</p>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${item.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-800">{item.question}</p>
                <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">Your answer:</span> {item.studentAnswer || 'No answer entered'}</p>
                <p className="mt-1 text-sm text-slate-700"><span className="font-semibold">Correct answer:</span> {item.correctAnswer}</p>
                {item.explanation && <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Why:</span> {item.explanation}</p>}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

export default LessonAssessment
