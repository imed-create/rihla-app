/**
 * RIHLA — Rental Detail Screen
 * Villa, apartment, house, riad, studio
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getListingById } from '@/constants/mockListings';
import type { RentalMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

const AMENITY_ICONS: Record<string, string> = {
  pool: '🏊', wifi: '📶', parking: '🅿️', ac: '❄️', kitchen: '🍳', bbq: '🍖',
  washing_machine: '🧺', dryer: '👔', tv: '📺', garden: '🌿', balcony: '🌅', sea_view: '🌊',
};

function generateDays() {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 60; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    days.push({ date: d.toISOString().split('T')[0], dayNum: d.getDate(), dayName: d.toLocaleDateString('en', { weekday: 'short' }), month: d.toLocaleDateString('en', { month: 'short' }), available: Math.random() > 0.2, isToday: i === 0 });
  }
  return days;
}

export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const calendarDays = useMemo(() => generateDays(), []);

  if (!listing || listing.category !== 'rental') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="home-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Rental not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as RentalMetadata;
  const totalNights = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 1;
  const total = m.price_per_night_dzd * totalNights;

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#6C63FF', SAHEL.primary]} style={styles.hero}>
            <View style={styles.heroNav}>
              <Pressable style={styles.backCircle} onPress={() => safeGoBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.actionCircle}><Ionicons name="share-outline" size={20} color="#fff" /></Pressable>
                <Pressable style={styles.actionCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </Pressable>
              </View>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.typePill}><Text style={styles.typePillText}>{m.property_type.charAt(0).toUpperCase() + m.property_type.slice(1)}</Text></View>
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

        {/* Property stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'bed-outline', value: `${m.bedrooms} BR`, label: 'Bedrooms' },
            { icon: 'water-outline', value: `${m.bathrooms} BA`, label: 'Bathrooms' },
            { icon: 'people-outline', value: `Max ${m.max_guests}`, label: 'Guests' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={18} color={SAHEL.accent} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenityGrid}>
            {m.amenities.map((a) => (
              <View key={a} style={styles.amenityItem}>
                <Text style={styles.amenityEmoji}>{AMENITY_ICONS[a] || '✨'}</Text>
                <Text style={styles.amenityLabel}>{a.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        </View>

        {m.monthly_available && (
          <View style={styles.section}>
            <View style={styles.monthlyPill}>
              <Ionicons name="calendar-outline" size={16} color={SAHEL.accent} />
              <Text style={styles.monthlyText}>Monthly rental available — discounted rates</Text>
            </View>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.calendarRow}>
              {calendarDays.slice(0, 30).map((day, i) => {
                const sel = checkIn === day.date || checkOut === day.date;
                const inRange = checkIn && checkOut && day.date > checkIn && day.date < checkOut;
                return (
                  <Pressable key={i} style={[styles.dayCell, !day.available && { opacity: 0.4 }, sel && styles.daySelected, inRange && styles.dayInRange, day.isToday && styles.dayToday]}
                    onPress={() => {
                      if (!day.available) return;
                      if (!checkIn || (checkIn && checkOut)) { setCheckIn(day.date); setCheckOut(null); }
                      else { if (day.date > checkIn) setCheckOut(day.date); else { setCheckIn(day.date); setCheckOut(null); } }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}>
                    <Text style={[styles.dayName, !day.available && { color: '#CBD5E1' }]}>{day.dayName}</Text>
                    <Text style={[styles.dayNum, !day.available && { color: '#CBD5E1' }, sel && { color: '#fff' }]}>{day.dayNum}</Text>
                    <Text style={[styles.dayMonth, !day.available && { color: '#CBD5E1' }]}>{day.month}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          {checkIn && checkOut && (
            <Text style={styles.dateSelected}>📅 {new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()} ({totalNights} night{totalNights > 1 ? 's' : ''})</Text>
          )}
        </View>

        {/* Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>Number of guests</Text>
            <View style={styles.guestControls}>
              <Pressable style={styles.guestBtn} onPress={() => setGuests(Math.max(1, guests - 1))}><Ionicons name="remove" size={18} color={SAHEL.primary} /></Pressable>
              <Text style={styles.guestCount}>{guests}</Text>
              <Pressable style={styles.guestBtn} onPress={() => setGuests(Math.min(m.max_guests, guests + 1))}><Ionicons name="add" size={18} color={SAHEL.primary} /></Pressable>
            </View>
          </View>
        </View>

        {/* House rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House Rules</Text>
          <View style={styles.rulesCard}>
            {['Check-in: 14:00 – 22:00', 'Check-out: before 11:00', 'No smoking indoors', 'No pets allowed', 'Quiet hours: 22:00 – 08:00'].map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color={SAHEL.accent} />
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Ionicons name="star" size={18} color="#FFD166" />
            <Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{total.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>{totalNights} night{totalNights > 1 ? 's' : ''}</Text>
        </View>
        <Pressable style={[styles.bookBtn, (!checkIn || !checkOut) && { opacity: 0.5 }]}
          onPress={() => { if (!checkIn || !checkOut) { showToast('Select check-in and check-out dates', 'info'); return; } hapticSuccess(); showToast('Reservation — Coming soon!', 'info'); }}>
          <Text style={styles.bookBtnText}>Reserve</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 4 },
  typePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typePillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff', textTransform: 'capitalize' },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 12 },
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: SAHEL.border },
  amenityEmoji: { fontSize: 14 },
  amenityLabel: { fontSize: 12, fontFamily: 'mon-sb', color: '#334155', textTransform: 'capitalize' },
  monthlyPill: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#D1FAE5' },
  monthlyText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.accent },
  calendarRow: { flexDirection: 'row', gap: 6 },
  dayCell: { width: 60, height: 72, borderRadius: 12, borderWidth: 1, borderColor: SAHEL.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 2 },
  daySelected: { backgroundColor: SAHEL.primary, borderColor: SAHEL.primary },
  dayInRange: { backgroundColor: '#EFF6FF', borderColor: 'transparent' },
  dayToday: { borderColor: SAHEL.accent, borderWidth: 2 },
  dayName: { fontSize: 10, fontFamily: 'mon-sb', color: '#94A3B8' },
  dayNum: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark },
  dayMonth: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  dateSelected: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.primary, marginTop: 8 },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 16 },
  guestLabel: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  guestControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: SAHEL.border, alignItems: 'center', justifyContent: 'center' },
  guestCount: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark, minWidth: 24, textAlign: 'center' },
  rulesCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14, gap: 10 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText: { fontSize: 13, fontFamily: 'mon', color: '#475569' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: SAHEL.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: { backgroundColor: SAHEL.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
