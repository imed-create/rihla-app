import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import ar from '@/locales/ar.json';

export type AppLocale = 'en' | 'fr' | 'ar';

export const LOCALES: AppLocale[] = ['en', 'fr', 'ar'];

const LOCALE_SECURE_KEY = 'sahel_app_locale';

type TranslationDict = Record<string, unknown>;

const translations: Record<AppLocale, TranslationDict> = { en, fr, ar };

function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'fr' || value === 'ar';
}

function deviceLocale(): AppLocale {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  if (code === 'fr' || code === 'ar') return code;
  return 'en';
}

let currentLocale: AppLocale = deviceLocale();
let hydrated = false;

function lookup(dict: TranslationDict, scope: string): string | undefined {
  const parts = scope.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as TranslationDict)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(str: string, options?: Record<string, string | number>): string {
  if (!options) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = options[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

/** Load persisted locale from SecureStore (call once at app boot). */
export async function hydrateLocale(): Promise<AppLocale> {
  if (hydrated) return currentLocale;
  try {
    const stored = await SecureStore.getItemAsync(LOCALE_SECURE_KEY);
    if (isAppLocale(stored)) {
      currentLocale = stored;
    } else {
      currentLocale = deviceLocale();
      await SecureStore.setItemAsync(LOCALE_SECURE_KEY, currentLocale);
    }
  } catch {
    currentLocale = deviceLocale();
  }
  hydrated = true;
  return currentLocale;
}

export function getLocale(): AppLocale {
  return currentLocale;
}

export async function setI18nLocale(locale: AppLocale): Promise<void> {
  currentLocale = locale;
  hydrated = true;
  try {
    await SecureStore.setItemAsync(LOCALE_SECURE_KEY, locale);
  } catch {
    /* in-memory locale still applies */
  }
}

/** Sync wrapper for stores — persists locale in the background. */
export function setI18nLocaleSync(locale: AppLocale): void {
  currentLocale = locale;
  hydrated = true;
  void SecureStore.setItemAsync(LOCALE_SECURE_KEY, locale);
}

export function t(scope: string, options?: Record<string, string | number>): string {
  const primary = lookup(translations[currentLocale], scope);
  const fallback = currentLocale !== 'en' ? lookup(translations.en, scope) : undefined;
  const value = primary ?? fallback ?? scope;
  return interpolate(value, options);
}

const i18n = {
  get locale() {
    return currentLocale;
  },
  set locale(locale: AppLocale) {
    setI18nLocaleSync(locale);
  },
  enableFallback: true,
  defaultLocale: 'en' as AppLocale,
  t,
  hydrateLocale,
  setI18nLocale,
};

export default i18n;
