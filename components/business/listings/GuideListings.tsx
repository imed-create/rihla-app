import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const TYPE_ICONS: Record<string, string> = { historical: 'business-outline', nature: 'leaf-outline', culture: 'people-outline', adventure: 'compass-outline' };
const TYPE_COLORS: Record<string, string> = { historical: '#8B5E3C', nature: '#10B981', culture: '#F59E0B', adventure: '#EF4444' };

export default function GuideListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myExpeditions = useMemo(() => getMyAssets('guide', 'expedition'), [assets]);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filtered = myExpeditions.filter(e => {
    if (filter === 'available') return e.available;
    if (filter === 'unavailable') return !e.available;
    return true;
  });

  const stats = {
    total: myExpeditions.length,
    available: myExpeditions.filter(e => e.available).length,
    totalDaily: myExpeditions.reduce((s, e) => s + e.priceDZD, 0),
  };

  if (myExpeditions.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Expeditions</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>DZD/day</Text></View>
        </View>
        <EmptyState icon="compass-outline" title="No expeditions yet" subtitle="Create your first guided tour to start receiving bookings." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Expeditions</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#8B5E3C' }]}>{stats.totalDaily.toLocaleString()}</Text><Text style={styles.statLabel}>DZD/day</Text></View>
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
          const languages = (item.fields.languages || []) as string[];
          return (
            <View style={styles.expeditionCard}>
              <View style={styles.cardTop}>
                <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[item.fields.type as string] || '#8B5E3C') + '18' }]}>
                  <Ionicons name={(TYPE_ICONS[item.fields.type as string] || 'compass-outline') as any} size={12} color={TYPE_COLORS[item.fields.type as string] || '#8B5E3C'} />
                  <Text style={[styles.typeText, { color: TYPE_COLORS[item.fields.type as string] || '#8B5E3C' }]}>{item.fields.type || 'tour'}</Text>
                </View>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: RIHLA.accent + '60' }} thumbColor={item.available ? RIHLA.accent : '#94A3B8'} />
              </View>
              <Text style={styles.expeditionName}>{item.name}</Text>
              <Text style={styles.expeditionDuration}>{item.fields.duration || '—'} · Up to {item.fields.maxGroup || '?'} people</Text>
              {languages.length > 0 && (
                <View style={styles.langRow}>
                  {languages.map((l, i) => (
                    <View key={i} style={styles.langChip}><Text style={styles.langText}>{l}</Text></View>
                  ))}
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{item.priceDZD.toLocaleString()} DZD</Text>
                <Text style={styles.priceUnit}>/day</Text>
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
  expeditionCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  expeditionName: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  expeditionDuration: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  langChip: { backgroundColor: '#F5F3FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  langText: { fontSize: 9, fontFamily: 'mon-sb', color: '#7C3AED' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  priceValue: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  priceUnit: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
});
