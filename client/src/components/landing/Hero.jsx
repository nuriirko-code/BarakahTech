import { Link } from "react-router-dom"

const Hero = () => {
  return (
    <section className="flex-grow overflow-hidden bg-gradient-to-br from-green-50/70 via-white to-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2 lg:px-12 lg:py-24">
        <div className="max-w-2xl">
          <p className="mb-5 border-l-4 border-green-600 pl-3 text-sm font-bold uppercase tracking-widest text-green-800">
            Learn. Grow. Build your future.
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Your place to learn, grow, and build what is next.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            BarakahTech Academy is a learning platform that helps students
            develop practical technology and language skills, with guidance to
            support every step of their learning journey.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-lg bg-green-700 px-6 py-3 text-center font-semibold text-white shadow-md shadow-green-900/10 transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              Start Learning
            </Link>
            <a
              href="#tutors"
              className="rounded-lg border border-green-300 bg-white px-6 py-3 text-center font-semibold text-green-800 transition hover:border-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              Find a Tutor
            </a>
          </div>
        </div>

        <div
          className="relative min-h-80 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-100 via-emerald-50 to-white p-5 shadow-xl shadow-green-950/5 sm:min-h-96 sm:p-8"
          aria-label="Educational visual placeholder"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-300/30" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-green-200/50" />

          <div className="relative flex h-full min-h-64 flex-col justify-between rounded-2xl border border-white/90 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-800">
              BarakahTech Academy
            </p>
            <div>
              <p className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Learn with purpose.
              </p>
              <p className="mt-3 max-w-sm text-gray-600">
                A welcoming visual learning experience will live here soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
