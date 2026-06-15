import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

type ActivityReservation = { id: string; customer: string; activity: string; date: string; time: string; participants: number; totalDZD: number; status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled'; difficulty: string };

const MOCK_BOOKINGS: ActivityReservation[] = [
  { id: 'a1', customer: 'Alex T.', activity: 'Tandem Paragliding', date: '2026-06-12', time: '09:00', participants: 2, totalDZD: 16000, status: 'confirmed', difficulty: 'moderate' },
  { id: 'a2', customer: 'Maria G.', activity: 'Scuba Diving Intro', date: '2026-06-10', time: '11:00', participants: 4, totalDZD: 20000, status: 'checked-in', difficulty: 'easy' },
  { id: 'a3', customer: 'Omar K.', activity: 'Mountain Hiking', date: '2026-06-15', time: '06:00', participants: 6, totalDZD: 15000, status: 'confirmed', difficulty: 'challenging' },
  { id: 'a4', customer: 'Lena S.', activity: 'Sunset Horse Ride', date: '2026-06-11', time: '17:00', participants: 3, totalDZD: 10500, status: 'completed', difficulty: 'easy' },
  { id: 'a5', customer: 'Ryan M.', activity: 'Quad Safari', date: '2026-06-13', time: '10:00', participants: 4, totalDZD: 18000, status: 'cancelled', difficulty: 'moderate' },
];

export default function ActivityBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'checked-in'>('all');

  const dynamicActivities = useMemo(() => {
    const activityBookings = bookings.filter(b => b.type === 'activity');
    return activityBookings.map(b => {
      let aStatus: ActivityReservation['status'] = 'confirmed';
      if (b.status === 'active') aStatus = 'checked-in';
      else if (b.status === 'completed') aStatus = 'completed';
      else if (b.status === 'cancelled') aStatus = 'cancelled';

      return {
        id: b.id,
        customer: String(b.details.contact_name || 'Guest'),
        activity: b.title,
        date: String(b.details.date || b.createdAt.split('T')[0]),
        time: String(b.details.time || '10:00'),
        participants: Number(b.details.participants || b.details.group_size || 1),
        totalDZD: b.price,
        status: aStatus,
        difficulty: String(b.details.difficulty || 'moderate'),
      };
    });
  }, [bookings]);

  const allBookings = useMemo(() => {
    return [...dynamicActivities, ...MOCK_BOOKINGS];
  }, [dynamicActivities]);

  const handleCheckIn = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'active');
      showToast('Participant checked in!', 'success');
    } else {
      showToast('Check-in recorded.', 'success');
    }
  };

  const handleComplete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'completed');
      showToast('Activity completed!', 'success');
    } else {
      showToast('Activity marked complete.', 'success');
    }
  };

  const filtered = filter === 'all' ? allBookings : allBookings.filter(b => b.status === filter);

  const difficultyColor = (d: string) => {
    if (d === 'easy') return '#10B981';
    if (d === 'challenging') return '#EF4444';
    return '#F59E0B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{allBookings.length}</Text><Text style={styles.statLabel}>Bookings</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{allBookings.filter(b => b.status === 'confirmed').length}</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{allBookings.filter(b => b.status === 'checked-in').length}</Text><Text style={styles.statLabel}>Checked In</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{allBookings.reduce((s, b) => s + b.totalDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Revenue</Text></View>
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
        keyExtractor={b => b.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.activityIcon}><Ionicons name="bicycle-outline" size={20} color={RIHLA.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>{item.activity}</Text>
                <Text style={styles.customerName}>{item.customer} · {item.participants} pax</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'confirmed' ? '#EEF2FF' : item.status === 'checked-in' ? '#D1FAE5' : '#F1F5F9' }]}>
                <Text style={[styles.statusText, { color: item.status === 'confirmed' ? '#4338CA' : item.status === 'checked-in' ? '#047857' : '#64748B' }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailChip}><Ionicons name="calendar-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text></View>
              <View style={styles.detailChip}><Ionicons name="time-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{item.time}</Text></View>
              <View style={[styles.detailChip, { backgroundColor: difficultyColor(item.difficulty) + '15' }]}>
                <Ionicons name="fitness-outline" size={12} color={difficultyColor(item.difficulty)} />
                <Text style={[styles.detailText, { color: difficultyColor(item.difficulty) }]}>{item.difficulty}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.priceText}>{item.totalDZD.toLocaleString()} DZD</Text>
              {item.status === 'confirmed' && (
                <TouchableOpacity style={styles.checkInBtn} onPress={() => handleCheckIn(item.id)}>
                  <Ionicons name="enter-outline" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>Check In</Text>
                </TouchableOpacity>
              )}
              {item.status === 'checked-in' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item.id)}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
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
  activityIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  activityName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  customerName: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  priceText: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary },
  checkInBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: RIHLA.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
});
