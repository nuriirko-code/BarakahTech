import { Link } from 'react-router-dom'

const applicationSteps = [
  {
    number: '01',
    title: 'Tell us about yourself',
    description: 'Share your experience, qualifications, subjects, and availability.',
  },
  {
    number: '02',
    title: 'Show your subject knowledge',
    description: 'Answer a short set of questions related to the subject you teach.',
  },
  {
    number: '03',
    title: 'Our team reviews your application',
    description: 'We review your information and contact you with the decision.',
  },
]

// This introduction helps prospective teachers understand the platform and
// review process before they begin the detailed application form.
const TeacherWelcome = () => {
  return (
    <main className="min-h-screen bg-green-50 px-5 py-12 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/register" className="inline-flex items-center gap-2 text-sm font-semibold text-[#15803D] hover:underline">
          <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
          Back to role selection
        </Link>

        <header className="mt-8 rounded-2xl bg-slate-900 px-7 py-12 text-white sm:px-12 sm:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#86EFAC]">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
            BarakahTech Academy
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Teach on BarakahTech</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-50">
            Share what you know, help learners grow, and teach in the way that works for you.
          </p>
          <Link
            to="/register/teacher"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 font-bold text-slate-950 transition-colors hover:bg-[#86EFAC]"
          >
            <i className="fas fa-arrow-right" aria-hidden="true" />
            Start Application
          </Link>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Why teach on BarakahTech?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Reach learners looking for practical knowledge and supportive teaching. Share your expertise through live sessions, courses, or both, and teach in the language you choose.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">What happens after you apply?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              The BarakahTech team reviews your application and qualifications. We will contact you at the email address you provide with our decision. Applications are typically reviewed within 3 to 5 business days.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">How the application works</h2>
          <ol className="mt-7 grid gap-6 md:grid-cols-3">
            {applicationSteps.map((step) => (
              <li key={step.number} className="border-l-4 border-[#22C55E] pl-4">
                <span className="text-sm font-bold text-[#16A34A]">{step.number}</span>
                <h3 className="mt-2 font-bold">{step.title}</h3>
                <p className="mt-2 leading-6 text-gray-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-2xl border border-[#22C55E]/20 bg-[#F0FDF4] p-7 sm:p-9">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Teaching and payment</h2>
          <p className="mt-4 max-w-3xl leading-7 text-slate-700">
            Teachers can offer live sessions, upload courses, or do both. You can share your availability and, for live sessions, your proposed hourly rate in the application. Payment arrangements and applicable terms will be explained as the platform finalizes your teaching setup.
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link to="/register/teacher" className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-7 py-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
            <i className="fas fa-arrow-right" aria-hidden="true" />
            Start Application
          </Link>
        </div>
      </div>
    </main>
  )
}

export default TeacherWelcome