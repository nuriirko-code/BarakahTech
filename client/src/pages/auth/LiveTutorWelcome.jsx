import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// The introduction sets clear expectations before a tutor begins the detailed review form.
const LiveTutorWelcome = () => {
  const { user } = useAuth()
  const startPath = user ? '/apply/live-tutor' : '/register/live-tutor'

  return (
    <main className="min-h-screen bg-green-50 px-5 py-12 text-slate-900 sm:px-8">
      <section className="mx-auto max-w-5xl">
        <Link to="/choose-teaching-path" className="inline-flex items-center gap-2 text-base font-semibold text-[#15803D] hover:underline"><i className="fas fa-arrow-left text-sm" aria-hidden="true" /> Back to teaching paths</Link>
        <header className="mt-8 rounded-2xl bg-slate-900 px-7 py-12 text-white sm:px-12 sm:py-16">
          <p className="text-base font-bold uppercase tracking-wide text-[#86EFAC]">Barakah Academy</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Teach live. Change lives.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-50">Help learners through one-to-one or small-group sessions, set your availability, and share your expertise in the subjects you know best.</p>
          <Link to={startPath} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 text-base font-bold text-slate-950 transition hover:bg-[#86EFAC]">{user ? 'Continue to application' : 'Create account and apply'} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </header>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[['fas fa-user-group', 'Teach your way', 'Offer individual or small-group sessions.'], ['fas fa-calendar-check', 'Set your schedule', 'Choose the days and times you can teach.'], ['fas fa-shield-heart', 'Build trust', 'Approved tutors receive a public profile for students to find.']].map(([icon, title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><i className={`${icon} text-2xl text-[#16A34A]`} aria-hidden="true" /><h2 className="mt-4 text-xl font-bold">{title}</h2><p className="mt-2 text-base leading-7 text-slate-600">{text}</p></article>)}
        </div>
      </section>
    </main>
  )
}

export default LiveTutorWelcome
