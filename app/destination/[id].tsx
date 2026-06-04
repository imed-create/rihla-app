/**
 * RIHLA — Destination Hub Screen
 * ---------------------------------
 * Shows a destination with category tabs (Hotels, Restaurants, Activities, etc.)
 * Each tab loads marketplace listings from that category for this destination.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getDestinationById } from '@/constants/destinations';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import type { MarketplaceCategory, Listing } from '@/types/service';
import EmptyState from '@/components/EmptyState';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';

const DESTINATION_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400',
  desert: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400',
  mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400',
  historical: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1400',
  city: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400',
};

export default function DestinationHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const isWide = Platform.OS === 'web' && width >= 900;

  const destination = useMemo(() => getDestinationById(id ?? ''), [id]);
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');

  // Get categories that have listings for this destination's wilaya
  const availableCategories = useMemo(() => {
    if (!destination) return [];
    const cats = new Set(MOCK_LISTINGS.filter((l) => l.is_active && l.wilaya === destination.region).map((l) => l.category));
    return MARKETPLACE_CATEGORIES.filter((c) => cats.has(c.key));
  }, [destination]);

  // Filter listings for this destination
  const listings = useMemo(() => {
    if (!destination) return [];
    let results = MOCK_LISTINGS.filter((l) => l.is_active && l.wilaya === destination.region);
    if (selectedCategory !== 'all') {
      results = results.filter((l) => l.category === selectedCategory);
    }
    return results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating);
  }, [destination, selectedCategory]);

  if (!destination) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={SAHEL.dark} />
        </Pressable>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Destination not found</Text>
        </View>
      </View>
    );
  }

  const renderListingCard = useCallback(({ item }: { item: Listing }) => {
    const catDef = getCategoryDef(item.category);
    return (
      <Pressable
        style={[styles.listingCard, isWide && { width: '48%' }]}
        onPress={() => router.push(`/listing/${item.id}` as any)}
      >
        <View style={[styles.listingImage, { backgroundColor: catDef.color + '15' }]}>
          <Ionicons name={catDef.icon as any} size={28} color={catDef.color} />
          <View style={[styles.listingCatBadge, { backgroundColor: catDef.color }]}>
            <Text style={styles.listingCatText}>{catDef.label}</Text>
          </View>
          {item.is_featured && (
            <View style={styles.listingFeatBadge}>
              <Ionicons name="star" size={10} color="#fff" />
              <Text style={styles.listingFeatText}>Featured</Text>
            </View>
          )}
        </View>
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.listingDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.listingBottom}>
            <View style={styles.listingRating}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={styles.listingRatingText}>{item.rating}</Text>
              <Text style={styles.listingReviewCount}>({item.review_count})</Text>
            </View>
            <Text style={styles.listingPrice}>{item.price_dzd.toLocaleString()} DZD</Text>
          </View>
        </View>
      </Pressable>
    );
  }, [isWide]);

  const ListHeader = (
    <View>
      {/* Hero Header */}
      <View style={[styles.heroWrap, { paddingTop: topPad }]}>
        <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']} style={styles.heroGradient}>
          <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{destination.name}</Text>
            <Text style={styles.heroRegion}>{destination.region}, Algeria</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.heroStatVal}>{destination.rating}</Text>
                <Text style={styles.heroStatLabel}>({destination.reviews})</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Ionicons name="navigate" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroStatVal}>{destination.distance}</Text>
              </View>
            </View>
            <Text style={styles.heroTagline}>{destination.tagline}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, selectedCategory === 'all' && styles.tabActive]}
          onPress={() => { hapticLight(); setSelectedCategory('all'); }}
        >
          <Text style={[styles.tabText, selectedCategory === 'all' && styles.tabTextActive]}>All</Text>
        </Pressable>
        {availableCategories.map((cat) => (
          <Pressable
            key={cat.key}
            style={[styles.tab, selectedCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
            onPress={() => { hapticLight(); setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key); }}
          >
            <Ionicons name={cat.icon as any} size={14} color={selectedCategory === cat.key ? '#fff' : SAHEL.mutedText} />
            <Text style={[styles.tabText, selectedCategory === cat.key && { color: '#fff' }]}>{cat.labelPlural}</Text>
          </Pressable>
        ))}
      </View>

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsCount}>{listings.length} listing{listings.length !== 1 ? 's' : ''}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        columnWrapperStyle={isWide ? { gap: 16 } : undefined}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20, maxWidth: 1180, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title={`No ${selectedCategory !== 'all' ? getCategoryDef(selectedCategory).labelPlural.toLowerCase() : 'listings'} yet`}
            subtitle={`Marketplace listings for ${destination.name} will appear here.`}
          />
        }
        renderItem={renderListingCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },

  // Hero
  heroWrap: { overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroGradient: { paddingHorizontal: 20, paddingBottom: 28, minHeight: 260, justifyContent: 'space-between' },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  heroContent: { gap: 4 },
  heroName: { fontSize: 30, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroRegion: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)' },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStatVal: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
  heroStatLabel: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  heroStatDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroTagline: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 18 },

  // Tabs
  tabsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: SAHEL.border, backgroundColor: '#fff',
  },
  tabActive: { backgroundColor: SAHEL.primary, borderColor: SAHEL.primary },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.mutedText },
  tabTextActive: { color: '#fff' },

  // Results
  resultsRow: { paddingHorizontal: 24, paddingBottom: 8 },
  resultsCount: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.mutedText },

  // Listing cards
  list: { paddingHorizontal: 20, gap: 12 },
  listingCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: SAHEL.border,
    overflow: 'hidden', marginBottom: 4,
  },
  listingImage: { height: 110, alignItems: 'center', justifyContent: 'center' },
  listingCatBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  listingCatText: { fontSize: 10, fontFamily: 'mon-b', color: '#fff' },
  listingFeatBadge: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  listingFeatText: { fontSize: 9, fontFamily: 'mon-b', color: '#fff' },
  listingInfo: { padding: 14, gap: 4 },
  listingTitle: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  listingDesc: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText, lineHeight: 16 },
  listingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  listingRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  listingRatingText: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.dark },
  listingReviewCount: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },
  listingPrice: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.primary },
});
