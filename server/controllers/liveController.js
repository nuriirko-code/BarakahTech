const { getLiveAccess } = require('../services/liveRoom')

const statusByCode = {
  NOT_FOUND: 404,
  NOT_PARTICIPANT: 403,
  NOT_PAID: 402,
  TOO_EARLY: 425,
  ENDED: 410,
  CANCELLED: 410,
  BAD_TYPE: 400,
}

const getAccess = async (req, res) => {
  try {
    const access = await getLiveAccess(req.params.type, req.params.id, req.user.userId || req.user.id)
    if (access.allowed) return res.status(200).json(access)

    // Access denials never include a token; each code maps to a specific,
    // actionable HTTP response for the different live-session flows.
    return res.status(statusByCode[access.code] || 500).json({
      code: access.code,
      message: access.message || 'Live session access could not be granted.',
      opensAt: access.opensAt || null,
    })
  } catch (error) {
    console.error('Get live session access error:', error.message || error)
    return res.status(500).json({
      code: 'LIVE_ACCESS_ERROR',
      message: 'Unable to prepare live session access.',
    })
  }
}

module.exports = { getAccess }
