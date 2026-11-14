const personNamePattern = /^\p{L}[\p{L}\p{M}]*(?:(?:[ '\u2019\u2010-\u2015-]\p{L}[\p{L}\p{M}]*)|(?:\.\s*\p{L}[\p{L}\p{M}]*))*\.?$/u
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u

const normalizePersonName = (value) => (
  typeof value === 'string'
    ? value.normalize('NFC').trim().replace(/\s+/gu, ' ')
    : ''
)

const getPersonNameError = (value) => {
  const name = normalizePersonName(value)
  const characterCount = Array.from(name).length

  if (characterCount > 80) return 'tooLong'
  if (!personNamePattern.test(name)) return 'invalid'
  if (characterCount < 3 || (name.match(/\p{L}/gu) || []).length < 3) return 'tooShort'
  return ''
}

const normalizeEmail = (value) => (
  typeof value === 'string' ? value.trim().toLowerCase() : ''
)

const isValidEmail = (value) => {
  const email = normalizeEmail(value)
  return email.length <= 254 && emailPattern.test(email)
}

module.exports = {
  getPersonNameError,
  isValidEmail,
  normalizeEmail,
  normalizePersonName,
}
