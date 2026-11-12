const mongoose = require('mongoose')
const CommunitySession = require('../../../models/CommunitySession')
const { getWindow } = require('../timeUtils')

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
    return denied('NOT_FOUND', 'Community session not found.')
  }

  const session = await CommunitySession.findById(sessionId)
  if (!session) return denied('NOT_FOUND', 'Community session not found.')
  if (session.status === 'cancelled') return denied('CANCELLED', 'This community session was cancelled.')
  if (session.status === 'completed') return denied('ENDED', 'This community session has ended.')

  const userId = String(user?._id || user?.userId || user?.id || '')
  const isAdmin = user?.role === 'admin'
  const isHost = session.hostUser && String(session.hostUser) === userId
  const isMentorship = session.type === 'course_mentorship'
  const isParticipant = (session.participants || []).some((participant) => (
    String(participant.user?._id || participant.user) === userId
  ))
  if (!isParticipant && !isAdmin && !isHost) {
    return denied('NOT_PARTICIPANT', 'Register for this community session to join.')
  }

  const startsAt = new Date(session.startsAt)
  if (Number.isNaN(startsAt.getTime())) throw new Error('The community session start time is invalid.')
  const { opensAt: standardOpensAt } = getWindow(startsAt, session.durationMinutes)
  const opensAt = isAdmin || isHost
    ? new Date(startsAt.getTime() - (30 * 60 * 1000))
    : standardOpensAt
  const closesAt = new Date(startsAt.getTime() + ((Number(session.durationMinutes) + 60) * 60 * 1000))
  const timeFields = { opensAt: opensAt.toISOString(), startsAt: startsAt.toISOString(), closesAt: closesAt.toISOString() }
  const now = Date.now()

  // A live community room remains joinable until an administrator completes it.
  if (session.status !== 'live' && now < opensAt.getTime()) {
    return denied('TOO_EARLY', 'The community session room is not open yet.', timeFields)
  }
  if (session.status !== 'live' && now > closesAt.getTime()) {
    return denied('ENDED', 'The community session time has ended.', timeFields)
  }

  return {
    allowed: true,
    code: 'OK',
    message: 'Community session access granted.',
    ...timeFields,
    roomName: `ba-community-${session._id}`,
    title: session.title,
    isModerator: Boolean(isAdmin || isHost),
    nextUrl: isMentorship
      ? isHost ? '/dashboard/teacher/sessions' : isAdmin ? '/dashboard/admin' : '/dashboard/student'
      : `/community/${session._id}`,
  }
}

module.exports = { resolve }
