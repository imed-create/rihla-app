/**
 * RIHLA — Business Owner Dashboard Home
 * ──────────────────────────────────────
 * STEP 2 OF PROMPTFULL: "Zero-State" Dashboard Hub
 *
 * Once KYC is approved, the user lands here.
 * - If they have NO listings → premium zero-state with "＋ List Your Property" CTA
 * - If they HAVE listings → active "Hotel Command Center" dashboard
 *
 * Tab structure (PROMPTFULL §Re-Architecting):
 *   Tab 1: 📊 Operations  — Live stats, check-ins/outs, QR scanner, booking feed
 *   Tab 2: 🗓️ Inventory   — Availability calendar + room status matrix
 *   Tab 3: 🏢 Property    — Listing CRUD, edit details
 *   Tab 4: 📈 Analytics   — Reviews engine, revenue analytics
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import ProTabShell from '@/components/dashboard/TabShell';
import { PRO_THEME } from '@/constants/proNavigation';
import { RIHLA } from '@/constants/theme';
import { useTranslation } from '@/context/I18nContext';
import { getCategoryDef, MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { useTheme } from '@/context/ThemeContext';

// Dashboard components
import HotelOverview from '@/components/dashboard/hotel/HotelOverview';
import KitchenOrderTickets from '@/components/dashboard/restaurant/KitchenOrderTickets';
import BeachDashboard from '@/components/dashboard/BeachDashboard';
import ActivityDashboard from '@/components/dashboard/ActivityDashboard';
import EventDashboard from '@/components/dashboard/EventDashboard';
import DispatchCalendar from '@/components/dashboard/guide/DispatchCalendar';
import DriverDashboard from './dashboards/driver';
import PhotographerDashboard from './dashboards/photographer';
import AssetInventoryList from '@/components/dashboard/rental/AssetInventoryList';

const DASHBOARD_MAP: Record<string, React.ComponentType> = {
  hotel: HotelOverview,
  restaurant: KitchenOrderTickets,
  beach: BeachDashboard,
  activity: ActivityDashboard,
  event: EventDashboard,
  guide: DispatchCalendar,
  driver: DriverDashboard,
  experience: DispatchCalendar,
  photographer: PhotographerDashboard,
  rental: AssetInventoryList,
};

const TYPE_GRADIENTS: Record<string, [string, string]> = {
  hotel:        ['#1A6B3A', '#0F4027'],
  restaurant:   ['#C56A39', '#A0472A'],
  beach:        ['#00a896', '#007a6e'],
  rental:       ['#6C63FF', '#4E46CC'],
  activity:     ['#E76F51', '#C44D2E'],
  event:        ['#A855F7', '#8B3FD4'],
  guide:        ['#8B5E3C', '#6B4226'],
  photographer: ['#FF499E', '#CC2A78'],
  driver:       ['#0a2540', '#061527'],
  experience:   ['#f4a261', '#e07d38'],
};

export default function BusinessDashboard() {
  const { user, updateUser } = useApp();
  const { getAssetCount } = useBusinessAssets();
  const [changingType, setChangingType] = React.useState(false);
  const theme = PRO_THEME.business;
  const { t } = useTranslation();
  const { colors } = useTheme();

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as any) : null;
  const heroGradient = TYPE_GRADIENTS[businessType] ?? ['#0a2540', '#061527'];
  const businessName = user.kycData?.businessName || user.name || 'My Business';
  const ownerName = user.kycData?.fullName || user.name || 'Owner';

  const hasListings = useMemo(() => getAssetCount(businessType) > 0, [businessType, getAssetCount]);
  const SpecializedDashboard = DASHBOARD_MAP[businessType] ?? null;

  const settingsBtn = (
    <Pressable onPress={() => router.push('/(modals)/settings' as any)} style={{ padding: 8 }}>
      <Ionicons name="settings-outline" size={22} color={theme.accent} />
    </Pressable>
  );

  const handleChangeType = (newType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateUser({ kycData: { ...user.kycData, businessType: newType } });
    setChangingType(false);
  };

  return (
    <ProTabShell
      role="business"
      title={catDef ? `${catDef.label} Dashboard` : 'Dashboard'}
      subtitle={businessName}
      headerRight={settingsBtn}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO BANNER ── */}
        <LinearGradient colors={heroGradient} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroTop}>
            <View style={styles.heroBadge}>
              <Ionicons name={catDef ? (catDef.icon as any) : 'business-outline'} size={14} color="#fff" />
              <Text style={styles.heroBadgeText}>{catDef?.label ?? 'Business'}</Text>
            </View>
            <TouchableOpacity style={styles.changeTypeBtn} onPress={() => setChangingType(true)}>
              <Ionicons name="swap-horizontal-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.changeTypeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.heroName}>{businessName}</Text>
          <Text style={styles.heroOwner}>Managed by {ownerName}</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>🟢 Online</Text>
              <Text style={styles.heroStatLabel}>Status</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>✅ Verified</Text>
              <Text style={styles.heroStatLabel}>KYC Approved</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{hasListings ? getAssetCount(businessType) : '0'}</Text>
              <Text style={styles.heroStatLabel}>{hasListings ? 'Listings' : 'Listings'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── CONTENT: Zero-State vs Active Dashboard ── */}
        {!hasListings ? (
          <ZeroStateHub
            businessType={businessType}
            catDef={catDef}
            heroGradient={heroGradient}
          />
        ) : SpecializedDashboard ? (
          <View style={styles.dashboardWrap}>
            <SpecializedDashboard />
          </View>
        ) : (
          <NoDashboardPrompt onSelectType={(t) => handleChangeType(t)} />
        )}

        {/* ── GLOBAL QUICK LINKS ── */}
        {hasListings && (
          <View style={styles.globalActions}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Tools</Text>
            <View style={styles.actionsGrid}>
              <QuickAction icon="calendar-outline" label="Bookings" color={RIHLA.accent} onPress={() => router.push('/(business)/bookings' as any)} />
              <QuickAction icon="list-outline" label="Listings" color={RIHLA.primary} onPress={() => router.push('/(business)/listings' as any)} />
              <QuickAction icon="stats-chart-outline" label="Analytics" color={RIHLA.highlight} onPress={() => router.push('/(business)/analytics' as any)} />
              <QuickAction icon="star-outline" label="Reviews" color="#A855F7" onPress={() => router.push('/(business)/reviews' as any)} />
              <QuickAction icon="pricetag-outline" label="Promos" color="#EF4444" onPress={() => router.push('/(business)/promotions' as any)} />
            </View>
          </View>
        )}

      </ScrollView>

      {/* ── CHANGE BUSINESS TYPE MODAL ── */}
      <Modal visible={changingType} transparent animationType="slide" onRequestClose={() => setChangingType(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setChangingType(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.modalKnob, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Switch Dashboard View</Text>
            <Text style={[styles.modalSubtitle, { color: colors.muted }]}>Switch to see a different business dashboard.</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {MARKETPLACE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.typeOption, { borderColor: colors.border, backgroundColor: colors.bg }, businessType === cat.key && { borderColor: cat.color, backgroundColor: cat.color + '10' }]}
                  onPress={() => handleChangeType(cat.key)}
                >
                  <View style={[styles.typeOptionIcon, { backgroundColor: cat.color + '18' }]}>
                    <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typeOptionLabel, { color: colors.text }]}>{cat.label}</Text>
                    <Text style={[styles.typeOptionDesc, { color: colors.muted }]}>{cat.description}</Text>
                  </View>
                  {businessType === cat.key && <Ionicons name="checkmark-circle" size={20} color={cat.color} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalCancel, { backgroundColor: colors.bg }]} onPress={() => setChangingType(false)}>
              <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ProTabShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// ZERO-STATE HUB — Premium empty state per PROMPTFULL §Step 2
// ═══════════════════════════════════════════════════════════════
function ZeroStateHub({
  businessType,
  catDef,
  heroGradient,
}: {
  businessType: string;
  catDef: { label: string; icon: string; color: string } | null;
  heroGradient: [string, string];
}) {
  const isHotel = businessType === 'hotel';
  const color = catDef?.color ?? '#0a2540';
  const { colors } = useTheme();

  return (
    <View style={styles.zeroRoot}>
      {/* Welcome card */}
      <View style={[styles.zeroWelcome, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.zeroIconRing, { borderColor: color + '20' }]}>
          <View style={[styles.zeroIconCircle, { backgroundColor: color + '12' }]}>
            <Ionicons name={catDef ? (catDef.icon as any) : 'business-outline'} size={36} color={color} />
          </View>
        </View>
        <Text style={[styles.zeroTitle, { color: colors.text }]}>
          Welcome to your {catDef?.label ?? 'Business'} Dashboard
        </Text>
        <Text style={[styles.zeroSubtitle, { color: colors.muted }]}>
          You're verified and ready to start! List your first {isHotel ? 'property' : 'offering'} to begin receiving bookings from travelers across Algeria.
        </Text>

        {/* Feature highlights */}
        <View style={styles.zeroFeatures}>
          {isHotel && (
            <>
              <FeatureRow icon="bed-outline" text="Add room types with pricing & availability" color={color} />
              <FeatureRow icon="calendar-outline" text="Manage bookings & check-ins in real-time" color={color} />
              <FeatureRow icon="images-outline" text="Upload photos & showcase your property" color={color} />
              <FeatureRow icon="stats-chart-outline" text="Track revenue & performance analytics" color={color} />
            </>
          )}
          {!isHotel && (
            <>
              <FeatureRow icon="add-circle-outline" text="Create your first listing to get started" color={color} />
              <FeatureRow icon="calendar-outline" text="Manage reservations & availability" color={color} />
              <FeatureRow icon="stats-chart-outline" text="Track your business performance" color={color} />
            </>
          )}
        </View>
      </View>

      {/* CTA button */}
      <TouchableOpacity
        style={[styles.zeroCta, { backgroundColor: color }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          router.push('/(business)/listings/new' as any);
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.zeroCtaText}>List Your {isHotel ? 'Property' : 'Service'}</Text>
      </TouchableOpacity>

      {/* Help text */}
      <View style={styles.zeroHelp}>
        <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
        <Text style={[styles.zeroHelpText, { color: colors.muted }]}>
          Need help getting started? Check the guide or contact our support team.
        </Text>
      </View>
    </View>
  );
}

function FeatureRow({ icon, text, color }: { icon: string; text: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: color + '12' }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <Text style={[styles.featureText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable style={styles.globalAction} onPress={onPress}>
      <View style={[styles.globalActionIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.globalActionText, { color: colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

// ── No business type set yet ──
function NoDashboardPrompt({ onSelectType }: { onSelectType: (t: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.noTypeWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name="business-outline" size={48} color={colors.border} />
      <Text style={[styles.noTypeTitle, { color: colors.text }]}>Choose Your Business Category</Text>
      <Text style={[styles.noTypeSubtitle, { color: colors.muted }]}>Select your business type to see a tailored dashboard.</Text>
      <View style={styles.noTypeGrid}>
        {MARKETPLACE_CATEGORIES.map((cat) => (
          <Pressable key={cat.key} style={[styles.noTypeCard, { backgroundColor: colors.bg, borderColor: colors.border }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelectType(cat.key); }}>
            <View style={[styles.noTypeIcon, { backgroundColor: cat.color + '18' }]}>
              <Ionicons name={cat.icon as any} size={22} color={cat.color} />
            </View>
            <Text style={[styles.noTypeCardLabel, { color: colors.text }]}>{cat.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },

  // Hero
  hero: { margin: 16, borderRadius: 24, padding: 20, gap: 8 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
  changeTypeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  changeTypeBtnText: { fontSize: 11, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.8)' },
  heroName: { fontSize: 22, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
  heroOwner: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  heroStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, marginTop: 8 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatValue: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroStatLabel: { fontSize: 10, fontFamily: 'mon', color: 'rgba(255,255,255,0.65)' },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Dashboard wrapper
  dashboardWrap: { paddingHorizontal: 16, gap: 16 },

  // Zero-state
  zeroRoot: { marginHorizontal: 16, gap: 16, marginTop: 8 },
  zeroWelcome: { borderRadius: 24, padding: 24, alignItems: 'center', gap: 12, borderWidth: 1 },
  zeroIconRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  zeroIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  zeroTitle: { fontSize: 20, fontFamily: 'mon-b', textAlign: 'center', letterSpacing: -0.3 },
  zeroSubtitle: { fontSize: 13, fontFamily: 'mon', textAlign: 'center', lineHeight: 20, paddingHorizontal: 8 },
  zeroFeatures: { width: '100%', gap: 10, marginTop: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 13, fontFamily: 'mon' },
  zeroCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16 },
  zeroCtaText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
  zeroHelp: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  zeroHelpText: { flex: 1, fontSize: 12, fontFamily: 'mon', lineHeight: 17 },

  // Global quick links
  globalActions: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  globalAction: { width: '18%', alignItems: 'center', gap: 6 },
  globalActionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  globalActionText: { fontSize: 10, fontFamily: 'mon-sb', textAlign: 'center' },

  // No type prompt
  noTypeWrap: { margin: 16, borderRadius: 20, padding: 24, alignItems: 'center', gap: 12, borderWidth: 1 },
  noTypeTitle: { fontSize: 18, fontFamily: 'mon-b', textAlign: 'center' },
  noTypeSubtitle: { fontSize: 13, fontFamily: 'mon', textAlign: 'center', lineHeight: 20 },
  noTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, width: '100%' },
  noTypeCard: { width: '29%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1 },
  noTypeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  noTypeCardLabel: { fontSize: 10, fontFamily: 'mon-sb', textAlign: 'center' },

  // Change type modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,37,64,0.55)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalKnob: { width: 44, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontFamily: 'mon-b', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, fontFamily: 'mon', lineHeight: 18, marginBottom: 16 },
  typeOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  typeOptionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeOptionLabel: { fontSize: 15, fontFamily: 'mon-sb', marginBottom: 2 },
  typeOptionDesc: { fontSize: 12, fontFamily: 'mon' },
  modalCancel: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  modalCancelText: { fontSize: 15, fontFamily: 'mon-sb' },
});
