const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const apiUrl = configuredApiUrl || 'http://localhost:5000'

if (import.meta.env.PROD && !configuredApiUrl) {
  console.error('VITE_API_URL is not configured. Set it to the deployed Render API URL in the Vercel project settings.')
}

// Accept either the server origin or an origin that already includes /api.
const API_BASE_URL = `${apiUrl.replace(/\/+$/, '').replace(/\/api$/i, '')}/api`

export default API_BASE_URL
