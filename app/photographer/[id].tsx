/**
 * RIHLA — Photographer Detail Screen
 * Portfolio, packages, turnaround, drone, booking
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getListingById } from '@/constants/mockListings';
import type { PhotographerMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

const MOCK_PORTFOLIO = [
  { id: 'p1', label: 'Sunset Portrait', color: '#F59E0B' },
  { id: 'p2', label: 'Beach Wedding', color: '#EC4899' },
  { id: 'p3', label: 'Travel Story', color: '#3B82F6' },
  { id: 'p4', label: 'Drone Aerial', color: '#10B981' },
  { id: 'p5', label: 'Event Coverage', color: '#7C3AED' },
  { id: 'p6', label: 'Family Session', color: '#EF4444' },
];

export default function PhotographerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  if (!listing || listing.category !== 'photographer') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="camera-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Photographer not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as PhotographerMetadata;

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#EC4899', SAHEL.primary]} style={styles.hero}>
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

        {/* Styles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photography Styles</Text>
          <View style={styles.tagRow}>
            {m.style.map((s) => (
              <View key={s} style={styles.tag}>
                <Ionicons name="color-palette-outline" size={14} color={SAHEL.primary} />
                <Text style={styles.tagText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </View>
            ))}
            {m.drone_available && (
              <View style={[styles.tag, { backgroundColor: '#10B98115', borderColor: '#10B98130' }]}>
                <Ionicons name="airplane-outline" size={14} color="#10B981" />
                <Text style={[styles.tagText, { color: '#10B981' }]}>Drone Available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Portfolio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.portfolioGrid}>
            {MOCK_PORTFOLIO.map((p) => (
              <View key={p.id} style={[styles.portfolioItem, { backgroundColor: p.color + '20' }]}>
                <Ionicons name="image-outline" size={28} color={p.color} />
                <Text style={[styles.portfolioLabel, { color: p.color }]}>{p.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Turnaround */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={18} color={SAHEL.accent} />
            <Text style={styles.statValue}>{m.turnaround_days} days</Text>
            <Text style={styles.statLabel}>Turnaround</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="airplane-outline" size={18} color={m.drone_available ? SAHEL.accent : '#CBD5E1'} />
            <Text style={styles.statValue}>{m.drone_available ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Drone</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={18} color={SAHEL.accent} />
            <Text style={styles.statValue}>{listing.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Packages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Packages</Text>
          <View style={styles.pkgList}>
            {m.packages.map((pkg, i) => (
              <Pressable key={i}
                style={[styles.pkgCard, selectedPackage === i && styles.pkgSelected]}
                onPress={() => { setSelectedPackage(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <View style={styles.pkgTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pkgName}>{pkg.name}</Text>
                    <Text style={styles.pkgDesc}>{pkg.description}</Text>
                  </View>
                  <Text style={styles.pkgPrice}>{pkg.price_dzd.toLocaleString()} DZD</Text>
                </View>
                <View style={styles.pkgDeliverables}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={SAHEL.accent} />
                  <Text style={styles.pkgDeliverText}>{pkg.deliverables}</Text>
                </View>
                {selectedPackage === i && (
                  <View style={styles.pkgCheck}><Ionicons name="checkmark-circle" size={20} color={SAHEL.accent} /></View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

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
          <Text style={styles.bottomPrice}>{selectedPackage !== null ? m.packages[selectedPackage].price_dzd.toLocaleString() + ' DZD' : 'Select package'}</Text>
          {selectedPackage !== null && <Text style={styles.bottomUnit}>{m.packages[selectedPackage].name}</Text>}
        </View>
        <Pressable style={[styles.bookBtn, selectedPackage === null && { opacity: 0.5 }]}
          onPress={() => { if (selectedPackage === null) { showToast('Select a package', 'info'); return; } hapticSuccess(); showToast('Booked! Photographer will confirm shortly.', 'success'); }}>
          <Text style={styles.bookBtnText}>Book Shoot</Text>
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
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 12 },
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: SAHEL.primary + '10', borderWidth: 1, borderColor: SAHEL.primary + '20' },
  tagText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.primary },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  portfolioItem: { width: '47%', height: 120, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6 },
  portfolioLabel: { fontSize: 12, fontFamily: 'mon-sb' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  pkgList: { gap: 10 },
  pkgCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: SAHEL.border, padding: 16, position: 'relative' },
  pkgSelected: { borderColor: SAHEL.accent, backgroundColor: '#F0FDFA' },
  pkgTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pkgName: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  pkgDesc: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  pkgPrice: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  pkgDeliverables: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  pkgDeliverText: { fontSize: 12, fontFamily: 'mon', color: '#475569' },
  pkgCheck: { position: 'absolute', top: 14, right: 14 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: SAHEL.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: { backgroundColor: SAHEL.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
