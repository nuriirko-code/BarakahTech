// This page will show a searchable marketplace of approved live tutors.
// Students will later filter by subject, language, price, and availability,
// then review each tutor's public profile before booking a live session.
const FindTutor = () => {
  return (
    <section className="mx-auto max-w-5xl p-6 sm:p-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-7 shadow-sm sm:p-9">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <i className="fas fa-magnifying-glass" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Find a Tutor</h1>
        <p className="mt-2 max-w-xl leading-7 text-slate-600">
          Browse qualified live tutors by subject, language, price, and availability — coming soon.
        </p>
      </div>
    </section>
  )
}

export default FindTutor
