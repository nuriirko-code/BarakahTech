export const ageOnDate = (dateOfBirth, today = new Date()) => {
  const birthDate = new Date(`${dateOfBirth}T00:00:00`)
  if (!dateOfBirth || Number.isNaN(birthDate.getTime())) return null

  let age = today.getFullYear() - birthDate.getFullYear()
  const beforeBirthday = today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  if (beforeBirthday) age -= 1
  return age
}

export const isMinorOnDate = (dateOfBirth) => {
  const age = ageOnDate(dateOfBirth)
  return age !== null && age < 18
}
