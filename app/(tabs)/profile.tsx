/**
 * RIHLA — Profile Tab (Uber Style — Full Featured)
 * ──────────────────────────────────────────────────
 * Rich profile with avatar, stats, personal info sections,
 * travel preferences preview, documents, emergency contact,
 * and navigation to edit screen.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, UserRole } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
import UberButton from '@/components/shared/UberButton';
import { RIHLA } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, signOut, activeBookings, pastBookings, updateUser } = useApp();
  const { signOut: clerkSignOut } = useAuth();
  const isSignedIn = !!user.email;

  const handleRoleSwitch = (role: UserRole, businessType?: string) => {
    updateUser({
      email: `${role}${businessType ? `-${businessType}` : ''}@demo.com`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      role: role,
      kycStatus: 'approved',
      isOnboarded: true,
      kycData: {
        fullName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        phone: '+213 555 12 34 56',
        nationality: 'Algerian',
        ...(role === 'business' && { businessType: businessType || 'hotel' }),
        ...(role === 'partner' && { serviceType: 'jetski' }),
      }
    });
    Alert.alert('Demo Role Active', `Switched to ${role} mode!`);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try { await clerkSignOut(); } catch { /* noop */ }
          signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const avatarLetter = user?.kycData?.fullName
    ? user.kycData.fullName[0].toUpperCase()
    : user?.name ? user.name[0].toUpperCase() : 'S';

  const displayName = user.kycData.fullName || user.name || 'Traveler';
  const displayPhone = user.phone || user.kycData.phone || '';
  const displayNationality = user.nationality || user.kycData.nationality || '';
  const displayWilaya = user.wilaya || '';
  const hasExtendedProfile = user.dateOfBirth || user.passportNumber || user.emergencyContact || user.travelPreferences;

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.guestScroll}>
          <View style={styles.guestHero}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.guestTitle}>Your Account</Text>
            <Text style={styles.guestSub}>Sign in to access your trips, bookings, and more.</Text>
            <UberButton
              title="Sign In"
              onPress={() => router.push('/(auth)/login')}
              style={{ width: '100%', maxWidth: 280 }}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Try RIHLA as...</Text>
            <DemoCard icon="compass-outline" label="Traveler" color="#00a896" onPress={() => handleRoleSwitch('traveler')} />
            <DemoCard icon="business-outline" label="Business Owner (Hotel)" color={RIHLA.primary} onPress={() => handleRoleSwitch('business', 'hotel')} />
            <DemoCard icon="flash-outline" label="Service Partner" color="#f4a261" onPress={() => handleRoleSwitch('partner')} />
          </View>
          <View style={styles.menuSection}>
            <MenuItem icon="settings-outline" label="Settings" color="#64748B" onPress={() => router.push('/(modals)/settings' as any)} />
            <MenuItem icon="help-circle-outline" label="Help & Support" color="#64748B" onPress={() => router.push('/(modals)/settings' as any)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── PROFILE HERO ── */}
        <View style={styles.profileHero}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          {displayPhone && <Text style={styles.profileMeta}>{displayPhone}</Text>}
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={14} color="#00a896" />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(tabs)/edit-profile' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeBookings.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pastBookings.filter(b => b.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.totalVisits}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
        </View>

        {/* ── PERSONAL INFO CARD ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="person-outline" size={16} color={RIHLA.primary} />
            <Text style={styles.infoCardTitle}>Personal Info</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/edit-profile' as any)}>
              <Text style={styles.infoCardLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {displayName && <InfoRow label="Full Name" value={displayName} icon="person-outline" />}
          {displayPhone && <InfoRow label="Phone" value={displayPhone} icon="call-outline" />}
          {user.email && <InfoRow label="Email" value={user.email} icon="mail-outline" />}
          {user.dateOfBirth && <InfoRow label="Date of Birth" value={user.dateOfBirth} icon="calendar-outline" />}
          {user.gender && <InfoRow label="Gender" value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)} icon="male-female-outline" />}
          {user.kycStatus === 'approved' && <InfoRow label="KYC Status" value="Verified ✅" icon="shield-checkmark-outline" valueColor="#00a896" />}
        </View>

        {/* ── LOCATION CARD ── */}
        {(displayNationality || displayWilaya || user.address) && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="location-outline" size={16} color={RIHLA.accent} />
              <Text style={styles.infoCardTitle}>Location</Text>
            </View>
            {displayNationality && <InfoRow label="Nationality" value={displayNationality} icon="globe-outline" />}
            {displayWilaya && <InfoRow label="Wilaya" value={displayWilaya} icon="map-outline" />}
            {user.address && <InfoRow label="Address" value={user.address} icon="home-outline" />}
          </View>
        )}

        {/* ── TRAVEL DOCUMENTS ── */}
        {(user.passportNumber || user.passportExpiry) && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="card-outline" size={16} color={RIHLA.highlight} />
              <Text style={styles.infoCardTitle}>Travel Documents</Text>
            </View>
            {user.passportNumber && <InfoRow label="Passport #" value={user.passportNumber} icon="card-outline" />}
            {user.passportExpiry && <InfoRow label="Passport Expiry" value={user.passportExpiry} icon="calendar-outline" />}
          </View>
        )}

        {/* ── EMERGENCY CONTACT ── */}
        {user.emergencyContact && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.infoCardTitle}>Emergency Contact</Text>
            </View>
            <InfoRow label="Name" value={user.emergencyContact.name} icon="person-outline" />
            <InfoRow label="Phone" value={user.emergencyContact.phone} icon="call-outline" />
            <InfoRow label="Relationship" value={user.emergencyContact.relationship} icon="heart-outline" />
          </View>
        )}

        {/* ── TRAVEL PREFERENCES PREVIEW ── */}
        {user.travelPreferences && (
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="compass-outline" size={16} color="#A855F7" />
              <Text style={styles.infoCardTitle}>Travel Preferences</Text>
            </View>
            {user.travelPreferences.budget && (
              <InfoRow label="Budget" value={user.travelPreferences.budget.charAt(0).toUpperCase() + user.travelPreferences.budget.slice(1)} icon="cash-outline" />
            )}
            {user.travelPreferences.accommodation && (
              <InfoRow label="Accommodation" value={user.travelPreferences.accommodation.charAt(0).toUpperCase() + user.travelPreferences.accommodation.slice(1)} icon="bed-outline" />
            )}
            {user.travelPreferences.travelStyle && (
              <InfoRow label="Travel Style" value={user.travelPreferences.travelStyle.charAt(0).toUpperCase() + user.travelPreferences.travelStyle.slice(1)} icon="people-outline" />
            )}
            {user.travelPreferences.interests && user.travelPreferences.interests.length > 0 && (
              <View style={styles.prefPills}>
                {user.travelPreferences.interests.slice(0, 6).map((interest) => (
                  <View key={interest} style={styles.prefPill}>
                    <Text style={styles.prefPillText}>{interest}</Text>
                  </View>
                ))}
                {user.travelPreferences.interests.length > 6 && (
                  <View style={styles.prefPill}>
                    <Text style={styles.prefPillText}>+{user.travelPreferences.interests.length - 6} more</Text>
                  </View>
                )}
              </View>
            )}
            {user.travelPreferences.dietaryRestrictions && user.travelPreferences.dietaryRestrictions.length > 0 && (
              <View style={[styles.prefPills, { marginTop: 8 }]}>
                {user.travelPreferences.dietaryRestrictions.map((d) => (
                  <View key={d} style={[styles.prefPill, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.prefPillText, { color: '#92400E' }]}>{d}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <MenuItem icon="create-outline" label="Edit Profile" color={RIHLA.accent} onPress={() => router.push('/(tabs)/edit-profile' as any)} />
          <MenuItem icon="settings-outline" label="Settings" color="#64748B" onPress={() => router.push('/(modals)/settings' as any)} />
          <MenuItem icon="help-circle-outline" label="Help & Support" color="#64748B" onPress={() => router.push('/(modals)/settings' as any)} />
          {!hasExtendedProfile && (
            <TouchableOpacity
              style={styles.completeBanner}
              onPress={() => router.push('/(tabs)/edit-profile' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={18} color="#A855F7" />
              <View style={{ flex: 1 }}>
                <Text style={styles.completeTitle}>Complete Your Profile</Text>
                <Text style={styles.completeSub}>Add travel preferences, documents & more for a personalized experience</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>

        {/* ── ROLE SWITCHER ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Demo Mode</Text>
          <DemoCard icon="compass-outline" label="Traveler" color="#00a896" onPress={() => handleRoleSwitch('traveler')} />
          <DemoCard icon="business-outline" label="Business (Hotel)" color={RIHLA.primary} onPress={() => handleRoleSwitch('business', 'hotel')} />
          <DemoCard icon="flash-outline" label="Service Partner" color="#f4a261" onPress={() => handleRoleSwitch('partner')} />
        </View>

        {/* ── SIGN OUT ── */}
        <View style={styles.signOutWrap}>
          <UberButton title="Sign Out" bgVariant="danger" onPress={handleSignOut} />
        </View>

        <Text style={styles.version}>RIHLA v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-Components ──

function DemoCard({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.demoCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.demoIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.demoLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

function InfoRow({ label, value, icon, valueColor }: {
  label: string; value: string; icon?: string; valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      {icon && <Ionicons name={icon as any} size={14} color="#94A3B8" style={{ marginRight: 8 }} />}
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 100 },
  guestScroll: { flexGrow: 1, paddingBottom: 100 },

  // Guest
  guestHero: {
    alignItems: 'center', gap: 10,
    paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24,
    backgroundColor: '#FFFFFF', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  guestAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { fontSize: 24, fontFamily: 'mon-b', color: '#0F172A' },
  guestSub: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 20 },

  // Profile hero
  profileHero: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  avatarLarge: { width: 84, height: 84, borderRadius: 42, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#E2E8F0' },
  avatarLetter: { fontSize: 34, fontFamily: 'mon-b', color: '#64748B' },
  profileName: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A' },
  profileMeta: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedText: { fontSize: 13, fontFamily: 'mon', color: '#00a896' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1.5, borderColor: RIHLA.accent, backgroundColor: '#F0FDFA',
  },
  editBtnText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20,
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  statValue: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },

  // Info cards
  infoCard: {
    marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 12,
  },
  infoCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
    paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F1F5F9',
  },
  infoCardTitle: { flex: 1, fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  infoCardLink: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, fontFamily: 'mon', color: '#64748B', minWidth: 100 },
  infoValue: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A', textAlign: 'right' },

  // Preferences pills
  prefPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  prefPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F0FDFA' },
  prefPillText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 12 },
  sectionLabel: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 8 },

  // Complete banner
  completeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: '#FAF5FF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E9D5FF',
  },
  completeTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#7C3AED' },
  completeSub: { fontSize: 11, fontFamily: 'mon', color: '#9CA3AF', marginTop: 2 },

  demoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8,
  },
  demoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  demoLabel: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },

  menuSection: { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  menuLabel: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },

  signOutWrap: { paddingHorizontal: 20, marginTop: 8 },
  version: { textAlign: 'center', fontSize: 12, fontFamily: 'mon', color: '#CBD5E1', marginTop: 16 },
});
