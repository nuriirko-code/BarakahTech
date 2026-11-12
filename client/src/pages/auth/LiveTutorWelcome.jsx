import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import FlipCard from '../../components/common/FlipCard'
import JourneyCTA from '../../components/common/JourneyCTA'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const LiveTutorWelcome = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const copy = t('welcomePages.liveTutor', { returnObjects: true })
  const startPath = user ? '/apply/live-tutor' : '/register/live-tutor'
  const actionLabel = user ? copy.continueAction : copy.createAction

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-violet-50/50 text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8">
          <Link to="/choose-teaching-path" className="inline-flex items-center gap-2 text-sm font-bold text-violet-800 hover:underline">
            <i className="fas fa-arrow-left text-xs" aria-hidden="true" /> {copy.back}
          </Link>

          <header className="relative mt-6 overflow-hidden rounded-[2rem] bg-indigo-950 text-white shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="/images/welcoming-teacher.png"
                alt=""
                className="absolute right-0 h-full w-full object-cover object-center opacity-30 sm:w-3/5 sm:opacity-65"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/90 to-indigo-950/15" />
              <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border border-violet-200/20" />
            </div>
            <div className="relative max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/30 bg-violet-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                <i className="fas fa-video" aria-hidden="true" /> {copy.badge}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">{copy.headingLine1}<br />{copy.headingLine2}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg sm:leading-8">
                {copy.description}
              </p>
              <Link to={startPath} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-300 px-6 py-3.5 font-extrabold text-indigo-950 shadow-lg transition hover:bg-violet-200">
                {actionLabel} <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-800">{copy.benefitsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.benefitsHeading}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.benefitsDescription}</p>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {copy.benefits.map((benefit) => <FlipCard key={benefit.title} {...benefit} />)}
            </div>
            <JourneyCTA to={startPath} label={actionLabel} tone="violet" />
          </section>

          <section className="mt-16 rounded-[2rem] border border-violet-100 bg-white p-7 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-800">{copy.stepsEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.stepsHeading}</h2>
              <p className="mt-4 leading-7 text-slate-600">{copy.stepsDescription}</p>
            </div>
            <ol className="mt-8 space-y-4">
              {copy.steps.map(([number, title, description], index) => (
                <li key={number} className="flex gap-4 rounded-2xl bg-violet-50/70 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-200 font-black text-violet-900">{number}</span>
                  <div className="flex-1"><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
                  {index === copy.steps.length - 1 && <i className="fas fa-check-circle mt-1 text-emerald-600" aria-hidden="true" />}
                </li>
              ))}
            </ol>
            <JourneyCTA to={startPath} label={copy.beginAction} tone="blue" />
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
            <aside className="relative h-[420px] overflow-hidden rounded-[2rem] border-8 border-white shadow-xl">
              <img src="/images/student-welcoming.png" alt={copy.imageAlt} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/85 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-8 text-white">
                <p className="text-lg font-bold">{copy.imageCaption}</p>
              </div>
            </aside>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-800">{copy.prepareEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">{copy.prepareHeading}</h2>
              <div className="mt-6 space-y-4">
                {copy.prepareSteps.map(([title, text]) => (
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
            <h2 className="text-3xl font-black sm:text-4xl">{copy.finalHeading}</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-violet-100">{copy.finalDescription}</p>
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
