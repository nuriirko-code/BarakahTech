import { useNavigate, Link } from 'react-router-dom'

// This page separates the student and teacher journeys before collecting details.
// Choosing a role first keeps each later form focused and prevents users from
// selecting an account type that does not match the registration flow.
const RoleSelection = () => {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-green-50 px-6 py-16 text-gray-900">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-bold text-green-800">
          How are you joining BarakahTech?
        </h1>
        <p className="mt-3 text-lg text-gray-600">Choose your path to get started</p>

        <div className="mt-12 flex flex-col gap-8 md:flex-row">
          <button
            type="button"
            onClick={() => navigate('/register/student')}
            className="group flex-1 rounded-2xl bg-white p-10 text-left shadow-lg transition-transform hover:-translate-y-2 hover:shadow-xl"
          >
            <span className="text-6xl" aria-hidden="true">🎓</span>
            <h2 className="mt-6 text-2xl font-bold text-green-800">I want to Learn</h2>
            <p className="mt-3 text-gray-600">
              Access courses, book sessions with tutors, and learn in your language
            </p>
            <span className="mt-8 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">
              Join as Student
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/register/teacher')}
            className="group flex-1 rounded-2xl bg-white p-10 text-left shadow-lg transition-transform hover:-translate-y-2 hover:shadow-xl"
          >
            <span className="text-6xl" aria-hidden="true">📚</span>
            <h2 className="mt-6 text-2xl font-bold text-green-800">I want to Teach</h2>
            <p className="mt-3 text-gray-600">
              Share your knowledge, create courses, and earn by teaching on BarakahTech
            </p>
            <span className="mt-8 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white">
              Join as Teacher
            </span>
          </button>
        </div>

        <p className="mt-10 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-green-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RoleSelection
