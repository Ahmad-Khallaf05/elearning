import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext(null);
const rtlLocales = new Set(['ar']);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => localStorage.getItem('locale') || 'en');

  useEffect(() => {
    const direction = rtlLocales.has(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.documentElement.classList.toggle('locale-ar', direction === 'rtl');
    document.documentElement.classList.toggle('locale-en', direction === 'ltr');
    localStorage.setItem('locale', locale);
    i18n.changeLanguage(locale);
  }, [locale]);

  const setLocale = (nextLocale) => setLocaleState(nextLocale === 'ar' ? 'ar' : 'en');
  return <LanguageContext.Provider value={{ locale, direction: rtlLocales.has(locale) ? 'rtl' : 'ltr', setLocale }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
