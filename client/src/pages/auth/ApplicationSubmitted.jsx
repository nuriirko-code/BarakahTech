import { Link } from 'react-router-dom'

// A dedicated confirmation page gives applicants a stable destination and
// explains the review process after the application has been saved.
const ApplicationSubmitted = () => {
  return (
    <main className="min-h-screen bg-green-50 px-6 py-12 text-gray-900">
      <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
        <span className="text-6xl" role="img" aria-label="Success">✅</span>
        <h1 className="mt-6 text-3xl font-bold text-green-900">Application Submitted Successfully</h1>
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
          <Link to="/login" className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
            Return to Login
          </Link>
          <Link to="/" className="rounded-lg border border-green-700 px-5 py-3 font-semibold text-green-800 hover:bg-green-50">
            Return to Home
          </Link>
        </div>
      </section>
    </main>
  )
}

export default ApplicationSubmitted