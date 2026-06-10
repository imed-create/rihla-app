/**
 * RIHLA — Profile Tab (Uber-Style Redesign)
 * Premium layout: Gradient guest hero → signed-in profile with stats, info, settings
 */

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
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, UserRole } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from '@/context/I18nContext';
import UberButton from '@/components/shared/UberButton';
import { RIHLA } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut, activeBookings, pastBookings, updateUser } = useApp();
  const { signOut: clerkSignOut, isSignedIn: clerkSignedIn } = useAuth();
  const { t } = useTranslation();

  const isSignedIn = clerkSignedIn || !!user.email;

  const handleRoleSwitch = (role: UserRole, businessType?: string) => {
    updateUser({
      email: `${role}${businessType ? `-${businessType}` : ''}@demo.com`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)} ${businessType ? `(${businessType})` : ''}`,
      role: role,
      kycStatus: 'approved',
      isOnboarded: true,
      kycData: {
        fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)} ${businessType ? `(${businessType})` : ''}`,
        phone: '+213 555 12 34 56',
        nationality: 'Algerian',
        ...(role === 'business' && { businessType: businessType || 'hotel' }),
        ...(role === 'partner' && { serviceType: 'jetski' }),
      }
    });
    Alert.alert('Demo Role Active', `Switched to ${role} ${businessType ? `(${businessType})` : ''} mode!`);
  };

  const handleSignOut = async () => {
    Alert.alert(t('profile.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          try { await clerkSignOut(); } catch { /* noop */ }
          signOut();
          router.replace('/(auth)/login');
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

  // ── GUEST STATE ──
  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.guestScroll} showsVerticalScrollIndicator={false}>
          {/* Gradient Hero */}
          <LinearGradient colors={[RIHLA.primary, '#0d3b66']} style={styles.guestHero}>
            <View style={styles.guestHeroContent}>
              <View style={styles.guestAvatarCircle}>
                <Ionicons name="person-outline" size={36} color="#FFFFFF" />
              </View>
              <Text style={styles.guestHeroTitle}>Your Account</Text>
              <Text style={styles.guestHeroSub}>Sign in to access your trips, bookings, and more.</Text>
              <UberButton
                title="Sign In"
                bgVariant="primary"
                onPress={() => router.push('/(auth)/login')}
                style={{ width: '100%', maxWidth: 280, marginTop: 8 }}
              />
            </View>
          </LinearGradient>

          {/* Demo experience cards */}
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionLabel}>Try RIHLA as...</Text>
            <DemoRoleCard icon="compass-outline" label="Traveler" desc="Explore and book experiences" color="#00a896" onPress={() => handleRoleSwitch('traveler')} />
            <DemoRoleCard icon="business-outline" label="Business Owner (Hotel)" desc="List and manage your business" color={RIHLA.primary} onPress={() => handleRoleSwitch('business', 'hotel')} />
            <DemoRoleCard icon="restaurant-outline" label="Business Owner (Restaurant)" desc="Manage restaurant bookings" color="#e08f47" onPress={() => handleRoleSwitch('business', 'restaurant')} />
            <DemoRoleCard icon="flash-outline" label="Service Partner" desc="Rent your assets and earn" color="#f4a261" onPress={() => handleRoleSwitch('partner')} />

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(modals)/settings')}>
              <View style={[styles.menuIcon, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="settings-outline" size={18} color="#64748B" />
              </View>
              <Text style={styles.menuLabel}>Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(modals)/settings')}>
              <View style={[styles.menuIcon, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="help-circle-outline" size={18} color="#64748B" />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── SIGNED-IN STATE ──
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.signedHeader}>
        <Text style={styles.signedHeaderTitle}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(modals)/settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
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
              {user.kycData.fullName || user.name || 'Traveler'}
            </Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color="#00a896" />
              <Text style={styles.verifiedText}>Verified Account</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeBookings.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pastBookings.filter((b) => b.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.totalVisits}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow label="Full Name" value={user.kycData.fullName || '—'} />
          <InfoRow label="Phone" value={user.kycData.phone || user.phone || '—'} />
          <InfoRow label="Nationality" value={user.kycData.nationality || '—'} />
          <InfoRow label="KYC Status" value={user.kycStatus === 'approved' ? 'Verified ✅' : 'Pending'} valueColor="#00a896" />
        </View>

        <View style={styles.divider} />

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: RIHLA.primary + '15' }]}>
              <Ionicons name="settings-outline" size={18} color={RIHLA.primary} />
            </View>
            <Text style={styles.menuLabel}>Settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#00a896' + '15' }]}>
              <Ionicons name="notifications-outline" size={18} color="#00a896" />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#f4a261' + '15' }]}>
              <Ionicons name="help-circle-outline" size={18} color="#f4a261" />
            </View>
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Role Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Switcher (Testing)</Text>
          <DemoRoleCard icon="compass-outline" label="Traveler" desc="Explore and book" color="#00a896" onPress={() => handleRoleSwitch('traveler')} />
          <DemoRoleCard icon="business-outline" label="Business (Hotel)" desc="Manage hotel listings" color={RIHLA.primary} onPress={() => handleRoleSwitch('business', 'hotel')} />
          <DemoRoleCard icon="restaurant-outline" label="Business (Restaurant)" desc="Manage restaurant" color="#e08f47" onPress={() => handleRoleSwitch('business', 'restaurant')} />
          <DemoRoleCard icon="flash-outline" label="Service Partner" desc="Rent assets and earn" color="#f4a261" onPress={() => handleRoleSwitch('partner')} />
        </View>

        <View style={styles.divider} />

        {/* Sign Out */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
          <UberButton
            title="Sign Out"
            bgVariant="danger"
            onPress={handleSignOut}
            IconLeft={() => <Ionicons name="log-out-outline" size={18} color="#fff" />}
          />
        </View>

        <Text style={styles.versionText}>RIHLA v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── SUB-COMPONENTS ──

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function DemoRoleCard({ icon, label, desc, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.demoCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.demoIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.demoInfo}>
        <Text style={styles.demoLabel}>{label}</Text>
        <Text style={styles.demoDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

// ── STYLES ──

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Guest hero
  guestScroll: { flexGrow: 1 },
  guestHero: { paddingTop: 40, paddingBottom: 36, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  guestHeroContent: { gap: 10, alignItems: 'center' },
  guestAvatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  guestHeroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#FFFFFF', marginTop: 4, letterSpacing: -0.5 },
  guestHeroSub: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, maxWidth: 280 },

  sectionWrapper: { padding: 20, gap: 4 },
  sectionLabel: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 8 },

  // Demo role cards
  demoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 14,
    backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  demoIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  demoInfo: { flex: 1, gap: 2 },
  demoLabel: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  demoDesc: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },

  // Signed-in header
  signedHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0',
  },
  signedHeaderTitle: { fontSize: 24, fontFamily: 'mon-b', color: '#0F172A' },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  scroll: { paddingBottom: 48 },
  profileTop: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 24, paddingVertical: 20,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  avatarLetter: { fontSize: 28, fontFamily: 'mon-b', color: '#64748B' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  profileNameBlock: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 13, fontFamily: 'mon', color: '#00a896' },

  // Stats
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 20, alignItems: 'center',
  },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },
  statValue: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },

  divider: {
    height: 8, backgroundColor: '#fafbfc',
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },

  section: { paddingHorizontal: 24, paddingVertical: 20, gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 4 },

  // Info
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F1F5F9',
  },
  infoLabel: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  infoValue: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },

  // Menu rows
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F1F5F9',
  },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'mon-sb', color: '#0F172A' },

  versionText: {
    textAlign: 'center', fontSize: 12, fontFamily: 'mon', color: '#CBD5E1', paddingBottom: 8,
  },
});
