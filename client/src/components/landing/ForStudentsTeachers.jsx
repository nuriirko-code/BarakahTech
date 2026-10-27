import { Link } from "react-router-dom"

const studentBenefits = [
  "Explore courses across a range of subjects",
  "Find live tutors for one-to-one sessions",
  "Choose learning options that fit your language",
  "Preview course content before enrolling",
  "Review course and session details before you choose",
  "Follow your course progress as you learn",
]

const courseTeacherBenefits = [
  "Create structured courses and lessons",
  "Set course details and pricing",
  "Track student enrollment and progress",
  "Share your knowledge with learners",
]

const tutorBenefits = [
  "Set your weekly availability and session price",
  "Accept one-to-one session bookings",
  "Manage sessions from your tutor dashboard",
  "Build your profile and receive feedback",
]

const ForStudentsTeachers = () => (
  <section className="bg-gray-50 py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Whether You Learn or Teach — We Have You Covered
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <article
          className="relative overflow-hidden rounded-3xl border border-violet-300/70 bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-700 shadow-xl shadow-violet-950/20"
        >
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-violet-200/60" />
            <div className="absolute -right-10 -top-14 h-52 w-52 rounded-full border border-violet-200/40" />
            <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(216,180,254,0.24),transparent_35%)]" />
          </div>

          <div className="relative p-8 sm:p-10">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "rgba(221,214,254,0.18)", color: "#ddd6fe" }}
            >
              <i className="fas fa-graduation-cap" aria-hidden="true" />
              For Students
            </div>

            <h3 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
              Learn Your Way, In Your Language
            </h3>

            <ul className="mb-8 space-y-4">
              {studentBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-sm text-violet-100">
                  <i className="fas fa-check-circle mt-0.5 shrink-0" style={{ color: "#c4b5fd" }} aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Link
              to="/welcome-student"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)" }}
            >
              <i className="fas fa-rocket" aria-hidden="true" />
              Start Learning
            </Link>
          </div>
        </article>

        <div className="space-y-8">
          <article className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "#dcfce7", color: "#15803d" }}
            >
              <i className="fas fa-book-open" aria-hidden="true" />
              Course Teachers
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">Create and Share Courses</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-500">
              Organize your teaching into courses and lessons, and help students learn at their own pace.
            </p>
            <ul className="mb-6 space-y-2">
              {courseTeacherBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                  <i className="fas fa-check text-xs text-green-500" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              to="/register/teacher"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: "#15803d" }}
            >
              Apply as Course Teacher
              <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </article>

          <article
            className="rounded-2xl p-8 text-white transition-all duration-300 hover:shadow-md"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}
          >
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "rgba(139,92,246,0.3)", color: "#c4b5fd" }}
            >
              <i className="fas fa-video" aria-hidden="true" />
              Live Tutors
            </div>
            <h3 className="mb-3 text-xl font-bold">Offer Live Sessions</h3>
            <p className="mb-4 text-sm leading-relaxed text-purple-200">
              Share your expertise in one-to-one sessions and manage bookings through your tutor profile.
            </p>
            <ul className="mb-6 space-y-2">
              {tutorBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-purple-200">
                  <i className="fas fa-check text-xs text-purple-400" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Link
              to="/apply/live-tutor"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-purple-200"
            >
              Apply as Live Tutor
              <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
            </Link>
          </article>
        </div>
      </div>

      <article className="mt-8 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 shadow-sm">
        <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-xl text-amber-800">
              <i className="fas fa-lightbulb" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-800">A future learner opportunity</p>
              <h3 className="mt-2 text-xl font-extrabold text-slate-900">Free entrepreneurship training is planned</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                We plan to offer free entrepreneurship training to enrolled students once course revenue can fund trainers. This is a future goal, not a currently available service.
              </p>
            </div>
          </div>
          <Link
            to="/welcome-student"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
          >
            Explore student learning <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </div>
  </section>
)

export default ForStudentsTeachers
