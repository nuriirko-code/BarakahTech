const { DateTime } = require('luxon')

const readMinuteSetting = (name, fallback) => {
  const rawValue = process.env[name]
  if (rawValue === undefined || rawValue.trim() === '') return fallback

  const value = Number(rawValue)
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number of minutes.`)
  }
  return value
}

const getBookingStartInstant = (booking) => {
  const storedInstant = booking.startsAt || booking.startAt
  if (storedInstant) {
    const instant = new Date(storedInstant)
    if (Number.isNaN(instant.getTime())) {
      throw new Error('The booking start time is invalid.')
    }
    return instant
  }

  if (!booking.sessionDate || !booking.startTime || !booking.timezone) {
    throw new Error('The booking must include a session date, start time, and timezone.')
  }

  const date = booking.sessionDate.toISOString().slice(0, 10)
  const localStart = DateTime.fromISO(`${date}T${booking.startTime}`, { zone: booking.timezone })
  if (!localStart.isValid) {
    throw new Error(`The booking timezone or local start time is invalid: ${localStart.invalidExplanation || booking.timezone}`)
  }

  // Recurring hours are recorded in the tutor's timezone, then converted to one UTC instant
  // so student, tutor, and server clocks compare the same actual moment.
  return localStart.toUTC().toJSDate()
}

const getWindow = (startsAt, durationMinutes) => {
  const start = new Date(startsAt)
  const duration = Number(durationMinutes)
  if (Number.isNaN(start.getTime())) throw new Error('The session start time is invalid.')
  if (!Number.isFinite(duration) || duration < 0) throw new Error('The session duration must be a non-negative number.')

  const earlyMinutes = readMinuteSetting('LIVE_JOIN_EARLY_MINUTES', 15)
  const graceMinutes = readMinuteSetting('LIVE_GRACE_MINUTES', 30)

  // Comparing absolute instants prevents displayed local wall-clock times from shifting a session.
  return {
    opensAt: new Date(start.getTime() - (earlyMinutes * 60 * 1000)),
    closesAt: new Date(start.getTime() + ((duration + graceMinutes) * 60 * 1000)),
  }
}

module.exports = { getBookingStartInstant, getWindow }
