/**
 * RIHLA — Explore Map (Service-Adaptive)
 * ──────────────────────────────────────
 * Full-screen map with service-adaptive behavior:
 * - Category filter chips float over the map
 * - Bottom sheet changes content based on selected category
 * - Each service type shows relevant info (menu for restaurants, rooms for hotels, etc.)
 * - Tapping a listing shows a detailed card with category-specific actions
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import MapWithDirections from '@/components/shared/MapWithDirections';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';
import { useFavorites } from '@/store/useFavorites';
import { showToast } from '@/components/Toast';
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

// ── Category-specific detail components ──

function HotelSheet({ listing }: { listing: Listing }) {
  const m = listing.metadata as import('@/types/service').HotelMetadata;
  return (
    <View style={sheetStyles.detailSection}>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="bed-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Rooms</Text>
        <Text style={sheetStyles.detailValue}>{m.room_count}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="star-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Stars</Text>
        <Text style={sheetStyles.detailValue}>{'⭐'.repeat(m.star_rating)}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="time-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Check-in</Text>
        <Text style={sheetStyles.detailValue}>{m.check_in_time}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="cafe-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Breakfast</Text>
        <Text style={[sheetStyles.detailValue, m.breakfast_included && { color: '#10B981' }]}>
          {m.breakfast_included ? 'Included ✅' : 'Not included'}
        </Text>
      </View>
      {m.amenities.length > 0 && (
        <View style={sheetStyles.amenityRow}>
          {m.amenities.slice(0, 5).map((a: string) => (
            <View key={a} style={sheetStyles.amenityPill}>
              <Text style={sheetStyles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function RestaurantSheet({ listing }: { listing: Listing }) {
  const m = listing.metadata as import('@/types/service').RestaurantMetadata;
  return (
    <View style={sheetStyles.detailSection}>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="restaurant-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Cuisine</Text>
        <Text style={sheetStyles.detailValue}>{m.cuisine_types.join(', ')}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="time-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Hours</Text>
        <Text style={sheetStyles.detailValue}>{m.opening_hours}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="people-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Seating</Text>
        <Text style={sheetStyles.detailValue}>{`${m.seating_capacity} seats`}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="bicycle-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Delivery</Text>
        <Text style={sheetStyles.detailValue}>{m.delivery_available ? 'Available 🚗' : 'Dine-in only'}</Text>
      </View>
    </View>
  );
}

function BeachSheet({ listing }: { listing: Listing }) {
  const m = listing.metadata as import('@/types/service').BeachMetadata;
  return (
    <View style={sheetStyles.detailSection}>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="grid-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Grid</Text>
        <Text style={sheetStyles.detailValue}>{`${m.total_rows}×${m.total_cols}`}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="flag-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Zone</Text>
        <Text style={sheetStyles.detailValue}>{m.zone.charAt(0).toUpperCase() + m.zone.slice(1)}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="timer-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Hold</Text>
        <Text style={sheetStyles.detailValue}>{`${m.hold_duration_minutes} min`}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="pricetag-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Per spot</Text>
        <Text style={sheetStyles.detailValue}>{`${m.price_per_spot_dzd.toLocaleString()} DZD`}</Text>
      </View>
      <TouchableOpacity
        style={sheetStyles.mapZoomBtn}
        onPress={() => {
          router.push({ pathname: '/listing/beach/[id]', params: { id: listing.id } } as any);
        }}
      >
        <Ionicons name="expand-outline" size={14} color="#fff" />
        <Text style={sheetStyles.mapZoomText}>Open Beach Grid</Text>
      </TouchableOpacity>
    </View>
  );
}

function DriverSheet({ listing }: { listing: Listing }) {
  const m = listing.metadata as import('@/types/service').DriverMetadata;
  return (
    <View style={sheetStyles.detailSection}>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="car-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Vehicle</Text>
        <Text style={sheetStyles.detailValue}>{m.vehicle_name}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="pricetag-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Per km</Text>
        <Text style={sheetStyles.detailValue}>{`${m.price_per_km_dzd} DZD`}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="airplane-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Airport</Text>
        <Text style={[sheetStyles.detailValue, m.airport_transfer && { color: '#10B981' }]}>
          {m.airport_transfer ? 'Available ✅' : 'No'}
        </Text>
      </View>
    </View>
  );
}

function GenericSheet({ listing }: { listing: Listing }) {
  return (
    <View style={sheetStyles.detailSection}>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="cash-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Price</Text>
        <Text style={sheetStyles.detailValue}>{listing.price_dzd.toLocaleString()} DZD</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="star-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Rating</Text>
        <Text style={sheetStyles.detailValue}>⭐ {listing.rating}</Text>
      </View>
      <View style={sheetStyles.detailRow}>
        <Ionicons name="chatbubble-outline" size={14} color="#64748B" />
        <Text style={sheetStyles.detailLabel}>Reviews</Text>
        <Text style={sheetStyles.detailValue}>{listing.review_count}</Text>
      </View>
    </View>
  );
}

function CategorySheetContent({ listing }: { listing: Listing }) {
  switch (listing.category) {
    case 'hotel': return <HotelSheet listing={listing} />;
    case 'restaurant': return <RestaurantSheet listing={listing} />;
    case 'beach': return <BeachSheet listing={listing} />;
    case 'driver': return <DriverSheet listing={listing} />;
    default: return <GenericSheet listing={listing} />;
  }
}

// ── Category summary card (shown when no listing selected) ──

function CategorySummary({ category, count }: { category: string; count: number }) {
  const catDef = getCategoryDef(category as any);
  return (
    <View style={sheetStyles.summaryCard}>
      <View style={[sheetStyles.summaryIcon, { backgroundColor: catDef.color + '15' }]}>
        <Ionicons name={catDef.icon as any} size={16} color={catDef.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sheetStyles.summaryTitle}>{catDef.labelPlural}</Text>
        <Text style={sheetStyles.summarySub}>{count} listing{count !== 1 ? 's' : ''} nearby</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </View>
  );
}

// ── Service-specific action labels (module-level to avoid recreation) ──

function getActionLabel(listing: Listing): string {
  switch (listing.category) {
    case 'driver': return 'Request Ride';
    case 'restaurant': return 'Order or Reserve';
    case 'beach': return 'Select Spot';
    case 'hotel': return 'Book Room';
    case 'guide': return 'Book Guide';
    case 'photographer': return 'Book Session';
    case 'activity': return 'Book Activity';
    case 'event': return 'Get Tickets';
    case 'experience': return 'Book Trip';
    case 'rental': return 'View Property';
    default: return 'Book Now';
  }
}

function getActionIcon(listing: Listing): string {
  switch (listing.category) {
    case 'driver': return 'car';
    case 'restaurant': return 'restaurant';
    case 'beach': return 'umbrella';
    case 'hotel': return 'bed';
    default: return 'cart';
  }
}

// ── Main Screen ──

export default function ExploreMapScreen() {
  const { setDestinationLocation } = useLocationStore();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  const filteredListings = useMemo(() => {
    if (selectedCategory === 'all') return getAllListings();
    return getListingsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Count per category for summary
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MARKETPLACE_CATEGORIES.forEach((cat) => {
      counts[cat.key] = MOCK_LISTINGS.filter((l) => l.is_active && l.category === cat.key).length;
    });
    return counts;
  }, []);

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
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

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

      {/* ── Floating category chips ── */}
      <View style={styles.chipOverlay}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => { setSelectedCategory('all'); setActiveListing(null); }}
            style={[
              styles.chip,
              selectedCategory === 'all' ? styles.chipActive : styles.chipInactive,
            ]}
          >
            <Ionicons name="apps-outline" size={14} color={selectedCategory === 'all' ? '#FFFFFF' : '#64748B'} />
            <Text style={[
              styles.chipLabel,
              selectedCategory === 'all' ? styles.chipLabelActive : styles.chipLabelInactive,
            ]}>
              All ({MOCK_LISTINGS.filter(l => l.is_active).length})
            </Text>
          </TouchableOpacity>

          {MARKETPLACE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const count = categoryCounts[cat.key] || 0;
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.8}
                onPress={() => { setSelectedCategory(cat.key); setActiveListing(null); }}
                style={[
                  styles.chip,
                  isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : styles.chipInactive,
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={isSelected ? '#FFFFFF' : cat.color}
                />
                <Text style={[
                  styles.chipLabel,
                  isSelected ? styles.chipLabelActive : styles.chipLabelInactive,
                ]}>
                  {cat.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Service-adaptive bottom sheet ── */}
      <Animated.View
        style={[
          styles.sheet,
          { opacity: sheetAnim, transform: [{ translateY: sheetTranslate }] },
        ]}
      >
        <ScrollView
          style={styles.sheetScroll}
          showsVerticalScrollIndicator={false}
        >
          {activeListing ? (
            <>
              {/* Header row */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetBadgeRow}>
                  <View style={[styles.sheetBadge, { backgroundColor: catColor + '15' }]}>
                    <Ionicons name={catDef?.icon as any} size={12} color={catColor} />
                    <Text style={[styles.sheetBadgeText, { color: catColor }]}>
                      {catDef?.label || activeListing.category}
                    </Text>
                  </View>
                  {activeListing.is_vip && (
                    <View style={styles.vipBadge}>
                      <Ionicons name="diamond" size={10} color="#D97706" />
                      <Text style={styles.vipBadgeText}>VIP</Text>
                    </View>
                  )}
                  {activeListing.is_featured && (
                    <View style={styles.featBadge}>
                      <Ionicons name="star" size={10} color="#FFFFFF" />
                      <Text style={styles.featBadgeText}>Featured</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.sheetClose} onPress={hideSheet}>
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.sheetName}>{activeListing.title}</Text>
              <Text style={styles.sheetRegion}>
                📍 {activeListing.wilaya}, Algeria
              </Text>
              <Text style={styles.sheetDesc} numberOfLines={2}>
                {activeListing.description}
              </Text>

              {/* Price + Rating row */}
              <View style={styles.priceRatingRow}>
                <View style={styles.priceBlock}>
                  <Text style={styles.priceValue}>{activeListing.price_dzd.toLocaleString()} DZD</Text>
                  <Text style={styles.priceUnit}>per {activeListing.category === 'hotel' ? 'night' : activeListing.category === 'restaurant' ? 'meal' : 'person'}</Text>
                </View>
                <View style={styles.ratingBlock}>
                  <Ionicons name="star" size={16} color="#FFD166" />
                  <Text style={styles.ratingValue}>{activeListing.rating}</Text>
                  <Text style={styles.ratingCount}>({activeListing.review_count})</Text>
                </View>
              </View>

              {/* Category-specific detail content */}
              <CategorySheetContent listing={activeListing} />

              {/* Tags */}
              {activeListing.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {activeListing.tags.slice(0, 4).map((tag) => (
                    <View key={tag} style={[styles.tagChip, { backgroundColor: catColor + '08', borderColor: catColor + '25' }]}>
                      <Text style={[styles.tagText, { color: catColor }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Primary CTA — service-specific */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (activeListing.category === 'beach') {
                    router.push({ pathname: '/listing/beach/[id]', params: { id: activeListing.id } } as any);
                  } else if (activeListing.category === 'driver') {
                    router.push({ pathname: '/services/find-providers', params: { category: 'driver', lat: String(activeListing.coordinates.latitude), lng: String(activeListing.coordinates.longitude), name: activeListing.title } } as any);
                  } else {
                    router.push(`/listing/${activeListing.id}` as any);
                  }
                }}
                style={[styles.ctaBtn, { backgroundColor: catColor }]}
              >
                <Ionicons name={getActionIcon(activeListing) as any} size={16} color="#FFFFFF" />
                <Text style={styles.ctaText}>
                  {getActionLabel(activeListing)} — {activeListing.price_dzd.toLocaleString()} DZD
                </Text>
              </TouchableOpacity>

              {/* Secondary CTA — Find nearby services */}
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
                style={styles.secondaryBtn}
              >
                <Ionicons name="navigate-outline" size={16} color={RIHLA.primary} />
                <Text style={styles.secondaryText}>Find Nearby Services</Text>
                <Ionicons name="chevron-forward" size={14} color={RIHLA.primary} />
              </TouchableOpacity>

              {/* Share + Save row */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const wasSaved = favoriteIds.includes(activeListing.id);
                    toggleFavorite(activeListing.id);
                    showToast(
                      wasSaved ? 'Removed from saved' : 'Saved to favorites!',
                      'success'
                    );
                  }}
                >
                  <Ionicons
                    name={favoriteIds.includes(activeListing.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={favoriteIds.includes(activeListing.id) ? '#FF499E' : '#64748B'}
                  />
                  <Text style={[styles.actionText, favoriteIds.includes(activeListing.id) && { color: '#FF499E' }]}>
                    {favoriteIds.includes(activeListing.id) ? 'Saved' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={async () => {
                    try {
                      await Share.share({
                        message: `Check out ${activeListing.title} on RIHLA! ${activeListing.price_dzd.toLocaleString()} DZD · ${activeListing.wilaya}`,
                      });
                    } catch { /* noop */ }
                  }}
                >
                  <Ionicons name="share-outline" size={18} color="#64748B" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    showToast('Report submitted. Thank you.', 'success');
                  }}
                >
                  <Ionicons name="flag-outline" size={18} color="#64748B" />
                  <Text style={styles.actionText}>Report</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* No listing selected — show category summary */
            <View>
              <Text style={styles.sheetTitle}>
                {selectedCategory === 'all'
                  ? 'Explore Services'
                  : `${getCategoryDef(selectedCategory as any).labelPlural} Nearby`
                }
              </Text>
              <Text style={styles.sheetSub}>
                {selectedCategory === 'all'
                  ? 'Tap any pin on the map to see details'
                  : `${filteredListings.length} ${getCategoryDef(selectedCategory as any).labelPlural.toLowerCase()} available`
                }
              </Text>

              {/* Category summary cards when "all" is selected */}
              {selectedCategory === 'all' && (
                <View style={sheetStyles.summaryList}>
                  {MARKETPLACE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={sheetStyles.summaryTouchable}
                      onPress={() => setSelectedCategory(cat.key)}
                      activeOpacity={0.7}
                    >
                      <CategorySummary category={cat.key} count={categoryCounts[cat.key] || 0} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Top listings when a category is selected */}
              {selectedCategory !== 'all' && filteredListings.slice(0, 5).map((listing) => {
                const catD = getCategoryDef(listing.category);
                return (
                  <TouchableOpacity
                    key={listing.id}
                    style={sheetStyles.listingRow}
                    onPress={() => showSheet(listing)}
                    activeOpacity={0.7}
                  >
                    <View style={[sheetStyles.listingIcon, { backgroundColor: catD.color + '15' }]}>
                      <Ionicons name={catD.icon as any} size={18} color={catD.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={sheetStyles.listingName} numberOfLines={1}>{listing.title}</Text>
                      <Text style={sheetStyles.listingMeta}>
                        ⭐ {listing.rating} · {listing.wilaya}
                      </Text>
                    </View>
                    <Text style={sheetStyles.listingPrice}>{listing.price_dzd.toLocaleString()} DZD</Text>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ── Sheet Styles ──
const sheetStyles = StyleSheet.create({
  // Summary
  summaryList: { gap: 6, marginTop: 12 },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, backgroundColor: '#FAFBFC', borderRadius: 12,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  summaryTouchable: { marginBottom: 4 },
  summaryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  summarySub: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },

  // Listing row
  listingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, backgroundColor: '#FAFBFC', borderRadius: 12,
    borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 6,
  },
  listingIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  listingName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  listingMeta: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginTop: 2 },
  listingPrice: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.primary, marginRight: 4 },

  // Detail sections
  detailSection: {
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6,
  },
  detailLabel: { flex: 1, fontSize: 12, fontFamily: 'mon', color: '#94A3B8' },
  detailValue: { fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A', textAlign: 'right' },
  amenityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  amenityPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  amenityText: { fontSize: 10, fontFamily: 'mon-sb', color: '#475569' },
  mapZoomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 10, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#00a896',
  },
  mapZoomText: { fontSize: 12, fontFamily: 'mon-b', color: '#FFFFFF' },
});

// ── Main Styles ──
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Chips
  chipOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 50,
    left: 0, right: 0, zIndex: 10,
  },
  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  chipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  chipInactive: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  chipLabel: { fontSize: 12, fontFamily: 'mon-sb' },
  chipLabelActive: { color: '#FFFFFF' },
  chipLabelInactive: { color: '#475569' },

  // Bottom sheet
  sheet: {
    position: 'absolute', bottom: 100, left: 16, right: 16,
    zIndex: 10, backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: '#E2E8F0',
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.15,
    shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
    maxHeight: 420,
  },
  sheetScroll: { maxHeight: 400 },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  sheetBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1, paddingRight: 32 },
  sheetBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  sheetBadgeText: { fontSize: 10, fontFamily: 'mon-sb', textTransform: 'uppercase' },
  vipBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FEF3C7',
  },
  vipBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#D97706' },
  featBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: '#0a2540',
  },
  featBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#FFFFFF' },
  sheetClose: {
    position: 'absolute', top: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  sheetTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 4 },
  sheetSub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8' },
  sheetName: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' },
  sheetRegion: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  sheetDesc: { fontSize: 13, fontFamily: 'mon', color: '#475569', marginTop: 8, lineHeight: 18 },

  // Price + Rating
  priceRatingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: '#FAFBFC', borderRadius: 10, borderWidth: 1, borderColor: '#F1F5F9',
  },
  priceBlock: {},
  priceValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
  priceUnit: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  ratingBlock: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingValue: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  ratingCount: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8' },

  // Tags
  tagsRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  tagChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 10, fontFamily: 'mon-sb' },

  // CTAs
  ctaBtn: {
    flexDirection: 'row', height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, width: '100%',
  },
  ctaText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'mon-b' },
  secondaryBtn: {
    flexDirection: 'row', height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 8, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF',
  },
  secondaryText: { color: RIHLA.primary, fontSize: 13, fontFamily: 'mon-sb' },

  // Action row
  actionRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  actionText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
});
