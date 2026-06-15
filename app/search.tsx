/**
 * RIHLA — Search Screen (Category-Specific)
 * ──────────────────────────────────────────
 * Each category has distinct sort options, quick filters,
 * and result card layouts. Adapts behavior per marketplace vertical.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { MARKETPLACE_CATEGORIES, getCategoryDef } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS, getListingWilayas } from '@/constants/mockListings';
import type { MarketplaceCategory, Listing } from '@/types/service';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';
import SearchResultCard from '@/components/search/SearchResultCard';

type SortOption = string;
type PriceRange = 'any' | 'budget' | 'mid' | 'premium' | 'luxury';
type RatingFilter = 0 | 3.5 | 4.0 | 4.5;

const PRICE_RANGES: { key: PriceRange; label: string; min: number; max: number }[] = [
  { key: 'any', label: 'Any Price', min: 0, max: 999999 },
  { key: 'budget', label: 'Budget', min: 0, max: 3000 },
  { key: 'mid', label: 'Mid-Range', min: 3000, max: 10000 },
  { key: 'premium', label: 'Premium', min: 10000, max: 25000 },
  { key: 'luxury', label: 'Luxury', min: 25000, max: 999999 },
];

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: 0, label: 'Any' },
  { value: 3.5, label: '3.5+' },
  { value: 4.0, label: '4.0+' },
  { value: 4.5, label: '4.5+' },
];

// ─── Category-Specific Sort Options ────────────────────────

const SORT_BY_CATEGORY: Partial<Record<MarketplaceCategory, { key: string; label: string; icon: string }[]>> = {
  hotel: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'star_rating', label: 'Star Rating', icon: 'star' },
    { key: 'rating', label: 'Guest Rating', icon: 'thumbs-up' },
  ],
  restaurant: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
    { key: 'review_count', label: 'Most Reviewed', icon: 'chatbubbles' },
  ],
  beach: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
    { key: 'spot_count', label: 'Most Spots', icon: 'grid' },
  ],
  rental: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'bedrooms', label: 'Most Bedrooms', icon: 'bed' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
  ],
  driver: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_per_km', label: 'Cheapest/km', icon: 'trending-down' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
    { key: 'routes', label: 'Most Routes', icon: 'route' },
  ],
  activity: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
    { key: 'duration', label: 'Shortest', icon: 'time' },
  ],
  guide: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'experience', label: 'Most Experienced', icon: 'award' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
  ],
  photographer: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
    { key: 'turnaround', label: 'Fastest Delivery', icon: 'time' },
  ],
  event: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'date', label: 'Soonest', icon: 'calendar' },
    { key: 'capacity', label: 'Largest Venue', icon: 'people' },
  ],
  experience: [
    { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
    { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
    { key: 'duration', label: 'Shortest', icon: 'time' },
    { key: 'rating', label: 'Top Rated', icon: 'star' },
  ],
};

const DEFAULT_SORT_OPTIONS = [
  { key: 'recommended', label: 'Recommended', icon: 'sparkles' },
  { key: 'price_low', label: 'Cheapest', icon: 'trending-down' },
  { key: 'price_high', label: 'Price High', icon: 'trending-up' },
  { key: 'rating', label: 'Top Rated', icon: 'star' },
];

// ─── Category-Specific Quick Filter Chips ───────────────────

type QuickFilter = { key: string; label: string; icon: string; filter: (l: Listing) => boolean };

const QUICK_FILTERS_BY_CATEGORY: Partial<Record<MarketplaceCategory, QuickFilter[]>> = {
  hotel: [
    { key: 'breakfast', label: 'Breakfast', icon: 'cafe', filter: (l) => (l.metadata as any).breakfast_included },
    { key: 'parking', label: 'Parking', icon: 'car', filter: (l) => (l.metadata as any).amenities?.includes('parking') },
    { key: 'pool', label: 'Pool', icon: 'water', filter: (l) => (l.metadata as any).amenities?.includes('pool') },
    { key: 'wifi', label: 'WiFi', icon: 'wifi', filter: (l) => (l.metadata as any).amenities?.includes('wifi') },
    { key: 'spa', label: 'Spa', icon: 'flower', filter: (l) => (l.metadata as any).amenities?.includes('spa') },
  ],
  restaurant: [
    { key: 'delivery', label: 'Delivery', icon: 'bicycle', filter: (l) => (l.metadata as any).delivery_available },
    { key: 'reservation', label: 'Reservation', icon: 'calendar', filter: (l) => (l.metadata as any).reservation_required },
    { key: 'traditional', label: 'Traditional', icon: 'restaurant', filter: (l) => (l.metadata as any).cuisine_types?.includes('traditional') },
    { key: 'seafood', label: 'Seafood', icon: 'fish', filter: (l) => (l.metadata as any).cuisine_types?.includes('seafood') },
  ],
  beach: [
    { key: 'vip', label: 'VIP', icon: 'diamond', filter: (l) => (l.metadata as any).zone === 'vip' },
    { key: 'family', label: 'Family', icon: 'people', filter: (l) => (l.metadata as any).zone === 'family' },
    { key: 'parking', label: 'Parking', icon: 'car', filter: (l) => (l.metadata as any).services?.includes('parking') },
    { key: 'food', label: 'Food', icon: 'restaurant', filter: (l) => (l.metadata as any).services?.includes('food') },
    { key: 'hold', label: 'Spot Hold', icon: 'timer', filter: (l) => (l.metadata as any).hold_enabled },
  ],
  rental: [
    { key: 'pool', label: 'Pool', icon: 'water', filter: (l) => (l.metadata as any).amenities?.includes('pool') },
    { key: 'wifi', label: 'WiFi', icon: 'wifi', filter: (l) => (l.metadata as any).amenities?.includes('wifi') },
    { key: 'kitchen', label: 'Kitchen', icon: 'restaurant', filter: (l) => (l.metadata as any).amenities?.includes('kitchen') },
    { key: 'parking', label: 'Parking', icon: 'car', filter: (l) => (l.metadata as any).amenities?.includes('parking') },
    { key: 'monthly', label: 'Monthly OK', icon: 'calendar', filter: (l) => (l.metadata as any).monthly_available },
  ],
  driver: [
    { key: 'airport', label: 'Airport', icon: 'airplane', filter: (l) => (l.metadata as any).airport_transfer },
    { key: 'multiday', label: 'Multi-Day', icon: 'briefcase', filter: (l) => (l.metadata as any).multi_day_hire },
    { key: 'luxury', label: 'Luxury', icon: 'diamond', filter: (l) => (l.metadata as any).vehicle_type === 'luxury' },
    { key: 'suv', label: 'SUV', icon: 'car', filter: (l) => (l.metadata as any).vehicle_type === 'suv' },
  ],
  activity: [
    { key: 'equipment', label: 'Equipment Incl.', icon: 'build', filter: (l) => (l.metadata as any).equipment_included },
    { key: 'walkin', label: 'Walk-in OK', icon: 'walk', filter: (l) => (l.metadata as any).walkin_allowed },
    { key: 'easy', label: 'Easy', icon: 'leaf', filter: (l) => (l.metadata as any).difficulty === 'easy' },
    { key: 'extreme', label: 'Extreme', icon: 'flash', filter: (l) => (l.metadata as any).difficulty === 'extreme' || (l.metadata as any).difficulty === 'challenging' },
  ],
  photographer: [
    { key: 'drone', label: 'Drone', icon: 'airplane', filter: (l) => (l.metadata as any).drone_available },
    { key: 'wedding', label: 'Wedding', icon: 'heart', filter: (l) => (l.metadata as any).style?.includes('wedding') },
    { key: 'fast', label: 'Fast Turnaround', icon: 'time', filter: (l) => (l.metadata as any).turnaround_days <= 3 },
  ],
  experience: [
    { key: 'easy', label: 'Easy', icon: 'leaf', filter: (l) => (l.metadata as any).difficulty === 'easy' },
    { key: 'multiday', label: 'Multi-Day', icon: 'calendar', filter: (l) => (l.metadata as any).duration_days >= 2 },
    { key: 'small_group', label: 'Small Group', icon: 'people', filter: (l) => (l.metadata as any).max_group_size <= 8 },
  ],
};

const WILAYAS = getListingWilayas();

export default function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recommended');
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRange>('any');
  const [minRating, setMinRating] = useState<RatingFilter>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const activePrice = PRICE_RANGES.find((p) => p.key === priceRange)!;

  // Category-specific sort options
  const sortOptions = selectedCategory
    ? (SORT_BY_CATEGORY[selectedCategory] ?? DEFAULT_SORT_OPTIONS)
    : DEFAULT_SORT_OPTIONS;

  // Category-specific quick filters
  const quickFilters = selectedCategory
    ? (QUICK_FILTERS_BY_CATEGORY[selectedCategory] ?? [])
    : [];

  // Reset sort when category changes to a valid option
  const handleCategoryChange = useCallback((cat: MarketplaceCategory | null) => {
    setSelectedCategory(cat);
    setSelectedSort('recommended');
    setActiveQuickFilters([]);
    // Check if current sort is valid for new category
    if (cat) {
      const valid = (SORT_BY_CATEGORY[cat] ?? DEFAULT_SORT_OPTIONS).some((s) => s.key === selectedSort);
      if (!valid) setSelectedSort('recommended');
    }
  }, [selectedSort]);

  const toggleQuickFilter = useCallback((key: string) => {
    hapticLight();
    setActiveQuickFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedWilaya) count++;
    if (familyFriendly) count++;
    if (isVip) count++;
    if (priceRange !== 'any') count++;
    if (minRating > 0) count++;
    count += activeQuickFilters.length;
    return count;
  }, [selectedCategory, selectedWilaya, familyFriendly, isVip, priceRange, minRating, activeQuickFilters]);

  const resetAll = useCallback(() => {
    hapticLight();
    setQuery('');
    setSelectedCategory(null);
    setSelectedWilaya(null);
    setSelectedSort('recommended');
    setFamilyFriendly(false);
    setIsVip(false);
    setPriceRange('any');
    setMinRating(0);
    setActiveQuickFilters([]);
  }, []);

  const removeFilter = useCallback((type: string, value?: string) => {
    hapticLight();
    switch (type) {
      case 'category': setSelectedCategory(null); break;
      case 'wilaya': setSelectedWilaya(null); break;
      case 'family': setFamilyFriendly(false); break;
      case 'vip': setIsVip(false); break;
      case 'price': setPriceRange('any'); break;
      case 'rating': setMinRating(0); break;
      case 'quick': if (value) setActiveQuickFilters((prev) => prev.filter((k) => k !== value)); break;
    }
  }, []);

  const results = useMemo(() => {
    let list = [...MOCK_LISTINGS].filter((l) => l.is_active);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.wilaya.toLowerCase().includes(q) ||
          l.tags.some((t) => t.includes(q))
      );
    }

    if (selectedCategory) list = list.filter((l) => l.category === selectedCategory);
    if (selectedWilaya) list = list.filter((l) => l.wilaya === selectedWilaya);
    if (familyFriendly) list = list.filter((l) => l.family_friendly);
    if (isVip) list = list.filter((l) => l.is_vip);
    list = list.filter((l) => l.price_dzd >= activePrice.min && l.price_dzd <= activePrice.max);
    if (minRating > 0) list = list.filter((l) => l.rating >= minRating);

    // Apply category-specific quick filters
    if (activeQuickFilters.length > 0 && selectedCategory) {
      const filters = QUICK_FILTERS_BY_CATEGORY[selectedCategory] ?? [];
      list = list.filter((l) =>
        activeQuickFilters.every((qfKey) => {
          const qf = filters.find((f) => f.key === qfKey);
          return qf ? qf.filter(l) : true;
        })
      );
    }

    // Category-specific sorting
    switch (selectedSort) {
      case 'price_low': list.sort((a, b) => a.price_dzd - b.price_dzd); break;
      case 'price_high': list.sort((a, b) => b.price_dzd - a.price_dzd); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'star_rating': list.sort((a, b) => ((b.metadata as any).star_rating || 0) - ((a.metadata as any).star_rating || 0)); break;
      case 'review_count': list.sort((a, b) => b.review_count - a.review_count); break;
      case 'bedrooms': list.sort((a, b) => ((b.metadata as any).bedrooms || 0) - ((a.metadata as any).bedrooms || 0)); break;
      case 'price_per_km': list.sort((a, b) => ((a.metadata as any).price_per_km_dzd || 0) - ((b.metadata as any).price_per_km_dzd || 0)); break;
      case 'routes': list.sort((a, b) => ((b.metadata as any).fixed_routes?.length || 0) - ((a.metadata as any).fixed_routes?.length || 0)); break;
      case 'experience': list.sort((a, b) => ((b.metadata as any).experience_years || 0) - ((a.metadata as any).experience_years || 0)); break;
      case 'turnaround': list.sort((a, b) => ((a.metadata as any).turnaround_days || 99) - ((b.metadata as any).turnaround_days || 99)); break;
      case 'duration': list.sort((a, b) => ((a.metadata as any).session_duration_minutes || (a.metadata as any).duration_days || 0) - ((b.metadata as any).session_duration_minutes || (b.metadata as any).duration_days || 0)); break;
      case 'date': list.sort((a, b) => new Date((a.metadata as any).event_date || '2099-01-01').getTime() - new Date((b.metadata as any).event_date || '2099-01-01').getTime()); break;
      case 'capacity': list.sort((a, b) => ((b.metadata as any).total_capacity || (b.metadata as any).max_participants || 0) - ((a.metadata as any).total_capacity || (a.metadata as any).max_participants || 0)); break;
      case 'spot_count': list.sort((a, b) => (((b.metadata as any).total_rows || 0) * ((b.metadata as any).total_cols || 0)) - (((a.metadata as any).total_rows || 0) * ((a.metadata as any).total_cols || 0))); break;
      default: list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating);
    }

    return list;
  }, [query, selectedCategory, selectedWilaya, familyFriendly, isVip, activePrice, minRating, selectedSort, activeQuickFilters]);

  const renderCard = useCallback(({ item }: { item: Listing }) => (
    <SearchResultCard item={item} isWide={isWide} />
  ), [isWide]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Uber-style dark header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.bg }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => safeGoBack()} style={[styles.backBtn, { backgroundColor: colors.border }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
          <Pressable
            onPress={() => { hapticLight(); setShowFilters(!showFilters); }}
            style={[styles.filterToggle, { backgroundColor: colors.border }]}
          >
            <Ionicons name="options-outline" size={18} color={colors.text} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={[styles.filterBadgeText, { color: colors.text }]}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search input */}
        <View style={[styles.searchInputWrap, { backgroundColor: colors.bg }]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Hotels, restaurants, drivers..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.pillRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {selectedCategory && (
            <Pressable style={styles.activePill} onPress={() => removeFilter('category')}>
              <Text style={[styles.activePillText, { color: colors.text }]}>{getCategoryDef(selectedCategory).label}</Text>
              <Ionicons name="close-circle" size={14} color={colors.text} />
            </Pressable>
          )}
          {selectedWilaya && (
            <Pressable style={styles.activePill} onPress={() => removeFilter('wilaya')}>
              <Text style={[styles.activePillText, { color: colors.text }]}>{selectedWilaya}</Text>
              <Ionicons name="close-circle" size={14} color={colors.text} />
            </Pressable>
          )}
          {priceRange !== 'any' && (
            <Pressable style={styles.activePill} onPress={() => removeFilter('price')}>
              <Text style={[styles.activePillText, { color: colors.text }]}>{activePrice.label}</Text>
              <Ionicons name="close-circle" size={14} color={colors.text} />
            </Pressable>
          )}
          {minRating > 0 && (
            <Pressable style={styles.activePill} onPress={() => removeFilter('rating')}>
              <Text style={[styles.activePillText, { color: colors.text }]}>{minRating}+ stars</Text>
              <Ionicons name="close-circle" size={14} color={colors.text} />
            </Pressable>
          )}
          {familyFriendly && (
            <Pressable style={styles.activePill} onPress={() => removeFilter('family')}>
              <Text style={[styles.activePillText, { color: colors.text }]}>Family</Text>
              <Ionicons name="close-circle" size={14} color={colors.text} />
            </Pressable>
          )}
          {isVip && (
            <Pressable style={styles.activePill} onPress={() => removeFilter('vip')}>
              <Text style={[styles.activePillText, { color: colors.text }]}>VIP</Text>
              <Ionicons name="close-circle" size={14} color={colors.text} />
            </Pressable>
          )}
          {activeQuickFilters.map((qfKey) => {
            const qf = quickFilters.find((f) => f.key === qfKey);
            return qf ? (
              <Pressable key={qfKey} style={styles.activePill} onPress={() => removeFilter('quick', qfKey)}>
                <Text style={[styles.activePillText, { color: colors.text }]}>{qf.label}</Text>
                <Ionicons name="close-circle" size={14} color={colors.text} />
              </Pressable>
            ) : null;
          })}
          <Pressable style={styles.clearAllPill} onPress={resetAll}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* Expandable Filter Panel */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {/* Category */}
          <Text style={[styles.filterSectionTitle, { color: colors.muted }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {MARKETPLACE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }, selectedCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
                onPress={() => { hapticLight(); handleCategoryChange(selectedCategory === cat.key ? null : cat.key); }}
              >
                <Ionicons name={cat.icon as any} size={12} color={selectedCategory === cat.key ? '#fff' : colors.muted} />
                <Text style={[styles.chipText, { color: colors.muted }, selectedCategory === cat.key && { color: '#fff' }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Price Range */}
          <Text style={[styles.filterSectionTitle, { color: colors.muted }]}>Price Range</Text>
          <View style={styles.priceChipRow}>
            {PRICE_RANGES.map((p) => (
              <Pressable
                key={p.key}
                style={[styles.priceChip, { backgroundColor: colors.bg, borderColor: colors.border }, priceRange === p.key && styles.priceChipActive]}
                onPress={() => { hapticLight(); setPriceRange(p.key); }}
              >
                <Text style={[styles.priceChipText, { color: colors.muted }, priceRange === p.key && styles.priceChipTextActive]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Rating */}
          <Text style={[styles.filterSectionTitle, { color: colors.muted }]}>Minimum Rating</Text>
          <View style={styles.ratingRow}>
            {RATING_OPTIONS.map((r) => (
              <Pressable
                key={r.value}
                style={[styles.ratingChip, { backgroundColor: colors.bg, borderColor: colors.border }, minRating === r.value && styles.ratingChipActive]}
                onPress={() => { hapticLight(); setMinRating(r.value); }}
              >
                <Ionicons name="star" size={12} color={minRating === r.value ? '#FFD166' : colors.muted} />
                <Text style={[styles.ratingChipText, { color: colors.muted }, minRating === r.value && styles.ratingChipTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Wilaya */}
          <Text style={[styles.filterSectionTitle, { color: colors.muted }]}>Location</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <Pressable
              style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }, !selectedWilaya && { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary }]}
              onPress={() => { hapticLight(); setSelectedWilaya(null); }}
            >
              <Text style={[styles.chipText, { color: colors.muted }, !selectedWilaya && { color: '#fff' }]}>All</Text>
            </Pressable>
            {WILAYAS.map((w) => (
              <Pressable
                key={w}
                style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }, selectedWilaya === w && { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary }]}
                onPress={() => { hapticLight(); setSelectedWilaya(w); }}
              >
                <Text style={[styles.chipText, { color: colors.muted }, selectedWilaya === w && { color: '#fff' }]}>{w}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggle, familyFriendly && styles.toggleActive]}
              onPress={() => { hapticLight(); setFamilyFriendly(!familyFriendly); }}
            >
              <Ionicons name="people" size={14} color={familyFriendly ? '#fff' : colors.muted} />
              <Text style={[styles.toggleText, { color: colors.muted }, familyFriendly && styles.toggleTextActive]}>Family</Text>
            </Pressable>
            <Pressable
              style={[styles.toggle, isVip && styles.toggleActive]}
              onPress={() => { hapticLight(); setIsVip(!isVip); }}
            >
              <Ionicons name="diamond" size={14} color={isVip ? '#fff' : colors.muted} />
              <Text style={[styles.toggleText, { color: colors.muted }, isVip && styles.toggleTextActive]}>VIP</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Category-Specific Quick Filter Chips */}
      {selectedCategory && quickFilters.length > 0 && (
        <View style={[styles.quickFilterWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilterRow}>
            {quickFilters.map((qf) => {
              const isActive = activeQuickFilters.includes(qf.key);
              return (
                <Pressable
                  key={qf.key}
                  style={[styles.quickChip, { backgroundColor: colors.bg, borderColor: colors.border }, isActive && styles.quickChipActive]}
                  onPress={() => toggleQuickFilter(qf.key)}
                >
                  <Ionicons name={qf.icon as any} size={12} color={isActive ? '#fff' : colors.muted} />
                  <Text style={[styles.quickChipText, { color: colors.muted }, isActive && styles.quickChipTextActive]}>{qf.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sort Bar (always visible) */}
      <View style={[styles.sortBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {sortOptions.map((s) => (
            <Pressable
              key={s.key}
              style={[styles.sortChip, { backgroundColor: selectedSort === s.key ? RIHLA.primary : colors.bg }]}
              onPress={() => { hapticLight(); setSelectedSort(s.key); }}
            >
              <Ionicons name={s.icon as any} size={12} color={selectedSort === s.key ? '#fff' : colors.muted} />
              <Text style={[styles.sortText, { color: colors.muted }, selectedSort === s.key && styles.sortTextActive]}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={[styles.resultsCount, { color: colors.muted }]}>{results.length} found</Text>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(l) => l.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        columnWrapperStyle={isWide ? { gap: 12 } : undefined}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>Try adjusting your filters or search term</Text>
            <Pressable style={styles.emptyResetBtn} onPress={resetAll}>
              <Text style={[styles.emptyResetText, { color: colors.text }]}>Reset all filters</Text>
            </Pressable>
          </View>
        }
        renderItem={renderCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingBottom: 12 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontFamily: 'mon-b', flex: 1, textAlign: 'center' },
  filterToggle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: RIHLA.accent, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { fontSize: 9, fontFamily: 'mon-b' },

  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'mon' },

  pillRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 10, borderBottomWidth: 1 },
  activePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: RIHLA.primary,
  },
  activePillText: { fontSize: 12, fontFamily: 'mon-sb' },
  clearAllPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#DC2626',
  },
  clearAllText: { fontSize: 12, fontFamily: 'mon-sb', color: '#FFFFFF' },

  filterPanel: {
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  filterSectionTitle: {
    fontSize: 11, fontFamily: 'mon-b',
    textTransform: 'uppercase', letterSpacing: 0.5,
    paddingHorizontal: 16, marginTop: 12, marginBottom: 6,
  },

  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontFamily: 'mon-sb' },

  priceChipRow: { paddingHorizontal: 16, gap: 8, flexDirection: 'row', flexWrap: 'wrap' },
  priceChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1,
  },
  priceChipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  priceChipText: { fontSize: 12, fontFamily: 'mon-sb' },
  priceChipTextActive: { color: '#FFFFFF' },

  ratingRow: { paddingHorizontal: 16, gap: 8, flexDirection: 'row' },
  ratingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1,
  },
  ratingChipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  ratingChipText: { fontSize: 12, fontFamily: 'mon-sb' },
  ratingChipTextActive: { color: '#FFFFFF' },

  toggleRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 12 },
  toggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1,
  },
  toggleActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  toggleText: { fontSize: 12, fontFamily: 'mon-sb' },
  toggleTextActive: { color: '#FFFFFF' },

  sortBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortRow: { gap: 8 },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  sortChipActive: {},
  sortText: { fontSize: 11, fontFamily: 'mon-sb' },
  sortTextActive: { color: '#fff' },
  resultsCount: { fontSize: 11, fontFamily: 'mon-sb', paddingRight: 4 },

  list: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },

  quickFilterWrap: {
    borderBottomWidth: 1, paddingVertical: 8,
  },
  quickFilterRow: { paddingHorizontal: 16, gap: 8 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1,
  },
  quickChipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  quickChipText: { fontSize: 12, fontFamily: 'mon-sb' },
  quickChipTextActive: { color: '#FFFFFF' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: 'mon-b' },
  emptySub: { fontSize: 13, fontFamily: 'mon' },
  emptyResetBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: RIHLA.primary },
  emptyResetText: { fontSize: 13, fontFamily: 'mon-sb' },
});
