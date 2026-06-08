import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const ZONE_COLORS: Record<string, string> = { family: '#00a896', vip: '#F59E0B', free: '#94A3B8' };
const TYPE_ICONS: Record<string, string> = { umbrella: 'umbrella-outline', table: 'tablet-landscape-outline', cabana: 'home-outline', parking: 'car-outline', 'vip-bed': 'bed-outline' };

export default function BeachListings() {
  const { assets, getMyAssets } = useBusinessAssets();
  const spots = useMemo(() => getMyAssets('beach', 'spot'), [assets]);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const zones = ['all', ...new Set(spots.map(s => s.fields.zone as string))];
  const filtered = zoneFilter === 'all' ? spots : spots.filter(s => s.fields.zone === zoneFilter);
  const available = spots.filter(s => s.available).length;

  if (spots.length === 0) {
    return (
      <View style={{ flex: 1, paddingTop: 12 }}>
        <EmptyState icon="umbrella-outline" title="No spots yet" subtitle="Add your first beach spot or asset." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{spots.length}</Text><Text style={styles.statLabel}>Assets</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{available}</Text><Text style={styles.statLabel}>Available</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{spots.reduce((s, a) => s + a.priceDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Total DZD</Text></View>
      </View>

      <FlatList horizontal showsHorizontalScrollIndicator={false} data={zones} keyExtractor={z => z}
        contentContainerStyle={styles.zoneRow}
        renderItem={({ item: zone }) => (
          <TouchableOpacity style={[styles.zoneTab, zoneFilter === zone && { backgroundColor: ZONE_COLORS[zone] || RIHLA.primary }]}
            onPress={() => { Haptics.selectionAsync(); setZoneFilter(zone); }}>
            <Text style={[styles.zoneText, { color: zoneFilter === zone ? '#fff' : ZONE_COLORS[zone] || RIHLA.mutedText }]}>
              {zone.charAt(0).toUpperCase() + zone.slice(1)}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList data={filtered} keyExtractor={a => a.id} numColumns={2} columnWrapperStyle={{ gap: 8, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.assetCard, !item.available && { opacity: 0.6 }]}>
            <View style={[styles.assetIcon, { backgroundColor: (ZONE_COLORS[item.fields.zone] || '#94A3B8') + '15' }]}>
              <Ionicons name={TYPE_ICONS[item.fields.assetType] as any || 'grid-outline'} size={22} color={ZONE_COLORS[item.fields.zone] || '#94A3B8'} />
            </View>
            <Text style={styles.assetLabel}>{item.name}</Text>
            <View style={[styles.zoneDot, { backgroundColor: ZONE_COLORS[item.fields.zone] || '#94A3B8' }]} />
            <Text style={styles.assetType}>{item.fields.assetType?.replace('-', ' ') || 'asset'}</Text>
            <Text style={styles.assetPrice}>{item.priceDZD.toLocaleString()} DZD</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20, gap: 8 }}
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
  zoneRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  zoneTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  zoneText: { fontSize: 12, fontFamily: 'mon-sb' },
  assetCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border, gap: 4 },
  assetIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  assetLabel: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark, marginTop: 4 },
  zoneDot: { width: 6, height: 6, borderRadius: 3, position: 'absolute', top: 12, right: 12 },
  assetType: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText, textTransform: 'capitalize' },
  assetPrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary, marginTop: 2 },
});
