import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ملفات الترجمة
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import arSettingsFix from '../locales/ar-settings-fix.json';
import arLeadsFix from '../locales/ar-leads-fix.json';

const deepMerge = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

// دمج إصلاحات الإعدادات والليدز فوق ترجمة العربية الأساسية
let arMerged = deepMerge(JSON.parse(JSON.stringify(ar)), arSettingsFix);
arMerged = deepMerge(arMerged, arLeadsFix);

const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: arMerged,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    // Remove forced lng setting to allow language detection to work
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React يتعامل مع الـ escaping
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language', // Use our custom key
    },

    react: {
      useSuspense: false,
    },

    // Add missing key handler
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
      return fallbackValue || key;
    },

    // Add saveMissing to help identify missing keys
    saveMissing: process.env.NODE_ENV === 'development',
  });

// Ensure Arabic is set as default
if (process.env.NODE_ENV === 'development') {
  console.log('i18n initialized with language:', i18n.language);
  console.log('Available languages:', Object.keys(resources));
}

export default i18n;
