// Daily.co provides the WebRTC video rooms used for BarakahTech live sessions.
// Keeping these API calls here prevents controllers from handling provider
// request formats or exposing the Daily API key to a browser.

const getDailyConfig = () => {
  const apiKey = process.env.DAILY_API_KEY
  const baseUrl = process.env.DAILY_BASE_URL || 'https://api.daily.co/v1'

  if (!apiKey || apiKey === 'your_daily_api_key_here') {
    throw new Error('Daily.co is not configured. Add a valid DAILY_API_KEY to server/.env.')
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, '') }
}

const dailyRequest = async (path, body) => {
  const { apiKey, baseUrl } = getDailyConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || data.info || `Daily.co request failed with status ${response.status}.`)
  }

  return data
}

const createDailyRoom = async (bookingId, sessionStart, durationMinutes) => {
  const start = new Date(sessionStart)
  if (Number.isNaN(start.getTime())) throw new Error('The session start time is invalid.')

  // The room expires after the lesson plus a short grace period. This limits
  // the life of a copied room URL without stopping an active lesson early.
  const expiryTime = new Date(start.getTime() + ((Number(durationMinutes) + 30) * 60 * 1000))
  const room = await dailyRequest('/rooms', {
    name: `barakahtech-session-${bookingId}`,
    privacy: 'private',
    properties: {
      exp: Math.floor(expiryTime.getTime() / 1000),
      enable_screenshare: true,
      enable_chat: true,
      start_video_off: false,
      start_audio_off: false,
      lang: 'en',
    },
  })

  return { roomUrl: room.url, roomName: room.name }
}

const createMeetingToken = async (roomName, participantName, isOwner) => {
  // A meeting token grants one authenticated user a particular role in one
  // private room. The Daily API key never leaves the server.
  const data = await dailyRequest('/meeting-tokens', {
    properties: {
      room_name: roomName,
      user_name: participantName,
      is_owner: isOwner,
      enable_recording: isOwner,
    },
  })

  return data.token
}

module.exports = { createDailyRoom, createMeetingToken }
