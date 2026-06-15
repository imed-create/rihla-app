/**
 * RIHLA — Unified Listing Detail Dispatcher
 * -----------------------------------------
 * Single dynamic route that fetches a listing by ID and renders
 * a unified layout with the AdaptiveDetailShell for category-specific UI.
 */

import React, { useMemo } from 'react';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { getListingUIConfig } from '@/types/listing';
import type { Listing } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import { getListingGallery } from '@/utils/listingPhotos';
import AdaptiveDetailShell from '@/components/shells/AdaptiveDetailShell';

export default function ListingDetailScreen() {
  const { category, id } = useLocalSearchParams<{ category: string; id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { colors, isDark } = useTheme();

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');

  const gallery = useMemo(
    () => listing ? getListingGallery(listing.cover_image_url ?? '', listing.category, 6) : [],
    [listing],
  );

  if (!listing) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable style={[styles.backCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.icon} />
        </Pressable>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Listing not found</Text>
          <Pressable onPress={() => safeGoBack()}>
            <Text style={[styles.notFoundLink, { color: RIHLA.accent }]}>← Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const catDef = getCategoryDef(listing.category);
  const uiConfig = getListingUIConfig(listing.category);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* ── HERO PHOTO CAROUSEL ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <PhotoCarousel
            photos={gallery}
            height={360}
            showCount={true}
          />
          <View style={[styles.heroNav, { top: topPad + 12 }]}>
            <Pressable style={styles.navCircle} onPress={() => safeGoBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.navRight}>
              <Pressable style={styles.navCircle} onPress={() => {
                hapticLight();
                toggleFavorite(listing.id);
              }}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
              </Pressable>
            </View>
          </View>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGradient}>
            <View style={styles.heroOverlay}>
              <View style={[styles.catBadge, { backgroundColor: catDef.color }]}>
                <Ionicons name={catDef.icon as any} size={12} color="#fff" />
                <Text style={styles.catBadgeText}>{catDef.label}</Text>
              </View>
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

        {/* ── PRICE BAR ── */}
        <View style={[styles.priceBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.priceValue, { color: RIHLA.accent }]}>{listing.price_dzd.toLocaleString()} DA</Text>
            <Text style={[styles.priceUnit, { color: colors.muted }]}>{getPriceUnit(listing.category)}</Text>
          </View>
          <View style={styles.priceBadges}>
            {listing.is_featured && (
              <View style={styles.featPill}>
                <Ionicons name="star" size={11} color="#f4a261" />
                <Text style={[styles.featText, { color: '#f4a261' }]}>Featured</Text>
              </View>
            )}
            {listing.is_vip && (
              <View style={[styles.featPill, { backgroundColor: 'rgba(244,162,97,0.1)' }]}>
                <Text style={[styles.featText, { color: '#f4a261' }]}>VIP</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── DESCRIPTION ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.description, { color: colors.muted }]}>{listing.description}</Text>
        </View>

        {/* ── CATEGORY-SPECIFIC SHELL ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
          <AdaptiveDetailShell listing={listing} />
        </View>

        {/* ── TAGS ── */}
        {listing.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.tagRow}>
              {listing.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: RIHLA.accent + '08', borderColor: RIHLA.accent + '15' }]}>
                  <Text style={[styles.tagText, { color: RIHLA.accent }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── STICKY BOTTOM BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.bottomInfo}>
          <Text style={[styles.bottomPrice, { color: RIHLA.accent }]}>{listing.price_dzd.toLocaleString()} DA</Text>
          <Text style={[styles.bottomUnit, { color: colors.muted }]}>{getPriceUnit(listing.category)}</Text>
        </View>
        <Pressable
          style={[styles.bookBtn, { backgroundColor: RIHLA.accent, shadowColor: RIHLA.accent }]}
          onPress={() => {
            hapticSuccess();
            router.push(`/checkout/${listing.id}?price=${listing.price_dzd}` as any);
          }}
        >
          <Text style={styles.bookBtnText}>{uiConfig.primary_action_label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getPriceUnit(category: string): string {
  const units: Record<string, string> = {
    hotel: '/night', restaurant: '/meal', beach: '/spot', rental: '/night',
    activity: '/person', event: '/ticket', guide: '/day', photographer: '/session',
    driver: '/trip', experience: '/person',
  };
  return units[category] ?? '';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb' },
  notFoundLink: { fontSize: 14, fontFamily: 'mon-sb', marginTop: 8 },
  backCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },

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
  heroOverlay: { paddingHorizontal: 20, paddingBottom: 14, gap: 3 },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    alignSelf: 'flex-start',
  },
  catBadgeText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
  heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocation: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: RIHLA.primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5,
  },
  ratingBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

  priceBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  priceValue: { fontSize: 22, fontFamily: 'mon-b' },
  priceUnit: { fontSize: 13, fontFamily: 'mon' },
  priceBadges: { flexDirection: 'row', gap: 6 },
  featPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(244,162,97,0.1)',
  },
  featText: { fontSize: 11, fontFamily: 'mon-b' },

  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 17, fontFamily: 'mon-b', marginBottom: 10 },
  description: { fontSize: 14, fontFamily: 'mon', lineHeight: 22 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1,
  },
  tagText: { fontSize: 12, fontFamily: 'mon-sb' },

  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  bottomInfo: {},
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b' },
  bottomUnit: { fontSize: 12, fontFamily: 'mon' },
  bookBtn: {
    paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14,
    shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
