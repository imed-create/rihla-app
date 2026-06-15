/**
 * RIHLA — Guide Detail Screen
 * Tour guides with languages, certifications, schedule
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { GuideMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

const LANG_FLAGS: Record<string, string> = {
  Arabic: '🇸🇦', French: '🇫🇷', English: '🇬🇧', Spanish: '🇪🇸', Tamazight: 'ⵣ', German: '🇩🇪',
};

const MOCK_SCHEDULE = [
  { day: 'Monday', slots: ['09:00', '14:00'] },
  { day: 'Tuesday', slots: ['09:00', '14:00'] },
  { day: 'Wednesday', slots: ['09:00'] },
  { day: 'Thursday', slots: ['09:00', '14:00'] },
  { day: 'Friday', slots: [] },
  { day: 'Saturday', slots: ['09:00', '14:00'] },
  { day: 'Sunday', slots: ['10:00'] },
];

export default function GuideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState(2);

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: colors.muted },
    heroWrap: { overflow: 'hidden' },
    hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
    heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
    heroActions: { flexDirection: 'row', gap: 10 },
    actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
    heroContent: { gap: 4, alignItems: 'center' },
    avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    avatarText: { fontSize: 28, fontFamily: 'mon-b', color: '#fff' },
    heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
    heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
    heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
    heroExp: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: colors.text, marginBottom: 12 },
    description: { fontSize: 14, fontFamily: 'mon', color: colors.muted, lineHeight: 22 },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    langPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    langFlag: { fontSize: 16 },
    langText: { fontSize: 13, fontFamily: 'mon-sb', color: colors.text },
    specCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 },
    specText: { fontSize: 14, fontFamily: 'mon-sb', color: colors.text },
    certList: { gap: 8 },
    certItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0FDFA', borderRadius: 10, padding: 12 },
    certText: { fontSize: 13, fontFamily: 'mon-sb', color: colors.text },
    statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 16, fontFamily: 'mon-b', color: colors.text },
    statLabel: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16 },
    guestLabel: { fontSize: 14, fontFamily: 'mon-sb', color: colors.text },
    guestControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    guestCount: { fontSize: 18, fontFamily: 'mon-b', color: colors.text, minWidth: 24, textAlign: 'center' },
    dayTabs: { flexDirection: 'row', gap: 6 },
    dayTab: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    dayTabActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
    dayTabText: { fontSize: 11, fontFamily: 'mon-sb', color: colors.muted },
    slotRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    noSlots: { fontSize: 13, fontFamily: 'mon', color: colors.muted },
    slotChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    slotSelected: { backgroundColor: RIHLA.accent, borderColor: RIHLA.accent },
    slotText: { fontSize: 13, fontFamily: 'mon-sb', color: colors.text },
    bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
    bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    bottomUnit: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    bookBtn: { backgroundColor: RIHLA.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
    bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  }), [colors]);

  if (!listing || listing.category !== 'guide') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <View style={styles.notFound}>
          <Ionicons name="person-outline" size={48} color={colors.muted} />
          <Text style={styles.notFoundText}>Guide not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as GuideMetadata;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#10B981', RIHLA.primary]} style={styles.hero}>
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
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{listing.title.charAt(0)}</Text>
              </View>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.heroRatingText}>{listing.rating}</Text>
                <Text style={styles.heroReviewCount}>({listing.review_count} reviews)</Text>
                <Text style={styles.heroExp}>· {m.experience_years} years experience</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.langRow}>
            {m.languages.map((lang) => (
              <View key={lang} style={styles.langPill}>
                <Text style={styles.langFlag}>{LANG_FLAGS[lang] || '🌐'}</Text>
                <Text style={styles.langText}>{lang}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specialization + certs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialization</Text>
          <View style={styles.specCard}>
            <Ionicons name="compass-outline" size={20} color={RIHLA.accent} />
            <Text style={styles.specText}>{m.specialization}</Text>
          </View>
        </View>

        {m.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certList}>
              {m.certifications.map((cert) => (
                <View key={cert} style={styles.certItem}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={RIHLA.accent} />
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Group info */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={18} color={RIHLA.accent} />
            <Text style={styles.statValue}>{m.max_group_size}</Text>
            <Text style={styles.statLabel}>Max Group</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={18} color={RIHLA.accent} />
            <Text style={styles.statValue}>{m.daily_rate_dzd.toLocaleString()}</Text>
            <Text style={styles.statLabel}>DZD/day</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name={m.group_tours ? 'people-circle-outline' : 'person-outline'} size={18} color={RIHLA.accent} />
            <Text style={styles.statValue}>{m.group_tours ? 'Group' : 'Private'}</Text>
            <Text style={styles.statLabel}>Tour Type</Text>
          </View>
        </View>

        {/* Group size picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Size</Text>
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>How many people?</Text>
            <View style={styles.guestControls}>
              <Pressable style={styles.guestBtn} onPress={() => setGroupSize(Math.max(1, groupSize - 1))}><Ionicons name="remove" size={18} color={RIHLA.primary} /></Pressable>
              <Text style={styles.guestCount}>{groupSize}</Text>
              <Pressable style={styles.guestBtn} onPress={() => setGroupSize(Math.min(m.max_group_size, groupSize + 1))}><Ionicons name="add" size={18} color={RIHLA.primary} /></Pressable>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          <View style={styles.dayTabs}>
            {MOCK_SCHEDULE.map((d, i) => (
              <Pressable key={d.day} style={[styles.dayTab, selectedDay === i && styles.dayTabActive]}
                onPress={() => { setSelectedDay(i); setSelectedSlot(null); }}>
                <Text style={[styles.dayTabText, selectedDay === i && { color: '#fff' }]}>{d.day.slice(0, 3)}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.slotRow}>
            {MOCK_SCHEDULE[selectedDay].slots.length === 0 ? (
              <Text style={styles.noSlots}>No availability on this day</Text>
            ) : (
              MOCK_SCHEDULE[selectedDay].slots.map((slot) => (
                <Pressable key={slot} style={[styles.slotChip, selectedSlot === slot && styles.slotSelected]}
                  onPress={() => { setSelectedSlot(slot); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <Text style={[styles.slotText, selectedSlot === slot && { color: '#fff' }]}>{slot}</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewHeader}><Ionicons name="star" size={18} color="#FFD166" /><Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text></View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{m.daily_rate_dzd.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>per day · {groupSize} people</Text>
        </View>
        <Pressable style={[styles.bookBtn, !selectedSlot && { opacity: 0.5 }]}
          onPress={() => { if (!selectedSlot) { showToast('Select a time slot', 'info'); return; } hapticSuccess(); router.push(`/checkout/${listing.id}?price=${m.daily_rate_dzd}` as any); }}>
          <Text style={styles.bookBtnText}>Book Guide</Text>
        </Pressable>
      </View>
    </View>
  );
}
