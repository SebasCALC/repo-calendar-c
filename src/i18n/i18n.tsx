import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from './en.json';
import esTranslations from './es.json';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: any;
}

interface I18nContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  es: esTranslations,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get saved language from localStorage, default to Spanish
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key itself if not found in any language
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};