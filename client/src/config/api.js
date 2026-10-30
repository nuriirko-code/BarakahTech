// Centralize the API origin so development and production can switch through
// VITE_API_URL instead of requiring endpoint changes throughout the app.
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const API_BASE_URL = `${API_ORIGIN.replace(/\/$/, '')}/api`

export default API_BASE_URL
