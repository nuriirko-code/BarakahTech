// This data drives the dynamic category and subject choices in step 2 of the
// teacher registration form, keeping each subject list tied to its category.
const teachingCategories = {
  technology: {
    label: 'Technology',
    icon: '💻',
    subjects: [
      'Full Stack Web Development',
      'Mobile App Development',
      'AI and Machine Learning',
      'Cybersecurity',
      'Data Science',
      'Other Technology',
    ],
  },
  languages: {
    label: 'Languages',
    icon: '💬',
    subjects: ['English', 'Arabic', 'Amharic', 'Afaan Oromo', 'French', 'Other Language'],
  },
  sciences: {
    label: 'Sciences and Mathematics',
    icon: '🔬',
    subjects: ['Mathematics', 'Physics', 'Biology', 'Chemistry', 'Other Science'],
  },
  business: {
    label: 'Business and Economics',
    icon: '📊',
    subjects: [
      'Business Management',
      'Economics',
      'Accounting',
      'Entrepreneurship',
      'Other Business',
    ],
  },
  leadership: {
    label: 'Leadership and Social',
    icon: '⭐',
    subjects: ['Leadership', 'Communication Skills', 'Psychology', 'Other Social'],
  },
}

export default teachingCategories