import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { MARKETPLACE_CATEGORIES, getCategoryDef } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS, getListingWilayas } from '@/constants/mockListings';
import type { MarketplaceCategory, Listing } from '@/types/service';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';

type SortOption = 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'price_low', label: 'Price: Low → High' },
  { key: 'price_high', label: 'Price: High → Low' },
  { key: 'rating', label: 'Top Rated' },
];

const WILAYAS = getListingWilayas();

function getDetailRoute(item: Listing): string {
  return `/listing/${item.id}`;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === 'web' && width >= 900;

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('recommended');
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(50000);
  const [minRating, setMinRating] = useState(0);

  const hasActiveFilters = selectedCategory || selectedWilaya || familyFriendly || isVip || priceMin > 0 || priceMax < 50000 || minRating > 0;

  const resetAll = useCallback(() => {
    hapticLight();
    setQuery('');
    setSelectedCategory(null);
    setSelectedWilaya(null);
    setSelectedSort('recommended');
    setFamilyFriendly(false);
    setIsVip(false);
    setPriceMin(0);
    setPriceMax(50000);
    setMinRating(0);
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
    list = list.filter((l) => l.price_dzd >= priceMin && l.price_dzd <= priceMax);
    if (minRating > 0) list = list.filter((l) => l.rating >= minRating);

    switch (selectedSort) {
      case 'price_low': list.sort((a, b) => a.price_dzd - b.price_dzd); break;
      case 'price_high': list.sort((a, b) => b.price_dzd - a.price_dzd); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating);
    }

    return list;
  }, [query, selectedCategory, selectedWilaya, familyFriendly, isVip, priceMin, priceMax, minRating, selectedSort]);

  const renderListingCard = useCallback(({ item }: { item: Listing }) => {
    const catDef = getCategoryDef(item.category);
    return (
      <Pressable
        style={[styles.resultCard, isWide && { width: '48%' }]}
        onPress={() => router.push(getDetailRoute(item) as any)}
      >
        <View style={[styles.resultImage, { backgroundColor: catDef.color + '20' }]}>
          <Ionicons name={catDef.icon as any} size={32} color={catDef.color} />
        </View>
        <View style={styles.resultInfo}>
          <View style={styles.resultRow}>
            <View style={[styles.catBadge, { backgroundColor: catDef.color + '18' }]}>
              <Ionicons name={catDef.icon as any} size={12} color={catDef.color} />
              <Text style={[styles.catBadgeText, { color: catDef.color }]}>{catDef.label}</Text>
            </View>
            {item.is_featured && (
              <View style={styles.featBadge}>
                <Text style={styles.featBadgeText}>Featured</Text>
              </View>
            )}
          </View>
          <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.resultDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.resultBottom}>
            <View style={styles.resultRating}>
              <Ionicons name="star" size={13} color="#FFD166" />
              <Text style={styles.resultRatingText}>{item.rating}</Text>
              <Text style={styles.resultReviewCount}>({item.review_count})</Text>
            </View>
            <Text style={styles.resultPrice}>{item.price_dzd.toLocaleString()} DZD</Text>
          </View>
          <Text style={styles.resultLocation}>{item.wilaya}, Algeria</Text>
        </View>
      </Pressable>
    );
  }, [isWide]);

  return (
    <View style={styles.root}>
      {/* Uber-style dark header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Search</Text>
          {hasActiveFilters && (
            <Pressable onPress={resetAll} style={styles.resetBtn}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          )}
          {!hasActiveFilters && <View style={{ width: 50 }} />}
        </View>
        {/* Uber-style search input right in header */}
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where do you want to go?"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={MARKETPLACE_CATEGORIES}
        keyExtractor={(c) => c.key}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item: cat }) => (
          <Pressable
            style={[styles.chip, selectedCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
            onPress={() => { hapticLight(); setSelectedCategory(selectedCategory === cat.key ? null : cat.key); }}
          >
            <Ionicons name={cat.icon as any} size={14} color={selectedCategory === cat.key ? '#fff' : '#64748B'} />
            <Text style={[styles.chipText, selectedCategory === cat.key && { color: '#fff' }]}>{cat.label}</Text>
          </Pressable>
        )}
      />

      {/* Wilaya Chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={['All', ...WILAYAS]}
        keyExtractor={(w) => w}
        contentContainerStyle={styles.chipRow}
        renderItem={({ item: w }) => (
          <Pressable
            style={[styles.chip, (selectedWilaya === w || (w === 'All' && !selectedWilaya)) && { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary }]}
            onPress={() => { hapticLight(); setSelectedWilaya(w === 'All' ? null : w); }}
          >
            <Text style={[styles.chipText, (selectedWilaya === w || (w === 'All' && !selectedWilaya)) && { color: '#fff' }]}>
              {w}
            </Text>
          </Pressable>
        )}
      />

      {/* Sort + Toggles */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SORT_OPTIONS}
          keyExtractor={(s) => s.key}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item: s }) => (
            <Pressable
              style={[styles.sortChip, selectedSort === s.key && styles.sortChipActive]}
              onPress={() => { hapticLight(); setSelectedSort(s.key); }}
            >
              <Text style={[styles.sortText, selectedSort === s.key && styles.sortTextActive]}>{s.label}</Text>
            </Pressable>
          )}
        />
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggle, familyFriendly && styles.toggleActive]}
            onPress={() => { hapticLight(); setFamilyFriendly(!familyFriendly); }}
          >
            <Text style={[styles.toggleText, familyFriendly && styles.toggleTextActive]}>Family</Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, isVip && styles.toggleActive]}
            onPress={() => { hapticLight(); setIsVip(!isVip); }}
          >
            <Text style={[styles.toggleText, isVip && styles.toggleTextActive]}>VIP</Text>
          </Pressable>
          <Pressable
            style={[styles.toggle, minRating >= 4.5 && styles.toggleActive]}
            onPress={() => { hapticLight(); setMinRating(minRating >= 4.5 ? 0 : 4.5); }}
          >
            <Text style={[styles.toggleText, minRating >= 4.5 && styles.toggleTextActive]}>4.5+</Text>
          </Pressable>
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Results list */}
      <FlatList
        data={results}
        keyExtractor={(l) => l.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        columnWrapperStyle={isWide ? { gap: 16 } : undefined}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySub}>Try adjusting your filters</Text>
          </View>
        }
        renderItem={renderListingCard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Uber dark header
  header: { backgroundColor: '#0d0d0d', paddingBottom: 12 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontFamily: 'mon-b', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  resetBtn: { width: 50, alignItems: 'flex-end' },
  resetText: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent },

  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: '#1a1a1a', borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'mon', color: '#FFFFFF' },

  // Chips — Uber clean pill style
  chipRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  chipText: { fontSize: 13, fontFamily: 'mon-sb', color: '#334155' },

  // Filter row
  filterRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  toggle: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  toggleActive: { backgroundColor: RIHLA.primary, shadowOpacity: 0 },
  toggleText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
  toggleTextActive: { color: '#FFFFFF' },

  // Sort
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F1F5F9' },
  sortChipActive: { backgroundColor: '#0d0d0d' },
  sortText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
  sortTextActive: { color: '#fff' },

  // Results
  resultsHeader: { paddingHorizontal: 20, paddingVertical: 8 },
  resultsCount: { fontSize: 12, fontFamily: 'mon-sb', color: '#94A3B8' },

  list: { paddingHorizontal: 16, gap: 12 },

  // Card
  resultCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0',
    overflow: 'hidden', marginBottom: 4,
  },
  resultImage: { height: 120, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { padding: 14, gap: 4 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catBadgeText: { fontSize: 10, fontFamily: 'mon-b' },
  featBadge: { backgroundColor: '#f4a26120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  featBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#f4a261' },
  resultTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A', marginTop: 4 },
  resultDesc: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },
  resultBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  resultRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  resultRatingText: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  resultReviewCount: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  resultPrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary },
  resultLocation: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },

  // Empty
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8' },
});
