import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

export default function EventListings() {
  const { assets, getMyAssets, toggleAvailable } = useBusinessAssets();
  const myEvents = useMemo(() => getMyAssets('event', 'event'), [assets]);
  const [filter, setFilter] = useState<'all' | 'active' | 'soldout'>('all');

  const filtered = myEvents.filter(e => {
    if (filter === 'active') return e.available;
    if (filter === 'soldout') return !e.available;
    return true;
  });

  const stats = {
    total: myEvents.length,
    available: myEvents.filter(e => e.available).length,
  };

  if (myEvents.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Events</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Tickets</Text></View>
        </View>
        <EmptyState icon="ticket-outline" title="No events yet" subtitle="Create your first event to start selling tickets." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Events</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{stats.available}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{myEvents.reduce((s, e) => s + (e.fields.ticketTypes as any[])?.length || 1, 0)}</Text><Text style={styles.statLabel}>Ticket Types</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'soldout'] as const).map(f => (
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
          const ticketTypes = (item.fields.ticketTypes || []) as { name: string; price?: number; qty?: number }[];
          return (
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventDateBox}>
                  <Text style={styles.eventDateMonth}>{item.fields.date ? new Date(item.fields.date as string).toLocaleString('en', { month: 'short' }) : '—'}</Text>
                  <Text style={styles.eventDateDay}>{item.fields.date ? new Date(item.fields.date as string).getDate() : '—'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventName}>{item.name}</Text>
                  <Text style={styles.eventVenue}>{item.fields.venue || '—'}</Text>
                </View>
              </View>
              {ticketTypes.length > 0 && (
                <View style={styles.ticketRow}>
                  {ticketTypes.map((t, i) => (
                    <View key={i} style={styles.ticketChip}>
                      <Text style={styles.ticketName}>{t.name}</Text>
                      <Text style={styles.ticketPrice}>{(t.price || item.priceDZD).toLocaleString()} DZD</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.actions}>
                <Switch value={item.available} onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(item.id); }}
                  trackColor={{ false: '#E2E8F0', true: RIHLA.accent + '60' }} thumbColor={item.available ? RIHLA.accent : '#94A3B8'} />
                <Text style={styles.availText}>{item.available ? 'On Sale' : 'Paused'}</Text>
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
  eventCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  eventHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  eventDateBox: { width: 48, height: 52, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  eventDateMonth: { fontSize: 10, fontFamily: 'mon-b', color: '#A855F7', textTransform: 'uppercase' },
  eventDateDay: { fontSize: 18, fontFamily: 'mon-b', color: '#7C3AED' },
  eventName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  eventVenue: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  ticketRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  ticketChip: { backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: RIHLA.border, gap: 2 },
  ticketName: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.dark },
  ticketPrice: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.primary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  availText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  editBtn: { marginLeft: 'auto', padding: 6 },
});
