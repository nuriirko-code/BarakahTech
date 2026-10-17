const Stripe = require('stripe')

// The Stripe secret key stays only on the server. This is the credential used to
// create payment intents and read payment state, so it must never be shipped to
// the browser. The frontend only receives a publishable key and a client secret.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

module.exports = stripe
