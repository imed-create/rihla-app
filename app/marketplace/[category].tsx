/**
 * RIHLA — Universal Marketplace Category Screen
 * ----------------------------------------------
 * Adapts to all 10 marketplace verticals.
 * Shows category header, search, filters, sort, and listing cards.
 *
 * Route: /marketplace/[category]
 *   e.g. /marketplace/hotel, /marketplace/restaurant, /marketplace/beach
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { getCategoryDef, MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import type { MarketplaceCategory, Listing } from '@/types/service';
import { getListingWilayas } from '@/constants/mockListings';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';
import { useTheme } from '@/context/ThemeContext';
import EmptyState from '@/components/shared/EmptyState';

// ── CUSTOM TRAVELER PORTALS ──
import HotelPortal from '@/components/traveler/dashboards/HotelPortal';
import RestaurantPortal from '@/components/traveler/dashboards/RestaurantPortal';
import BeachPortal from '@/components/traveler/dashboards/BeachPortal';
import RentalPortal from '@/components/traveler/dashboards/RentalPortal';
import ActivityPortal from '@/components/traveler/dashboards/ActivityPortal';
import EventPortal from '@/components/traveler/dashboards/EventPortal';
import GuidePortal from '@/components/traveler/dashboards/GuidePortal';
import PhotographerPortal from '@/components/traveler/dashboards/PhotographerPortal';
import DriverPortal from '@/components/traveler/dashboards/DriverPortal';
import ExperiencePortal from '@/components/traveler/dashboards/ExperiencePortal';


// ── Sort options ──
type SortKey = 'recommended' | 'price_low' | 'price_high' | 'rating';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_low', label: 'Price ↑' },
  { key: 'price_high', label: 'Price ↓' },
  { key: 'rating', label: 'Top Rated' },
];

const WILAYAS = getListingWilayas();

// ── Category-specific filter chips ──
const CATEGORY_FILTERS: Record<MarketplaceCategory, string[]> = {
  hotel: ['Pool', 'Spa', 'Restaurant', 'Parking', 'WiFi', 'Breakfast'],
  restaurant: ['Traditional', 'Seafood', 'Pizza', 'Café', 'Delivery', 'Reservations'],
  beach: ['Family', 'VIP', 'Umbrella', 'Lifeguard', 'Food', 'Parking'],
  rental: ['Pool', 'WiFi', 'AC', 'Kitchen', 'Sea View', 'Monthly'],
  activity: ['Easy', 'Moderate', 'Challenging', 'Equipment Included', 'Group', 'Private'],
  event: ['Music', 'Sports', 'Cultural', 'Food Festival', 'Free Entry', 'VIP'],
  guide: ['Arabic', 'French', 'English', 'Historical', 'Adventure', 'Group'],
  photographer: ['Portrait', 'Landscape', 'Drone', 'Wedding', 'Travel', 'Event'],
  driver: ['Airport', 'City Tour', 'Multi-day', 'Luxury', 'SUV', 'Van'],
  experience: ['1 Day', '2-3 Days', '4+ Days', 'Easy', 'Moderate', 'Challenging'],
};

function getDetailRoute(item: Listing): string {
  switch (item.category) {
    case 'hotel': return `/services/hotel/${item.id}`;
    case 'restaurant': return `/services/restaurant/${item.id}`;
    case 'beach': return `/services/beach/${item.id}`;
    case 'rental': return `/services/rental/${item.id}`;
    case 'event': return `/services/event/${item.id}`;
    case 'guide': return `/services/guide/${item.id}`;
    case 'photographer': return `/services/photographer/${item.id}`;
    case 'experience': return `/services/experience/${item.id}`;
    case 'activity': return `/services/coming-soon?name=Activity`;
    case 'driver': return `/services/coming-soon?name=Driver`;
    default: return `/services/coming-soon?name=${encodeURIComponent(item.category)}`;
  }
}

export default function MarketplaceCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const isWide = Platform.OS === 'web' && width >= 900;

  const catKey = (category ?? 'hotel') as MarketplaceCategory;
  const catDef = getCategoryDef(catKey);
  const categoryFilters = CATEGORY_FILTERS[catKey] ?? [];

  // ── Filter State ──
  const [query, setQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortKey>('recommended');
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchList, setShowSearchList] = useState(false);

  const hasActiveFilters = selectedWilaya || familyFriendly || isVip || minRating > 0 || activeFilters.length > 0;

  const resetAll = useCallback(() => {
    hapticLight();
    setQuery('');
    setSelectedWilaya(null);
    setSelectedSort('recommended');
    setFamilyFriendly(false);
    setIsVip(false);
    setMinRating(0);
    setActiveFilters([]);
  }, []);

  const toggleFilter = useCallback((f: string) => {
    hapticLight();
    setActiveFilters((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }, []);

  // ── Filter Engine ──
  const results = useMemo(() => {
    let list = MOCK_LISTINGS.filter((l) => l.is_active && l.category === catKey);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.tags.some((t) => t.includes(q)),
      );
    }

    if (selectedWilaya) list = list.filter((l) => l.wilaya === selectedWilaya);
    if (familyFriendly) list = list.filter((l) => l.family_friendly);
    if (isVip) list = list.filter((l) => l.is_vip);
    if (minRating > 0) list = list.filter((l) => l.rating >= minRating);

    // Tag-based filters
    if (activeFilters.length > 0) {
      list = list.filter((l) => activeFilters.some((f) => l.tags.some((t) => t.toLowerCase().includes(f.toLowerCase()))));
    }

    switch (selectedSort) {
      case 'price_low': list.sort((a, b) => a.price_dzd - b.price_dzd); break;
      case 'price_high': list.sort((a, b) => b.price_dzd - a.price_dzd); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating);
    }

    return list;
  }, [catKey, query, selectedWilaya, familyFriendly, isVip, minRating, activeFilters, selectedSort]);

  // ── Listing Card ──
  const renderListingCard = useCallback(({ item }: { item: Listing }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, isWide && { width: '48%' }]}
      onPress={() => router.push(getDetailRoute(item) as any)}
    >
      <View style={[styles.cardImage, { backgroundColor: catDef.color + '15' }]}>
        {item.cover_image_url ? (
          <Image
            source={{ uri: item.cover_image_url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name={catDef.icon as any} size={32} color={catDef.color} />
        )}
        {item.is_featured && (
          <View style={styles.featBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.featBadgeText}>Featured</Text>
          </View>
        )}
        {item.is_vip && (
          <View style={styles.vipBadge}>
            <Text style={styles.vipBadgeText}>VIP</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.cardRating}>
            <Ionicons name="star" size={13} color="#FFD166" />
            <Text style={[styles.cardRatingText, { color: colors.text }]}>{item.rating}</Text>
            <Text style={[styles.cardReviewCount, { color: colors.muted }]}>({item.review_count})</Text>
          </View>
          <Text style={styles.cardPrice}>{item.price_dzd.toLocaleString()} DZD</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardLocation}>
            <Ionicons name="location-outline" size={12} color={colors.muted} />
            <Text style={[styles.cardLocationText, { color: colors.muted }]}>{item.wilaya}</Text>
          </View>
          <View style={styles.cardTags}>
            {item.tags.slice(0, 2).map((t) => (
              <View key={t} style={[styles.miniTag, { backgroundColor: colors.bg }]}>
                <Text style={[styles.miniTagText, { color: colors.muted }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
  ), [isWide, catDef]);

  const renderPortal = () => {
    const handleSearchAll = () => setShowSearchList(true);
    switch (catKey) {
      case 'hotel':
        return <HotelPortal onSearchAll={handleSearchAll} onFilterWilaya={setSelectedWilaya} selectedWilaya={selectedWilaya} />;
      case 'restaurant':
        return <RestaurantPortal onSearchAll={handleSearchAll} />;
      case 'beach':
        return <BeachPortal onSearchAll={handleSearchAll} />;
      case 'rental':
        return <RentalPortal onSearchAll={handleSearchAll} />;
      case 'activity':
        return <ActivityPortal onSearchAll={handleSearchAll} />;
      case 'event':
        return <EventPortal onSearchAll={handleSearchAll} />;
      case 'guide':
        return <GuidePortal onSearchAll={handleSearchAll} />;
      case 'photographer':
        return <PhotographerPortal onSearchAll={handleSearchAll} />;
      case 'driver':
        return <DriverPortal onSearchAll={handleSearchAll} />;
      case 'experience':
        return <ExperiencePortal onSearchAll={handleSearchAll} />;
      default:
        return <HotelPortal onSearchAll={handleSearchAll} onFilterWilaya={setSelectedWilaya} selectedWilaya={selectedWilaya} />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: catDef.color }]}>
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name={catDef.icon as any} size={20} color="#fff" />
          <Text style={styles.headerTitle}>{catDef.labelPlural}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => {
              hapticLight();
              if (showSearchList) {
                setShowFilters(!showFilters);
              } else {
                setShowSearchList(true);
              }
            }}
            style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          >
            <Ionicons name={showSearchList ? "options-outline" : "search"} size={18} color="#fff" />
          </Pressable>
          {showSearchList ? (
            <Pressable
              onPress={() => {
                hapticLight();
                setShowSearchList(false);
                setShowFilters(false);
              }}
              style={styles.filterToggle}
            >
              <Ionicons name="grid-outline" size={18} color="#fff" />
            </Pressable>
          ) : null}
          {hasActiveFilters && showSearchList && (
            <Pressable onPress={resetAll} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          )}
        </View>
      </View>

      {!showSearchList ? (
        renderPortal()
      ) : (
        <>
          {/* ── SEARCH BAR ── */}
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              placeholder={`Search ${catDef.labelPlural.toLowerCase()}...`}
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.text }]}
              value={query}
              onChangeText={setQuery}
            />
            {query !== '' && (
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </Pressable>
            )}
          </View>

          {/* ── WILAYA CHIPS ── */}
          <View style={{ height: 48 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All', ...WILAYAS]}
              keyExtractor={(w) => w}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item: w }) => (
                <Pressable
                  style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, (selectedWilaya === w || (w === 'All' && !selectedWilaya)) && styles.chipActive]}
                  onPress={() => { hapticLight(); setSelectedWilaya(w === 'All' ? null : w); }}
                >
                  <Text style={[styles.chipText, { color: colors.muted }, (selectedWilaya === w || (w === 'All' && !selectedWilaya)) && styles.chipTextActive]}>
                    {w}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {/* ── EXPANDABLE FILTERS ── */}
          {showFilters && (
            <View style={styles.filterPanel}>
              {/* Category-specific tag filters */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagChipRow}>
                {categoryFilters.map((f) => (
                  <Pressable
                    key={f}
                    style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.border }, activeFilters.includes(f) && { backgroundColor: catDef.color, borderColor: catDef.color }]}
                    onPress={() => toggleFilter(f)}
                  >
                    <Text style={[styles.tagChipText, { color: colors.muted }, activeFilters.includes(f) && { color: '#fff' }]}>{f}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Sort */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {SORT_OPTIONS.map((s) => (
                  <Pressable
                    key={s.key}
                    style={[styles.sortChip, { backgroundColor: colors.bg }, selectedSort === s.key && [styles.sortChipActive, { backgroundColor: colors.text }]]}
                    onPress={() => { hapticLight(); setSelectedSort(s.key); }}
                  >
                    <Text style={[styles.sortText, { color: colors.muted }, selectedSort === s.key && styles.sortTextActive]}>{s.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Toggles */}
              <View style={styles.toggleRow}>
                <Pressable style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }, familyFriendly && styles.toggleActive]} onPress={() => { hapticLight(); setFamilyFriendly(!familyFriendly); }}>
                  <Text style={[styles.toggleText, { color: colors.muted }, familyFriendly && styles.toggleTextActive]}>👨‍👩‍👧 Family</Text>
                </Pressable>
                <Pressable style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }, isVip && styles.toggleActive]} onPress={() => { hapticLight(); setIsVip(!isVip); }}>
                  <Text style={[styles.toggleText, { color: colors.muted }, isVip && styles.toggleTextActive]}>⭐ VIP</Text>
                </Pressable>
                <Pressable style={[styles.toggle, { backgroundColor: colors.card, borderColor: colors.border }, minRating >= 4.5 && styles.toggleActive]} onPress={() => { hapticLight(); setMinRating(minRating >= 4.5 ? 0 : 4.5); }}>
                  <Text style={[styles.toggleText, { color: colors.muted }, minRating >= 4.5 && styles.toggleTextActive]}>🏆 4.5+</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ── RESULTS HEADER ── */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.muted }]}>{results.length} listing{results.length !== 1 ? 's' : ''}</Text>
            {hasActiveFilters && (
              <Pressable onPress={resetAll}>
                <Text style={styles.clearAll}>Clear filters</Text>
              </Pressable>
            )}
          </View>

          {/* ── LISTINGS ── */}
          <FlatList
            data={results}
            keyExtractor={(l) => l.id}
            numColumns={isWide ? 2 : 1}
            key={isWide ? 'wide' : 'narrow'}
            columnWrapperStyle={isWide ? { gap: 16 } : undefined}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100, maxWidth: 1180, alignSelf: 'center', width: '100%' }]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon={catDef.icon as any}
                  title={`No ${catDef.labelPlural.toLowerCase()} found`}
                  subtitle="Try adjusting your filters or search query"
                />
              </View>
            }
            renderItem={renderListingCard}
          />
        </>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.white },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  filterToggleActive: { backgroundColor: 'rgba(255,255,255,0.35)' },
  resetBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  resetText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.white },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 12, marginBottom: 8,
    borderRadius: 999, paddingHorizontal: 16, height: 48,
    borderWidth: 1, borderColor: RIHLA.border,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'mon' },

  // Chips
  chipRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: RIHLA.border,
  },
  chipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  chipTextActive: { color: '#fff' },

  // Filter panel
  filterPanel: { paddingBottom: 8, gap: 6 },
  tagChipRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 4 },
  tagChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: RIHLA.border,
  },
  tagChipText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.mutedText },

  // Sort
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  sortChipActive: { backgroundColor: RIHLA.dark },
  sortText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  sortTextActive: { color: '#fff' },

  // Toggles
  toggleRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  toggle: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: RIHLA.border,
  },
  toggleActive: { backgroundColor: RIHLA.primary + '12', borderColor: RIHLA.primary },
  toggleText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  toggleTextActive: { color: RIHLA.primary },

  // Results
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 8 },
  resultsCount: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  clearAll: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

  // List
  list: { paddingHorizontal: 20, gap: 12 },

  // Card
  card: {
    borderRadius: 16, borderWidth: 1, borderColor: RIHLA.border,
    overflow: 'hidden', marginBottom: 4,
  },
  cardImage: { height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  featBadge: {
    position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#fff' },
  vipBadge: {
    position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    backgroundColor: RIHLA.highlight,
  },
  vipBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#fff' },
  cardInfo: { padding: 14, gap: 4 },
  cardTitle: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  cardDesc: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, lineHeight: 16 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardRatingText: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },
  cardReviewCount: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  cardPrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardLocation: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardLocationText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  cardTags: { flexDirection: 'row', gap: 4 },
  miniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: RIHLA.muted },
  miniTagText: { fontSize: 9, fontFamily: 'mon-sb', color: RIHLA.mutedText },

  // Empty
  emptyWrap: { paddingVertical: 40 },
});
