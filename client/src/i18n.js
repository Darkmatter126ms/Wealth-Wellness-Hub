import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

i18n
  .use(LanguageDetector)       // detects browser language, persists choice in localStorage
  .use(initReactI18next)       // passes i18n down to React via context
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      hi: { translation: hi },
      es: { translation: es },
      fr: { translation: fr },
    },
    fallbackLng: 'en',          // always fall back to English if a key is missing
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ww_lang',
    },
    interpolation: {
      escapeValue: false,       // React already escapes values
    },
  });

export default i18n;
