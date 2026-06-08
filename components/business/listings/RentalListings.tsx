import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const TYPE_ICONS: Record<string, string> = {
  villa: 'business-outline',
  apartment: 'home-outline',
  riad: 'business-outline',
  studio: 'home-outline',
};

export default function RentalListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myProperties = useMemo(() => getMyAssets('rental', 'property'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = myProperties.filter(p => {
    if (filter === 'available') return p.available;
    if (filter === 'unavailable') return !p.available;
    return true;
  });

  const stats = {
    total: myProperties.length,
    available: myProperties.filter(p => p.available).length,
    totalValue: myProperties.reduce((s, p) => s + p.priceDZD, 0),
  };

  if (myProperties.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Properties</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Available</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0 DZD</Text><Text style={styles.statLabel}>Value</Text></View>
        </View>
        <EmptyState icon="home-outline" title="No properties yet" subtitle="Add your first property to start receiving bookings." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Properties</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Available</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalValue.toLocaleString()}</Text><Text style={styles.statLabel}>Total DZD</Text></View>
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
        keyExtractor={p => p.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const propType = item.fields.propertyType || 'villa';
          return (
            <View style={styles.propertyCard}>
              <View style={styles.propertyHeader}>
                <View style={styles.propertyIcon}><Ionicons name={(TYPE_ICONS[propType] || 'home-outline') as any} size={22} color={RIHLA.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.propertyName}>{item.name}</Text>
                  <Text style={styles.propertyType}>{propType} · {item.fields.bedrooms || '?'} bed · {item.fields.bathrooms || '?'} bath</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.propertyPrice}>{item.priceDZD.toLocaleString()}</Text>
                  <Text style={styles.priceUnit}>DZD/night</Text>
                </View>
              </View>
              <View style={styles.propertyMeta}>
                <View style={styles.metaChip}><Ionicons name="people-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.metaText}>Up to {item.fields.maxGuests || '?'}</Text></View>
              </View>
              <View style={styles.actions}>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: RIHLA.accent + '60' }} thumbColor={item.available ? RIHLA.accent : '#94A3B8'} />
                <Text style={styles.availText}>{item.available ? 'Active' : 'Inactive'}</Text>
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
  addBtn: { marginLeft: 'auto', width: 36, height: 36, borderRadius: 18, backgroundColor: RIHLA.accent, alignItems: 'center', justifyContent: 'center' },
  propertyCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  propertyHeader: { flexDirection: 'row', gap: 12 },
  propertyIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  propertyName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  propertyType: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  propertyPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  priceUnit: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
  propertyMeta: { flexDirection: 'row', gap: 8, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  availText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  editBtn: { marginLeft: 'auto', padding: 6 },
});
