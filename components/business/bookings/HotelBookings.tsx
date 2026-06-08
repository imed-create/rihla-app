import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

type Reservation = {
  id: string; guest: string; room: string; checkIn: string; checkOut: string; nights: number;
  totalDZD: number; status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'; guests: number;
};

const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'h1', guest: 'Ahmed Benali', room: 'Deluxe Double', checkIn: '2026-06-10', checkOut: '2026-06-13', nights: 3, totalDZD: 22500, status: 'checked-in', guests: 2 },
  { id: 'h2', guest: 'Sarah Lardjane', room: 'Executive Suite', checkIn: '2026-06-11', checkOut: '2026-06-14', nights: 3, totalDZD: 36000, status: 'confirmed', guests: 2 },
  { id: 'h3', guest: 'Karim Ouali', room: 'Standard Single', checkIn: '2026-06-12', checkOut: '2026-06-13', nights: 1, totalDZD: 4500, status: 'confirmed', guests: 1 },
  { id: 'h4', guest: 'Yasmine Hadj', room: 'Family Room', checkIn: '2026-06-09', checkOut: '2026-06-11', nights: 2, totalDZD: 18000, status: 'checked-out', guests: 4 },
  { id: 'h5', guest: 'Mohamed Belaid', room: 'Junior Suite', checkIn: '2026-06-15', checkOut: '2026-06-18', nights: 3, totalDZD: 28500, status: 'confirmed', guests: 2 },
];

const STATUS_COLORS: Record<string, string> = { confirmed: '#6366F1', 'checked-in': '#10B981', 'checked-out': '#94A3B8', cancelled: '#EF4444' };

export default function HotelBookings() {
  const [reservations] = useState(MOCK_RESERVATIONS);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'checked-in' | 'checked-out'>('all');

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{reservations.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{reservations.filter(r => r.status === 'confirmed').length}</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{reservations.filter(r => r.status === 'checked-in').length}</Text><Text style={styles.statLabel}>In House</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{reservations.reduce((s, r) => s + r.totalDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>DZD Total</Text></View>
      </View>

      <View style={styles.filterRow}>
        {['all', 'confirmed', 'checked-in', 'checked-out'].map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f as any); }}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.replace('-', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={r => r.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.guest[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guestName}>{item.guest}</Text>
                <Text style={styles.roomInfo}>{item.room} · {item.guests} guest{item.guests > 1 ? 's' : ''}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '18' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status.replace('-', ' ')}</Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>{new Date(item.checkIn).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <View style={styles.dateArrow}><Ionicons name="arrow-forward" size={14} color={RIHLA.mutedText} /></View>
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>{new Date(item.checkOut).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text>
              </View>
              <View style={styles.priceBlock}>
                <Text style={styles.priceValue}>{item.totalDZD.toLocaleString()}</Text>
                <Text style={styles.priceLabel}>DZD</Text>
              </View>
            </View>
            {item.status === 'confirmed' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.checkInBtn}><Ionicons name="enter-outline" size={16} color="#fff" /><Text style={styles.checkInText}>Check In</Text></TouchableOpacity>
              </View>
            )}
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
  filterText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText, textTransform: 'capitalize' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#6366F1' },
  guestName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  roomInfo: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  dateBlock: { gap: 2 },
  dateLabel: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
  dateValue: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },
  dateArrow: { paddingHorizontal: 4 },
  priceBlock: { marginLeft: 'auto', alignItems: 'flex-end' },
  priceValue: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  priceLabel: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
  actions: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: RIHLA.border },
  checkInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: RIHLA.accent, paddingVertical: 10, borderRadius: 12 },
  checkInText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
});
