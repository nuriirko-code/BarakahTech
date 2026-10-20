import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/currencyUtils'
import { getCategoryGradient, getCategoryIcon } from '../../utils/courseUtils'
import { getGoogleDriveEmbedUrl, getYouTubeEmbedUrl } from '../../utils/videoUtils'
import Avatar from '../../components/common/Avatar'
import Navbar from '../../components/common/Navbar'

const formatTime = (time) => {
  const [hours, minutes] = String(time || '').split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time || 'Time not set'
  const date = new Date(2000, 0, 1, hours, minutes)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const getVideoEmbedUrl = (url) => {
  const youtubeUrl = getYouTubeEmbedUrl(url)
  return youtubeUrl !== url ? youtubeUrl : getGoogleDriveEmbedUrl(url)
}

// This is a public page: students and visitors can evaluate a tutor before
// registering. It deliberately has Navbar rather than a private dashboard sidebar.
const TutorProfilePage = () => {
  const [profile, setProfile] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { profileId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let isCurrent = true

    const loadProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await axios.get(`http://localhost:5000/api/live-tutors/profile/${profileId}`)
        if (isCurrent) {
          setProfile(response.data.profile)
          setAvailability(response.data.availability)
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load this tutor profile.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadProfile()
    return () => { isCurrent = false }
  }, [profileId])

  // Prices are derived from the hourly rate instead of stored separately, so
  // 30-, 60-, and 90-minute options always stay mathematically consistent.
  const handleBookSession = () => {
    if (!user) {
      navigate('/login', { state: { message: 'Login to book a session' } })
      return
    }
    navigate(`/book/${profile._id}`)
  }

  if (loading || authLoading) {
    return <><Navbar /><main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8"><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]"><div className="h-[580px] animate-pulse rounded-2xl bg-slate-200" /><div className="h-[580px] animate-pulse rounded-2xl bg-slate-200" /></div></main></>
  }

  if (error || !profile) {
    return <><Navbar /><main className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-10"><section className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><i className="fas fa-circle-exclamation text-4xl text-red-500" aria-hidden="true" /><h1 className="mt-5 text-2xl font-extrabold text-slate-900">Tutor profile unavailable</h1><p className="mt-3 text-slate-600">{error || 'This tutor profile could not be found.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-[#16A34A] px-5 py-3 font-bold text-white hover:bg-[#15803D]">Go back</button></section></main></>
  }

  const tutorName = profile.user?.name || 'Qualified tutor'
  const offeredDurations = [...new Set(profile.sessionDurations || [])].sort((first, second) => first - second)
  const activeSlots = (availability?.weeklySlots || []).filter((slot) => slot.isActive !== false)
  const isAcceptingBookings = availability?.isAcceptingBookings === true
  const videoEmbedUrl = profile.introVideoUrl ? getVideoEmbedUrl(profile.introVideoUrl) : ''
  const roundedRating = Math.round(Number(profile.rating) || 0)

  return (
    <><Navbar /><main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 sm:py-10"><div className="mx-auto max-w-7xl"><button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#15803D] hover:underline"><i className="fas fa-arrow-left" aria-hidden="true" />Back to tutors</button>
      <div className="grid gap-6 lg:grid-cols-[minmax(290px,1fr)_minmax(0,2fr)] lg:items-start">
        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${getCategoryGradient(profile.mainCategory)}`}><i className={`${getCategoryIcon(profile.mainCategory)} text-4xl text-white/50`} aria-hidden="true" /></div><div className="relative px-6 pb-6 text-center"><div className="-mt-12 flex justify-center"><span className="rounded-full bg-white p-1 shadow-md"><Avatar name={tutorName} imageUrl={profile.profilePhoto} size="xl" /></span></div><h1 className="mt-4 text-2xl font-extrabold tracking-tight">{tutorName}</h1>{profile.isVerified && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-bold text-[#15803D]"><i className="fas fa-shield-halved" aria-hidden="true" />Verified Tutor</span>}<div className="mt-4 flex items-center justify-center gap-2 text-sm"><span className="text-amber-500">{[1, 2, 3, 4, 5].map((star) => <i key={star} className={`fas fa-star ${star <= roundedRating ? '' : 'text-slate-200'}`} aria-hidden="true" />)}</span><span className="text-slate-600">{Number(profile.rating || 0).toFixed(1)} · {profile.totalSessionsTaught || 0} sessions</span></div><div className="mt-5 flex flex-wrap justify-center gap-2">{(profile.teachingLanguages || []).map((language) => <span key={language} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">{language}</span>)}<span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-800">{profile.teachingLevel === 'all' ? 'All levels' : profile.teachingLevel}</span></div><p className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-600"><i className="fas fa-clock text-[#16A34A]" aria-hidden="true" />Usually responds within {profile.responseTimeHours || 24} hours</p></div></section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Session Rates</h2><div className="mt-4 space-y-3">{offeredDurations.map((duration) => <div key={duration} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm"><span className="text-slate-600">{duration} min session</span><span className="font-extrabold text-[#15803D]">{formatCurrency(Number(profile.hourlyRate) * (duration / 60), profile.currency)}</span></div>)}{profile.trialSessionOffered && <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm"><span className="font-semibold text-amber-900">Trial session</span><span className="font-extrabold text-amber-900">{formatCurrency(profile.trialSessionRate, profile.currency)}</span></div>}</div><button type="button" disabled={!isAcceptingBookings} onClick={handleBookSession} className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold transition ${isAcceptingBookings ? 'bg-[#16A34A] text-white hover:bg-[#15803D]' : 'cursor-not-allowed bg-slate-200 text-slate-500'}`}><i className="fas fa-calendar-plus" aria-hidden="true" />{isAcceptingBookings ? 'Book a Session' : 'Not accepting bookings'}</button></section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-extrabold"><i className="fas fa-calendar-days text-[#16A34A]" aria-hidden="true" />Availability</h2>{availability ? <><p className="mt-3 text-sm font-semibold text-slate-700">{availability.timezone}</p><div className="mt-4 space-y-2">{activeSlots.length ? activeSlots.map((slot) => <div key={slot.day} className="flex justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2.5 text-sm"><span className="font-semibold text-slate-800">{slot.day}</span><span className="text-slate-600">{formatTime(slot.startTime)} — {formatTime(slot.endTime)}</span></div>) : <p className="text-sm text-slate-500">No active times are currently listed.</p>}</div><p className="mt-4 text-xs leading-5 text-slate-500">All times shown in {availability.timezone}.</p></> : <p className="mt-3 text-sm text-slate-500">This tutor has not published availability yet.</p>}</section>
        </aside>

        <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold tracking-tight">About {tutorName}</h2><p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">{profile.bio}</p></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#15803D]"><i className="fas fa-chalkboard-user" aria-hidden="true" /></span>Teaching Approach</h2><p className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">{profile.teachingApproach}</p></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold tracking-tight">Subjects I Teach</h2><div className="mt-5 flex flex-wrap gap-3">{(profile.subjects || []).map((subject) => <span key={subject} className="rounded-xl bg-[#F0FDF4] px-4 py-2 text-sm font-bold text-[#15803D] ring-1 ring-[#22C55E]/20">{subject}</span>)}</div></section>{profile.introVideoUrl && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold tracking-tight">Introduction Video</h2><div className="mt-5 aspect-video overflow-hidden rounded-xl bg-slate-950"><iframe title={`${tutorName} introduction video`} src={videoEmbedUrl} className="h-full w-full" allowFullScreen /></div></section>}<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-extrabold tracking-tight">Student Reviews</h2>{profile.totalRatings > 0 ? <p className="mt-4 text-slate-600">Reviews will be loaded here in Phase 10.</p> : <p className="mt-4 text-slate-600">No reviews yet. Be the first to book a session!</p>}</section></div>
      </div>
    </div></main></>
  )
}

export default TutorProfilePage
