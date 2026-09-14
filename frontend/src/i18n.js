import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { language: 'English', switchLanguage: 'العربية', loading: 'Loading...' } },
  ar: { translation: { language: 'العربية', switchLanguage: 'English', loading: 'جار التحميل...' } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('locale') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
