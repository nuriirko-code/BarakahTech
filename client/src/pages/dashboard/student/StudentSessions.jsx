// This page will show upcoming, booked, and completed live tutoring sessions.
// Each session will later include the tutor, subject, date, duration, and its
// current booking status so students can manage their live-learning schedule.
const StudentSessions = () => {
  return (
    <section className="mx-auto max-w-5xl p-6 sm:p-8">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-7 shadow-sm sm:p-9">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
          <i className="fas fa-video" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">My Sessions</h1>
        <p className="mt-2 max-w-xl leading-7 text-slate-600">
          Your upcoming and past live tutoring sessions will appear here.
        </p>
      </div>
    </section>
  )
}

export default StudentSessions
