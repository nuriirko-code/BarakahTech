import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import FlipCard from '../../components/common/FlipCard'
import JourneyCTA from '../../components/common/JourneyCTA'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const StudentWelcome = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const copy = t('welcomePages.student', { returnObjects: true })
  const startPath = user?.role === 'student' ? '/dashboard/student' : '/register/student'
  const actionLabel = user?.role === 'student' ? copy.dashboardAction : copy.createAction

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
          <Link to="/register" className="inline-flex items-center gap-2 text-sm font-bold text-violet-800 hover:underline">
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> {copy.registrationChoices}
          </Link>

          <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-700 text-white shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="/images/student-welcoming.png"
                alt=""
                className="absolute right-0 h-full w-full object-cover object-center opacity-25 sm:w-3/5 sm:opacity-55"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/85 to-indigo-950/20" />
              <div className="absolute -bottom-32 left-1/2 h-96 w-96 rounded-full bg-fuchsia-400/15 blur-3xl" />
            </div>
            <div className="relative max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/30 bg-violet-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-100">
                <i className="fas fa-graduation-cap" aria-hidden="true" /> {copy.badge}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">{copy.headingLine1}<br />{copy.headingLine2}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100 sm:text-lg sm:leading-8">
                {copy.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={startPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-violet-950 shadow-lg transition hover:bg-violet-50">
                  {actionLabel} <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
                </Link>
                <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/35 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                  {copy.browseCourses}
                </Link>
              </div>
            </div>
          </header>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-800">{copy.supportEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.supportHeading}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.supportDescription}</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {copy.benefits.map((benefit) => <FlipCard key={benefit.title} {...benefit} />)}
            </div>
            <JourneyCTA to={startPath} label={actionLabel} tone="violet" />
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">{copy.stepsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.stepsHeading}</h2>
              <ol className="mt-7 space-y-4">
                {copy.steps.map(([number, title, description]) => (
                  <li key={number} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-emerald-800">{number}</span>
                    <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>
                  </li>
                ))}
              </ol>
              <JourneyCTA to={startPath} label={actionLabel} tone="emerald" />
            </div>
            <aside className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-indigo-950 shadow-xl">
              <img src="/images/welcoming-teacher.png" alt={copy.teacherImageAlt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/20 to-transparent" />
              <div className="absolute bottom-0 p-7 text-white sm:p-9">
                <p className="text-sm font-bold uppercase tracking-widest text-violet-200">{copy.paceTitle}</p>
                <p className="mt-2 max-w-sm text-2xl font-extrabold">{copy.paceDescription}</p>
              </div>
            </aside>
          </section>

          <section className="mt-16 rounded-[2rem] border border-violet-200 bg-gradient-to-r from-violet-100 via-white to-indigo-100 p-8 sm:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-200 text-2xl text-violet-800"><i className="fas fa-compass" aria-hidden="true" /></span>
              <h2 className="mt-5 text-3xl font-black sm:text-4xl">{copy.exploreHeading}</h2>
              <p className="mt-4 leading-7 text-slate-600">{copy.exploreDescription}</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={startPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-800 px-6 py-3 font-extrabold text-white transition hover:bg-violet-900">
                  {actionLabel} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                </Link>
                <Link to="/tutors" className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300 bg-white px-6 py-3 font-bold text-violet-900 hover:bg-violet-50">
                  {copy.findTutor}
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-800">{copy.futureEyebrow}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{copy.futureHeading}</h2>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-700">
              {copy.futureDescription}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default StudentWelcome
