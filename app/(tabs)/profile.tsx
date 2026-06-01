import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { scheduleLocalNotification } from '@/hooks/useNotifications';

export default function ProfileScreen() {
  const { user, updateUser, signOut, activeBookings, pastBookings } = useApp();
  const { signOut: clerkSignOut, isSignedIn: clerkSignedIn } = useAuth();

  const isSignedIn = clerkSignedIn || !!user.email;

  const handleSignOut = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await clerkSignOut();
          } catch (e) {}
          signOut();
          router.replace('/(modals)/login');
        },
      },
    ]);
  };

  const testNotification = async () => {
    await scheduleLocalNotification(
      'Booking Confirmed! ✈️',
      'Your trip to Algiers has been successfully booked. Tap to view details.'
    );
    Alert.alert('Notification Scheduled', 'You should receive a push notification momentarily.');
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    // Avatar logic here
  };

  const avatarLetter = user?.kycData?.fullName
    ? user.kycData.fullName[0].toUpperCase()
    : (user?.name ? user.name[0].toUpperCase() : 'T');

  // ── GUEST VIEW ──
  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.guestContainer}>
          <View style={styles.guestIconWrap}>
            <Ionicons name="person-outline" size={36} color="#94A3B8" />
          </View>
          <Text style={styles.guestTitle}>Log in to your account</Text>
          <Text style={styles.guestSub}>
            View your bookings, manage your account, and unlock more features.
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(modals)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Log In or Sign Up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Settings even for guests */}
          <View style={styles.settingsSection}>
            <SettingRow icon="help-circle-outline" label="Help & Support" color="#64748B" onPress={() => {}} />
            <SettingRow icon="globe-outline" label="Language" color="#64748B" onPress={() => {}} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── SIGNED IN VIEW ──
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.profileTop}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
            {user.kycData.selfieUri
              ? <Image source={{ uri: user.kycData.selfieUri }} style={styles.avatar} />
              : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                </View>
              )
            }
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={11} color="#fff" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileNameBlock}>
            <Text style={styles.profileName}>{user.kycData.fullName || user.name || 'Traveler'}</Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.verifiedText}>Verified account</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Active" value={String(activeBookings.length)} icon="flash-outline" color="#0096C7" />
          <View style={styles.statDivider} />
          <StatCard label="Completed" value={String(pastBookings.filter(b => b.status === 'completed').length)} icon="checkmark-circle-outline" color="#059669" />
          <View style={styles.statDivider} />
          <StatCard label="Total Trips" value={String(user.totalVisits)} icon="compass-outline" color="#F59E0B" />
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Personal info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal info</Text>
          <View style={styles.infoList}>
            <InfoRow icon="person-outline" label="Full Name" value={user.kycData.fullName || '—'} />
            <InfoRow icon="call-outline" label="Phone" value={user.kycData.phone || user.phone || '—'} />
            <InfoRow icon="globe-outline" label="Nationality" value={user.kycData.nationality || '—'} />
            <InfoRow icon="shield-checkmark-outline" label="KYC Status" value="Verified ✓" valueColor="#059669" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsSection}>
            <SettingRow icon="notifications-outline" label="Test Notifications" color="#0096C7" onPress={testNotification} />
            <SettingRow icon="language-outline" label="Language" color="#7C3AED" onPress={() => {}} />
            <SettingRow icon="help-circle-outline" label="Help & Support" color="#059669" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>TourDZ v1.0 · Algeria 🇩🇿</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, valueColor }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, color, onPress }: any) {
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

  // Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontFamily: 'mon-b', fontSize: 24, color: '#000000' },

  // Guest view
  guestContainer: {
    padding: 24,
    flex: 1,
  },
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
    backgroundColor: '#FF385C',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginBtnText: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },

  // Scroll
  scroll: { paddingBottom: 48 },

  // Profile top
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
  verifiedText: { fontSize: 13, fontFamily: 'mon', color: '#059669' },

  // Stats
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

  // Divider
  divider: {
    height: 8,
    backgroundColor: '#F8FAFC',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },

  // Section
  section: { paddingHorizontal: 24, paddingVertical: 20, gap: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#000000' },

  // Info rows
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

  // Settings
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

  // Sign out
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  signOutText: { fontSize: 15, fontFamily: 'mon-sb', color: '#EF4444' },

  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'mon',
    color: '#CBD5E1',
    paddingBottom: 8,
  },
});
