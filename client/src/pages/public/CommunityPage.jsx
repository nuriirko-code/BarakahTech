import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'
import CommunitySessionActions from './CommunitySessionActions'

const sessionTypes = {
  idea_lab: { key: 'typeIdeaLab', icon: 'fa-lightbulb', colors: 'border-amber-200 bg-amber-50 text-amber-950', bar: 'bg-amber-400' },
  build_project: { key: 'typeBuildProject', icon: 'fa-hammer', colors: 'border-emerald-200 bg-emerald-50 text-emerald-950', bar: 'bg-emerald-500' },
  mentor_review: { key: 'typeMentorReview', icon: 'fa-user-tie', colors: 'border-violet-200 bg-violet-50 text-violet-950', bar: 'bg-violet-500' },
  showcase: { key: 'typeShowcase', icon: 'fa-trophy', colors: 'border-blue-200 bg-blue-50 text-blue-950', bar: 'bg-blue-500' },
}

const journeySteps = ['brainstorm', 'analyze', 'learn', 'build', 'launch']
const sessionHeaders = (token) => (token ? { Authorization: ['Bearer ', token].join('') } : {})

const CommunityPage = () => {
  const { t, i18n } = useTranslation()
  const { token } = useAuth()
  const [past, setPast] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ upcoming: null, reserved: null, completed: null })
  const [statsError, setStatsError] = useState('')
  const [nextSession, setNextSession] = useState({ session: null, days: null })
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  const loadSessions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/community`, {
        params: past ? { past: 'true' } : {},
        headers: sessionHeaders(token),
      })
      setSessions(response.data.sessions || [])
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || t('community.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [past, t, token])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const refreshCommunity = useCallback(async () => {
    await loadSessions()
    setStatsRefreshKey((current) => current + 1)
  }, [loadSessions])

  useEffect(() => {
    let active = true
    const loadStats = async () => {
      try {
        const [upcomingResponse, pastResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/community`, { headers: sessionHeaders(token) }),
          axios.get(`${API_BASE_URL}/community`, { params: { past: 'true' }, headers: sessionHeaders(token) }),
        ])
        const upcoming = upcomingResponse.data.sessions || []
        const completed = pastResponse.data.sessions || []
        if (active) {
          const next = upcoming.find((session) => session.status === 'scheduled') || null
          setNextSession({
            session: next,
            days: next ? Math.max(0, Math.ceil((new Date(next.startsAt).getTime() - Date.now()) / 86_400_000)) : null,
          })
          setStats({
            upcoming: upcoming.length,
            reserved: upcoming.reduce((total, session) => total + (Number(session.participantCount) || 0), 0),
            completed: completed.filter((session) => session.status === 'completed' && (
              Boolean(session.outcomes?.summary)
              || Boolean(session.outcomes?.problemStatements?.length)
              || Boolean(session.outcomes?.resources?.length)
              || Boolean(session.outcomes?.nextSteps?.length)
            )).length,
          })
          setStatsError('')
        }
      } catch {
        if (active) setStatsError(t('common.error'))
      }
    }
    loadStats()
    return () => { active = false }
  }, [statsRefreshKey, t, token])

  const featuredSession = nextSession.session
  const daysUntilNext = nextSession.days
  const howSteps = [
    ['fa-ticket', t('community.reserveTitle'), t('community.reserveDescription')],
    ['fa-video', t('community.joinTitle'), t('community.joinDescription')],
    ['fa-lightbulb', t('community.brainstormTitle'), t('community.brainstormDescription')],
    ['fa-list-check', t('community.planTitle'), t('community.planDescription')],
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main>
        <section className="overflow-hidden bg-[#0a2416] px-5 py-12 text-white sm:px-8 sm:py-16">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">{t('community.heroEyebrow')}</p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{t('community.heroHeading')}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{t('community.heroDescription')}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={() => document.getElementById('sessions')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-[#0a2416] hover:bg-amber-300">
                  {t('community.seeUpcoming')}
                </button>
                <button type="button" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-xl border border-white/40 px-5 py-3 font-bold text-white hover:bg-white/10">
                  {t('community.howItWorksLink')}
                </button>
              </div>
              <ol className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label={t('hero.journeyLabel')}>
                {journeySteps.map((step, index) => (
                  <li key={step} className={`rounded-xl border px-3 py-2 ${index === 0 ? 'border-amber-300 bg-amber-300 text-[#0a2416]' : 'border-white/20 bg-white/5 text-white'}`}>
                    {index === 0 && <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-wide">{t('community.youStartHere')}</span>}
                    <span className={`text-xs font-bold ${index === 0 ? 'text-emerald-900' : 'text-amber-200'}`}>0{index + 1}</span>
                    <span className="mt-0.5 block text-sm font-extrabold">{t(`hero.${step}`)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-2 rounded-[2rem] bg-amber-400/25 blur-2xl" aria-hidden="true" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-amber-300/70 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                <img src="/images/community-learning.png" alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2416]/75 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white p-4 text-slate-900 shadow-xl sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-700">{t('community.nextSessionLabel')}</p>
                  <p className="mt-1 text-lg font-black">
                    {featuredSession
                      ? daysUntilNext === 0
                        ? t('community.nextSessionToday', { title: featuredSession.title })
                        : t('community.nextSession', { title: featuredSession.title, days: daysUntilNext })
                      : t('community.noUpcoming')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3 sm:p-5">
            {[
              [stats.upcoming, 'community.statsUpcoming', 'fa-calendar-days'],
              [stats.reserved, 'community.statsSeats', 'fa-chair'],
              [stats.completed, 'community.statsCompleted', 'fa-flag-checkered'],
            ].map(([value, label, icon]) => (
              <div key={label} className="flex items-center gap-4 rounded-xl px-3 py-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-amber-300"><i className={`fas ${icon}`} aria-hidden="true" /></span>
                <div><p className="text-2xl font-black text-amber-300">{value === null ? '—' : new Intl.NumberFormat(i18n.language).format(value)}</p><p className="text-sm text-slate-200">{t(label)}</p></div>
              </div>
            ))}
          </div>
          {statsError && <p role="alert" className="mx-auto mt-3 max-w-7xl text-sm text-amber-100">{statsError}</p>}
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{t('community.howEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">{t('community.howHeading')}</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map(([icon, title, description], index) => (
              <article key={title} className="group rounded-2xl border border-white bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.09)] transition hover:-translate-y-1.5 hover:shadow-lg">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><i className={`fas ${icon} text-lg`} aria-hidden="true" /></span>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-emerald-700">0{index + 1}</p>
                <h3 className="mt-1 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>

          <div id="sessions" className="mt-16 scroll-mt-24">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{t('community.sessionEyebrow')}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t('community.sessionsHeading')}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">{t('community.sessionsDescription')}</p>
              </div>
              <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1.5" role="tablist" aria-label={t('community.sessionsHeading')}>
                {[[false, t('community.upcomingTab')], [true, t('community.pastTab')]].map(([isPast, label]) => (
                  <button key={label} type="button" role="tab" aria-selected={past === isPast} onClick={() => { setLoading(true); setPast(isPast) }} className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${past === isPast ? 'bg-[#0a2416] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
            {loading ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2" role="status" aria-label={t('common.loading')}>
                {[1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-slate-200" />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
                <i className="fas fa-people-group text-4xl text-slate-300" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-bold">{past ? t('community.noCompleted') : t('community.noUpcoming')}</h3>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {sessions.map((session) => {
                  const type = sessionTypes[session.type] || sessionTypes.idea_lab
                  const capacity = Number(session.capacity) || 0
                  const taken = Number(session.participantCount) || 0
                  const seatsLeft = Number(session.seatsLeft) || 0
                  const progress = capacity ? Math.min(100, (taken / capacity) * 100) : 0
                  const date = new Date(session.startsAt).toLocaleString(i18n.language)
                  return (
                    <article key={session._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      <div className={`h-2 ${type.bar}`} />
                      <div className={`border-b p-5 sm:p-6 ${type.colors}`}>
                        <div className="flex items-start justify-between gap-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold">
                            <i className={`fas ${type.icon}`} aria-hidden="true" />{t(`community.${type.key}`)}
                          </span>
                          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold capitalize">{t(`community.status.${session.status}`, { defaultValue: session.status })}</span>
                        </div>
                        <h3 className="mt-5 text-2xl font-black leading-snug">{session.title}</h3>
                        <p className="mt-2 text-sm opacity-80">{t('community.minutes', { count: session.durationMinutes })}</p>
                      </div>
                      <div className="p-5 sm:p-6">
                        <p className="leading-7 text-slate-600">{session.description}</p>
                        <p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><i className="fas fa-calendar-day text-emerald-700" aria-hidden="true" />{date}</p>
                        <p className="mt-3 text-sm text-slate-500">
                          {t('community.facilitator')} <span className="font-semibold text-slate-700">{session.facilitatorName}</span>
                          {session.guestMentor?.name && ` · ${t('community.guest', { name: session.guestMentor.name, title: session.guestMentor.title })}`}
                        </p>

                        {past ? (
                          <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                            <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">{t('community.outcomesCard')}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{session.outcomes?.summary || t('community.outcomesUnavailable')}</p>
                            {!!session.outcomes?.problemStatements?.length && <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">{session.outcomes.problemStatements.map((statement, index) => <li key={`${statement}-${index}`}>{statement}</li>)}</ul>}
                          </div>
                        ) : (
                          <div className="mt-5">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-semibold text-slate-700">{t('community.seatsTaken', { taken, capacity })}</span>
                              <span className={`font-bold ${seatsLeft <= 2 ? 'text-amber-700' : 'text-slate-500'}`}>{t('community.left', { count: seatsLeft })}</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={taken} aria-valuemin="0" aria-valuemax={capacity}>
                              <div className={`h-full rounded-full ${seatsLeft <= 2 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          {!past && <CommunitySessionActions session={session} token={token} onChange={refreshCommunity} />}
                          <Link to={`/community/${session._id}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                            {t('community.viewDetails')} <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          <section className="mt-16">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">{t('community.whyEyebrow')}</p>
            <h2 className="mt-2 text-3xl font-black">{t('community.whyHeading')}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['fa-people-group', t('landing.meetBigIdeas')],
                ['fa-comments', t('landing.entrepreneurFeedback')],
                ['fa-compass', t('landing.learnWhatYouNeed')],
              ].map(([icon, text]) => (
                <article key={text} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <i className={`fas ${icon} text-2xl text-amber-600`} aria-hidden="true" />
                  <h3 className="mt-4 font-extrabold">{text}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-3xl bg-[#0a2416] p-6 text-white sm:p-9">
            <h2 className="text-3xl font-black">{t('community.nextHeading')}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['fa-graduation-cap', t('community.coursesLink'), '/courses'],
                ['fa-user-tie', t('community.tutorsLink'), '/tutors'],
                ['fa-people-group', t('community.applyTeacherLink'), '/become-a-teacher'],
              ].map(([icon, label, path]) => (
                <Link key={path} to={path} className="rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10">
                  <i className={`fas ${icon} text-2xl text-amber-300`} aria-hidden="true" />
                  <h3 className="mt-3 font-extrabold">{label}</h3>
                </Link>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-300">{t('community.noJobGuarantee')}</p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default CommunityPage
