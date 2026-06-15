/**
 * RIHLA — Wilaya Hub Screen
 * ─────────────────────────
 * Shows all marketplace listings grouped by category for a specific wilaya.
 * Entry point: tap any wilaya on home screen → this hub.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getWilayaByCode } from '@/constants/wilayas';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import type { Listing, MarketplaceCategory } from '@/types/service';

// ── CATEGORY GRADIENT MAP ─────────────────────────────────────────
const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  hotel: ['#1A3C5E', '#0a2540'],
  restaurant: ['#7C3E1A', '#C56A39'],
  beach: ['#00a896', '#006B61'],
  rental: ['#3E1A7C', '#6C63FF'],
  activity: ['#7C2E1A', '#E76F51'],
  event: ['#6E1A7C', '#A855F7'],
  guide: ['#5E3E1A', '#8B5E3C'],
  photographer: ['#7C1A4E', '#FF499E'],
  driver: ['#0a2540', '#1a3c5e'],
  experience: ['#7C5E1A', '#f4a261'],
};

// ── LISTING CARD ──────────────────────────────────────────────────

function ListingCard({ listing }: { listing: Listing }) {
  const catDef = MARKETPLACE_CATEGORIES.find((c) => c.key === listing.category);
  const catColor = catDef?.color ?? RIHLA.accent;
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.listingCard, { borderTopColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/${listing.category}/${listing.id}` as any);
      }}
    >
      {/* Colored accent strip */}
      <View style={[styles.cardAccent, { backgroundColor: catColor }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{listing.title}</Text>
          {listing.is_vip && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
        </View>

        <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={2}>{listing.description}</Text>

        <View style={styles.cardBottom}>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={RIHLA.highlight} />
            <Text style={[styles.rating, { color: colors.text }]}>{listing.rating.toFixed(1)}</Text>
            <Text style={[styles.ratingCount, { color: colors.muted }]}>({listing.review_count})</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: catColor }]}>
              {listing.price_dzd.toLocaleString()} DZD
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <View style={styles.cardArrow}>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </View>
    </Pressable>
  );
}

// ── CATEGORY SECTION ──────────────────────────────────────────────

function CategorySection({
  category,
  listings,
  wilayaName,
}: {
  category: string;
  listings: Listing[];
  wilayaName: string;
}) {
  const catDef = MARKETPLACE_CATEGORIES.find((c) => c.key === category);
  if (!catDef) return null;
  const [expanded, setExpanded] = useState(true);
  const { colors } = useTheme();

  return (
    <View style={[styles.categorySection, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Section header */}
      <Pressable
        style={[styles.sectionHeader, { borderBottomColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
      >
        <View style={[styles.catIconWrap, { backgroundColor: catDef.color + '18' }]}>
          <Ionicons name={catDef.icon as any} size={18} color={catDef.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{catDef.labelPlural}</Text>
          <Text style={[styles.sectionCount, { color: colors.muted }]}>{listings.length} in {wilayaName}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.muted}
        />
      </Pressable>

      {expanded &&
        listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
    </View>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────

export default function WilayaHubScreen() {
  const { wilayaId } = useLocalSearchParams<{ wilayaId: string }>();
  const wilaya = getWilayaByCode(wilayaId ?? '');
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<'all' | MarketplaceCategory>('all');

  // Filter listings by wilaya name (case-insensitive match)
  const wilayaListings = useMemo(() => {
    if (!wilaya) return [];
    return MOCK_LISTINGS.filter(
      (l) =>
        l.wilaya.toLowerCase().includes(wilaya.name.toLowerCase()) ||
        l.wilaya.toLowerCase().includes(wilaya.nameFr.toLowerCase()) ||
        // fallback: show all if none match (demo mode)
        MOCK_LISTINGS.length > 0
    );
  }, [wilaya]);

  // Group by category
  const grouped = useMemo(() => {
    const source = activeTab === 'all'
      ? wilayaListings
      : wilayaListings.filter((l) => l.category === activeTab);

    return MARKETPLACE_CATEGORIES.reduce(
      (acc, cat) => {
        const items = source.filter((l) => l.category === cat.key);
        if (items.length > 0) acc[cat.key] = items;
        return acc;
      },
      {} as Record<string, Listing[]>
    );
  }, [wilayaListings, activeTab]);

  const totalCount = Object.values(grouped).flat().length;

  const gradientColors: [string, string] = wilaya?.hasBeach
    ? ['#00a896', '#0a2540']
    : wilaya?.hasDesert
    ? ['#E76F51', '#C1440E']
    : ['#0a2540', '#1a3c5e'];

  if (!wilaya) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.errorWrap}>
          <Ionicons name="location-outline" size={48} color={RIHLA.border} />
          <Text style={[styles.errorText, { color: colors.text }]}>Wilaya not found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* ── HERO HEADER ─────────────────────────────── */}
      <View style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.heroInner}>
          <Pressable style={styles.heroBack} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.heroContent}>
            <Text style={styles.heroEmoji}>{wilaya.emoji}</Text>
            <Text style={styles.heroName}>{wilaya.name}</Text>
            <Text style={styles.heroRegion}>{wilaya.region} · Wilaya {wilaya.id}</Text>
            {wilaya.highlight && (
              <Text style={styles.heroHighlight}>"{wilaya.highlight}"</Text>
            )}

            {/* Feature pills */}
            <View style={styles.featurePills}>
              {wilaya.hasBeach && (
                <View style={styles.featurePill}>
                  <Ionicons name="umbrella-outline" size={12} color="#fff" />
                  <Text style={styles.featurePillText}>Beach</Text>
                </View>
              )}
              {wilaya.hasDesert && (
                <View style={styles.featurePill}>
                  <Ionicons name="sunny-outline" size={12} color="#fff" />
                  <Text style={styles.featurePillText}>Desert</Text>
                </View>
              )}
              {wilaya.hasMountain && (
                <View style={styles.featurePill}>
                  <Ionicons name="triangle-outline" size={12} color="#fff" />
                  <Text style={styles.featurePillText}>Mountains</Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* ── CATEGORY FILTER TABS ─────────────────────── */}
      <View style={[styles.tabsWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {/* All Tab */}
          <Pressable
            style={[styles.tab, { borderColor: colors.border, backgroundColor: colors.card }, activeTab === 'all' && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('all');
            }}
          >
            <Text style={[styles.tabText, { color: colors.muted }, activeTab === 'all' && styles.tabTextActive]}>
              All ({totalCount})
            </Text>
          </Pressable>

          {/* Category Tabs */}
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const count = (grouped[cat.key] ?? []).length;
            if (activeTab !== 'all' && count === 0) return null;
            return (
              <Pressable
                key={cat.key}
                style={[
                  styles.tab,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  activeTab === cat.key && [styles.tabActive, { borderColor: cat.color, backgroundColor: cat.color + '12' }],
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(cat.key as MarketplaceCategory);
                }}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={activeTab === cat.key ? cat.color : colors.muted}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.muted },
                    activeTab === cat.key && [styles.tabTextActive, { color: cat.color }],
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── LISTINGS ──────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color={RIHLA.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No listings yet</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Businesses in {wilaya.name} will appear here once they join RIHLA.
            </Text>
          </View>
        ) : (
          Object.entries(grouped).map(([category, listings]) => (
            <CategorySection
              key={category}
              category={category}
              listings={listings}
              wilayaName={wilaya.name}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Hero (Uber dark solid)
  hero: { paddingBottom: 20, backgroundColor: RIHLA.primary },
  heroInner: { paddingHorizontal: 20 },
  heroBack: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  heroContent: { gap: 6 },
  heroEmoji: { fontSize: 36 },
  heroName: { fontSize: 30, fontFamily: 'mon-b', color: '#FFFFFF', letterSpacing: -0.5 },
  heroRegion: { fontSize: 13, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.75)' },
  heroHighlight: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', marginTop: 2 },
  featurePills: { flexDirection: 'row', gap: 8, marginTop: 8 },
  featurePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999,
  },
  featurePillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#FFFFFF' },

  // Tabs
  tabsWrap: { borderBottomWidth: 1 },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5,
  },
  tabActive: { borderColor: RIHLA.accent, backgroundColor: RIHLA.accent + '12' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb' },
  tabTextActive: { color: RIHLA.accent },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 8, paddingBottom: 100 },

  // Category section
  categorySection: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  catIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },
  sectionCount: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },

  // Listing card
  listingCard: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1,
    paddingRight: 12,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 12, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: 'mon-sb' },
  vipBadge: {
    backgroundColor: RIHLA.highlight + '20',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6,
  },
  vipText: { fontSize: 10, fontFamily: 'mon-b', color: RIHLA.highlight },
  cardDesc: { fontSize: 12, fontFamily: 'mon', lineHeight: 16 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontFamily: 'mon-b' },
  ratingCount: { fontSize: 11, fontFamily: 'mon' },
  priceRow: { alignItems: 'flex-end' },
  price: { fontSize: 13, fontFamily: 'mon-b' },
  cardArrow: { paddingLeft: 4 },

  // Error
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 18, fontFamily: 'mon-sb' },
  backBtn: { backgroundColor: RIHLA.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { fontSize: 14, fontFamily: 'mon-b', color: '#FFFFFF' },

  // Empty
  emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'mon-b' },
  emptyText: { fontSize: 14, fontFamily: 'mon', textAlign: 'center', lineHeight: 20 },
});
