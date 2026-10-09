// A shared avatar centralizes name-to-initials logic, so the app keeps a consistent
// profile look while avoiding repeated avatar logic across student, teacher, and admin screens.

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

const Avatar = ({ name = '', imageUrl = null, size = 'md' }) => {
  const initials = (() => {
    if (!name || !name.trim()) return 'NB'

    const cleanedName = name.trim().split(/\s+/)
    const firstWord = cleanedName[0]?.[0] || ''

    // We extract the first letter of the first word and the first letter of the final word.
    // If there is only one word, the fallback uses two letters from that word for a balanced mark.
    if (cleanedName.length === 1) {
      return cleanedName[0].slice(0, 2).toUpperCase()
    }

    const lastWord = cleanedName[cleanedName.length - 1]?.[0] || ''
    return `${firstWord}${lastWord}`.toUpperCase()
  })()

  const sizeClasses = sizeMap[size] || sizeMap.md

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'User'}
        className={`${sizeClasses} rounded-full object-cover border border-white shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-[#16A34A] text-white font-bold shadow-sm`}
      aria-label={name || 'User avatar'}
      title={name || 'User'}
    >
      {initials}
    </div>
  )
}

export default Avatar
