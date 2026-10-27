import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import FlipCard from '../../components/common/FlipCard'
import JourneyCTA from '../../components/common/JourneyCTA'
import { useAuth } from '../../context/AuthContext'

const teachingBenefits = [
  {
    icon: 'fa-layer-group',
    title: 'Build structured courses',
    summary: 'Turn your subject knowledge into an organized learning path.',
    details: 'Create a course, write a description, add objectives, and organize the learning into lessons students can follow.',
    color: 'emerald',
    axis: 'y',
  },
  {
    icon: 'fa-photo-film',
    title: 'Present your expertise',
    summary: 'Create a teacher profile and share the subjects you teach.',
    details: 'Your application collects your teaching category, subject, language, method, qualifications, and profile information for review.',
    color: 'blue',
    axis: 'x',
  },
  {
    icon: 'fa-chart-line',
    title: 'Manage your courses',
    summary: 'Use your teacher dashboard to create and manage course content.',
    details: 'After approval, use the teacher tools to prepare courses, manage lessons, and review student enrollment and progress.',
    color: 'amber',
    axis: 'y',
  },
]

const applicationSteps = [
  ['01', 'Create your account', 'Start the course-teacher registration form. New users create an account as part of the process.'],
  ['02', 'Complete your application', 'Provide your personal details, teaching category, subject, method, qualifications, and availability.'],
  ['03', 'Complete the subject assessment', 'Answer questions connected to your selected subject and submit your application for review.'],
  ['04', 'Wait for the review decision', 'The Academy reviews submitted applications. Course-teaching tools are available after approval.'],
]

const TeacherWelcome = () => {
  const { user } = useAuth()
  const applicationPath = '/register/teacher'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
          <Link to="/choose-teaching-path" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline">
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> Teaching paths
          </Link>

          <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&q=85"
                alt=""
                className="absolute right-0 h-full w-full object-cover object-center opacity-35 sm:w-3/5 sm:opacity-70"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/15" />
            </div>
            <div className="relative max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                <i className="fas fa-chalkboard-user" aria-hidden="true" /> Course teaching
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">Teach what you know.<br />Build learning that lasts.</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                Create structured courses, share your knowledge with learners, and manage your teaching through Barakah Academy.
              </p>
              <Link to={applicationPath} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 font-extrabold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300">
                {user ? 'Continue your application' : 'Start your teacher application'}
                <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">Teach with purpose</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">What course teachers can do</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Tap a card to turn it over and explore how course teaching works.</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {teachingBenefits.map((benefit) => <FlipCard key={benefit.title} {...benefit} />)}
            </div>
            <JourneyCTA to={applicationPath} label={user ? 'Continue application' : 'Apply to teach courses'} />
          </section>

          <section className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-800">Your path, step by step</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">From application to published courses</h2>
              <p className="mt-4 leading-7 text-slate-600">Here is what to expect when you apply to become a course teacher.</p>
            </div>
            <ol className="mt-8 grid gap-5 md:grid-cols-2">
              {applicationSteps.map(([number, title, description]) => (
                <li key={number} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-800">{number}</span>
                  <div><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
                </li>
              ))}
            </ol>
            <JourneyCTA to={applicationPath} label="Begin the application" tone="blue" />
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-800">After approval</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Prepare, publish, and support learners</h2>
              <div className="mt-6 space-y-4">
                {[
                  ['Plan your course', 'Set its subject, level, language, objectives, pricing, and estimated duration.'],
                  ['Create lessons', 'Build the course from lessons and learning materials using the teacher tools.'],
                  ['Support student progress', 'Review enrollment and progress, and communicate with enrolled learners through available platform tools.'],
                ].map(([title, text], index) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-black text-amber-800">{index + 1}</span>
                    <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
                  </div>
                ))}
              </div>
              <JourneyCTA to={applicationPath} label="Apply as a course teacher" tone="amber" />
            </div>
            <aside className="overflow-hidden rounded-[2rem] border-8 border-white shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1000&q=85"
                alt="Male educator ready to share his knowledge"
                className="h-[420px] w-full object-cover object-center"
                loading="lazy"
              />
            </aside>
          </section>

          <section className="mt-16 rounded-[2rem] bg-gradient-to-r from-emerald-950 to-slate-900 p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-black sm:text-4xl">Ready to bring your expertise to learners?</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-100">Start the application when you are ready. You can also explore live tutoring as a separate teaching path.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={applicationPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-extrabold text-slate-950 hover:bg-emerald-300">
                {user ? 'Continue your application' : 'Apply to teach courses'} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              </Link>
              <Link to="/become-a-live-tutor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10">
                Explore live tutoring
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default TeacherWelcome
