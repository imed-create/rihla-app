/**
 * RIHLA — Destination Hub Screen (Map-First)
 * -------------------------------------------
 * Map is the hero — shows ALL services as pins on the map.
 * Bottom sheet style listing cards below the map.
 * Tap a category filter to filter pins. Tap a pin to see details.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getDestinationById } from '@/constants/destinations';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { MARKETPLACE_CATEGORIES, getCategoryDef } from '@/constants/marketplaceCategories';
import type { MarketplaceCategory, Listing } from '@/types/service';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';
import MapWithDirections from '@/components/shared/MapWithDirections';

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
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;

  const destination = useMemo(() => getDestinationById(id ?? ''), [id]);
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');

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
        <Pressable style={styles.backBtn} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={RIHLA.dark} />
        </Pressable>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Destination not found</Text>
        </View>
      </View>
    );
  }

  const heroImage = DESTINATION_IMAGES[destination.type] ?? DESTINATION_IMAGES.beach;
  const totalCount = MOCK_LISTINGS.filter(l => l.is_active && l.wilaya === destination.region).length;

  // Map markers for all listings in this destination
  const mapMarkers = listings.map((l) => ({
    id: l.id,
    latitude: l.coordinates.latitude,
    longitude: l.coordinates.longitude,
    title: l.title,
    subtitle: l.wilaya,
    category: l.category,
    rating: l.rating,
    priceDZD: l.price_dzd,
  }));

  return (
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HERO IMAGE ── */}
      <View style={[styles.heroWrap, { paddingTop: topPad }]}>
        <Image source={{ uri: heroImage }} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.heroGradient} />
        <Pressable style={[styles.backBtn, { top: topPad + 12 }]} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.heroContent}>
          <Text style={styles.heroName}>{destination.name}</Text>
          <View style={styles.heroLocationRow}>
            <Ionicons name="location" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.heroRegion}>{destination.region}, Algeria · {totalCount} listings</Text>
          </View>
        </View>
      </View>

      {/* ── CATEGORY FILTER PILLS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <Pressable
          style={[styles.filterPill, selectedCategory === 'all' && styles.filterPillActive]}
          onPress={() => { hapticLight(); setSelectedCategory('all'); }}
        >
          <Ionicons name="grid-outline" size={14} color={selectedCategory === 'all' ? '#fff' : RIHLA.mutedText} />
          <Text style={[styles.filterPillText, selectedCategory === 'all' && { color: '#fff' }]}>All</Text>
        </Pressable>
        {MARKETPLACE_CATEGORIES.map((cat) => {
          const count = MOCK_LISTINGS.filter(l => l.is_active && l.wilaya === destination.region && l.category === cat.key).length;
          const isActive = selectedCategory === cat.key;
          return (
            <Pressable
              key={cat.key}
              style={[styles.filterPill, isActive && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => { hapticLight(); setSelectedCategory(isActive ? 'all' : cat.key); }}
            >
              <Ionicons name={cat.icon as any} size={14} color={isActive ? '#fff' : cat.color} />
              <Text style={[styles.filterPillText, isActive && { color: '#fff' }]}>{cat.label}</Text>
              {count > 0 && (
                <View style={[styles.filterPillCount, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[styles.filterPillCountText, isActive && { color: 'rgba(255,255,255,0.8)' }]}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── FULL MAP (THE MAIN EVENT) ── */}
      <View style={styles.mapContainer}>
        <MapWithDirections
          markers={mapMarkers}
          showDirections={false}
          showUserLocation={true}
          autoCalculateTimes={false}
          height={320}
          initialRegion={{
            latitude: destination.lat,
            longitude: destination.lng,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
          }}
          onMarkerPress={(marker) => router.push(`/listing/${marker.id}` as any)}
        />
      </View>

      {/* ── LISTINGS BOTTOM SHEET ── */}
      <View style={styles.listingsSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {selectedCategory === 'all' ? 'All Listings' : getCategoryDef(selectedCategory).labelPlural}
          </Text>
          <Text style={styles.sheetCount}>{listings.length} available</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listingsList, { paddingBottom: insets.bottom + 20 }]}
        >
          {listings.map((item) => (
            <ListingRow key={item.id} item={item} />
          ))}
          {listings.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>No listings in this category</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ── Listing Row Card ──
function ListingRow({ item }: { item: Listing }) {
  const catDef = getCategoryDef(item.category);
  return (
    <Pressable
      style={styles.listingRow}
      onPress={() => router.push(`/listing/${item.id}` as any)}
    >
      {item.cover_image_url ? (
        <Image source={{ uri: item.cover_image_url }} style={styles.listingThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.listingThumbPlaceholder, { backgroundColor: catDef.color + '15' }]}>
          <Ionicons name={catDef.icon as any} size={22} color={catDef.color} />
        </View>
      )}
      <View style={styles.listingInfo}>
        <View style={styles.listingTopRow}>
          <View style={[styles.listingCatBadge, { backgroundColor: catDef.color + '15' }]}>
            <Ionicons name={catDef.icon as any} size={10} color={catDef.color} />
            <Text style={[styles.listingCatText, { color: catDef.color }]}>{catDef.label}</Text>
          </View>
          {item.is_featured && (
            <View style={styles.listingFeatBadge}>
              <Ionicons name="star" size={9} color="#FFD166" />
              <Text style={styles.listingFeatText}>Featured</Text>
            </View>
          )}
        </View>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.listingBottom}>
          <View style={styles.listingRating}>
            <Ionicons name="star" size={11} color="#FFD166" />
            <Text style={styles.listingRatingText}>{item.rating}</Text>
            <Text style={styles.listingReviewCount}>({item.review_count})</Text>
          </View>
          <Text style={styles.listingPrice}>{item.price_dzd.toLocaleString()} DZD</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={{ marginLeft: 4 }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },

  // Hero
  heroWrap: { position: 'relative', height: 180, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  backBtn: {
    position: 'absolute', left: 16, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  heroContent: { position: 'absolute', bottom: 12, left: 16, right: 16 },
  heroName: { fontSize: 24, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  heroRegion: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)' },

  // Filter pills
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff',
  },
  filterPillActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  filterPillText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },
  filterPillCount: { backgroundColor: '#F1F5F9', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, marginLeft: 2 },
  filterPillCountText: { fontSize: 10, fontFamily: 'mon-b', color: '#94A3B8' },

  // Map
  mapContainer: { flex: 0 },

  // Listings sheet
  listingsSheet: {
    flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    marginTop: -20, borderTopWidth: 1, borderTopColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 8,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  sheetTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  sheetCount: { fontSize: 12, fontFamily: 'mon-sb', color: '#94A3B8' },

  // Listing rows
  listingsList: { paddingHorizontal: 16, gap: 8 },
  listingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9',
    padding: 10,
  },
  listingThumb: { width: 64, height: 64, borderRadius: 10 },
  listingThumbPlaceholder: { width: 64, height: 64, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listingInfo: { flex: 1, gap: 3 },
  listingTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listingCatBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  listingCatText: { fontSize: 9, fontFamily: 'mon-b' },
  listingFeatBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, backgroundColor: '#FEF3C7' },
  listingFeatText: { fontSize: 8, fontFamily: 'mon-b', color: '#B45309' },
  listingTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  listingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listingRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  listingRatingText: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  listingReviewCount: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  listingPrice: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.primary },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, fontFamily: 'mon-sb', color: '#94A3B8' },
});
