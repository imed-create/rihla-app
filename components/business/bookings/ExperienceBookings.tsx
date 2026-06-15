import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

type ExpBooking = { id: string; customer: string; experience: string; departureDate: string; groupSize: number; totalDZD: number; days: number; status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' };

const MOCK_BOOKINGS: ExpBooking[] = [
  { id: 'e1', customer: 'Thomas G.', experience: '3-Day Sahara Expedition', departureDate: '2026-07-10', groupSize: 4, totalDZD: 180000, days: 3, status: 'confirmed' },
  { id: 'e2', customer: 'Aisha N.', experience: '7-Day Algeria Discovery', departureDate: '2026-07-15', groupSize: 6, totalDZD: 720000, days: 7, status: 'confirmed' },
  { id: 'e3', customer: 'Markus & Team', experience: 'Mountain Trek & Camp', departureDate: '2026-06-25', groupSize: 5, totalDZD: 325000, days: 5, status: 'in-progress' },
  { id: 'e4', customer: 'Cultural Group', experience: 'Cultural Heritage Tour', departureDate: '2026-08-10', groupSize: 12, totalDZD: 1020000, days: 6, status: 'confirmed' },
  { id: 'e5', customer: 'Solo Sarah', experience: '3-Day Sahara Expedition', departureDate: '2026-06-20', groupSize: 1, totalDZD: 45000, days: 3, status: 'completed' },
];

export default function ExperienceBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'in-progress'>('all');

  const dynamicExperiences = useMemo(() => {
    const expBookings = bookings.filter(b => b.type === 'experience');
    return expBookings.map(b => {
      let eStatus: ExpBooking['status'] = 'confirmed';
      if (b.status === 'active') eStatus = 'in-progress';
      else if (b.status === 'completed') eStatus = 'completed';
      else if (b.status === 'cancelled') eStatus = 'cancelled';

      return {
        id: b.id,
        customer: String(b.details.contact_name || 'Traveler'),
        experience: b.title,
        departureDate: String(b.details.departure || b.details.date || b.createdAt.split('T')[0]),
        groupSize: Number(b.details.group_size || 1),
        totalDZD: b.price,
        days: Number(b.details.duration?.toString().replace(/[^0-9]/g, '') || 3),
        status: eStatus,
      };
    });
  }, [bookings]);

  const allBookings = useMemo(() => {
    return [...dynamicExperiences, ...MOCK_BOOKINGS];
  }, [dynamicExperiences]);

  const handleStartExpedition = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'active');
      showToast('Expedition started! Safe travels.', 'success');
    } else {
      showToast('Expedition marked active.', 'success');
    }
  };

  const handleCompleteExpedition = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'completed');
      showToast('Expedition completed! Review requested.', 'success');
    } else {
      showToast('Expedition marked complete.', 'success');
    }
  };

  const filtered = filter === 'all' ? allBookings : allBookings.filter(b => b.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{allBookings.length}</Text><Text style={styles.statLabel}>Bookings</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{allBookings.filter(b => b.status === 'confirmed').length}</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{allBookings.filter(b => b.status === 'in-progress').length}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#f4a261' }]}>{allBookings.reduce((s, b) => s + b.groupSize, 0)}</Text><Text style={styles.statLabel}>Travelers</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'confirmed', 'in-progress'] as const).map(f => (
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
              <View style={styles.expIcon}><Ionicons name="sparkles-outline" size={18} color="#f4a261" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.expName}>{item.experience}</Text>
                <Text style={styles.customerName}>{item.customer} · {item.groupSize} people</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'confirmed' ? '#FFFBEB' : item.status === 'in-progress' ? '#D1FAE5' : '#F1F5F9'
              }]}>
                <Text style={[styles.statusText, {
                  color: item.status === 'confirmed' ? '#B45309' : item.status === 'in-progress' ? '#047857' : '#64748B'
                }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailChip}><Ionicons name="calendar-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>Departs {new Date(item.departureDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</Text></View>
              <View style={styles.detailChip}><Ionicons name="moon-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{item.days} days</Text></View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.priceText}>{item.totalDZD.toLocaleString()} DZD</Text>
              {item.status === 'confirmed' && (
                <TouchableOpacity style={styles.startBtn} onPress={() => handleStartExpedition(item.id)}>
                  <Ionicons name="compass-outline" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>Start Expedition</Text>
                </TouchableOpacity>
              )}
              {item.status === 'in-progress' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleCompleteExpedition(item.id)}>
                  <Ionicons name="flag-outline" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>Complete</Text>
                </TouchableOpacity>
              )}
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
  expIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  expName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  customerName: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  priceText: { fontSize: 15, fontFamily: 'mon-b', color: '#f4a261' },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f4a261', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
});
