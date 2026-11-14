import API_BASE_URL from '../../config/api.js'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const TeacherApplicationStatus = () => {
  const { t } = useTranslation()
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    const loadApplication = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/teacher-applications/my-application`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent) setApplication(response.data.application)
      } catch (requestError) {
        if (isCurrent && requestError.response?.status !== 404) {
          setError(requestError.response?.data?.message || t('auth.teacherApplicationStatus.loadError'))
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadApplication()
    return () => {
      isCurrent = false
    }
  }, [token, t])

  const signInAgain = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-extrabold tracking-tight">{t('auth.teacherApplicationStatus.title')}</h1>

        {loading ? (
          <p className="mt-6 text-slate-600" role="status">{t('auth.teacherApplicationStatus.loading')}</p>
        ) : error ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">{error}</p>
        ) : !application ? (
          <div className="mt-6 space-y-4">
            <p className="text-slate-700">{t('auth.teacherApplicationStatus.noApplication')}</p>
            <Link to="/register/teacher" className="inline-flex rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white hover:bg-[#16A34A]">
              {t('auth.teacherApplicationStatus.startApplication')}
            </Link>
          </div>
        ) : application.status === 'rejected' ? (
          <div className="mt-6 space-y-5">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              {t('auth.teacherApplicationStatus.rejected')}
            </p>
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-bold">{t('auth.teacherApplicationStatus.reviewNote')}</h2>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                {application.adminNote || t('auth.teacherApplicationStatus.noReviewNote')}
              </p>
            </section>
            <Link to="/register/teacher?edit=1" className="inline-flex rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white hover:bg-[#16A34A]">
              {t('auth.teacherApplicationStatus.updateAndResubmit')}
            </Link>
          </div>
        ) : application.status === 'approved' ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-900">
              {t('auth.teacherApplicationStatus.approved')}
            </p>
            <button type="button" onClick={signInAgain} className="rounded-xl bg-[#22C55E] px-5 py-3 font-bold text-white hover:bg-[#16A34A]">
              {t('auth.teacherApplicationStatus.signInAgain')}
            </button>
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            {t('auth.teacherApplicationStatus.pending')}
          </p>
        )}
      </section>
    </main>
  )
}

export default TeacherApplicationStatus
