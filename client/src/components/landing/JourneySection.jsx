import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const steps = [
  { key: 'brainstorm', icon: 'fa-lightbulb', link: '/community' },
  { key: 'analyze', icon: 'fa-magnifying-glass-chart', link: '/community' },
  { key: 'learn', icon: 'fa-graduation-cap', link: '/courses' },
  { key: 'build', icon: 'fa-hammer', link: '/tutors' },
  { key: 'launch', icon: 'fa-briefcase', link: '/community' },
  { key: 'liveBetter', icon: 'fa-heart', link: '/courses' },
  { key: 'joinUs', icon: 'fa-users', link: '/register' },
]

const JourneySection = () => {
  const { t } = useTranslation()

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-emerald-800">{t('journey.eyebrow')}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t('journey.heading')}</h2>
          <p className="mt-4 leading-7 text-slate-600">{t('journey.description')}</p>
      </div>

      <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {steps.map((step, index) => (
          <article key={step.key} className="group relative rounded-2xl border border-white bg-white p-5 pt-7 shadow-[0_12px_35px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_45px_rgba(15,23,42,0.16)]">
            <span className="absolute -top-4 left-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-400 text-sm font-black text-[#0a2416] shadow-md transition group-hover:scale-110">
              {index + 1}
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 shadow-inner">
              <i className={`fas ${step.icon} text-xl text-emerald-800`} aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">{t(`journey.${step.key}`)}</h3>
            <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">{t(`journey.${step.key}Description`)}</p>
            <Link to={step.link} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">
              {t(`journey.${step.key}Link`)}<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
    </section>
  )
}

export default JourneySection
