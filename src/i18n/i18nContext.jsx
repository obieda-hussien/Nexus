import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const I18nContext = createContext();

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get from localStorage or default to English
    return localStorage.getItem('language') || 'en';
  });

  const [translations, setTranslations] = useState(
    language === 'ar' ? arTranslations : enTranslations
  );

  useEffect(() => {
    // Update translations when language changes
    setTranslations(language === 'ar' ? arTranslations : enTranslations);
    localStorage.setItem('language', language);
    
    // Update document direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, fallback = '') => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || fallback || key;
  };

  const changeLanguage = (lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguage(lang);
    }
  };

  return (
    <I18nContext.Provider value={{ t, language, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};
