import { Link } from "react-router-dom"

const steps = [
  {
    number: "01",
    icon: "fa-user-plus",
    title: "Create Your Account",
    description: "Create an account and choose the learning or teaching path that fits you.",
    color: "#f59e0b",
  },
  {
    number: "02",
    icon: "fa-search",
    title: "Find Your Match",
    description: "Browse published courses or view live tutor profiles and current booking availability.",
    color: "#10b981",
  },
  {
    number: "03",
    icon: "fa-graduation-cap",
    title: "Start Learning Today",
    description: "Choose a published course or book an available live tutoring session.",
    color: "#3b82f6",
  },
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
          >
            Simple Process
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            How Barakah Academy Works
          </h2>
          <p className="mx-auto max-w-xl text-lg text-gray-500">
            Explore current courses and available tutoring options in three steps.
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
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="leading-relaxed text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}

            <Link
              to="/register"
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: "#0a2416" }}
            >
              <i className="fas fa-rocket" aria-hidden="true" />
              Get Started Free
            </Link>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/One_Laptop_Per_Child_-_Menelik_II_teacher_training_%28by%29.jpg/960px-One_Laptop_Per_Child_-_Menelik_II_teacher_training_%28by%29.jpg"
                alt="Teacher supporting students using laptops at Menelik II School in Ethiopia"
                className="h-96 w-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-right text-xs text-gray-500">
              Photo:{' '}
              <a
                href="https://commons.wikimedia.org/wiki/File:One_Laptop_Per_Child_-_Menelik_II_teacher_training_(by).jpg"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
              >
                ComputerHotline / Wikimedia Commons (CC BY 2.0)
              </a>
            </p>

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
