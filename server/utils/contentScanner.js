const contactPatterns = {
  // Ethiopian mobiles plus international numbers beginning with + and a country code.
  phone: /(?:\+?251[\s().-]?9\d{2}[\s().-]?\d{3}[\s().-]?\d{3}|0?9\d{2}[\s().-]?\d{3}[\s().-]?\d{3}|\+\d{1,3}(?:[\s().-]?\d){7,14})/i,
  // Standard practical email shape: local part, @, domain, and a suffix.
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  // Names and URL aliases of common off-platform messengers/social networks.
  social: /\b(?:whatsapp|wa\.me|telegram|t\.me|instagram|facebook|tiktok|snapchat)\b|(?:^|\s)@[a-zA-Z0-9_.]{2,30}\b/i,
  // Detect clickable web links and www-prefixed domains; the platform domain is exempted below.
  url: /(?:https?:\/\/|www\.)[^\s<>()]+/gi,
  // Direct requests to move the conversation off platform are high severity.
  directContact: /\b(?:call me|text me|find me on|my number is|reach me at)\b/i,
}

// Keeping messages on-platform protects student privacy, preserves a support trail,
// and ensures paid learning conversations remain within BarakahTech's trust boundary.
const scanForExternalContacts = (text) => {
  const content = String(text || '')
  const violations = []
  let severity = 'low'

  if (contactPatterns.phone.test(content)) {
    violations.push('phone number')
    severity = 'high'
  }

  if (contactPatterns.directContact.test(content)) {
    violations.push('direct contact request')
    severity = 'high'
  }

  if (contactPatterns.email.test(content)) {
    violations.push('email address')
    if (severity !== 'high') severity = 'medium'
  }

  const urls = content.match(contactPatterns.url) || []
  // Official BarakahTech links remain usable inside the platform; unrelated domains
  // can move learners off-platform and bypass support, safety, and payment records.
  const containsExternalUrl = urls.some((url) => {
    const normalizedUrl = url.replace(/[.,!?;:]+$/, '')
    return !/^https?:\/\/(?:[a-z0-9-]+\.)*barakahtech\.com(?:[/:?#]|$)/i.test(normalizedUrl)
      && !/^www\.(?:[a-z0-9-]+\.)*barakahtech\.com(?:[/:?#]|$)/i.test(normalizedUrl)
  })

  if (containsExternalUrl) {
    violations.push('external URL')
    if (severity !== 'high') severity = 'medium'
  }

  if (contactPatterns.social.test(content)) {
    violations.push('social media or messaging handle')
  }

  return {
    hasViolation: violations.length > 0,
    violations: [...new Set(violations)],
    severity: violations.length > 0 ? severity : 'low',
  }
}

// Severity distinguishes a social mention from a link/email or a direct attempt to
// exchange phone details, so the send flow can warn proportionally or block contact sharing.
const getSafeWarningMessage = (severity) => {
  if (severity === 'low') {
    return 'Please keep communication on BarakahTech. Sharing external social media may limit your account.'
  }

  if (severity === 'high') {
    return 'Phone numbers and direct contact sharing is not permitted. Your message was not sent. Repeated violations may result in account suspension.'
  }

  return 'External links and emails are not allowed in messages. Please communicate through BarakahTech only.'
}

module.exports = {
  scanForExternalContacts,
  getSafeWarningMessage,
}
