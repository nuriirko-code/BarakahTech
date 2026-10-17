import { loadStripe } from '@stripe/stripe-js'

// Vite only exposes variables with the VITE_ prefix to the browser, which keeps secrets
// out of the frontend bundle. This publishable key is safe to use in the client because it can
// only create payment intents, not charge cards directly. The secret key remains on the server.
// loadStripe asynchronously loads Stripe.js from Stripe's CDN and returns a promise that resolves
// once the library is ready for payment forms.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default stripePromise
