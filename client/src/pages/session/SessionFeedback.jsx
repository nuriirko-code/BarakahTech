import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// This completion page keeps the end-call destination valid until the later
// rating-and-review phase adds the actual feedback form and backend endpoint.
const SessionFeedback = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const destination = user?.role === 'student' ? '/dashboard/student/my-sessions' : '/dashboard/teacher/live-sessions'

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="max-w-md rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700"><i className="fas fa-circle-check" aria-hidden="true" /></span>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Session ended</h1>
        <p className="mt-3 leading-7 text-slate-600">Thank you for learning with BarakahTech Academy. Session feedback will be added in the feedback phase.</p>
        <button type="button" onClick={() => navigate(destination)} className="mt-6 rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700">Return to my sessions</button>
      </section>
    </main>
  )
}

export default SessionFeedback
