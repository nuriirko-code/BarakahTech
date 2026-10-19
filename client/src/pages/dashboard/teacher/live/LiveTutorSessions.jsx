// Session management page for approved live tutors. It will eventually show
// upcoming bookings, session-room access, and completed-session history.
const LiveTutorSessions = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <i className="fas fa-video text-lg" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">Live tutoring</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Live Sessions</h1>
        </div>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <i className="fas fa-video-slash text-4xl text-slate-300" aria-hidden="true" />
        <p className="mt-4 text-base font-semibold text-slate-800">No sessions yet.</p>
        <p className="mt-2 text-sm text-slate-500">Set your availability to start receiving bookings.</p>
      </div>
    </section>
  )
}

export default LiveTutorSessions
