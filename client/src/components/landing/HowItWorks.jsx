const steps = [
  {
    title: "Discover",
    description: "Find a course or tutor that matches your learning goal.",
  },
  {
    title: "Learn",
    description:
      "Enroll in a structured course or join a live one-to-one or group session.",
  },
  {
    title: "Progress",
    description:
      "Track your learning and keep improving with guidance from your teacher.",
  },
  {
    title: "Complete",
    description:
      "Complete your learning journey and, where applicable, receive BarakahTech Academy certification.",
  },
]

const HowItWorks = () => {
  return (
    <section className="bg-green-50 px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-bold uppercase tracking-widest text-green-800">
            Your Learning Journey
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            A clear path from finding the right learning opportunity to
            achieving your goals.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-10 hidden h-px bg-green-200 lg:block" />

          {steps.map((step, index) => (
            <article
              key={step.title}
              className="relative rounded-2xl border border-green-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
            >
              <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-base font-bold text-white shadow-md shadow-green-900/15">
                0{index + 1}
              </span>
              <h3 className="mt-6 text-xl font-bold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-3 leading-7 text-gray-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
