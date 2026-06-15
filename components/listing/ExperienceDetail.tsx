/**
 * RIHLA — Experience Detail Screen
 * Multi-day itineraries with inclusions/exclusions, departure dates, booking
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { ExperienceMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

const DIFFICULTY_COLORS = { easy: '#10B981', moderate: '#F59E0B', challenging: '#EF4444' };

const MOCK_ITINERARY = [
  { day: 1, title: 'Departure & Desert Crossing', description: 'Early morning departure from Tamanrasset. Drive through the vast Tassili plateau with stops at rock formations. Arrive at desert camp by sunset.', highlights: ['Tassili rock formations', 'Desert sunset', 'Desert camp arrival'] },
  { day: 2, title: 'Hoggar Mountains Exploration', description: 'Full day exploring the Hoggar Mountains. Visit the famous Tin Hinan tomb. Lunch at a traditional Tuareg camp.', highlights: ['Hoggar Mountains', 'Tin Hinan tomb', 'Tuareg camp lunch', 'Stargazing'] },
  { day: 3, title: 'Return & Farewell', description: 'Morning camel trek at sunrise. Return to Tamanrasset by afternoon. Farewell lunch with the team.', highlights: ['Sunrise camel trek', 'Return drive', 'Farewell lunch'] },
];

export default function ExperienceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [participants, setParticipants] = useState(2);

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
    heroContent: { gap: 6 },
    pills: { flexDirection: 'row', gap: 8 },
    diffPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    diffText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff', textTransform: 'capitalize' },
    daysPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    daysText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
    heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
    heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
    heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
    statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    statLabel: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: colors.text, marginBottom: 12 },
    description: { fontSize: 14, fontFamily: 'mon', color: colors.muted, lineHeight: 22 },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateList: { gap: 8 },
    dateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, padding: 14 },
    dateSelected: { borderColor: RIHLA.accent, backgroundColor: colors.card },
    dateLeft: { flex: 1 },
    dateDay: { fontSize: 13, fontFamily: 'mon-b', color: colors.text },
    dateFull: { fontSize: 12, fontFamily: 'mon', color: colors.muted, marginTop: 2 },
    datePrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary, marginRight: 10 },
    guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16 },
    guestLabel: { fontSize: 14, fontFamily: 'mon-sb', color: colors.text },
    guestControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    guestCount: { fontSize: 18, fontFamily: 'mon-b', color: colors.text, minWidth: 24, textAlign: 'center' },
    itineraryList: { gap: 16 },
    itineraryCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 6 },
    itineraryDayBadge: { alignSelf: 'flex-start', backgroundColor: RIHLA.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
    itineraryDayText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
    itineraryTitle: { fontSize: 15, fontFamily: 'mon-b', color: colors.text, marginTop: 4 },
    itineraryDesc: { fontSize: 13, fontFamily: 'mon', color: colors.muted, lineHeight: 18 },
    highlightList: { gap: 4, marginTop: 6 },
    highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    highlightText: { fontSize: 12, fontFamily: 'mon-sb', color: colors.muted },
    checkList: { gap: 8 },
    checkItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkText: { fontSize: 13, fontFamily: 'mon-sb', color: colors.text },
    bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
    bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    bottomUnit: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    bookBtn: { backgroundColor: RIHLA.primary, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 14 },
    bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  }), [colors]);

  if (!listing || listing.category !== 'experience') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <View style={styles.notFound}>
          <Ionicons name="compass-outline" size={48} color={colors.muted} />
          <Text style={styles.notFoundText}>Experience not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as ExperienceMetadata;
  const diffColor = DIFFICULTY_COLORS[m.difficulty];
  const total = m.price_per_person_dzd * participants;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={[diffColor, RIHLA.primary]} style={styles.hero}>
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
              <View style={styles.pills}>
                <View style={[styles.diffPill, { backgroundColor: diffColor }]}><Text style={styles.diffText}>{m.difficulty.charAt(0).toUpperCase() + m.difficulty.slice(1)}</Text></View>
                <View style={styles.daysPill}><Ionicons name="calendar-outline" size={14} color="#fff" /><Text style={styles.daysText}>{m.duration_days} days</Text></View>
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

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'calendar-outline', value: `${m.duration_days} days`, label: 'Duration' },
            { icon: 'people-outline', value: `Max ${m.max_group_size}`, label: 'Group Size' },
            { icon: 'speedometer-outline', value: m.difficulty.charAt(0).toUpperCase() + m.difficulty.slice(1), label: 'Difficulty' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon as any} size={18} color={RIHLA.accent} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Departure dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Departure Dates</Text>
          <View style={styles.dateList}>
            {m.departure_dates.map((date, i) => (
              <Pressable key={i}
                style={[styles.dateCard, selectedDate === i && styles.dateSelected]}
                onPress={() => { setSelectedDate(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <View style={styles.dateLeft}>
                  <Text style={styles.dateDay}>{new Date(date).toLocaleDateString('en', { weekday: 'long' })}</Text>
                  <Text style={styles.dateFull}>{new Date(date).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                </View>
                <Text style={styles.datePrice}>{m.price_per_person_dzd.toLocaleString()} DZD</Text>
                {selectedDate === i && <Ionicons name="checkmark-circle" size={20} color={RIHLA.accent} />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>How many people?</Text>
            <View style={styles.guestControls}>
              <Pressable style={styles.guestBtn} onPress={() => setParticipants(Math.max(1, participants - 1))}><Ionicons name="remove" size={18} color={RIHLA.primary} /></Pressable>
              <Text style={styles.guestCount}>{participants}</Text>
              <Pressable style={styles.guestBtn} onPress={() => setParticipants(Math.min(m.max_group_size, participants + 1))}><Ionicons name="add" size={18} color={RIHLA.primary} /></Pressable>
            </View>
          </View>
        </View>

        {/* Day-by-day itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>
          <View style={styles.itineraryList}>
            {MOCK_ITINERARY.map((day, i) => (
              <View key={i} style={styles.itineraryCard}>
                <View style={styles.itineraryDayBadge}>
                  <Text style={styles.itineraryDayText}>Day {day.day}</Text>
                </View>
                <Text style={styles.itineraryTitle}>{day.title}</Text>
                <Text style={styles.itineraryDesc}>{day.description}</Text>
                <View style={styles.highlightList}>
                  {day.highlights.map((h, j) => (
                    <View key={j} style={styles.highlightItem}>
                      <Ionicons name="checkmark-circle-outline" size={14} color={RIHLA.accent} />
                      <Text style={styles.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Inclusions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          <View style={styles.checkList}>
            {m.inclusions.map((inc) => (
              <View key={inc} style={styles.checkItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.checkText}>{inc.charAt(0).toUpperCase() + inc.slice(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exclusions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Not Included</Text>
          <View style={styles.checkList}>
            {m.exclusions.map((exc) => (
              <View key={exc} style={styles.checkItem}>
                <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                <Text style={[styles.checkText, { color: colors.muted }]}>{exc.charAt(0).toUpperCase() + exc.slice(1)}</Text>
              </View>
            ))}
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
          <Text style={styles.bottomPrice}>{total.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>{participants} × {m.price_per_person_dzd.toLocaleString()} DZD/person</Text>
        </View>
        <Pressable style={[styles.bookBtn, selectedDate === null && { opacity: 0.5 }]}
          onPress={() => { if (selectedDate === null) { showToast('Select a departure date', 'info'); return; } hapticSuccess(); router.push(`/checkout/${listing.id}?price=${m.price_per_person_dzd}&qty=${participants}` as any); }}>
          <Text style={styles.bookBtnText}>Book Experience</Text>
        </Pressable>
      </View>
    </View>
  );
}
