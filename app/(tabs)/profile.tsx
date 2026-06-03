import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/context/I18nContext';

export default function ProfileScreen() {
  const { user, signOut, activeBookings, pastBookings } = useApp();
  const { signOut: clerkSignOut, isSignedIn: clerkSignedIn } = useAuth();
  const { t } = useTranslation();

  const isSignedIn = clerkSignedIn || !!user.email;

  const handleSignOut = async () => {
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
          signOut();
          router.replace('/(modals)/login');
        },
      },
    ]);
  };

  const pickAvatar = async () => {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
  };

  const avatarLetter = user?.kycData?.fullName
    ? user.kycData.fullName[0].toUpperCase()
    : user?.name
      ? user.name[0].toUpperCase()
      : 'S';

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconWrap}>
            <Ionicons name="person-outline" size={36} color="#94A3B8" />
          </View>
          <Text style={styles.guestTitle}>{t('profile.guestTitle')}</Text>
          <Text style={styles.guestSub}>{t('profile.guestSub')}</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(modals)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>{t('profile.loginCta')}</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.settingsSection}>
            <SettingRow
              icon="settings-outline"
              label={t('settings.title')}
              color="#0a2540"
              onPress={() => router.push('/(modals)/settings')}
            />
            <SettingRow
              icon="help-circle-outline"
              label={t('settings.help')}
              color="#64748B"
              onPress={() => router.push('/(modals)/settings')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(modals)/settings')}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileTop}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
            {user.kycData.selfieUri ? (
              <Image source={{ uri: user.kycData.selfieUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>{avatarLetter}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={11} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileNameBlock}>
            <Text style={styles.profileName}>
              {user.kycData.fullName || user.name || t('roles.traveler')}
            </Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color="#f4a261" />
              <Text style={styles.verifiedText}>{t('profile.verifiedAccount')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard label={t('profile.active')} value={String(activeBookings.length)} />
          <View style={styles.statDivider} />
          <StatCard
            label={t('profile.completed')}
            value={String(pastBookings.filter((b) => b.status === 'completed').length)}
          />
          <View style={styles.statDivider} />
          <StatCard label={t('profile.totalTrips')} value={String(user.totalVisits)} />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          <View style={styles.infoList}>
            <InfoRow label={t('profile.fullName')} value={user.kycData.fullName || '—'} />
            <InfoRow label={t('profile.phone')} value={user.kycData.phone || user.phone || '—'} />
            <InfoRow label={t('profile.nationality')} value={user.kycData.nationality || '—'} />
            <InfoRow
              label={t('profile.kycStatus')}
              value={t('profile.kycVerified')}
              valueColor="#f4a261"
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.settingsSection}>
            <SettingRow
              icon="settings-outline"
              label={t('settings.title')}
              color="#0a2540"
              onPress={() => router.push('/(modals)/settings')}
            />
            <SettingRow
              icon="language-outline"
              label={t('settings.language')}
              color="#0a2540"
              onPress={() => router.push('/(modals)/settings')}
            />
            <SettingRow
              icon="notifications-outline"
              label={t('settings.notifications')}
              color="#00a896"
              onPress={() => router.push('/(modals)/settings')}
            />
            <SettingRow
              icon="help-circle-outline"
              label={t('settings.help')}
              color="#f4a261"
              onPress={() => router.push('/(modals)/settings')}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('profile.version', { version: '1.0' })}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontFamily: 'mon-b', fontSize: 24, color: '#000000' },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  guestContainer: { padding: 24, flex: 1 },
  guestIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  guestTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#000000', marginBottom: 8 },
  guestSub: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 20, marginBottom: 24 },
  loginBtn: {
    backgroundColor: '#0a2540',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginBtnText: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },
  scroll: { paddingBottom: 48 },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarLetter: { fontSize: 28, fontFamily: 'mon-b', color: '#64748B' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileNameBlock: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontFamily: 'mon-b', color: '#000000' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 13, fontFamily: 'mon', color: '#f4a261' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },
  statValue: { fontSize: 20, fontFamily: 'mon-b', color: '#000000' },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  divider: {
    height: 8,
    backgroundColor: '#fafbfc',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  section: { paddingHorizontal: 24, paddingVertical: 20, gap: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#000000' },
  infoList: { gap: 0 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  infoValue: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  settingsSection: { gap: 0 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: 'mon-sb', color: '#0F172A' },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  signOutText: { fontSize: 15, fontFamily: 'mon-sb', color: '#EF4444' },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'mon',
    color: '#CBD5E1',
    paddingBottom: 8,
  },
});
