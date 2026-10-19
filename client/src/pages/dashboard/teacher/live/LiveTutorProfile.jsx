// Public profile management page for approved live tutors. It will eventually
// let tutors update the public information students see while browsing tutors.
const LiveTutorProfile = () => {
  return (
    <section className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <i className="fas fa-id-card text-lg" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">Live tutoring</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Tutor Profile</h1>
        </div>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <i className="fas fa-user-pen text-4xl text-slate-300" aria-hidden="true" />
        <p className="mt-4 text-base font-semibold text-slate-800">Profile editor is coming next.</p>
        <p className="mt-2 text-sm text-slate-500">You will be able to update your bio, approach, rates, and introduction video.</p>
      </div>
    </section>
  )
}

export default LiveTutorProfile
