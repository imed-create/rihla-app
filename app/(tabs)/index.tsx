/**
 * RIHLA — Discover Screen (Traveler Home)
 * ────────────────────────────────────────
 * Personalized greeting → Search → Wilaya grid → Marketplace categories → Destinations
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import DestinationCard from '@/components/shared/DestinationCard';
import SkeletonCard from '@/components/shared/SkeletonCard';
import { RIHLA } from '@/constants/theme';
import { DESTINATIONS, getDestinationsByType } from '@/constants/destinations';
import { FEATURED_WILAYAS, WILAYAS, type Wilaya } from '@/constants/wilayas';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/context/I18nContext';

// ── REGION TABS ─────────────────────────────────────────────────────
const REGION_TABS = ['All', 'Coast', 'East', 'West', 'Sahara'] as const;
type RegionTab = typeof REGION_TABS[number];

function getWilayasForRegion(tab: RegionTab): Wilaya[] {
  const featured = FEATURED_WILAYAS.map((id) => WILAYAS.find((w) => w.id === id)).filter(Boolean) as Wilaya[];
  if (tab === 'All') return featured;
  if (tab === 'Coast') return WILAYAS.filter((w) => w.hasBeach).slice(0, 12);
  if (tab === 'East') return WILAYAS.filter((w) => w.region === 'North East' || w.id === 25 || w.id === 23).slice(0, 12);
  if (tab === 'West') return WILAYAS.filter((w) => w.region === 'North West').slice(0, 12);
  if (tab === 'Sahara') return WILAYAS.filter((w) => w.hasDesert).slice(0, 12);
  return featured;
}

// ── WILAYA CHIP ──────────────────────────────────────────────────────
function WilayaChip({ wilaya, onPress }: { wilaya: Wilaya; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.wilayaChip} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.wilayaEmoji}>{wilaya.emoji}</Text>
      <Text style={styles.wilayaName}>{wilaya.name}</Text>
      {wilaya.hasBeach && <View style={styles.beachDot} />}
    </TouchableOpacity>
  );
}

// ── MARKETPLACE CATEGORY CARD ─────────────────────────────────────────
function MarketplaceCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.marketCard} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.marketIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.marketLabel} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const { user } = useApp();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionTab>('All');

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 900);
  }, []);

  // Greeting
  const firstName = user.name?.split(' ')[0] || user.kycData?.fullName?.split(' ')[0] || null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingText = firstName ? `${greeting}, ${firstName}! 👋` : `${greeting}! 👋`;

  // Wilayas for current region tab
  const displayedWilayas = useMemo(() => getWilayasForRegion(activeRegion), [activeRegion]);

  // Filtered destinations
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return DESTINATIONS.sort((a, b) => b.rating - a.rating);
    return DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // ── HEADER (renders inside FlatList ListHeaderComponent) ──────────
  const ListHeader = (
    <View>
      {/* ── TOP BAR ─────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.brandLockup}>
          <LinearGradient colors={[RIHLA.primary, RIHLA.accent]} style={styles.logoMark}>
            <Ionicons name="airplane" size={16} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.brandText}>RIHLA</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/wishlists' as any)}
          >
            <Ionicons name="heart-outline" size={20} color="#1a1a1a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color="#1a1a1a" />
            <View style={[styles.notifDot, { backgroundColor: RIHLA.accent }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/(modals)/settings' as any)}
          >
            <Ionicons name="menu" size={22} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PERSONALIZED GREETING ────────────────────────── */}
      {!loading && (
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingText}>{greetingText}</Text>
          <Text style={styles.greetingSubtext}>Where are you going in Algeria?</Text>
        </View>
      )}

      {/* ── SEARCH BAR ─────────────────────────────────────── */}
      <Pressable
        style={styles.searchBar}
        onPress={() => router.push('/search' as any)}
      >
        <View style={styles.searchInner}>
          <Ionicons name="search" size={18} color="#888888" />
          <Text style={styles.searchPlaceholder}>
            {searchQuery || 'Search wilayas, destinations...'}
          </Text>
        </View>
        <View style={styles.searchFilter}>
          <Ionicons name="options-outline" size={16} color={RIHLA.accent} />
        </View>
      </Pressable>

      {/* ── BROWSE BY WILAYA ─────────────────────────────── */}
      {!loading && (
        <View style={styles.wilayaSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Browse by Wilaya</Text>
            <Text style={styles.wilayaCount}>{WILAYAS.length} wilayas</Text>
          </View>

          {/* Region filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.regionTabs}
          >
            {REGION_TABS.map((tab) => (
              <Pressable
                key={tab}
                style={[styles.regionTab, activeRegion === tab && styles.regionTabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveRegion(tab);
                }}
              >
                <Text
                  style={[
                    styles.regionTabText,
                    activeRegion === tab && styles.regionTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Wilaya chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wilayaScroll}
          >
            {displayedWilayas.map((w) => (
              <WilayaChip
                key={w.id}
                wilaya={w}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/wilaya/${w.code}` as any);
                }}
              />
            ))}
            {/* "All Wilayas" chip */}
            <TouchableOpacity
              style={[styles.wilayaChip, styles.wilayaChipAll]}
              onPress={() => router.push('/search' as any)}
            >
              <Ionicons name="grid-outline" size={16} color={RIHLA.accent} />
              <Text style={[styles.wilayaName, { color: RIHLA.accent }]}>All 58</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ── MARKETPLACE CATEGORIES ─────────────────────── */}
      {!loading && (
        <View style={styles.marketSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>What are you looking for?</Text>
            <Pressable onPress={() => router.push('/search' as any)}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>
          <FlatList
            data={MARKETPLACE_CATEGORIES}
            keyExtractor={(item) => item.key}
            numColumns={5}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <MarketplaceCard
                icon={item.icon}
                label={item.label}
                color={item.color}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/marketplace/${item.key}` as any);
                }}
              />
            )}
            contentContainerStyle={styles.marketGrid}
          />
        </View>
      )}

      {/* ── TOP DESTINATIONS HEADER ─────────────────────── */}
      <View style={styles.sectionHeaderRow2}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? `Results for "${searchQuery}"` : 'Top Destinations'}
        </Text>
        <Text style={styles.sectionCount2}>{filteredDestinations.length} places</Text>
      </View>

      {loading && (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={loading ? [] : filteredDestinations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RIHLA.accent} colors={[RIHLA.accent]} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyWrap}>
              <Ionicons name="map-outline" size={48} color={RIHLA.border} />
              <Text style={styles.emptyText}>No destinations found</Text>
            </View>
          )
        }
        renderItem={({ item }) => <DestinationCard destination={item} />}
      />
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { fontSize: 20, fontFamily: 'mon-b', color: RIHLA.primary, letterSpacing: 1.5 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 9,
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },

  // Greeting
  greetingWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 3 },
  greetingText: { fontSize: 24, fontFamily: 'mon-b', color: '#0F172A', letterSpacing: -0.3 },
  greetingSubtext: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },

  // Search bar (tap to navigate)
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 10, paddingHorizontal: 16, height: 52,
  },
  searchPlaceholder: { fontSize: 14, fontFamily: 'mon', color: '#94A3B8' },
  searchFilter: {
    width: 52, height: 52,
    alignItems: 'center', justifyContent: 'center',
    borderLeftWidth: 1, borderLeftColor: '#E2E8F0',
  },

  // Wilaya section
  wilayaSection: { paddingTop: 20 },
  sectionHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#0F172A' },
  wilayaCount: { fontSize: 12, fontFamily: 'mon-sb', color: '#94A3B8' },

  // Region tabs
  regionTabs: { paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  regionTab: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  regionTabActive: { borderColor: RIHLA.primary, backgroundColor: RIHLA.primary + '10' },
  regionTabText: { fontSize: 13, fontFamily: 'mon-sb', color: '#94A3B8' },
  regionTabTextActive: { color: RIHLA.primary },

  // Wilaya chips
  wilayaScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  wilayaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  wilayaChipAll: { borderColor: RIHLA.accent + '40', borderStyle: 'dashed' },
  wilayaEmoji: { fontSize: 18 },
  wilayaName: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },
  beachDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: RIHLA.accent,
  },

  // Marketplace categories
  marketSection: { paddingTop: 24 },
  seeAll: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },
  marketGrid: { paddingHorizontal: 16, paddingTop: 8 },
  marketCard: {
    flex: 1, alignItems: 'center', gap: 6,
    paddingVertical: 12, margin: 4,
  },
  marketIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  marketLabel: { fontSize: 10, fontFamily: 'mon-sb', color: '#475569', textAlign: 'center' },

  // Section header (destinations)
  sectionHeaderRow2: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  sectionCount2: { fontSize: 12, fontFamily: 'mon-sb', color: '#94A3B8' },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Skeleton
  skeletonWrap: { gap: 16, paddingTop: 8 },

  // Empty
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#888888', fontFamily: 'mon-sb' },
});
