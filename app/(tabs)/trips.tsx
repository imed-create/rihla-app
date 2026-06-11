/**
 * RIHLA — Trips Tab (Uber Premium Style)
 * ────────────────────────────────────────
 * 4 segments: Upcoming, Active, Completed, Cancelled
 * Stats summary, category filter, pull-to-refresh, re-book CTA
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { AppBooking } from '@/types/app';

// ── Types ──
type SegmentKey = 'upcoming' | 'active' | 'completed' | 'cancelled';

const SEGMENTS: { key: SegmentKey; label: string; icon: string }[] = [
  { key: 'upcoming', label: 'Upcoming', icon: 'time-outline' },
  { key: 'active', label: 'Active', icon: 'radio-outline' },
  { key: 'completed', label: 'Done', icon: 'checkmark-circle-outline' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active: { color: '#10B981', bg: '#DCFCE7' },
  confirmed: { color: '#F59E0B', bg: '#FEF3C7' },
  pending: { color: '#F59E0B', bg: '#FEF3C7' },
  completed: { color: '#64748B', bg: '#F1F5F9' },
  cancelled: { color: '#EF4444', bg: '#FEE2E2' },
};

const CATEGORIES = [
  'all', 'hotel', 'restaurant', 'beach', 'driver', 'activity',
  'event', 'guide', 'photographer', 'rental', 'experience',
];

// ── Main Screen ──
export default function TripsScreen() {
  const {
    bookings,
    activeBookings,
    upcomingBookings,
    completedBookings,
    cancelledBookings,
    completeBooking,
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<SegmentKey>('active');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // ── Filtered bookings per segment ──
  const segmentBookings = useMemo(() => {
    const base =
      activeSegment === 'upcoming' ? upcomingBookings
      : activeSegment === 'active' ? activeBookings.filter((b) => b.status === 'active')
      : activeSegment === 'completed' ? completedBookings
      : cancelledBookings;

    if (categoryFilter === 'all') return base;
    return base.filter((b) => b.type === categoryFilter);
  }, [activeSegment, categoryFilter, upcomingBookings, activeBookings, completedBookings, cancelledBookings]);

  // ── Stats ──
  const stats = useMemo(() => {
    const totalSpent = completedBookings.reduce((s, b) => s + b.price, 0);
    const topCategory = bookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.type] = (acc[b.type] || 0) + 1;
      return acc;
    }, {});
    const topCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];
    return {
      totalTrips: bookings.length,
      totalSpent,
      topCategory: topCat ? getCategoryDef(topCat[0] as any)?.label || topCat[0] : '—',
      topCategoryIcon: topCat ? getCategoryDef(topCat[0] as any)?.icon || 'star' : 'star',
      topCategoryColor: topCat ? getCategoryDef(topCat[0] as any)?.color || RIHLA.accent : RIHLA.accent,
    };
  }, [bookings, completedBookings]);

  // ── Handlers ──
  const handleSegmentChange = (key: SegmentKey) => {
    Haptics.selectionAsync();
    setActiveSegment(key);
    setCategoryFilter('all');
  };

  const handleBookingPress = (booking: AppBooking) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/booking/${booking.id}` as any);
  };

  const handleComplete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeBooking(id);
  };

  const segmentCount = (key: SegmentKey) => {
    if (key === 'upcoming') return upcomingBookings.length;
    if (key === 'active') return activeBookings.filter((b) => b.status === 'active').length;
    if (key === 'completed') return completedBookings.length;
    return cancelledBookings.length;
  };

  // ── Render ──
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={segmentBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={RIHLA.primary}
            colors={[RIHLA.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Header ── */}
            <Text style={styles.headerTitle}>Your Trips</Text>

            {/* ── Stats Row ── */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.totalTrips}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stats.totalSpent > 0 ? `${(stats.totalSpent / 1000).toFixed(0)}k` : '0'}
                </Text>
                <Text style={styles.statLabel}>Spent (DA)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCard}>
                <Ionicons name={stats.topCategoryIcon as any} size={16} color={stats.topCategoryColor} />
                <Text style={[styles.statValue, { fontSize: 13, marginTop: 2 }]}>{stats.topCategory}</Text>
                <Text style={styles.statLabel}>Top Category</Text>
              </View>
            </View>

            {/* ── Segment Tabs ── */}
            <View style={styles.segmentRow}>
              {SEGMENTS.map((seg) => {
                const count = segmentCount(seg.key);
                const isActive = activeSegment === seg.key;
                return (
                  <TouchableOpacity
                    key={seg.key}
                    activeOpacity={0.8}
                    onPress={() => handleSegmentChange(seg.key)}
                    style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  >
                    <Ionicons
                      name={seg.icon as any}
                      size={14}
                      color={isActive ? '#FFFFFF' : '#94A3B8'}
                    />
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {seg.label}
                    </Text>
                    {count > 0 && (
                      <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                        <Text style={[styles.countText, isActive && styles.countTextActive]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Category Filter ── */}
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={(c) => c}
              contentContainerStyle={styles.categoryRow}
              renderItem={({ item: cat }) => {
                const catDef = getCategoryDef(cat === 'all' ? 'hotel' : cat as any);
                const isActive = categoryFilter === cat;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => { Haptics.selectionAsync(); setCategoryFilter(cat); }}
                    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  >
                    {cat !== 'all' && (
                      <Ionicons
                        name={(catDef?.icon || 'grid') as any}
                        size={12}
                        color={isActive ? '#FFFFFF' : '#64748B'}
                      />
                    )}
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                      {cat === 'all' ? 'All' : catDef?.label || cat}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons
                name={(SEGMENTS.find((s) => s.key === activeSegment)?.icon || 'calendar-outline') as any}
                size={36}
                color="#CBD5E1"
              />
            </View>
            <Text style={styles.emptyTitle}>No {activeSegment} trips</Text>
            <Text style={styles.emptySub}>
              {activeSegment === 'upcoming'
                ? 'Book a service to see upcoming trips here.'
                : activeSegment === 'active'
                ? 'No active trips right now. Explore services!'
                : activeSegment === 'completed'
                ? 'Completed trips will appear here.'
                : 'Cancelled trips will appear here.'}
            </Text>
            {(activeSegment === 'upcoming' || activeSegment === 'active') && (
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push('/(tabs)' as any)}
              >
                <Ionicons name="compass-outline" size={16} color="#FFFFFF" />
                <Text style={styles.exploreBtnText}>Explore Services</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TripCard
            booking={item}
            onPress={() => handleBookingPress(item)}
            onComplete={
              item.status === 'active' ? () => handleComplete(item.id) : undefined
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

// ── Trip Card Component ──
function TripCard({
  booking,
  onPress,
  onComplete,
}: {
  booking: AppBooking;
  onPress: () => void;
  onComplete?: () => void;
}) {
  const catDef = getCategoryDef(booking.type as any);
  const catColor = catDef?.color || RIHLA.primary;
  const statusCfg = STATUS_COLORS[booking.status] || STATUS_COLORS.completed;
  const isActive = booking.status === 'active';
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'pending';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      {/* Color accent strip */}
      <View style={[styles.cardAccent, { backgroundColor: catColor }]} />

      <View style={styles.cardBody}>
        {/* Top row: icon + title + status */}
        <View style={styles.cardTop}>
          <View style={[styles.cardIconWrap, { backgroundColor: catColor + '12' }]}>
            <Ionicons name={catDef?.icon as any} size={20} color={catColor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{booking.title}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{booking.subtitle}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
              {booking.status === 'confirmed' ? 'Upcoming'
                : booking.status === 'pending' ? 'Pending'
                : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Detail chips */}
        <View style={styles.detailChips}>
          <View style={styles.detailChip}>
            <Ionicons name="calendar-outline" size={11} color="#64748B" />
            <Text style={styles.detailChipText}>{dateStr}</Text>
          </View>
          {booking.price > 0 && (
            <View style={styles.detailChip}>
              <Ionicons name="wallet-outline" size={11} color="#64748B" />
              <Text style={[styles.detailChipText, { color: catColor, fontFamily: 'mon-b' }]}>
                {booking.price.toLocaleString()} DA
              </Text>
            </View>
          )}
          {isActive && booking.expiresAt && (
            <View style={styles.detailChip}>
              <Ionicons name="time-outline" size={11} color="#10B981" />
              <Text style={[styles.detailChipText, { color: '#10B981' }]}>In Progress</Text>
            </View>
          )}
        </View>

        {/* Key details preview */}
        <View style={styles.detailPreview}>
          {Object.entries(booking.details).slice(0, 3).map(([key, value]) => (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailKey}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
              <Text style={styles.detailVal}>{String(value)}</Text>
            </View>
          ))}
        </View>

        {/* Bottom actions */}
        <View style={styles.cardBottom}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={onPress}
          >
            <Text style={styles.viewBtnText}>View Details</Text>
            <Ionicons name="chevron-forward" size={14} color={RIHLA.primary} />
          </TouchableOpacity>

          {isCompleted && (
            <TouchableOpacity
              style={styles.rebookBtn}
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
            <TouchableOpacity style={styles.completeBtn} onPress={onComplete}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
              <Text style={styles.completeBtnText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { paddingBottom: 120 },

  // Header
  headerTitle: {
    fontSize: 28,
    fontFamily: 'mon-b',
    color: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    letterSpacing: -0.3,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'mon',
    color: '#94A3B8',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },

  // Segments
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentBtnActive: {
    backgroundColor: '#0d0d0d',
    borderColor: '#0d0d0d',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#94A3B8',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countText: {
    fontSize: 10,
    fontFamily: 'mon-b',
    color: '#64748B',
  },
  countTextActive: {
    color: '#FFFFFF',
  },

  // Category filter
  categoryRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: RIHLA.primary,
    borderColor: RIHLA.primary,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: RIHLA.primary,
  },
  exploreBtnText: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },

  // ── Trip Card ──
  card: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 10,
  },

  // Card top
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#0F172A',
    lineHeight: 18,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 10,
    fontFamily: 'mon-b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Detail chips
  detailChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  detailChipText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#64748B',
  },

  // Detail preview
  detailPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: {
    fontSize: 11,
    fontFamily: 'mon',
    color: '#94A3B8',
    flex: 1,
  },
  detailVal: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#475569',
    textAlign: 'right',
    flex: 1,
  },

  // Card bottom actions
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
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  viewBtnText: {
    fontSize: 12,
    fontFamily: 'mon-b',
    color: RIHLA.primary,
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RIHLA.accent + '40',
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
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981' + '40',
    backgroundColor: '#10B981' + '08',
  },
  completeBtnText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#10B981',
  },
});
