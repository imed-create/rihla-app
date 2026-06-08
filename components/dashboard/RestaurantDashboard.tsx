/**
 * RIHLA — Restaurant Business Dashboard
 * ──────────────────────────────────────
 * Clean visual design featuring order status tracking, menu indicators, and pipeline management.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { showToast } from '@/components/Toast';

const MOCK_ORDERS = [
  { id: 'o1', table: 'Table 5', items: 'Couscous Royal × 2', status: 'preparing' as const, elapsed: '8 min', totalDZD: 5000 },
  { id: 'o2', table: 'Table 12', items: 'Grilled Sea Bass, Mint Tea × 3', status: 'ready' as const, elapsed: '2 min', totalDZD: 4200 },
  { id: 'o3', table: 'Delivery #14', items: 'Pizza Margherita × 1, Salad', status: 'pending' as const, elapsed: '—', totalDZD: 2800 },
  { id: 'o4', table: 'Table 3', items: 'Tagine × 3, Orange Juice × 3', status: 'preparing' as const, elapsed: '15 min', totalDZD: 7500 },
];

const STATUS_CONFIG = {
  pending: { color: '#94A3B8', bg: '#F1F5F9', label: 'Pending' },
  preparing: { color: '#B45309', bg: '#FEF3C7', label: 'Preparing' },
  ready: { color: '#059669', bg: '#D1FAE5', label: 'Ready' },
  delivered: { color: '#6366F1', bg: '#EEF2FF', label: 'Delivered' },
};

const MENU_STATS = [
  { label: 'Active Dishes', value: '48', icon: 'restaurant-outline' as const, color: RIHLA.accent },
  { label: 'Tables Served', value: '34', icon: 'people-outline' as const, color: RIHLA.primary },
  { label: 'Avg Ticket (DZD)', value: '3,200', icon: 'receipt-outline' as const, color: RIHLA.highlight },
  { label: 'Deliveries', value: '7', icon: 'bicycle-outline' as const, color: '#A855F7' },
];

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState<Array<{ id: string; table: string; items: string; status: OrderStatus; elapsed: string; totalDZD: number }>>(MOCK_ORDERS);

  const advanceOrder = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next: Record<OrderStatus, OrderStatus> = {
          pending: 'preparing',
          preparing: 'ready',
          ready: 'delivered',
          delivered: 'delivered',
        };
        showToast(`Order updated → ${next[o.status]}`, 'success');
        return { ...o, status: next[o.status] };
      })
    );
  };

  const navigateTo = (path: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* ── STAT CARDS ── */}
      <View style={styles.statsGrid}>
        {MENU_STATS.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
              <Ionicons name={s.icon} size={20} color={s.color} />
            </View>
            <View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── KITCHEN PIPELINE ── */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>Kitchen Pipeline</Text>
          <Text style={styles.sectionSubtitle}>Tap card to advance status</Text>
        </View>
        <View style={styles.liveDot}>
          <View style={[styles.livePulse, { backgroundColor: RIHLA.accent }]} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <View style={styles.ordersWrap}>
        {orders.map((order) => {
          const conf = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
          return (
            <Pressable
              key={order.id}
              style={styles.orderRow}
              onPress={() => advanceOrder(order.id)}
            >
              <View style={styles.orderLeft}>
                <Text style={styles.orderTable}>{order.table}</Text>
                <Text style={styles.orderItems} numberOfLines={1}>{order.items}</Text>
                <Text style={styles.orderElapsed}>⏱ {order.elapsed}</Text>
              </View>
              <View style={styles.orderRight}>
                <View style={[styles.statusBadge, { backgroundColor: conf.bg }]}>
                  <Text style={[styles.statusText, { color: conf.color }]}>{conf.label}</Text>
                </View>
                <Text style={styles.orderTotal}>{order.totalDZD.toLocaleString()} DZD</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ── QUICK ACTIONS ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Manage Operations</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionBtn} onPress={() => navigateTo('/(business)/orders')}>
          <Ionicons name="fast-food-outline" size={22} color={RIHLA.accent} />
          <Text style={styles.actionBtnText}>All Orders</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigateTo('/(business)/listings')}>
          <Ionicons name="list-outline" size={22} color={RIHLA.primary} />
          <Text style={styles.actionBtnText}>Menu Items</Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={() => navigateTo('/(business)/promotions')}>
          <Ionicons name="pricetag-outline" size={22} color={RIHLA.highlight} />
          <Text style={styles.actionBtnText}>Promotions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },

  // Headers
  sectionHeader: { gap: 2, marginTop: 4 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSubtitle: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  
  liveDot: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E6FAF7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  livePulse: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.primary },

  // Orders
  ordersWrap: { gap: 10 },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  orderLeft: { flex: 1, gap: 4 },
  orderTable: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  orderItems: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  orderElapsed: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: 'mon-b', textTransform: 'capitalize' },
  orderTotal: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.dark, textAlign: 'center' },
});

