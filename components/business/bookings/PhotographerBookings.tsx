import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

type ShootBooking = { id: string; client: string; package: string; date: string; time: string; location: string; totalDZD: number; status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled' };

const MOCK_SHOOTS: ShootBooking[] = [
  { id: 's1', client: 'Nadia K.', package: 'Beach Portrait', date: '2026-06-12', time: '09:00', location: 'Sidi Fredj Beach', totalDZD: 3000, status: 'confirmed' },
  { id: 's2', client: 'Mehdi & Rania', package: 'Sunset Couple', date: '2026-06-10', time: '17:30', location: 'Tipaza Ruins', totalDZD: 5000, status: 'in-progress' },
  { id: 's3', client: 'Sarah L.', package: 'Adventure Shoot', date: '2026-06-15', time: '07:00', location: 'Djurdjura', totalDZD: 12000, status: 'confirmed' },
  { id: 's4', client: 'Farouk Family', package: 'Full Day Wedding', date: '2026-06-08', time: '10:00', location: 'Oran', totalDZD: 25000, status: 'completed' },
  { id: 's5', client: 'Lina T.', package: 'Beach Portrait', date: '2026-06-18', time: '08:30', location: 'Bejaia', totalDZD: 3000, status: 'confirmed' },
];

export default function PhotographerBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'in-progress'>('all');

  const dynamicShoots = useMemo(() => {
    const photoBookings = bookings.filter(b => b.type === 'photographer');
    return photoBookings.map(b => {
      let pStatus: ShootBooking['status'] = 'confirmed';
      if (b.status === 'active') pStatus = 'in-progress';
      else if (b.status === 'completed') pStatus = 'completed';
      else if (b.status === 'cancelled') pStatus = 'cancelled';

      return {
        id: b.id,
        client: String(b.details.contact_name || 'Client'),
        package: String(b.details.package || 'Quick Shoot'),
        date: String(b.details.date || b.createdAt.split('T')[0]),
        time: String(b.details.time || '10:00'),
        location: String(b.details.location || b.subtitle?.split('·')[0]?.trim() || 'TBD'),
        totalDZD: b.price,
        status: pStatus,
      };
    });
  }, [bookings]);

  const shoots = useMemo(() => {
    return [...dynamicShoots, ...MOCK_SHOOTS];
  }, [dynamicShoots]);

  const handleStartSession = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'active');
      showToast('Photo session started!', 'success');
    } else {
      showToast('Session started.', 'success');
    }
  };

  const handleCompleteSession = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'completed');
      showToast('Session completed! Photos will be delivered.', 'success');
    } else {
      showToast('Session marked complete.', 'success');
    }
  };

  const filtered = filter === 'all' ? shoots : shoots.filter(s => s.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{shoots.length}</Text><Text style={styles.statLabel}>Sessions</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{shoots.filter(s => s.status === 'confirmed').length}</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{shoots.filter(s => s.status === 'in-progress').length}</Text><Text style={styles.statLabel}>In Progress</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#FF499E' }]}>{shoots.reduce((s, sh) => s + sh.totalDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Revenue</Text></View>
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
        keyExtractor={s => s.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cameraIcon}><Ionicons name="camera-outline" size={18} color="#FF499E" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{item.client}</Text>
                <Text style={styles.packageName}>{item.package}</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'confirmed' ? '#FDF2F8' : item.status === 'in-progress' ? '#D1FAE5' : '#F1F5F9'
              }]}>
                <Text style={[styles.statusText, {
                  color: item.status === 'confirmed' ? '#BE185D' : item.status === 'in-progress' ? '#047857' : '#64748B'
                }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailChip}><Ionicons name="calendar-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text></View>
              <View style={styles.detailChip}><Ionicons name="time-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{item.time}</Text></View>
              <View style={styles.detailChip}><Ionicons name="location-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{item.location}</Text></View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.priceText}>{item.totalDZD.toLocaleString()} DZD</Text>
              {item.status === 'confirmed' && (
                <TouchableOpacity style={styles.startBtn} onPress={() => handleStartSession(item.id)}>
                  <Ionicons name="camera" size={14} color="#fff" />
                  <Text style={styles.startBtnText}>Start Session</Text>
                </TouchableOpacity>
              )}
              {item.status === 'in-progress' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleCompleteSession(item.id)}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text style={styles.completeBtnText}>Deliver Photos</Text>
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
  cameraIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FDF2F8', alignItems: 'center', justifyContent: 'center' },
  clientName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  packageName: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  priceText: { fontSize: 15, fontFamily: 'mon-b', color: '#FF499E' },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FF499E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  startBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  completeBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
});
