import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppLocale, setI18nLocaleSync } from '@/lib/i18n';
import { I18nManager } from 'react-native';

export type SettingsState = {
  locale: AppLocale;
  pushNotifications: boolean;
  hapticsEnabled: boolean;
  setLocale: (locale: AppLocale) => void;
  setPushNotifications: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
};

function applyRtl(locale: AppLocale) {
  const rtl = locale === 'ar';
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'en',
      pushNotifications: true,
      hapticsEnabled: true,
      setLocale: (locale) => {
        setI18nLocaleSync(locale);
        applyRtl(locale);
        set({ locale });
      },
      setPushNotifications: (pushNotifications) => set({ pushNotifications }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
    }),
    {
      name: '@saheel_settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          setI18nLocaleSync(state.locale);
          applyRtl(state.locale);
        }
      },
    }
  )
);
