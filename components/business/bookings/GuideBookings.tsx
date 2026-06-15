import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

type GuideClient = { id: string; client: string; tour: string; date: string; language: string; groupSize: number; totalDZD: number; status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled'; guideName: string };

const MOCK_CLIENTS: GuideClient[] = [
  { id: 'c1', client: 'Emma Watson', tour: 'Casbah History Walk', date: '2026-06-12', language: 'English', groupSize: 4, totalDZD: 16000, status: 'confirmed', guideName: 'Karim' },
  { id: 'c2', client: 'Pierre L.', tour: 'Tassili Rock Art Tour', date: '2026-06-14', language: 'French', groupSize: 3, totalDZD: 24000, status: 'confirmed', guideName: 'Amina' },
  { id: 'c3', client: 'Yusuf A.', tour: 'Medina Food Tour', date: '2026-06-10', language: 'Arabic', groupSize: 6, totalDZD: 21000, status: 'in-progress', guideName: 'Karim' },
  { id: 'c4', client: 'Sophie M.', tour: 'Casbah History Walk', date: '2026-06-08', language: 'French', groupSize: 2, totalDZD: 8000, status: 'completed', guideName: 'Karim' },
  { id: 'c5', client: 'Carlos G.', tour: 'Saharan Nomad Experience', date: '2026-06-20', language: 'English', groupSize: 5, totalDZD: 30000, status: 'confirmed', guideName: 'Amina' },
];

export default function GuideBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'in-progress'>('all');

  const dynamicClients = useMemo(() => {
    const guideBookings = bookings.filter(b => b.type === 'guide');
    return guideBookings.map(b => {
      let gStatus: GuideClient['status'] = 'confirmed';
      if (b.status === 'active') gStatus = 'in-progress';
      else if (b.status === 'completed') gStatus = 'completed';
      else if (b.status === 'cancelled') gStatus = 'cancelled';

      return {
        id: b.id,
        client: String(b.details.contact_name || 'Guest'),
        tour: b.title,
        date: String(b.details.date || b.createdAt.split('T')[0]),
        language: String(b.details.languages || 'Arabic'),
        groupSize: Number(b.details.group_size || 1),
        totalDZD: b.price,
        status: gStatus,
        guideName: String(b.details.guide || 'Guide'),
      };
    });
  }, [bookings]);

  const clients = useMemo(() => {
    return [...dynamicClients, ...MOCK_CLIENTS];
  }, [dynamicClients]);

  const handleStartTour = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'active');
      showToast('Tour started!', 'success');
    } else {
      showToast('Tour status updated.', 'success');
    }
  };

  const handleCompleteTour = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const exists = bookings.some(b => b.id === id);
    if (exists) {
      updateBookingStatus(id, 'completed');
      showToast('Tour completed!', 'success');
    } else {
      showToast('Tour marked complete.', 'success');
    }
  };

  const filtered = filter === 'all' ? clients : clients.filter(c => c.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{clients.length}</Text><Text style={styles.statLabel}>Clients</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{clients.filter(c => c.status === 'confirmed').length}</Text><Text style={styles.statLabel}>Upcoming</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{clients.filter(c => c.status === 'in-progress').length}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{clients.reduce((s, c) => s + c.totalDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Revenue</Text></View>
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
        keyExtractor={c => c.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.client[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{item.client}</Text>
                <Text style={styles.tourName}>{item.tour}</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'confirmed' ? '#EEF2FF' : item.status === 'in-progress' ? '#D1FAE5' : '#F1F5F9'
              }]}>
                <Text style={[styles.statusText, {
                  color: item.status === 'confirmed' ? '#4338CA' : item.status === 'in-progress' ? '#047857' : '#64748B'
                }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailChip}><Ionicons name="calendar-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</Text></View>
              <View style={styles.detailChip}><Ionicons name="language-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{item.language}</Text></View>
              <View style={styles.detailChip}><Ionicons name="people-outline" size={12} color={RIHLA.mutedText} /><Text style={styles.detailText}>{item.groupSize} pax</Text></View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.priceText}>{item.totalDZD.toLocaleString()} DZD</Text>
              {item.status === 'confirmed' && (
                <TouchableOpacity style={styles.startBtn} onPress={() => handleStartTour(item.id)}>
                  <Ionicons name="play-outline" size={14} color="#fff" />
                  <Text style={styles.startBtnText}>Start Tour</Text>
                </TouchableOpacity>
              )}
              {item.status === 'in-progress' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleCompleteTour(item.id)}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text style={styles.completeBtnText}>Complete</Text>
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
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontFamily: 'mon-b', color: '#7C3AED' },
  clientName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  tourName: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  detailText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  priceText: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  startBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  completeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  completeBtnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
});
