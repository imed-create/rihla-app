/**
 * RIHLA — Hotel Detail Screen
 * -----------------------------
 * Full hotel listing detail with room inventory, availability calendar,
 * amenities grid, photo gallery, and reviews.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getListingById } from '@/constants/mockListings';
import type { HotelMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';

const { width: SCREEN_W } = Dimensions.get('window');

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶',
  pool: '🏊',
  parking: '🅿️',
  restaurant: '🍽️',
  spa: '💆',
  gym: '💪',
  bar: '🍸',
  ac: '❄️',
  tv: '📺',
  laundry: '🧺',
  elevator: '🛗',
  '24h_front_desk': '🛎️',
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
};

const MOCK_ROOMS: Record<string, RoomType[]> = {
  'hotel-1': [
    { id: 'r1', name: 'Single Room', price_per_night: 5500, max_guests: 1, bed_type: 'Single bed', size_sqm: 18, amenities: ['wifi', 'ac', 'tv'], available: true },
    { id: 'r2', name: 'Double Room', price_per_night: 7500, max_guests: 2, bed_type: 'Queen bed', size_sqm: 24, amenities: ['wifi', 'ac', 'tv', 'laundry'], available: true },
    { id: 'r3', name: 'Suite', price_per_night: 12000, max_guests: 3, bed_type: 'King bed + sofa', size_sqm: 40, amenities: ['wifi', 'ac', 'tv', 'laundry', 'spa'], available: false },
  ],
  'hotel-2': [
    { id: 'r4', name: 'Standard Room', price_per_night: 9000, max_guests: 2, bed_type: 'Queen bed', size_sqm: 28, amenities: ['wifi', 'ac', 'tv', 'minibar'], available: true },
    { id: 'r5', name: 'Deluxe Room', price_per_night: 14000, max_guests: 2, bed_type: 'King bed', size_sqm: 36, amenities: ['wifi', 'ac', 'tv', 'minibar', 'spa', 'pool'], available: true },
    { id: 'r6', name: 'Suite', price_per_night: 22000, max_guests: 3, bed_type: 'King bed + living area', size_sqm: 55, amenities: ['wifi', 'ac', 'tv', 'minibar', 'spa', 'pool', 'laundry'], available: true },
    { id: 'r7', name: 'Penthouse', price_per_night: 45000, max_guests: 4, bed_type: 'King bed + separate bedroom', size_sqm: 95, amenities: ['wifi', 'ac', 'tv', 'minibar', 'spa', 'pool', 'laundry', 'elevator', '24h_front_desk'], available: true },
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
    });
  }
  return days;
}

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const calendarDays = useMemo(() => generateCalendarDays(), []);

  if (!listing || listing.category !== 'hotel') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="bed-outline" size={48} color="#94A3B8" />
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
  const totalPrice = selectedRoomObj ? selectedRoomObj.price_per_night * totalNights : 0;

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── HERO ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#1A6B3A', SAHEL.primary]} style={styles.hero}>
            <View style={styles.heroNav}>
              <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.actionCircle}>
                  <Ionicons name="share-outline" size={20} color="#fff" />
                </Pressable>
                <Pressable
                  style={styles.actionCircle}
                  onPress={() => { hapticLight(); toggleFavorite(listing.id); }}
                >
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </Pressable>
              </View>
            </View>

            <View style={styles.heroContent}>
              <View style={styles.starsRow}>
                {Array.from({ length: m.star_rating }, (_, i) => (
                  <Ionicons key={i} name="star" size={14} color="#FFD166" />
                ))}
              </View>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.heroRatingText}>{listing.rating}</Text>
                <Text style={styles.heroReviewCount}>({listing.review_count} reviews)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── QUICK AMENITIES ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenityScroll}>
          {m.amenities.map((a) => (
            <View key={a} style={styles.amenityPill}>
              <Text style={styles.amenityEmoji}>{AMENITY_ICONS[a] || '✨'}</Text>
              <Text style={styles.amenityLabel}>{a}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── CHECK-IN / CHECK-OUT ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.checkRow}>
            <View style={styles.checkCol}>
              <Text style={styles.checkLabel}>CHECK-IN</Text>
              <Text style={styles.checkTime}>{m.check_in_time}</Text>
            </View>
            <View style={styles.checkDivider} />
            <View style={styles.checkCol}>
              <Text style={styles.checkLabel}>CHECK-OUT</Text>
              <Text style={styles.checkTime}>{m.check_out_time}</Text>
            </View>
          </View>
          {m.breakfast_included && (
            <View style={styles.breakfastPill}>
              <Ionicons name="cafe-outline" size={14} color={SAHEL.accent} />
              <Text style={styles.breakfastText}>Breakfast included</Text>
            </View>
          )}
        </View>

        {/* ── CALENDAR ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.calendarRow}>
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
                      isCheckIn && styles.dayCellSelected,
                      isCheckOut && styles.dayCellSelected,
                      inRange && styles.dayCellInRange,
                      day.isToday && styles.dayCellToday,
                    ]}
                    onPress={() => {
                      if (!day.available) return;
                      if (!checkIn || (checkIn && checkOut)) {
                        setCheckIn(dateStr);
                        setCheckOut(null);
                      } else {
                        if (dateStr > checkIn) {
                          setCheckOut(dateStr);
                        } else {
                          setCheckIn(dateStr);
                          setCheckOut(null);
                        }
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[styles.dayName, !day.available && { color: '#CBD5E1' }]}>{day.dayName}</Text>
                    <Text style={[styles.dayNum, !day.available && { color: '#CBD5E1' }, isCheckIn && { color: '#fff' }, isCheckOut && { color: '#fff' }]}>
                      {day.dayNum}
                    </Text>
                    <Text style={[styles.dayMonth, !day.available && { color: '#CBD5E1' }]}>{day.month}</Text>
                    {!day.available && <View style={styles.soldOutDot} />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          {checkIn && !checkOut && <Text style={styles.dateHint}>Select checkout date →</Text>}
          {checkIn && checkOut && (
            <Text style={styles.dateSelected}>
              📅 {new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()} ({totalNights} night{totalNights > 1 ? 's' : ''})
            </Text>
          )}
        </View>

        {/* ── ROOMS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Types</Text>
          <View style={styles.roomList}>
            {rooms.map((room) => (
              <Pressable
                key={room.id}
                style={[styles.roomCard, !room.available && styles.roomCardUnavailable, selectedRoom === room.id && styles.roomCardSelected]}
                onPress={() => {
                  if (!room.available) return;
                  setSelectedRoom(room.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                disabled={!room.available}
              >
                <View style={styles.roomHeader}>
                  <View style={styles.roomInfo}>
                    <Text style={[styles.roomName, !room.available && { color: '#94A3B8' }]}>{room.name}</Text>
                    <Text style={styles.roomBeds}>{room.bed_type} · {room.size_sqm}m² · Max {room.max_guests} guests</Text>
                  </View>
                  <View style={styles.roomPriceWrap}>
                    <Text style={styles.roomPrice}>{room.price_per_night.toLocaleString()}</Text>
                    <Text style={styles.roomPriceUnit}>DZD/night</Text>
                  </View>
                </View>
                <View style={styles.roomAmenities}>
                  {room.amenities.slice(0, 5).map((a) => (
                    <View key={a} style={styles.roomAmenityPill}>
                      <Text style={styles.roomAmenityText}>{AMENITY_ICONS[a] || '•'} {a}</Text>
                    </View>
                  ))}
                </View>
                {!room.available && (
                  <View style={styles.soldOutOverlay}>
                    <Text style={styles.soldOutText}>Sold Out</Text>
                  </View>
                )}
                {selectedRoom === room.id && (
                  <View style={styles.selectedCheck}>
                    <Ionicons name="checkmark-circle" size={20} color={SAHEL.accent} />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── DESCRIPTION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this hotel</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* ── REVIEWS ── */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Ionicons name="star" size={18} color="#FFD166" />
            <Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text>
          </View>
          <View style={styles.reviewCard}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>K</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewerName}>Karim B.</Text>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name={s <= 4 ? 'star' : 'star-outline'} size={12} color="#FFD166" />
                ))}
              </View>
              <Text style={styles.reviewText}>Excellent location and very clean rooms. The staff was incredibly helpful. Would definitely come back!</Text>
              <Text style={styles.reviewDate}>2 weeks ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── STICKY BOTTOM BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomPrice}>
          {selectedRoomObj ? (
            <>
              <Text style={styles.bottomPriceValue}>{totalPrice.toLocaleString()} DZD</Text>
              <Text style={styles.bottomPriceUnit}>{totalNights} night{totalNights > 1 ? 's' : ''} · {selectedRoomObj.name}</Text>
            </>
          ) : (
            <>
              <Text style={styles.bottomPriceValue}>{m.price_per_night_dzd.toLocaleString()} DZD</Text>
              <Text style={styles.bottomPriceUnit}>per night</Text>
            </>
          )}
        </View>
        <Pressable
          style={[styles.bookBtn, !selectedRoom && { opacity: 0.6 }]}
          onPress={() => {
            if (!selectedRoom) {
              showToast('Please select a room type', 'info');
              return;
            }
            hapticSuccess();
            router.push(`/checkout/${listing.id}?price=${m.price_per_night_dzd}&qty=${totalNights}` as any);
          }}
        >
          <Text style={styles.bookBtnText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  notFoundLink: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.accent },

  // Hero
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 4 },
  starsRow: { flexDirection: 'row', gap: 2 },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

  // Amenities scroll
  amenityScroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  amenityPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: SAHEL.border },
  amenityEmoji: { fontSize: 14 },
  amenityLabel: { fontSize: 12, fontFamily: 'mon-sb', color: '#334155', textTransform: 'capitalize' },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 12 },

  // Check-in/out
  checkRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 16 },
  checkCol: { flex: 1, alignItems: 'center', gap: 4 },
  checkLabel: { fontSize: 11, fontFamily: 'mon-sb', color: '#94A3B8', letterSpacing: 1 },
  checkTime: { fontSize: 20, fontFamily: 'mon-b', color: SAHEL.dark },
  checkDivider: { width: 1, backgroundColor: SAHEL.border, marginVertical: -4 },
  breakfastPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F0FDFA', alignSelf: 'flex-start' },
  breakfastText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.accent },

  // Calendar
  calendarRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 4 },
  dayCell: {
    width: 60, height: 72, borderRadius: 12, borderWidth: 1, borderColor: SAHEL.border,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  dayCellUnavailable: { backgroundColor: '#F8FAFC', opacity: 0.5 },
  dayCellSelected: { backgroundColor: SAHEL.primary, borderColor: SAHEL.primary },
  dayCellInRange: { backgroundColor: '#EFF6FF', borderColor: 'transparent' },
  dayCellToday: { borderColor: SAHEL.accent, borderWidth: 2 },
  dayName: { fontSize: 10, fontFamily: 'mon-sb', color: '#94A3B8' },
  dayNum: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark },
  dayMonth: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  soldOutDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#EF4444', marginTop: 2 },
  dateHint: { fontSize: 13, fontFamily: 'mon', color: SAHEL.accent, marginTop: 8 },
  dateSelected: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.primary, marginTop: 8 },

  // Rooms
  roomList: { gap: 10 },
  roomCard: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: SAHEL.border, padding: 16, position: 'relative',
  },
  roomCardUnavailable: { opacity: 0.5 },
  roomCardSelected: { borderColor: SAHEL.accent, backgroundColor: '#F0FDFA' },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roomInfo: { flex: 1, gap: 4 },
  roomName: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  roomBeds: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  roomPriceWrap: { alignItems: 'flex-end' },
  roomPrice: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  roomPriceUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  roomAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  roomAmenityPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: SAHEL.muted },
  roomAmenityText: { fontSize: 11, fontFamily: 'mon', color: '#475569' },
  soldOutOverlay: { position: 'absolute', top: 12, right: 12 },
  soldOutText: { fontSize: 11, fontFamily: 'mon-b', color: '#EF4444', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  selectedCheck: { position: 'absolute', top: 12, right: 12 },

  // Description
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },

  // Reviews
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14, marginTop: 8 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: SAHEL.primary, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
  reviewerName: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewText: { fontSize: 13, fontFamily: 'mon', color: '#475569', lineHeight: 18, marginTop: 6 },
  reviewDate: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginTop: 4 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: SAHEL.border,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  bottomPrice: {},
  bottomPriceValue: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomPriceUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: {
    backgroundColor: SAHEL.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14,
    shadowColor: SAHEL.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
