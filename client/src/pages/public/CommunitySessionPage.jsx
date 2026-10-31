import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'
import CommunitySessionActions from './CommunitySessionActions'

const typeLabels = {
  idea_lab: 'typeIdeaLab',
  build_project: 'typeBuildProject',
  mentor_review: 'typeMentorReview',
  showcase: 'typeShowcase',
}

const CommunitySessionPage = () => {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const { token } = useAuth()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSession = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/community/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setSession(response.data.session)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load this community session.')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
        <Link to="/community" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">
          <i className="fas fa-arrow-left" aria-hidden="true" /> {t('session.allSessions')}
        </Link>

        {loading ? (
          <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-200" role="status" aria-label={t('session.loading')} />
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">{error}</div>
        ) : session ? (
          <>
            <header className="mt-7 rounded-3xl bg-[#0a2416] p-7 text-white sm:p-10">
              <span className="inline-flex rounded-full bg-amber-300/15 px-3 py-1.5 text-sm font-bold text-amber-300">
                {typeLabels[session.type] ? t(`community.${typeLabels[session.type]}`) : t('session.communitySession')}
              </span>
              <h1 className="mt-5 max-w-4xl text-3xl font-black sm:text-5xl">{session.title}</h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-200">{session.description}</p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-200">
                <span><i className="fas fa-calendar-day mr-2 text-amber-300" aria-hidden="true" />{new Date(session.startsAt).toLocaleString(i18n.language)}</span>
                <span><i className="fas fa-clock mr-2 text-amber-300" aria-hidden="true" />{t('session.duration', { count: session.durationMinutes })}</span>
                <span><i className="fas fa-user-tie mr-2 text-amber-300" aria-hidden="true" />{t('community.facilitator')} {session.facilitatorName}</span>
                {session.guestMentor?.name && (
                  <span><i className="fas fa-star mr-2 text-amber-300" aria-hidden="true" />{t('session.guest', { name: session.guestMentor.name, title: session.guestMentor.title })}</span>
                )}
              </div>
            </header>

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-8">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                  <h2 className="text-2xl font-black">{t('session.agenda')}</h2>
                  {session.agenda?.length ? (
                    <ol className="mt-6 space-y-5 border-l-2 border-amber-300 pl-5">
                      {session.agenda.map((item, index) => (
                        <li key={`${item.activity}-${index}`} className="relative">
                          <span className="absolute -left-[1.65rem] top-1 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-white" />
                          <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">{t('session.duration', { count: item.minutes })}</p>
                          <p className="mt-1 font-semibold text-slate-800">{item.activity}</p>
                        </li>
                      ))}
                    </ol>
                  ) : <p className="mt-4 text-slate-600">{t('session.agendaSoon')}</p>}
                </section>

                {session.status === 'completed' && (
                  <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
                    <h2 className="text-2xl font-black">{t('session.outcomes')}</h2>
                    <p className="mt-4 leading-7 text-slate-700">{session.outcomes?.summary || t('session.outcomesSoon')}</p>
                    {!!session.outcomes?.problemStatements?.length && (
                      <div className="mt-6">
                        <h3 className="font-extrabold">{t('session.problemStatements')}</h3>
                        <ul className="mt-2 list-inside list-disc space-y-2 text-slate-700">
                          {session.outcomes.problemStatements.map((statement, index) => <li key={`${statement}-${index}`}>{statement}</li>)}
                        </ul>
                      </div>
                    )}
                    {!!session.outcomes?.resources?.length && (
                      <div className="mt-6">
                        <h3 className="font-extrabold">{t('session.resources')}</h3>
                        <ul className="mt-2 space-y-2">
                          {session.outcomes.resources.map((resource, index) => (
                            <li key={`${resource.url}-${index}`}><a href={resource.url} target="_blank" rel="noreferrer" className="font-semibold text-emerald-800 underline">{resource.title}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!!session.outcomes?.nextSteps?.length && (
                      <div className="mt-6">
                        <h3 className="font-extrabold">{t('session.nextSteps')}</h3>
                        <ul className="mt-2 space-y-2">
                          {session.outcomes.nextSteps.map((step, index) => (
                            <li key={`${step}-${index}`} className="flex gap-2 text-slate-700"><i className="fas fa-square-check mt-1 text-emerald-700" aria-hidden="true" />{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                <section>
                  <h2 className="text-2xl font-black">{t('session.turnIdeaReal')}</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <Link to={`/courses?category=${encodeURIComponent(session.recommendedCategory || 'business')}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                      <i className="fas fa-graduation-cap text-xl text-emerald-700" aria-hidden="true" />
                      <h3 className="mt-3 font-extrabold">{t('session.learn')}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{t('session.coursesMatched')}</p>
                    </Link>
                    <Link to="/tutors" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                      <i className="fas fa-user-tie text-xl text-emerald-700" aria-hidden="true" />
                      <h3 className="mt-3 font-extrabold">{t('session.getHelp')}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{t('session.bookTutor')}</p>
                    </Link>
                    <Link to="/community" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                      <i className="fas fa-code text-xl text-emerald-700" aria-hidden="true" />
                      <h3 className="mt-3 font-extrabold">{t('session.build')}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{t('session.joinProject')}</p>
                    </Link>
                  </div>
                  {/* These links connect idea sessions to the platform's existing courses, tutoring, and project community. */}
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    {t('session.noGuaranteedJob')}
                  </p>
                </section>
              </div>

              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-lg font-black">{t('session.reservePlace')}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {t('session.seatsTaken', { taken: session.participantCount, capacity: session.capacity })}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={session.participantCount} aria-valuemin="0" aria-valuemax={session.capacity}>
                  <div className={`h-full rounded-full ${session.seatsLeft <= 2 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${Math.min(100, (session.participantCount / session.capacity) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{t('session.seatsRemaining', { count: session.seatsLeft })}</p>
                <div className="mt-5">
                  {session.status === 'completed' || session.status === 'cancelled' ? (
                    <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">{t('session.registrationClosed')}</p>
                  ) : (
                    <CommunitySessionActions session={session} token={token} onChange={loadSession} />
                  )}
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

export default CommunitySessionPage
