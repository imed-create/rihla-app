import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const VEHICLE_ICONS: Record<string, string> = { sedan: 'car-outline', suv: 'car-sport-outline', van: 'bus-outline', luxury: 'diamond-outline' };

export default function DriverListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myRoutes = useMemo(() => getMyAssets('driver', 'route'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = myRoutes.filter(r => {
    if (filter === 'available') return r.available;
    if (filter === 'unavailable') return !r.available;
    return true;
  });

  const stats = {
    total: myRoutes.length,
    available: myRoutes.filter(r => r.available).length,
    totalKm: myRoutes.reduce((s, r) => s + (r.fields.distance || 0), 0),
  };

  if (myRoutes.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Routes</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>KM</Text></View>
        </View>
        <EmptyState icon="car-outline" title="No routes yet" subtitle="Add your first route to start offering rides." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Routes</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalKm}</Text><Text style={styles.statLabel}>Total KM</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'available', 'unavailable'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const from = item.fields.from || '';
          const to = item.fields.to || '';
          const vehicle = item.fields.vehicleType as string || 'sedan';
          return (
            <View style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View style={styles.vehicleIcon}><Ionicons name={(VEHICLE_ICONS[vehicle] || 'car-outline') as any} size={22} color={RIHLA.primary} /></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.routePoints}>
                    <View style={styles.routeDot} />
                    <Text style={styles.routeFrom}>{from || '—'}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoints}>
                    <View style={[styles.routeDot, styles.routeDotEnd]} />
                    <Text style={styles.routeTo}>{to || '—'}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.routePrice}>{item.priceDZD.toLocaleString()}</Text>
                  <Text style={styles.routeUnit}>DZD</Text>
                </View>
              </View>
              <View style={styles.routeMeta}>
                {item.fields.distance ? (
                  <View style={styles.metaChip}><Ionicons name="speedometer-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.metaText}>{item.fields.distance} km</Text></View>
                ) : null}
                <View style={styles.metaChip}><Ionicons name="car-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.metaText}>{vehicle}</Text></View>
              </View>
              <View style={styles.actions}>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: RIHLA.accent + '60' }} thumbColor={item.available ? RIHLA.accent : '#94A3B8'} />
                <Text style={styles.availText}>{item.available ? 'Accepting rides' : 'Paused'}</Text>
                <TouchableOpacity style={styles.editBtn}><Ionicons name="create-outline" size={16} color={RIHLA.mutedText} /></TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText, textAlign: 'center' },
  statDiv: { width: 1, height: 32, backgroundColor: RIHLA.border, marginHorizontal: 4 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  filterTabActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  filterText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  filterTextActive: { color: '#fff' },
  routeCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  routeHeader: { flexDirection: 'row', gap: 12 },
  vehicleIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  routePoints: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: RIHLA.accent },
  routeDotEnd: { backgroundColor: '#EF4444' },
  routeLine: { width: 2, height: 16, backgroundColor: RIHLA.border, marginLeft: 4, marginVertical: 2 },
  routeFrom: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },
  routeTo: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },
  routePrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  routeUnit: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
  routeMeta: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  availText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  editBtn: { marginLeft: 'auto', padding: 6 },
});
