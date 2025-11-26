import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your language JSON files
import en from './translations/en.json';
import fr from './translations/fr.json';   // or ur if you’re using Urdu

// Resource bundle
const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Initialize
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',            // default language
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
  });

export default i18next;