const User = require('../../models/User')
const { getVideoProvider } = require('./providers')
const bookingResolver = require('./resolvers/booking')
const communityResolver = require('./resolvers/community')

const resolvers = {
  booking: bookingResolver,
  community: communityResolver,
}

// Each session type keeps its own participation and timing rules, while both
// resolvers return the same access shape for the shared LiveKit room service.
// Normal denials are data with codes, so controllers can map them to HTTP status
// responses instead of treating expected access decisions as server exceptions.
const getLiveAccess = async (type, sessionId, userId) => {
  const resolver = resolvers[type]
  if (!resolver) {
    return { allowed: false, code: 'BAD_TYPE', message: 'Unsupported live session type.' }
  }
   
  const user = await User.findById(userId).select('name role')
  if (!user) {
    return { allowed: false, code: 'NOT_FOUND', message: 'User not found.' }
  }

  const access = await resolver.resolve(sessionId, user)
  if (!access.allowed) return access

  const minutesUntilClose = Math.ceil((new Date(access.closesAt).getTime() - Date.now()) / 60000)
  const provider = getVideoProvider()
  const joinConfig = await provider.createJoinConfig({
    access,
    identity: String(userId),
    name: user.name,
    ttlMinutes: Math.max(10, minutesUntilClose),
  })
  
  // Room names are derived from immutable session ids so no separate room mapping
  // can drift out of sync with a booking or community record.
  return {
    ...access,
    ...joinConfig,
    participantName: user.name,
  }
}

module.exports = { getLiveAccess }
