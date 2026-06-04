/**
 * RIHLA — Activity Detail Screen
 * Paragliding, diving, hiking, etc.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getListingById } from '@/constants/mockListings';
import type { ActivityMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

const DIFFICULTY_COLORS = { easy: '#10B981', moderate: '#F59E0B', challenging: '#EF4444', extreme: '#7C3AED' };
const DIFFICULTY_ICONS = { easy: 'leaf-outline', moderate: 'trending-up-outline', challenging: 'flame-outline', extreme: 'flash-outline' };

const MOCK_SCHEDULES = [
  { id: 's1', date: '2026-07-01', time: '09:00', spotsLeft: 2, totalSpots: 6 },
  { id: 's2', date: '2026-07-01', time: '14:00', spotsLeft: 4, totalSpots: 6 },
  { id: 's3', date: '2026-07-02', time: '09:00', spotsLeft: 0, totalSpots: 6 },
  { id: 's4', date: '2026-07-02', time: '14:00', spotsLeft: 5, totalSpots: 6 },
  { id: 's5', date: '2026-07-03', time: '09:00', spotsLeft: 3, totalSpots: 6 },
  { id: 's6', date: '2026-07-03', time: '14:00', spotsLeft: 6, totalSpots: 6 },
];

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [participants, setParticipants] = useState(1);

  if (!listing || listing.category !== 'activity') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="flash-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Activity not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as ActivityMetadata;
  const diffColor = DIFFICULTY_COLORS[m.difficulty];
  const selectedSlotObj = MOCK_SCHEDULES.find((s) => s.id === selectedSlot);

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={[diffColor, SAHEL.primary]} style={styles.hero}>
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
              <View style={styles.diffPill}>
                <Ionicons name={DIFFICULTY_ICONS[m.difficulty] as any} size={14} color="#fff" />
                <Text style={styles.diffText}>{m.difficulty.charAt(0).toUpperCase() + m.difficulty.slice(1)}</Text>
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

        {/* Quick stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'time-outline', value: `${m.session_duration_minutes} min`, label: 'Duration' },
            { icon: 'people-outline', value: `${m.max_participants}`, label: 'Max Group' },
            { icon: m.equipment_included ? 'checkmark-circle-outline' : 'close-circle-outline', value: m.equipment_included ? 'Included' : 'Bring own', label: 'Equipment' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={18} color={SAHEL.accent} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Participant picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>How many people?</Text>
            <View style={styles.guestControls}>
              <Pressable style={styles.guestBtn} onPress={() => setParticipants(Math.max(1, participants - 1))}><Ionicons name="remove" size={18} color={SAHEL.primary} /></Pressable>
              <Text style={styles.guestCount}>{participants}</Text>
              <Pressable style={styles.guestBtn} onPress={() => setParticipants(Math.min(m.max_participants, participants + 1))}><Ionicons name="add" size={18} color={SAHEL.primary} /></Pressable>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Sessions</Text>
          <View style={styles.slotList}>
            {MOCK_SCHEDULES.map((slot) => (
              <Pressable key={slot.id}
                style={[styles.slotCard, slot.spotsLeft === 0 && styles.slotFull, selectedSlot === slot.id && styles.slotSelected]}
                onPress={() => { if (slot.spotsLeft === 0) return; setSelectedSlot(slot.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                disabled={slot.spotsLeft === 0}>
                <View style={styles.slotLeft}>
                  <Text style={styles.slotDate}>{slot.date}</Text>
                  <Text style={styles.slotTime}>{slot.time}</Text>
                </View>
                <Text style={[styles.slotSpots, slot.spotsLeft === 0 && { color: '#EF4444' }]}>
                  {slot.spotsLeft === 0 ? 'Sold out' : `${slot.spotsLeft} spots left`}
                </Text>
                {selectedSlot === slot.id && <Ionicons name="checkmark-circle" size={20} color={SAHEL.accent} />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this activity</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagRow}>
            {listing.tags.map((t) => (
              <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewHeader}><Ionicons name="star" size={18} color="#FFD166" /><Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text></View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{(listing.price_dzd * participants).toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>{participants} × {listing.price_dzd.toLocaleString()} DZD</Text>
        </View>
        <Pressable style={[styles.bookBtn, !selectedSlot && { opacity: 0.5 }]}
          onPress={() => { if (!selectedSlot) { showToast('Select a session time', 'info'); return; } hapticSuccess(); router.push(`/checkout/${listing.id}?price=${listing.price_dzd}&qty=${participants}` as any); }}>
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
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 4 },
  diffPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  diffText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff', textTransform: 'capitalize' },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 12 },
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 16 },
  guestLabel: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  guestControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: SAHEL.border, alignItems: 'center', justifyContent: 'center' },
  guestCount: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark, minWidth: 24, textAlign: 'center' },
  slotList: { gap: 8 },
  slotCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: SAHEL.border, padding: 14 },
  slotFull: { opacity: 0.5 },
  slotSelected: { borderColor: SAHEL.accent, backgroundColor: '#F0FDFA' },
  slotLeft: { flex: 1 },
  slotDate: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.dark },
  slotTime: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  slotSpots: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.accent, marginRight: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: SAHEL.primary + '10', borderWidth: 1, borderColor: SAHEL.primary + '20' },
  tagText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.primary },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: SAHEL.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: { backgroundColor: SAHEL.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
