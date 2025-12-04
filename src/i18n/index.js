import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import zh from './locales/zh.json';

// Get saved language preference or default to browser language
const getDefaultLocale = () => {
  const saved = localStorage.getItem('preferredLanguage');
  if (saved) return saved;
  
  const browserLang = navigator.language.split('-')[0];
  const supported = ['en', 'es', 'fr', 'de', 'hi', 'zh'];
  return supported.includes(browserLang) ? browserLang : 'en';
};

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    es,
    fr,
    de,
    hi,
    zh,
  },
  pluralizationRules: {
    en: (choice, choicesLength) => {
      if (choice === 0) return 0;
      return choice === 1 ? 1 : 2;
    },
    es: (choice) => {
      return choice === 1 ? 1 : 2;
    },
    fr: (choice) => {
      return choice === 1 ? 1 : 2;
    },
    de: (choice) => {
      return choice === 1 ? 1 : 2;
    },
    hi: (choice) => {
      return choice === 1 ? 1 : 2;
    },
    zh: () => 1,
  }
});

export default i18n;

