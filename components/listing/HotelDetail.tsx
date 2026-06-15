/**
 * RIHLA — Hotel Detail Screen (Premium)
 * --------------------------------------
 * Booking.com-style hotel detail with photo carousel, room inventory,
 * availability calendar, amenities grid, reviews, and sticky booking bar.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Share,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { HotelMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import { getListingGallery, getCategoryHeroGradient } from '@/utils/listingPhotos';
import { useTheme } from '@/context/ThemeContext';

const AMENITY_ICONS: Record<string, { emoji: string; label: string }> = {
  wifi: { emoji: '📶', label: 'Free WiFi' },
  pool: { emoji: '🏊', label: 'Pool' },
  parking: { emoji: '🅿️', label: 'Parking' },
  restaurant: { emoji: '🍽️', label: 'Restaurant' },
  spa: { emoji: '💆', label: 'Spa' },
  gym: { emoji: '💪', label: 'Gym' },
  bar: { emoji: '🍸', label: 'Bar' },
  ac: { emoji: '❄️', label: 'Air Conditioning' },
  tv: { emoji: '📺', label: 'Smart TV' },
  laundry: { emoji: '🧺', label: 'Laundry' },
  elevator: { emoji: '🛗', label: 'Elevator' },
  '24h_front_desk': { emoji: '🛎️', label: '24h Front Desk' },
  beach: { emoji: '🏖️', label: 'Beach Access' },
  kids_club: { emoji: '👶', label: 'Kids Club' },
  water_sports: { emoji: '🏄', label: 'Water Sports' },
  garden: { emoji: '🌿', label: 'Garden' },
  terrace: { emoji: '🌅', label: 'Terrace' },
  campfire: { emoji: '🔥', label: 'Campfire' },
  guide_service: { emoji: '🧭', label: 'Guide Service' },
  minibar: { emoji: '🍾', label: 'Minibar' },
};

type RoomType = {
  id: string;
  name: string;
  price_per_night: number;
  max_guests: number;
  bed_type: string;
  size_sqm: number;
  amenities: string[];
  available: boolean;
  image?: string;
};

const MOCK_ROOMS: Record<string, RoomType[]> = {
  'hotel-1': [
    { id: 'r1', name: 'Single Room', price_per_night: 5500, max_guests: 1, bed_type: 'Single bed', size_sqm: 18, amenities: ['wifi', 'ac', 'tv'], available: true, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600' },
    { id: 'r2', name: 'Double Room', price_per_night: 7500, max_guests: 2, bed_type: 'Queen bed', size_sqm: 24, amenities: ['wifi', 'ac', 'tv', 'laundry'], available: true, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600' },
    { id: 'r3', name: 'Suite', price_per_night: 12000, max_guests: 3, bed_type: 'King bed + sofa', size_sqm: 40, amenities: ['wifi', 'ac', 'tv', 'laundry', 'spa'], available: false, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600' },
  ],
  'hotel-2': [
    { id: 'r4', name: 'Standard Room', price_per_night: 9000, max_guests: 2, bed_type: 'Queen bed', size_sqm: 28, amenities: ['wifi', 'ac', 'tv', 'minibar'], available: true, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600' },
    { id: 'r5', name: 'Deluxe Room', price_per_night: 14000, max_guests: 2, bed_type: 'King bed', size_sqm: 36, amenities: ['wifi', 'ac', 'tv', 'minibar', 'spa', 'pool'], available: true, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600' },
    { id: 'r6', name: 'Suite', price_per_night: 22000, max_guests: 3, bed_type: 'King bed + living area', size_sqm: 55, amenities: ['wifi', 'ac', 'tv', 'minibar', 'spa', 'pool', 'laundry'], available: true, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600' },
    { id: 'r7', name: 'Penthouse', price_per_night: 45000, max_guests: 4, bed_type: 'King bed + separate bedroom', size_sqm: 95, amenities: ['wifi', 'ac', 'tv', 'minibar', 'spa', 'pool', 'laundry', 'elevator', '24h_front_desk'], available: true, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600' },
  ],
};

function generateCalendarDays() {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en', { weekday: 'short' }),
      month: d.toLocaleDateString('en', { month: 'short' }),
      available: Math.random() > 0.25,
      isToday: i === 0,
      price: Math.round(7000 + Math.random() * 8000),
    });
  }
  return days;
}

const MOCK_REVIEWS = [
  { id: 'r1', name: 'Karim B.', avatar: 'K', rating: 5, date: '2 weeks ago', text: 'Excellent location and very clean rooms. The staff was incredibly helpful. The sea view from our suite was breathtaking!', verified: true },
  { id: 'r2', name: 'Sarah M.', avatar: 'S', rating: 4, date: '1 month ago', text: 'Beautiful hotel with great amenities. The pool area is stunning. Only minor issue was the WiFi speed in the evenings.', verified: true },
  { id: 'r3', name: 'Youcef K.', avatar: 'Y', rating: 5, date: '1 month ago', text: 'Perfect for our anniversary trip. The suite was luxurious and the breakfast buffet had everything we could want.', verified: false },
  { id: 'r4', name: 'Nadia H.', avatar: 'N', rating: 4, date: '2 months ago', text: 'Great hotel overall. The spa was fantastic and the restaurant served excellent traditional food. Will come back!', verified: true },
];

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { colors } = useTheme();

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const calendarDays = useMemo(() => generateCalendarDays(), []);

  const gallery = useMemo(
    () => listing ? getListingGallery(listing.cover_image_url ?? '', 'hotel', 7) : [],
    [listing],
  );

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: colors.muted },
    notFoundLink: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent },

    heroWrap: { position: 'relative' },
    heroNav: {
      position: 'absolute', left: 16, right: 16, zIndex: 10,
      flexDirection: 'row', justifyContent: 'space-between',
    },
    navCircle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
    },
    navRight: { flexDirection: 'row', gap: 8 },
    heroGradient: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
      justifyContent: 'flex-end',
    },
    heroOverlay: { paddingHorizontal: 20, paddingBottom: 16, gap: 4 },
    starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
    heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
    heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroLocation: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    ratingBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 3,
      backgroundColor: RIHLA.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    },
    ratingBadgeText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
    heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

    statsBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card,
      borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 12,
    },
    statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    statValue: { fontSize: 12, fontFamily: 'mon-sb', color: colors.muted },
    statDivider: { width: 1, height: 20, backgroundColor: colors.border },

    breakfastBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 10,
      padding: 12, borderRadius: 10, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#D1FAE5',
    },
    breakfastEmoji: { fontSize: 18 },
    breakfastText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },

    section: { paddingHorizontal: 20, paddingTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 18, fontFamily: 'mon-b', color: colors.text },
    nightCount: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },

    amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    amenityItem: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10,
      borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    },
    amenityEmoji: { fontSize: 16 },
    amenityLabel: { fontSize: 12, fontFamily: 'mon-sb', color: colors.muted },
    showAllBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10,
      paddingVertical: 8,
    },
    showAllText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.primary },

    calendarScroll: { paddingVertical: 12, gap: 6, paddingHorizontal: 4 },
    dayCell: {
      width: 64, height: 80, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: 1,
    },
    dayCellUnavailable: { backgroundColor: colors.card, opacity: 0.5 },
    dayCellSelected: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
    dayCellInRange: { backgroundColor: '#EFF6FF', borderColor: '#EFF6FF' },
    dayCellToday: { borderColor: RIHLA.accent, borderWidth: 2 },
    dayName: { fontSize: 10, fontFamily: 'mon-sb', color: colors.muted },
    dayNum: { fontSize: 18, fontFamily: 'mon-b', color: colors.text },
    dayMonth: { fontSize: 9, fontFamily: 'mon', color: colors.muted },
    dayPrice: { fontSize: 9, fontFamily: 'mon-sb', color: RIHLA.accent },
    dayTextDisabled: { color: colors.muted },
    soldOutDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#EF4444', marginTop: 2 },
    dateHint: { fontSize: 13, fontFamily: 'mon', color: RIHLA.accent, marginTop: 6 },
    dateSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    dateSelected: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.primary },

    roomList: { gap: 10 },
    roomCard: {
      flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1.5,
      borderColor: colors.border, overflow: 'hidden', position: 'relative',
    },
    roomCardUnavailable: { opacity: 0.5 },
    roomCardSelected: { borderColor: RIHLA.accent, backgroundColor: colors.card },
    roomAccent: { width: 4 },
    roomContent: { flex: 1, padding: 16 },
    roomTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    roomInfo: { flex: 1, gap: 4 },
    roomName: { fontSize: 16, fontFamily: 'mon-b', color: colors.text },
    roomBeds: { fontSize: 12, fontFamily: 'mon', color: colors.muted },
    roomPriceWrap: { alignItems: 'flex-end' },
    roomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    roomPriceUnit: { fontSize: 10, fontFamily: 'mon', color: colors.muted },
    roomAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    roomAmenityPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: RIHLA.muted },
    roomAmenityText: { fontSize: 10, fontFamily: 'mon', color: colors.muted },
    soldOutBadge: { position: 'absolute', top: 14, right: 14 },
    soldOutText: { fontSize: 11, fontFamily: 'mon-b', color: '#EF4444', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    selectedBadge: { position: 'absolute', top: 14, right: 14 },

    description: { fontSize: 14, fontFamily: 'mon', color: colors.muted, lineHeight: 22, marginTop: 4 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: RIHLA.primary + '08', borderWidth: 1, borderColor: RIHLA.primary + '15' },
    tagText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.primary },

    reviewHeader: { marginBottom: 12 },
    reviewSummary: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    reviewBigRating: {
      width: 52, height: 52, borderRadius: 12, backgroundColor: RIHLA.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    reviewBigNumber: { fontSize: 22, fontFamily: 'mon-b', color: '#fff' },
    reviewSectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: colors.text },
    reviewSectionSub: { fontSize: 12, fontFamily: 'mon', color: colors.muted },

    starDistribution: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 10 },
    starRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    starLabel: { fontSize: 12, fontFamily: 'mon-b', color: colors.muted, width: 12, textAlign: 'right' },
    starBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    starBarFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFD166' },
    starPct: { fontSize: 11, fontFamily: 'mon', color: colors.muted, width: 28, textAlign: 'right' },

    reviewCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8 },
    reviewCardHeader: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    reviewAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: RIHLA.primary + '15', alignItems: 'center', justifyContent: 'center' },
    reviewAvatarText: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary },
    reviewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    reviewerName: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    verifiedText: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.accent },
    reviewStars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
    reviewDate: { fontSize: 11, fontFamily: 'mon', color: colors.muted, marginLeft: 6 },
    reviewText: { fontSize: 13, fontFamily: 'mon', color: colors.muted, lineHeight: 20 },

    bottomBar: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      paddingHorizontal: 20, paddingTop: 14,
      backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12,
    },
    bottomPriceSection: {},
    bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    bottomUnit: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    bookBtn: {
      backgroundColor: RIHLA.accent, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14,
      shadowColor: RIHLA.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
    },
    bookBtnDisabled: { opacity: 0.5 },
    bookBtnText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
  }), [colors]);

  if (!listing || listing.category !== 'hotel') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="bed-outline" size={48} color={colors.muted} />
          <Text style={styles.notFoundText}>Hotel not found</Text>
          <Pressable onPress={() => safeGoBack()}>
            <Text style={styles.notFoundLink}>← Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as HotelMetadata;
  const rooms = MOCK_ROOMS[id ?? ''] ?? MOCK_ROOMS['hotel-1'];
  const selectedRoomObj = rooms.find((r) => r.id === selectedRoom);
  const totalNights = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 1;
  const totalPrice = selectedRoomObj ? selectedRoomObj.price_per_night * totalNights : m.price_per_night_dzd * totalNights;
  const displayAmenities = showAllAmenities ? m.amenities : m.amenities.slice(0, 6);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── HERO PHOTO CAROUSEL ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <PhotoCarousel
            photos={gallery}
            height={360}
            showCount={true}
            topPad={0}
          />
          {/* Navigation overlay */}
          <View style={[styles.heroNav, { top: topPad + 12 }]}>
            <Pressable style={styles.navCircle} onPress={() => safeGoBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.navRight}>
              <Pressable style={styles.navCircle} onPress={async () => {
                try {
                  await Share.share({ message: `Check out ${listing.title} on RIHLA! From ${m.price_per_night_dzd.toLocaleString()} DZD/night` });
                } catch { /* noop */ }
              }}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.navCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
              </Pressable>
            </View>
          </View>
          {/* Bottom gradient with title */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroGradient}>
            <View style={styles.heroOverlay}>
              <View style={styles.starsRow}>
                {Array.from({ length: m.star_rating }, (_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#FFD166" />
                ))}
              </View>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <View style={styles.heroLocationRow}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              </View>
              <View style={styles.heroRating}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.ratingBadgeText}>{listing.rating}</Text>
                </View>
                <Text style={styles.heroReviewCount}>· {listing.review_count} reviews</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── QUICK STATS BAR ── */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.statValue}>Check-in {m.check_in_time}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.statValue}>Check-out {m.check_out_time}</Text>
          </View>
        </View>

        {m.breakfast_included && (
          <View style={styles.breakfastBanner}>
            <Text style={styles.breakfastEmoji}>🍳</Text>
            <Text style={styles.breakfastText}>Breakfast included</Text>
          </View>
        )}

        {/* ── AMENITIES ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenityGrid}>
            {displayAmenities.map((a) => {
              const info = AMENITY_ICONS[a] ?? { emoji: '✨', label: a };
              return (
                <View key={a} style={styles.amenityItem}>
                  <Text style={styles.amenityEmoji}>{info.emoji}</Text>
                  <Text style={styles.amenityLabel}>{info.label}</Text>
                </View>
              );
            })}
          </View>
          {m.amenities.length > 6 && (
            <Pressable style={styles.showAllBtn} onPress={() => setShowAllAmenities(!showAllAmenities)}>
              <Text style={styles.showAllText}>{showAllAmenities ? 'Show less' : `Show all ${m.amenities.length} amenities`}</Text>
              <Ionicons name={showAllAmenities ? 'chevron-up' : 'chevron-down'} size={16} color={RIHLA.primary} />
            </Pressable>
          )}
        </View>

        {/* ── CALENDAR ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Dates</Text>
            {checkIn && checkOut && (
              <Text style={styles.nightCount}>{totalNights} night{totalNights > 1 ? 's' : ''}</Text>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
            {calendarDays.slice(0, 30).map((day, i) => {
              const dateStr = day.date.toISOString().split('T')[0];
              const isCheckIn = checkIn === dateStr;
              const isCheckOut = checkOut === dateStr;
              const inRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.dayCell,
                    !day.available && styles.dayCellUnavailable,
                    (isCheckIn || isCheckOut) && styles.dayCellSelected,
                    inRange && styles.dayCellInRange,
                    day.isToday && styles.dayCellToday,
                  ]}
                  onPress={() => {
                    if (!day.available) return;
                    if (!checkIn || (checkIn && checkOut)) {
                      setCheckIn(dateStr);
                      setCheckOut(null);
                    } else {
                      if (dateStr > checkIn) setCheckOut(dateStr);
                      else { setCheckIn(dateStr); setCheckOut(null); }
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.dayName, !day.available && styles.dayTextDisabled, (isCheckIn || isCheckOut) && { color: '#fff' }]}>{day.dayName}</Text>
                  <Text style={[styles.dayNum, !day.available && styles.dayTextDisabled, (isCheckIn || isCheckOut) && { color: '#fff' }]}>{day.dayNum}</Text>
                  <Text style={[styles.dayMonth, !day.available && styles.dayTextDisabled, (isCheckIn || isCheckOut) && { color: '#fff' }]}>{day.month}</Text>
                  {day.available && (
                    <Text style={[styles.dayPrice, (isCheckIn || isCheckOut) && { color: 'rgba(255,255,255,0.8)' }]}>
                      {day.price.toLocaleString()}
                    </Text>
                  )}
                  {!day.available && <View style={styles.soldOutDot} />}
                </Pressable>
              );
            })}
          </ScrollView>
          {checkIn && !checkOut && <Text style={styles.dateHint}>← Select checkout date</Text>}
          {checkIn && checkOut && (
            <View style={styles.dateSummary}>
              <Ionicons name="calendar" size={14} color={RIHLA.accent} />
              <Text style={styles.dateSelected}>
                {new Date(checkIn).toLocaleDateString('en', { month: 'short', day: 'numeric' })} → {new Date(checkOut).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* ── ROOMS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rooms</Text>
          <View style={styles.roomList}>
            {rooms.map((room) => (
              <Pressable
                key={room.id}
                style={[
                  styles.roomCard,
                  !room.available && styles.roomCardUnavailable,
                  selectedRoom === room.id && styles.roomCardSelected,
                ]}
                onPress={() => {
                  if (!room.available) return;
                  setSelectedRoom(room.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                disabled={!room.available}
              >
                {/* Room image accent bar */}
                <View style={[styles.roomAccent, { backgroundColor: selectedRoom === room.id ? RIHLA.accent : colors.border }]} />
                <View style={styles.roomContent}>
                  <View style={styles.roomTop}>
                    <View style={styles.roomInfo}>
                      <Text style={[styles.roomName, !room.available && { color: colors.muted }]}>{room.name}</Text>
                      <Text style={styles.roomBeds}>{room.bed_type} · {room.size_sqm}m² · Max {room.max_guests} {room.max_guests === 1 ? 'guest' : 'guests'}</Text>
                    </View>
                    <View style={styles.roomPriceWrap}>
                      <Text style={styles.roomPrice}>{room.price_per_night.toLocaleString()}</Text>
                      <Text style={styles.roomPriceUnit}>DZD / night</Text>
                    </View>
                  </View>
                  <View style={styles.roomAmenities}>
                    {room.amenities.slice(0, 5).map((a) => {
                      const info = AMENITY_ICONS[a];
                      return (
                        <View key={a} style={styles.roomAmenityPill}>
                          <Text style={styles.roomAmenityText}>{info?.emoji ?? '•'} {info?.label ?? a}</Text>
                        </View>
                      );
                    })}
                  </View>
                  {!room.available && (
                    <View style={styles.soldOutBadge}>
                      <Text style={styles.soldOutText}>Sold Out</Text>
                    </View>
                  )}
                  {selectedRoom === room.id && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={RIHLA.accent} />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── DESCRIPTION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this hotel</Text>
          <Text style={styles.description}>{listing.description}</Text>
          {listing.tags.length > 0 && (
            <View style={styles.tagRow}>
              {listing.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── REVIEWS ── */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewSummary}>
              <View style={styles.reviewBigRating}>
                <Text style={styles.reviewBigNumber}>{listing.rating}</Text>
              </View>
              <View>
                <Text style={styles.reviewSectionTitle}>Guest Reviews</Text>
                <Text style={styles.reviewSectionSub}>{listing.review_count} verified reviews</Text>
              </View>
            </View>
          </View>

          {/* Star distribution */}
          <View style={styles.starDistribution}>
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
              return (
                <View key={star} style={styles.starRow}>
                  <Text style={styles.starLabel}>{star}</Text>
                  <Ionicons name="star" size={12} color="#FFD166" />
                  <View style={styles.starBar}>
                    <View style={[styles.starBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.starPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>

          {/* Review cards */}
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.reviewNameRow}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    {review.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={RIHLA.accent} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={11} color="#FFD166" />
                    ))}
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── STICKY BOTTOM BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomPriceSection}>
          {selectedRoomObj ? (
            <>
              <Text style={styles.bottomPrice}>{totalPrice.toLocaleString()} DZD</Text>
              <Text style={styles.bottomUnit}>{totalNights} night{totalNights > 1 ? 's' : ''} · {selectedRoomObj.name}</Text>
            </>
          ) : (
            <>
              <Text style={styles.bottomPrice}>From {m.price_per_night_dzd.toLocaleString()} DZD</Text>
              <Text style={styles.bottomUnit}>per night</Text>
            </>
          )}
        </View>
        <Pressable
          style={[styles.bookBtn, (!checkIn || !checkOut || !selectedRoom) && styles.bookBtnDisabled]}
          onPress={() => {
            if (!checkIn || !checkOut) { showToast('Select your dates first', 'info'); return; }
            if (!selectedRoom) { showToast('Select a room type', 'info'); return; }
            hapticSuccess();
            router.push(`/checkout/${listing.id}?price=${selectedRoomObj!.price_per_night}&qty=${totalNights}` as any);
          }}
        >
          <Text style={styles.bookBtnText}>Reserve</Text>
        </Pressable>
      </View>
    </View>
  );
}
