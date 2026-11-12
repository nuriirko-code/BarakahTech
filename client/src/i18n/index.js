import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import am from './locales/am.json'
import om from './locales/om.json'
import policyEn from './policies/en.json'
import policyAm from './policies/am.json'
import policyOm from './policies/om.json'

// Each locale file groups interface copy by feature namespace. Missing entries
// resolve to English so partially translated screens never expose raw keys.
const resources = {
  en: { translation: { ...en, policies: policyEn } },
  am: { translation: { ...am, policies: policyAm } },
  om: { translation: { ...om, policies: policyOm } },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'am', 'om'],
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

const updateDocumentLanguage = (language) => {
  const supportedLanguage = ['en', 'am', 'om'].includes(language) ? language : 'en'
  document.documentElement.lang = supportedLanguage
  // Amharic and Afaan Oromo use left-to-right layout; Arabic is not currently supported.
  document.documentElement.dir = 'ltr'
}

updateDocumentLanguage(i18n.resolvedLanguage || 'en')
i18n.on('languageChanged', updateDocumentLanguage)

export default i18n
