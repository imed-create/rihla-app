/**
 * RIHLA — Dedicated Event Screen
 * ─────────────────────────────
 * Works like Ticketmaster:
 * - Event banners, dates, timings, and map coordinates.
 * - Program timeline / Lineup section.
 * - Ticket inventory select blocks: General, VIP, VVIP (with distinct quantity controls).
 * - Dynamic DZD billing summaries.
 * - Triggers checkout/booking confirm actions in AppContext.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getListingById } from '@/constants/mockListings';
import { getListingGallery } from '@/utils/listingPhotos';
import { useApp } from '@/context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import MapWithDirections from '@/components/shared/MapWithDirections';

const { width: SCREEN_W } = Dimensions.get('window');

type TicketTier = {
  id: string;
  name: string;
  price: number;
  qty: number;
  perks: string[];
  maxAvailable: number;
};

export default function EventServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const event = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (event ? getListingGallery(event.cover_image_url ?? '', 'event', 3) : []),
    [event]
  );

  // Ticket quantities state
  const [generalQty, setGeneralQty] = useState(1);
  const [vipQty, setVipQty] = useState(0);
  const [vvipQty, setVvipQty] = useState(0);

  if (!event) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Event not found</Text>
      </View>
    );
  }

  const ticketTiers: TicketTier[] = [
    {
      id: 'general',
      name: 'General Admission',
      price: event.price_dzd,
      qty: generalQty,
      maxAvailable: 10,
      perks: ['Entry to main arena', 'Standing zone access'],
    },
    {
      id: 'vip',
      name: 'VIP Experience Pass',
      price: Math.round(event.price_dzd * 1.8),
      qty: vipQty,
      maxAvailable: 5,
      perks: ['Fast-track entry queue', 'Reserved seating zone', '1 Complimentary drink'],
    },
    {
      id: 'vvip',
      name: 'VVIP Backstage Elite',
      price: Math.round(event.price_dzd * 3.5),
      qty: vvipQty,
      maxAvailable: 2,
      perks: ['Backstage access pass', 'Artist meet & greet', 'Catering & premium lounge'],
    },
  ];

  const totalTickets = generalQty + vipQty + vvipQty;
  const totalCost = ticketTiers.reduce((sum, tier) => sum + tier.price * tier.qty, 0);

  const handleBookingConfirm = () => {
    if (totalTickets === 0) return;
    hapticSuccess();

    // Add booking to AppContext store
    addBooking({
      type: 'event',
      title: event.title,
      subtitle: `${totalTickets} Tickets · Event`,
      price: totalCost,
      businessId: event.provider_id,
      icon: 'musical-notes',
      iconFamily: 'Ionicons',
      color: '#A855F7',
      details: {
        venue: ' أحمد باي القاعة / Constantine Arena',
        date: '2026-07-20',
        time: '21:00',
        tickets_count: totalTickets,
        general_tickets: generalQty,
        vip_tickets: vipQty,
        vvip_tickets: vvipQty,
      },
    });

    // Navigate to confirmation page
    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'event',
        title: event.title,
        subtitle: `${totalTickets} Tickets · Event`,
        price: String(totalCost),
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* Banner */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: gallery[0] }} style={styles.heroImage} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          {/* Header titles */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>LIVE EVENT</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>

          {/* Quick Schedule Metadata */}
          <View style={[styles.scheduleBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.schedItem}>
              <Ionicons name="calendar-outline" size={16} color={RIHLA.accent} />
              <View>
                <Text style={[styles.schedVal, { color: colors.text }]}>Monday, 20 July 2026</Text>
                <Text style={[styles.schedLabel, { color: colors.muted }]}>Date</Text>
              </View>
            </View>
            <View style={styles.schedItem}>
              <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
              <View>
                <Text style={[styles.schedVal, { color: colors.text }]}>21:00 – 00:30</Text>
                <Text style={[styles.schedLabel, { color: colors.muted }]}>Doors Open 20:00</Text>
              </View>
            </View>
            <View style={styles.schedItem}>
              <Ionicons name="location-outline" size={16} color={RIHLA.accent} />
              <View>
                <Text style={[styles.schedVal, { color: colors.text }]}>Ahmed Bey Palace, Constantine</Text>
                <Text style={[styles.schedLabel, { color: colors.muted }]}>Venue</Text>
              </View>
            </View>
          </View>

          {/* Program Timings / Lineup */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Program & Lineup</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineTime}>20:00</Text>
                <View style={styles.timelineDot} />
                <Text style={[styles.timelineDesc, { color: colors.text }]}>Gates open & Warm-up DJ set</Text>
              </View>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineTime}>21:15</Text>
                <View style={styles.timelineDot} />
                <Text style={[styles.timelineDesc, { color: colors.text }]}>Opening Acts & Cultural Show</Text>
              </View>
              <View style={styles.timelineRow}>
                <Text style={styles.timelineTime}>22:30</Text>
                <View style={[styles.timelineDot, { backgroundColor: '#A855F7' }]} />
                <Text style={[styles.timelineDesc, { color: colors.text, fontWeight: 'bold' }]}>Main Headliner Performance</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About the Event</Text>
            <Text style={[styles.descText, { color: colors.muted }]}>
              {event.description}
            </Text>
          </View>

          {/* Select Ticket Tiers */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Ticket Category</Text>
            {ticketTiers.map((tier) => {
              const setQty =
                tier.id === 'general'
                  ? setGeneralQty
                  : tier.id === 'vip'
                  ? setVipQty
                  : setVvipQty;
              return (
                <View key={tier.id} style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.ticketCardHeader}>
                    <View>
                      <Text style={[styles.ticketName, { color: colors.text }]}>{tier.name}</Text>
                      <Text style={[styles.ticketPrice, { color: colors.text }]}>
                        {tier.price.toLocaleString()} DZD
                      </Text>
                    </View>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity
                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                        onPress={() => { hapticLight(); setQty(Math.max(0, tier.qty - 1)); }}
                      >
                        <Ionicons name="remove" size={14} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyVal, { color: colors.text }]}>{tier.qty}</Text>
                      <TouchableOpacity
                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                        onPress={() => { hapticLight(); setQty(Math.min(tier.maxAvailable, tier.qty + 1)); }}
                      >
                        <Ionicons name="add" size={14} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.perksList, { borderTopColor: colors.border }]}>
                    {tier.perks.map((perk, idx) => (
                      <View key={idx} style={styles.perkRow}>
                        <Ionicons name="checkmark" size={12} color="#10B981" />
                        <Text style={[styles.perkText, { color: colors.muted }]}>{perk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Map Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Venue Location Map</Text>
            <View style={styles.mapContainer}>
              <MapWithDirections
                height={150}
                markers={[{
                  id: event.id,
                  latitude: event.coordinates.latitude,
                  longitude: event.coordinates.longitude,
                  title: event.title,
                  subtitle: event.wilaya,
                  category: 'event',
                  rating: event.rating,
                  priceDZD: event.price_dzd,
                }]}
                showUserLocation={false}
                initialCenter={[event.coordinates.longitude, event.coordinates.latitude]}
                initialZoom={14}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Reserve Panel */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.bottomPrice, { color: colors.text }]}>
            {totalCost.toLocaleString()} DZD
          </Text>
          <Text style={[styles.bottomPriceSub, { color: colors.muted }]}>
            {totalTickets} {totalTickets === 1 ? 'Ticket' : 'Tickets'} selected
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.reserveBtn, totalTickets === 0 && { opacity: 0.5 }]}
          disabled={totalTickets === 0}
          onPress={handleBookingConfirm}
        >
          <Text style={styles.reserveBtnText}>Buy Tickets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 180 },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { padding: 16 },
  badge: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontFamily: 'mon-b' },
  title: { fontSize: 20, fontFamily: 'mon-b', letterSpacing: -0.5, marginBottom: 16 },

  // Schedule
  scheduleBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  schedItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  schedVal: { fontSize: 13, fontFamily: 'mon-sb' },
  schedLabel: { fontSize: 10, fontFamily: 'mon', marginTop: 1 },

  // Timeline
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10 },
  timeline: { paddingLeft: 8, gap: 14, marginVertical: 6 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineTime: { fontSize: 11, fontFamily: 'mon-b', width: 36 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0' },
  timelineDesc: { fontSize: 13, fontFamily: 'mon' },

  descText: { fontSize: 13, fontFamily: 'mon', lineHeight: 20 },

  // Ticket Tiers
  ticketCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  ticketCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketName: { fontSize: 13, fontFamily: 'mon-b' },
  ticketPrice: { fontSize: 14, fontFamily: 'mon-b', color: '#A855F7', marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: { fontSize: 13, fontFamily: 'mon-b', minWidth: 16, textAlign: 'center' },
  perksList: { borderTopWidth: 0.5, paddingTop: 8, gap: 4 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  perkText: { fontSize: 11, fontFamily: 'mon' },

  // Map
  mapContainer: { borderRadius: 14, overflow: 'hidden' },

  // Sticky bottom
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b' },
  bottomPriceSub: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },
  reserveBtn: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  reserveBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },
});
