import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return <button type="button" className="icon-btn" title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'} onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')} aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}><Languages size={17} /></button>;
}
