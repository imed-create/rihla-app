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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RIHLA } from '@/constants/theme';
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

  return (
    <Pressable
      style={styles.listingCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/${listing.category}/${listing.id}` as any);
      }}
    >
      {/* Colored accent strip */}
      <View style={[styles.cardAccent, { backgroundColor: catColor }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{listing.title}</Text>
          {listing.is_vip && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{listing.description}</Text>

        <View style={styles.cardBottom}>
          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={RIHLA.highlight} />
            <Text style={styles.rating}>{listing.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({listing.review_count})</Text>
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
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
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

  return (
    <View style={styles.categorySection}>
      {/* Section header */}
      <Pressable
        style={styles.sectionHeader}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
      >
        <View style={[styles.catIconWrap, { backgroundColor: catDef.color + '18' }]}>
          <Ionicons name={catDef.icon as any} size={18} color={catDef.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{catDef.labelPlural}</Text>
          <Text style={styles.sectionCount}>{listings.length} in {wilayaName}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#94A3B8"
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
      <SafeAreaView style={styles.root}>
        <View style={styles.errorWrap}>
          <Ionicons name="location-outline" size={48} color={RIHLA.border} />
          <Text style={styles.errorText}>Wilaya not found</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── HERO HEADER ─────────────────────────────── */}
      <LinearGradient colors={gradientColors} style={styles.hero}>
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
      </LinearGradient>

      {/* ── CATEGORY FILTER TABS ─────────────────────── */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {/* All Tab */}
          <Pressable
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('all');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
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
                  color={activeTab === cat.key ? cat.color : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.tabText,
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
            <Text style={styles.emptyTitle}>No listings yet</Text>
            <Text style={styles.emptyText}>
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
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Hero
  hero: { paddingBottom: 20 },
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
  tabsWrap: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabsScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tabActive: { borderColor: RIHLA.accent, backgroundColor: RIHLA.accent + '12' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#94A3B8' },
  tabTextActive: { color: RIHLA.accent },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 8 },

  // Category section
  categorySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  catIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  sectionCount: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginTop: 1 },

  // Listing card
  listingCard: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    paddingRight: 12,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 12, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  vipBadge: {
    backgroundColor: RIHLA.highlight + '20',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6,
  },
  vipText: { fontSize: 10, fontFamily: 'mon-b', color: RIHLA.highlight },
  cardDesc: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  ratingCount: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  priceRow: { alignItems: 'flex-end' },
  price: { fontSize: 13, fontFamily: 'mon-b' },
  cardArrow: { paddingLeft: 4 },

  // Error
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 18, fontFamily: 'mon-sb', color: '#1a1a1a' },
  backBtn: { backgroundColor: RIHLA.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { fontSize: 14, fontFamily: 'mon-b', color: '#FFFFFF' },

  // Empty
  emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#1a1a1a' },
  emptyText: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 20 },
});
