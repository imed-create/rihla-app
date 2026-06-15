/**
 * RIHLA — Discover Screen (Traveler Home)
 * ────────────────────────────────────────
 * Layout: Greeting → Search → Swipeable Quick Actions → Wilayas Bubbles
 *         → Categories → Map Preview → Top Destinations
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { FEATURED_WILAYAS, getWilayaById } from '@/constants/wilayas';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useAIBubbleStore } from '@/store/useAIBubbleStore';
import { useLocationStore } from '@/store/useLocationStore';
import MapWithDirections from '@/components/shared/MapWithDirections';
import type { ServiceMarker } from '@/store/useLocationStore';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.72;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_W + CARD_GAP;

// ── Haversine distance (km) ──
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Quick Action Card Data ──
const QUICK_ACTIONS = [
  {
    key: 'map',
    title: 'Explore Map',
    desc: 'Browse places on the interactive map',
    icon: 'map' as const,
    gradient: ['#0a2540', '#1a3c5e'] as [string, string],
    emoji: '🗺️',
    route: '/(tabs)/explore',
  },
  {
    key: 'ai',
    title: 'AI Assistant',
    desc: 'Ask me anything about Algeria travel',
    icon: 'sparkles' as const,
    gradient: [RIHLA.accent, '#007A6E'] as [string, string],
    emoji: '🤖',
    route: null, // triggers AI bubble
  },
  {
    key: 'ride',
    title: 'Find a Ride',
    desc: 'Yassir-style ride hailing nearby',
    icon: 'car' as const,
    gradient: ['#6C63FF', '#4834D4'] as [string, string],
    emoji: '🚗',
    route: '/services/ride',
  },
  {
    key: 'food',
    title: 'Food & Dining',
    desc: 'Restaurants, menus & reservations',
    icon: 'restaurant' as const,
    gradient: ['#C56A39', '#8B3E15'] as [string, string],
    emoji: '🍽️',
    route: '/marketplace/restaurant',
  },
  {
    key: 'beach',
    title: 'Beach Spots',
    desc: 'Reserve parasols, spots & more',
    icon: 'umbrella' as const,
    gradient: ['#00a896', '#006B61'] as [string, string],
    emoji: '🏖️',
    route: '/marketplace/beach',
  },
];

// ── Quick Action Card ──
function QuickActionCard({
  action,
  onPress,
}: {
  action: (typeof QUICK_ACTIONS)[0];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.qaCard}>
      <LinearGradient
        colors={action.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.qaGradient}
      >
        <Text style={styles.qaEmoji}>{action.emoji}</Text>
        <View style={styles.qaTextArea}>
          <Text style={styles.qaTitle}>{action.title}</Text>
          <Text style={styles.qaDesc}>{action.desc}</Text>
        </View>
        <View style={styles.qaArrow}>
          <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Wilaya Bubble ──
function WilayaBubble({ wilayaId, colors }: { wilayaId: number; colors: any }) {
  const wilaya = getWilayaById(wilayaId);
  if (!wilaya) return null;

  const regionColor =
    wilaya.hasBeach ? '#00a896' : wilaya.hasDesert ? '#E76F51' : wilaya.hasMountain ? '#2D6A4F' : '#6C63FF';

  return (
    <TouchableOpacity
      style={styles.wilayaBubble}
      activeOpacity={0.8}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/wilaya/${wilaya.code}` as any);
      }}
    >
      <LinearGradient
        colors={[regionColor, regionColor + '60'] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wilayaRing}
      >
        <View style={[styles.wilayaCircle, { backgroundColor: colors.card }]}>
          <View style={[styles.wilayaInner, { backgroundColor: regionColor + '12' }]}>
            <Text style={styles.wilayaEmoji}>{wilaya.emoji}</Text>
          </View>
        </View>
      </LinearGradient>
      <Text style={[styles.wilayaName, { color: colors.text }]} numberOfLines={1}>
        {wilaya.name}
      </Text>
    </TouchableOpacity>
  );
}

// ── Destination Card (premium) ──
function DestinationCard({ dest }: { dest: any }) {
  const gradientColors = dest.gradient || ['#0a2540', '#061422'];
  const typeEmoji =
    dest.type === 'beach' ? '🏖️'
    : dest.type === 'desert' ? '🏜️'
    : dest.type === 'mountain' ? '⛰️'
    : dest.type === 'city' ? '🏙️'
    : '🏛️';
  return (
    <TouchableOpacity
      style={styles.destCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/destination/${dest.id}` as any);
      }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={gradientColors as [string, string]}
        style={styles.destGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circle */}
        <View style={styles.destDeco} />
        <View style={styles.destContent}>
          <Text style={styles.destEmoji}>{typeEmoji}</Text>
          <Text style={styles.destName}>{dest.name}</Text>
          <Text style={styles.destRegion}>
            {dest.region} · {dest.distance}
          </Text>
          <View style={styles.destBottomRow}>
            <View style={styles.destRatingRow}>
              <Ionicons name="star" size={10} color="#FFD166" />
              <Text style={styles.destRatingText}>{dest.rating}</Text>
            </View>
            <View style={styles.destArrow}>
              <Ionicons name="arrow-forward" size={10} color="rgba(255,255,255,0.5)" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────
export default function DiscoverScreen() {
  const { user, bookings, orders } = useApp();
  const { colors, isDark, toggleMode } = useTheme();
  const triggerOpen = useAIBubbleStore((s) => s.triggerOpen);
  const userLatitude = useLocationStore((s) => s.userLatitude);
  const userLongitude = useLocationStore((s) => s.userLongitude);
  const userAddress = useLocationStore((s) => s.userAddress);

  const [refreshing, setRefreshing] = useState(false);
  const [qaIndex, setQaIndex] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const onQaScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    setQaIndex(idx);
  }, []);

  // Greeting
  const firstName =
    user.name?.split(' ')[0] || user.kycData?.fullName?.split(' ')[0] || null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greetingText = firstName ? `${greeting}, ${firstName}! 👋` : `${greeting}! 👋`;

  // Map markers sorted by distance
  const mapMarkers: ServiceMarker[] = useMemo(() => {
    const active = MOCK_LISTINGS.filter((l) => l.is_active);
    const withDistance = active.map((l) => ({
      marker: l,
      dist:
        userLatitude != null && userLongitude != null
          ? haversineKm(userLatitude, userLongitude, l.coordinates.latitude, l.coordinates.longitude)
          : Infinity,
    }));
    withDistance.sort((a, b) => a.dist - b.dist);
    return withDistance.slice(0, 12).map(({ marker: l }) => ({
      id: l.id,
      latitude: l.coordinates.latitude,
      longitude: l.coordinates.longitude,
      title: l.title,
      subtitle: l.wilaya,
      category: l.category,
      rating: l.rating,
      priceDZD: l.price_dzd,
    }));
  }, [userLatitude, userLongitude]);

  const mapCenter: [number, number] | undefined = useMemo(() => {
    if (userLatitude != null && userLongitude != null) {
      return [userLongitude, userLatitude];
    }
    return undefined;
  }, [userLatitude, userLongitude]);

  // Top destinations sorted by rating
  const topDestinations = useMemo(
    () => [...DESTINATIONS].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [],
  );

  // Quick action press handler
  const handleQaPress = useCallback(
    (action: (typeof QUICK_ACTIONS)[0]) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (action.key === 'ai') {
        triggerOpen();
      } else if (action.route) {
        router.push(action.route as any);
      }
    },
    [triggerOpen],
  );

  // Active bookings list mapped for traveler widget
  const activeBookingsList = useMemo(() => {
    const list = bookings.filter((b) => b.status === 'active' || b.status === 'confirmed' || b.status === 'pending');
    // Map active orders
    const activeOrders = orders.filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'on_the_way');
    return [
      ...list.map((b) => ({
        id: b.id,
        type: b.type,
        title: b.title,
        subtitle: b.subtitle,
        status: b.status,
        color: b.type === 'hotel' ? '#1A6B3A' : b.type === 'beach' ? '#00a896' : b.type === 'driver' ? '#0a2540' : '#8B5CF6',
        icon: b.type === 'hotel' ? 'bed' : b.type === 'beach' ? 'umbrella' : b.type === 'driver' ? 'car' : 'bookmark',
        actionLabel: b.type === 'driver' ? 'Track Ride' : b.type === 'hotel' ? 'View Check-in' : b.type === 'beach' ? 'Open Spot Grid' : 'View Ticket',
        route: b.type === 'driver' ? '/services/ride' : b.type === 'beach' ? `/services/beach/spots?beachId=${b.businessId || 'sahel-beach-1'}` : '/(tabs)/trips',
      })),
      ...activeOrders.map((o) => ({
        id: o.id,
        type: 'restaurant',
        title: 'Food Delivery Order',
        subtitle: `${MOCK_LISTINGS.find((l) => l.id === o.beachId)?.title || 'Restaurant'} · Spot ${o.spotLabel || 'A3'}`,
        status: o.status === 'pending' ? 'Pending Kitchen' : o.status === 'preparing' ? 'Cooking' : 'Out for Delivery',
        color: '#C56A39',
        icon: 'restaurant',
        actionLabel: 'Track Kitchen',
        route: '/(tabs)/trips',
      })),
    ];
  }, [bookings, orders]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle={colors.statusBar} />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={[]}
        keyExtractor={(_, i) => i.toString()}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={RIHLA.accent}
            colors={[RIHLA.accent]}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── TOP BAR ── */}
            <View style={[styles.topBar, { backgroundColor: colors.bg }]}>
              <View style={styles.brandLockup}>
                <View style={styles.logoMark}>
                  <Ionicons name="airplane" size={14} color="#FFFFFF" />
                </View>
                <Text style={[styles.brandText, { color: colors.text }]}>RIHLA</Text>
              </View>
              <View style={styles.topBarRight}>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={toggleMode}
                >
                  <Ionicons
                    name={isDark ? 'sunny-outline' : 'moon-outline'}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push('/(modals)/settings' as any)}
                >
                  <Ionicons name="notifications-outline" size={20} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── GREETING ── */}
            <View style={styles.heroSection}>
              <Text style={[styles.greetingText, { color: colors.muted }]}>{greetingText}</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Where would you{'\n'}like to go?
              </Text>
            </View>

            {/* ── SEARCH BAR ── */}
            <Pressable
              style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/search' as any)}
            >
              <View style={styles.searchIconWrap}>
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.searchContent}>
                <Text style={[styles.searchPlaceholder, { color: colors.text }]}>
                  Search destinations, wilayas...
                </Text>
                <Text style={[styles.searchHint, { color: colors.muted }]}>
                  Hotels, restaurants, guides & more
                </Text>
              </View>
              <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
              <Pressable
                style={styles.searchFilter}
                onPress={(e) => {
                  e.stopPropagation?.();
                  router.push('/(modals)/filter' as any);
                }}
              >
                <Ionicons name="options-outline" size={18} color={RIHLA.accent} />
              </Pressable>
            </Pressable>

            {/* ── LIVE ACTIVE TRIP HUB WIDGET ── */}
            {activeBookingsList.length > 0 && (
              <View style={styles.activeHubSection}>
                <View style={styles.activeHubHeader}>
                  <View style={styles.activeHubTitleRow}>
                    <View style={styles.activeHubPulse} />
                    <Text style={[styles.activeHubTitle, { color: colors.text }]}>Live Active Hub</Text>
                  </View>
                  <Text style={[styles.activeHubCount, { color: colors.muted }]}>
                    {activeBookingsList.length} active
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.activeHubScroll}
                  snapToInterval={SCREEN_W - 40}
                  decelerationRate="fast"
                >
                  {activeBookingsList.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.activeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <View style={styles.activeCardTop}>
                        <View style={[styles.activeIconContainer, { backgroundColor: item.color + '15' }]}>
                          <Ionicons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <View style={styles.activeCardContent}>
                          <Text style={[styles.activeCardTitle, { color: colors.text }]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={[styles.activeCardSubtitle, { color: colors.muted }]} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        </View>
                        <View style={[styles.activeStatusBadge, { backgroundColor: item.color }]}>
                          <Text style={styles.activeStatusText}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.activeActionBtn, { backgroundColor: item.color }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          router.push(item.route as any);
                        }}
                      >
                        <Text style={styles.activeActionLabel}>{item.actionLabel}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* ── SWIPEABLE QUICK ACTIONS ── */}
            <View style={styles.section}>
              <ScrollView
                horizontal
                pagingEnabled={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.qaScroll}
                onMomentumScrollEnd={onQaScroll}
              >
                {QUICK_ACTIONS.map((action) => (
                  <QuickActionCard
                    key={action.key}
                    action={action}
                    onPress={() => handleQaPress(action)}
                  />
                ))}
              </ScrollView>
              {/* Pagination dots */}
              <View style={styles.qaDots}>
                {QUICK_ACTIONS.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.qaDot,
                      {
                        backgroundColor: i === qaIndex ? RIHLA.accent : colors.border,
                        width: i === qaIndex ? 18 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* ── FEATURED WILAYAS BUBBLES ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionDot, { backgroundColor: RIHLA.accent }]} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Wilaya</Text>
                </View>
                <Text style={[styles.sectionCount, { color: colors.muted }]}>
                  {FEATURED_WILAYAS.length} provinces
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.wilayaScroll}
              >
                {FEATURED_WILAYAS.map((wId) => (
                  <WilayaBubble key={wId} wilayaId={wId} colors={colors} />
                ))}
              </ScrollView>
            </View>

            {/* ── CATEGORIES (Grouped Service Bento Hub) ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionDot, { backgroundColor: '#6C63FF' }]} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore Marketplace Services</Text>
                </View>
              </View>
              
              <View style={styles.categorizedHub}>
                {/* 1. Stays & Stays */}
                <View style={[styles.hubGroup, { borderColor: colors.border }]}>
                  <Text style={[styles.hubGroupTitle, { color: colors.muted }]}>🛌 STAYS & ACCOMMODATION</Text>
                  <View style={styles.hubGrid}>
                    {MARKETPLACE_CATEGORIES.filter((c) => c.key === 'hotel' || c.key === 'rental').map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/marketplace/${cat.key}` as any);
                        }}
                      >
                        <View style={[styles.hubIconBg, { backgroundColor: cat.color + '15' }]}>
                          <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                        </View>
                        <View style={styles.hubCardContent}>
                          <Text style={[styles.hubCardLabel, { color: colors.text }]}>{cat.labelPlural}</Text>
                          <Text style={[styles.hubCardDesc, { color: colors.muted }]} numberOfLines={1}>{cat.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 2. Dining */}
                <View style={[styles.hubGroup, { borderColor: colors.border }]}>
                  <Text style={[styles.hubGroupTitle, { color: colors.muted }]}>🍽️ FOOD & DINING</Text>
                  <View style={styles.hubGrid}>
                    {MARKETPLACE_CATEGORIES.filter((c) => c.key === 'restaurant').map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.hubCardFull, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/marketplace/${cat.key}` as any);
                        }}
                      >
                        <View style={[styles.hubIconBg, { backgroundColor: cat.color + '15' }]}>
                          <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                        </View>
                        <View style={styles.hubCardContent}>
                          <Text style={[styles.hubCardLabel, { color: colors.text }]}>{cat.labelPlural}</Text>
                          <Text style={[styles.hubCardDesc, { color: colors.muted }]} numberOfLines={1}>{cat.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 3. Transport & Adventures */}
                <View style={[styles.hubGroup, { borderColor: colors.border }]}>
                  <Text style={[styles.hubGroupTitle, { color: colors.muted }]}>🚗 TRAVEL & TRANSFERS</Text>
                  <View style={styles.hubGrid}>
                    {MARKETPLACE_CATEGORIES.filter((c) => c.key === 'driver' || c.key === 'experience' || c.key === 'guide').map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/marketplace/${cat.key}` as any);
                        }}
                      >
                        <View style={[styles.hubIconBg, { backgroundColor: cat.color + '15' }]}>
                          <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                        </View>
                        <View style={styles.hubCardContent}>
                          <Text style={[styles.hubCardLabel, { color: colors.text }]}>{cat.labelPlural}</Text>
                          <Text style={[styles.hubCardDesc, { color: colors.muted }]} numberOfLines={1}>{cat.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* 4. Recreation & Fun */}
                <View style={[styles.hubGroup, { borderColor: colors.border }]}>
                  <Text style={[styles.hubGroupTitle, { color: colors.muted }]}>🎉 LEISURE, FUN & EVENTS</Text>
                  <View style={styles.hubGrid}>
                    {MARKETPLACE_CATEGORIES.filter((c) => c.key === 'beach' || c.key === 'activity' || c.key === 'event' || c.key === 'photographer').map((cat) => (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/marketplace/${cat.key}` as any);
                        }}
                      >
                        <View style={[styles.hubIconBg, { backgroundColor: cat.color + '15' }]}>
                          <Ionicons name={cat.icon as any} size={22} color={cat.color} />
                        </View>
                        <View style={styles.hubCardContent}>
                          <Text style={[styles.hubCardLabel, { color: colors.text }]}>{cat.labelPlural}</Text>
                          <Text style={[styles.hubCardDesc, { color: colors.muted }]} numberOfLines={1}>{cat.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* ── MAP (Nearby) ── */}
            <View style={styles.mapSection}>
              <View style={styles.mapSectionHeader}>
                <View style={styles.mapSectionTitleRow}>
                  <Ionicons name="location" size={16} color={RIHLA.accent} />
                  <Text style={[styles.mapSectionTitle, { color: colors.text }]}>
                    {userAddress ? `Near ${userAddress}` : 'Nearby places'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore' as any)}>
                  <Text style={styles.sectionLink}>Explore map</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.mapContainer, { borderColor: colors.border }]}>
                <MapWithDirections
                  markers={mapMarkers}
                  showDirections={false}
                  showUserLocation={true}
                  height={200}
                  initialCenter={mapCenter}
                  initialZoom={13}
                  onMarkerPress={(marker) => {
                    const listing = MOCK_LISTINGS.find((l) => l.id === marker.id);
                    if (listing) {
                      router.push(`/services/${listing.category}/${listing.id}` as any);
                    } else {
                      router.push(`/listing/${marker.id}` as any);
                    }
                  }}
                />
              </View>
            </View>

            {/* ── TOP DESTINATIONS ── */}
            <View style={[styles.section, { marginBottom: 20 }]}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Destinations</Text>
                </View>
                <Text style={[styles.sectionCount, { color: colors.muted }]}>
                  {topDestinations.length} places
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.destScroll}
              >
                {topDestinations.map((dest) => (
                  <DestinationCard key={dest.id} dest={dest} />
                ))}
              </ScrollView>
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
  root: { flex: 1 },

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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RIHLA.primary,
  },
  brandText: { fontSize: 18, fontFamily: 'mon-b', letterSpacing: 1.5 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  greetingText: { fontSize: 14, fontFamily: 'mon-sb', marginBottom: 6, letterSpacing: 0.2 },
  heroTitle: { fontSize: 30, fontFamily: 'mon-b', lineHeight: 38, letterSpacing: -0.5 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    height: 58,
    shadowColor: RIHLA.accent,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  searchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: RIHLA.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  searchContent: { flex: 1, paddingLeft: 12, gap: 2 },
  searchPlaceholder: { fontSize: 14, fontFamily: 'mon-sb' },
  searchHint: { fontSize: 11, fontFamily: 'mon' },
  searchDivider: { width: 1, height: 36 },
  searchFilter: { width: 50, height: 58, alignItems: 'center', justifyContent: 'center' },

  // Sections
  section: { paddingTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'mon-b', letterSpacing: -0.2 },
  sectionLink: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },
  sectionCount: { fontSize: 12, fontFamily: 'mon-sb' },

  // Quick Actions Carousel
  qaScroll: { paddingLeft: 20, paddingRight: 8, gap: CARD_GAP },
  qaCard: {
    width: CARD_W,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },
  qaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
  },
  qaEmoji: { fontSize: 36 },
  qaTextArea: { flex: 1, gap: 3 },
  qaTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },
  qaDesc: { fontSize: 11, fontFamily: 'mon', color: 'rgba(255,255,255,0.75)', lineHeight: 15 },
  qaArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  qaDot: {
    height: 6,
    borderRadius: 3,
  },

  // Wilayas
  wilayaScroll: { paddingLeft: 20, paddingRight: 12, gap: 16 },
  wilayaBubble: {
    alignItems: 'center',
    width: 80,
    gap: 7,
  },
  wilayaRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wilayaCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  wilayaInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wilayaEmoji: { fontSize: 26 },
  wilayaName: { fontSize: 11, fontFamily: 'mon-sb', textAlign: 'center' },

  // Categories (premium horizontal chips)
  categoriesScroll: { paddingLeft: 20, paddingRight: 12, gap: 10 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { fontSize: 13, fontFamily: 'mon-sb' },
  categoryArrow: {
    marginLeft: 2,
    opacity: 0.6,
  },

  // Map section
  mapSection: { paddingTop: 20, paddingHorizontal: 20 },
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapSectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mapSectionTitle: { fontSize: 15, fontFamily: 'mon-b' },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },

  // Destinations (premium)
  destScroll: { paddingLeft: 20, paddingRight: 12, gap: 12 },
  destCard: {
    width: 150,
    height: 195,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  destGradient: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
  },
  destDeco: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  destContent: { gap: 3 },
  destEmoji: { fontSize: 24, marginBottom: 6 },
  destName: { fontSize: 15, fontFamily: 'mon-b', color: '#FFFFFF' },
  destRegion: { fontSize: 11, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  destBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  destRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  destRatingText: { fontSize: 11, fontFamily: 'mon-b', color: '#FFD166' },
  destArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // List
  listContent: { paddingBottom: 100 },

  // Live Active Hub
  activeHubSection: {
    paddingTop: 18,
  },
  activeHubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activeHubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeHubPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  activeHubTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
    letterSpacing: -0.2,
  },
  activeHubCount: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  activeHubScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 12,
  },
  activeCard: {
    width: SCREEN_W - 40,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCardContent: {
    flex: 1,
    gap: 2,
  },
  activeCardTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
  },
  activeCardSubtitle: {
    fontSize: 12,
    fontFamily: 'mon',
  },
  activeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeStatusText: {
    fontSize: 9,
    fontFamily: 'mon-b',
    color: '#FFF',
  },
  activeActionBtn: {
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeActionLabel: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'mon-sb',
  },

  // Grouped Service Hub
  categorizedHub: {
    paddingHorizontal: 20,
    gap: 18,
  },
  hubGroup: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  hubGroupTitle: {
    fontSize: 11,
    fontFamily: 'mon-b',
    letterSpacing: 1,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hubCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hubCardFull: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hubIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubCardContent: {
    flex: 1,
    gap: 2,
  },
  hubCardLabel: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  hubCardDesc: {
    fontSize: 10,
    fontFamily: 'mon',
  },
});

