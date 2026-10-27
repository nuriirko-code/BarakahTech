import { Link } from "react-router-dom"

const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1920&q=85"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(110deg, rgba(10,36,22,0.88) 0%, rgba(5,98,62,0.74) 58%, rgba(30,27,75,0.48) 100%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <span
          className="mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
          style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
        >
          Start Today
        </span>

        <h2 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
          Your Learning Journey
          <br />
          <span style={{ color: "#f59e0b" }}>Starts Right Here</span>
        </h2>

        <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-gray-300">
          Create an account to get started, or browse the published courses before you choose.
        </p>

        <div className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/register"
            className="rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-green-900"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
          >
            <i className="fas fa-rocket mr-2" aria-hidden="true" />
            Create an Account
          </Link>
          <Link
            to="/courses"
            className="rounded-xl border-2 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-900"
            style={{ borderColor: "rgba(255,255,255,0.4)" }}
          >
            <i className="fas fa-compass mr-2" aria-hidden="true" />
            Explore Courses First
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FinalCTA
