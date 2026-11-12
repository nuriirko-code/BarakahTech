import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import API_BASE_URL from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import { getLiveRoomProvider } from './providers'

const initialChoices = (name) => ({
  username: name || '',
  audioEnabled: true,
  videoEnabled: true,
  audioDeviceId: 'default',
  videoDeviceId: 'default',
})

const localDateTime = (instant) => new Date(instant).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatElapsed = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return [hours, minutes, remainingSeconds].map((part) => String(part).padStart(2, '0')).join(':')
}

const denialContent = {
  NOT_PAID: { title: 'Payment is still being verified', description: 'You can join after your booking is confirmed.' },
  NOT_PARTICIPANT: { title: 'You are not registered for this session', description: 'Only the booked participants or registered community members can enter.' },
  ENDED: { title: 'This session has ended', description: 'The live room is no longer available.' },
  CANCELLED: { title: 'This session was cancelled', description: 'This room is no longer available.' },
  NOT_FOUND: { title: 'Session not found', description: 'We could not find this live session.' },
  BAD_TYPE: { title: 'Unsupported session type', description: 'This kind of live session is not available.' },
}

const LiveRoomPage = () => {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const [phase, setPhase] = useState('checking')
  const [access, setAccess] = useState(null)
  const [denial, setDenial] = useState(null)
  const [choices, setChoices] = useState(null)
  const [roomError, setRoomError] = useState('')
  const [preJoinError, setPreJoinError] = useState('')
  const [conductAccepted, setConductAccepted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [now, setNow] = useState(0)
  const [preJoinKey, setPreJoinKey] = useState(0)
  const isLeavingRef = useRef(false)

  const loadAccess = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/live/${type}/${id}/access`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (!getLiveRoomProvider(response.data.provider)) {
        throw new Error(`The configured live video provider "${response.data.provider}" is not supported by this client.`)
      }
      setAccess(response.data)
      setChoices(null)
      setPhase('prejoin')
    } catch (requestError) {
      setNow(Date.now())
      setDenial({
        code: requestError.response?.data?.code || 'LIVE_ACCESS_ERROR',
        message: requestError.response?.data?.message || requestError.message || 'We could not check access to this session.',
        opensAt: requestError.response?.data?.opensAt || null,
      })
      setPhase('denied')
    }
  }, [id, token, type])

  const checkAccess = useCallback(() => {
    setPhase('checking')
    setAccess(null)
    setDenial(null)
    setRoomError('')
    loadAccess()
  }, [loadAccess])

  useEffect(() => {
    loadAccess()
  }, [loadAccess])

  useEffect(() => {
    if (phase !== 'denied' || denial?.code !== 'TOO_EARLY' || !denial.opensAt) return undefined

    const timerId = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)
      if (currentTime >= new Date(denial.opensAt).getTime()) {
        window.clearInterval(timerId)
        checkAccess()
      }
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [checkAccess, denial, phase])

  useEffect(() => {
    if (phase !== 'connected') return undefined
    const timerId = window.setInterval(() => setElapsedSeconds((current) => current + 1), 1000)
    return () => window.clearInterval(timerId)
  }, [phase])

  const leaveRoom = useCallback(() => {
    isLeavingRef.current = true
    navigate(access?.nextUrl || (type === 'community' ? '/community' : '/dashboard/student/my-sessions'), { replace: true })
  }, [access, navigate, type])

  const handleDisconnected = useCallback(() => {
    if (isLeavingRef.current) {
      leaveRoom()
      return
    }

    setRoomError('The live room disconnected. Check your connection and try again.')
  }, [leaveRoom])

  const joinWithChoices = (userChoices) => {
    if (!conductAccepted) {
      setPreJoinError('Please acknowledge the Community Code of Conduct before joining.')
      return
    }
    isLeavingRef.current = false
    setChoices(userChoices)
    setPreJoinError('')
    setPhase('connected')
    setElapsedSeconds(0)
  }

  const joinWithoutCamera = () => {
    joinWithChoices({
      ...initialChoices(access?.participantName || user?.name),
      audioEnabled: true,
      videoEnabled: false,
    })
  }

  const joinWithoutDevices = () => {
    joinWithChoices({
      ...initialChoices(access?.participantName || user?.name),
      audioEnabled: false,
      videoEnabled: false,
    })
  }

  const retryPreJoin = () => {
    setPreJoinKey((current) => current + 1)
    setPreJoinError('')
  }

  const backPath = type === 'community' ? '/community' : '/dashboard/student/my-sessions'

  if (phase === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a2416] px-5 text-white">
        <div className="text-center">
          <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" role="status" aria-label="Checking session access" />
          <p className="mt-4 font-semibold">Preparing your Barakah Academy live room…</p>
          <Link to={backPath} className="mt-5 inline-flex rounded-xl border border-amber-400/40 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            Back
          </Link>
        </div>
      </main>
    )
  }

  if (phase === 'denied') {
    const content = denialContent[denial?.code] || {
      title: 'We could not open this session',
      description: denial?.message || 'Please try again or return to your sessions.',
    }
    const opensAt = denial?.opensAt ? new Date(denial.opensAt) : null
    const remainingSeconds = opensAt ? Math.max(0, Math.ceil((opensAt.getTime() - now) / 1000)) : 0

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a2416] px-5 py-10 text-slate-900">
        <section className="w-full max-w-lg rounded-3xl bg-white p-7 text-center shadow-2xl sm:p-9">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <i className={`fas ${denial?.code === 'TOO_EARLY' ? 'fa-clock' : 'fa-video-slash'} text-2xl`} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-black">{content.title}</h1>
          <p className="mt-3 leading-7 text-slate-600">{content.description}</p>
          {denial?.code === 'TOO_EARLY' && opensAt && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              <p>This session opens at {localDateTime(opensAt)}.</p>
              <p className="mt-2">Time remaining: {formatElapsed(remainingSeconds)}</p>
            </div>
          )}
          {denial?.code === 'NOT_PAID' && (
            <Link to="/dashboard/student/my-sessions" className="mt-5 inline-flex rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800">
              View My Sessions
            </Link>
          )}
          <Link to={backPath} className="mt-5 inline-flex w-full justify-center rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-50">
            Back
          </Link>
        </section>
      </main>
    )
  }

  if (phase === 'prejoin') {
    const ProviderPreJoin = getLiveRoomProvider(access?.provider)?.PreJoin

    return (
      <main className="min-h-screen bg-[#0a2416] px-4 py-8 text-white sm:px-6">
        <section className="mx-auto max-w-3xl rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-8">
          <header className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-green-700">Barakah Academy live room</p>
            <h1 className="mt-2 text-2xl font-black">{access?.title || 'Live session'}</h1>
            <p className="mt-2 text-sm text-slate-600">Check your camera and microphone before entering. This helps catch device and permission problems before the live session begins.</p>
              <Link to={backPath} className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Back
              </Link>
          </header>
          {preJoinError && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              <p role="alert">{preJoinError}</p>
              <button type="button" onClick={retryPreJoin} className="rounded-lg bg-red-700 px-3 py-2 font-bold text-white hover:bg-red-800">Retry devices</button>
            </div>
          )}
          <label className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <input
              type="checkbox"
              checked={conductAccepted}
              onChange={(event) => {
                setConductAccepted(event.target.checked)
                setPreJoinError('')
              }}
              className="mt-1 accent-amber-700"
            />
            <span>
              I have read and agree to follow the <Link className="font-bold underline" to="/policies/community-code">Community Code of Conduct</Link> during this session.
            </span>
          </label>
          <ProviderPreJoin
            preJoinKey={preJoinKey}
            defaults={initialChoices(access?.participantName || user?.name)}
            onSubmit={joinWithChoices}
            onError={(error) => setPreJoinError(error.message || 'Could not access your selected camera or microphone.')}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={joinWithoutCamera} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Join without camera
            </button>
            <button type="button" onClick={joinWithoutDevices} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Join without camera or microphone
            </button>
          </div>
        </section>
      </main>
    )
  }

  const ProviderConnectedRoom = getLiveRoomProvider(access?.provider)?.ConnectedRoom

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#0a2416] text-white">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-400/20 bg-[#071a0e] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-black"><span className="text-amber-400">Barakah</span> Academy</p>
          <p className="truncate text-sm text-slate-300">{access?.title || 'Live session'}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-200" aria-label="Time in session">{formatElapsed(elapsedSeconds)}</span>
          <button type="button" onClick={leaveRoom} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
            Leave
          </button>
        </div>
      </header>
      {roomError && (
        <div role="alert" className="flex shrink-0 items-center justify-between gap-3 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span>{roomError}</span>
          <button type="button" onClick={checkAccess} className="rounded-lg bg-red-700 px-3 py-2 font-bold text-white hover:bg-red-800">Retry</button>
        </div>
      )}
      <ProviderConnectedRoom
        access={access}
        choices={choices}
        onConnected={() => setRoomError('')}
        onDisconnected={handleDisconnected}
        onError={(error) => setRoomError(error.message || 'The live room could not connect. Check your connection and try again.')}
        onMediaDeviceFailure={(failure) => setRoomError(failure?.message || 'Camera or microphone access failed. Check browser permissions, then retry.')}
      />
    </main>
  )
}

export default LiveRoomPage
