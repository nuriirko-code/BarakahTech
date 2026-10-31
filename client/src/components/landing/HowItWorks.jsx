import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const steps = [
  {
    number: "01",
    icon: "fa-user-plus",
    titleKey: "howAccountTitle",
    descriptionKey: "howAccountDescription",
    color: "#f59e0b",
  },
  {
    number: "02",
    icon: "fa-search",
    titleKey: "howMatchTitle",
    descriptionKey: "howMatchDescription",
    color: "#10b981",
  },
  {
    number: "03",
    icon: "fa-graduation-cap",
    titleKey: "howLearnTitle",
    descriptionKey: "howLearnDescription",
    color: "#3b82f6",
  },
]

const HowItWorks = () => {
  const { t } = useTranslation()
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
          >
            {t('landing.howEyebrow')}
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('landing.howHeading')}
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            {t('landing.howDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.number} className="group flex gap-6">
                <div className="shrink-0">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mx-auto mt-2 h-8 w-0.5" style={{ backgroundColor: `${step.color}40` }} />
                  )}
                </div>

                <div className="pt-2">
                  <div className="mb-2 flex items-center gap-2">
                    <i className={`fas ${step.icon}`} style={{ color: step.color }} aria-hidden="true" />
                    <h3 className="text-xl font-bold text-gray-900">{t(`landing.${step.titleKey}`)}</h3>
                  </div>
                  <p className="leading-relaxed text-gray-500">{t(`landing.${step.descriptionKey}`)}</p>
                </div>
              </div>
            ))}

            <Link
              to="/register"
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "#0a2416" }}
            >
              <i className="fas fa-rocket" aria-hidden="true" />
              {t('landing.getStartedFree')}
            </Link>
          </div>

          <div className="relative">
            <div className="relative h-96 overflow-hidden rounded-2xl shadow-2xl">
              <img src="/images/community-learning.png" alt="Learners working together in a community learning session" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2416]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-7 text-white">
                <i className="fas fa-people-group text-3xl text-amber-300" aria-hidden="true" />
                <p className="mt-3 text-lg font-bold">{t('landing.communityLearningLabel')}</p>
              </div>
            </div>

            <div
              className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full opacity-20"
              style={{ backgroundColor: "#f59e0b" }}
            />
            <div
              className="absolute -bottom-4 -left-4 -z-10 h-16 w-16 rounded-full opacity-20"
              style={{ backgroundColor: "#10b981" }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
