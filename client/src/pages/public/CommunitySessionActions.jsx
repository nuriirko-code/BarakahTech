import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import API_BASE_URL from '../../config/api'
import { liveRoomPath } from '../../config/live'

const CommunitySessionActions = ({ session, token, onChange }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

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

  const join = () => navigate(liveRoomPath('community', session._id))
  const isLiveJoinable = ['scheduled', 'live'].includes(session.status)
  const isCancelled = session.status === 'cancelled'
  // The button only navigates; the server decides whether the community room is open.
  const action = isCancelled ? (
    <span className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-800">
      {t('community.status.cancelled', { defaultValue: 'This session was cancelled' })}
    </span>
  ) : !token ? (
    <Link
      to="/login"
      state={{ from: '/community' }}
      className="inline-flex rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
    >
      {t('actions.signUpToJoin')}
    </Link>
  ) : user?.role === 'admin' && isLiveJoinable ? (
    <button type="button" onClick={join} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
      {t('actions.startSession')}
    </button>
  ) : session.isRegistered ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-900">{t('actions.youAreIn')}</span>
      {isLiveJoinable && (
        <button type="button" onClick={join} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
          {t('actions.joinSession')}
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
