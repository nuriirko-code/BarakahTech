import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import FlipCard from '../../components/common/FlipCard'
import JourneyCTA from '../../components/common/JourneyCTA'
import { useAuth } from '../../context/AuthContext'

const tutorBenefits = [
  {
    icon: 'fa-user-circle',
    title: 'Build your public profile',
    summary: 'Show students your teaching subjects, languages, approach, and introduction.',
    details: 'Your application collects a profile photo, bio, teaching approach, subjects, languages, level, and optional introduction video.',
    color: 'violet',
    axis: 'y',
  },
  {
    icon: 'fa-calendar-check',
    title: 'Set your schedule',
    summary: 'Tell learners when you are available and accepting new bookings.',
    details: 'Choose your timezone, weekly availability, advance booking time, and the minimum sessions you can take each week.',
    color: 'blue',
    axis: 'x',
  },
  {
    icon: 'fa-coins',
    title: 'Set a clear session offer',
    summary: 'Choose a session length, price, and currency for your profile.',
    details: 'Your public profile presents the session duration and price you provide. Students can review your offer before choosing to book.',
    color: 'amber',
    axis: 'y',
  },
]

const applicationSteps = [
  ['01', 'Create an account', 'New tutors create a Barakah Academy account before submitting their application.'],
  ['02', 'Describe your teaching', 'Choose your category, subjects, teaching level, languages, and session offer.'],
  ['03', 'Set availability and profile', 'Add your timezone, weekly schedule, tutor bio, approach, and profile information.'],
  ['04', 'Complete scenario questions', 'Answer practical questions about supporting students and submit your application for review.'],
  ['05', 'After approval', 'Your public tutor profile can be shown to students. Keep availability current and manage bookings from your tutor workspace.'],
]

const LiveTutorWelcome = () => {
  const { user } = useAuth()
  const startPath = user ? '/apply/live-tutor' : '/register/live-tutor'
  const actionLabel = user ? 'Continue to your application' : 'Create account and apply'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-violet-50/50 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
          <Link to="/choose-teaching-path" className="inline-flex items-center gap-2 text-sm font-bold text-violet-800 hover:underline">
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> Teaching paths
          </Link>

          <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-indigo-950 text-white shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1200&q=85"
                alt=""
                className="absolute right-0 h-full w-full object-cover object-center opacity-30 sm:w-3/5 sm:opacity-65"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/90 to-indigo-950/15" />
              <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-violet-200/20" />
            </div>
            <div className="relative max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/30 bg-violet-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                <i className="fas fa-video" aria-hidden="true" /> Live tutoring
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">Teach live.<br />Make every session matter.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg sm:leading-8">
                Create a tutor profile, set your schedule and session offer, and help students learn through live tutoring.
              </p>
              <Link to={startPath} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-300 px-6 py-3.5 font-extrabold text-indigo-950 shadow-lg transition hover:bg-violet-200">
                {actionLabel} <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-800">Your tutoring workspace</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Tools for offering live sessions</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Tap a card to see what each part of the tutor profile lets you share.</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tutorBenefits.map((benefit) => <FlipCard key={benefit.title} {...benefit} />)}
            </div>
            <JourneyCTA to={startPath} label={actionLabel} tone="violet" />
          </section>

          <section className="mt-16 rounded-[2rem] border border-violet-100 bg-white p-7 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-800">From first step to first booking</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">What happens along the way</h2>
              <p className="mt-4 leading-7 text-slate-600">A transparent look at the application and the work that follows approval.</p>
            </div>
            <ol className="mt-8 space-y-4">
              {applicationSteps.map(([number, title, description], index) => (
                <li key={number} className="flex gap-4 rounded-2xl bg-violet-50/70 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-200 font-black text-violet-900">{number}</span>
                  <div className="flex-1"><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
                  {index === applicationSteps.length - 1 && <i className="fas fa-check-circle mt-1 text-emerald-600" aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <JourneyCTA to={startPath} label="Start your tutor application" tone="blue" />
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
            <aside className="overflow-hidden rounded-[2rem] border-8 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1000&q=85"
                alt="Male professional educator"
                className="h-[420px] w-full object-cover object-center"
                loading="lazy"
              />
            </aside>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">Good tutoring starts with clarity</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">How to prepare for tutoring on Barakah</h2>
              <div className="mt-6 space-y-4">
                {[
                  ['Be specific', 'Choose subjects and learner levels you are prepared to teach.'],
                  ['Keep your profile current', 'Update your bio, session offer, timezone, and weekly availability when they change.'],
                  ['Show up for learners', 'Communicate professionally, attend confirmed sessions, and respond constructively to feedback.'],
                ].map(([title, text]) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"><i className="fas fa-check" aria-hidden="true" /></span>
                    <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
                  </div>
                ))}
              </div>
              <JourneyCTA to={startPath} label={actionLabel} tone="emerald" />
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] bg-gradient-to-r from-indigo-950 to-violet-900 p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-black sm:text-4xl">Ready to offer live tutoring?</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-violet-100">Create your profile and share your teaching experience, subjects, and availability for review.</p>
            <Link to={startPath} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-300 px-6 py-3 font-extrabold text-indigo-950 transition hover:bg-violet-200">
              {actionLabel} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default LiveTutorWelcome
