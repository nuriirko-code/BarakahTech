import { Link } from 'react-router-dom'

// A dedicated confirmation page gives applicants a stable destination and
// explains the review process after the application has been saved.
const ApplicationSubmitted = () => {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0FDF4] text-3xl text-[#16A34A]" role="img" aria-label="Success">
          <i className="fas fa-circle-check" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">Application Submitted Successfully</h1>
        <p className="mt-3 text-lg text-gray-700">Thank you for applying to teach on BarakahTech Academy</p>

        <p className="mt-6 text-left leading-7 text-gray-600">
          Our team will carefully review your application and qualifications. This process typically takes 3 to 5 business days.
        </p>
        <p className="mt-4 text-left leading-7 text-gray-600">
          We will contact you at the email address you provided with our decision. If approved, you will gain immediate access to your teacher dashboard.
        </p>

        <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <span className="font-semibold">Application Status:</span> Under Review
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login" className="rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#16A34A]">
            Return to Login
          </Link>
          <Link to="/" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
            Return to Home
          </Link>
        </div>
      </section>
    </main>
  )
}

export default ApplicationSubmitted