const mongoose = require('mongoose')
const SessionBooking = require('../../../models/SessionBooking')
const { getBookingStartInstant, getWindow } = require('../timeUtils')

const denied = (code, message, fields = {}) => ({
  allowed: false,
  code,
  message,
  opensAt: fields.opensAt || null,
  roomName: null,
  title: null,
  startsAt: fields.startsAt || null,
  closesAt: fields.closesAt || null,
  isModerator: false,
  nextUrl: null,
})

const resolve = async (sessionId, user) => {
  if (!mongoose.isValidObjectId(sessionId)) {
    return denied('NOT_FOUND', 'Session booking not found.')
  }

  const booking = await SessionBooking.findById(sessionId)
  if (!booking) return denied('NOT_FOUND', 'Session booking not found.')
    
  const userId = String(user?._id || user?.userId || user?.id || '')
  const studentId = String(booking.student)
  const tutorId = String(booking.tutor)
  if (userId !== studentId && userId !== tutorId) {
    return denied('NOT_PARTICIPANT', 'You are not a participant in this booking.')
  }

  if (booking.status === 'pending_payment') {
    return denied('NOT_PAID', 'This session is not confirmed because payment is pending.')
  }
  if (booking.status === 'cancelled') {
    return denied('CANCELLED', 'This session booking was cancelled.')
  }
  if (!['confirmed', 'in_progress'].includes(booking.status)) {
    return denied('ENDED', 'This session is no longer available.')
  }

  const startsAt = getBookingStartInstant(booking)
  const { opensAt, closesAt } = getWindow(startsAt, booking.duration)
  const timeFields = { opensAt: opensAt.toISOString(), startsAt: startsAt.toISOString(), closesAt: closesAt.toISOString() }
  const now = Date.now()
  if (now < opensAt.getTime()) {
    return denied('TOO_EARLY', 'The session room is not open yet.', timeFields)
  }
  if (now > closesAt.getTime()) {
    return denied('ENDED', 'The session time has ended.', timeFields)
  }

  const isModerator = userId === tutorId
  return {
    allowed: true,
    code: 'OK',
    message: 'Session access granted.',
    ...timeFields,
    roomName: `ba-booking-${booking._id}`,
    title: booking.subject || 'Live tutoring session',
    isModerator,
    nextUrl: isModerator ? '/dashboard/teacher/live-sessions' : `/session/${booking._id}/feedback`,
  }
}

module.exports = { resolve }
