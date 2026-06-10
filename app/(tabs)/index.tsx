/**
 * RIHLA — Discover Screen (Traveler Home - Uber Style)
 * ─────────────────────────────────────────────────────
 * Clean, premium layout: Greeting → Search → Featured listings →
 * Marketplace categories → Top destinations suggestions
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { RIHLA } from '@/constants/theme';
import { DESTINATIONS } from '@/constants/destinations';
import { MARKETPLACE_CATEGORIES, getCategoryDef } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { useApp } from '@/context/AppContext';

// ── FEATURED LISTING CARD ──────────────────────────────────────────
function FeaturedListingCard({ listing }: { listing: any }) {
  const catDef = getCategoryDef(listing.category as any);
  const catColor = catDef?.color || RIHLA.primary;
  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/listing/${listing.id}` as any); }}
      activeOpacity={0.85}
    >
      <View style={[styles.featuredImageWrap]}>
        {listing.cover_image_url ? (
          <Image source={{ uri: listing.cover_image_url }} style={styles.featuredImage} />
        ) : (
          <View style={[styles.featuredImagePlaceholder, { backgroundColor: catColor + '20' }]}>
            <Ionicons name={(catDef?.icon || 'image-outline') as any} size={28} color={catColor} />
          </View>
        )}
        <View style={[styles.featuredBadge, { backgroundColor: catColor }]}>
          <Ionicons name={(catDef?.icon || 'location') as any} size={10} color="#fff" />
          <Text style={styles.featuredBadgeText}>{catDef?.label || listing.category}</Text>
        </View>
        {listing.is_vip && (
          <View style={styles.featuredVipBadge}>
            <Ionicons name="diamond" size={10} color="#FFFFFF" />
            <Text style={styles.featuredVipText}>VIP</Text>
          </View>
        )}
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.featuredSubtitle} numberOfLines={1}>{listing.wilaya}</Text>
        <View style={styles.featuredMeta}>
          <View style={styles.featuredRating}>
            <Ionicons name="star" size={12} color="#FFD166" />
            <Text style={styles.featuredRatingText}>{listing.rating}</Text>
          </View>
          <Text style={styles.featuredPrice}>
            {listing.price_dzd.toLocaleString()} <Text style={styles.featuredPriceUnit}>DZD</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── DESTINATION SUGGESTION CARD ─────────────────────────────────────
function DestinationSuggestCard({ dest }: { dest: any }) {
  const gradientColors = dest.gradient || ['#0a2540', '#061422'];
  return (
    <TouchableOpacity
      style={styles.destCard}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/destination/${dest.id}` as any); }}
      activeOpacity={0.85}
    >
      <LinearGradient colors={gradientColors as [string, string]} style={styles.destGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.destContent}>
          <Text style={styles.destEmoji}>{dest.type === 'beach' ? '🏖️' : dest.type === 'desert' ? '🏜️' : dest.type === 'mountain' ? '⛰️' : dest.type === 'city' ? '🏙️' : '🏛️'}</Text>
          <Text style={styles.destName}>{dest.name}</Text>
          <Text style={styles.destRegion}>{dest.region} · {dest.distance}</Text>
          <View style={styles.destRatingRow}>
            <Ionicons name="star" size={11} color="#FFD166" />
            <Text style={styles.destRatingText}>{dest.rating}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const { user } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Greeting
  const firstName = user.name?.split(' ')[0] || user.kycData?.fullName?.split(' ')[0] || null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingText = firstName ? `${greeting}, ${firstName}! 👋` : `${greeting}! 👋`;

  // Featured listings (active and featured, up to 8)
  const featuredListings = useMemo(
    () => MOCK_LISTINGS.filter(l => l.is_active && l.is_featured).slice(0, 8),
    []
  );

  // Top destinations (by rating, up to 6)
  const topDestinations = useMemo(
    () => [...DESTINATIONS].sort((a, b) => b.rating - a.rating).slice(0, 6),
    []
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={[]}
        keyExtractor={(_, i) => i.toString()}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RIHLA.accent} colors={[RIHLA.accent]} />
        }
        ListHeaderComponent={
          <>
            {/* ── TOP BAR ── */}
            <View style={styles.topBar}>
              <View style={styles.brandLockup}>
                <LinearGradient colors={[RIHLA.primary, RIHLA.accent]} style={styles.logoMark}>
                  <Ionicons name="airplane" size={14} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.brandText}>RIHLA</Text>
              </View>
              <View style={styles.topBarRight}>
                <View style={styles.iconBtn}>
                  <Ionicons name="notifications-outline" size={20} color="#1a1a1a" />
                  <View style={[styles.notifDot, { backgroundColor: RIHLA.accent }]} />
                </View>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => router.push('/(modals)/settings' as any)}
                >
                  <Ionicons name="menu" size={22} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── GREETING HERO ── */}
            <View style={styles.heroSection}>
              <Text style={styles.greetingText}>{greetingText}</Text>
              <Text style={styles.heroTitle}>Where would you{'\n'}like to go?</Text>
            </View>

            {/* ── UBER-STYLE SEARCH ── */}
            <Pressable
              style={styles.searchBar}
              onPress={() => router.push('/search' as any)}
            >
              <View style={styles.searchIconWrap}>
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.searchContent}>
                <Text style={styles.searchPlaceholder}>Search destinations, wilayas...</Text>
                <Text style={styles.searchHint}>Hotels, restaurants, guides & more</Text>
              </View>
              <View style={styles.searchDivider} />
              <View style={styles.searchFilter}>
                <Ionicons name="options-outline" size={18} color={RIHLA.accent} />
              </View>
            </Pressable>

            {/* ── FEATURED LISTINGS ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Stays</Text>
                <TouchableOpacity onPress={() => router.push('/search' as any)}>
                  <Text style={styles.sectionLink}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScroll}
              >
                {featuredListings.slice(0, 5).map((listing) => (
                  <FeaturedListingCard key={listing.id} listing={listing} />
                ))}
              </ScrollView>
            </View>

            {/* ── QUICK CATEGORIES ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>What are you looking for?</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.categoryChip, { backgroundColor: cat.color + '12', borderColor: cat.color + '30' }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/marketplace/${cat.key}` as any); }}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '20' }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.labelPlural}</Text>
                      <Text style={styles.categoryDesc}>{cat.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={cat.color} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ── SUGGESTED DESTINATIONS ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Top Destinations</Text>
                <Text style={styles.sectionCount}>{topDestinations.length} places</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.destScroll}
              >
                {topDestinations.map((dest) => (
                  <DestinationSuggestCard key={dest.id} dest={dest} />
                ))}
              </ScrollView>
            </View>

            {/* ── QUICK ACTIONS ── */}
            <View style={[styles.section, { marginBottom: 20 }]}>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => { Haptics.selectionAsync(); router.push('/(tabs)/explore' as any); }}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#0a2540' }]}>
                    <Ionicons name="map" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionTitle}>Explore Map</Text>
                  <Text style={styles.quickActionDesc}>Find places on map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => { Haptics.selectionAsync(); router.push('/search' as any); }}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#00a896' }]}>
                    <Ionicons name="search" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionTitle}>Search All</Text>
                  <Text style={styles.quickActionDesc}>Browse 70+ listings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => { Haptics.selectionAsync(); router.push('/services/find-providers' as any); }}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#6C63FF' }]}>
                    <Ionicons name="car" size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.quickActionTitle}>Find Ride</Text>
                  <Text style={styles.quickActionDesc}>Nearby drivers</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
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
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary, letterSpacing: 1.5 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 8,
    width: 7, height: 7, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greetingText: { fontSize: 15, fontFamily: 'mon-sb', color: '#64748B', marginBottom: 4 },
  heroTitle: { fontSize: 30, fontFamily: 'mon-b', color: '#0F172A', lineHeight: 36, letterSpacing: -0.5 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 12, marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    height: 60,
  },
  searchIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: RIHLA.primary,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 10,
  },
  searchContent: { flex: 1, paddingLeft: 10, gap: 2 },
  searchPlaceholder: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  searchHint: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  searchDivider: { width: 1, height: 36, backgroundColor: '#E2E8F0' },
  searchFilter: { width: 50, height: 60, alignItems: 'center', justifyContent: 'center' },

  // Sections
  section: { paddingTop: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: 'mon-b', color: '#0F172A' },
  sectionLink: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },
  sectionCount: { fontSize: 12, fontFamily: 'mon-sb', color: '#94A3B8' },

  // Featured listings
  featuredScroll: { paddingLeft: 20, paddingRight: 8, gap: 12 },
  featuredCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  featuredImageWrap: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: 120,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#FFFFFF' },
  featuredVipBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredVipText: { fontSize: 8, fontFamily: 'mon-b', color: '#FFFFFF' },
  featuredInfo: { padding: 10, gap: 3 },
  featuredTitle: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  featuredSubtitle: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  featuredRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  featuredRatingText: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  featuredPrice: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.primary },
  featuredPriceUnit: { fontSize: 9, fontFamily: 'mon', color: '#94A3B8' },

  // Categories
  categoriesScroll: { paddingLeft: 20, paddingRight: 8, gap: 10 },
  categoryChip: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: { flex: 1, gap: 2 },
  categoryLabel: { fontSize: 13, fontFamily: 'mon-b' },
  categoryDesc: { fontSize: 10, fontFamily: 'mon', color: '#64748B' },

  // Destinations
  destScroll: { paddingLeft: 20, paddingRight: 8, gap: 12 },
  destCard: {
    width: 160,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  destGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
  },
  destContent: { gap: 3 },
  destEmoji: { fontSize: 24, marginBottom: 4 },
  destName: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },
  destRegion: { fontSize: 11, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  destRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  destRatingText: { fontSize: 12, fontFamily: 'mon-b', color: '#FFD166' },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  quickActionDesc: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },

  // List
  listContent: { paddingBottom: 40 },
});
