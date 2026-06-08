import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

export default function PhotographerListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myPackages = useMemo(() => getMyAssets('photographer', 'package'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = myPackages.filter(p => {
    if (filter === 'available') return p.available;
    if (filter === 'unavailable') return !p.available;
    return true;
  });

  const stats = {
    total: myPackages.length,
    available: myPackages.filter(p => p.available).length,
    totalValue: myPackages.reduce((s, p) => s + p.priceDZD, 0),
  };

  if (myPackages.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Packages</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>DZD Total</Text></View>
        </View>
        <EmptyState icon="camera-outline" title="No packages yet" subtitle="Create your first photography package to offer your services." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Packages</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#FF499E' }]}>{stats.totalValue.toLocaleString()}</Text><Text style={styles.statLabel}>DZD Total</Text></View>
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
        renderItem={({ item }) => (
          <View style={styles.packageCard}>
            <View style={styles.cardTop}>
              <View style={styles.packageIcon}>
                <Ionicons name="camera-outline" size={20} color="#FF499E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.packageName}>{item.name}</Text>
                <Text style={styles.packageDesc}>{item.description || item.fields.description || ''}</Text>
              </View>
              <Text style={styles.packagePrice}>{item.priceDZD.toLocaleString()}</Text>
            </View>
            <View style={styles.deliverables}>
              {item.fields.deliverables ? (
                <View style={styles.delivChip}><Ionicons name="image-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.delivText}>{item.fields.deliverables as string}</Text></View>
              ) : null}
              {item.fields.turnaroundDays ? (
                <View style={styles.delivChip}><Ionicons name="time-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.delivText}>{item.fields.turnaroundDays as string} day turnaround</Text></View>
              ) : null}
            </View>
            <View style={styles.actions}>
              <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                trackColor={{ false: '#E2E8F0', true: '#FF499E60' }} thumbColor={item.available ? '#FF499E' : '#94A3B8'} />
              <Text style={styles.availText}>{item.available ? 'Bookable' : 'Hidden'}</Text>
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
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  filterTabActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  filterText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  filterTextActive: { color: '#fff' },
  packageCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  packageIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center' },
  packageName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  packageDesc: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  packagePrice: { fontSize: 16, fontFamily: 'mon-b', color: '#FF499E' },
  deliverables: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  delivChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  delivText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  availText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  editBtn: { marginLeft: 'auto', padding: 6 },
});
