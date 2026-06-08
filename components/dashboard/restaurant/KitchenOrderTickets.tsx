/**
 * RIHLA — Restaurant Dashboard
 * ──────────────────────────────
 * Identity: Warm Amber/Terracotta #C56A39
 * Tabs: Kitchen (live KDS) · Tables · Menu · Revenue
 *
 * A restaurant owner sees a real-time kitchen display system,
 * table floor plan, live menu CRUD, and daily revenue breakdown.
 * Nothing like a hotel. Nothing generic.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

// ── Restaurant brand colours ────────────────────────────────
const R = {
  brand:   '#C56A39',
  brandLt: '#FEF3E8',
  green:   '#10B981',
  red:     '#EF4444',
  amber:   '#F59E0B',
  navy:    '#0a2540',
};

// ── Mock data ───────────────────────────────────────────────
let ORDER_ID = 1005;
const INITIAL_ORDERS = [
  { id: '1001', table: 'T-04', items: [{ name: 'Couscous Mechoui', qty: 2 }, { name: 'Mint Tea', qty: 3 }], status: 'pending',   time: '12m ago', notes: 'Extra sauce' },
  { id: '1002', table: 'T-09', items: [{ name: 'Chorba Frik', qty: 4 }, { name: 'Bourek', qty: 4 }],       status: 'preparing', time: '8m ago',  notes: 'Serve hot' },
  { id: '1003', table: 'T-02', items: [{ name: 'Tajine Zitoun', qty: 1 }],                                  status: 'ready',     time: '3m ago',  notes: '' },
  { id: '1004', table: 'T-07', items: [{ name: 'Grilled Sea Bass', qty: 2 }],                               status: 'pending',   time: '1m ago',  notes: '' },
];

const TABLES = [
  { id: 'T01', seats: 2, status: 'free' },
  { id: 'T02', seats: 4, status: 'occupied', guests: 2 },
  { id: 'T03', seats: 4, status: 'reserved' },
  { id: 'T04', seats: 6, status: 'occupied', guests: 5 },
  { id: 'T05', seats: 2, status: 'free' },
  { id: 'T06', seats: 8, status: 'occupied', guests: 7 },
  { id: 'T07', seats: 4, status: 'occupied', guests: 3 },
  { id: 'T08', seats: 2, status: 'reserved' },
  { id: 'T09', seats: 6, status: 'occupied', guests: 4 },
];

const MENU_ITEMS = [
  { id: 'm1', name: 'Couscous Mechoui',  category: 'Main',    priceDZD: 1800, available: true,  orders: 24 },
  { id: 'm2', name: 'Chorba Frik',       category: 'Starter', priceDZD: 800,  available: true,  orders: 18 },
  { id: 'm3', name: 'Tajine Zitoun',     category: 'Main',    priceDZD: 1600, available: true,  orders: 15 },
  { id: 'm4', name: 'Grilled Sea Bass',  category: 'Main',    priceDZD: 2400, available: false, orders: 9 },
  { id: 'm5', name: 'Bourek',            category: 'Starter', priceDZD: 600,  available: true,  orders: 31 },
  { id: 'm6', name: 'Mint Tea',          category: 'Drinks',  priceDZD: 300,  available: true,  orders: 42 },
];

const REVENUE_HOURS = [
  { h: '10', dzd: 12000 }, { h: '11', dzd: 22000 }, { h: '12', dzd: 48000 },
  { h: '13', dzd: 67000 }, { h: '14', dzd: 54000 }, { h: '15', dzd: 32000 },
  { h: '16', dzd: 18000 }, { h: '17', dzd: 29000 }, { h: '18', dzd: 45000 },
];

type OrderStatus = 'pending' | 'preparing' | 'ready';
const NEXT: Record<OrderStatus, string> = { pending: 'preparing', preparing: 'ready', ready: 'completed' };
const TABS = ['Kitchen', 'Tables', 'Menu', 'Revenue'] as const;
type Tab = typeof TABS[number];

function tableColors(status: string) {
  if (status === 'occupied') return { bg: '#FEF3E8', border: '#F5C09A', dot: R.brand };
  if (status === 'reserved') return { bg: '#FFFBEB', border: '#FDE68A', dot: R.amber };
  return { bg: '#F0FDF4', border: '#BBF7D0', dot: R.green };
}

// ═══════════════════════════════════════════════════════════════
export default function KitchenOrderTickets() {
  const [tab, setTab]       = useState<Tab>('Kitchen');
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [menu, setMenu]     = useState(MENU_ITEMS);

  const pending   = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing').length;
  const ready     = orders.filter(o => o.status === 'ready').length;
  const occupied  = TABLES.filter(t => t.status === 'occupied').length;
  const maxRevenue = Math.max(...REVENUE_HOURS.map(h => h.dzd));
  const todayRevenue = REVENUE_HOURS.reduce((s, h) => s + h.dzd, 0);

  const advanceOrder = (id: string, status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = NEXT[status as OrderStatus];
    if (next === 'completed') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setOrders(prev => prev.filter(o => o.id !== id));
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    }
  };

  const toggleMenu = (id: string) => {
    Haptics.selectionAsync();
    setMenu(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
  };

  return (
    <View style={styles.root}>
      {/* ── KPI strip ── */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.kpiVal, { color: R.amber }]}>{pending}</Text>
          <Text style={styles.kpiLbl}>Pending</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: R.brandLt }]}>
          <Text style={[styles.kpiVal, { color: R.brand }]}>{preparing}</Text>
          <Text style={styles.kpiLbl}>Cooking</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.kpiVal, { color: R.green }]}>{ready}</Text>
          <Text style={styles.kpiLbl}>Ready</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#F8FAFC' }]}>
          <Text style={[styles.kpiVal, { color: R.navy }]}>{occupied}/{TABLES.length}</Text>
          <Text style={styles.kpiLbl}>Tables</Text>
        </View>
      </View>

      {/* ── Internal tab bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable
            key={t}
            style={[styles.tabPill, tab === t && { backgroundColor: R.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
          >
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── KITCHEN TAB ── Live KDS ── */}
        {tab === 'Kitchen' && (
          <>
            <Text style={styles.sectionTitle}>🍳 Live Kitchen Display</Text>
            <Text style={styles.sectionSub}>Tap action to advance ticket state</Text>
            {orders.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons name="checkmark-circle-outline" size={48} color={R.green} />
                <Text style={styles.emptyText}>Kitchen clear — all orders served!</Text>
              </View>
            )}
            {orders.map(order => {
              let stripe = R.amber;
              let statusLabel = 'Pending';
              let actionLabel = 'Start Cooking';
              let actionBg = R.brand;

              if (order.status === 'preparing') { stripe = R.brand; statusLabel = 'Cooking 🔥'; actionLabel = 'Mark Ready'; actionBg = R.green; }
              if (order.status === 'ready')     { stripe = R.green; statusLabel = '✓ Ready';   actionLabel = 'Served — Done'; actionBg = R.navy; }

              return (
                <View key={order.id} style={styles.ticket}>
                  <View style={[styles.ticketStripe, { backgroundColor: stripe }]} />
                  <View style={styles.ticketBody}>
                    <View style={styles.ticketTop}>
                      <View>
                        <Text style={styles.ticketTable}>{order.table}</Text>
                        <Text style={styles.ticketTime}>{order.time}</Text>
                      </View>
                      <View style={[styles.ticketBadge, { borderColor: stripe }]}>
                        <Text style={[styles.ticketBadgeText, { color: stripe }]}>{statusLabel}</Text>
                      </View>
                    </View>
                    <View style={styles.ticketItems}>
                      {order.items.map((item, i) => (
                        <View key={i} style={styles.itemRow}>
                          <View style={[styles.qtyBubble, { backgroundColor: R.brandLt }]}>
                            <Text style={[styles.qtyText, { color: R.brand }]}>{item.qty}</Text>
                          </View>
                          <Text style={styles.itemName}>{item.name}</Text>
                        </View>
                      ))}
                    </View>
                    {order.notes ? (
                      <View style={styles.noteRow}>
                        <Ionicons name="alert-circle-outline" size={13} color={R.amber} />
                        <Text style={styles.noteText}>{order.notes}</Text>
                      </View>
                    ) : null}
                    <Pressable style={[styles.actionBtn, { backgroundColor: actionBg }]} onPress={() => advanceOrder(order.id, order.status)}>
                      <Text style={styles.actionBtnText}>{actionLabel}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── TABLES TAB ── Floor plan ── */}
        {tab === 'Tables' && (
          <>
            <Text style={styles.sectionTitle}>🪑 Restaurant Floor Plan</Text>
            <Text style={styles.sectionSub}>{occupied} of {TABLES.length} tables occupied</Text>
            {/* Legend */}
            <View style={styles.legend}>
              {[['#F0FDF4', '#BBF7D0', R.green, 'Free'], ['#FEF3E8', '#F5C09A', R.brand, 'Occupied'], ['#FFFBEB', '#FDE68A', R.amber, 'Reserved']].map(([bg, bd, dot, label]) => (
                <View key={String(label)} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: String(dot) }]} />
                  <Text style={styles.legendText}>{String(label)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.tableGrid}>
              {TABLES.map(table => {
                const { bg, border, dot } = tableColors(table.status);
                return (
                  <Pressable
                    key={table.id}
                    style={[styles.tableCell, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={[styles.tableDot, { backgroundColor: dot }]} />
                    <Text style={styles.tableId}>{table.id}</Text>
                    <Text style={styles.tableSeats}>{table.seats} seats</Text>
                    {table.status === 'occupied' && 'guests' in table && (
                      <Text style={styles.tableGuests}>{(table as any).guests} guests</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* ── MENU TAB ── Live toggle ── */}
        {tab === 'Menu' && (
          <>
            <Text style={styles.sectionTitle}>📋 Live Menu Control</Text>
            <Text style={styles.sectionSub}>Toggle availability in real-time</Text>
            {['Starter', 'Main', 'Drinks'].map(cat => (
              <View key={cat}>
                <Text style={styles.catLabel}>{cat}</Text>
                {menu.filter(m => m.category === cat).map(item => (
                  <View key={item.id} style={[styles.menuItem, !item.available && { opacity: 0.55 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      <Text style={styles.menuMeta}>{item.priceDZD.toLocaleString()} DZD · {item.orders} orders today</Text>
                    </View>
                    <Pressable
                      style={[styles.toggle, { backgroundColor: item.available ? R.brand : '#E5E7EB' }]}
                      onPress={() => toggleMenu(item.id)}
                    >
                      <View style={[styles.toggleThumb, { transform: [{ translateX: item.available ? 18 : 2 }] }]} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* ── REVENUE TAB ── Hourly chart ── */}
        {tab === 'Revenue' && (
          <>
            <View style={styles.revCard}>
              <Text style={styles.revTotal}>{(todayRevenue / 1000).toFixed(0)}K DZD</Text>
              <Text style={styles.revLabel}>Today's Revenue</Text>
              <View style={styles.revPills}>
                <View style={[styles.revPill, { backgroundColor: R.brandLt }]}>
                  <Text style={[styles.revPillText, { color: R.brand }]}>+12% vs yesterday</Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Hourly Breakdown</Text>
            <View style={styles.barChart}>
              {REVENUE_HOURS.map(h => (
                <View key={h.h} style={styles.barCol}>
                  <Text style={styles.barAmt}>{(h.dzd / 1000).toFixed(0)}K</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(h.dzd / maxRevenue) * 100}%`, backgroundColor: R.brand }]} />
                  </View>
                  <Text style={styles.barLbl}>{h.h}h</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Top Sellers</Text>
            {[...menu].sort((a, b) => b.orders - a.orders).slice(0, 4).map((item, i) => (
              <View key={item.id} style={styles.topRow}>
                <Text style={styles.topRank}>#{i + 1}</Text>
                <Text style={styles.topName}>{item.name}</Text>
                <View style={styles.topBarWrap}>
                  <View style={[styles.topBarFill, { width: `${(item.orders / menu[0].orders) * 100}%`, backgroundColor: R.brand }]} />
                </View>
                <Text style={styles.topOrders}>{item.orders}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },

  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' },
  kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },

  tabBar: { marginBottom: 16 },
  tabContent: { gap: 8, paddingRight: 8 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },

  content: { gap: 12, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },
  sectionSub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },

  emptyBox: { alignItems: 'center', gap: 12, paddingVertical: 40, backgroundColor: '#F0FDF4', borderRadius: 20 },
  emptyText: { fontSize: 14, fontFamily: 'mon-sb', color: R.green },

  // Kitchen tickets
  ticket: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  ticketStripe: { width: 5 },
  ticketBody: { flex: 1, padding: 14, gap: 10 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketTable: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  ticketTime: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  ticketBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  ticketBadgeText: { fontSize: 10, fontFamily: 'mon-sb' },
  ticketItems: { gap: 6, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBubble: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontFamily: 'mon-b' },
  itemName: { fontSize: 14, fontFamily: 'mon-sb', color: '#111827', flex: 1 },
  noteRow: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#FFFBEB', borderRadius: 8, padding: 8 },
  noteText: { fontSize: 11, fontFamily: 'mon', color: '#B45309', flex: 1 },
  actionBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 11, borderRadius: 12 },
  actionBtnText: { color: '#fff', fontFamily: 'mon-sb', fontSize: 13 },

  // Tables
  legend: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tableCell: { width: '30%', borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 3 },
  tableDot: { width: 8, height: 8, borderRadius: 4 },
  tableId: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  tableSeats: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },
  tableGuests: { fontSize: 10, fontFamily: 'mon-sb', color: R.brand },

  // Menu
  catLabel: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 8, marginBottom: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 8 },
  menuName: { fontSize: 14, fontFamily: 'mon-sb', color: '#111827' },
  menuMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  toggle: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center', padding: 2 },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },

  // Revenue
  revCard: { backgroundColor: R.brandLt, borderRadius: 20, padding: 20, alignItems: 'center', gap: 4 },
  revTotal: { fontSize: 36, fontFamily: 'mon-b', color: R.brand },
  revLabel: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  revPills: { flexDirection: 'row', gap: 8, marginTop: 4 },
  revPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  revPillText: { fontSize: 12, fontFamily: 'mon-sb' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 110, marginTop: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 3 },
  barAmt: { fontSize: 7, fontFamily: 'mon-sb', color: '#9CA3AF' },
  barTrack: { flex: 1, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { borderRadius: 5 },
  barLbl: { fontSize: 8, fontFamily: 'mon-sb', color: '#9CA3AF' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topRank: { fontSize: 13, fontFamily: 'mon-b', color: R.brand, width: 24 },
  topName: { fontSize: 12, fontFamily: 'mon-sb', color: '#111827', width: 110 },
  topBarWrap: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  topBarFill: { height: '100%', borderRadius: 3 },
  topOrders: { width: 28, fontSize: 12, fontFamily: 'mon-b', color: '#6B7280', textAlign: 'right' },
});
