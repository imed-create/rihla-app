/**
 * RIHLA — Destination Hub Screen
 * ---------------------------------
 * Shows destination hero + ALL category cards always.
 * When a specific category tab is clicked, shows marketplace listings for that category.
 * "All" tab shows the category overview grid.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getDestinationById } from '@/constants/destinations';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { MARKETPLACE_CATEGORIES, getCategoryDef } from '@/constants/marketplaceCategories';
import type { MarketplaceCategory, Listing } from '@/types/service';
import { getServicesByCategory } from '@/constants/services';
import EmptyState from '@/components/EmptyState';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight } from '@/utils/haptics';

const DESTINATION_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400',
  desert: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1400',
  mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400',
  historical: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1400',
  city: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400',
};

export default function DestinationHubScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const isWide = Platform.OS === 'web' && width >= 900;

  const destination = useMemo(() => getDestinationById(id ?? ''), [id]);
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory | 'all'>('all');

  // Services for this destination type (always available, from constants/services)
  const destinationServices = useMemo(() => {
    if (!destination) return [];
    return getServicesByCategory(destination.type);
  }, [destination]);

  // Marketplace listings for this destination's region
  const listings = useMemo(() => {
    if (!destination) return [];
    let results = MOCK_LISTINGS.filter((l) => l.is_active && l.wilaya === destination.region);
    if (selectedCategory !== 'all') {
      results = results.filter((l) => l.category === selectedCategory);
    }
    return results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating);
  }, [destination, selectedCategory]);

  if (!destination) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={SAHEL.dark} />
        </Pressable>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Destination not found</Text>
        </View>
      </View>
    );
  }

  const isAll = selectedCategory === 'all';
  const catDef = !isAll ? getCategoryDef(selectedCategory) : null;

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* ── HERO HEADER ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
            style={styles.heroGradient}
          >
            <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.heroContent}>
              <Text style={styles.heroName}>{destination.name}</Text>
              <Text style={styles.heroRegion}>{destination.region}, Algeria</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Ionicons name="star" size={14} color="#FFD166" />
                  <Text style={styles.heroStatVal}>{destination.rating}</Text>
                  <Text style={styles.heroStatLabel}>({destination.reviews})</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Ionicons name="navigate" size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroStatVal}>{destination.distance}</Text>
                </View>
              </View>
              <Text style={styles.heroTagline}>{destination.tagline}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── CATEGORY TABS (always show ALL 10) ── */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, isAll && styles.tabActive]}
            onPress={() => { hapticLight(); setSelectedCategory('all'); }}
          >
            <Ionicons name="grid-outline" size={14} color={isAll ? '#fff' : SAHEL.mutedText} />
            <Text style={[styles.tabText, isAll && styles.tabTextActive]}>All</Text>
          </Pressable>
          {MARKETPLACE_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              style={[styles.tab, selectedCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => { hapticLight(); setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key); }}
            >
              <Ionicons name={cat.icon as any} size={14} color={selectedCategory === cat.key ? '#fff' : SAHEL.mutedText} />
              <Text style={[styles.tabText, selectedCategory === cat.key && { color: '#fff' }]}>{cat.labelPlural}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── "ALL" TAB: Show category overview cards + legacy services ── */}
        {isAll && (
          <>
            {/* Category Cards Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What are you looking for?</Text>
              <Text style={styles.sectionSub}>Browse by category in {destination.name}</Text>
              <View style={styles.categoryGrid}>
                {MARKETPLACE_CATEGORIES.map((cat) => {
                  const count = MOCK_LISTINGS.filter(
                    (l) => l.is_active && l.wilaya === destination.region && l.category === cat.key
                  ).length;
                  return (
                    <Pressable
                      key={cat.key}
                      style={styles.categoryCard}
                      onPress={() => { hapticLight(); setSelectedCategory(cat.key); }}
                    >
                      <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '15' }]}>
                        <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                      </View>
                      <Text style={styles.categoryLabel}>{cat.labelPlural}</Text>
                      <Text style={styles.categoryCount}>
                        {count > 0 ? `${count} listing${count > 1 ? 's' : ''}` : 'Browse'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Legacy Services Grid (existing beach/desert services) */}
            {destinationServices.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services & Activities</Text>
                <Text style={styles.sectionSub}>Everything you need, booked instantly</Text>
                <View style={styles.servicesGrid}>
                  {destinationServices.map((svc) => (
                    <Pressable
                      key={svc.id}
                      style={styles.serviceCard}
                      onPress={() => {
                        hapticLight();
                        router.push({ pathname: svc.route as any, params: { destinationId: destination.id } });
                      }}
                    >
                      <View style={[styles.serviceIconWrap, { backgroundColor: svc.color + '18' }]}>
                        <Ionicons name={svc.icon as any} size={22} color={svc.color} />
                      </View>
                      <Text style={styles.serviceTitle} numberOfLines={1}>{svc.title}</Text>
                      <Text style={styles.serviceTagline} numberOfLines={1}>{svc.tagline}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Featured marketplace listings */}
            {listings.filter((l) => l.is_featured).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Featured in {destination.name}</Text>
                <View style={styles.listingsGrid}>
                  {listings.filter((l) => l.is_featured).map((item) => (
                    <ListingCard key={item.id} item={item} isWide={isWide} />
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ── SPECIFIC CATEGORY TAB: Show marketplace listings ── */}
        {!isAll && (
          <>
            {/* Category Header */}
            <View style={styles.catHeader}>
              <View style={[styles.catHeaderIcon, { backgroundColor: catDef!.color + '15' }]}>
                <Ionicons name={catDef!.icon as any} size={24} color={catDef!.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.catHeaderTitle}>{catDef!.labelPlural} in {destination.name}</Text>
                <Text style={styles.catHeaderSub}>{listings.length} listing{listings.length !== 1 ? 's' : ''} available</Text>
              </View>
            </View>

            {/* Listings */}
            {listings.length > 0 ? (
              <View style={styles.listingsGrid}>
                {listings.map((item) => (
                  <ListingCard key={item.id} item={item} isWide={isWide} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <EmptyState
                  icon={catDef!.icon as any}
                  title={`No ${catDef!.labelPlural.toLowerCase()} yet`}
                  subtitle={`${catDef!.labelPlural} in ${destination.name} will appear here once listed by businesses.`}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Listing Card ──
function getDetailRoute(item: Listing): string {
  switch (item.category) {
    case 'hotel': return `/hotel/${item.id}`;
    case 'restaurant': return `/restaurant/${item.id}`;
    case 'beach': return `/beach-map/${item.id}`;
    case 'rental': return `/rental/${item.id}`;
    case 'activity': return `/activity/${item.id}`;
    case 'event': return `/event/${item.id}`;
    case 'guide': return `/guide/${item.id}`;
    case 'photographer': return `/photographer/${item.id}`;
    case 'driver': return `/driver/${item.id}`;
    case 'experience': return `/experience/${item.id}`;
    default: return `/listing/${item.id}`;
  }
}

function ListingCard({ item, isWide }: { item: Listing; isWide: boolean }) {
  const catDef = getCategoryDef(item.category);
  return (
    <Pressable
      style={[styles.listingCard, isWide && { width: '48%' }]}
      onPress={() => router.push(getDetailRoute(item) as any)}
    >
      <View style={[styles.listingImage, { backgroundColor: catDef.color + '15' }]}>
        <Ionicons name={catDef.icon as any} size={28} color={catDef.color} />
        <View style={[styles.listingCatBadge, { backgroundColor: catDef.color }]}>
          <Text style={styles.listingCatText}>{catDef.label}</Text>
        </View>
        {item.is_featured && (
          <View style={styles.listingFeatBadge}>
            <Ionicons name="star" size={10} color="#fff" />
            <Text style={styles.listingFeatText}>Featured</Text>
          </View>
        )}
      </View>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listingDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.listingBottom}>
          <View style={styles.listingRating}>
            <Ionicons name="star" size={12} color="#FFD166" />
            <Text style={styles.listingRatingText}>{item.rating}</Text>
            <Text style={styles.listingReviewCount}>({item.review_count})</Text>
          </View>
          <Text style={styles.listingPrice}>{item.price_dzd.toLocaleString()} DZD</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },

  // Hero
  heroWrap: { overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroGradient: { paddingHorizontal: 20, paddingBottom: 28, minHeight: 260, justifyContent: 'space-between' },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  heroContent: { gap: 4 },
  heroName: { fontSize: 30, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroRegion: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)' },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  heroStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroStatVal: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
  heroStatLabel: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  heroStatDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroTagline: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 18 },

  // Tabs — ALWAYS show all 10 categories
  tabsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: SAHEL.border, backgroundColor: '#fff',
  },
  tabActive: { backgroundColor: SAHEL.primary, borderColor: SAHEL.primary },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.mutedText },
  tabTextActive: { color: '#fff' },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 2 },
  sectionSub: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText, marginBottom: 14 },

  // Category grid (on "All" tab)
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '30%', minWidth: 100, alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: SAHEL.border,
    paddingVertical: 16, paddingHorizontal: 8,
  },
  categoryIconWrap: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  categoryLabel: { fontSize: 11, fontFamily: 'mon-sb', color: SAHEL.dark, textAlign: 'center' },
  categoryCount: { fontSize: 10, fontFamily: 'mon', color: SAHEL.mutedText },

  // Services grid (legacy beach/desert services)
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceCard: {
    width: '47%', alignItems: 'flex-start', gap: 6,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: SAHEL.border,
    padding: 14,
  },
  serviceIconWrap: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  serviceTitle: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.dark },
  serviceTagline: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },

  // Category header (when specific category selected)
  catHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff',
    marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: SAHEL.border,
    marginBottom: 14,
  },
  catHeaderIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catHeaderTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  catHeaderSub: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },

  // Listing cards
  listingsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  listingCard: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: SAHEL.border,
    overflow: 'hidden', marginBottom: 4, width: '100%',
  },
  listingImage: { height: 110, alignItems: 'center', justifyContent: 'center' },
  listingCatBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  listingCatText: { fontSize: 10, fontFamily: 'mon-b', color: '#fff' },
  listingFeatBadge: {
    position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  listingFeatText: { fontSize: 9, fontFamily: 'mon-b', color: '#fff' },
  listingInfo: { padding: 14, gap: 4 },
  listingTitle: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  listingDesc: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText, lineHeight: 16 },
  listingBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  listingRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  listingRatingText: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.dark },
  listingReviewCount: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },
  listingPrice: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.primary },

  // Empty
  emptyWrap: { paddingHorizontal: 20 },
});
