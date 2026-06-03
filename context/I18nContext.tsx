import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { t as translate, AppLocale, getLocale, hydrateLocale } from '@/lib/i18n';
import { useSettingsStore } from '@/store/useSettingsStore';

type I18nContextValue = {
  locale: AppLocale;
  t: (scope: string, options?: Record<string, string | number>) => string;
  setLocale: (locale: AppLocale) => void;
  /** Bump to re-render tree after locale change */
  version: number;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSettingsStore((s) => s.locale);
  const setLocaleStore = useSettingsStore((s) => s.setLocale);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    void hydrateLocale().then(() => setVersion((v) => v + 1));
  }, []);

  const setLocale = useCallback(
    (next: AppLocale) => {
      setLocaleStore(next);
      setVersion((v) => v + 1);
    },
    [setLocaleStore]
  );

  const value = useMemo(
    () => ({
      locale: locale ?? getLocale(),
      t: (scope: string, options?: Record<string, string | number>) => translate(scope, options),
      setLocale,
      version,
    }),
    [locale, setLocale, version]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation requires I18nProvider');
  return ctx;
}
