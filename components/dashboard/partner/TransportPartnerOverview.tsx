import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const INITIAL_REQUESTS = [
  { id: '1', passenger: 'Samir Brahimi', route: 'Algiers Airport (ALG) ➜ Sheraton Hotel', distance: '18 km', fare: '3,200 DZD', time: 'Received 2 mins ago' },
  { id: '2', passenger: 'Yasmine Slimani', route: 'Constantine Centre ➜ Tiddis Roman Ruins', distance: '32 km', fare: '5,500 DZD', time: 'Received 10 mins ago' },
];

export default function TransportPartnerOverview() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const { colors } = useTheme();

  const handleAccept = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* ── LIVE RIDE QUEUE ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Ride Request Queue</Text>
      {requests.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>No active ride requests nearby.</Text>
        </View>
      ) : (
        <View style={styles.queueList}>
          {requests.map(req => (
            <View key={req.id} style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.passengerInfo}>
                  <Ionicons name="car-outline" size={20} color={RIHLA.accent} />
                  <Text style={[styles.passengerName, { color: colors.text }]}>{req.passenger}</Text>
                </View>
                <Text style={styles.fareText}>{req.fare}</Text>
              </View>

              <Text style={[styles.routeText, { color: colors.muted }]}>{req.route}</Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.timeText, { color: colors.muted }]}>{req.time} · {req.distance}</Text>
                <Pressable style={styles.acceptBtn} onPress={() => handleAccept(req.id)}>
                  <Text style={styles.acceptText}>Accept Ride</Text>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* ── FARE ESTIMATOR / CALCULATOR ── */}
      <View style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Route & Fare Estimator</Text>
        <Text style={[styles.cardDesc, { color: colors.muted }]}>Quick lookup tool for standard regional transfer fares</Text>
        <View style={styles.calcRow}>
          <View style={styles.calcCol}>
            <Text style={[styles.calcLabel, { color: colors.muted }]}>Estimated ALG Airport Transfer</Text>
            <Text style={[styles.calcVal, { color: colors.text }]}>3,000 - 4,500 DZD</Text>
          </View>
          <View style={styles.calcCol}>
            <Text style={[styles.calcLabel, { color: colors.muted }]}>Inter-Wilaya Rate / Km</Text>
            <Text style={[styles.calcVal, { color: colors.text }]}>150 DZD</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b' },
  emptyCard: { borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 13, fontFamily: 'mon' },
  
  queueList: { gap: 12 },
  requestCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passengerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  passengerName: { fontSize: 14, fontFamily: 'mon-b' },
  fareText: { fontSize: 15, fontFamily: 'mon-b', color: '#10B981' },
  
  routeText: { fontSize: 13, fontFamily: 'mon-sb' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  timeText: { fontSize: 11, fontFamily: 'mon' },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: RIHLA.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  acceptText: { color: '#FFF', fontFamily: 'mon-sb', fontSize: 12 },

  bentoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  cardTitle: { fontSize: 14, fontFamily: 'mon-b' },
  cardDesc: { fontSize: 11, fontFamily: 'mon' },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  calcCol: { flex: 1, gap: 2 },
  calcLabel: { fontSize: 10, fontFamily: 'mon-sb' },
  calcVal: { fontSize: 14, fontFamily: 'mon-b' },
});
