/**
 * RIHLA — Trips Tab (Premium Dual-Lane)
 * ──────────────────────────────────────
 * Two lanes: Bookings (service reservations) & Orders (transactional)
 * Features: Hero active card, animated lane tabs, status filters,
 *           enhanced trip cards with progress bars, stats dashboard
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Rect } from 'react-native-svg';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';
import type { MarketplaceCategory } from '@/types/service';
import type { BookingLane } from '@/types/booking';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Lane classification ──
const ORDER_TYPES = new Set(['driver', 'ride', 'food', 'restaurant', 'beach', 'spots']);

function getLane(booking: AppBooking): BookingLane {
  if (booking.lane) return booking.lane;
  return ORDER_TYPES.has(booking.type) ? 'order' : 'booking';
}

function mapBookingTypeToCategory(type: string): MarketplaceCategory {
  if (type === 'spots') return 'beach';
  if (type === 'food') return 'restaurant';
  if (type === 'ride') return 'driver';
  return type as MarketplaceCategory;
}

// ── Status types ──
type StatusFilter = 'all' | 'active' | 'upcoming' | 'completed' | 'cancelled';

const STATUS_FILTERS: { key: StatusFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'active', label: 'Active', icon: 'radio-outline' },
  { key: 'upcoming', label: 'Upcoming', icon: 'time-outline' },
  { key: 'completed', label: 'Done', icon: 'checkmark-circle-outline' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
];

// ── Main Screen ──
export default function TripsScreen() {
  const { colors, isDark } = useTheme();
  const {
    bookings,
    activeBookings,
    upcomingBookings,
    completedBookings,
    cancelledBookings,
    completeBooking,
    user,
  } = useApp();

  const [activeLane, setActiveLane] = useState<BookingLane>('booking');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [ticketBooking, setTicketBooking] = useState<AppBooking | null>(null);

  // Animated underline for lane tabs
  const laneAnim = useRef(new Animated.Value(0)).current;

  const switchLane = (lane: BookingLane) => {
    Haptics.selectionAsync();
    setActiveLane(lane);
    setStatusFilter('all');
    Animated.spring(laneAnim, {
      toValue: lane === 'booking' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // ── Filter by lane then status ──
  const laneBookings = useMemo(() => {
    return bookings.filter((b) => getLane(b) === activeLane);
  }, [bookings, activeLane]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return laneBookings;
    if (statusFilter === 'active')
      return laneBookings.filter((b) => b.status === 'active');
    if (statusFilter === 'upcoming')
      return laneBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
    if (statusFilter === 'completed')
      return laneBookings.filter((b) => b.status === 'completed');
    return laneBookings.filter((b) => b.status === 'cancelled');
  }, [laneBookings, statusFilter]);

  // ── Hero: first active trip in the current lane ──
  const heroBooking = useMemo(() => {
    return laneBookings.find((b) => b.status === 'active') || null;
  }, [laneBookings]);

  // ── Stats (per lane) ──
  const stats = useMemo(() => {
    const totalSpent = laneBookings
      .filter((b) => b.status === 'completed')
      .reduce((s, b) => s + b.price, 0);
    const activeCount = laneBookings.filter((b) => b.status === 'active').length;
    const completedCount = laneBookings.filter((b) => b.status === 'completed').length;
    return { total: laneBookings.length, activeCount, completedCount, totalSpent };
  }, [laneBookings]);

  // ── Lane counts for badges ──
  const bookingCount = useMemo(
    () => bookings.filter((b) => getLane(b) === 'booking').length,
    [bookings],
  );
  const orderCount = useMemo(
    () => bookings.filter((b) => getLane(b) === 'order').length,
    [bookings],
  );

  // Status filter counts
  const statusCounts = useMemo(() => {
    const active = laneBookings.filter((b) => b.status === 'active').length;
    const upcoming = laneBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
    const completed = laneBookings.filter((b) => b.status === 'completed').length;
    const cancelled = laneBookings.filter((b) => b.status === 'cancelled').length;
    return { all: laneBookings.length, active, upcoming, completed, cancelled };
  }, [laneBookings]);

  // Underline translation
  const underlineTranslate = laneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (SCREEN_W - 40) / 2],
  });

  // ── Handlers ──
  const handleBookingPress = (booking: AppBooking) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/booking/${booking.id}` as any);
  };

  const handleComplete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeBooking(id);
  };

  // ── Non-hero items (exclude hero from list) ──
  const listData = useMemo(() => {
    if (!heroBooking) return filteredBookings;
    return filteredBookings.filter((b) => b.id !== heroBooking.id);
  }, [filteredBookings, heroBooking]);

  // ── Render ──
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
            {/* ── Page Title ── */}
            <View style={styles.titleRow}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Your Trips</Text>
              <View style={[styles.tripsBadge, { backgroundColor: RIHLA.accent + '18' }]}>
                <Text style={styles.tripsBadgeText}>{bookings.length} total</Text>
              </View>
            </View>

            {/* ── Lane Tabs ── */}
            <View style={[styles.laneTabs, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.laneTab}
                onPress={() => switchLane('booking')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={16}
                  color={activeLane === 'booking' ? RIHLA.accent : colors.muted}
                />
                <Text
                  style={[
                    styles.laneTabText,
                    { color: activeLane === 'booking' ? colors.text : colors.muted },
                  ]}
                >
                  Bookings
                </Text>
                {bookingCount > 0 && (
                  <View style={[styles.laneCount, activeLane === 'booking' && styles.laneCountActive]}>
                    <Text style={[styles.laneCountText, activeLane === 'booking' && styles.laneCountTextActive]}>
                      {bookingCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.laneTab}
                onPress={() => switchLane('order')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cart-outline"
                  size={16}
                  color={activeLane === 'order' ? RIHLA.accent : colors.muted}
                />
                <Text
                  style={[
                    styles.laneTabText,
                    { color: activeLane === 'order' ? colors.text : colors.muted },
                  ]}
                >
                  Orders
                </Text>
                {orderCount > 0 && (
                  <View style={[styles.laneCount, activeLane === 'order' && styles.laneCountActive]}>
                    <Text style={[styles.laneCountText, activeLane === 'order' && styles.laneCountTextActive]}>
                      {orderCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Animated underline */}
              <Animated.View
                style={[
                  styles.laneUnderline,
                  { transform: [{ translateX: underlineTranslate }] },
                ]}
              />
            </View>

            {/* ── Stats Dashboard ── */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: isDark ? '#0A1F1C' : '#F0FDFA' }]}>
                <Ionicons name="layers-outline" size={18} color={RIHLA.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Total</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: isDark ? '#0D1A0F' : '#F0FDF4' }]}>
                <Ionicons name="radio-outline" size={18} color="#10B981" />
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.activeCount}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: isDark ? '#1A1507' : '#FFFBEB' }]}>
                <Ionicons name="wallet-outline" size={18} color="#F59E0B" />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.totalSpent > 0 ? `${(stats.totalSpent / 1000).toFixed(0)}k` : '0'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>DA Spent</Text>
              </View>
            </View>

            {/* ── Hero Active Card ── */}
            {heroBooking && statusFilter !== 'completed' && statusFilter !== 'cancelled' && (
              <HeroCard
                booking={heroBooking}
                onPress={() => handleBookingPress(heroBooking)}
                onComplete={() => handleComplete(heroBooking.id)}
              />
            )}

            {/* ── Status Filters ── */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={STATUS_FILTERS}
              keyExtractor={(f) => f.key}
              contentContainerStyle={styles.filterScroll}
              renderItem={({ item: filter }) => {
                const isActive = statusFilter === filter.key;
                const count = statusCounts[filter.key];
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setStatusFilter(filter.key);
                    }}
                    style={[
                      styles.filterChip,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isActive && {
                        backgroundColor: RIHLA.accent,
                        borderColor: RIHLA.accent,
                      },
                    ]}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={12}
                      color={isActive ? '#FFFFFF' : colors.muted}
                    />
                    <Text
                      style={[
                        styles.filterText,
                        { color: colors.muted },
                        isActive && { color: '#FFFFFF' },
                      ]}
                    >
                      {filter.label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.filterBadge,
                          {
                            backgroundColor: isActive
                              ? 'rgba(255,255,255,0.25)'
                              : colors.bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterBadgeText,
                            { color: isActive ? '#FFFFFF' : colors.muted },
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <LinearGradient
              colors={
                activeLane === 'booking'
                  ? ([RIHLA.accent + '20', RIHLA.primary + '20'] as [string, string])
                  : (['#F59E0B20', '#EF444420'] as [string, string])
              }
              style={styles.emptyCircle}
            >
              <Ionicons
                name={activeLane === 'booking' ? 'briefcase-outline' : 'cart-outline'}
                size={36}
                color={activeLane === 'booking' ? RIHLA.accent : '#F59E0B'}
              />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No {statusFilter === 'all' ? '' : statusFilter + ' '}
              {activeLane === 'booking' ? 'bookings' : 'orders'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>
              {activeLane === 'booking'
                ? 'Book hotels, guides, events and more to see them here.'
                : 'Order rides, food, or reserve beach spots to see them here.'}
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: RIHLA.accent }]}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
              <Text style={styles.exploreBtnText}>Explore Services</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TripCard
            booking={item}
            onPress={() => handleBookingPress(item)}
            onComplete={
              item.status === 'active' ? () => handleComplete(item.id) : undefined
            }
            onShowTicket={(b) => setTicketBooking(b)}
          />
        )}
      />

      {/* ── TICKET QR MODAL PASS OVERLAY ── */}
      {ticketBooking && (
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setTicketBooking(null)} />
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Digital Travel Ticket</Text>
              <TouchableOpacity
                onPress={() => { Haptics.selectionAsync(); setTicketBooking(null); }}
                style={[styles.closeModalBtn, { backgroundColor: colors.border }]}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalTicketCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <View style={[styles.modalTicketTop, { backgroundColor: catDefColors(ticketBooking) }]}>
                <Text style={styles.modalTicketTitle}>{ticketBooking.title}</Text>
                <Text style={styles.modalTicketSubtitle}>{ticketBooking.subtitle}</Text>
              </View>

              <View style={styles.modalTicketDetails}>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>PASSENGER</Text>
                  <Text style={[styles.modalVal, { color: colors.text }]}>{user.name || 'Traveler'}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>STATUS</Text>
                  <Text style={[styles.modalVal, { color: '#10B981' }]}>{ticketBooking.status.toUpperCase()}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>TOTAL DZD</Text>
                  <Text style={[styles.modalVal, { color: colors.text }]}>{ticketBooking.price.toLocaleString()} DA</Text>
                </View>
                {ticketBooking.details.ticket_tier && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>TIER</Text>
                    <Text style={[styles.modalVal, { color: RIHLA.accent }]}>{String(ticketBooking.details.ticket_tier)}</Text>
                  </View>
                )}
              </View>

              <View style={[styles.modalBarcodeSection, { borderTopColor: colors.border }]}>
                <Svg width="180" height="40" viewBox="0 0 180 40">
                  <Rect x="0" y="0" width="180" height="40" fill="#FFF" />
                  <Rect x="10" y="4" width="4" height="32" fill="#000" />
                  <Rect x="18" y="4" width="2" height="32" fill="#000" />
                  <Rect x="24" y="4" width="6" height="32" fill="#000" />
                  <Rect x="34" y="4" width="2" height="32" fill="#000" />
                  <Rect x="38" y="4" width="4" height="32" fill="#000" />
                  <Rect x="46" y="4" width="8" height="32" fill="#000" />
                  <Rect x="58" y="4" width="2" height="32" fill="#000" />
                  <Rect x="64" y="4" width="4" height="32" fill="#000" />
                  <Rect x="72" y="4" width="6" height="32" fill="#000" />
                  <Rect x="82" y="4" width="2" height="32" fill="#000" />
                  <Rect x="88" y="4" width="8" height="32" fill="#000" />
                  <Rect x="100" y="4" width="4" height="32" fill="#000" />
                  <Rect x="108" y="4" width="2" height="32" fill="#000" />
                  <Rect x="114" y="4" width="6" height="32" fill="#000" />
                  <Rect x="124" y="4" width="4" height="32" fill="#000" />
                  <Rect x="132" y="4" width="8" height="32" fill="#000" />
                  <Rect x="144" y="4" width="2" height="32" fill="#000" />
                  <Rect x="150" y="4" width="4" height="32" fill="#000" />
                  <Rect x="158" y="4" width="6" height="32" fill="#000" />
                  <Rect x="168" y="4" width="2" height="32" fill="#000" />
                </Svg>
                <Text style={styles.modalBarcodeText}>{String(ticketBooking.details.ticket_code || 'RL-298319')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function catDefColors(booking: AppBooking): string {
  const catKey = mapBookingTypeToCategory(booking.type);
  return getCategoryDef(catKey)?.color || RIHLA.accent;
}

// ── Hero Active Card ──────────────────────────────────────────────────
function HeroCard({
  booking,
  onPress,
  onComplete,
  onShowTicket,
}: {
  booking: AppBooking;
  onPress: () => void;
  onComplete: () => void;
  onShowTicket?: (booking: AppBooking) => void;
}) {
  const { colors, isDark } = useTheme();
  const catKey = mapBookingTypeToCategory(booking.type);
  const catDef = getCategoryDef(catKey);
  const catColor = catDef?.color || RIHLA.accent;

  // Progress: time-based estimation
  const progress = useMemo(() => {
    if (!booking.expiresAt || !booking.createdAt) return 0.5;
    const start = new Date(booking.createdAt).getTime();
    const end = new Date(booking.expiresAt).getTime();
    const now = Date.now();
    if (now >= end) return 1;
    if (now <= start) return 0;
    return (now - start) / (end - start);
  }, [booking.createdAt, booking.expiresAt]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.heroCard}
    >
      <LinearGradient
        colors={[catColor, catColor + 'CC'] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        {/* Live badge */}
        <View style={styles.heroLiveBadge}>
          <View style={styles.heroLiveDot} />
          <Text style={styles.heroLiveText}>LIVE NOW</Text>
        </View>

        {/* Content */}
        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Ionicons name={catDef?.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {booking.title}
            </Text>
            <Text style={styles.heroSubtitle} numberOfLines={1}>
              {booking.subtitle}
            </Text>
          </View>
          <Text style={styles.heroPrice}>{booking.price.toLocaleString()} DA</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.heroProgressTrack}>
          <View
            style={[
              styles.heroProgressFill,
              { width: `${Math.min(progress * 100, 100)}%` },
            ]}
          />
        </View>
        <View style={styles.heroProgressLabels}>
          <Text style={styles.heroProgressText}>
            {Math.round(progress * 100)}% complete
          </Text>
          {booking.expiresAt && (
            <Text style={styles.heroProgressText}>
              Ends{' '}
              {new Date(booking.expiresAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.heroActions}>
          <TouchableOpacity style={styles.heroActionBtn} onPress={onPress}>
            <Ionicons name="eye-outline" size={14} color="#FFFFFF" />
            <Text style={styles.heroActionText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.heroActionBtn, styles.heroCompleteBtn]}
            onPress={onComplete}
          >
            <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
            <Text style={[styles.heroActionText, { color: '#10B981' }]}>Complete</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Trip Card Component ──────────────────────────────────────────────
function TripCard({
  booking,
  onPress,
  onComplete,
  onShowTicket,
}: {
  booking: AppBooking;
  onPress: () => void;
  onComplete?: () => void;
  onShowTicket?: (booking: AppBooking) => void;
}) {
  const { colors, isDark } = useTheme();
  const catKey = mapBookingTypeToCategory(booking.type);
  const catDef = getCategoryDef(catKey);
  const catColor = catDef?.color || RIHLA.primary;

  const statusCfg = (() => {
    const map: Record<string, { color: string; bg: string; label: string }> = {
      active: { color: '#10B981', bg: isDark ? '#0D1A0F' : '#DCFCE7', label: 'Active' },
      confirmed: { color: '#3B82F6', bg: isDark ? '#0D1520' : '#DBEAFE', label: 'Upcoming' },
      pending: { color: '#F59E0B', bg: isDark ? '#1A1507' : '#FEF3C7', label: 'Pending' },
      completed: { color: colors.muted, bg: isDark ? '#1A1A1A' : '#F1F5F9', label: 'Completed' },
      cancelled: { color: '#EF4444', bg: isDark ? '#1A0D0D' : '#FEE2E2', label: 'Cancelled' },
    };
    return map[booking.status] || map.completed;
  })();

  const isActive = booking.status === 'active';
  const isCompleted = booking.status === 'completed';

  const rawDate =
    booking.details.date || booking.details.check_in || booking.details.event_date;
  const bookingDate =
    typeof rawDate === 'string' || typeof rawDate === 'number'
      ? rawDate
      : booking.createdAt;
  const dateStr = new Date(bookingDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      {/* Gradient header strip */}
      <LinearGradient
        colors={[catColor, catColor + '80'] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderIcon}>
          <Ionicons name={catDef?.icon as any} size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.cardHeaderCategory}>
          {catDef?.label || booking.type}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <View style={[styles.statusDot, { backgroundColor: '#FFFFFF' }]} />
          <Text style={styles.statusLabelWhite}>{statusCfg.label}</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardBody}>
        {/* Title row */}
        <View style={styles.cardTitleRow}>
          <View style={styles.cardTitleArea}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {booking.title}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]} numberOfLines={1}>
              {booking.subtitle}
            </Text>
          </View>
        </View>

        {/* Detail chips */}
        <View style={styles.detailChips}>
          <View style={[styles.detailChip, { backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9' }]}>
            <Ionicons name="calendar-outline" size={11} color={colors.muted} />
            <Text style={[styles.detailChipText, { color: colors.muted }]}>{dateStr}</Text>
          </View>
          {booking.price > 0 && (
            <View style={[styles.detailChip, { backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9' }]}>
              <Ionicons name="wallet-outline" size={11} color={catColor} />
              <Text style={[styles.detailChipText, { color: catColor, fontFamily: 'mon-b' }]}>
                {booking.price.toLocaleString()} DA
              </Text>
            </View>
          )}
          {isActive && (
            <View style={[styles.detailChip, { backgroundColor: '#10B98110' }]}>
              <View style={styles.liveMiniDot} />
              <Text style={[styles.detailChipText, { color: '#10B981' }]}>In Progress</Text>
            </View>
          )}
        </View>

        {/* Key details preview */}
        <View style={[styles.detailPreview, { backgroundColor: isDark ? '#0D0D0D' : '#F8FAFC' }]}>
          {Object.entries(booking.details)
            .slice(0, 3)
            .map(([key, value]) => (
              <View key={key} style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.muted }]}>
                  {key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>
                  {String(value)}
                </Text>
              </View>
            ))}
        </View>

        {/* Bottom actions */}
        <View style={styles.cardBottom}>
          <TouchableOpacity
            style={[styles.viewBtn, { backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9' }]}
            onPress={onPress}
          >
            <Text style={[styles.viewBtnText, { color: RIHLA.accent }]}>Details</Text>
            <Ionicons name="chevron-forward" size={12} color={RIHLA.accent} />
          </TouchableOpacity>

          {/* Category-Specific Dynamic Action Buttons */}
          {!isCompleted && booking.status !== 'cancelled' && (
            <>
              {(catKey === 'event' || catKey === 'activity' || catKey === 'experience') && onShowTicket && (
                <TouchableOpacity
                  style={[styles.actionBadgeBtn, { borderColor: catColor + '50', backgroundColor: catColor + '12' }]}
                  onPress={() => onShowTicket(booking)}
                >
                  <Ionicons name="qr-code-outline" size={13} color={catColor} />
                  <Text style={[styles.actionBadgeBtnText, { color: catColor }]}>Show Ticket</Text>
                </TouchableOpacity>
              )}

              {catKey === 'driver' && (
                <TouchableOpacity
                  style={[styles.actionBadgeBtn, { borderColor: '#10B98150', backgroundColor: '#10B98112' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    alert(`Driver Karim is en route!\nVehicle: Dacia Logan\nLicense: 02849-116-16\nETA: 3 minutes.`);
                  }}
                >
                  <Ionicons name="car-outline" size={13} color="#10B981" />
                  <Text style={[styles.actionBadgeBtnText, { color: '#10B981' }]}>Track Ride</Text>
                </TouchableOpacity>
              )}

              {catKey === 'restaurant' && (
                <TouchableOpacity
                  style={[styles.actionBadgeBtn, { borderColor: '#F59E0B50', backgroundColor: '#F59E0B12' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    alert(`Kitchen Update:\nPreparing your order.\nStatus: Preparing meal... 🍕`);
                  }}
                >
                  <Ionicons name="restaurant-outline" size={13} color="#F59E0B" />
                  <Text style={[styles.actionBadgeBtnText, { color: '#F59E0B' }]}>Track Food</Text>
                </TouchableOpacity>
              )}

              {(catKey === 'hotel' || catKey === 'rental') && (
                <TouchableOpacity
                  style={[styles.actionBadgeBtn, { borderColor: RIHLA.primary + '50', backgroundColor: RIHLA.primary + '12' }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    alert(`Directions:\nStandard GPS directions opened to ${booking.title}.`);
                  }}
                >
                  <Ionicons name="map-outline" size={13} color={RIHLA.primary} />
                  <Text style={[styles.actionBadgeBtnText, { color: RIHLA.primary }]}>Directions</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {isCompleted && (
            <TouchableOpacity
              style={[styles.rebookBtn, { borderColor: RIHLA.accent + '40' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/explore' as any);
              }}
            >
              <Ionicons name="refresh-outline" size={14} color={RIHLA.accent} />
              <Text style={styles.rebookBtnText}>Re-book</Text>
            </TouchableOpacity>
          )}

          {isActive && onComplete && (
            <TouchableOpacity
              style={[styles.completeBtn, { borderColor: '#10B98140' }]}
              onPress={onComplete}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
              <Text style={styles.completeBtnText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  listContent: { paddingBottom: 120 },

  // Title
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'mon-b',
    letterSpacing: -0.3,
  },
  tripsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripsBadgeText: {
    fontSize: 11,
    fontFamily: 'mon-b',
    color: RIHLA.accent,
  },

  // Lane tabs
  laneTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  laneTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  laneTabText: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  laneCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    backgroundColor: 'rgba(136,136,136,0.15)',
  },
  laneCountActive: {
    backgroundColor: RIHLA.accent + '25',
  },
  laneCountText: {
    fontSize: 10,
    fontFamily: 'mon-b',
    color: '#888888',
  },
  laneCountTextActive: {
    color: RIHLA.accent,
  },
  laneUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50%',
    height: 3,
    backgroundColor: RIHLA.accent,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: 14,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'mon-b',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'mon',
  },

  // Status filters
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 6,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 9,
    fontFamily: 'mon-b',
  },

  // Hero card
  heroCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  heroGradient: {
    padding: 18,
    gap: 14,
  },
  heroLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF66',
  },
  heroLiveText: {
    fontSize: 10,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: 'mon',
    color: 'rgba(255,255,255,0.75)',
  },
  heroPrice: {
    fontSize: 15,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },
  heroProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  heroProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroProgressText: {
    fontSize: 10,
    fontFamily: 'mon-sb',
    color: 'rgba(255,255,255,0.7)',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroCompleteBtn: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  heroActionText: {
    fontSize: 12,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },

  // Trip Cards
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderCategory: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusLabelWhite: {
    fontSize: 10,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  cardBody: {
    padding: 14,
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleArea: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'mon',
  },

  // Details
  detailChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailChipText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  liveMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  detailPreview: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: {
    fontSize: 11,
    fontFamily: 'mon',
    flex: 1,
  },
  detailVal: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    textAlign: 'right',
    flex: 1,
  },

  // Bottom actions
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewBtnText: {
    fontSize: 12,
    fontFamily: 'mon-b',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: RIHLA.accent + '08',
  },
  rebookBtnText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: RIHLA.accent,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#10B98108',
  },
  completeBtnText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#10B981',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'mon-b',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'mon',
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },

  // Category Actions
  actionBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBadgeBtnText: {
    fontSize: 11,
    fontFamily: 'mon-b',
  },

  // Ticket Modal Styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  closeModalBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTicketCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalTicketTop: {
    padding: 16,
    alignItems: 'center',
    gap: 2,
  },
  modalTicketTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#FFF',
    textAlign: 'center',
  },
  modalTicketSubtitle: {
    fontSize: 11,
    fontFamily: 'mon',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  modalTicketDetails: {
    padding: 16,
    gap: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 9,
    fontFamily: 'mon-b',
    color: '#64748B',
  },
  modalVal: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  modalBarcodeSection: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#FAFAFA',
  },
  modalBarcodeText: {
    fontSize: 9,
    fontFamily: 'mon',
    letterSpacing: 2,
    color: '#334155',
    marginTop: 4,
  },
});
