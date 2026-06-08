/**
 * RIHLA — Business Owner Profile
 * ──────────────────────────────
 * Shows verified business info, KYC status, settings, sign out, and demo role switcher.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp, UserRole } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import ProTabShell from '@/components/dashboard/TabShell';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';

export default function BusinessProfile() {
  const { user, signOut, updateUser } = useApp();
  const { signOut: clerkSignOut } = useAuth();
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  const catLabel = MARKETPLACE_CATEGORIES.find(c => c.key === user.kycData?.businessType)?.label ?? 'Business';
  const catColor = MARKETPLACE_CATEGORIES.find(c => c.key === user.kycData?.businessType)?.color ?? RIHLA.primary;
  const catIcon = MARKETPLACE_CATEGORIES.find(c => c.key === user.kycData?.businessType)?.icon ?? 'business-outline';
  const avatarLetter = (user.kycData.fullName || user.name || 'B')[0].toUpperCase();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try { await clerkSignOut(); } catch {}
          signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const switchDemo = (role: UserRole, businessType?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDemoModalVisible(false);
    updateUser({
      email: `${role}${businessType ? `-${businessType}` : ''}@demo.com`,
      name: `Demo ${role} ${businessType ? `(${businessType})` : ''}`,
      role,
      kycStatus: 'approved',
      isOnboarded: true,
      kycData: {
        fullName: `Demo ${role} ${businessType ? `(${businessType})` : ''}`,
        phone: '+213 555 00 00 00',
        nationality: 'Algerian',
        ...(role === 'business' && { businessType: businessType || 'hotel' }),
        ...(role === 'partner' && { serviceType: 'jetski' }),
      },
    });
  };

  return (
    <ProTabShell role="business" title="Profile" subtitle="Account & verification">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO CARD ── */}
        <LinearGradient colors={[catColor, catColor + 'CC']} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{user.kycData.fullName || user.name || '—'}</Text>
            <View style={styles.heroBadge}>
              <Ionicons name={catIcon as any} size={12} color="#fff" />
              <Text style={styles.heroBadgeText}>{catLabel} Owner</Text>
            </View>
          </View>
          <View style={styles.kycBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.kycBadgeText}>Verified</Text>
          </View>
        </LinearGradient>

        {/* ── BUSINESS OVERVIEW (type-specific stats) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <BusinessStats businessType={user.kycData?.businessType ?? ''} catColor={catColor} />
        </View>

        {/* ── BUSINESS INFO ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <View style={styles.infoCard}>
            <InfoRow icon="business-outline" label="Business Name" value={user.kycData.businessName || '—'} />
            <InfoRow icon="storefront-outline" label="Category" value={catLabel} color={catColor} />
            <InfoRow icon="call-outline" label="Phone" value={user.kycData.phone || user.phone || '—'} />
            <InfoRow icon="mail-outline" label="Email" value={user.email || '—'} />
            <InfoRow icon="location-outline" label="Wilaya" value={user.kycData.wilaya || '—'} />
            <InfoRow icon="checkmark-circle-outline" label="KYC Status" value="Verified ✓" color="#10B981" last />
          </View>
        </View>

        {/* ── SETTINGS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.infoCard}>
            <ActionRow icon="settings-outline" label="App Settings" onPress={() => router.push('/(modals)/settings' as any)} />
            <ActionRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/(modals)/settings' as any)} />
            <ActionRow icon="help-circle-outline" label="Help & Support" onPress={() => router.push('/(modals)/settings' as any)} last />
          </View>
        </View>

        {/* ── DEMO SWITCHER (for testing) ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Other Roles</Text>
          <View style={styles.infoCard}>
            <ActionRow
              icon="construct-outline"
              label="Switch Demo Role / Dashboard"
              color={RIHLA.accent}
              onPress={() => setDemoModalVisible(true)}
              last
            />
          </View>
          <Text style={styles.hintText}>Demo mode only — instantly switch roles for testing.</Text>
        </View>

        {/* ── SIGN OUT ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>RIHLA Business v1.0</Text>
      </ScrollView>

      {/* ── DEMO ROLE MODAL ── */}
      <Modal visible={demoModalVisible} transparent animationType="slide" onRequestClose={() => setDemoModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDemoModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <Text style={styles.modalTitle}>Choose Demo Profile 🇩🇿</Text>
            <Text style={styles.modalSubtitle}>Instantly switch to any role with a pre-approved test account.</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Traveler */}
              <TouchableOpacity style={[styles.demoCard, { borderLeftColor: '#00a896' }]} onPress={() => switchDemo('traveler')}>
                <View style={[styles.demoIcon, { backgroundColor: '#E6FAF7' }]}><Ionicons name="compass" size={22} color="#00a896" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoTitle}>Traveler</Text>
                  <Text style={styles.demoDesc}>Browse destinations, book tours & activities.</Text>
                </View>
              </TouchableOpacity>

              {/* Business types */}
              {MARKETPLACE_CATEGORIES.slice(0, 5).map(cat => (
                <TouchableOpacity key={cat.key} style={[styles.demoCard, { borderLeftColor: cat.color }]} onPress={() => switchDemo('business', cat.key)}>
                  <View style={[styles.demoIcon, { backgroundColor: cat.color + '18' }]}><Ionicons name={cat.icon as any} size={22} color={cat.color} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.demoTitle}>Business: {cat.label}</Text>
                    <Text style={styles.demoDesc}>{cat.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Partner */}
              <TouchableOpacity style={[styles.demoCard, { borderLeftColor: '#f4a261' }]} onPress={() => switchDemo('partner')}>
                <View style={[styles.demoIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="flash" size={22} color="#f4a261" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoTitle}>Service Partner</Text>
                  <Text style={styles.demoDesc}>Rental equipment, beach services, on-demand.</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.modalCancel} onPress={() => setDemoModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ProTabShell>
  );
}

function InfoRow({ icon, label, value, color, last }: { icon: string; label: string; value: string; color?: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Ionicons name={icon as any} size={16} color="#94A3B8" style={styles.rowIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, color, onPress, last }: { icon: string; label: string; color?: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity style={[styles.infoRow, !last && styles.infoRowBorder]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon as any} size={16} color={color || '#94A3B8'} style={styles.rowIcon} />
      <Text style={[styles.infoLabel, { flex: 1, color: color || RIHLA.dark }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

// ── Business Stats Component (per-type labels, real store values) ──
function BusinessStats({ businessType, catColor }: { businessType: string; catColor: string }) {
  const { assets, getMyAssets } = useBusinessAssets();
  const type = businessType.toLowerCase();
  const myAssets = useMemo(() => getMyAssets(type), [assets, type]);
  const count = myAssets.length;
  const avail = myAssets.filter(a => a.available).length;
  const totalValue = myAssets.reduce((s, a) => s + a.priceDZD, 0);

  const LABELS: Record<string, { icon: string; label: string; extra?: string }[]> = {
    hotel:        [{ icon: 'bed-outline', label: 'Total Rooms' }, { icon: 'checkmark-circle', label: 'Available' }, { icon: 'cash-outline', label: 'Revenue (DZD)' }],
    restaurant:   [{ icon: 'restaurant-outline', label: 'Menu Items' }, { icon: 'checkmark-circle', label: 'Available' }, { icon: 'cash-outline', label: 'Value (DZD)' }],
    beach:        [{ icon: 'umbrella-outline', label: 'Total Assets' }, { icon: 'checkmark-circle', label: 'Online' }, { icon: 'cash-outline', label: 'Value (DZD)' }],
    rental:       [{ icon: 'home-outline', label: 'Properties' }, { icon: 'checkmark-circle', label: 'Available' }, { icon: 'cash-outline', label: 'Value (DZD)' }],
    activity:     [{ icon: 'bicycle-outline', label: 'Programs' }, { icon: 'checkmark-circle', label: 'Active' }, { icon: 'cash-outline', label: 'Value (DZD)' }],
    event:        [{ icon: 'ticket-outline', label: 'Events' }, { icon: 'checkmark-circle', label: 'On Sale' }, { icon: 'cash-outline', label: 'Total (DZD)' }],
    guide:        [{ icon: 'compass-outline', label: 'Expeditions' }, { icon: 'checkmark-circle', label: 'Active' }, { icon: 'cash-outline', label: 'Rate Sum (DZD)' }],
    photographer: [{ icon: 'camera-outline', label: 'Packages' }, { icon: 'checkmark-circle', label: 'Bookable' }, { icon: 'cash-outline', label: 'Total (DZD)' }],
    driver:       [{ icon: 'car-outline', label: 'Routes' }, { icon: 'checkmark-circle', label: 'Active' }, { icon: 'cash-outline', label: 'Total (DZD)' }],
    experience:   [{ icon: 'sparkles-outline', label: 'Experiences' }, { icon: 'checkmark-circle', label: 'Active' }, { icon: 'cash-outline', label: 'Total (DZD)' }],
  };

  const labels = LABELS[type] ?? LABELS.hotel;

  return (
    <View style={bStyles.card}>
      <View style={bStyles.grid}>
        {count === 0 ? (
          <View style={[bStyles.statItem, { width: '100%' }]}>
            <View style={[bStyles.statIcon, { backgroundColor: catColor + '12' }]}>
              <Ionicons name="add-circle-outline" size={18} color={catColor} />
            </View>
            <Text style={bStyles.statValue}>No assets yet</Text>
            <Text style={bStyles.statLabel}>Create your first listing to get started</Text>
          </View>
        ) : (
          <>
            <View style={bStyles.statItem}>
              <View style={[bStyles.statIcon, { backgroundColor: catColor + '12' }]}>
                <Ionicons name={labels[0].icon as any} size={18} color={catColor} />
              </View>
              <Text style={bStyles.statValue}>{count}</Text>
              <Text style={bStyles.statLabel}>{labels[0].label}</Text>
            </View>
            <View style={bStyles.statItem}>
              <View style={[bStyles.statIcon, { backgroundColor: catColor + '12' }]}>
                <Ionicons name={labels[1].icon as any} size={18} color={catColor} />
              </View>
              <Text style={[bStyles.statValue, { color: '#10B981' }]}>{avail}</Text>
              <Text style={bStyles.statLabel}>{labels[1].label}</Text>
            </View>
            <View style={bStyles.statItem}>
              <View style={[bStyles.statIcon, { backgroundColor: catColor + '12' }]}>
                <Ionicons name={labels[2].icon as any} size={18} color={catColor} />
              </View>
              <Text style={bStyles.statValue}>{totalValue.toLocaleString()}</Text>
              <Text style={bStyles.statLabel}>{labels[2].label}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const bStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'mon',
    color: '#64748B',
  },
});

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 48, gap: 20 },

  // Hero card
  heroCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLetter: { fontSize: 24, fontFamily: 'mon-b', color: '#fff' },
  heroInfo: { flex: 1, gap: 6 },
  heroName: { fontSize: 18, fontFamily: 'mon-b', color: '#fff' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroBadgeText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  kycBadgeText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },

  // Sections
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },

  // Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  rowIcon: { marginRight: 12 },
  infoLabel: { fontSize: 13, fontFamily: 'mon', color: '#64748B', width: 100 },
  infoValue: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark, textAlign: 'right' },

  hintText: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: { fontSize: 15, fontFamily: 'mon-sb', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 11, fontFamily: 'mon', color: '#CBD5E1' },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,37,64,0.55)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalKnob: { width: 44, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontFamily: 'mon-b', color: '#111827', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontFamily: 'mon', color: '#6B7280', lineHeight: 18, marginBottom: 16 },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 5,
    marginBottom: 10,
    gap: 12,
  },
  demoIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  demoTitle: { fontSize: 14, fontFamily: 'mon-sb', color: '#1F2937', marginBottom: 2 },
  demoDesc: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  modalCancel: { height: 52, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  modalCancelText: { fontSize: 15, fontFamily: 'mon-sb', color: '#4B5563' },
});
