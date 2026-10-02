// This dashboard shell will grow into a student learning home with courses,
// progress, and upcoming tutoring sessions.
const StudentDashboard = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12 text-slate-900">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]" aria-hidden="true">
          <i className="fas fa-user-graduate" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
        <p className="mt-3 text-slate-500">Your learning home is being prepared.</p>
      </section>
    </main>
  )
}

export default StudentDashboard
