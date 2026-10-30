const { randomBytes } = require('crypto')

const JITSI_DOMAIN = 'meet.jit.si'

// Jitsi creates the meeting when its first participant joins; only an
// unpredictable room identifier needs to be generated and persisted here.
const createVideoRoom = (bookingId) => {
  const randomSuffix = randomBytes(16).toString('hex')
  const roomName = `barakah-${String(bookingId).slice(-8)}-${randomSuffix}`

  return {
    roomUrl: `https://${JITSI_DOMAIN}/${roomName}`,
    roomName,
  }
}

const isJitsiRoom = (roomUrl) => {
  try {
    const parsedUrl = new URL(roomUrl)
    return parsedUrl.protocol === 'https:' &&
      parsedUrl.hostname === JITSI_DOMAIN &&
      parsedUrl.pathname.length > 1
  } catch {
    return false
  }
}

module.exports = { createVideoRoom, isJitsiRoom, JITSI_DOMAIN }
