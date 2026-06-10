/**
 * RIHLA — Explore Map (Dynamic Business Listings)
 * ────────────────────────────────────────────────
 * Shows 70+ marketplace listings (hotels, restaurants, guides, drivers, etc.)
 * on a map with dynamic markers. Tap a marker to see real business details
 * and navigate to the listing or find nearby providers.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useColors } from '@/hooks/useColors';
import MapWithDirections from '@/components/shared/MapWithDirections';
import ServiceProviderCard from '@/components/shared/ServiceProviderCard';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';
import {
  MOCK_LISTINGS,
  getAllListings,
  getListingsByCategory,
} from '@/constants/mockListings';
import {
  MARKETPLACE_CATEGORIES,
  getCategoryDef,
} from '@/constants/marketplaceCategories';
import type { Listing } from '@/types/service';

const { width } = Dimensions.get('window');

// Live metrics for a business listing
function getListingMetrics(listing: Listing) {
  const seed = listing.id.length;
  if (listing.category === 'hotel') {
    return [
      { label: 'Stars', value: `${listing.metadata.kind === 'hotel' ? listing.metadata.star_rating : '—'}⭐`, icon: 'star-outline' as const },
      { label: 'Rooms', value: listing.metadata.kind === 'hotel' ? `${listing.metadata.room_count}` : '—', icon: 'bed-outline' as const },
      { label: 'Rating', value: `${listing.rating}`, icon: 'heart-outline' as const },
    ];
  }
  if (listing.category === 'restaurant') {
    return [
      { label: 'Cuisine', value: listing.metadata.kind === 'restaurant' ? listing.metadata.cuisine_types[0] || '—' : '—', icon: 'restaurant-outline' as const },
      { label: 'Budget', value: `${listing.metadata.kind === 'restaurant' ? listing.metadata.avg_meal_price_dzd : listing.price_dzd} DZD`, icon: 'cash-outline' as const },
      { label: 'Rating', value: `${listing.rating}`, icon: 'heart-outline' as const },
    ];
  }
  return [
    { label: 'Price', value: `${listing.price_dzd.toLocaleString()} DZD`, icon: 'cash-outline' as const },
    { label: 'Rating', value: `${listing.rating}`, icon: 'star-outline' as const },
    { label: 'Reviews', value: `${listing.review_count}`, icon: 'chatbubble-outline' as const },
  ];
}

export default function ExploreMapScreen() {
  const colors = useColors();
  const { setDestinationLocation } = useLocationStore();
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  // Filter listings by marketplace category
  const filteredListings = useMemo(() => {
    if (selectedCategory === 'all') return getAllListings();
    return getListingsByCategory(selectedCategory);
  }, [selectedCategory]);

  const metrics = useMemo(
    () => (activeListing ? getListingMetrics(activeListing) : []),
    [activeListing]
  );

  // Convert listings to ServiceMarker format for the map
  const listingMarkers: ServiceMarker[] = useMemo(() =>
    filteredListings.map(l => ({
      id: l.id,
      latitude: l.coordinates.latitude,
      longitude: l.coordinates.longitude,
      title: l.title,
      subtitle: l.description.slice(0, 60) + '...',
      category: l.category,
      rating: l.rating,
      priceDZD: l.price_dzd,
    })),
    [filteredListings]
  );

  const showSheet = useCallback(
    (listing: Listing) => {
      setActiveListing(listing);
      setDestinationLocation({
        latitude: listing.coordinates.latitude,
        longitude: listing.coordinates.longitude,
        address: `${listing.title}, ${listing.wilaya}`,
      });
      Animated.spring(sheetAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    },
    [sheetAnim, setDestinationLocation]
  );

  const hideSheet = useCallback(() => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setActiveListing(null)
    );
  }, [sheetAnim]);

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 0],
  });

  const catDef = activeListing ? getCategoryDef(activeListing.category as any) : null;
  const catColor = catDef?.color || RIHLA.primary;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Dynamic map with business listing markers */}
      <MapWithDirections
        showDirections={false}
        showUserLocation={true}
        markers={listingMarkers}
        autoCalculateTimes={false}
        customMapStyle={undefined}
        onMarkerPress={(marker: ServiceMarker) => {
          const listing = MOCK_LISTINGS.find(l => l.id === marker.id);
          if (listing) showSheet(listing);
        }}
        initialRegion={{
          latitude: 33.5,
          longitude: 3.5,
          latitudeDelta: 13.0,
          longitudeDelta: 13.0,
        }}
      />

      {/* Marketplace category filter chips */}
      <View style={styles.categoryOverlay}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.catChip,
            selectedCategory === 'all'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
          ]}
        >
          <Text
            style={[
              styles.catLabel,
              selectedCategory === 'all' ? { color: '#FFFFFF' } : { color: '#475569' },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {MARKETPLACE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.catChip,
                isSelected
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
              ]}
            >
              <Ionicons name={cat.icon as any} size={13} color={isSelected ? '#FFFFFF' : '#475569'} />
              <Text style={[styles.catLabel, isSelected ? { color: '#FFFFFF' } : { color: '#475569' }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Business detail sheet */}
      {activeListing && (
        <Animated.View
          style={[
            styles.sheetContainer,
            { opacity: sheetAnim, transform: [{ translateY: sheetTranslate }] },
          ]}
        >
          <TouchableOpacity style={styles.closeBtn} onPress={hideSheet}>
            <Ionicons name="close" size={20} color="#64748B" />
          </TouchableOpacity>
          <ScrollView
            style={[styles.card, { borderColor: '#E2E8F0', maxHeight: 520 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: catColor + '20' }]}>
                <Ionicons name={catDef?.icon as any} size={11} color={catColor} />
                <Text style={[styles.badgeText, { color: catColor }]}>
                  {catDef?.label || activeListing.category}
                </Text>
              </View>
              {activeListing.is_vip && (
                <View style={[styles.vipBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="diamond" size={10} color="#D97706" />
                  <Text style={styles.vipText}>VIP</Text>
                </View>
              )}
              {activeListing.is_featured && (
                <View style={[styles.featuredBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="sparkles" size={10} color="#3B82F6" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.ratingText}>{activeListing.rating}</Text>
              </View>
            </View>

            <Text style={styles.name}>{activeListing.title}</Text>
            <Text style={styles.region}>
              {activeListing.wilaya} · {activeListing.region}
            </Text>
            <Text style={styles.tagline} numberOfLines={2}>
              {activeListing.description}
            </Text>

            {/* Live metrics */}
            <View style={styles.metricsRow}>
              {metrics.map((m) => (
                <View key={m.label} style={styles.metricPill}>
                  <Ionicons name={m.icon} size={14} color="#64748B" />
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
              ))}
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
              {activeListing.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: catColor + '10', borderColor: catColor + '30' }]}>
                  <Text style={[styles.tagText, { color: catColor }]}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Nearby Services - dynamic from MOCK_LISTINGS */}
            <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
              <Text style={{ fontSize: 12, fontFamily: 'mon-sb', color: '#64748B', marginBottom: 8 }}>
                Services nearby
              </Text>
              {getListingsByCategory('guide').slice(0, 2).map((guide) => (
                <ServiceProviderCard
                  key={guide.id}
                  provider={{
                    id: guide.id,
                    name: guide.title,
                    title: `Guide in ${guide.wilaya}`,
                    category: 'guide',
                    rating: guide.rating,
                    priceDZD: guide.price_dzd,
                    time: 10,
                    badge: guide.is_featured ? '⭐ Featured' : undefined,
                    isAvailable: true,
                  }}
                  onSelect={() => router.push(`/listing/${guide.id}` as any)}
                />
              ))}
            </View>

            {/* CTA buttons */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push(`/listing/${activeListing.id}` as any)}
              style={[styles.exploreBtn, { backgroundColor: catColor }]}
            >
              <Ionicons name={catDef?.icon as any} size={18} color="#FFFFFF" />
              <Text style={styles.exploreBtnText}>Book Now — {activeListing.price_dzd.toLocaleString()} DZD</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/services/find-providers',
                  params: {
                    lat: activeListing.coordinates.latitude,
                    lng: activeListing.coordinates.longitude,
                    name: activeListing.title,
                    category: activeListing.category,
                  },
                } as any)
              }
              style={styles.findBtn}
            >
              <Ionicons name="navigate-outline" size={16} color={RIHLA.primary} />
              <Text style={styles.findBtnText}>Find Nearby Services</Text>
              <Ionicons name="chevron-forward" size={14} color={RIHLA.primary} />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  categoryOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  catLabel: { fontSize: 11, fontFamily: 'mon-sb' },

  sheetContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingRight: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontFamily: 'mon-sb', textTransform: 'uppercase' },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vipText: { fontSize: 9, fontFamily: 'mon-b', color: '#D97706' },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredText: { fontSize: 9, fontFamily: 'mon-b', color: '#3B82F6' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  name: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A', marginTop: 10 },
  region: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  tagline: { fontSize: 13, fontFamily: 'mon', color: '#334155', marginTop: 8, lineHeight: 18 },

  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  metricPill: {
    flex: 1,
    minWidth: width * 0.25,
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  metricValue: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },

  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: { fontSize: 10, fontFamily: 'mon-sb' },

  exploreBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },
  exploreBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'mon-b' },
  findBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: RIHLA.border,
    backgroundColor: '#FFFFFF',
  },
  findBtnText: {
    color: RIHLA.primary,
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
});
