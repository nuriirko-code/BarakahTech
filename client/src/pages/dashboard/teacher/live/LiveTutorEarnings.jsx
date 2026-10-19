// Earnings page for approved live tutors. It will keep session income, payout
// totals, and feedback-release status separate from course earnings.
const LiveTutorEarnings = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <i className="fas fa-coins text-lg" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">Live tutoring</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Live Tutor Earnings</h1>
        </div>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <i className="fas fa-chart-line text-4xl text-slate-300" aria-hidden="true" />
        <p className="mt-4 text-base font-semibold text-slate-800">No live-tutoring earnings yet.</p>
        <p className="mt-2 text-sm text-slate-500">Earnings will appear here after your first completed session.</p>
      </div>
    </section>
  )
}

export default LiveTutorEarnings
