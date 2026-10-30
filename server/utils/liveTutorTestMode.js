const isLiveTutorTestModeEnabled = () => (
  process.env.NODE_ENV !== 'production' &&
  process.env.LIVE_TUTOR_TEST_MODE !== 'false'
)

module.exports = isLiveTutorTestModeEnabled
