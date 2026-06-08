/**
 * RIHLA — Driver Detail Screen
 * Vehicle info, routes, per-km pricing, airport transfer, booking
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { DriverMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

const VEHICLE_ICONS: Record<string, string> = { sedan: '🚗', suv: '🚙', van: '🚐', bus: '🚌', luxury: '🏎️' };

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);

  if (!listing || listing.category !== 'driver') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <View style={styles.notFound}>
          <Ionicons name="car-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Driver not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as DriverMetadata;

  return (
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#F59E0B', RIHLA.primary]} style={styles.hero}>
            <View style={styles.heroNav}>
              <Pressable style={styles.backCircle} onPress={() => safeGoBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.actionCircle}><Ionicons name="share-outline" size={20} color="#fff" /></Pressable>
                <Pressable style={styles.actionCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </Pressable>
              </View>
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>{VEHICLE_ICONS[m.vehicle_type] || '🚗'}</Text>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.heroRatingText}>{listing.rating}</Text>
                <Text style={styles.heroReviewCount}>({listing.review_count} reviews)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Vehicle info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          <View style={styles.vehicleCard}>
            <Text style={styles.vehicleEmoji}>{VEHICLE_ICONS[m.vehicle_type] || '🚗'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName}>{m.vehicle_name}</Text>
              <Text style={styles.vehicleType}>{m.vehicle_type.charAt(0).toUpperCase() + m.vehicle_type.slice(1)}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="pricetag-outline" size={18} color={RIHLA.accent} />
            <Text style={styles.statValue}>{m.price_per_km_dzd} DZD</Text>
            <Text style={styles.statLabel}>Per km</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="airplane-outline" size={18} color={m.airport_transfer ? RIHLA.accent : '#CBD5E1'} />
            <Text style={styles.statValue}>{m.airport_transfer ? 'Available' : 'No'}</Text>
            <Text style={styles.statLabel}>Airport</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={18} color={m.multi_day_hire ? RIHLA.accent : '#CBD5E1'} />
            <Text style={styles.statValue}>{m.multi_day_hire ? 'Yes' : 'No'}</Text>
            <Text style={styles.statLabel}>Multi-day</Text>
          </View>
        </View>

        {/* Fixed routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fixed Routes</Text>
          <View style={styles.routeList}>
            {m.fixed_routes.map((route, i) => (
              <Pressable key={i}
                style={[styles.routeCard, selectedRoute === i && styles.routeSelected]}
                onPress={() => { setSelectedRoute(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <View style={styles.routeInfo}>
                  <View style={styles.routeEndpoints}>
                    <View style={styles.routePoint}>
                      <View style={styles.routeDot} />
                      <Text style={styles.routeFrom}>{route.from}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: RIHLA.accent }]} />
                      <Text style={styles.routeTo}>{route.to}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.routePriceWrap}>
                  <Text style={styles.routePrice}>{route.price_dzd.toLocaleString()} DZD</Text>
                </View>
                {selectedRoute === i && <Ionicons name="checkmark-circle" size={20} color={RIHLA.accent} style={{ position: 'absolute', top: 12, right: 12 }} />}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewHeader}><Ionicons name="star" size={18} color="#FFD166" /><Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text></View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{selectedRoute !== null ? m.fixed_routes[selectedRoute].price_dzd.toLocaleString() + ' DZD' : listing.price_dzd.toLocaleString() + ' DZD'}</Text>
          <Text style={styles.bottomUnit}>{selectedRoute !== null ? 'Fixed route' : 'starting price'}</Text>
        </View>
        <Pressable style={[styles.bookBtn, !selectedRoute && { opacity: 0.6 }]}
          onPress={() => { if (selectedRoute === null) { showToast('Select a route', 'info'); return; } hapticSuccess(); router.push(`/checkout/${listing.id}?price=${m.fixed_routes[selectedRoute].price_dzd}` as any); }}>
          <Text style={styles.bookBtnText}>Book Ride</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 4, alignItems: 'center' },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5, textAlign: 'center' },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 12 },
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 16 },
  vehicleEmoji: { fontSize: 36 },
  vehicleName: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  vehicleType: { fontSize: 12, fontFamily: 'mon', color: '#64748B', textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  routeList: { gap: 10 },
  routeCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: RIHLA.border, padding: 16, position: 'relative' },
  routeSelected: { borderColor: RIHLA.accent, backgroundColor: '#F0FDFA' },
  routeInfo: { flex: 1 },
  routeEndpoints: { gap: 0 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: RIHLA.primary },
  routeLine: { width: 2, height: 20, backgroundColor: RIHLA.border, marginLeft: 4 },
  routeFrom: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },
  routeTo: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },
  routePriceWrap: { position: 'absolute', bottom: 14, right: 16 },
  routePrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: RIHLA.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: { backgroundColor: RIHLA.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
