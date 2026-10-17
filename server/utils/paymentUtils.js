const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
])

// Stripe works in the smallest currency unit, such as cents for USD. This avoids
// floating-point problems and matches real payment processor expectations.
const roundMoney = (value) => Number((Number(value) || 0).toFixed(2))

const calculateDiscountedPrice = (price, discountPercentage = 0) => {
  const originalPrice = Math.max(0, Number(price) || 0)
  const discount = Math.min(99, Math.max(0, Number(discountPercentage) || 0))
  return roundMoney(originalPrice * (1 - discount / 100))
}

const calculateFees = (amount, currency = 'USD', commissionPercentage = 20) => {
  const grossAmount = roundMoney(amount)
  const safeCommission = Number(commissionPercentage) || 0

  // The platform fee is calculated from the original amount and then subtracted from
  // the teacher's share. A transparent fee model helps students understand the cost and
  // helps teachers trust the revenue split.
  const platformFeeAmount = roundMoney((grossAmount * safeCommission) / 100)
  const teacherEarningAmount = roundMoney(grossAmount - platformFeeAmount)

  return {
    grossAmount,
    platformFeeAmount,
    teacherEarningAmount,
    currency: String(currency || 'USD').toUpperCase(),
  }
}

const formatAmountForStripe = (amount, currency = 'USD') => {
  const normalizedCurrency = String(currency || 'USD').toUpperCase()
  const numericAmount = Number(amount) || 0

  // Zero-decimal currencies such as JPY or KRW are not represented in subunits, so
  // the amount is sent as whole units instead of converted to cents.
  if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
    return Math.round(numericAmount)
  }

  return Math.round(numericAmount * 100)
}

const formatAmountFromStripe = (amount, currency = 'USD') => {
  const normalizedCurrency = String(currency || 'USD').toUpperCase()
  const numericAmount = Number(amount) || 0

  if (ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)) {
    return numericAmount
  }

  return numericAmount / 100
}

// A short, human-readable code is easier to compare against bank SMS confirmations than
// a database ObjectId. Students include it in the transfer description and admins use it
// to find the matching order during manual verification.
const generatePaymentCode = () => {
  const date = new Date()
  const dateStr = date.getFullYear().toString()
    + String(date.getMonth() + 1).padStart(2, '0')
    + String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BT-${dateStr}-${random}`
}

module.exports = {
  calculateFees,
  calculateDiscountedPrice,
  formatAmountForStripe,
  formatAmountFromStripe,
  generatePaymentCode,
}
