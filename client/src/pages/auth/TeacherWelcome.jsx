import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-green-50 px-5 py-12 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/choose-teaching-path" className="inline-flex items-center gap-2 text-sm font-semibold text-[#15803D] hover:underline">
          <i className="fas fa-arrow-left text-xs" aria-hidden="true" />
          Back to teaching paths
        </Link>

        <header className="mt-8 rounded-2xl bg-slate-900 px-7 py-12 text-white sm:px-12 sm:py-16">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#86EFAC]">
            <i className="fas fa-graduation-cap" aria-hidden="true" />
            Barakah Academy
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Create courses that help learners grow</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-50">
            Organize your expertise into structured courses that learners can follow at their own pace.
          </p>
          <Link
            to="/register/teacher"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 font-bold text-slate-950 transition-colors hover:bg-[#86EFAC]"
          >
            <i className="fas fa-arrow-right" aria-hidden="true" />
            {user ? 'Continue with my account' : 'Start Application'}
          </Link>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Why teach on Barakah Academy?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Reach learners looking for practical knowledge and supportive teaching. Build clear lessons, share your expertise, and help learners progress over time.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">What happens after you apply?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              The Barakah Academy team reviews your application and qualifications. We will contact you at the email address you provide with our decision. Applications are typically reviewed within 3 to 5 business days.
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
            This application is for structured course teaching. You can add live tutoring through the separate live-tutor application later, using the same Barakah Academy account and profile.
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link to="/register/teacher" className="inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-7 py-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
            <i className="fas fa-arrow-right" aria-hidden="true" />
            {user ? 'Continue with my account' : 'Start Application'}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default TeacherWelcome
