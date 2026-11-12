import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import FlipCard from '../../components/common/FlipCard'
import JourneyCTA from '../../components/common/JourneyCTA'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const TeacherWelcome = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const copy = t('welcomePages.teacher', { returnObjects: true })
  const applicationPath = '/register/teacher'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
          <Link to="/choose-teaching-path" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline">
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> {copy.back}
          </Link>

          <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="/images/welcoming-teacher.png"
                alt=""
                className="absolute right-0 h-full w-full object-cover object-center opacity-35 sm:w-3/5 sm:opacity-70"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/15" />
            </div>
            <div className="relative max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                <i className="fas fa-chalkboard-user" aria-hidden="true" /> {copy.badge}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">{copy.headingLine1}<br />{copy.headingLine2}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
                {copy.description}
              </p>
              <Link to={applicationPath} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 font-extrabold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300">
                {user ? copy.continueAction : copy.startAction}
                <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">{copy.benefitsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.benefitsHeading}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.benefitsDescription}</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {copy.benefits.map((benefit) => <FlipCard key={benefit.title} {...benefit} />)}
            </div>
            <JourneyCTA to={applicationPath} label={user ? copy.continueAction : copy.applyAction} />
          </section>

          <section className="mt-16 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-800">{copy.stepsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.stepsHeading}</h2>
              <p className="mt-4 leading-7 text-slate-600">{copy.stepsDescription}</p>
            </div>
            <ol className="mt-8 grid gap-5 md:grid-cols-2">
              {copy.steps.map(([number, title, description]) => (
                <li key={number} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-800">{number}</span>
                  <div><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
                </li>
              ))}
            </ol>
            <JourneyCTA to={applicationPath} label={copy.beginAction} tone="blue" />
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-800">{copy.afterEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.afterHeading}</h2>
              <div className="mt-6 space-y-4">
                {copy.afterSteps.map(([title, text], index) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-black text-amber-800">{index + 1}</span>
                    <div><h3 className="font-extrabold">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></div>
                  </div>
                ))}
              </div>
              <JourneyCTA to={applicationPath} label={copy.applyAction} tone="amber" />
            </div>
            <aside className="relative h-[420px] overflow-hidden rounded-[2rem] border-8 border-white shadow-xl">
              <img src="/images/welcoming-teacher.png" alt={copy.imageAlt} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-8 text-white">
                <p className="text-lg font-bold">{copy.imageCaption}</p>
              </div>
            </aside>
          </section>

          <section className="mt-16 rounded-[2rem] bg-gradient-to-r from-emerald-950 to-slate-900 p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-black sm:text-4xl">{copy.finalHeading}</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-emerald-100">{copy.finalDescription}</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={applicationPath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 font-extrabold text-slate-950 hover:bg-emerald-300">
                {user ? copy.continueAction : copy.applyAction} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              </Link>
              <Link to="/become-a-live-tutor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10">
                {copy.exploreTutorAction}
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
