const features = [
  {
    title: "Structured Course Learning",
    description:
      "A course experience designed for teachers to organize lessons and modules while students follow a clear learning path.",
    label: "Courses",
  },
  {
    title: "Live Tutoring",
    description:
      "A flexible learning model planned to support one-to-one and small-group sessions with teachers.",
    label: "Live",
  },
  {
    title: "Teacher Marketplace",
    description:
      "A space envisioned for qualified teachers to share their expertise, availability, and teaching services with learners.",
    label: "Teachers",
  },
  {
    title: "Progress & Certification",
    description:
      "Tools designed to help students follow progress toward completion and earn BarakahTech Academy certification where applicable.",
    label: "Progress",
  },
]

const Features = () => {
  return (
    <section className="bg-gradient-to-b from-white to-emerald-50/70 px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="max-w-xl">
            <p className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold uppercase tracking-widest text-green-800">
              Platform Vision
            </p>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built around every part of the learning experience.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-gray-600 lg:justify-self-end">
            BarakahTech Academy is being shaped to make learning more
            structured, personal, and measurable for both students and
            teachers.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-green-100 bg-white/90 p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="inline-flex rounded-lg bg-green-100 px-3 py-2 text-sm font-bold text-green-800 transition group-hover:bg-green-700 group-hover:text-white">
                {feature.label}
              </span>
              <h3 className="mt-6 text-xl font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
