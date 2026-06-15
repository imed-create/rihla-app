/**
 * RIHLA — True Master Map (Explore Screen)
 * ─────────────────────────────────────────
 * Rebuilds the exploration interface as a Map-Centric experience:
 * - Map layer with Satellite & Street style toggles.
 * - Floating top search bar with suggestion list overlays.
 * - Floating category chips showing current filter counts.
 * - Simulated moving drivers (dots) when viewing taxi categories.
 * - Map navigation helpers: Zoom In/Out, Locate User.
 * - Integrates the custom slide-up PlaceSheet drawer.
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import MapWithDirections from '@/components/shared/MapWithDirections';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';
import { useFavorites } from '@/store/useFavorites';
import PlaceSheet from '@/components/PlaceSheet';
import { showToast } from '@/components/Toast';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { MARKETPLACE_CATEGORIES, getCategoryDef } from '@/constants/marketplaceCategories';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import type { Listing } from '@/types/service';

const { height: SCREEN_H } = Dimensions.get('window');

export default function ExploreMapScreen() {
  const { colors, isDark } = useTheme();
  const {
    userLatitude,
    userLongitude,
    setUserLocation,
  } = useLocationStore();

  // Map state
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [mapZoom, setMapZoom] = useState(12);
  const [mapCenter, setMapCenter] = useState<[number, number]>([3.0588, 36.7538]);

  // Filters & selection
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'near_me' | 'open_now' | 'best_rated'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  // Animation values for PlaceSheet slide-up
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // ── 1. Simulated Driver Moving Dots ──
  const [driverOffsets, setDriverOffsets] = useState<{ lat: number; lng: number }[]>([]);

  useEffect(() => {
    // Generate initial driver offsets
    const initialOffsets = [
      { lat: 0.003, lng: 0.003 },
      { lat: -0.004, lng: 0.005 },
      { lat: 0.005, lng: -0.004 },
      { lat: -0.003, lng: -0.003 },
    ];
    setDriverOffsets(initialOffsets);

    // Drifting interval to simulate moving cabs
    const interval = setInterval(() => {
      setDriverOffsets((prev) =>
        prev.map((off) => ({
          lat: off.lat + (Math.random() - 0.5) * 0.0004,
          lng: off.lng + (Math.random() - 0.5) * 0.0004,
        }))
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const simulatedDrivers = useMemo(() => {
    const lat = userLatitude || 36.7538;
    const lng = userLongitude || 3.0588;
    return driverOffsets.map((off, idx) => ({
      id: `driver-sim-${idx}`,
      latitude: lat + off.lat,
      longitude: lng + off.lng,
      title: `Driver ${idx + 1} — Live`,
      subtitle: `Toyota Camry 2024`,
      category: 'driver',
      rating: 4.8,
      priceDZD: 350,
    }));
  }, [userLatitude, userLongitude, driverOffsets]);

  // Set initial center once coordinates load
  useEffect(() => {
    if (userLongitude && userLatitude) {
      setMapCenter([userLongitude, userLatitude]);
    }
  }, [userLongitude, userLatitude]);

  // ── 2. Filter Listings & Drivers ──
  const filteredListings = useMemo(() => {
    let list = MOCK_LISTINGS.filter((l) => l.is_active);

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((l) => l.category === selectedCategory);
    }

    // Quick filters
    if (quickFilter === 'open_now') {
      // simulate open status (most mock listings are open)
      list = list.filter((l) => l.rating >= 4.0);
    } else if (quickFilter === 'best_rated') {
      list = list.filter((l) => l.rating >= 4.7);
    } else if (quickFilter === 'near_me') {
      // filter close locations (e.g. Algiers / Constantine region)
      if (userLatitude) {
        list = list.slice(0, 10);
      }
    }

    return list;
  }, [selectedCategory, quickFilter, userLatitude]);

  // Map markers
  const mapMarkers = useMemo(() => {
    const markers: ServiceMarker[] = filteredListings.map((l) => ({
      id: l.id,
      latitude: l.coordinates.latitude,
      longitude: l.coordinates.longitude,
      title: l.title,
      subtitle: l.wilaya,
      category: l.category,
      rating: l.rating,
      priceDZD: l.price_dzd,
    }));

    // Add simulated moving drivers if looking at driver category or "all"
    if (selectedCategory === 'driver' || selectedCategory === 'all') {
      markers.push(...simulatedDrivers);
    }

    return markers;
  }, [filteredListings, simulatedDrivers, selectedCategory]);

  // Active Category Count
  const countLabel = useMemo(() => {
    const total = mapMarkers.length;
    const catName =
      selectedCategory === 'all'
        ? 'places'
        : getCategoryDef(selectedCategory as any)?.labelPlural.toLowerCase() || 'services';
    return `${total} ${catName} nearby`;
  }, [mapMarkers, selectedCategory]);

  // Search autocomplete suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return MOCK_LISTINGS.filter(
      (l) =>
        l.is_active &&
        (l.title.toLowerCase().includes(q) ||
          l.wilaya.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [searchQuery]);

  // ── 3. Bottom Sheet Animation ──
  const showPlaceSheet = (place: Listing) => {
    setActiveListing(place);
    setMapCenter([place.coordinates.longitude, place.coordinates.latitude]);
    setMapZoom(15);
    Animated.spring(sheetAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 9,
      tension: 60,
    }).start();
  };

  const hidePlaceSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveListing(null);
    });
  };

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_H * 0.7, 0],
  });

  // ── 4. Zoom & Navigation Commands ──
  const handleZoomIn = () => {
    hapticLight();
    setMapZoom((z) => Math.min(z + 1, 19));
  };

  const handleZoomOut = () => {
    hapticLight();
    setMapZoom((z) => Math.max(z - 1, 3));
  };

  const handleLocateMe = () => {
    hapticSuccess();
    if (userLongitude && userLatitude) {
      setMapCenter([userLongitude, userLatitude]);
      setMapZoom(14);
    } else {
      showToast('Searching GPS location...', 'success');
      setUserLocation({ latitude: 36.7538, longitude: 3.0588, address: 'Algiers, Capital' });
      setMapCenter([3.0588, 36.7538]);
      setMapZoom(14);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* FULL SCREEN MAP LAYER */}
      <View style={styles.mapLayer}>
        <MapWithDirections
          showUserLocation
          markers={mapMarkers}
          onMarkerPress={(marker) => {
            // Find listing or construct simulated driver
            if (marker.id.startsWith('driver-sim-')) {
              const driverPlace: Listing = {
                id: marker.id,
                provider_id: 'driver-sim',
                title: marker.title,
                description: 'Professional transport service. Clean vehicle, highly-rated driver. Direct point-to-point transfers.',
                category: 'driver',
                price_dzd: marker.priceDZD ?? 0,
                wilaya: 'Algiers',
                region: 'Capital',
                coordinates: { latitude: marker.latitude, longitude: marker.longitude },
                metadata: {
                  kind: 'driver',
                  vehicle_type: 'sedan',
                  vehicle_name: 'Toyota Camry 2024',
                  price_per_km_dzd: 40,
                  fixed_routes: [],
                  airport_transfer: true,
                  multi_day_hire: false,
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                is_active: true,
                is_featured: false,
                is_vip: false,
                family_friendly: true,
                rating: 4.8,
                review_count: 12,
                photo_urls: [],
                tags: ['AC', 'Wifi', 'Comfort'],
              };
              showPlaceSheet(driverPlace);
            } else {
              const place = MOCK_LISTINGS.find((l) => l.id === marker.id);
              if (place) showPlaceSheet(place);
            }
          }}
          initialCenter={mapCenter}
          initialZoom={mapZoom}
          mapStyleType={mapStyle}
          darkMode={isDark}
        />
      </View>

      {/* FLOATING UI OVERLAY */}
      <View style={styles.uiOverlay} pointerEvents="box-none">
        
        {/* Search Input Card */}
        <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color={colors.text} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search in RIHLA..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSearchFocused(true);
              }}
              onFocus={() => setSearchFocused(true)}
              onSubmitEditing={() => setSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.muted} />
              </TouchableOpacity>
            )}
            <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity onPress={() => router.push('/(modals)/filter')}>
              <Ionicons name="options-outline" size={20} color={RIHLA.accent} />
            </TouchableOpacity>
          </View>

          {/* Autocomplete suggestions dropdown */}
          {searchFocused && searchSuggestions.length > 0 && (
            <View style={[styles.suggestions, { borderTopColor: colors.border }]}>
              {searchSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    hapticLight();
                    setSearchQuery(item.title);
                    setSearchFocused(false);
                    showPlaceSheet(item);
                  }}
                >
                  <Ionicons
                    name={getCategoryDef(item.category)?.icon as any || 'location-outline'}
                    size={15}
                    color={getCategoryDef(item.category)?.color || colors.muted}
                  />
                  <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
                    {item.title} ({item.wilaya})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Categories horizontal scroll chips */}
        {!searchFocused && (
          <View style={styles.chipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              <TouchableOpacity
                onPress={() => {
                  hapticLight();
                  setSelectedCategory('all');
                  hidePlaceSheet();
                }}
                style={[
                  styles.categoryChip,
                  selectedCategory === 'all'
                    ? { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons name="grid" size={14} color={selectedCategory === 'all' ? '#FFF' : colors.muted} />
                <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive, { color: selectedCategory === 'all' ? '#FFF' : colors.text }]}>
                  All
                </Text>
              </TouchableOpacity>

              {MARKETPLACE_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => {
                      hapticLight();
                      setSelectedCategory(cat.key);
                      hidePlaceSheet();
                    }}
                    style={[
                      styles.categoryChip,
                      isActive
                        ? { backgroundColor: cat.color, borderColor: cat.color }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons name={cat.icon as any} size={14} color={isActive ? '#FFF' : cat.color} />
                    <Text style={[styles.chipText, isActive && styles.chipTextActive, { color: isActive ? '#FFF' : colors.text }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quick criteria filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              {[
                { key: 'all', label: 'Recommended' },
                { key: 'near_me', label: '📍 Near Me' },
                { key: 'open_now', label: '🟢 Open Now' },
                { key: 'best_rated', label: '⭐ Best Rated' },
              ].map((filter) => {
                const isActive = quickFilter === filter.key;
                return (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => {
                      hapticLight();
                      setQuickFilter(filter.key as any);
                    }}
                    style={[
                      styles.filterChip,
                      isActive
                        ? { backgroundColor: colors.text, borderColor: colors.text }
                        : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.filterText, { color: isActive ? colors.card : colors.text }]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Map Right-Side Control panel (Zoom, Map Styles, Locate User) */}
        <View style={styles.rightControlPanel} pointerEvents="box-none">
          <View style={[styles.controlGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.controlBtn} onPress={handleZoomIn}>
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={[styles.controlDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.controlBtn} onPress={handleZoomOut}>
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.floatingCircle, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              hapticLight();
              setMapStyle((s) => (s === 'streets' ? 'satellite' : 'streets'));
              showToast(
                mapStyle === 'streets' ? 'Satellite imagery active' : 'Street maps active',
                'success'
              );
            }}
          >
            <Ionicons name={mapStyle === 'streets' ? 'earth-outline' : 'map-outline'} size={20} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingCircle, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleLocateMe}
          >
            <Ionicons name="locate" size={20} color={RIHLA.accent} />
          </TouchableOpacity>
        </View>

        {/* Floating bottom counts bar (if no PlaceSheet visible) */}
        {!activeListing && (
          <View style={[styles.bottomCountsBar, { backgroundColor: isDark ? '#121212EE' : '#FFFFFFEE', borderColor: colors.border }]}>
            <View style={styles.countsIcon}>
              <Ionicons name="compass-outline" size={14} color="#FFFFFF" />
            </View>
            <Text style={[styles.countsText, { color: colors.text }]}>{countLabel}</Text>
            <TouchableOpacity
              style={styles.countsAction}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <Text style={styles.countsActionText}>View List</Text>
              <Ionicons name="chevron-forward" size={12} color={RIHLA.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* UNIVERSAL PLACESHEET DRAWER */}
      {activeListing && (
        <Animated.View
          style={[
            styles.placeSheetContainer,
            {
              transform: [{ translateY: sheetTranslate }],
            },
          ]}
        >
          <PlaceSheet
            place={activeListing}
            onClose={hidePlaceSheet}
            onBook={() => {
              // Direct route dispatching to step 3 screens
              hidePlaceSheet();
              if (activeListing.category === 'beach') {
                router.push(`/services/beach/${activeListing.id}`);
              } else if (activeListing.category === 'hotel') {
                router.push(`/services/hotel/${activeListing.id}`);
              } else if (activeListing.category === 'restaurant') {
                router.push(`/services/restaurant/${activeListing.id}`);
              } else if (activeListing.category === 'driver') {
                router.push(`/services/ride`);
              } else if (activeListing.category === 'rental') {
                router.push(`/services/rental/${activeListing.id}`);
              } else if (activeListing.category === 'event') {
                router.push(`/services/event/${activeListing.id}`);
              } else if (activeListing.category === 'guide') {
                router.push(`/services/guide/${activeListing.id}`);
              } else if (activeListing.category === 'photographer') {
                router.push(`/services/photographer/${activeListing.id}`);
              } else if (activeListing.category === 'experience') {
                router.push(`/services/experience/${activeListing.id}`);
              } else {
                router.push(`/listing/${activeListing.id}`);
              }
            }}
            distance="2.4 km"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    justifyContent: 'space-between',
    paddingBottom: 90, // space for tab bar
  },
  searchCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 100,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'mon',
  },
  searchDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 10,
  },
  suggestions: {
    borderTopWidth: 1,
    paddingVertical: 8,
    gap: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  chipsContainer: {
    marginTop: 10,
    gap: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    height: 38,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 6,
    height: 32,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  chipTextActive: {
    color: '#FFF',
  },
  filterChip: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  rightControlPanel: {
    position: 'absolute',
    right: 16,
    bottom: 150,
    gap: 10,
    alignItems: 'center',
  },
  controlGroup: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  controlBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    height: 1,
    width: '100%',
  },
  floatingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  bottomCountsBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  countsIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: RIHLA.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countsText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  countsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  countsActionText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: RIHLA.accent,
  },
  placeSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
