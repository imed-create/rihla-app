/**
 * RIHLA — Dedicated Hotel Screen
 * ──────────────────────────────
 * Works like Booking.com:
 * - Hero carousel.
 * - Dynamic room list selection.
 * - Custom animated date range picker calendar.
 * - Price calculator and breakdown details.
 * - Connects reservation action to AppContext store.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  Platform,
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
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import MapWithDirections from '@/components/shared/MapWithDirections';

const { width: SCREEN_W } = Dimensions.get('window');

export default function HotelServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const hotel = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (hotel ? getListingGallery(hotel.cover_image_url ?? '', 'hotel', 5) : []),
    [hotel]
  );

  // Date picker states
  const [showCalendar, setShowCalendar] = useState(false);
  const [checkIn, setCheckIn] = useState<Date | null>(new Date('2026-06-20'));
  const [checkOut, setCheckOut] = useState<Date | null>(new Date('2026-06-25'));

  // Guest count state
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(1);

  // Selected Room Type
  const [selectedRoom, setSelectedRoom] = useState<string>('Standard Room');

  if (!hotel) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Hotel not found</Text>
      </View>
    );
  }

  const m = hotel.metadata as import('@/types/service').HotelMetadata;

  // Rooms Data
  const roomTypes = [
    {
      name: 'Standard Room',
      desc: 'Comfortable standard double room with city view.',
      price: hotel.price_dzd,
      image: gallery[1] || gallery[0],
      beds: '1 Queen Bed',
      guests: 2,
      amenities: ['Free WiFi', 'AC', 'Mini Bar'],
    },
    {
      name: 'Deluxe Suite',
      desc: 'Spacious suite with balcony, living area, and premium minibar.',
      price: Math.round(hotel.price_dzd * 1.5),
      image: gallery[2] || gallery[0],
      beds: '1 King Bed',
      guests: 3,
      amenities: ['Free WiFi', 'AC', 'Mini Bar', 'Ocean View', 'Balcony'],
    },
    {
      name: 'Presidential Family Suite',
      desc: 'Luxury two-bedroom suite with kitchen, master bath, and lounge access.',
      price: Math.round(hotel.price_dzd * 2.6),
      image: gallery[3] || gallery[0],
      beds: '2 King Beds',
      guests: 5,
      amenities: ['Free WiFi', 'AC', 'Kitchen', 'Lounge Access', '2 Bathrooms'],
    },
  ];

  const currentRoomPrice = roomTypes.find((r) => r.name === selectedRoom)?.price || hotel.price_dzd;

  // Nights Calculation
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  }, [checkIn, checkOut]);

  // Pricing Summary
  const roomCostTotal = currentRoomPrice * nights * roomsCount;
  const taxesFees = Math.round(roomCostTotal * 0.08); // 8% local tourist taxes
  const totalCost = roomCostTotal + taxesFees;

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
    // Save to AppContext store
    addBooking({
      type: 'hotel',
      title: hotel.title,
      subtitle: `${selectedRoom} · ${nights} Nights`,
      price: totalCost,
      businessId: hotel.provider_id,
      icon: 'bed',
      iconFamily: 'Ionicons',
      color: '#1A6B3A',
      details: {
        check_in: checkIn ? checkIn.toISOString().split('T')[0] : '2026-06-20',
        check_out: checkOut ? checkOut.toISOString().split('T')[0] : '2026-06-25',
        room_type: selectedRoom,
        nights: nights,
        guests: adults + childrenCount,
        breakfast: m.breakfast_included ? 'Included' : 'Not Included',
      },
    });

    // Navigate to confirmation page
    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'hotel',
        title: hotel.title,
        subtitle: `${selectedRoom} · ${nights} Nights`,
        price: String(totalCost),
      },
    });
  };

  // Generate calendar days for June 2026
  const calendarDays = useMemo(() => {
    const year = 2026;
    const month = 5; // June (0-indexed)
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
        {/* 1. Hero Carousel */}
        <View style={styles.heroContainer}>
          <PhotoCarousel photos={gallery} height={250} showCount />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* 2. Hotel Title & Badges */}
        <View style={styles.container}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }]}>{hotel.title}</Text>
              <View style={styles.ratingRow}>
                {Array.from({ length: m.star_rating }).map((_, i) => (
                  <Ionicons key={i} name="star" size={13} color="#FFD166" />
                ))}
                <Text style={[styles.reviewsCount, { color: colors.muted }]}>
                  · {hotel.rating} Rating · {hotel.review_count} Reviews
                </Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {hotel.rating}</Text>
            </View>
          </View>

          {/* Location link & map */}
          <Text style={[styles.locationText, { color: colors.muted }]}>
            📍 {hotel.region ? `${hotel.region}, ` : ''}{hotel.wilaya}, Algeria
          </Text>

          {/* 3. Check-In / Check-Out Date Picker Row */}
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

          {/* Guests and Rooms Selector Row */}
          <TouchableOpacity
            style={[styles.selectorBar, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 8 }]}
            onPress={() => setShowGuestsModal(true)}
          >
            <View style={styles.selectorBlock}>
              <Text style={[styles.selectorLabel, { color: colors.muted }]}>GUESTS & ROOMS</Text>
              <Text style={[styles.selectorValue, { color: colors.text }]}>
                {adults + childrenCount} Guests · {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} style={{ marginRight: 8 }} />
          </TouchableOpacity>

          {/* 4. Room Types Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Room Type</Text>
            {roomTypes.map((room) => {
              const isSelected = selectedRoom === room.name;
              return (
                <TouchableOpacity
                  key={room.name}
                  style={[
                    styles.roomCard,
                    { backgroundColor: colors.card, borderColor: isSelected ? '#1A6B3A' : colors.border },
                    isSelected && { borderWidth: 2 },
                  ]}
                  onPress={() => {
                    hapticLight();
                    setSelectedRoom(room.name);
                  }}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: room.image }} style={styles.roomImage} />
                  <View style={styles.roomInfo}>
                    <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
                    <Text style={[styles.roomDesc, { color: colors.muted }]} numberOfLines={2}>
                      {room.desc}
                    </Text>
                    <View style={styles.roomMeta}>
                      <Text style={[styles.roomMetaText, { color: colors.muted }]}>🛏️ {room.beds}</Text>
                      <Text style={[styles.roomMetaText, { color: colors.muted }]}>👥 Max {room.guests} guests</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={[styles.roomPrice, { color: colors.text }]}>
                        {room.price.toLocaleString()} DZD <Text style={[styles.roomPriceUnit, { color: colors.muted }]}>/ night</Text>
                      </Text>
                      <View style={[styles.selectBtn, { backgroundColor: isSelected ? '#1A6B3A' : colors.bg, borderColor: isSelected ? '#1A6B3A' : colors.border }]}>
                        <Text style={[styles.selectBtnText, { color: isSelected ? '#FFF' : colors.text }]}>
                          {isSelected ? 'Selected' : 'Select'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 5. Pricing details */}
          <View style={[styles.priceDetails, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.priceDetailsTitle, { color: colors.text }]}>Price Summary</Text>
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKey, { color: colors.muted }]}>
                {selectedRoom} ({nights} nights × {roomsCount} room)
              </Text>
              <Text style={[styles.priceDetailValue, { color: colors.text }]}>
                {roomCostTotal.toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKey, { color: colors.muted }]}>Taxes & local service fees (8%)</Text>
              <Text style={[styles.priceDetailValue, { color: colors.text }]}>
                {taxesFees.toLocaleString()} DZD
              </Text>
            </View>
            <View style={[styles.priceDetailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceDetailRow}>
              <Text style={[styles.priceDetailKeyBold, { color: colors.text }]}>Total Amount</Text>
              <Text style={[styles.priceDetailValueBold, { color: colors.text }]}>
                {totalCost.toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.cancellationPill}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.cancellationText}>Free cancellation until 48 hours before check-in</Text>
            </View>
          </View>

          {/* Amenities details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {m.amenities.map((amenity) => (
                <View key={amenity} style={[styles.amenityItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#1A6B3A" />
                  <Text style={[styles.amenityText, { color: colors.text }]}>{amenity}</Text>
                </View>
              ))}
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
            {nights} {nights === 1 ? 'night' : 'nights'} · {adults + childrenCount} guests
          </Text>
        </View>
        <TouchableOpacity style={styles.reserveBtn} onPress={handleBookingConfirm}>
          <Text style={styles.reserveBtnText}>Reserve Room</Text>
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
                      (isSelectedStart || isSelectedEnd) && { backgroundColor: '#1A6B3A', borderRadius: 8 },
                      isInRange && { backgroundColor: 'rgba(26,107,58,0.1)' },
                    ]}
                    onPress={() => handleDateSelect(day)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      { color: colors.text },
                      (isSelectedStart || isSelectedEnd) && { color: '#FFF', fontWeight: 'bold' },
                      isInRange && { color: '#1A6B3A' }
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Guests & Rooms</Text>
              <TouchableOpacity onPress={() => setShowGuestsModal(false)}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Adult Counter */}
            <View style={styles.counterRow}>
              <View>
                <Text style={[styles.counterTitle, { color: colors.text }]}>Adults</Text>
                <Text style={[styles.counterSub, { color: colors.muted }]}>Age 13 or above</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setAdults(Math.max(1, adults - 1)); }}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.countVal, { color: colors.text }]}>{adults}</Text>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setAdults(adults + 1); }}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children Counter */}
            <View style={styles.counterRow}>
              <View>
                <Text style={[styles.counterTitle, { color: colors.text }]}>Children</Text>
                <Text style={[styles.counterSub, { color: colors.muted }]}>Ages 2 – 12</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setChildrenCount(Math.max(0, childrenCount - 1)); }}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.countVal, { color: colors.text }]}>{childrenCount}</Text>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setChildrenCount(childrenCount + 1); }}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Rooms Counter */}
            <View style={styles.counterRow}>
              <View>
                <Text style={[styles.counterTitle, { color: colors.text }]}>Rooms</Text>
                <Text style={[styles.counterSub, { color: colors.muted }]}>Number of rooms needed</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setRoomsCount(Math.max(1, roomsCount - 1)); }}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.countVal, { color: colors.text }]}>{roomsCount}</Text>
                <TouchableOpacity
                  style={[styles.countBtn, { borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setRoomsCount(roomsCount + 1); }}
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
  heroContainer: { position: 'relative' },
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { fontSize: 22, fontFamily: 'mon-b', letterSpacing: -0.5 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  reviewsCount: { fontSize: 12, fontFamily: 'mon', marginLeft: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1A6B3A',
  },
  badgeText: { color: '#FFF', fontSize: 12, fontFamily: 'mon-b' },
  locationText: { fontSize: 13, fontFamily: 'mon', marginBottom: 16 },

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

  // Rooms Selection
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', marginBottom: 12 },
  roomCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  roomImage: { width: '100%', height: 140 },
  roomInfo: { padding: 12, gap: 4 },
  roomName: { fontSize: 15, fontFamily: 'mon-b' },
  roomDesc: { fontSize: 12, fontFamily: 'mon', lineHeight: 18 },
  roomMeta: { flexDirection: 'row', gap: 12, marginVertical: 4 },
  roomMetaText: { fontSize: 11, fontFamily: 'mon-sb' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  roomPrice: { fontSize: 15, fontFamily: 'mon-b' },
  roomPriceUnit: { fontSize: 11, fontFamily: 'mon' },
  selectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectBtnText: { fontSize: 12, fontFamily: 'mon-b' },

  // Pricing Summary
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
  priceDetailValueBold: { fontSize: 16, fontFamily: 'mon-b', color: '#1A6B3A' },
  cancellationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cancellationText: { fontSize: 11, fontFamily: 'mon-sb', color: '#10B981' },

  // Amenities
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  amenityText: { fontSize: 12, fontFamily: 'mon-sb' },

  // Bottom Bar
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
    backgroundColor: '#1A6B3A',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  reserveBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  // Modals styling
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
    backgroundColor: '#1A6B3A',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalCloseBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  // Counters
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
