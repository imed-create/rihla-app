import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import ProTabShell from '@/components/pro/ProTabShell';
import ProMenuShortcuts from '@/components/pro/ProMenuShortcuts';
import ProQRScanner from '@/components/pro/ProQRScanner';
import { PRO_THEME } from '@/constants/proNavigation';
import { SAHEL } from '@/constants/Colors';
import { useTranslation } from '@/context/I18nContext';
import { showToast } from '@/components/Toast';
import {
  activeFoodOrders,
  businessBookingsToday,
  businessRevenueDzd,
  pendingBusinessBookings,
} from '@/lib/dashboardStats';

// ── PROVIDER TYPE (determines which dashboard panel to render) ──
type ProviderType = 'beach_spot' | 'food_delivery' | 'camel_trek' | 'partner_activity';

const PROVIDER_TYPES: { key: ProviderType; label: string; icon: string; color: string }[] = [
  { key: 'beach_spot', label: 'Beach Spots', icon: 'umbrella-outline', color: SAHEL.accent },
  { key: 'food_delivery', label: 'Food Delivery', icon: 'restaurant-outline', color: '#C56A39' },
  { key: 'camel_trek', label: 'Camel Trek', icon: 'leaf-outline', color: SAHEL.highlight },
  { key: 'partner_activity', label: 'Activities', icon: 'football-outline', color: SAHEL.primary },
];

// ── MOCK DATA: Beach Spot Grid Controls ──
const MOCK_SPOTS = [
  { id: 'A1', zone: 'family', status: 'available' as const, price: 1000 },
  { id: 'A2', zone: 'family', status: 'occupied' as const, price: 1000 },
  { id: 'A3', zone: 'family', status: 'available' as const, price: 1000 },
  { id: 'A4', zone: 'vip', status: 'available' as const, price: 3000 },
  { id: 'B1', zone: 'family', status: 'occupied' as const, price: 1000 },
  { id: 'B2', zone: 'family', status: 'available' as const, price: 1000 },
  { id: 'B3', zone: 'vip', status: 'occupied' as const, price: 3000 },
  { id: 'B4', zone: 'vip', status: 'available' as const, price: 3000 },
];

// ── MOCK DATA: Camel Trek Fleet ──
const MOCK_FLEET = [
  { id: 'camel-1', name: 'Caravan Alpha', status: 'active', capacity: 8, guide: 'Yacine', nextDeparture: '09:00' },
  { id: 'camel-2', name: 'Caravan Bravo', status: 'available', capacity: 6, guide: 'Amina', nextDeparture: '11:00' },
  { id: 'camel-3', name: 'Quad Fleet A', status: 'active', capacity: 4, guide: 'Karim', nextDeparture: '10:30' },
  { id: 'dune-buggy-1', name: 'Dune Buggy X1', status: 'maintenance', capacity: 2, guide: '—', nextDeparture: '—' },
];

// ── MOCK DATA: Kitchen Pipeline ──
const MOCK_KITCHEN = [
  { id: 'k1', item: 'Couscous Royal', qty: 3, status: 'preparing', elapsed: '8 min' },
  { id: 'k2', item: 'Fresh Orange Juice x6', qty: 6, status: 'ready', elapsed: '2 min' },
  { id: 'k3', item: 'Grilled Sea Bass', qty: 1, status: 'preparing', elapsed: '15 min' },
  { id: 'k4', item: 'Mint Tea x4', qty: 4, status: 'pending', elapsed: '—' },
];

export default function BusinessDashboard() {
  const { user, bookings, orders } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [providerType, setProviderType] = useState<ProviderType>('beach_spot');
  const theme = PRO_THEME.business;
  const { t } = useTranslation();
  const name = user.kycData.businessName || user.name || 'Business';

  const stats = useMemo(() => {
    const today = businessBookingsToday(bookings);
    const revenue = businessRevenueDzd(bookings, ['confirmed', 'active', 'completed']);
    const foodOrders = activeFoodOrders(orders);
    const pending = pendingBusinessBookings(bookings);
    return [
      { label: "Today's Bookings", value: String(today.length), icon: 'calendar-outline' as const, color: SAHEL.accent },
      { label: 'Revenue (DZD)', value: revenue.toLocaleString(), icon: 'cash-outline' as const, color: SAHEL.highlight },
      { label: 'Active Orders', value: String(foodOrders.length), icon: 'restaurant-outline' as const, color: SAHEL.primary },
      { label: 'Pending', value: String(pending.length), icon: 'time-outline' as const, color: '#94A3B8' },
    ];
  }, [bookings, orders]);

  const settingsBtn = (
    <Pressable onPress={() => router.push('/(modals)/settings' as any)} style={{ padding: 8 }}>
      <Ionicons name="settings-outline" size={22} color={theme.accent} />
    </Pressable>
  );

  return (
    <ProTabShell
      role="business"
      title={t('pro.saheelPro')}
      subtitle={t('roles.business')}
      headerRight={settingsBtn}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── HERO GRADIENT ── */}
        <LinearGradient colors={theme.gradient} style={styles.hero}>
          <Text style={styles.heroGreeting}>Welcome back</Text>
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedDot} />
            <Text style={styles.verifiedText}>Verified · Business Owner</Text>
          </View>
        </LinearGradient>

        {/* ── PROVIDER TYPE SELECTOR ── */}
        <Text style={styles.sectionTitle}>Your Business</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
          {PROVIDER_TYPES.map((pt) => (
            <Pressable
              key={pt.key}
              style={[
                styles.typeCard,
                providerType === pt.key && { borderColor: pt.color, backgroundColor: pt.color + '10' },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setProviderType(pt.key);
              }}
            >
              <View style={[styles.typeIconWrap, { backgroundColor: pt.color + '18' }]}>
                <Ionicons name={pt.icon as any} size={22} color={pt.color} />
              </View>
              <Text
                style={[
                  styles.typeLabel,
                  providerType === pt.key && { color: pt.color, fontFamily: 'mon-b' },
                ]}
              >
                {pt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── DYNAMIC PANEL: Based on providerType ── */}
        {providerType === 'beach_spot' && <BeachSpotPanel />}
        {providerType === 'food_delivery' && <FoodDeliveryPanel />}
        {providerType === 'camel_trek' && <CamelTrekPanel />}
        {providerType === 'partner_activity' && <PartnerActivityPanel />}

        {/* ── QUICK LINKS ── */}
        <View style={styles.quickLinks}>
          <Pressable style={styles.quickLink} onPress={() => router.push('/(business)/orders' as any)}>
            <Ionicons name="fast-food-outline" size={20} color={SAHEL.accent} />
            <Text style={styles.quickLinkText}>Live food orders →</Text>
          </Pressable>
          <Pressable
            style={styles.quickLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setScannerOpen(true);
            }}
          >
            <Ionicons name="qr-code-outline" size={20} color={SAHEL.primary} />
            <Text style={styles.quickLinkText}>Scan ticket QR →</Text>
          </Pressable>
        </View>

        {/* ── OVERVIEW STATS ── */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <ProMenuShortcuts role="business" />
      </ScrollView>

      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <ProQRScanner
          onScanned={(data) => {
            setScannerOpen(false);
            showToast(`Ticket verified: ${data}`, 'success');
          }}
          onClose={() => setScannerOpen(false)}
          title="Scan Traveler Ticket"
        />
      </Modal>
    </ProTabShell>
  );
}

// ══════════════════════════════════════════════
// DYNAMIC PANEL COMPONENTS (per provider type)
// ══════════════════════════════════════════════

/** Beach Spot panel: 2D grid matrix controls for umbrella slots */
function BeachSpotPanel() {
  const occupiedCount = MOCK_SPOTS.filter((s) => s.status === 'occupied').length;
  const availableCount = MOCK_SPOTS.filter((s) => s.status === 'available').length;

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Ionicons name="grid-outline" size={20} color={SAHEL.accent} />
        <Text style={styles.panelTitle}>Spot Grid Control</Text>
      </View>
      <View style={styles.panelRow}>
        <View style={[styles.metricPill, { backgroundColor: SAHEL.accent + '12' }]}>
          <View style={[styles.metricDot, { backgroundColor: SAHEL.accent }]} />
          <Text style={styles.metricText}>{availableCount} Available</Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: '#FEE2E2' }]}>
          <View style={[styles.metricDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.metricText}>{occupiedCount} Occupied</Text>
        </View>
      </View>
      <View style={styles.miniGrid}>
        {MOCK_SPOTS.map((spot) => (
          <Pressable
            key={spot.id}
            style={[
              styles.miniSpot,
              spot.status === 'occupied'
                ? { backgroundColor: '#E2E8F0' }
                : { backgroundColor: SAHEL.accent, borderColor: SAHEL.accent },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              showToast(`Spot ${spot.id}: ${spot.status === 'available' ? `${spot.price} DZD` : 'Occupied'}`, 'info');
            }}
          >
            <Text
              style={[
                styles.miniSpotText,
                spot.status === 'occupied' && { color: '#94A3B8' },
              ]}
            >
              {spot.id}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.panelHint}>Tap spots to manage availability · Prices in DZD</Text>
    </View>
  );
}

/** Food Delivery panel: Kitchen prep stream + inventory toggles */
function FoodDeliveryPanel() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Ionicons name="restaurant-outline" size={20} color="#C56A39" />
        <Text style={styles.panelTitle}>Kitchen Pipeline</Text>
      </View>
      {MOCK_KITCHEN.map((ticket) => (
        <View key={ticket.id} style={styles.kitchenRow}>
          <View style={[styles.statusDot, { backgroundColor: ticket.status === 'ready' ? SAHEL.accent : ticket.status === 'preparing' ? SAHEL.highlight : '#94A3B8' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.kitchenItem}>{ticket.item}</Text>
            <Text style={styles.kitchenMeta}>
              {ticket.qty}× · {ticket.elapsed}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: ticket.status === 'ready' ? '#D1FAE5' : ticket.status === 'preparing' ? '#FEF3C7' : '#F1F5F9' }]}>
            <Text style={[styles.statusBadgeText, { color: ticket.status === 'ready' ? '#059669' : ticket.status === 'preparing' ? '#B45309' : '#64748B' }]}>
              {ticket.status}
            </Text>
          </View>
        </View>
      ))}
      <Text style={styles.panelHint}>Live kitchen stream · All prices in DZD</Text>
    </View>
  );
}

/** Camel Trek / Fleet panel: Caravan manager with time-slots and guides */
function CamelTrekPanel() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Ionicons name="leaf-outline" size={20} color={SAHEL.highlight} />
        <Text style={styles.panelTitle}>Fleet & Caravan Manager</Text>
      </View>
      {MOCK_FLEET.map((vehicle) => (
        <View key={vehicle.id} style={styles.fleetRow}>
          <View style={[styles.statusDot, { backgroundColor: vehicle.status === 'active' ? SAHEL.accent : vehicle.status === 'available' ? SAHEL.highlight : '#EF4444' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fleetName}>{vehicle.name}</Text>
            <Text style={styles.fleetMeta}>
              Guide: {vehicle.guide} · {vehicle.capacity} pax
            </Text>
          </View>
          <View style={styles.fleetRight}>
            <Text style={styles.fleetDeparture}>{vehicle.nextDeparture}</Text>
            <View style={[styles.statusBadge, { backgroundColor: vehicle.status === 'active' ? '#D1FAE5' : vehicle.status === 'available' ? '#FEF3C7' : '#FEE2E2' }]}>
              <Text style={[styles.statusBadgeText, { color: vehicle.status === 'active' ? '#059669' : vehicle.status === 'available' ? '#B45309' : '#EF4444' }]}>
                {vehicle.status}
              </Text>
            </View>
          </View>
        </View>
      ))}
      <Text style={styles.panelHint}>Track fleet availability · Departures in 24h format</Text>
    </View>
  );
}

/** Partner Activity panel: Generic operations overview */
function PartnerActivityPanel() {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Ionicons name="football-outline" size={20} color={SAHEL.primary} />
        <Text style={styles.panelTitle}>Activity Operations</Text>
      </View>
      <View style={styles.panelRow}>
        <View style={[styles.metricPill, { backgroundColor: SAHEL.primary + '12' }]}>
          <Text style={[styles.metricValue, { color: SAHEL.primary }]}>12</Text>
          <Text style={styles.metricText}>Active Sessions</Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: SAHEL.highlight + '12' }]}>
          <Text style={[styles.metricValue, { color: SAHEL.highlight }]}>48</Text>
          <Text style={styles.metricText}>Today's Bookings</Text>
        </View>
      </View>
      <View style={styles.panelRow}>
        <View style={[styles.metricPill, { backgroundColor: SAHEL.accent + '12' }]}>
          <Text style={[styles.metricValue, { color: SAHEL.accent }]}>8,500</Text>
          <Text style={styles.metricText}>Revenue (DZD)</Text>
        </View>
        <View style={[styles.metricPill, { backgroundColor: '#F1F5F9' }]}>
          <Text style={[styles.metricValue, { color: '#64748B' }]}>3</Text>
          <Text style={styles.metricText}>Pending</Text>
        </View>
      </View>
      <Text style={styles.panelHint}>Unified operations view · All values in DZD</Text>
    </View>
  );
}

// ══════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 32 },
  hero: { borderRadius: 20, padding: 22, gap: 6 },
  heroGreeting: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)' },
  heroName: { fontSize: 24, fontFamily: 'mon-b', color: '#FFFFFF' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  verifiedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: SAHEL.accent },
  verifiedText: { fontSize: 12, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.9)' },

  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },

  // Provider type selector
  typeRow: { gap: 10, paddingBottom: 4 },
  typeCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: SAHEL.card,
    borderWidth: 1.5,
    borderColor: SAHEL.border,
    minWidth: 100,
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeLabel: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.mutedText },

  // Dynamic panels
  panel: {
    backgroundColor: SAHEL.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 16,
    gap: 10,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  panelTitle: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  panelRow: { flexDirection: 'row', gap: 10 },
  panelHint: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 4 },

  // Metric pills
  metricPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  metricDot: { width: 8, height: 8, borderRadius: 4 },
  metricValue: { fontSize: 20, fontFamily: 'mon-b' },
  metricText: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },

  // Mini grid (beach spots)
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniSpot: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniSpotText: { fontSize: 12, fontFamily: 'mon-b', color: '#FFFFFF' },

  // Kitchen pipeline (food delivery)
  kitchenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SAHEL.border,
  },
  kitchenItem: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  kitchenMeta: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },

  // Fleet (camel trek)
  fleetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: SAHEL.border,
  },
  fleetName: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  fleetMeta: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },
  fleetRight: { alignItems: 'flex-end', gap: 4 },
  fleetDeparture: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.primary },

  // Status
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },

  // Quick links
  quickLinks: { flexDirection: 'row', gap: 10 },
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SAHEL.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  quickLinkText: { fontFamily: 'mon-sb', fontSize: 13, color: SAHEL.primary, flexShrink: 1 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: SAHEL.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
});
