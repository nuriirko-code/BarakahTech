import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const features = [
  {
    icon: "fa-lightbulb",
    color: "#854d0e",
    bg: "from-amber-100 via-yellow-50 to-orange-200",
    accent: "#f59e0b",
    titleKey: "communityIdeaLabs",
    descriptionKey: "communityIdeaLabsDescription",
    link: "/community",
    linkKey: "exploreCommunity",
  },
  {
    icon: "fa-video",
    color: "#9a3412",
    bg: "from-amber-100 via-orange-50 to-amber-200",
    accent: "#f97316",
    titleKey: "featureLive",
    descriptionKey: "featureLiveDescription",
    link: "/tutors",
    linkKey: "findTutor",
  },
  {
    icon: "fa-book-open",
    color: "#065f46",
    bg: "from-emerald-100 via-green-50 to-teal-200",
    accent: "#10b981",
    titleKey: "featureCourses",
    descriptionKey: "featureCoursesDescription",
    link: "/courses",
    linkKey: "browseCourses",
  },
  {
    icon: "fa-language",
    color: "#1e40af",
    bg: "from-blue-100 via-sky-50 to-indigo-200",
    accent: "#3b82f6",
    titleKey: "featureLanguages",
    descriptionKey: "featureLanguagesDescription",
    link: "/register",
    linkKey: "getStarted",
  },
  {
    icon: "fa-shield-alt",
    color: "#6b21a8",
    bg: "from-violet-100 via-purple-50 to-fuchsia-200",
    accent: "#8b5cf6",
    titleKey: "featureApprovedTutors",
    descriptionKey: "featureApprovedTutorsDescription",
    link: "/tutors",
    linkKey: "meetTutors",
  },
  {
    icon: "fa-mobile-alt",
    color: "#9f1239",
    bg: "from-rose-100 via-pink-50 to-red-200",
    accent: "#f43f5e",
    titleKey: "featureMobile",
    descriptionKey: "featureMobileDescription",
    link: "/register",
    linkKey: "startNow",
  },
  {
    icon: "fa-wallet",
    color: "#854d0e",
    bg: "from-yellow-100 via-amber-50 to-orange-200",
    accent: "#eab308",
    titleKey: "featureAssessments",
    descriptionKey: "featureAssessmentsDescription",
    link: "/courses",
    linkKey: "browseCourses",
  },
  {
    icon: "fa-comments",
    color: "#115e59",
    bg: "from-teal-100 via-cyan-50 to-emerald-200",
    accent: "#14b8a6",
    titleKey: "featureMessaging",
    descriptionKey: "featureMessagingDescription",
    link: "/register",
    linkKey: "getStarted",
  },
]

const allFeatures = [...features, ...features]

const FeaturesCarousel = () => {
  const { t } = useTranslation()
  return (
    <section className="overflow-hidden bg-gray-50 py-20">
      <div className="mx-auto mb-12 max-w-7xl px-6 text-center">
        <span
          className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
        >
          {t('landing.featuresEyebrow')}
        </span>
        <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          {t('landing.featuresHeading')}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-500">
          {t('landing.featuresDescription')}
        </p>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24"
          style={{ background: "linear-gradient(to right, #f9fafb, transparent)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24"
          style={{ background: "linear-gradient(to left, #f9fafb, transparent)" }}
        />

        <div className="animate-scroll-left flex" style={{ width: "max-content" }}>
          {allFeatures.map((feature, index) => (
            <article
              key={`${feature.titleKey}-${index}`}
              className={`group mx-3 flex min-h-[350px] flex-shrink-0 flex-col rounded-3xl border border-white/80 bg-gradient-to-br ${feature.bg} p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
              style={{ width: "360px" }}
            >
              <div
                className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.accent}25` }}
              >
                <i className={`fas ${feature.icon} text-2xl`} style={{ color: feature.color }} aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-extrabold text-slate-900">{t(`landing.${feature.titleKey}`)}</h3>
              <p className="mb-7 flex-1 text-base leading-7 text-slate-700">{t(`landing.${feature.descriptionKey}`)}</p>
              <Link
                to={feature.link}
                className="flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:gap-3"
                style={{ backgroundColor: feature.color }}
              >
                {t(`landing.${feature.linkKey}`)}
                <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesCarousel
