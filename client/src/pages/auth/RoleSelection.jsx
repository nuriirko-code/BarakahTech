import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/common/Navbar'

// This page separates the student and teacher journeys before collecting details.
// Choosing a role first keeps each later form focused and prevents users from
// selecting an account type that does not match the registration flow.
const RoleSelection = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-green-50 px-6 py-16 text-gray-900">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {t('auth.joiningQuestion')}
        </h1>
        <p className="mt-3 text-lg text-gray-600">{t('auth.choosePath')}</p>

        <div className="mt-12 flex flex-col gap-8 md:flex-row">
          <button
            type="button"
            onClick={() => navigate('/welcome-student')}
            className="group flex-1 rounded-2xl border border-slate-200 bg-white p-10 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#22C55E]/40 hover:shadow-md"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]" aria-hidden="true">
              <i className="fas fa-graduation-cap" />
            </span>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">{t('auth.iWantToLearn')}</h2>
            <p className="mt-3 text-gray-600">
              {t('auth.studentPathDescription')}
            </p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white shadow-sm shadow-[#22C55E]/25">
              <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              {t('auth.joinAsStudent')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/choose-teaching-path')}
            className="group flex-1 rounded-2xl border border-slate-200 bg-white p-10 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#22C55E]/40 hover:shadow-md"
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-2xl text-[#16A34A]" aria-hidden="true">
              <i className="fas fa-chalkboard-user" />
            </span>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">{t('auth.iWantToTeach')}</h2>
            <p className="mt-3 text-gray-600">
              {t('auth.teacherPathDescription')}
            </p>
            <span className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white shadow-sm shadow-[#22C55E]/25">
              <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
              {t('auth.joinAsTeacher')}
            </span>
          </button>
        </div>

        <p className="mt-10 text-gray-600">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="font-semibold text-green-700 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </main>
    </>
  )
}

export default RoleSelection
