import { Link } from 'react-router-dom'

// This is a placeholder for the future teacher application flow, which will
// collect detailed qualifications, experience, and teaching information.
const TeacherRegister = () => {
  return (
    <main className="min-h-screen bg-green-50 px-6 py-12 text-gray-900">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-green-900">Become a BarakahTech Teacher</h1>
        <p className="mt-6 text-gray-600">
          Teacher registration requires a detailed application process. We review all teacher applications carefully to maintain quality on our platform.
        </p>
        <p className="mt-4 text-gray-600">
          This section is coming soon. Thank you for your interest in teaching on BarakahTech.
        </p>
        <Link to="/register" className="mt-8 inline-block font-semibold text-green-700 hover:underline">
          Go back
        </Link>
      </div>
    </main>
  )
}

export default TeacherRegister
