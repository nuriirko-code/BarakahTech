import { Link } from "react-router-dom"

const features = [
  {
    icon: "fa-video",
    color: "#9a3412",
    bg: "from-amber-100 via-orange-50 to-amber-200",
    accent: "#f97316",
    title: "Live 1-on-1 Sessions",
    description: "Book real-time sessions with expert tutors. Learn at your pace with personalized attention.",
    link: "/tutors",
    linkText: "Find a Tutor",
  },
  {
    icon: "fa-book-open",
    color: "#065f46",
    bg: "from-emerald-100 via-green-50 to-teal-200",
    accent: "#10b981",
    title: "Structured Courses",
    description: "Follow a clear learning path with video lessons, assessments, and progress tracking.",
    link: "/courses",
    linkText: "Browse Courses",
  },
  {
    icon: "fa-language",
    color: "#1e40af",
    bg: "from-blue-100 via-sky-50 to-indigo-200",
    accent: "#3b82f6",
    title: "Language Information",
    description: "Check the languages listed on course and tutor profiles before choosing.",
    link: "/register",
    linkText: "Get Started",
  },
  {
    icon: "fa-shield-alt",
    color: "#6b21a8",
    bg: "from-violet-100 via-purple-50 to-fuchsia-200",
    accent: "#8b5cf6",
    title: "Approved Tutors",
    description: "Live tutor profiles are published after application review.",
    link: "/tutors",
    linkText: "Meet Tutors",
  },
  {
    icon: "fa-mobile-alt",
    color: "#9f1239",
    bg: "from-rose-100 via-pink-50 to-red-200",
    accent: "#f43f5e",
    title: "Mobile Friendly",
    description: "Learn from any device. Fully responsive design for phone, tablet, and desktop.",
    link: "/register",
    linkText: "Start Now",
  },
  {
    icon: "fa-wallet",
    color: "#854d0e",
    bg: "from-yellow-100 via-amber-50 to-orange-200",
    accent: "#eab308",
    title: "Course Assessments",
    description: "Work through course lessons and their assessments.",
    link: "/courses",
    linkText: "Browse Courses",
  },
  {
    icon: "fa-comments",
    color: "#115e59",
    bg: "from-teal-100 via-cyan-50 to-emerald-200",
    accent: "#14b8a6",
    title: "In-Platform Messaging",
    description: "Message teachers and tutors through the platform.",
    link: "/register",
    linkText: "Get Started",
  },
]

const allFeatures = [...features, ...features]

const FeaturesCarousel = () => {
  return (
    <section className="overflow-hidden bg-gray-50 py-20">
      <div className="mx-auto mb-12 max-w-7xl px-6 text-center">
        <span
          className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
        >
          Why Barakah Academy
        </span>
        <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Everything You Need to Learn and Teach
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-500">
          One platform. All subjects. Your language. Built for learners everywhere.
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
              key={`${feature.title}-${index}`}
              className={`group mx-3 flex min-h-[350px] flex-shrink-0 flex-col rounded-3xl border border-white/80 bg-gradient-to-br ${feature.bg} p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
              style={{ width: "360px" }}
            >
              <div
                className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.accent}25` }}
              >
                <i className={`fas ${feature.icon} text-2xl`} style={{ color: feature.color }} aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-extrabold text-slate-900">{feature.title}</h3>
              <p className="mb-7 flex-1 text-base leading-7 text-slate-700">{feature.description}</p>
              <Link
                to={feature.link}
                className="flex w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:gap-3"
                style={{ backgroundColor: feature.color }}
              >
                {feature.linkText}
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
