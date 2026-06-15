import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpotCell from '@/components/beach/SpotCell';
import SpotHoldBanner from '@/components/beach/SpotHoldBanner';
import ZoneTabs from '@/components/beach/ZoneTabs';
import { showToast } from '@/components/Toast';
import { SandSpot, SandZoneId, ZONE_CONFIG, makeZoneSpots } from '@/constants/beachLayout';
import { sandIdToZoneType } from '@/types/beach';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { useBeachOccupancy } from '@/hooks/useBeachOccupancy';
import { bookingHref } from '@/utils/router';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticHeavy, hapticSuccess } from '@/utils/haptics';

const PRICES: Record<SandZoneId, number> = {
  family: 1000,
  vip: 3000,
  free: 0,
};

export default function SpotsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const { occupiedSpotIds } = useBeachOccupancy();

  const [zone, setZone] = useState<SandZoneId>('family');
  const [spot, setSpot] = useState<SandSpot | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const spots = useMemo(() => makeZoneSpots(zone, ZONE_CONFIG[zone].spots), [zone]);
  const occupied = useMemo(() => new Set(occupiedSpotIds), [occupiedSpotIds]);
  const price = spot ? PRICES[zone] : 0;
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;

  const handleSelect = useCallback(
    (s: SandSpot) => {
      if (occupied.has(s.id) && spot?.id !== s.id) return;
      if (spot?.id === s.id) {
        setSpot(null);
        setHoldExpiresAt(null);
        return;
      }
      setSpot(s);
      setZone(s.zone);
      if (s.zone !== 'free') {
        setHoldExpiresAt(new Date(Date.now() + 20 * 60 * 1000).toISOString());
      } else {
        setHoldExpiresAt(null);
      }
    },
    [occupied, spot]
  );

  const handleBook = async () => {
    if (!spot) return;
    setLoading(true);
    hapticHeavy();
    await new Promise((r) => setTimeout(r, 600));
    const booking = addBooking({
      type: 'spots',
      icon: 'umbrella-outline',
      iconFamily: 'Ionicons',
      color: RIHLA.accent,
      title: `${ZONE_CONFIG[zone].label} · ${spot.id}`,
      subtitle: `${sandIdToZoneType(zone)} zone · Spot ${spot.id}`,
      price,
      expiresAt: zone !== 'free' ? holdExpiresAt ?? undefined : undefined,
      beachId: 'sidi-fredj',
      details: { zone, spotId: spot.id, zoneLabel: ZONE_CONFIG[zone].label },
    });
    setLoading(false);
    hapticSuccess();
    showToast('Booking confirmed!', 'success');
    router.push(bookingHref(booking.id));
  };

  const renderSpot = useCallback(
    ({ item }: { item: SandSpot }) => {
      let state: 'available' | 'selected' | 'occupied' = 'available';
      if (occupied.has(item.id) && spot?.id !== item.id) state = 'occupied';
      else if (spot?.id === item.id) state = 'selected';
      return (
        <SpotCell
          spot={item}
          state={state}
          isVip={zone === 'vip'}
          onPress={handleSelect}
        />
      );
    },
    [occupied, spot, zone, handleSelect]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={[RIHLA.primary, RIHLA.accent]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Beach Spots</Text>
        <Text style={styles.headerSub}>Tap to select · tap again to deselect</Text>
      </LinearGradient>

      {spot && holdExpiresAt && zone !== 'free' && (
        <SpotHoldBanner
          spotId={spot.id}
          expiresAt={holdExpiresAt}
          onExpired={() => {
            setSpot(null);
            setHoldExpiresAt(null);
          }}
        />
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ZoneTabs active={zone} onChange={(z) => { setZone(z); setSpot(null); setHoldExpiresAt(null); }} />

        <View style={styles.legend}>
          <Legend label="Available" color={colors.card} border={colors.border} />
          <Legend label="Selected" color={RIHLA.primary} border={RIHLA.primary} />
          <Legend label="Taken" color={colors.border} border={colors.border} text={colors.muted} />
        </View>

        <FlatList
          data={spots}
          keyExtractor={(s) => s.id}
          renderItem={renderSpot}
          numColumns={4}
          scrollEnabled={false}
          columnWrapperStyle={styles.gridRow}
        />
      </ScrollView>

      {spot && (
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          style={[styles.bar, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}
        >
          <View style={styles.barLeft}>
            <Text style={[styles.barSpot, { color: colors.text }]}>{spot.id}</Text>
            <View style={[styles.badge, { backgroundColor: colors.muted }]}>
              <Text style={styles.badgeText}>{ZONE_CONFIG[zone].label}</Text>
            </View>
          </View>
          <Text style={styles.barPrice}>
            {price === 0 ? 'FREE' : `${price.toLocaleString()} DZD`}
          </Text>
          <Pressable
            style={[styles.bookBtn, loading && { opacity: 0.7 }]}
            onPress={handleBook}
            disabled={loading}
          >
            <Text style={styles.bookBtnText}>{loading ? '…' : 'Book Now'}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

function Legend({
  label,
  color,
  border,
  text,
}: {
  label: string;
  color: string;
  border: string;
  text?: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color, borderColor: border }]} />
      <Text style={[styles.legendLabel, text ? { color: text } : null]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  backBtn: { position: 'absolute', left: 16, top: 16, padding: 8 },
  headerTitle: { fontSize: 24, fontFamily: 'mon-b', color: '#fff', marginTop: 8 },
  headerSub: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  scroll: { padding: 16, gap: 8 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 2 },
  legendLabel: { fontSize: 11, fontFamily: 'mon' },
  gridRow: { gap: 8, marginBottom: 8 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  barLeft: { flex: 1, gap: 4 },
  barSpot: { fontSize: 16, fontFamily: 'mon-b' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.primary },
  barPrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary },
  bookBtn: {
    backgroundColor: RIHLA.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: { color: '#fff', fontFamily: 'mon-b', fontSize: 14 },
});
