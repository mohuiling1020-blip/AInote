'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import translations, { type Locale } from './translations';

interface LanguageContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: typeof translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getDefaultLocale(): Locale {
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getDefaultLocale);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  const value = useMemo(
    () => ({ locale, toggleLocale, t: translations }),
    [locale, toggleLocale]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
