import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

type Trip = { id: string; customer: string; from: string; to: string; date: string; time: string; vehicle: string; distance: string; priceDZD: number; status: 'scheduled' | 'in-transit' | 'completed' | 'cancelled' };

const MOCK_TRIPS: Trip[] = [
  { id: 'd1', customer: 'Ahmed B.', from: 'Algiers Airport', to: 'City Center', date: '2026-06-10', time: '14:30', vehicle: 'Sedan', distance: '25 km', priceDZD: 2500, status: 'scheduled' },
  { id: 'd2', customer: 'Maria G.', from: 'Hotel El Djazair', to: 'Tipaza', date: '2026-06-10', time: '09:00', vehicle: 'SUV', distance: '70 km', priceDZD: 5000, status: 'in-transit' },
  { id: 'd3', customer: 'Karim O.', from: 'Oran Airport', to: 'Les Andalouses', date: '2026-06-10', time: '11:00', vehicle: 'Sedan', distance: '20 km', priceDZD: 2000, status: 'scheduled' },
  { id: 'd4', customer: 'Lena S.', from: 'Constantine', to: 'Timgad', date: '2026-06-09', time: '08:00', vehicle: 'SUV', distance: '100 km', priceDZD: 8000, status: 'completed' },
  { id: 'd5', customer: 'Yacine M.', from: 'Airport', to: 'Sidi Fredj', date: '2026-06-10', time: '16:00', vehicle: 'Sedan', distance: '35 km', priceDZD: 3000, status: 'scheduled' },
];

export default function DriverBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in-transit'>('all');

  const dynamicTrips = useMemo(() => {
    const driverBookings = bookings.filter(b => b.type === 'driver' || b.type === 'ride');
    return driverBookings.map(b => {
      let rStatus: Trip['status'] = 'scheduled';
      if (b.status === 'active') rStatus = 'in-transit';
      else if (b.status === 'completed') rStatus = 'completed';
      else if (b.status === 'cancelled') rStatus = 'cancelled';

      return {
        id: b.id,
        customer: String(b.details.contact_name || 'Customer'),
        from: String(b.details.pickup || 'Pickup Location'),
        to: String(b.details.dropoff || 'Dropoff Location'),
        date: new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        time: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicle: String(b.details.vehicle || 'Berline'),
        distance: 'Local ride',
        priceDZD: b.price,
        status: rStatus,
      };
    });
  }, [bookings]);

  const trips = useMemo(() => {
    return [...dynamicTrips, ...MOCK_TRIPS];
  }, [dynamicTrips]);

  const advanceTripStatus = (id: string, currentStatus: Trip['status']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      if (booking.status === 'pending' || booking.status === 'confirmed') {
        updateBookingStatus(id, 'active');
        showToast('Trip is now active (in-transit)!', 'info');
      } else if (booking.status === 'active') {
        updateBookingStatus(id, 'completed');
        showToast('Trip completed!', 'success');
      }
    } else {
      showToast('Mock trip status advanced.', 'success');
    }
  };

  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{trips.length}</Text><Text style={styles.statLabel}>Trips</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#6366F1' }]}>{trips.filter(t => t.status === 'scheduled').length}</Text><Text style={styles.statLabel}>Scheduled</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{trips.filter(t => t.status === 'in-transit').length}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{trips.reduce((s, t) => s + t.priceDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Today</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'scheduled', 'in-transit'] as const).map(f => (
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
              <View style={styles.vehicleIcon}><Ionicons name={item.vehicle === 'SUV' ? 'car-sport-outline' : 'car-outline'} size={18} color={RIHLA.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{item.customer}</Text>
                <Text style={styles.vehicleInfo}>{item.vehicle} · {item.distance}</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'scheduled' ? '#EEF2FF' : item.status === 'in-transit' ? '#D1FAE5' : '#F1F5F9'
              }]}>
                <Text style={[styles.statusText, {
                  color: item.status === 'scheduled' ? '#4338CA' : item.status === 'in-transit' ? '#047857' : '#64748B'
                }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.routeDisplay}>
              <View style={styles.routePoint}>
                <View style={styles.routeDotGreen} />
                <Text style={styles.routeText}>{item.from}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={styles.routeDotRed} />
                <Text style={styles.routeText}>{item.to}</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <Text style={styles.timeText}>{item.time} · {item.date}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.priceText}>{item.priceDZD.toLocaleString()} DA</Text>
                {(item.status === 'scheduled' || item.status === 'in-transit') && (
                  <TouchableOpacity
                    style={{ backgroundColor: RIHLA.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
                    onPress={() => advanceTripStatus(item.id, item.status)}
                  >
                    <Text style={{ color: '#FFF', fontSize: 11, fontFamily: 'mon-b' }}>
                      {item.status === 'scheduled' ? 'Start' : 'Complete'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
  vehicleIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  vehicleInfo: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  routeDisplay: { marginTop: 8, paddingLeft: 4 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: RIHLA.accent },
  routeDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  routeLine: { width: 2, height: 16, backgroundColor: RIHLA.border, marginLeft: 3, marginVertical: 2 },
  routeText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.dark },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  timeText: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  priceText: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.primary },
});
