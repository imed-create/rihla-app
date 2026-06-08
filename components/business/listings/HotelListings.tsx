import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const TYPE_COLORS: Record<string, string> = {
  single: '#94A3B8', double: '#6366F1', suite: '#A855F7', penthouse: '#F59E0B',
};

export default function HotelListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myRooms = useMemo(() => getMyAssets('hotel', 'room'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available'>('all');

  const filtered = myRooms.filter(r => {
    if (filter === 'available') return r.available;
    return true;
  });

  const stats = {
    total: myRooms.length,
    available: myRooms.filter(r => r.available).length,
    totalValue: myRooms.reduce((s, r) => s + r.priceDZD, 0),
  };

  if (myRooms.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Rooms</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Available</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0 DZD</Text><Text style={styles.statLabel}>Value</Text></View>
        </View>
        <EmptyState icon="bed-outline" title="No rooms yet" subtitle="Add your first room to start receiving bookings." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Rooms</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Available</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalValue.toLocaleString()}</Text><Text style={styles.statLabel}>Total DZD</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'available'] as const).map(f => (
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
        renderItem={({ item }) => (
          <View style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <View style={[styles.roomIcon, { backgroundColor: (TYPE_COLORS[item.fields.roomType] || '#94A3B8') + '18' }]}>
                <Ionicons name="bed-outline" size={20} color={TYPE_COLORS[item.fields.roomType] || '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomName}>{item.name}</Text>
                <View style={styles.roomMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[item.fields.roomType] || '#94A3B8') + '18' }]}>
                    <Text style={[styles.typeText, { color: TYPE_COLORS[item.fields.roomType] || '#94A3B8' }]}>{item.fields.roomType || 'standard'}</Text>
                  </View>
                  <Text style={styles.capacityText}>Up to {item.fields.capacity || 2} guests</Text>
                </View>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.roomPrice}>{item.priceDZD.toLocaleString()}</Text>
                <Text style={styles.priceUnit}>DZD/night</Text>
              </View>
            </View>

            {item.fields.amenities && item.fields.amenities.length > 0 && (
              <View style={styles.amenitiesRow}>
                {(item.fields.amenities as string[]).map((a: string, i: number) => (
                  <View key={i} style={styles.amenityChip}><Text style={styles.amenityText}>{a}</Text></View>
                ))}
              </View>
            )}

            <View style={styles.roomActions}>
              <View style={styles.availabilityRow}>
                <Text style={styles.availLabel}>Available</Text>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: RIHLA.accent + '60' }} thumbColor={item.available ? RIHLA.accent : '#94A3B8'} />
              </View>
              <TouchableOpacity style={styles.editBtn}><Ionicons name="create-outline" size={16} color={RIHLA.mutedText} /></TouchableOpacity>
            </View>
          </View>
        )}
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
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  filterTabActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  filterText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  filterTextActive: { color: '#fff' },
  roomCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  roomHeader: { flexDirection: 'row', gap: 12 },
  roomIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roomName: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  roomMeta: { flexDirection: 'row', gap: 8, marginTop: 4 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  capacityText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  priceCol: { alignItems: 'flex-end' },
  roomPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  priceUnit: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  amenityChip: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: RIHLA.border },
  amenityText: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  roomActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availLabel: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  editBtn: { marginLeft: 'auto', padding: 6 },
});
