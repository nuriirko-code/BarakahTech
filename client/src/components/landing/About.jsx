const pillars = [
  {
    title: "Structured Tech & Language Paths",
    description:
      "Build confidence through clear learning paths designed around practical, useful skills.",
  },
  {
    title: "Interactive Group & Live Learning",
    description:
      "Learn alongside others, ask questions, and stay motivated through shared learning experiences.",
  },
  {
    title: "Verified Tutors & Mentorship",
    description:
      "Get personalized guidance from trusted tutors who help you make meaningful progress.",
  },
]

const About = () => {
  return (
    <section className="bg-white px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold uppercase tracking-widest text-green-800">
            About BarakahTech Academy
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Empowering Students Through Practical Education
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            BarakahTech Academy is built to bridge the gap between education
            and real-world skills. Whether you are mastering full-stack web
            development, learning English for your career, or preparing for
            academic success, our platform provides structured guidance,
            interactive group learning, and personalized tutor support.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-green-100 bg-emerald-50/60 p-7 shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-800">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                {pillar.title}
              </h3>
              <p className="mt-3 leading-7 text-gray-600">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
