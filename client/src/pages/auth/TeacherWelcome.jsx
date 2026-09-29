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
        <Link to="/register" className="text-sm font-semibold text-green-800 hover:underline">
          Back to role selection
        </Link>

        <header className="mt-8 rounded-2xl bg-green-800 px-7 py-12 text-white sm:px-12 sm:py-16">
          <p className="text-sm font-bold uppercase">BarakahTech Academy</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">Teach on BarakahTech</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-green-50">
            Share what you know, help learners grow, and teach in the way that works for you.
          </p>
          <Link
            to="/register/teacher"
            className="mt-8 inline-flex rounded-lg bg-white px-6 py-3 font-bold text-green-900 transition-colors hover:bg-green-100"
          >
            Start Application
          </Link>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-green-900">Why teach on BarakahTech?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Reach learners looking for practical knowledge and supportive teaching. Share your expertise through live sessions, courses, or both, and teach in the language you choose.
            </p>
          </article>

          <article className="rounded-xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-green-900">What happens after you apply?</h2>
            <p className="mt-4 leading-7 text-gray-600">
              The BarakahTech team reviews your application and qualifications. We will contact you at the email address you provide with our decision. Applications are typically reviewed within 3 to 5 business days.
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-xl bg-white p-7 shadow-sm sm:p-9">
          <h2 className="text-2xl font-bold text-green-900">How the application works</h2>
          <ol className="mt-7 grid gap-6 md:grid-cols-3">
            {applicationSteps.map((step) => (
              <li key={step.number} className="border-l-4 border-green-600 pl-4">
                <span className="text-sm font-bold text-green-700">{step.number}</span>
                <h3 className="mt-2 font-bold">{step.title}</h3>
                <p className="mt-2 leading-6 text-gray-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-xl border border-green-200 bg-green-100 p-7 sm:p-9">
          <h2 className="text-2xl font-bold text-green-900">Teaching and payment</h2>
          <p className="mt-4 max-w-3xl leading-7 text-green-950">
            Teachers can offer live sessions, upload courses, or do both. You can share your availability and, for live sessions, your proposed hourly rate in the application. Payment arrangements and applicable terms will be explained as the platform finalizes your teaching setup.
          </p>
        </section>

        <div className="mt-8 text-center">
          <Link to="/register/teacher" className="inline-flex rounded-lg bg-green-700 px-7 py-3 font-bold text-white hover:bg-green-800">
            Start Application
          </Link>
        </div>
      </div>
    </main>
  )
}

export default TeacherWelcome