import API_BASE_URL from '../../config/api.js'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const JITSI_SCRIPT_ID = 'jitsi-external-api'
let jitsiScriptPromise

const loadJitsiExternalApi = () => {
  if (window.JitsiMeetExternalAPI) return Promise.resolve()
  if (jitsiScriptPromise) return jitsiScriptPromise

  jitsiScriptPromise = new Promise((resolve, reject) => {
    let script = document.getElementById(JITSI_SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.id = JITSI_SCRIPT_ID
      script.src = 'https://meet.jit.si/external_api.js'
      script.async = true
    }

    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', () => {
      script.remove()
      reject(new Error('Could not load Jitsi Meet. Check your internet connection and try again.'))
    }, { once: true })
    if (!script.isConnected) document.head.appendChild(script)
  }).catch((error) => {
    jitsiScriptPromise = null
    throw error
  })

  return jitsiScriptPromise
}

const SessionRoom = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { token, user, loading: authLoading } = useAuth()
  const jitsiContainerRef = useRef(null)
  const jitsiApiRef = useRef(null)
  const hasNavigatedRef = useRef(false)
  const [sessionData, setSessionData] = useState(null)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [duration, setDuration] = useState(0)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    let isCurrent = true

    const fetchSession = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [bookingResponse, roomResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/bookings/${bookingId}`, { headers }),
          axios.get(`${API_BASE_URL}/bookings/${bookingId}/session-token`, { headers }),
        ])
        if (!isCurrent) return
        setBooking(bookingResponse.data.booking)
        setSessionData(roomResponse.data)
      } catch (requestError) {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load this session. Please try again.')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) fetchSession()

    return () => { isCurrent = false }
  }, [bookingId, token])

  useEffect(() => {
    if (!sessionData || !jitsiContainerRef.current) return undefined

    let isCurrent = true
    let api

    const navigateAfterCall = () => {
      if (hasNavigatedRef.current) return
      hasNavigatedRef.current = true
      navigate(user?.role === 'student' ? `/session/${bookingId}/feedback` : '/dashboard/teacher/live-sessions')
    }

    const startJitsi = async () => {
      try {
        await loadJitsiExternalApi()
        if (!isCurrent || !jitsiContainerRef.current) return

        api = new window.JitsiMeetExternalAPI(sessionData.jitsiDomain, {
          roomName: sessionData.roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: { displayName: sessionData.participantName },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableNoisyMicDetection: false,
            testing: {
              enableFirefoxSimulcast: false,
            },
            p2p: {
              enabled: true,
              preferH264: true,
            },
            disableAudioLevels: true,
          },
        })
        jitsiApiRef.current = api
        api.addEventListener('videoConferenceJoined', () => setJoined(true))
        api.addEventListener('videoConferenceLeft', navigateAfterCall)
        api.addEventListener('readyToClose', navigateAfterCall)
        api.addEventListener('errorOccurred', (event) => {
          const message = event?.error?.message || event?.message || 'Jitsi could not connect to the session.'
          setError(message)
        })
      } catch (loadError) {
        if (isCurrent) setError(loadError.message || 'Could not start the video session.')
      }
    }

    startJitsi()
    return () => {
      isCurrent = false
      api?.dispose()
      if (jitsiApiRef.current === api) jitsiApiRef.current = null
    }
  }, [bookingId, navigate, sessionData, user?.role])

  useEffect(() => {
    if (!joined) return undefined
    const timerId = window.setInterval(() => setDuration((current) => current + 1), 1000)
    return () => window.clearInterval(timerId)
  }, [joined])

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup')
      return
    }
    navigate(user?.role === 'student' ? `/session/${bookingId}/feedback` : '/dashboard/teacher/live-sessions')
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  if (authLoading || loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0a2416] px-5 text-center text-white"><div><i className="fas fa-spinner animate-spin text-3xl text-amber-400" aria-hidden="true" /><p className="mt-4 text-slate-300">Preparing your session room...</p></div></main>
  }

  if (!token) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0a2416] px-5"><section className="max-w-md rounded-2xl bg-slate-900 p-7 text-center text-white shadow-2xl"><h1 className="text-xl font-bold">Sign in to join</h1><p className="mt-3 text-sm text-slate-300">Your account must be signed in to access this booked session.</p><button type="button" onClick={() => navigate('/login')} className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">Go to login</button></section></main>
  }

  if (error || !sessionData?.roomUrl || !sessionData?.roomName || !sessionData?.jitsiDomain) {
    return <main className="flex min-h-screen items-center justify-center bg-[#0a2416] px-5"><section className="max-w-md rounded-2xl bg-slate-900 p-7 text-center text-white shadow-2xl"><i className="fas fa-circle-exclamation text-3xl text-red-400" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold">Session room unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-300">{error || 'The session room details are incomplete.'}</p>{sessionData?.roomUrl && <a href={sessionData.roomUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"><i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />Open Jitsi directly</a>}<button type="button" onClick={() => navigate(-1)} className="mt-6 block w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">Go back</button></section></main>
  }

  return (
    <main className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#0a2416]">
      <header className="flex shrink-0 items-center justify-between border-b border-amber-400/20 bg-[#071a0e] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2"><span className="font-bold text-amber-400">Barakah</span><span className="font-bold text-white">Academy</span><span className="ml-2 text-xs text-slate-400">Live session</span></div>
        <div className="flex items-center gap-3">
          <a
            href={sessionData.roomUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <i className="fas fa-arrow-up-right-from-square" aria-hidden="true" />
            <span className="hidden sm:inline">Open room separately</span>
          </a>
          {joined && <span className="rounded-full bg-amber-400/15 px-4 py-1.5 font-mono text-sm font-bold text-amber-300"><i className="fas fa-clock mr-2" aria-hidden="true" />{formatDuration(duration)}</span>}
          <button type="button" onClick={handleEndCall} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"><i className="fas fa-phone-slash" aria-hidden="true" />End session</button>
        </div>
      </header>
      {window.location.hostname === 'localhost' && (
        <div
          className="flex shrink-0 items-center gap-3 px-6 py-3 text-sm"
          style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
        >
          <i className="fas fa-info-circle" aria-hidden="true" />
          <span>
            Video is provided by Jitsi Meet. Your display name, microphone, and camera are shared with the video provider when you join.
            On production this notice will not appear.
          </span>
        </div>
      )}
      <div
        ref={jitsiContainerRef}
        className="relative min-h-0 w-full flex-1 overflow-hidden [&>iframe]:block [&>iframe]:h-full [&>iframe]:w-full"
        title={`${booking?.subject || 'Live tutoring'} video session`}
      />
    </main>
  )
}

export default SessionRoom
