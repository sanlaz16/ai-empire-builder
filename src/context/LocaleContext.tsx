'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDict, DEFAULT_LOCALE, type Locale, type Dictionary } from '@/i18n';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dict: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  dict: getDict(DEFAULT_LOCALE),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const dict = getDict(locale);

  // Persist locale preference
  useEffect(() => {
    const stored = localStorage.getItem('empire-locale') as Locale | null;
    if (stored && (stored === 'pt-BR' || stored === 'en')) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('empire-locale', l);
  };

  // Dot-notation lookup with safe fallback
  const t = (key: string): string => {
    const parts = key.split('.');
    let current: unknown = dict;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in (current as object)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return key; // fallback to key if not found
      }
    }
    return typeof current === 'string' ? current : key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
