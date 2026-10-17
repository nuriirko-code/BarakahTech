// This utility centralizes money formatting so every part of the app uses the same
// currency behavior instead of duplicating ad hoc formatting logic in widgets and cards.
const supportedCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
]

const roundToTwoDecimals = (value) => {
  return Number(Math.round((value + Number.EPSILON) * 100) / 100)
}

// Intl.NumberFormat is the browser's built-in money formatter. It handles localized
// decimal separators, currency symbols, and rounding rules more reliably than manual
// string concatenation, which is easy to get wrong when the app expands to multiple currencies.
export const formatCurrency = (amount, currencyCode = 'USD') => {
  if (amount === null || amount === undefined) {
    return 'Free'
  }

  const numericAmount = Number(amount)

  if (Number.isNaN(numericAmount)) {
    return 'Free'
  }

  const normalizedCurrencyCode = typeof currencyCode === 'string' ? currencyCode.toUpperCase() : 'USD'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedCurrencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount)
  } catch (error) {
    // Some browsers or older environments may not recognize a currency code, so we fall back
    // to a safe plain-text format that still shows the amount and the currency label clearly.
    return `${normalizedCurrencyCode} ${numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

export const getCoursePricing = (price, discountPercentage = 0) => {
  const originalPrice = Math.max(0, Number(price) || 0)
  const discount = Math.min(99, Math.max(0, Number(discountPercentage) || 0))
  const discountedPrice = Math.round((originalPrice * (1 - discount / 100) + Number.EPSILON) * 100) / 100

  return {
    originalPrice,
    discountPercentage: discount,
    discountAmount: Math.round((originalPrice - discountedPrice + Number.EPSILON) * 100) / 100,
    discountedPrice,
  }
}

// Supporting several currencies from the beginning prevents a later migration problem where
// course pricing, teacher payouts, and student checkout logic would already be tightly coupled
// to just one money system. This makes the foundation more trustworthy for a growing platform.
export const getSupportedCurrencies = () => {
  return supportedCurrencies
}

// USD is used as the fallback because it is the most universally understood online currency.
// It gives a consistent default even when the user locale cannot be mapped to a regional currency.
export const getDefaultCurrency = () => {
  if (typeof navigator === 'undefined' || !navigator.language) {
    return 'USD'
  }

  const locale = navigator.language.toLowerCase()

  if (locale === 'en-us') return 'USD'
  if (locale === 'en-gb') return 'GBP'
  if (['de', 'fr', 'es', 'it'].some((region) => locale.startsWith(region))) return 'EUR'
  if (['am', 'om'].some((region) => locale.startsWith(region))) return 'ETB'
  if (locale.startsWith('ar-sa')) return 'SAR'
  if (locale.startsWith('ar-ae')) return 'AED'

  return 'USD'
}

// The platform fee is calculated from the original amount, not from the net amount, because
// the commission is a transparent percentage of the customer payment. This keeps teacher earnings
// and platform revenue auditable and easy to explain to students and teachers.
export const calculatePlatformFee = (amount, percentage) => {
  const numericAmount = Math.max(0, Number(amount) || 0)
  const numericPercentage = Math.max(0, Number(percentage) || 0)

  const platformFee = roundToTwoDecimals((numericAmount * numericPercentage) / 100)
  const teacherEarnings = roundToTwoDecimals(numericAmount - platformFee)
  const total = roundToTwoDecimals(numericAmount)

  return {
    platformFee,
    teacherEarnings,
    total,
  }
}
