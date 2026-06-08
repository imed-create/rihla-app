/**
 * RIHLA — Hotel Business Dashboard
 * ─────────────────────────────────
 * Internal tabs: Rooms · Check-ins · Housekeeping · Revenue
 * Unique identity: Forest Green, bed/room management UI
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

import { router } from 'expo-router';
import HotelInventoryCalendar from './HotelInventoryCalendar';

// ── Brand colours for Hotel ──────────────────────────────────
const H = {
  brand:   '#1A6B3A',  // forest green
  brandLt: '#E6F4EC',
  amber:   '#F59E0B',
  red:     '#EF4444',
  green:   '#10B981',
};

// ── Mock data ────────────────────────────────────────────────
const ROOMS = [
  { id: '101', type: 'Standard',       status: 'available',   guest: null,            checkout: null },
  { id: '102', type: 'Standard',       status: 'occupied',    guest: 'Kamel Rahmani', checkout: 'Jun 10' },
  { id: '103', type: 'Standard',       status: 'maintenance', guest: null,            checkout: null },
  { id: '201', type: 'Double',         status: 'occupied',    guest: 'Fatiha Meriem', checkout: 'Jun 09' },
  { id: '202', type: 'Double',         status: 'available',   guest: null,            checkout: null },
  { id: '203', type: 'Double',         status: 'occupied',    guest: 'Yacine Belkacem',checkout: 'Jun 12' },
  { id: '301', type: 'Executive Suite',status: 'maintenance', guest: null,            checkout: null },
  { id: '302', type: 'Executive Suite',status: 'occupied',    guest: 'Sofia Benali',  checkout: 'Jun 15' },
];

const CHECKINS = [
  { id: 'ci1', guest: 'Rania Meziane',   room: '202', time: '14:00', status: 'expected', nights: 3, priceDZD: 18000 },
  { id: 'ci2', guest: 'Djamel Haroun',   room: '104', time: '15:30', status: 'expected', nights: 1, priceDZD: 6000 },
  { id: 'ci3', guest: 'Nadia Saouli',    room: '205', time: '16:00', status: 'arrived',  nights: 5, priceDZD: 30000 },
];

const HK_TASKS = [
  { id: 'hk1', room: '101', task: 'Deep Clean',      assignee: 'Fatima', status: 'done' },
  { id: 'hk2', room: '103', task: 'Maintenance Fix',  assignee: 'Youcef', status: 'inprogress' },
  { id: 'hk3', room: '201', task: 'Turnover Clean',   assignee: 'Amina',  status: 'pending' },
  { id: 'hk4', room: '202', task: 'Welcome Setup',    assignee: 'Fatima', status: 'pending' },
];

const REVENUE_DAYS = [
  { day: 'Mon', dzd: 48000 },
  { day: 'Tue', dzd: 62000 },
  { day: 'Wed', dzd: 35000 },
  { day: 'Thu', dzd: 71000 },
  { day: 'Fri', dzd: 89000 },
  { day: 'Sat', dzd: 94000 },
  { day: 'Sun', dzd: 52000 },
];

const TABS = ['Rooms', 'Check-ins', 'Housekeeping', 'Revenue', 'Inventory'] as const;
type Tab = typeof TABS[number];

// ── Room status helpers ───────────────────────────────────────
function roomColors(status: string) {
  if (status === 'occupied')    return { bg: '#EEF7F1', border: '#A7D9B5', text: H.brand };
  if (status === 'maintenance') return { bg: '#FEF2F2', border: '#FCA5A5', text: H.red };
  return { bg: '#F0FDF4', border: '#BBF7D0', text: H.green };
}

// ═══════════════════════════════════════════════════════════════
export default function HotelOverview() {
  const [tab, setTab] = useState<Tab>('Rooms');
  const [rooms, setRooms] = useState(ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<typeof ROOMS[0] | null>(null);

  const occupied    = rooms.filter(r => r.status === 'occupied').length;
  const maintenance = rooms.filter(r => r.status === 'maintenance').length;
  const available   = rooms.length - occupied - maintenance;
  const occupancyPct = Math.round((occupied / rooms.length) * 100);
  const maxRevenue  = Math.max(...REVENUE_DAYS.map(d => d.dzd));
  const weekTotal   = REVENUE_DAYS.reduce((s, d) => s + d.dzd, 0);

  const handleStatusChange = (id: string, st: 'available' | 'occupied' | 'maintenance') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status: st } : r));
    setSelectedRoom(null);
  };

  return (
    <View style={styles.root}>
      {/* ── KPI strip ── */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: H.brandLt }]}>
          <Text style={[styles.kpiVal, { color: H.brand }]}>{occupancyPct}%</Text>
          <Text style={styles.kpiLbl}>Occupancy</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.kpiVal, { color: H.green }]}>{available}</Text>
          <Text style={styles.kpiLbl}>Available</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.kpiVal, { color: H.red }]}>{maintenance}</Text>
          <Text style={styles.kpiLbl}>Maintenance</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.kpiVal, { color: H.amber }]}>{CHECKINS.length}</Text>
          <Text style={styles.kpiLbl}>Arrivals</Text>
        </View>
      </View>

      {/* ── Inner tab bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map(t => (
          <Pressable
            key={t}
            style={[styles.tabPill, tab === t && { backgroundColor: H.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
          >
            <Text style={[styles.tabPillText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Tab content ── */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {tab === 'Rooms' && (
          <>
            <Text style={styles.sectionTitle}>Room Operational Map</Text>
            <Text style={styles.sectionSub}>Tap a room to manage its status</Text>
            <View style={styles.roomGrid}>
              {rooms.map(room => {
                const { bg, border, text } = roomColors(room.status);
                return (
                  <Pressable
                    key={room.id}
                    style={[styles.roomCell, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSelectedRoom(room); }}
                  >
                    <Text style={[styles.roomNumber, { color: text }]}>{room.id}</Text>
                    <Text style={styles.roomType}>{room.type}</Text>
                    <View style={styles.dotRow}>
                      <View style={[styles.dot, { backgroundColor: text }]} />
                      <Text style={[styles.dotText, { color: text }]}>{room.status}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {tab === 'Check-ins' && (
          <>
            <Text style={styles.sectionTitle}>Today's Arrivals & Departures</Text>
            {CHECKINS.map(ci => (
              <View key={ci.id} style={styles.ciCard}>
                <View style={styles.ciAvatar}>
                  <Text style={styles.ciAvatarText}>{ci.guest.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ciName}>{ci.guest}</Text>
                  <Text style={styles.ciMeta}>Room {ci.room} · {ci.nights} nights · {ci.time}</Text>
                </View>
                <View>
                  <View style={[styles.ciBadge, ci.status === 'arrived' ? { backgroundColor: H.brandLt } : { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.ciBadgeText, { color: ci.status === 'arrived' ? H.brand : '#B45309' }]}>
                      {ci.status === 'arrived' ? '✓ Arrived' : 'Expected'}
                    </Text>
                  </View>
                  <Text style={styles.ciPrice}>{ci.priceDZD.toLocaleString()} DZD</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Housekeeping' && (
          <>
            <Text style={styles.sectionTitle}>Housekeeping Tasks</Text>
            {HK_TASKS.map(task => (
              <View key={task.id} style={styles.hkCard}>
                <View style={[styles.hkStatusStripe, {
                  backgroundColor: task.status === 'done' ? H.green : task.status === 'inprogress' ? H.amber : '#CBD5E1',
                }]} />
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text style={styles.hkRoom}>Room {task.room}</Text>
                  <Text style={styles.hkTask}>{task.task}</Text>
                  <Text style={styles.hkAssignee}>👤 {task.assignee}</Text>
                </View>
                <View style={[styles.hkBadge, {
                  backgroundColor: task.status === 'done' ? '#F0FDF4' : task.status === 'inprogress' ? '#FFFBEB' : '#F1F5F9',
                }]}>
                  <Text style={[styles.hkBadgeText, {
                    color: task.status === 'done' ? H.green : task.status === 'inprogress' ? H.amber : '#94A3B8',
                  }]}>
                    {task.status === 'inprogress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Inventory' && (
          <>
            <Text style={styles.sectionTitle}>📅 Inventory & Availability Calendar</Text>
            <Text style={styles.sectionSub}>Manage room inventory, seasonal rates, and availability</Text>
            <HotelInventoryCalendar />
          </>
        )}

        {tab === 'Revenue' && (
          <>
            <Text style={styles.sectionTitle}>This Week's Revenue</Text>
            <View style={styles.revenueTotal}>
              <Text style={styles.revenueTotalVal}>{(weekTotal / 1000).toFixed(0)}K DZD</Text>
              <Text style={styles.revenueTotalLbl}>7-day total</Text>
            </View>
            <View style={styles.barChart}>
              {REVENUE_DAYS.map(d => (
                <View key={d.day} style={styles.barCol}>
                  <Text style={styles.barAmt}>{(d.dzd / 1000).toFixed(0)}K</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(d.dzd / maxRevenue) * 100}%`, backgroundColor: H.brand }]} />
                  </View>
                  <Text style={styles.barDay}>{d.day}</Text>
                </View>
              ))}
            </View>
            {/* Room-type revenue breakdown */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>By Room Type</Text>
            {['Standard', 'Double', 'Executive Suite'].map((type, i) => {
              const vals = [42000, 68000, 51000];
              const pct = Math.round((vals[i] / (42000 + 68000 + 51000)) * 100);
              return (
                <View key={type} style={styles.revTypeRow}>
                  <Text style={styles.revTypeName}>{type}</Text>
                  <View style={styles.revTypeBar}>
                    <View style={[styles.revTypeFill, { width: `${pct}%`, backgroundColor: H.brand }]} />
                  </View>
                  <Text style={styles.revTypeVal}>{(vals[i] / 1000).toFixed(0)}K</Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* ── Room detail modal ── */}
      {selectedRoom && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedRoom(null)}>
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Room {selectedRoom.id} · {selectedRoom.type}</Text>
                <Pressable onPress={() => setSelectedRoom(null)}>
                  <Ionicons name="close" size={24} color={RIHLA.dark} />
                </Pressable>
              </View>
              {selectedRoom.guest && (
                <View style={styles.modalInfo}>
                  <Ionicons name="person-outline" size={16} color={RIHLA.mutedText} />
                  <Text style={styles.modalInfoText}>{selectedRoom.guest} · Checkout {selectedRoom.checkout}</Text>
                </View>
              )}
              <Text style={styles.modalActionLabel}>Change Room Status</Text>
              <View style={styles.modalBtns}>
                <Pressable style={[styles.modalBtn, { backgroundColor: '#F0FDF4' }]} onPress={() => handleStatusChange(selectedRoom.id, 'available')}>
                  <Text style={{ color: H.green, fontFamily: 'mon-sb', fontSize: 12 }}>✓ Available</Text>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: H.brandLt }]} onPress={() => handleStatusChange(selectedRoom.id, 'occupied')}>
                  <Text style={{ color: H.brand, fontFamily: 'mon-sb', fontSize: 12 }}>🛏 Occupied</Text>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: '#FEF2F2' }]} onPress={() => handleStatusChange(selectedRoom.id, 'maintenance')}>
                  <Text style={{ color: H.red, fontFamily: 'mon-sb', fontSize: 12 }}>🔧 Maintenance</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 0 },

  // KPI strip
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 20, fontFamily: 'mon-b' },
  kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },

  // Tab bar
  tabBar: { marginBottom: 16 },
  tabBarContent: { gap: 8, paddingRight: 8 },
  tabPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabPillText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },

  content: { gap: 12, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSub: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: -8 },

  // Rooms tab
  roomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roomCell: { width: '31%', borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  roomNumber: { fontSize: 16, fontFamily: 'mon-b' },
  roomType: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText, textAlign: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotText: { fontSize: 9, fontFamily: 'mon-sb', textTransform: 'capitalize' },

  // Check-ins tab
  ciCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  ciAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: H.brandLt, alignItems: 'center', justifyContent: 'center' },
  ciAvatarText: { fontSize: 18, fontFamily: 'mon-b', color: H.brand },
  ciName: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.dark },
  ciMeta: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  ciBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-end', marginBottom: 4 },
  ciBadgeText: { fontSize: 10, fontFamily: 'mon-sb' },
  ciPrice: { fontSize: 12, fontFamily: 'mon-b', color: RIHLA.dark, textAlign: 'right' },

  // Housekeeping tab
  hkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  hkStatusStripe: { width: 5, alignSelf: 'stretch' },
  hkRoom: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  hkTask: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280', marginTop: 1 },
  hkAssignee: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  hkBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginRight: 12 },
  hkBadgeText: { fontSize: 11, fontFamily: 'mon-sb' },

  // Revenue tab
  revenueTotal: { backgroundColor: H.brandLt, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 4 },
  revenueTotalVal: { fontSize: 32, fontFamily: 'mon-b', color: H.brand },
  revenueTotalLbl: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barAmt: { fontSize: 8, fontFamily: 'mon-sb', color: '#6B7280' },
  barTrack: { flex: 1, width: '100%', backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { borderRadius: 6 },
  barDay: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  revTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  revTypeName: { width: 110, fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.dark },
  revTypeBar: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  revTypeFill: { height: '100%', borderRadius: 4 },
  revTypeVal: { width: 40, fontSize: 12, fontFamily: 'mon-b', color: RIHLA.dark, textAlign: 'right' },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 17, fontFamily: 'mon-b', color: RIHLA.dark },
  modalInfo: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10 },
  modalInfoText: { fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText },
  modalActionLabel: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  modalBtns: { flexDirection: 'row', gap: 8 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
});
