import { Link } from 'react-router-dom'

// This page separates two teaching capabilities without creating two accounts.
// An account can apply for the other capability later from its dashboard.
const TeachingPathSelection = () => (
  <main className="min-h-screen bg-green-50 px-5 py-12 text-slate-900 sm:px-8">
    <section className="mx-auto max-w-5xl">
      <Link to="/register" className="inline-flex items-center gap-2 text-base font-semibold text-[#15803D] hover:underline">
        <i className="fas fa-arrow-left text-sm" aria-hidden="true" /> Back to registration choices
      </Link>
      <header className="mt-8 max-w-3xl">
        <p className="text-base font-bold text-[#15803D]">Teach on BarakahTech Academy</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Choose how you want to teach</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">You need only one account. You can apply for the other teaching path later if your goals change.</p>
      </header>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600"><i className="fas fa-book-open" aria-hidden="true" /></span>
          <h2 className="mt-6 text-2xl font-extrabold">Create structured courses</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">Organize lessons, publish courses, and help students learn at their own pace.</p>
          <Link to="/become-a-teacher" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-base font-bold text-white transition hover:bg-[#16A34A]">Explore course teaching <i className="fas fa-arrow-right text-sm" aria-hidden="true" /></Link>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-white p-7 shadow-sm sm:p-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]"><i className="fas fa-video" aria-hidden="true" /></span>
          <h2 className="mt-6 text-2xl font-extrabold">Teach live sessions</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">Teach learners one-to-one or in small groups through scheduled live sessions.</p>
          <Link to="/become-a-live-tutor" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 text-base font-bold text-white transition hover:bg-[#16A34A]">Explore live tutoring <i className="fas fa-arrow-right text-sm" aria-hidden="true" /></Link>
        </article>
      </div>
    </section>
  </main>
)

export default TeachingPathSelection
