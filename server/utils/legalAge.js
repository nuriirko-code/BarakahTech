const getAge = (dateOfBirth, today = new Date()) => {
  const birthDate = new Date(dateOfBirth)
  if (!dateOfBirth || Number.isNaN(birthDate.getTime()) || birthDate >= today) return null

  let age = today.getUTCFullYear() - birthDate.getUTCFullYear()
  const beforeBirthday = today.getUTCMonth() < birthDate.getUTCMonth()
    || (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() < birthDate.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

const isAdult = (dateOfBirth) => {
  const age = getAge(dateOfBirth)
  return age !== null && age >= 18 && age <= 120
}

module.exports = { getAge, isAdult }
