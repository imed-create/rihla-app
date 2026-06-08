import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProTabShell from '@/components/dashboard/TabShell';
import EmptyState from '@/components/shared/EmptyState';
import { showToast } from '@/components/Toast';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import type { Order, OrderStatus } from '@/types/order';
import { hapticLight } from '@/utils/haptics';

function elapsed(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'on_the_way',
  on_the_way: 'delivered',
};

export default function BusinessOrders() {
  const { orders, updateOrderStatus } = useApp();
  const active = [...orders]
    .filter((o) => o.status !== 'delivered')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const advance = (order: Order) => {
    hapticLight();
    const next = NEXT[order.status];
    if (next) {
      updateOrderStatus(order.id, next);
      showToast(`Order → ${next.replace('_', ' ')}`, 'success');
    }
  };

  const actionLabel = (s: OrderStatus) => {
    if (s === 'pending') return 'Accept → Preparing';
    if (s === 'preparing') return 'Mark Ready';
    if (s === 'on_the_way') return 'Delivered';
    return '';
  };

  return (
    <ProTabShell role="business" title="Food Orders" subtitle="Live kitchen queue">
      <FlatList
        data={active}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-outline"
            title="No active orders"
            subtitle="Food orders from the beach will show up here in real time."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.spot}>Spot {item.spotLabel ?? '—'}</Text>
              <Text style={styles.time}>{elapsed(item.createdAt)}</Text>
            </View>
            {item.items.map((line) => (
              <Text key={line.menuItemId} style={styles.line}>
                {line.quantity}× {line.name}
              </Text>
            ))}
            <Text style={styles.total}>{item.totalDZD.toLocaleString()} DZD</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
              </View>
              {item.status !== 'delivered' && (
                <Pressable style={styles.btn} onPress={() => advance(item)}>
                  <Text style={styles.btnText}>{actionLabel(item.status)}</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </ProTabShell>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, flexGrow: 1 },
  card: {
    backgroundColor: RIHLA.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RIHLA.border,
    padding: 14,
    marginBottom: 10,
    gap: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  spot: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  time: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  line: { fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText },
  total: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary, marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  statusPill: { backgroundColor: RIHLA.muted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.primary, textTransform: 'capitalize' },
  btn: { backgroundColor: RIHLA.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
});
