import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

type BeachService = { id: string; customer: string; service: string; spot: string; priceDZD: number; status: 'pending' | 'active' | 'completed' | 'cancelled'; time: string; zone: string };

const MOCK_SERVICES: BeachService[] = [
  { id: 'b1', customer: 'Yacine B.', service: 'Umbrella', spot: 'A1 (Family)', priceDZD: 1500, status: 'active', time: '09:30', zone: 'family' },
  { id: 'b2', customer: 'Leila M.', service: 'Cabana', spot: 'VIP Cabana', priceDZD: 5000, status: 'active', time: '10:00', zone: 'vip' },
  { id: 'b3', customer: 'Amine K.', service: 'Parking', spot: 'P3', priceDZD: 500, status: 'pending', time: '11:15', zone: 'family' },
  { id: 'b4', customer: 'Nadia R.', service: 'Jet Ski', spot: 'Water Sports', priceDZD: 3500, status: 'pending', time: '11:30', zone: 'free' },
  { id: 'b5', customer: 'Salim H.', service: 'Umbrella + Table', spot: 'C2 (Family)', priceDZD: 2300, status: 'completed', time: '08:00', zone: 'family' },
  { id: 'b6', customer: 'Farida D.', service: 'Massage', spot: 'Pavilion 2', priceDZD: 2500, status: 'pending', time: '12:00', zone: 'vip' },
];

export default function BeachBookings() {
  const [services] = useState(MOCK_SERVICES);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  const filtered = filter === 'all' ? services : services.filter(s => s.status === filter);
  const activeCount = services.filter(s => s.status === 'active').length;
  const pendingCount = services.filter(s => s.status === 'pending').length;

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{services.length}</Text><Text style={styles.statLabel}>Today</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{activeCount}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#F59E0B' }]}>{pendingCount}</Text><Text style={styles.statLabel}>Pending</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{services.reduce((s, r) => s + r.priceDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Revenue</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'pending'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={s => s.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.zoneDot, { backgroundColor: item.zone === 'vip' ? '#F59E0B' : item.zone === 'family' ? '#00a896' : '#94A3B8' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{item.customer}</Text>
                <Text style={styles.serviceInfo}>{item.service} · {item.spot}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#D1FAE5' : item.status === 'pending' ? '#FEF3C7' : '#F1F5F9' }]}>
                <Text style={[styles.statusText, { color: item.status === 'active' ? '#047857' : item.status === 'pending' ? '#B45309' : '#64748B' }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.timeText}>{item.time}</Text>
              <Text style={styles.priceText}>{item.priceDZD.toLocaleString()} DZD</Text>
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
  filterTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  filterTabActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  filterText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText, textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  customerName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  serviceInfo: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  timeText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  priceText: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary },
});
