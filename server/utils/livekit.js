const { AccessToken } = require('livekit-server-sdk')

const createAccessToken = async ({ roomName, identity, name, isModerator, ttlMinutes }) => {
  const missingVariables = ['LIVEKIT_URL', 'LIVEKIT_API_KEY', 'LIVEKIT_API_SECRET']
    .filter((variable) => !process.env[variable]?.trim())

  if (missingVariables.length) {
    throw new Error(`Missing required LiveKit environment variable(s): ${missingVariables.join(', ')}`)
  }

  // A grant is the set of room permissions embedded in a participant's signed token.
  // The server creates it so API credentials and authorization rules never reach the browser.
  const accessToken = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name,
    ttl: `${ttlMinutes}m`,
  })

  accessToken.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    // Only the session's tutor/host receives room-wide moderator permissions.
    roomAdmin: isModerator,
  })

  return accessToken.toJwt()
}

module.exports = { createAccessToken }
