const studentOpportunities = [
  "Discover courses that match your goals",
  "Enroll in structured learning paths",
  "Find teachers for additional guidance",
  "Join one-to-one or group learning sessions",
  "Track progress as your skills develop",
]

const teacherOpportunities = [
  "Share expertise with motivated learners",
  "Create structured courses and learning paths",
  "Offer live one-to-one or group teaching",
  "Manage teaching availability with confidence",
  "Reach learners looking for your knowledge",
]

const ForStudentsTeachers = () => {
  return (
    <section className="bg-emerald-50 px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold uppercase tracking-widest text-green-800 shadow-sm">
            Built for Learning Together
          </p>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            One platform, two ways to grow.
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray-600">
            BarakahTech Academy is being shaped to help learners build skills
            and give teachers a meaningful place to share knowledge.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-[#16A34A]">
              For Students
            </p>
            <h3 className="mt-4 text-3xl font-bold text-gray-900">
              Learn with a path that fits you.
            </h3>
            <p className="mt-4 leading-7 text-gray-600">
              Find the right learning opportunity and keep moving forward with
              structure, support, and progress you can follow.
            </p>
            <ul className="mt-7 space-y-4">
              {studentOpportunities.map((opportunity) => (
                <li key={opportunity} className="flex gap-3 text-gray-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                  {opportunity}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[#22C55E]/30 border-l-4 border-l-[#22C55E] bg-white p-8 shadow-sm sm:p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-[#16A34A]">
              For Teachers
            </p>
            <h3 className="mt-4 text-3xl font-bold text-slate-900">
              Turn your knowledge into impact.
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              Share what you know through courses and live learning experiences
              designed to reach the students who need you.
            </p>
            <ul className="mt-7 space-y-4">
              {teacherOpportunities.map((opportunity) => (
                <li key={opportunity} className="flex gap-3 text-slate-700">
                  <i className="fas fa-circle-check mt-1 shrink-0 text-sm text-[#22C55E]" aria-hidden="true" />
                  {opportunity}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ForStudentsTeachers
