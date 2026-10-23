// Utility mappings live in a shared file so every course-card component can use the
// same category styling and visual language without repeating the same logic.

export const getCategoryGradient = (category) => {
  const gradientMap = {
    technology: 'from-blue-600 to-indigo-700',
    languages: 'from-green-500 to-teal-600',
    sciences: 'from-purple-600 to-violet-700',
    business: 'from-orange-500 to-amber-600',
    leadership: 'from-rose-500 to-pink-600',
  }

  return gradientMap[category] || 'from-gray-500 to-gray-700'
}

export const getCategoryIcon = (category) => {
  const iconMap = {
    technology: 'fas fa-microchip',
    languages: 'fas fa-language',
    sciences: 'fas fa-flask',
    business: 'fas fa-briefcase',
    leadership: 'fas fa-people-group',
  }

  return iconMap[category] || 'fas fa-layer-group'
}

export const getCategoryEmoji = (category) => {
  const emojiMap = {
    technology: '💻',
    languages: '🌍',
    sciences: '🔬',
    business: '📈',
    leadership: '⭐',
  }

  return emojiMap[category] || '📚'
}
