const { createAccessToken } = require('../../../utils/livekit')

const createJoinConfig = async ({ access, identity, name, ttlMinutes }) => ({
  provider: 'livekit',
  serverUrl: process.env.LIVEKIT_URL,
  token: await createAccessToken({
    roomName: access.roomName,
    identity,
    name,
    isModerator: access.isModerator,
    ttlMinutes,
  }),
})

module.exports = { createJoinConfig }
