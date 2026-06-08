import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const DIFFICULTY_COLORS: Record<string, string> = { easy: '#10B981', moderate: '#F59E0B', challenging: '#EF4444' };

export default function ExperienceListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myExperiences = useMemo(() => getMyAssets('experience', 'experience'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = myExperiences.filter(e => {
    if (filter === 'available') return e.available;
    if (filter === 'unavailable') return !e.available;
    return true;
  });

  const stats = {
    total: myExperiences.length,
    available: myExperiences.filter(e => e.available).length,
    totalDates: myExperiences.reduce((s, e) => s + ((e.fields.departureDates as string[])?.length || 0), 0),
  };

  if (myExperiences.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Experiences</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Dates</Text></View>
        </View>
        <EmptyState icon="sparkles-outline" title="No experiences yet" subtitle="Create your first curated experience to offer." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Experiences</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#f4a261' }]}>{stats.totalDates}</Text><Text style={styles.statLabel}>Dates</Text></View>
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
        keyExtractor={e => e.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const inclusions = (item.fields.inclusions || []) as string[];
          const departureDates = (item.fields.departureDates || []) as string[];
          const difficulty = item.fields.difficulty as string || 'easy';
          const days = item.fields.durationDays as number || 1;
          return (
            <View style={styles.experienceCard}>
              <View style={styles.cardTop}>
                <View style={styles.durationBadge}>
                  <Ionicons name="calendar-outline" size={14} color="#f4a261" />
                  <Text style={styles.durationText}>{days} Days</Text>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: (DIFFICULTY_COLORS[difficulty] || '#10B981') + '18' }]}>
                  <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[difficulty] || '#10B981' }]}>{difficulty}</Text>
                </View>
              </View>
              <Text style={styles.experienceName}>{item.name}</Text>
              <Text style={styles.experienceMeta}>Up to {item.fields.maxGroup || '?'} people · {item.priceDZD.toLocaleString()} DZD/person</Text>
              {inclusions.length > 0 && (
                <View style={styles.inclusionsRow}>
                  {inclusions.map((inc, i) => (
                    <View key={i} style={styles.inclusionChip}>
                      <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                      <Text style={styles.inclusionText}>{inc}</Text>
                    </View>
                  ))}
                </View>
              )}
              {departureDates.length > 0 && (
                <View style={styles.datesRow}>
                  <Ionicons name="calendar-outline" size={12} color={RIHLA.mutedText} />
                  <Text style={styles.datesLabel}>Departures: </Text>
                  {departureDates.map((d, i) => (
                    <Text key={i} style={styles.dateText}>{new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text>
                  ))}
                </View>
              )}
              <View style={styles.actions}>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: '#f4a26160' }} thumbColor={item.available ? '#f4a261' : '#94A3B8'} />
                <Text style={styles.availText}>{item.available ? 'Bookable' : 'Hidden'}</Text>
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
  experienceCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durationText: { fontSize: 10, fontFamily: 'mon-b', color: '#B45309' },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  experienceName: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  experienceMeta: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  inclusionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  inclusionChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  inclusionText: { fontSize: 9, fontFamily: 'mon', color: '#166534' },
  datesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  datesLabel: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  dateText: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.dark, marginRight: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  availText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  editBtn: { marginLeft: 'auto', padding: 6 },
});
