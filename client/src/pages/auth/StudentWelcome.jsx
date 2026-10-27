import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import FlipCard from '../../components/common/FlipCard'
import JourneyCTA from '../../components/common/JourneyCTA'
import { useAuth } from '../../context/AuthContext'

const studentBenefits = [
  {
    icon: 'fa-book-open',
    title: 'Learn from published courses',
    summary: 'Browse course details, subjects, levels, languages, and teacher profiles before you choose.',
    details: 'The public course catalog shows courses currently published by approved course teachers. You can review the course description, lessons, level, language, pricing, and ratings.',
    color: 'emerald',
    axis: 'y',
  },
  {
    icon: 'fa-chalkboard-user',
    title: 'Find approved educators',
    summary: 'Explore approved course teachers and live tutors who are accepting bookings.',
    details: 'Teacher and tutor listings come from approved profiles. Live tutor listings reflect booking availability, and each profile shows the details the educator has provided.',
    color: 'blue',
    axis: 'x',
  },
  {
    icon: 'fa-chart-simple',
    title: 'Follow your course progress',
    summary: 'Continue through course lessons and see your progress as you learn.',
    details: 'Course learning tools track lesson completion and display progress. Assessments and other learning activities may be available depending on the course.',
    color: 'violet',
    axis: 'y',
  },
  {
    icon: 'fa-certificate',
    title: 'Work toward course completion',
    summary: 'Full course enrollment includes course completion certificate access.',
    details: 'Certificates are tied to course completion. The course enrollment page lists a completion certificate and weekly live mentorship among the full-course enrollment benefits.',
    color: 'amber',
    axis: 'x',
  },
  {
    icon: 'fa-lightbulb',
    title: 'Planned entrepreneurship training',
    summary: 'Free training for enrolled learners is a future goal for the Academy.',
    details: 'We plan to fund trainers from course revenue and then offer entrepreneurship training free to enrolled students. This program is not available yet and depends on revenue being sufficient to fund trainers.',
    color: 'violet',
    axis: 'y',
  },
]

const learningSteps = [
  ['01', 'Explore what is available', 'Browse published courses and approved tutor profiles before creating an account.'],
  ['02', 'Create a student account', 'Register with your name, email, and password to access the learning features.'],
  ['03', 'Choose your learning path', 'Enroll in a course or review tutor availability and session offers before booking.'],
  ['04', 'Learn and track progress', 'Continue lessons, complete course activities, and use support options available in your enrollment.'],
]

const StudentWelcome = () => {
  const { user } = useAuth()
  const startPath = user?.role === 'student' ? '/dashboard/student' : '/register/student'
  const actionLabel = user?.role === 'student' ? 'Go to your learning dashboard' : 'Create your student account'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
          <Link to="/register" className="inline-flex items-center gap-2 text-sm font-bold text-violet-800 hover:underline">
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> Registration choices
          </Link>

          <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-700 text-white shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1200&q=85"
                alt=""
                className="absolute right-0 h-full w-full object-cover object-center opacity-25 sm:w-3/5 sm:opacity-55"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/85 to-indigo-950/20" />
              <div className="absolute -bottom-32 left-1/2 h-96 w-96 rounded-full bg-fuchsia-400/15 blur-3xl" />
            </div>
            <div className="relative max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/30 bg-violet-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-100">
                <i className="fas fa-graduation-cap" aria-hidden="true" /> Welcome, learner
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">Your next step starts<br />with what you want to learn.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100 sm:text-lg sm:leading-8">
                Explore real courses and educator profiles, then choose a learning path that fits your goals and language.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={startPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-violet-950 shadow-lg transition hover:bg-violet-50">
                  {actionLabel} <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
                </Link>
                <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                  Browse available courses
                </Link>
              </div>
            </div>
          </header>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-800">Learn with support</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Learning options built around your goals</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Tap each card to learn more about the tools and benefits currently offered.</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {studentBenefits.map((benefit) => <FlipCard key={benefit.title} {...benefit} />)}
            </div>
            <JourneyCTA to={startPath} label={actionLabel} tone="violet" />
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">A simple way to begin</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">From exploring to learning</h2>
              <ol className="mt-7 space-y-4">
                {learningSteps.map(([number, title, description]) => (
                  <li key={number} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-emerald-800">{number}</span>
                    <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>
                  </li>
                ))}
              </ol>
              <JourneyCTA to={startPath} label={actionLabel} tone="emerald" />
            </div>
            <aside className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-indigo-950 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=85"
                alt="Male educator ready to support learners"
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/15 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7 text-white sm:p-9">
                <p className="text-sm font-bold uppercase tracking-widest text-violet-200">Learn at your pace</p>
                <p className="mt-2 max-w-sm text-2xl font-extrabold">Choose courses and educators from the current catalog.</p>
              </div>
            </aside>
          </section>

          <section className="mt-16 rounded-[2rem] border border-violet-200 bg-gradient-to-r from-violet-100 via-white to-indigo-100 p-8 sm:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-200 text-2xl text-violet-800"><i className="fas fa-compass" aria-hidden="true" /></span>
              <h2 className="mt-5 text-3xl font-black sm:text-4xl">Start by exploring what is available</h2>
              <p className="mt-4 leading-7 text-slate-600">Course availability, subjects, teacher profiles, and tutor schedules come from the live catalog and may change as educators update their offerings.</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={startPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-800 px-6 py-3 font-extrabold text-white transition hover:bg-violet-900">
                  {actionLabel} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                </Link>
                <Link to="/tutors" className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300 bg-white px-6 py-3 font-bold text-violet-900 hover:bg-violet-50">
                  Find a live tutor
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-800">Planned future opportunity</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Free entrepreneurship training for enrolled students</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
              The Academy plans to introduce this training after course revenue can fund trainers. It is a future goal and is not available yet.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default StudentWelcome
