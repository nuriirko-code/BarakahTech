import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// i18n means internationalization: the 18 letters between the first "i" and
// last "n". For this MVP, translations live in one file so they are easy to
// review; later, each language can move into its own feature-based files.
// Dashboard tools remain English for now to keep the MVP scope manageable.
const resources = {
  en: {
    translation: {
      nav_home: 'Home', nav_courses: 'Courses', nav_find_tutor: 'Find a Tutor', nav_sign_up: 'Sign Up', nav_login: 'Login', nav_logout: 'Logout', nav_dashboard: 'Dashboard', nav_language: 'Language',
      nav_browse_all: 'Browse All Courses',
      cat_technology: 'Technology', cat_languages: 'Languages', cat_sciences: 'Sciences', cat_business: 'Business', cat_leadership: 'Leadership',
      hero_badge: 'Learn From Anywhere · Teach From Anywhere', hero_title_1: 'Learn From Expert Tutors', hero_title_2: 'In Your Own Language', hero_subtitle: 'Connect with qualified tutors for live sessions, structured courses, and personalized learning — all on one platform', hero_cta_student: 'Start Learning Free', hero_cta_teacher: 'Become a Teacher', hero_stat_courses: 'Courses', hero_stat_tutors: 'Tutors', hero_stat_students: 'Students', hero_stat_subjects: 'Subjects',
      footer_description: 'A learning platform for structured courses, live teaching, and practical growth.', footer_explore: 'Explore', footer_learn: 'For Students', footer_teach: 'For Teachers', footer_platform: 'Platform', footer_browse_courses: 'Browse Courses', footer_find_tutor: 'Find a Tutor', footer_how_it_works: 'How It Works', footer_become_teacher: 'Teach with Us', footer_apply_tutor: 'Offer Live Sessions', footer_about: 'About Us', footer_contact: 'Contact', footer_rights: 'All rights reserved.',
      public_courses_title: 'Explore Our Courses', public_courses_subtitle: 'Learn from qualified teachers at your own pace.', public_tutors_title: 'Find Your Perfect Tutor', public_tutors_subtitle: 'One-to-one live learning with qualified tutors in your language.', search_courses: 'Search courses...', results_count: 'Showing {{count}} courses',
    },
  },
  am: {
    translation: {
      nav_home: 'መነሻ', nav_courses: 'ኮርሶች', nav_find_tutor: 'አስተማሪ ፈልግ', nav_sign_up: 'ተመዝገብ', nav_login: 'ግባ', nav_logout: 'ውጣ', nav_dashboard: 'ዳሽቦርድ', nav_language: 'ቋንቋ',
      nav_browse_all: 'ሁሉንም ኮርሶች ይመልከቱ',
      cat_technology: 'ቴክኖሎጂ', cat_languages: 'ቋንቋዎች', cat_sciences: 'ሳይንስ', cat_business: 'ቢዝነስ', cat_leadership: 'አመራር',
      hero_badge: 'ከማንኛውም ቦታ ተማር · ከማንኛውም ቦታ አስተምር', hero_title_1: 'ከባለሙያ አስተማሪዎች ተማር', hero_title_2: 'በራስህ ቋንቋ', hero_subtitle: 'ለቀጥታ ክፍለ ጊዜዎች፣ ለተዋቀሩ ኮርሶች እና ለግል ትምህርት ከብቁ አስተማሪዎች ጋር ተገናኝ', hero_cta_student: 'ነጻ መማር ጀምር', hero_cta_teacher: 'አስተማሪ ሁን', hero_stat_courses: 'ኮርሶች', hero_stat_tutors: 'አስተማሪዎች', hero_stat_students: 'ተማሪዎች', hero_stat_subjects: 'ትምህርቶች',
      footer_description: 'ለተዋቀሩ ኮርሶች፣ ለቀጥታ ትምህርት እና ለተግባራዊ እድገት የተገነባ የመማሪያ መድረክ።', footer_explore: 'ያስሱ', footer_learn: 'ለተማሪዎች', footer_teach: 'ለአስተማሪዎች', footer_platform: 'መድረክ', footer_browse_courses: 'ኮርሶችን ይመልከቱ', footer_find_tutor: 'አስተማሪ ይፈልጉ', footer_how_it_works: 'እንዴት ይሰራል', footer_become_teacher: 'ከእኛ ጋር ያስተምሩ', footer_apply_tutor: 'ቀጥታ ክፍለ ጊዜዎች ያቅርቡ', footer_about: 'ስለ እኛ', footer_contact: 'ያግኙን', footer_rights: 'መብቱ በሕግ የተጠበቀ ነው።',
      public_courses_title: 'ኮርሶቻችንን ያስሱ', public_courses_subtitle: 'በራስዎ ፍጥነት ከብቁ አስተማሪዎች ይማሩ።', public_tutors_title: 'ተስማሚ አስተማሪዎን ያግኙ', public_tutors_subtitle: 'በእርስዎ ቋንቋ ከብቁ አስተማሪዎች ጋር የአንድ ለአንድ ቀጥታ ትምህርት።', search_courses: 'ኮርሶችን ይፈልጉ...', results_count: '{{count}} ኮርሶች ታይተዋል',
    },
  },
  om: {
    translation: {
      nav_home: 'Mana', nav_courses: 'Koorsota', nav_find_tutor: 'Barsiisaa Barbaadi', nav_sign_up: 'Galmaa’i', nav_login: 'Seeni', nav_logout: 'Ba’i', nav_dashboard: 'Gabatee', nav_language: 'Afaan',
      nav_browse_all: 'Koorsota Hunda Ilaali',
      cat_technology: 'Teeknooloojii', cat_languages: 'Afaanota', cat_sciences: 'Saayinsii', cat_business: 'Daldalaa', cat_leadership: 'Hoogganummaa',
      hero_badge: 'Bakka kamirraayyuu Baradhu · Bakka kamirraayyuu Barsiisi', hero_title_1: 'Barsiisota Ogeeyyii irraa Baradhu', hero_title_2: 'Afaan Keetiin', hero_subtitle: 'Barsiisota muuxannoo qaban waliin walqunnamtii uumi — koorsota, leenjii kallattii fi barnoota dhuunfaa', hero_cta_student: 'Baruumsaa Bilisaa Jalqabi', hero_cta_teacher: 'Barsiisaa Ta’i', hero_stat_courses: 'Koorsota', hero_stat_tutors: 'Barsiisota', hero_stat_students: 'Barattoota', hero_stat_subjects: 'Mata-duree',
      footer_description: 'Waltajjii barnootaa koorsota qindaa’an, barsiisa kallattii fi guddina hojii irra ooluuf ijaarame.', footer_explore: 'Sakatta’i', footer_learn: 'Barattootaaf', footer_teach: 'Barsiisotaaf', footer_platform: 'Marsariitii', footer_browse_courses: 'Koorsota Ilaali', footer_find_tutor: 'Barsiisaa Barbaadi', footer_how_it_works: 'Akkamitti Hojjeta', footer_become_teacher: 'Nu waliin Barsiisi', footer_apply_tutor: 'Barnoota Kallattii Kenni', footer_about: 'Waa’ee Keenya', footer_contact: 'Nu Quunnamaa', footer_rights: 'Mirgi hundi seeraan eegameera.',
      public_courses_title: 'Koorsota Keenya Sakatta’i', public_courses_subtitle: 'Saffisa keetiin barsiisota gahumsa qaban irraa baradhu.', public_tutors_title: 'Barsiisaa Siif Ta’u Barbaadi', public_tutors_subtitle: 'Afaan keetiin barsiisota gahumsa qaban waliin barnoota kallattii tokkoon-tokko.', search_courses: 'Koorsota barbaadi...', results_count: 'Koorsota {{count}} agarsiisaa jira',
    },
  },
  ar: {
    translation: {
      nav_home: 'الرئيسية', nav_courses: 'الدورات', nav_find_tutor: 'ابحث عن مدرس', nav_sign_up: 'إنشاء حساب', nav_login: 'تسجيل الدخول', nav_logout: 'تسجيل الخروج', nav_dashboard: 'لوحة التحكم', nav_language: 'اللغة',
      nav_browse_all: 'تصفح جميع الدورات',
      cat_technology: 'التكنولوجيا', cat_languages: 'اللغات', cat_sciences: 'العلوم', cat_business: 'الأعمال', cat_leadership: 'القيادة',
      hero_badge: 'تعلم من أي مكان · علّم من أي مكان', hero_title_1: 'تعلم من مدرسين خبراء', hero_title_2: 'بلغتك الخاصة', hero_subtitle: 'تواصل مع مدرسين مؤهلين للجلسات المباشرة والدورات المنظمة والتعلم الشخصي', hero_cta_student: 'ابدأ التعلم مجاناً', hero_cta_teacher: 'كن مدرساً', hero_stat_courses: 'دورة', hero_stat_tutors: 'مدرس', hero_stat_students: 'طالب', hero_stat_subjects: 'مادة',
      footer_description: 'منصة تعليمية للدورات المنظمة والتعليم المباشر والنمو العملي.', footer_explore: 'استكشف', footer_learn: 'للطلاب', footer_teach: 'للمدرسين', footer_platform: 'المنصة', footer_browse_courses: 'تصفح الدورات', footer_find_tutor: 'ابحث عن مدرس', footer_how_it_works: 'كيف تعمل المنصة', footer_become_teacher: 'درّس معنا', footer_apply_tutor: 'قدّم جلسات مباشرة', footer_about: 'من نحن', footer_contact: 'اتصل بنا', footer_rights: 'جميع الحقوق محفوظة.',
      public_courses_title: 'استكشف دوراتنا', public_courses_subtitle: 'تعلّم من مدرسين مؤهلين بالوتيرة التي تناسبك.', public_tutors_title: 'اعثر على المدرس المناسب', public_tutors_subtitle: 'تعلم مباشر فردي مع مدرسين مؤهلين بلغتك.', search_courses: 'ابحث عن الدورات...', results_count: 'عرض {{count}} دورة',
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Missing keys fall back to English instead of showing raw IDs.
    supportedLngs: ['en', 'am', 'om', 'ar'],
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      // localStorage remembers an intentional language selection after refresh.
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

const updateDocumentLanguage = (language) => {
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}

updateDocumentLanguage(i18n.resolvedLanguage || 'en')
i18n.on('languageChanged', updateDocumentLanguage)

export default i18n
