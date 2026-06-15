/**
 * RIHLA — Photographer Detail Screen
 * Portfolio, packages, turnaround, drone, booking
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { PhotographerMetadata } from '@/types/service';
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import { getListingGallery } from '@/utils/listingPhotos';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';

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
  const { colors } = useTheme();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: colors.muted },
    heroWrap: { position: 'relative' },
    heroNav: { position: 'absolute', left: 16, right: 16, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
    navCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    heroActions: { flexDirection: 'row', gap: 8 },
    heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, justifyContent: 'flex-end' },
    heroOverlay: { paddingHorizontal: 20, paddingBottom: 14, gap: 3 },
    heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
    heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroLocation: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    ratingBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
    heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
    section: { paddingHorizontal: 20, paddingTop: 20 },
    sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: colors.text, marginBottom: 12 },
    description: { fontSize: 14, fontFamily: 'mon', color: colors.muted, lineHeight: 22 },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: RIHLA.primary + '10', borderWidth: 1, borderColor: RIHLA.primary + '20' },
    tagText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.primary },
    portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    portfolioItem: { width: '47%', height: 120, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6 },
    portfolioLabel: { fontSize: 12, fontFamily: 'mon-sb' },
    statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
    statItem: { flex: 1, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    statLabel: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    pkgList: { gap: 10 },
    pkgCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, padding: 16, position: 'relative' },
    pkgSelected: { borderColor: RIHLA.accent, backgroundColor: colors.card },
    pkgTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    pkgName: { fontSize: 16, fontFamily: 'mon-b', color: colors.text },
    pkgDesc: { fontSize: 12, fontFamily: 'mon', color: colors.muted, marginTop: 2 },
    pkgPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    pkgDeliverables: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    pkgDeliverText: { fontSize: 12, fontFamily: 'mon', color: colors.muted },
    pkgCheck: { position: 'absolute', top: 14, right: 14 },
    bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
    bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    bottomUnit: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    bookBtn: { backgroundColor: RIHLA.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
    bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  }), [colors]);

  if (!listing || listing.category !== 'photographer') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <View style={styles.notFound}>
          <Ionicons name="camera-outline" size={48} color={colors.muted} />
          <Text style={styles.notFoundText}>Photographer not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as PhotographerMetadata;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── HERO PHOTO CAROUSEL ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <PhotoCarousel
            photos={getListingGallery(listing.cover_image_url ?? '', 'photographer', 6)}
            height={360}
            showCount={true}
          />
          <View style={[styles.heroNav, { top: topPad + 12 }]}>
            <Pressable style={styles.navCircle} onPress={() => safeGoBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></Pressable>
            <View style={styles.heroActions}>
              <Pressable style={styles.navCircle}><Ionicons name="share-outline" size={20} color="#fff" /></Pressable>
              <Pressable style={styles.navCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
              </Pressable>
            </View>
          </View>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroGradient}>
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <View style={styles.heroLocationRow}>
                <Ionicons name="location" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              </View>
              <View style={styles.heroRating}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.ratingBadgeText}>{listing.rating}</Text>
                </View>
                <Text style={styles.heroReviewCount}>· {listing.review_count} reviews</Text>
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
                <Ionicons name="color-palette-outline" size={14} color={RIHLA.primary} />
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
            <Ionicons name="time-outline" size={18} color={RIHLA.accent} />
            <Text style={styles.statValue}>{m.turnaround_days} days</Text>
            <Text style={styles.statLabel}>Turnaround</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="airplane-outline" size={18} color={m.drone_available ? RIHLA.accent : colors.muted} />
            <Text style={styles.statValue}>{m.drone_available ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Drone</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={18} color={RIHLA.accent} />
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
                  <Ionicons name="checkmark-circle-outline" size={14} color={RIHLA.accent} />
                  <Text style={styles.pkgDeliverText}>{pkg.deliverables}</Text>
                </View>
                {selectedPackage === i && (
                  <View style={styles.pkgCheck}><Ionicons name="checkmark-circle" size={20} color={RIHLA.accent} /></View>
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
          onPress={() => { if (selectedPackage === null) { showToast('Select a package', 'info'); return; } hapticSuccess(); router.push(`/checkout/${listing.id}?price=${m.packages[selectedPackage].price_dzd}` as any); }}>
          <Text style={styles.bookBtnText}>Book Shoot</Text>
        </Pressable>
      </View>
    </View>
  );
}
