import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { showToast } from '@/components/Toast';

type OrderItem = { id: string; name: string; qty: number; price: number };
type Order = { id: string; customer: string; table: string; items: OrderItem[]; totalDZD: number; status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'; time: string; elapsed: string };

const MOCK_ORDERS: Order[] = [
  { id: 'o1', customer: 'Ahmed', table: 'Table 4', items: [{ id: 'i1', name: 'Couscous Royal', qty: 1, price: 1200 }, { id: 'i2', name: 'Mint Tea', qty: 2, price: 300 }], totalDZD: 1500, status: 'preparing', time: '19:15', elapsed: '8 min' },
  { id: 'o2', customer: 'Sophie', table: 'Table 7', items: [{ id: 'i3', name: 'Grilled Sea Bass', qty: 1, price: 1800 }, { id: 'i4', name: 'Fresh Juice', qty: 1, price: 300 }], totalDZD: 2100, status: 'pending', time: '19:22', elapsed: '1 min' },
  { id: 'o3', customer: 'Karim', table: 'Table 2', items: [{ id: 'i5', name: 'Brik à l\'Œuf', qty: 2, price: 500 }, { id: 'i6', name: 'Chorba', qty: 1, price: 350 }], totalDZD: 850, status: 'ready', time: '19:05', elapsed: '18 min' },
  { id: 'o4', customer: 'Leila', table: 'Table 1', items: [{ id: 'i7', name: 'Baklava', qty: 3, price: 1200 }, { id: 'i8', name: 'Mint Tea', qty: 1, price: 150 }], totalDZD: 1350, status: 'served', time: '18:50', elapsed: '33 min' },
  { id: 'o5', customer: 'Yacine', table: 'VIP Table', items: [{ id: 'i9', name: 'Mechoui Lamb', qty: 1, price: 2200 }, { id: 'i10', name: 'Couscous', qty: 1, price: 1200 }], totalDZD: 3400, status: 'pending', time: '19:28', elapsed: '0 min' },
];

const STATUS_ORDER: Record<string, number> = { pending: 0, preparing: 1, ready: 2, served: 3, cancelled: 4 };

export default function RestaurantBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  const dynamicOrders = useMemo(() => {
    const restaurantBookings = bookings.filter(b => b.type === 'restaurant' || b.type === 'food');
    return restaurantBookings.map(b => {
      let rStatus: Order['status'] = 'pending';
      if (b.status === 'active') rStatus = 'preparing';
      else if (b.status === 'completed') rStatus = 'served';
      else if (b.status === 'cancelled') rStatus = 'cancelled';

      return {
        id: b.id,
        customer: String(b.details.contact_name || 'Customer'),
        table: String(b.details.delivery_destination || 'Table 1'),
        items: [
          { id: 'item-1', name: b.title, qty: 1, price: b.price }
        ],
        totalDZD: b.price,
        status: rStatus,
        time: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        elapsed: 'just now',
      };
    });
  }, [bookings]);

  const orders = useMemo(() => {
    return [...dynamicOrders, ...MOCK_ORDERS];
  }, [dynamicOrders]);

  const advanceStatus = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const booking = bookings.find(b => b.id === id);

    if (booking) {
      if (booking.status === 'pending') {
        updateBookingStatus(id, 'active');
        showToast('Order is now preparing!', 'info');
      } else if (booking.status === 'active') {
        updateBookingStatus(id, 'completed');
        showToast('Order completed & served!', 'success');
      }
    } else {
      // Fallback update for mock order list
      showToast('Mock status advanced successfully.', 'success');
    }
  };

  const sorted = [...orders].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const filtered = filter === 'all' ? sorted : sorted.filter(o => o.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{orders.filter(o => o.status !== 'served' && o.status !== 'cancelled').length}</Text><Text style={styles.statLabel}>Active</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#F59E0B' }]}>{orders.filter(o => o.status === 'pending').length}</Text><Text style={styles.statLabel}>Pending</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#3B82F6' }]}>{orders.filter(o => o.status === 'preparing').length}</Text><Text style={styles.statLabel}>Prepping</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{orders.filter(o => o.status === 'ready').length}</Text><Text style={styles.statLabel}>Ready</Text></View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'preparing', 'ready'] as const).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={o => o.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, item.status === 'ready' && { borderColor: '#10B981', borderWidth: 2 }]}>
            <View style={styles.orderHeader}>
              <View style={styles.tableBadge}><Text style={styles.tableText}>{item.table}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{item.customer}</Text>
                <Text style={styles.orderTime}>{item.time} · {item.elapsed} ago</Text>
              </View>
              <View style={[styles.orderStatus, { backgroundColor: item.status === 'pending' ? '#FEF3C7' : item.status === 'preparing' ? '#DBEAFE' : item.status === 'ready' ? '#D1FAE5' : '#F1F5F9' }]}>
                <Text style={{ fontSize: 11, fontFamily: 'mon-sb', color: item.status === 'pending' ? '#B45309' : item.status === 'preparing' ? '#1D4ED8' : item.status === 'ready' ? '#047857' : '#64748B', textTransform: 'capitalize' }}>{item.status}</Text>
              </View>
            </View>
            {item.items.map((i, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemQty}>{i.qty}x</Text>
                <Text style={styles.itemName}>{i.name}</Text>
                <Text style={styles.itemPrice}>{i.price.toLocaleString()} DZD</Text>
              </View>
            ))}
            <View style={styles.orderFooter}>
              <Text style={styles.totalText}>Total: <Text style={styles.totalValue}>{item.totalDZD.toLocaleString()} DZD</Text></Text>
              {item.status !== 'served' && item.status !== 'cancelled' && (
                <TouchableOpacity style={styles.advanceBtn} onPress={() => advanceStatus(item.id)}>
                  <Text style={styles.advanceText}>Mark {item.status === 'pending' ? 'Preparing' : item.status === 'preparing' ? 'Ready' : 'Served'}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
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
  styles: { flex: 1 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText, textAlign: 'center' },
  statDiv: { width: 1, height: 32, backgroundColor: RIHLA.border, marginHorizontal: 4 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  filterTabActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  filterText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  filterTextActive: { color: '#fff' },
  orderCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  orderHeader: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  tableBadge: { backgroundColor: RIHLA.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tableText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
  customerName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  orderTime: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
  orderStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  itemQty: { fontSize: 12, fontFamily: 'mon-b', color: RIHLA.primary, width: 24 },
  itemName: { flex: 1, fontSize: 12, fontFamily: 'mon', color: RIHLA.dark },
  itemPrice: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: RIHLA.border },
  totalText: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  totalValue: { fontFamily: 'mon-b', color: RIHLA.dark },
  advanceBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: RIHLA.accent, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  advanceText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
});
