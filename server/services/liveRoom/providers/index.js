const livekit = require('./livekit')

const providers = { livekit }

const getVideoProvider = () => {
  const providerName = (process.env.LIVE_PROVIDER || 'livekit').trim().toLowerCase()
  const provider = providers[providerName]

  if (!provider) {
    throw new Error(`Unsupported LIVE_PROVIDER "${providerName}". Add a provider adapter before selecting it.`)
  }

  return provider
}

module.exports = { getVideoProvider }
