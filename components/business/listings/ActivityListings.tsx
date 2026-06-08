import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const DIFFICULTY_COLORS: Record<string, string> = { easy: '#10B981', moderate: '#F59E0B', challenging: '#EF4444', extreme: '#7C3AED' };

export default function ActivityListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myPrograms = useMemo(() => getMyAssets('activity', 'program'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = myPrograms.filter(p => {
    if (filter === 'available') return p.available;
    if (filter === 'unavailable') return !p.available;
    return true;
  });

  const stats = {
    total: myPrograms.length,
    available: myPrograms.filter(p => p.available).length,
    totalCapacity: myPrograms.reduce((s, p) => s + (p.fields.maxParticipants || 0), 0),
    totalSlots: myPrograms.reduce((s, p) => s + ((p.fields.slots as any[])?.length || 0), 0),
  };

  if (myPrograms.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Programs</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Capacity</Text></View>
        </View>
        <EmptyState icon="bicycle-outline" title="No activities yet" subtitle="Create your first activity program to get started." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Programs</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.totalCapacity}</Text><Text style={styles.statLabel}>Capacity</Text></View>
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
        keyExtractor={a => a.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const difficulty = item.fields.difficulty || 'moderate';
          return (
            <View style={styles.activityCard}>
              <View style={styles.cardTop}>
                <View style={[styles.diffBadge, { backgroundColor: (DIFFICULTY_COLORS[difficulty] || '#F59E0B') + '18' }]}>
                  <Ionicons name="flash" size={12} color={DIFFICULTY_COLORS[difficulty] || '#F59E0B'} />
                  <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[difficulty] || '#F59E0B' }]}>{difficulty}</Text>
                </View>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: RIHLA.accent + '60' }} thumbColor={item.available ? RIHLA.accent : '#94A3B8'} />
              </View>
              <Text style={styles.activityName}>{item.name}</Text>
              <Text style={styles.activityType}>{item.fields.duration || '—'} · Up to {item.fields.maxParticipants || '?'} pax</Text>
              <Text style={styles.activityPrice}>{item.priceDZD.toLocaleString()} DZD/person</Text>
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
  activityCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  diffBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  activityName: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  activityType: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  activityPrice: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary, marginTop: 4 },
});
