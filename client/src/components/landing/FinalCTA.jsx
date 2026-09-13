import { Link } from "react-router-dom"

const FinalCTA = () => {
  return (
    <section className="overflow-hidden bg-green-800 px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-green-600 bg-green-700 px-6 py-14 text-center shadow-xl shadow-green-950/20 sm:px-12">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-green-400/20" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-green-950/20" />

        <div className="relative mx-auto max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-green-100">
            Your next step starts here
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Begin building the skills that move you forward.
          </h2>
          <p className="mt-5 text-lg leading-8 text-green-50">
            Join BarakahTech Academy and take the next meaningful step in your
            learning journey.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-green-800 shadow-sm transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700"
            >
              Start Learning
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-green-300 px-6 py-3 font-semibold text-white transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-700"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
