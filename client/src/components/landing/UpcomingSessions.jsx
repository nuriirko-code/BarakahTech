import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API_BASE_URL from '../../config/api'

const UpcomingSessions = () => {
  const { t, i18n } = useTranslation()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadSessions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/community`)
        if (active) setSessions((response.data.sessions || []).slice(0, 3))
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || t('common.error'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSessions()
    return () => { active = false }
  }, [t])

  return (
    <section className="bg-[#f7faf8] px-5 py-14 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-emerald-800">{t('landing.sessionsEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">{t('landing.upcomingSessions')}</h2>
          </div>
          <Link to="/community" className="inline-flex w-fit items-center gap-2 font-bold text-emerald-800 hover:text-emerald-950">
            {t('landing.seeAllSessions')} <i className="fas fa-arrow-right text-sm" aria-hidden="true" />
          </Link>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {loading ? (
          <div className="mt-7 grid gap-4 md:grid-cols-3" role="status" aria-label={t('common.loading')}>
            {[1, 2, 3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-emerald-100 bg-white p-7 text-center">
            <p className="font-bold text-slate-800">{t('landing.newSessionsWeekly')}</p>
            <Link to="/community" className="mt-3 inline-flex font-bold text-emerald-800 underline">{t('landing.visitCommunity')}</Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {sessions.map((session) => (
              <article key={session._id} className="group rounded-2xl border border-white bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(15,23,42,0.16)]">
                <span className="text-xs font-extrabold uppercase tracking-wide text-amber-700">{t(`community.type${session.type?.replace(/(^|_)(\w)/g, (_, __, letter) => letter.toUpperCase()) || 'IdeaLab'}`)}</span>
                <h3 className="mt-2 text-lg font-extrabold text-slate-900">{session.title}</h3>
                <p className="mt-3 text-sm text-slate-600">
                  <i className="fas fa-calendar-day mr-2 text-emerald-700" aria-hidden="true" />
                  {new Date(session.startsAt).toLocaleString(i18n.language)}
                </p>
                <p className="mt-2 text-sm text-slate-600">{t('landing.seatsLeft', { count: session.seatsLeft })}</p>
                <Link to="/community" className="mt-4 inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-[#0a2416] hover:bg-amber-300">
                  {t('landing.reserveSeat')}
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['fa-lightbulb', t('landing.bringChallenge'), t('landing.bringDescription')],
            ['fa-people-group', t('landing.thinkTogether'), t('landing.thinkDescription')],
            ['fa-list-check', t('landing.leaveWithStep'), t('landing.stepDescription')],
          ].map(([icon, title, description]) => (
            <article key={title} className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_12px_32px_rgba(16,60,40,0.10)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(16,60,40,0.16)]">
              <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-amber-100/70 transition-transform duration-300 group-hover:scale-125" aria-hidden="true" />
              <div className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <i className={`fas ${icon} text-lg`} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default UpcomingSessions
