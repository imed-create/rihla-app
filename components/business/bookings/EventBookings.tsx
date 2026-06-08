import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

type TicketSale = { id: string; event: string; customer: string; ticketType: string; qty: number; totalDZD: number; status: 'confirmed' | 'checked-in' | 'cancelled'; date: string };

const MOCK_SALES: TicketSale[] = [
  { id: 't1', event: 'Raï Night Oran', customer: 'Hassan M.', ticketType: 'VIP', qty: 2, totalDZD: 10000, status: 'confirmed', date: '2026-06-10' },
  { id: 't2', event: 'Raï Night Oran', customer: 'Lina K.', ticketType: 'Standard', qty: 3, totalDZD: 6000, status: 'checked-in', date: '2026-06-09' },
  { id: 't3', event: 'Saharan Music Festival', customer: 'Omar S.', ticketType: 'Premium', qty: 2, totalDZD: 16000, status: 'confirmed', date: '2026-06-11' },
  { id: 't4', event: 'Beach Sunset Party', customer: 'Selma R.', ticketType: 'VIP Table', qty: 1, totalDZD: 10000, status: 'confirmed', date: '2026-06-12' },
  { id: 't5', event: 'Constantine Jazz Night', customer: 'Rayane B.', ticketType: 'Standard', qty: 2, totalDZD: 3000, status: 'cancelled', date: '2026-06-08' },
  { id: 't6', event: 'Beach Sunset Party', customer: 'Ines D.', ticketType: 'Standard', qty: 4, totalDZD: 10000, status: 'confirmed', date: '2026-06-12' },
];

export default function EventBookings() {
  const [sales] = useState(MOCK_SALES);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'checked-in'>('all');

  const filtered = filter === 'all' ? sales : sales.filter(s => s.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{sales.length}</Text><Text style={styles.statLabel}>Orders</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{sales.reduce((s, t) => s + t.qty, 0)}</Text><Text style={styles.statLabel}>Tickets</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{sales.filter(s => s.status === 'checked-in').length}</Text><Text style={styles.statLabel}>Checked In</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#A855F7' }]}>{sales.reduce((s, t) => s + t.totalDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Revenue</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'confirmed', 'checked-in'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.ticketIcon}><Ionicons name="ticket-outline" size={18} color="#A855F7" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName}>{item.event}</Text>
                <Text style={styles.customerName}>{item.customer}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'checked-in' ? '#D1FAE5' : item.status === 'confirmed' ? '#F5F3FF' : '#F1F5F9' }]}>
                <Text style={[styles.statusText, { color: item.status === 'checked-in' ? '#047857' : item.status === 'confirmed' ? '#7C3AED' : '#64748B' }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.ticketDetail}>
              <View style={styles.ticketChip}><Text style={styles.ticketTypeText}>{item.ticketType}</Text></View>
              <Text style={styles.qtyText}>× {item.qty}</Text>
              <Text style={styles.totalPrice}>{item.totalDZD.toLocaleString()} DZD</Text>
            </View>
            <TouchableOpacity style={styles.checkInBtn}>
              <Ionicons name="qr-code-outline" size={14} color="#fff" />
              <Text style={styles.checkInText}>Scan to Check In</Text>
            </TouchableOpacity>
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
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  ticketIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  eventName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  customerName: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  ticketDetail: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  ticketChip: { backgroundColor: '#F5F3FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ticketTypeText: { fontSize: 11, fontFamily: 'mon-b', color: '#7C3AED' },
  qtyText: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  totalPrice: { marginLeft: 'auto', fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary },
  checkInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#A855F7', paddingVertical: 10, borderRadius: 12, marginTop: 10 },
  checkInText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
});
