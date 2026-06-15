import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/context/I18nContext';
import { AppLocale, LOCALES } from '@/lib/i18n';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTheme } from '@/context/ThemeContext';
import SettingsGroup from '@/components/settings/SettingsGroup';
import { SettingsNavRow, SettingsToggleRow } from '@/components/settings/SettingsRow';
import { scheduleLocalNotification } from '@/hooks/useNotifications';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { safeGoBack } from '@/utils/safeNavigation';

const LANGUAGE_FLAGS: Record<AppLocale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇩🇿',
};

export default function SettingsScreen() {
  const { t, locale, setLocale } = useTranslation();
  const { mode: themeMode, toggleMode: toggleTheme, colors } = useTheme();
  const pushNotifications = useSettingsStore((s) => s.pushNotifications);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setPushNotifications = useSettingsStore((s) => s.setPushNotifications);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const { signOut: appSignOut } = useApp();
  const { signOut: clerkSignOut, isSignedIn } = useAuth();
  const [langOpen, setLangOpen] = useState(false);

  const handleTestNotification = async () => {
    if (!pushNotifications) {
      Alert.alert(t('settings.notifications'), 'Enable push notifications first.');
      return;
    }
    await scheduleLocalNotification(
      t('brand.name'),
      t('settings.notificationScheduledBody')
    );
    Alert.alert(t('settings.notificationScheduled'), t('settings.notificationScheduledBody'));
  };

  const pickLanguage = (code: AppLocale) => {
    setLocale(code);
    setLangOpen(false);
    if (code === 'ar') {
      Alert.alert(
        t('settings.language'),
        'Arabic layout may require restarting the app for full RTL support.'
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          try {
            await clerkSignOut();
          } catch {
            /* noop */
          }
          appSignOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => safeGoBack('/(tabs)/profile')} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={colors.icon} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SettingsGroup title={t('settings.account')}>
          <SettingsNavRow
            icon="person-outline"
            iconColor="#0a2540"
            label={t('settings.editProfile')}
            subtitle={t('settings.editProfileSub')}
            onPress={() => {
              router.dismiss();
              router.push('/(tabs)/profile');
            }}
          />
          <SettingsNavRow
            icon="language-outline"
            iconColor="#0a2540"
            label={t('settings.language')}
            subtitle={t('settings.languageSub')}
            value={t(`settings.languages.${locale}`)}
            onPress={() => setLangOpen(true)}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.preferences')}>
          <SettingsToggleRow
            icon="moon-outline"
            label="Dark Mode"
            subtitle="Switch between dark and light theme"
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
          />
          <SettingsToggleRow
            icon="notifications-outline"
            label={t('settings.notifications')}
            subtitle={t('settings.notificationsSub')}
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />
          <SettingsToggleRow
            icon="phone-portrait-outline"
            label={t('settings.haptics')}
            subtitle={t('settings.hapticsSub')}
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
          />
          <SettingsNavRow
            icon="cash-outline"
            iconColor="#f4a261"
            label={t('settings.currency')}
            subtitle={t('settings.currencySub')}
            value={t('settings.currencyValue')}
            showChevron={false}
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title={t('settings.privacy')}>
          <SettingsNavRow
            icon="help-circle-outline"
            iconColor="#00a896"
            label={t('settings.help')}
            subtitle={t('settings.helpSub')}
            onPress={() => Linking.openURL('mailto:support@saheel.dz')}
          />
          <SettingsNavRow
            icon="document-text-outline"
            iconColor={colors.muted}
            label={t('settings.terms')}
            onPress={() => Linking.openURL('https://saheel.dz/terms')}
          />
          <SettingsNavRow
            icon="shield-checkmark-outline"
            iconColor={colors.muted}
            label={t('settings.privacyPolicy')}
            onPress={() => Linking.openURL('https://saheel.dz/privacy')}
          />
          <SettingsNavRow
            icon="information-circle-outline"
            iconColor="#0a2540"
            label={t('settings.about')}
            subtitle={t('settings.aboutSub')}
            onPress={() =>
              Alert.alert(t('settings.about'), t('brand.tagline'))
            }
            isLast
          />
        </SettingsGroup>

        {isSignedIn && (
          <SettingsGroup>
            <SettingsNavRow
              icon="notifications-outline"
              iconColor="#00a896"
              label={t('settings.testNotification')}
              subtitle={t('settings.testNotificationSub')}
              onPress={handleTestNotification}
            />
            <Pressable onPress={handleSignOut} style={[styles.signOutBtn, { borderTopColor: colors.border }]}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
            </Pressable>
          </SettingsGroup>
        )}

        <Text style={[styles.version, { color: colors.muted }]}>{t('profile.version', { version: '1.0' })}</Text>
      </ScrollView>

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLangOpen(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.chooseLanguage')}</Text>
            {LOCALES.map((code) => (
              <Pressable
                key={code}
                onPress={() => pickLanguage(code)}
                style={[styles.langRow, locale === code && styles.langRowActive]}
              >
                <Text style={styles.langFlag}>{LANGUAGE_FLAGS[code]}</Text>
                <Text style={[styles.langLabel, { color: colors.text }, locale === code && styles.langLabelActive]}>
                  {t(`settings.languages.${code}`)}
                </Text>
                {locale === code ? (
                  <Ionicons name="checkmark-circle" size={22} color="#0a2540" />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'mon-b', color: '#FFFFFF' },
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  signOutText: { fontSize: 15, fontFamily: 'mon-sb', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12, fontFamily: 'mon' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 4,
  },
  modalTitle: { fontSize: 18, fontFamily: 'mon-b', marginBottom: 12 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  langRowActive: { backgroundColor: '#FFF1F2' },
  langFlag: { fontSize: 22 },
  langLabel: { flex: 1, fontSize: 16, fontFamily: 'mon-sb' },
  langLabelActive: { color: '#0a2540' },
});
