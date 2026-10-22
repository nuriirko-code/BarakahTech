import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  DailyProvider,
  DailyVideo,
  useDaily,
  useDailyEvent,
  useLocalSessionId,
  useParticipantIds,
} from '@daily-co/daily-react'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = 'http://localhost:5000/api'

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

// DailyProvider supplies a Daily call object to this component tree. The hooks
// below then stay declarative: React state changes whenever call events occur.
const SessionCallUI = ({ roomUrl, meetingToken, bookingId, booking }) => {
  const daily = useDaily()
  const navigate = useNavigate()
  const { user } = useAuth()
  const localSessionId = useLocalSessionId()
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })
  const allParticipantIds = useParticipantIds()
  const [callState, setCallState] = useState('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [duration, setDuration] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState([])
  const joinedRef = useRef(false)

  const handleJoined = useCallback(() => {
    joinedRef.current = true
    setCallState('joined')
  }, [])
  const handleCallError = useCallback((event) => {
    setCallState('error')
    setMessages((current) => [...current, { id: Date.now(), system: true, text: event.errorMsg || 'Unable to join the video room.' }])
  }, [])
  const handleAppMessage = useCallback((event) => {
    if (event.data?.type !== 'chat') return
    setMessages((current) => [...current, {
      id: `${event.fromId}-${Date.now()}`,
      author: event.data.sender || 'Participant',
      text: event.data.text,
    }])
  }, [])

  useDailyEvent('joined-meeting', handleJoined)
  useDailyEvent('error', handleCallError)
  useDailyEvent('app-message', handleAppMessage)
  useDailyEvent('local-screen-share-started', useCallback(() => setIsScreenSharing(true), []))
  useDailyEvent('local-screen-share-stopped', useCallback(() => setIsScreenSharing(false), []))

  useEffect(() => {
    if (!daily) return undefined

    const joinRoom = async () => {
      try {
        setCallState('joining')
        await daily.join({ url: roomUrl, token: meetingToken })
      } catch (error) {
        setCallState('error')
        setMessages([{ id: Date.now(), system: true, text: 'Unable to join the session. Check your camera and network permissions, then try again.' }])
      }
    }

    joinRoom()
    return () => {
      // Leaving on unmount releases the camera and microphone if the learner
      // navigates away without using the red end-call button.
      daily.leave().catch(() => {})
    }
  }, [daily, meetingToken, roomUrl])

  useEffect(() => {
    if (callState !== 'joined') return undefined
    const intervalId = window.setInterval(() => setDuration((current) => current + 1), 1000)
    return () => window.clearInterval(intervalId)
  }, [callState])

  const toggleMicrophone = () => {
    if (!daily) return
    daily.setLocalAudio(isMuted)
    setIsMuted((current) => !current)
  }

  const toggleCamera = () => {
    if (!daily) return
    daily.setLocalVideo(isCameraOff)
    setIsCameraOff((current) => !current)
  }

  const toggleScreenShare = () => {
    if (!daily) return
    if (isScreenSharing) daily.stopScreenShare()
    else daily.startScreenShare()
  }

  const sendChatMessage = (event) => {
    event.preventDefault()
    const text = chatMessage.trim()
    if (!text || !daily) return

    daily.sendAppMessage({ type: 'chat', text, sender: user?.name || 'You' }, '*')
    setMessages((current) => [...current, { id: Date.now(), author: 'You', text, own: true }])
    setChatMessage('')
  }

  const endCall = async () => {
    try {
      await daily?.leave()
    } finally {
      // Feedback is its own route so the call interface stays focused only on
      // live learning, then naturally moves into the post-session experience.
      navigate(`/session/${bookingId}/feedback`)
    }
  }

  const remoteSessionId = remoteParticipantIds[0]
  const sessionTitle = booking?.subject || booking?.tutorProfile?.subjects?.[0] || 'Live tutoring session'

  return (
    <main className="flex min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-tight sm:text-lg">BarakahTech Academy</p>
            <p className="truncate text-xs text-slate-400">{sessionTitle}</p>
          </div>
          <div className="ml-4 flex items-center gap-3 text-sm font-semibold text-slate-200">
            <span className="hidden rounded-full bg-white/10 px-3 py-1.5 sm:inline-flex"><i className="fas fa-user-group mr-2 text-green-400" aria-hidden="true" />{allParticipantIds.length} in session</span>
            <span className="rounded-full bg-green-500/15 px-3 py-1.5 font-mono text-green-300"><i className="fas fa-clock mr-2" aria-hidden="true" />{formatDuration(duration)}</span>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_#1e3a2a,_#020617_55%)] p-4 sm:p-6">
          {remoteSessionId ? (
            <DailyVideo sessionId={remoteSessionId} type="video" fit="cover" className="h-full max-h-[calc(100vh-10rem)] w-full rounded-2xl bg-slate-900 object-cover shadow-2xl" />
          ) : (
            <div className="flex h-full min-h-72 w-full max-w-4xl flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 px-6 text-center shadow-2xl">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-2xl text-green-300"><i className="fas fa-user-clock" aria-hidden="true" /></span>
              <h1 className="mt-5 text-xl font-bold">Waiting for the other participant</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">You are in the session room. Your video call will begin when the other participant joins.</p>
            </div>
          )}

          {localSessionId && (
            <div className="absolute bottom-7 right-7 h-28 w-40 overflow-hidden rounded-xl border-2 border-white/30 bg-slate-900 shadow-xl sm:h-36 sm:w-52">
              <DailyVideo sessionId={localSessionId} type="video" fit="cover" automirror className="h-full w-full object-cover" />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold">You</span>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-center gap-2 border-t border-white/10 bg-slate-900 px-3 py-4 sm:gap-3">
          <button type="button" onClick={toggleMicrophone} className={`flex h-12 w-12 items-center justify-center rounded-full transition ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}><i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`} aria-hidden="true" /></button>
          <button type="button" onClick={toggleCamera} className={`flex h-12 w-12 items-center justify-center rounded-full transition ${isCameraOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}><i className={`fas ${isCameraOff ? 'fa-video-slash' : 'fa-video'}`} aria-hidden="true" /></button>
          <button type="button" onClick={toggleScreenShare} className={`hidden h-12 w-12 items-center justify-center rounded-full transition sm:flex ${isScreenSharing ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} aria-label="Share screen"><i className="fas fa-desktop" aria-hidden="true" /></button>
          <button type="button" onClick={() => setShowChat((current) => !current)} className={`flex h-12 w-12 items-center justify-center rounded-full transition ${showChat ? 'bg-green-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`} aria-label="Open chat"><i className="fas fa-comment" aria-hidden="true" /></button>
          <button type="button" onClick={endCall} className="ml-2 flex h-12 items-center gap-2 rounded-full bg-red-600 px-5 font-bold text-white transition hover:bg-red-700" aria-label="End call"><i className="fas fa-phone-slash" aria-hidden="true" /><span className="hidden sm:inline">End call</span></button>
        </footer>
      </section>

      {showChat && (
        <aside className="flex w-80 max-w-[85vw] flex-col border-l border-white/10 bg-slate-900 sm:w-96">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h2 className="font-bold">Session chat</h2><button type="button" onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white" aria-label="Close chat"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && <p className="rounded-xl bg-white/5 p-4 text-center text-sm leading-6 text-slate-400">Messages shared here are visible only to participants in this live session.</p>}
            {messages.map((message) => <div key={message.id} className={message.system ? 'rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200' : `rounded-xl p-3 text-sm ${message.own ? 'ml-8 bg-green-600 text-white' : 'mr-8 bg-white/10 text-slate-100'}`}><p className="mb-1 text-xs font-bold opacity-75">{message.system ? 'Session notice' : message.author}</p><p>{message.text}</p></div>)}
          </div>
          <form onSubmit={sendChatMessage} className="border-t border-white/10 p-4"><label className="sr-only" htmlFor="session-chat">Message</label><div className="flex gap-2"><input id="session-chat" value={chatMessage} onChange={(event) => setChatMessage(event.target.value)} placeholder="Write a message" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-green-400" /><button className="rounded-xl bg-green-600 px-3 text-white hover:bg-green-500" aria-label="Send message"><i className="fas fa-paper-plane" aria-hidden="true" /></button></div></form>
        </aside>
      )}

      {callState === 'joining' && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200 shadow-lg"><i className="fas fa-spinner mr-2 animate-spin text-green-400" aria-hidden="true" />Joining secure room...</div>}
      {callState === 'error' && <div className="fixed bottom-24 left-1/2 max-w-sm -translate-x-1/2 rounded-xl border border-red-400/30 bg-red-950 px-4 py-3 text-center text-sm text-red-100 shadow-lg">We could not connect to this session. Check your camera permissions and refresh the page.</div>}
    </main>
  )
}

const SessionRoom = () => {
  const { bookingId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [meetingToken, setMeetingToken] = useState('')
  const [roomUrl, setRoomUrl] = useState('')
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    const loadSession = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [bookingResponse, accessResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/bookings/${bookingId}`, { headers }),
          axios.get(`${API_BASE_URL}/bookings/${bookingId}/session-token`, { headers }),
        ])
        if (!isCurrent) return
        setBooking(bookingResponse.data.booking)
        setMeetingToken(accessResponse.data.token)
        setRoomUrl(accessResponse.data.roomUrl)
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'We could not prepare this session room.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    if (token) loadSession()
    return () => { isCurrent = false }
  }, [bookingId, token])

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-center text-white"><div><i className="fas fa-spinner animate-spin text-3xl text-green-400" aria-hidden="true" /><p className="mt-4 text-sm text-slate-300">Preparing your secure session room...</p></div></main>
  if (error || !meetingToken || !roomUrl) return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5"><section className="max-w-md rounded-2xl border border-red-400/20 bg-slate-900 p-7 text-center text-white shadow-2xl"><i className="fas fa-circle-exclamation text-3xl text-red-400" aria-hidden="true" /><h1 className="mt-4 text-xl font-bold">Session room unavailable</h1><p className="mt-3 text-sm leading-6 text-slate-300">{error || 'This room is not ready yet.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">Go back</button></section></main>

  return <DailyProvider><SessionCallUI roomUrl={roomUrl} meetingToken={meetingToken} bookingId={bookingId} booking={booking} /></DailyProvider>
}

export default SessionRoom
