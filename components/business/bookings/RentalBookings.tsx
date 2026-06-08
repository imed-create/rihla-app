import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

type RentalBooking = { id: string; guest: string; property: string; checkIn: string; checkOut: string; totalDZD: number; status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'; guests: number };

const MOCK_RENTALS: RentalBooking[] = [
  { id: 'r1', guest: 'Pierre Dubois', property: 'Villa Oran Seafront', checkIn: '2026-06-15', checkOut: '2026-06-20', totalDZD: 125000, status: 'confirmed', guests: 6 },
  { id: 'r2', guest: 'Amina Said', property: 'Constantine Riad', checkIn: '2026-06-10', checkOut: '2026-06-12', totalDZD: 36000, status: 'active', guests: 4 },
  { id: 'r3', guest: 'John Smith', property: 'Algiers City Apt', checkIn: '2026-06-18', checkOut: '2026-06-25', totalDZD: 63000, status: 'pending', guests: 2 },
  { id: 'r4', guest: 'Nora B.', property: 'Tlemcen Mountain Villa', checkIn: '2026-06-05', checkOut: '2026-06-08', totalDZD: 90000, status: 'completed', guests: 8 },
  { id: 'r5', guest: 'Hichem Z.', property: 'Bejaia Beach Studio', checkIn: '2026-06-20', checkOut: '2026-06-22', totalDZD: 10000, status: 'confirmed', guests: 2 },
];

export default function RentalBookings() {
  const [bookings] = useState(MOCK_RENTALS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'active'>('all');

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{bookings.length}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{bookings.filter(b => b.status === 'active').length}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{bookings.reduce((s, b) => s + b.totalDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Total DZD</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'confirmed', 'active'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={b => b.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.propertyIcon}><Ionicons name="home-outline" size={18} color={RIHLA.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.propertyName}>{item.property}</Text>
                <Text style={styles.guestName}>{item.guest} · {item.guests} guests</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'confirmed' ? '#EEF2FF' : item.status === 'active' ? '#D1FAE5' : item.status === 'pending' ? '#FEF3C7' : '#F1F5F9'
              }]}>
                <Text style={[styles.statusText, {
                  color: item.status === 'confirmed' ? '#4338CA' : item.status === 'active' ? '#047857' : item.status === 'pending' ? '#B45309' : '#64748B'
                }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>{new Date(item.checkIn).toLocaleDateString('en', { month: 'short', day: 'numeric' })} → {new Date(item.checkOut).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.nightsText}>{Math.round((new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / (1000*60*60*24))} nights</Text>
              <Text style={styles.priceText}>{item.totalDZD.toLocaleString()} DZD</Text>
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
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  cardTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  propertyIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  propertyName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  guestName: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  dateRow: { marginTop: 8 },
  dateLabel: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  nightsText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  priceText: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary },
});
