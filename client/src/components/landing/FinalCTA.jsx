import { Link } from "react-router-dom"

const FinalCTA = () => {
  return (
    <section className="overflow-hidden bg-slate-900 px-6 py-16 text-white sm:px-10 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-5xl px-2 py-4 text-center sm:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-[#86EFAC]">
            Your next step starts here
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Begin building the skills that move you forward.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Join BarakahTech Academy and take the next meaningful step in your
            learning journey.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="rounded-xl bg-[#22C55E] px-6 py-3 font-bold text-slate-950 shadow-md shadow-[#22C55E]/20 transition hover:bg-[#86EFAC] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Start Learning
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white transition hover:border-slate-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2 focus:ring-offset-slate-900"
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
