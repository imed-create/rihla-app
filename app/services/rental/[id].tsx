/**
 * RIHLA — Dedicated Rental Screen
 * ───────────────────────────────
 * Works like Airbnb:
 * - Image carousels, bedrooms, guest capacity, and key specs.
 * - Calendar date-range select modal (check-in/check-out).
 * - Host bio cards, house rules list, and approximate locations.
 * - Dynamic price breakdowns (nights * DZD + cleaning + service fees).
 * - Triggers booking additions in AppContext and directs to confirmation.
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
  Modal,
  Platform,
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
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import MapWithDirections from '@/components/shared/MapWithDirections';

const { width: SCREEN_W } = Dimensions.get('window');

export default function RentalServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const rental = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (rental ? getListingGallery(rental.cover_image_url ?? '', 'rental', 4) : []),
    [rental]
  );

  // Date range state
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(new Date('2026-06-20'));
  const [checkOut, setCheckOut] = useState<Date | null>(new Date('2026-06-25'));

  // Guests count state
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [guestsCount, setGuestsCount] = useState(2);

  if (!rental) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Rental property not found</Text>
      </View>
    );
  }

  const m = rental.metadata as import('@/types/service').RentalMetadata;

  // Nights Calculation
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  }, [checkIn, checkOut]);

  // Price Calculation
  const nightlyPrice = rental.price_dzd;
  const subtotal = nightlyPrice * nights;
  const cleaningFee = Math.round(nightlyPrice * 0.2); // flat 20% cleaning fee
  const serviceFee = Math.round(subtotal * 0.05); // 5% app service fee
  const totalCost = subtotal + cleaningFee + serviceFee;

  const handleDateSelect = (date: Date) => {
    hapticLight();
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else {
      if (date.getTime() > checkIn.getTime()) {
        setCheckOut(date);
        setShowCalendar(false);
      } else {
        setCheckIn(date);
        setCheckOut(null);
      }
    }
  };

  const handleBookingConfirm = () => {
    hapticSuccess();

    // Add booking to AppContext store
    addBooking({
      type: 'rental',
      title: rental.title,
      subtitle: `${rental.region || 'Villa'} · ${nights} Nights`,
      price: totalCost,
      businessId: rental.provider_id,
      icon: 'home',
      iconFamily: 'Ionicons',
      color: '#6C63FF',
      details: {
        check_in: checkIn ? checkIn.toISOString().split('T')[0] : '2026-06-20',
        check_out: checkOut ? checkOut.toISOString().split('T')[0] : '2026-06-25',
        nights: nights,
        guests: guestsCount,
        cleaning_fee: `${cleaningFee.toLocaleString()} DZD`,
        property_type: m.property_type || 'House',
      },
    });

    // Navigate to confirmation page
    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'rental',
        title: rental.title,
        subtitle: `${rental.region || 'Villa'} · ${nights} Nights`,
        price: String(totalCost),
      },
    });
  };

  // Generate calendar days for June 2026
  const calendarDays = useMemo(() => {
    const year = 2026;
    const month = 5;
    const days: (Date | null)[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    const pad = firstDay === 0 ? 6 : firstDay - 1; // Align to Monday
    for (let i = 0; i < pad; i++) days.push(null);
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* 1. Hero Image Slider */}
        <View style={styles.heroWrap}>
          <PhotoCarousel photos={gallery} height={240} showCount />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Property Specs */}
        <View style={styles.container}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>RENTAL</Text>
            </View>
            <View style={[styles.badgeType, { backgroundColor: colors.border }]}>
              <Text style={[styles.badgeTypeText, { color: colors.text }]}>
                {m.property_type ? m.property_type.toUpperCase() : 'VILLA'}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{rental.title}</Text>
          <Text style={[styles.location, { color: colors.muted }]}>
            📍 {rental.region ? `${rental.region}, ` : ''}{rental.wilaya}, Algeria
          </Text>

          {/* Highlights Row */}
          <View style={[styles.highlightsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.highlightBlock}>
              <Text style={[styles.highlightVal, { color: colors.text }]}>{m.max_guests || 6}</Text>
              <Text style={[styles.highlightKey, { color: colors.muted }]}>Guests</Text>
            </View>
            <View style={[styles.hlDivider, { backgroundColor: colors.border }]} />
            <View style={styles.highlightBlock}>
              <Text style={[styles.highlightVal, { color: colors.text }]}>{m.bedrooms || 3}</Text>
              <Text style={[styles.highlightKey, { color: colors.muted }]}>Bedrooms</Text>
            </View>
            <View style={[styles.hlDivider, { backgroundColor: colors.border }]} />
            <View style={styles.highlightBlock}>
              <Text style={[styles.highlightVal, { color: colors.text }]}>{m.bathrooms || 2}</Text>
              <Text style={[styles.highlightKey, { color: colors.muted }]}>Baths</Text>
            </View>
            <View style={[styles.hlDivider, { backgroundColor: colors.border }]} />
            <View style={styles.highlightBlock}>
              <Text style={[styles.highlightVal, { color: colors.text }]}>180m²</Text>
              <Text style={[styles.highlightKey, { color: colors.muted }]}>Area</Text>
            </View>
          </View>

          {/* Date Picker Row */}
          <View style={[styles.selectorBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.selectorBlock} onPress={() => setShowCalendar(true)}>
              <Text style={[styles.selectorLabel, { color: colors.muted }]}>CHECK-IN</Text>
              <Text style={[styles.selectorValue, { color: colors.text }]}>
                {checkIn ? checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Select Date'}
              </Text>
            </TouchableOpacity>
            <View style={[styles.selectorDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.selectorBlock} onPress={() => setShowCalendar(true)}>
              <Text style={[styles.selectorLabel, { color: colors.muted }]}>CHECK-OUT</Text>
              <Text style={[styles.selectorValue, { color: colors.text }]}>
                {checkOut ? checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Guests selector bar */}
          <TouchableOpacity
            style={[styles.selectorBar, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}
            onPress={() => setShowGuestsModal(true)}
          >
            <View style={styles.selectorBlock}>
              <Text style={[styles.selectorLabel, { color: colors.muted }]}>GUESTS</Text>
              <Text style={[styles.selectorValue, { color: colors.text }]}>
                {guestsCount} Guests
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} style={{ marginRight: 8 }} />
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About this property</Text>
            <Text style={[styles.descText, { color: colors.muted }]}>
              {rental.description}
            </Text>
          </View>

          {/* Host Profile Card */}
          <View style={[styles.hostCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.hostHeader}>
              <View style={styles.hostAvatar}>
                <Text style={styles.avatarText}>H</Text>
              </View>
              <View style={styles.hostMeta}>
                <Text style={[styles.hostName, { color: colors.text }]}>Hosted by Hassen</Text>
                <Text style={[styles.hostRating, { color: colors.muted }]}>⭐ 4.9 · 5 years experience</Text>
              </View>
            </View>
            <Text style={[styles.hostDesc, { color: colors.muted }]}>
              Hassen is dedicated to ensuring you have a relaxing stay. Available 24/7 via phone or app messaging.
            </Text>
          </View>

          {/* House Rules */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>House Rules</Text>
            <View style={styles.rulesList}>
              <View style={styles.ruleRow}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={[styles.ruleText, { color: colors.text }]}>Check-in: 14:00 – 22:00</Text>
              </View>
              <View style={styles.ruleRow}>
                <Ionicons name="time-outline" size={16} color={colors.muted} />
                <Text style={[styles.ruleText, { color: colors.text }]}>Check-out: Before 11:00</Text>
              </View>
              <View style={styles.ruleRow}>
                <Ionicons name="ban-outline" size={16} color="#EF4444" />
                <Text style={[styles.ruleText, { color: colors.text }]}>No smoking inside</Text>
              </View>
              <View style={styles.ruleRow}>
                <Ionicons name="volume-mute-outline" size={16} color={colors.muted} />
                <Text style={[styles.ruleText, { color: colors.text }]}>Quiet hours: After 22:00</Text>
              </View>
            </View>
          </View>

          {/* Pricing Details */}
          <View style={[styles.priceDetails, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.priceDetailsTitle, { color: colors.text }]}>Price Details</Text>
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKey, { color: colors.muted }]}>
                {nightlyPrice.toLocaleString()} DZD × {nights} nights
              </Text>
              <Text style={[styles.priceDetailValue, { color: colors.text }]}>
                {subtotal.toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKey, { color: colors.muted }]}>Cleaning fee</Text>
              <Text style={[styles.priceDetailValue, { color: colors.text }]}>
                {cleaningFee.toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKey, { color: colors.muted }]}>App service fee</Text>
              <Text style={[styles.priceDetailValue, { color: colors.text }]}>
                {serviceFee.toLocaleString()} DZD
              </Text>
            </View>
            <View style={[styles.priceDetailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKeyBold, { color: colors.text }]}>Total</Text>
              <Text style={[styles.priceDetailValueBold, { color: colors.text }]}>
                {totalCost.toLocaleString()} DZD
              </Text>
            </View>
          </View>

          {/* Approx Location Map */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location Details</Text>
            <Text style={[styles.approxText, { color: colors.muted }]}>
              Exact address will be shared after booking confirmation.
            </Text>
            <View style={styles.mapContainer}>
              <MapWithDirections
                height={150}
                markers={[{
                  id: rental.id,
                  latitude: rental.coordinates.latitude,
                  longitude: rental.coordinates.longitude,
                  title: rental.title,
                  subtitle: rental.wilaya,
                  category: 'rental',
                  rating: rental.rating,
                  priceDZD: rental.price_dzd,
                }]}
                showUserLocation={false}
                initialCenter={[rental.coordinates.longitude, rental.coordinates.latitude]}
                initialZoom={14}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Panel */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.bottomPrice, { color: colors.text }]}>
            {totalCost.toLocaleString()} DZD
          </Text>
          <Text style={[styles.bottomPriceSub, { color: colors.muted }]}>
            {nights} nights · {guestsCount} guests
          </Text>
        </View>
        <TouchableOpacity style={styles.requestBtn} onPress={handleBookingConfirm}>
          <Text style={styles.requestBtnText}>Request to Book</Text>
        </TouchableOpacity>
      </View>

      {/* ── Calendar Selection Modal ── */}
      <Modal visible={showCalendar} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Dates</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.monthHeader}>
              <Text style={[styles.monthLabel, { color: colors.text }]}>June 2026</Text>
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <Text key={d} style={[styles.calendarWeekLabel, { color: colors.muted }]}>{d}</Text>
              ))}
              {calendarDays.map((day, idx) => {
                if (!day) return <View key={`pad-${idx}`} style={styles.calendarDayCell} />;
                const isSelectedStart = checkIn && day.getTime() === checkIn.getTime();
                const isSelectedEnd = checkOut && day.getTime() === checkOut.getTime();
                const isInRange = checkIn && checkOut && day.getTime() > checkIn.getTime() && day.getTime() < checkOut.getTime();
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.calendarDayCell,
                      (isSelectedStart || isSelectedEnd) && { backgroundColor: '#6C63FF', borderRadius: 8 },
                      isInRange && { backgroundColor: 'rgba(108,99,255,0.1)' },
                    ]}
                    onPress={() => handleDateSelect(day)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      { color: colors.text },
                      (isSelectedStart || isSelectedEnd) && { color: '#FFF', fontWeight: 'bold' },
                      isInRange && { color: '#6C63FF' }
                    ]}>
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowCalendar(false)}>
              <Text style={styles.modalCloseBtnText}>Confirm Dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Guest Selector Modal ── */}
      <Modal visible={showGuestsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Guests</Text>
              <TouchableOpacity onPress={() => setShowGuestsModal(false)}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.counterRow}>
              <View>
                <Text style={[styles.counterTitle, { color: colors.text }]}>Total Guests</Text>
                <Text style={[styles.counterSub, { color: colors.muted }]}>Adults, children, and infants</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setGuestsCount(Math.max(1, guestsCount - 1)); }}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.countVal, { color: colors.text }]}>{guestsCount}</Text>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setGuestsCount(guestsCount + 1); }}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowGuestsModal(false)}>
              <Text style={styles.modalCloseBtnText}>Apply Selection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroWrap: { position: 'relative' },
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
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  badge: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontFamily: 'mon-b' },
  badgeType: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeTypeText: { fontSize: 9, fontFamily: 'mon-b' },
  title: { fontSize: 20, fontFamily: 'mon-b', letterSpacing: -0.5 },
  location: { fontSize: 13, fontFamily: 'mon', marginTop: 2 },

  // Highlights
  highlightsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginVertical: 16,
  },
  highlightBlock: { flex: 1, alignItems: 'center', gap: 1 },
  highlightVal: { fontSize: 14, fontFamily: 'mon-b' },
  highlightKey: { fontSize: 10, fontFamily: 'mon-sb' },
  hlDivider: { width: 1, height: 28 },

  // Selector bars
  selectorBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  selectorBlock: { flex: 1, paddingLeft: 4 },
  selectorLabel: { fontSize: 10, fontFamily: 'mon-b', letterSpacing: 0.5 },
  selectorValue: { fontSize: 14, fontFamily: 'mon-sb', marginTop: 2 },
  selectorDivider: { width: 1, height: 32, marginHorizontal: 12 },

  // Section
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 6 },
  descText: { fontSize: 13, fontFamily: 'mon', lineHeight: 20 },

  // Host Card
  hostCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    marginTop: 20,
  },
  hostHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 15, fontFamily: 'mon-b' },
  hostMeta: { gap: 1 },
  hostName: { fontSize: 13, fontFamily: 'mon-b' },
  hostRating: { fontSize: 11, fontFamily: 'mon' },
  hostDesc: { fontSize: 12, fontFamily: 'mon', lineHeight: 18 },

  // Rules
  rulesList: { gap: 8, marginTop: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { fontSize: 13, fontFamily: 'mon-sb' },

  // Pricing details
  priceDetails: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginTop: 20,
  },
  priceDetailsTitle: { fontSize: 14, fontFamily: 'mon-b' },
  priceDetailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceDetailKey: { fontSize: 12, fontFamily: 'mon' },
  priceDetailValue: { fontSize: 12, fontFamily: 'mon-sb' },
  priceDetailDivider: { height: 1, width: '100%' },
  priceDetailKeyBold: { fontSize: 14, fontFamily: 'mon-b' },
  priceDetailValueBold: { fontSize: 16, fontFamily: 'mon-b', color: '#6C63FF' },

  // Map
  approxText: { fontSize: 12, fontFamily: 'mon', marginBottom: 8 },
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
  requestBtn: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  requestBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  modalTitle: { fontSize: 16, fontFamily: 'mon-b' },
  monthHeader: { alignItems: 'center', marginVertical: 12 },
  monthLabel: { fontSize: 15, fontFamily: 'mon-b' },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'space-between',
  },
  calendarWeekLabel: {
    width: (SCREEN_W - 32) / 7 - 4,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'mon-b',
    paddingVertical: 8,
  },
  calendarDayCell: {
    width: (SCREEN_W - 32) / 7 - 4,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  calendarDayText: { fontSize: 13, fontFamily: 'mon-sb' },
  modalCloseBtn: {
    backgroundColor: '#6C63FF',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalCloseBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  // Counter
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  counterTitle: { fontSize: 14, fontFamily: 'mon-b' },
  counterSub: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countVal: { fontSize: 14, fontFamily: 'mon-b', minWidth: 20, textAlign: 'center' },
});
