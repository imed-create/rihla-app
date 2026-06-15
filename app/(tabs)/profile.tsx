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
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, UserRole } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router, Stack } from 'expo-router';
import UberButton from '@/components/shared/UberButton';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const { user, signOut, activeBookings, pastBookings, updateUser } = useApp();
  const { signOut: clerkSignOut } = useAuth();
  const { colors, isDark } = useTheme();
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
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.guestScroll}>
          <View style={[styles.guestHero, { backgroundColor: colors.card }]}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person-outline" size={36} color="#FFFFFF" />
            </View>
            <Text style={[styles.guestTitle, { color: colors.text }]}>Your Account</Text>
            <Text style={[styles.guestSub, { color: colors.muted }]}>Sign in to access your trips, bookings, and more.</Text>
            <UberButton
              title="Sign In"
              onPress={() => router.push('/(auth)/login')}
              style={{ width: '100%', maxWidth: 280 }}
            />
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Try RIHLA as...</Text>
            <DemoCard icon="compass-outline" label="Traveler" color="#00a896" onPress={() => handleRoleSwitch('traveler')} />
            <DemoCard icon="business-outline" label="Business Owner (Hotel)" color={RIHLA.primary} onPress={() => handleRoleSwitch('business', 'hotel')} />
            <DemoCard icon="flash-outline" label="Service Partner" color="#f4a261" onPress={() => handleRoleSwitch('partner')} />
          </View>
          <View style={styles.menuSection}>
            <MenuItem icon="settings-outline" label="Settings" color={colors.muted} onPress={() => router.push('/(modals)/settings' as any)} />
            <MenuItem icon="help-circle-outline" label="Help & Support" color={colors.muted} onPress={() => router.push('/(modals)/settings' as any)} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── PROFILE HERO ── */}
        <View style={styles.profileHero}>
          <LinearGradient
            colors={[RIHLA.accent, RIHLA.accent + '40'] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={[styles.avatarLarge, { backgroundColor: colors.card }]}>
              <Text style={[styles.avatarLetter, { color: colors.text }]}>{avatarLetter}</Text>
            </View>
          </LinearGradient>
          <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
          {displayPhone && <Text style={[styles.profileMeta, { color: colors.muted }]}>{displayPhone}</Text>}
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={14} color={RIHLA.accent} />
            <Text style={[styles.verifiedText, { color: RIHLA.accent }]}>Verified Account</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: isDark ? '#0D2926' : '#F0FDFA' }]}
            onPress={() => router.push('/(tabs)/edit-profile' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#0A1F1C' : '#F0FDFA' }]}>
            <Ionicons name="radio-outline" size={16} color={RIHLA.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{activeBookings.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#0D1A0F' : '#F0FDF4' }]}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
            <Text style={[styles.statValue, { color: colors.text }]}>{pastBookings.filter(b => b.status === 'completed').length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1A1507' : '#FFFBEB' }]}>
            <Ionicons name="compass-outline" size={16} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.text }]}>{user.totalVisits}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Trips</Text>
          </View>
        </View>

        {/* ── PERSONAL INFO CARD ── */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.infoAccent, { backgroundColor: RIHLA.primary }]} />
          <View style={styles.infoCardContent}>
            <View style={[styles.infoCardHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="person-outline" size={16} color={RIHLA.primary} />
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Personal Info</Text>
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
        </View>

        {/* ── LOCATION CARD ── */}
        {(displayNationality || displayWilaya || user.address) && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoAccent, { backgroundColor: RIHLA.accent }]} />
            <View style={styles.infoCardContent}>
              <View style={[styles.infoCardHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="location-outline" size={16} color={RIHLA.accent} />
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>Location</Text>
              </View>
              {displayNationality && <InfoRow label="Nationality" value={displayNationality} icon="globe-outline" />}
              {displayWilaya && <InfoRow label="Wilaya" value={displayWilaya} icon="map-outline" />}
              {user.address && <InfoRow label="Address" value={user.address} icon="home-outline" />}
            </View>
          </View>
        )}

        {/* ── TRAVEL DOCUMENTS ── */}
        {(user.passportNumber || user.passportExpiry) && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoCardHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="card-outline" size={16} color={RIHLA.highlight} />
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Travel Documents</Text>
            </View>
            {user.passportNumber && <InfoRow label="Passport #" value={user.passportNumber} icon="card-outline" />}
            {user.passportExpiry && <InfoRow label="Passport Expiry" value={user.passportExpiry} icon="calendar-outline" />}
          </View>
        )}

        {/* ── EMERGENCY CONTACT ── */}
        {user.emergencyContact && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoCardHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Emergency Contact</Text>
            </View>
            <InfoRow label="Name" value={user.emergencyContact.name} icon="person-outline" />
            <InfoRow label="Phone" value={user.emergencyContact.phone} icon="call-outline" />
            <InfoRow label="Relationship" value={user.emergencyContact.relationship} icon="heart-outline" />
          </View>
        )}

        {/* ── TRAVEL PREFERENCES PREVIEW ── */}
        {user.travelPreferences && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.infoCardHeader, { borderBottomColor: colors.border }]}>
              <Ionicons name="compass-outline" size={16} color="#A855F7" />
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>Travel Preferences</Text>
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
                  <View key={interest} style={[styles.prefPill, { backgroundColor: isDark ? '#0D2926' : '#F0FDFA' }]}>
                    <Text style={styles.prefPillText}>{interest}</Text>
                  </View>
                ))}
                {user.travelPreferences.interests.length > 6 && (
                  <View style={[styles.prefPill, { backgroundColor: isDark ? '#0D2926' : '#F0FDFA' }]}>
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
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: RIHLA.accent }]} />
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Quick Actions</Text>
          </View>
          <MenuItem icon="create-outline" label="Edit Profile" color={RIHLA.accent} onPress={() => router.push('/(tabs)/edit-profile' as any)} />
          <MenuItem icon="settings-outline" label="Settings" color={colors.muted} onPress={() => router.push('/(modals)/settings' as any)} />
          <MenuItem icon="help-circle-outline" label="Help & Support" color={colors.muted} onPress={() => router.push('/(modals)/settings' as any)} />
          {!hasExtendedProfile && (
            <TouchableOpacity
              style={[styles.completeBanner, { backgroundColor: isDark ? '#1A0D2E' : '#FAF5FF', borderColor: isDark ? '#3B1F5E' : '#E9D5FF' }]}
              onPress={() => router.push('/(tabs)/edit-profile' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={18} color="#A855F7" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.completeTitle, { color: isDark ? '#A78BFA' : '#7C3AED' }]}>Complete Your Profile</Text>
                <Text style={[styles.completeSub, { color: colors.muted }]}>Add travel preferences, documents & more for a personalized experience</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── ROLE SWITCHER ── */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#6C63FF' }]} />
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Demo Mode</Text>
          </View>
          <DemoCard icon="compass-outline" label="Traveler" color="#00a896" onPress={() => handleRoleSwitch('traveler')} />
          <DemoCard icon="business-outline" label="Business (Hotel)" color={RIHLA.primary} onPress={() => handleRoleSwitch('business', 'hotel')} />
          <DemoCard icon="flash-outline" label="Service Partner" color="#f4a261" onPress={() => handleRoleSwitch('partner')} />
        </View>

        {/* ── SIGN OUT ── */}
        <View style={styles.signOutWrap}>
          <UberButton title="Sign Out" bgVariant="danger" onPress={handleSignOut} />
        </View>

        <Text style={[styles.version, { color: colors.muted }]}>RIHLA v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-Components ──

function DemoCard({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; color: string; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.demoIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.demoLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </TouchableOpacity>
  );
}

function InfoRow({ label, value, icon, valueColor }: {
  label: string; value: string; icon?: string; valueColor?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      {icon && <Ionicons name={icon as any} size={14} color={colors.muted} style={{ marginRight: 8 }} />}
      <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }, valueColor && { color: valueColor }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 100 },
  guestScroll: { flexGrow: 1, paddingBottom: 100 },

  // Guest
  guestHero: {
    alignItems: 'center', gap: 10,
    paddingTop: 40, paddingBottom: 32, paddingHorizontal: 24,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  guestAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center' },
  guestTitle: { fontSize: 24, fontFamily: 'mon-b' },
  guestSub: { fontSize: 14, fontFamily: 'mon', textAlign: 'center', lineHeight: 20 },

  // Profile hero
  profileHero: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    shadowColor: RIHLA.accent,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarLarge: { width: '100%', height: '100%', borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 34, fontFamily: 'mon-b' },
  profileName: { fontSize: 22, fontFamily: 'mon-b', marginTop: 4 },
  profileMeta: { fontSize: 14, fontFamily: 'mon' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verifiedText: { fontSize: 13, fontFamily: 'mon', color: RIHLA.accent },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999,
    borderWidth: 1.5, borderColor: RIHLA.accent, backgroundColor: '#F0FDFA',
  },
  editBtnText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 14,
  },
  statValue: { fontSize: 20, fontFamily: 'mon-b' },
  statLabel: { fontSize: 10, fontFamily: 'mon' },

  // Info cards
  infoCard: {
    marginHorizontal: 20, borderRadius: 16,
    borderWidth: 1, marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  infoAccent: {
    width: 4,
  },
  infoCardContent: {
    flex: 1,
    padding: 16,
  },
  infoCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
    paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoCardTitle: { flex: 1, fontSize: 15, fontFamily: 'mon-b' },
  infoCardLink: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, fontFamily: 'mon', minWidth: 100 },
  infoValue: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', textAlign: 'right' },

  // Preferences pills
  prefPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  prefPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F0FDFA' },
  prefPillText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 14 },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionLabel: { fontSize: 15, fontFamily: 'mon-b' },

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
    padding: 14, borderRadius: 12,
    borderWidth: 1, marginBottom: 8,
  },
  demoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  demoLabel: { flex: 1, fontSize: 13, fontFamily: 'mon-sb' },

  menuSection: { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 13, fontFamily: 'mon-sb' },

  signOutWrap: { paddingHorizontal: 20, marginTop: 8 },
  version: { textAlign: 'center', fontSize: 12, fontFamily: 'mon', color: '#CBD5E1', marginTop: 16 },
});
