/**
 * RIHLA — Polymorphic Business Management Screen
 * ------------------------------------------------
 * Category-specific dashboards for business owners to manage their listings.
 * Each category shows relevant management tools.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Switch,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import type { MarketplaceCategory } from '@/types/service';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

// ─────────────────────────────────────────────
// MOCK MANAGEMENT DATA
// ─────────────────────────────────────────────

const MOCK_STATS: Record<MarketplaceCategory, { label: string; value: string; icon: string; color: string }[]> = {
  hotel: [
    { label: 'Occupancy', value: '78%', icon: 'bed-outline', color: '#10B981' },
    { label: 'Revenue', value: '485,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.7', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Bookings Today', value: '8', icon: 'calendar-outline', color: '#7C3AED' },
  ],
  restaurant: [
    { label: 'Orders Today', value: '34', icon: 'receipt-outline', color: '#C56A39' },
    { label: 'Revenue', value: '127,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.6', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Prep Time', value: '18 min', icon: 'time-outline', color: '#10B981' },
  ],
  beach: [
    { label: 'Occupied', value: '18/30', icon: 'grid-outline', color: '#00a896' },
    { label: 'Revenue', value: '45,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.7', icon: 'star-outline', color: '#F59E0B' },
    { label: 'VIP Spots', value: '6/10', icon: 'star-outline', color: '#f4a261' },
  ],
  rental: [
    { label: 'Bookings', value: '3 this week', icon: 'calendar-outline', color: '#6C63FF' },
    { label: 'Revenue', value: '54,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.8', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Availability', value: '22 days', icon: 'home-outline', color: '#10B981' },
  ],
  activity: [
    { label: 'Sessions Today', value: '3', icon: 'flash-outline', color: '#EF4444' },
    { label: 'Revenue', value: '32,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Participants', value: '12', icon: 'people-outline', color: '#7C3AED' },
    { label: 'Avg Rating', value: '4.9', icon: 'star-outline', color: '#F59E0B' },
  ],
  event: [
    { label: 'Tickets Sold', value: '342/550', icon: 'ticket-outline', color: '#7C3AED' },
    { label: 'Revenue', value: '1,197,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Days Until', value: '11', icon: 'time-outline', color: '#EF4444' },
    { label: 'VIP Tickets', value: '38/50', icon: 'star-outline', color: '#f4a261' },
  ],
  guide: [
    { label: 'Tours This Week', value: '5', icon: 'compass-outline', color: '#10B981' },
    { label: 'Revenue', value: '20,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.9', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Clients', value: '18', icon: 'people-outline', color: '#7C3AED' },
  ],
  photographer: [
    { label: 'Bookings', value: '4 this week', icon: 'camera-outline', color: '#EC4899' },
    { label: 'Revenue', value: '35,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.8', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Turnaround', value: '3 days', icon: 'time-outline', color: '#10B981' },
  ],
  driver: [
    { label: 'Rides Today', value: '6', icon: 'car-outline', color: '#F59E0B' },
    { label: 'Revenue', value: '18,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '4.7', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Total KM', value: '142 km', icon: 'navigate-outline', color: '#10B981' },
  ],
  experience: [
    { label: 'Active Groups', value: '2', icon: 'compass-outline', color: '#C56A39' },
    { label: 'Revenue', value: '70,000 DZD', icon: 'cash-outline', color: '#3B82F6' },
    { label: 'Avg Rating', value: '5.0', icon: 'star-outline', color: '#F59E0B' },
    { label: 'Next Departure', value: 'Jul 1', icon: 'calendar-outline', color: '#7C3AED' },
  ],
};

const MANAGEMENT_ACTIONS: Record<MarketplaceCategory, { label: string; icon: string; screen: string }[]> = {
  hotel: [
    { label: 'Manage Rooms', icon: 'bed-outline', screen: 'rooms' },
    { label: 'Availability Calendar', icon: 'calendar-outline', screen: 'calendar' },
    { label: 'Pricing', icon: 'pricetag-outline', screen: 'pricing' },
    { label: 'Guest Reviews', icon: 'chatbubbles-outline', screen: 'reviews' },
  ],
  restaurant: [
    { label: 'Manage Menu', icon: 'restaurant-outline', screen: 'menu' },
    { label: 'Live Orders', icon: 'receipt-outline', screen: 'orders' },
    { label: 'Pricing', icon: 'pricetag-outline', screen: 'pricing' },
    { label: 'Customer Reviews', icon: 'chatbubbles-outline', screen: 'reviews' },
  ],
  beach: [
    { label: 'Spot Grid', icon: 'grid-outline', screen: 'spots' },
    { label: 'Zone Manager', icon: 'flag-outline', screen: 'zones' },
    { label: 'Occupancy Map', icon: 'map-outline', screen: 'occupancy' },
    { label: 'Pricing', icon: 'pricetag-outline', screen: 'pricing' },
  ],
  rental: [
    { label: 'Availability Calendar', icon: 'calendar-outline', screen: 'calendar' },
    { label: 'Guest Messages', icon: 'chatbubbles-outline', screen: 'messages' },
    { label: 'House Rules', icon: 'document-text-outline', screen: 'rules' },
    { label: 'Pricing', icon: 'pricetag-outline', screen: 'pricing' },
  ],
  activity: [
    { label: 'Schedule Manager', icon: 'time-outline', screen: 'schedule' },
    { label: 'Participant List', icon: 'people-outline', screen: 'participants' },
    { label: 'Equipment', icon: 'construct-outline', screen: 'equipment' },
    { label: 'Pricing', icon: 'pricetag-outline', screen: 'pricing' },
  ],
  event: [
    { label: 'Ticket Manager', icon: 'ticket-outline', screen: 'tickets' },
    { label: 'Attendee List', icon: 'people-outline', screen: 'attendees' },
    { label: 'Check-in Scanner', icon: 'scan-outline', screen: 'scanner' },
    { label: 'Event Timeline', icon: 'timeline-outline', screen: 'timeline' },
  ],
  guide: [
    { label: 'Availability', icon: 'time-outline', screen: 'availability' },
    { label: 'Tour History', icon: 'compass-outline', screen: 'history' },
    { label: 'Client Messages', icon: 'chatbubbles-outline', screen: 'messages' },
    { label: 'Earnings', icon: 'cash-outline', screen: 'earnings' },
  ],
  photographer: [
    { label: 'Portfolio Manager', icon: 'images-outline', screen: 'portfolio' },
    { label: 'Bookings', icon: 'calendar-outline', screen: 'bookings' },
    { label: 'Packages & Pricing', icon: 'pricetag-outline', screen: 'packages' },
    { label: 'Earnings', icon: 'cash-outline', screen: 'earnings' },
  ],
  driver: [
    { label: 'Active Routes', icon: 'navigate-outline', screen: 'routes' },
    { label: 'Ride History', icon: 'time-outline', screen: 'history' },
    { label: 'Vehicle Info', icon: 'car-outline', screen: 'vehicle' },
    { label: 'Earnings', icon: 'cash-outline', screen: 'earnings' },
  ],
  experience: [
    { label: 'Itinerary Editor', icon: 'map-outline', screen: 'itinerary' },
    { label: 'Group Management', icon: 'people-outline', screen: 'groups' },
    { label: 'Departure Dates', icon: 'calendar-outline', screen: 'dates' },
    { label: 'Earnings', icon: 'cash-outline', screen: 'earnings' },
  ],
};

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function BusinessManageScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 20 : insets.top + 8;
  const cat = (category ?? 'hotel') as MarketplaceCategory;
  const catDef = getCategoryDef(cat);
  const stats = MOCK_STATS[cat] ?? [];
  const actions = MANAGEMENT_ACTIONS[cat] ?? [];
  const [isListed, setIsListed] = useState(true);

  return (
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={RIHLA.dark} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Manage {catDef.label}</Text>
          <Text style={styles.headerSub}>Your business dashboard</Text>
        </View>
        <Pressable style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={RIHLA.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* ── LISTING STATUS ── */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, { backgroundColor: isListed ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.statusText}>{isListed ? 'Your listing is live' : 'Your listing is paused'}</Text>
          </View>
          <Switch
            value={isListed}
            onValueChange={(v) => { setIsListed(v); hapticLight(); showToast(v ? 'Listing activated' : 'Listing paused', 'info'); }}
            trackColor={{ false: '#E2E8F0', true: '#D1FAE5' }}
            thumbColor={isListed ? '#10B981' : '#94A3B8'}
          />
        </View>

        {/* ── STATS GRID ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                </View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── MANAGEMENT ACTIONS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.actionList}>
            {actions.map((a) => (
              <Pressable
                key={a.label}
                style={styles.actionCard}
                onPress={() => { hapticLight(); showToast(`${a.label} — Coming soon!`, 'info'); }}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={a.icon as any} size={22} color={catDef.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── QUICK TIPS ── */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={18} color={RIHLA.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Pro Tip</Text>
              <Text style={styles.tipText}>
                Listings with photos get 3x more bookings. Add high-quality images to your {catDef.label.toLowerCase()} to attract more travelers.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: RIHLA.card, borderWidth: 1, borderColor: RIHLA.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  headerSub: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: RIHLA.card, borderWidth: 1, borderColor: RIHLA.border, alignItems: 'center', justifyContent: 'center' },

  // Status
  statusCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },

  // Stats
  section: { paddingHorizontal: 20, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14, gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8' },

  // Actions
  actionList: { gap: 8 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14 },
  actionIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: RIHLA.muted, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { flex: 1, fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.dark },

  // Tips
  tipCard: { flexDirection: 'row', gap: 10, backgroundColor: '#F0FDFA', borderRadius: 12, padding: 14 },
  tipTitle: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 4 },
  tipText: { fontSize: 12, fontFamily: 'mon', color: '#475569', lineHeight: 17 },
});
