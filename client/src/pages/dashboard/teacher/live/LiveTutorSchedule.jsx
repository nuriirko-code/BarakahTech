import API_BASE_URL from '../../../../config/api.js'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../../../context/AuthContext'

const weekDays = [
  { short: 'Mon', value: 'Monday' }, { short: 'Tue', value: 'Tuesday' },
  { short: 'Wed', value: 'Wednesday' }, { short: 'Thu', value: 'Thursday' },
  { short: 'Fri', value: 'Friday' }, { short: 'Sat', value: 'Saturday' },
  { short: 'Sun', value: 'Sunday' },
]

const emptyAvailability = {
  timezone: 'Africa/Addis_Ababa', weeklySlots: [], advanceBookingHours: 24,
  cancellationHours: 24, bufferMinutes: 15, maxDailySession: 8, isAcceptingBookings: true,
  isTestSchedule: false,
}

// This working schedule is separate from the application snapshot, so an
// approved tutor can update their bookable time without altering the review record.
const LiveTutorSchedule = () => {
  const [availability, setAvailability] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(emptyAvailability)
  const { token } = useAuth()

  useEffect(() => {
    let isCurrent = true
    const loadAvailability = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/availability/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isCurrent && response.data.availability) {
          const saved = response.data.availability
          setAvailability(saved)
          setFormData({
            timezone: saved.timezone || emptyAvailability.timezone,
            weeklySlots: saved.weeklySlots || [],
            advanceBookingHours: saved.advanceBookingHours ?? 24,
            cancellationHours: saved.cancellationHours ?? 24,
            bufferMinutes: saved.bufferMinutes ?? 15,
            maxDailySession: saved.maxDailySession ?? 8,
            isAcceptingBookings: saved.isAcceptingBookings ?? true,
            isTestSchedule: saved.isTestSchedule ?? false,
          })
        }
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load your availability.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }
    if (token) loadAvailability()
    else setLoading(false)
    return () => { isCurrent = false }
  }, [token])

  // A day either owns one editable slot or is absent. Toggling adds a sensible
  // default slot, or removes that day from the weekly recurring schedule.
  const toggleDay = (day) => {
    setFormData((current) => {
      const selected = current.weeklySlots.some((slot) => slot.day === day)
      return {
        ...current,
        isTestSchedule: false,
        weeklySlots: selected
          ? current.weeklySlots.filter((slot) => slot.day !== day)
          : [...current.weeklySlots, { day, startTime: '09:00', endTime: '17:00', isActive: true }],
      }
    })
    setError('')
    setSuccess('')
  }

  const updateSlot = (day, field, value) => {
    setFormData((current) => ({
      ...current,
      isTestSchedule: false,
      weeklySlots: current.weeklySlots.map((slot) => (slot.day === day ? { ...slot, [field]: value } : slot)),
    }))
    setError('')
    setSuccess('')
  }

  const updateSetting = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
      ...(field === 'advanceBookingHours' || field === 'bufferMinutes' ? { isTestSchedule: false } : {}),
    }))
    setError('')
    setSuccess('')
  }

  const setTestSchedule = () => {
    setFormData((current) => ({
      ...current,
      weeklySlots: weekDays.map(({ value }) => ({
        day: value,
        startTime: '00:00',
        endTime: '23:59',
        isActive: true,
      })),
      advanceBookingHours: 0,
      bufferMinutes: 0,
      maxDailySession: 12,
      isTestSchedule: true,
    }))
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!formData.weeklySlots.length) {
      setError('Select at least one day when you are available to teach.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const response = await axios.post(
        `${API_BASE_URL}/availability/save`,
        { ...formData, maxDailySession: Number(formData.maxDailySession) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAvailability(response.data.availability)
      setSuccess('Availability saved successfully')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save your availability.')
    } finally {
      setSaving(false)
    }
  }

  const selectedSlots = new Map(formData.weeklySlots.map((slot) => [slot.day, slot]))
  const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base font-normal outline-none focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10'

  if (loading) return <div className="space-y-4" role="status" aria-label="Loading availability"><div className="h-20 animate-pulse rounded-2xl bg-slate-200" /><div className="h-80 animate-pulse rounded-2xl bg-slate-200" /></div>

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#15803D]"><i className="fas fa-calendar-days text-lg" aria-hidden="true" /></span><div><p className="text-sm font-bold uppercase tracking-wide text-[#16A34A]">Live tutoring</p><h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Schedule</h1></div></div>
        {/* This vacation-mode switch pauses new bookings but preserves every saved time slot. */}
        <button type="button" role="switch" aria-checked={formData.isAcceptingBookings} onClick={() => updateSetting('isAcceptingBookings', !formData.isAcceptingBookings)} className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2"><span className={`relative h-7 w-12 rounded-full transition ${formData.isAcceptingBookings ? 'bg-[#22C55E]' : 'bg-slate-300'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${formData.isAcceptingBookings ? 'left-6' : 'left-1'}`} /></span><span><span className="block text-sm font-bold text-slate-900">Accepting Bookings</span><span className="block text-xs text-slate-500">Turn off to pause new bookings temporarily.</span></span></button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><i className="fas fa-circle-exclamation mr-2" aria-hidden="true" />{error}</div>}
      {success && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><i className="fas fa-circle-check mr-2" aria-hidden="true" />{success}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><label className="block max-w-xl text-base font-bold text-slate-900">Your timezone<select value={formData.timezone} onChange={(event) => updateSetting('timezone', event.target.value)} className={inputClass}><option value="Africa/Addis_Ababa">Africa/Addis_Ababa — Ethiopia</option><option value="Africa/Lagos">Africa/Lagos — West Africa</option><option value="Africa/Cairo">Africa/Cairo — Egypt</option><option value="Africa/Nairobi">Africa/Nairobi — East Africa</option><option value="Europe/London">Europe/London — UK</option><option value="Europe/Paris">Europe/Paris — Europe Central</option><option value="America/New_York">America/New_York — US East</option><option value="America/Los_Angeles">America/Los_Angeles — US West</option><option value="Asia/Dubai">Asia/Dubai — UAE</option><option value="Asia/Riyadh">Asia/Riyadh — Saudi Arabia</option><option value="Asia/Tokyo">Asia/Tokyo — Japan</option></select><span className="mt-2 block text-sm font-normal leading-6 text-slate-500">Hours are stored in your local time and will be converted for students when they book.</span></label></section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Your Weekly Availability</h2><p className="mt-2 text-sm leading-6 text-slate-500">Select each day you teach, then set your usual start and finish times.</p><div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">{weekDays.map((day) => { const selected = selectedSlots.has(day.value); return <button key={day.value} type="button" aria-pressed={selected} onClick={() => toggleDay(day.value)} className={`rounded-xl border px-2 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] ${selected ? 'border-[#22C55E] bg-[#22C55E] text-white shadow-sm' : 'border-slate-200 text-slate-600 hover:border-[#22C55E]/50 hover:bg-[#F0FDF4]'}`}>{day.short}</button> })}</div>{formData.weeklySlots.length > 0 && <div className="mt-6 space-y-3">{weekDays.filter((day) => selectedSlots.has(day.value)).map((day) => { const slot = selectedSlots.get(day.value); return <div key={day.value} className="grid items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[120px_1fr_1fr]"><span className="font-bold text-slate-900">{day.value}</span><label className="text-xs font-bold uppercase tracking-wide text-slate-500">From<input type="time" value={slot.startTime} onChange={(event) => updateSlot(day.value, 'startTime', event.target.value)} className={inputClass} /></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">To<input type="time" value={slot.endTime} onChange={(event) => updateSlot(day.value, 'endTime', event.target.value)} className={inputClass} /></label></div> })}</div>}</section>
      {import.meta.env.DEV && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-extrabold text-amber-950">Development-only session testing</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-amber-900">Temporarily allow bookings throughout the week with no advance notice or buffer. The API rejects this testing schedule in production. Replace it with your real hours before deployment.</p>{formData.isTestSchedule && <p className="mt-2 text-sm font-bold text-amber-950">24/7 testing schedule selected{availability?.isTestSchedule ? ' and saved' : ' — save to apply'}.</p>}</div><button type="button" onClick={setTestSchedule} className="shrink-0 rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800">Use 24/7 test schedule</button></div></section>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-extrabold tracking-tight text-slate-900">Booking Settings</h2><p className="mt-2 text-sm leading-6 text-slate-500">Buffer time prevents back-to-back bookings, giving you time to prepare and rest between sessions.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-800">Advance booking notice<select value={formData.advanceBookingHours} onChange={(event) => updateSetting('advanceBookingHours', Number(event.target.value))} className={inputClass}><option value="0">No advance notice (testing)</option><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option><option value="168">1 week</option></select></label><label className="text-sm font-bold text-slate-800">Cancellation policy<select value={formData.cancellationHours} onChange={(event) => updateSetting('cancellationHours', Number(event.target.value))} className={inputClass}><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option></select></label><label className="text-sm font-bold text-slate-800">Buffer between sessions<select value={formData.bufferMinutes} onChange={(event) => updateSetting('bufferMinutes', Number(event.target.value))} className={inputClass}><option value="0">No buffer</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></label><label className="text-sm font-bold text-slate-800">Max sessions per day<input type="number" min="1" max="12" value={formData.maxDailySession} onChange={(event) => updateSetting('maxDailySession', event.target.value)} className={inputClass} /></label></div></section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6"><p className="text-sm text-slate-500">{availability ? 'Your saved schedule is loaded above.' : 'Choose your first available teaching times.'}</p><button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#22C55E]/25 transition hover:bg-[#15803D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"><i className={`fas ${saving ? 'fa-spinner animate-spin' : 'fa-floppy-disk'}`} aria-hidden="true" />{saving ? 'Saving...' : 'Save Availability'}</button></footer>
    </section>
  )
}

export default LiveTutorSchedule
