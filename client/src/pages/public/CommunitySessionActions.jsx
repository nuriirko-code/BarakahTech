import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import API_BASE_URL from '../../config/api'

const formatDate = (value, language) => new Date(value).toLocaleString(language, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const CommunitySessionActions = ({ session, token, onChange }) => {
  const { t, i18n } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [now, setNow] = useState(0)
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const openingSoon = session.status === 'live' || (
    session.status === 'scheduled'
    && now >= new Date(session.startsAt).getTime() - (15 * 60 * 1000)
  )

  useEffect(() => {
    const updateTime = () => setNow(Date.now())
    updateTime()
    const timer = window.setInterval(updateTime, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const register = async () => {
    setBusy(true)
    setError('')
    try {
      await axios.post(`${API_BASE_URL}/community/${session._id}/register`, {}, { headers })
      await onChange()
    } catch (requestError) {
      setError(requestError.response?.data?.message || t('actions.reserveError'))
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    setBusy(true)
    setError('')
    try {
      await axios.delete(`${API_BASE_URL}/community/${session._id}/register`, { headers })
      await onChange()
    } catch (requestError) {
      setError(requestError.response?.data?.message || t('actions.cancelError'))
    } finally {
      setBusy(false)
    }
  }

  const join = async () => {
    const popup = window.open('about:blank', '_blank')
    if (popup) popup.opener = null
    setBusy(true)
    setError('')
    try {
      const response = await axios.get(`${API_BASE_URL}/community/${session._id}/join`, { headers })
      if (popup) {
        popup.location.href = response.data.meetingUrl
      } else {
        window.open(response.data.meetingUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (requestError) {
      if (popup) popup.close()
      const opensAt = requestError.response?.data?.opensAt
      const message = requestError.response?.data?.message || t('actions.joinError')
      setError(opensAt ? `${message} ${t('actions.opensAt', { date: formatDate(opensAt, i18n.language) })}` : message)
    } finally {
      setBusy(false)
    }
  }

  // The available action is derived from authentication, registration, and remaining seats.
  const action = !token ? (
    <Link
      to="/login"
      state={{ from: '/community' }}
      className="inline-flex rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
    >
      {t('actions.signUpToJoin')}
    </Link>
  ) : session.isRegistered ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-900">{t('actions.youAreIn')}</span>
      {openingSoon && (
        <button type="button" onClick={join} disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
          {busy ? t('actions.opening') : t('actions.joinSession')}
        </button>
      )}
      {session.status === 'scheduled' && (
        <button type="button" onClick={cancel} disabled={busy} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
          {t('actions.cancel')}
        </button>
      )}
    </div>
  ) : session.seatsLeft <= 0 ? (
    <button type="button" disabled className="cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-500">
      {t('actions.sessionFull')}
    </button>
  ) : (
    <button type="button" onClick={register} disabled={busy} className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-60">
      {busy ? t('actions.reserving') : t('actions.reserveSeat')}
    </button>
  )

  return (
    <div>
      {action}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}

export default CommunitySessionActions
