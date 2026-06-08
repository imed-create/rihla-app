/**
 * RIHLA — Hotel Inventory & Availability Calendar
 * ─────────────────────────────────────────────────
 * PROMPTFULL §Tab 2: 🗓️ Inventory & Availability Calendar
 *
 * Features:
 * - Interactive monthly calendar grid with booking status overlays
 * - Room Status Matrix (Available / Occupied / Maintenance / Cleaning)
 * - Seasonal block-out dates & rate adjustments
 * - Tap any date to see room-level breakdown
 * - Mini KPI strip: occupancy %, available rooms, maintenance count
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

// ── Theme ──
const H = {
  brand:   '#1A6B3A',
  brandLt: '#E6F4EC',
  amber:   '#F59E0B',
  red:     '#EF4444',
  green:   '#10B981',
};

// ── Types ──
type BookingStatus = 'booked' | 'check-in' | 'check-out' | 'blocked' | 'available';
type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

interface CalendarDay {
  date: Date;
  dayNum: number;
  dayName: string;
  month: string;
  isToday: boolean;
  isPast: boolean;
  status: BookingStatus;
  bookings: number;
  revenue: number;
}

interface Room {
  id: string;
  number: string;
  type: string;
  status: RoomStatus;
  guest?: string;
  checkout?: string;
}

// ── Mock Data ──
const MOCK_ROOMS: Room[] = [
  { id: '101', number: '101', type: 'Standard',   status: 'available'},
  { id: '102', number: '102', type: 'Standard',   status: 'occupied',   guest: 'Kamel R.',   checkout: 'Jun 12' },
  { id: '103', number: '103', type: 'Standard',   status: 'maintenance' },
  { id: '104', number: '104', type: 'Standard',   status: 'available' },
  { id: '105', number: '105', type: 'Standard',   status: 'cleaning' },
  { id: '201', number: '201', type: 'Double',     status: 'occupied',   guest: 'Fatiha M.', checkout: 'Jun 11' },
  { id: '202', number: '202', type: 'Double',     status: 'available' },
  { id: '203', number: '203', type: 'Double',     status: 'occupied',   guest: 'Yacine B.', checkout: 'Jun 14' },
  { id: '204', number: '204', type: 'Double',     status: 'available' },
  { id: '301', number: '301', type: 'Suite',      status: 'occupied',   guest: 'Sofia B.',  checkout: 'Jun 16' },
  { id: '302', number: '302', type: 'Suite',      status: 'maintenance' },
  { id: '401', number: '401', type: 'Penthouse',  status: 'available' },
];

function generateMonthDays(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const rand = Math.random();
    days.push({
      date,
      dayNum: d,
      dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      month: date.toLocaleDateString('en', { month: 'short' }),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      status: rand < 0.35 ? 'booked' : rand < 0.45 ? 'check-in' : rand < 0.50 ? 'check-out' : rand < 0.55 ? 'blocked' : 'available',
      bookings: Math.floor(rand * 4),
      revenue: Math.floor(rand * 80000),
    });
  }
  return days;
}

const TABS = ['Calendar', 'Room Status', 'Seasonal Rates'] as const;
type Tab = typeof TABS[number];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ═══════════════════════════════════════════════════════════════
export default function HotelInventoryCalendar() {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [tab, setTab] = useState<Tab>('Calendar');
  const [rooms] = useState(MOCK_ROOMS);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [roomFilter, setRoomFilter] = useState<RoomStatus | 'all'>('all');

  const days = useMemo(() => generateMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const availCount = rooms.filter(r => r.status === 'available').length;
  const maintCount = rooms.filter(r => r.status === 'maintenance').length;
  const cleaningCount = rooms.filter(r => r.status === 'cleaning').length;
  const occupancyPct = Math.round((occupiedCount / rooms.length) * 100);

  const filteredRooms = roomFilter === 'all' ? rooms : rooms.filter(r => r.status === roomFilter);

  const navigateMonth = (dir: -1 | 1) => {
    Haptics.selectionAsync();
    let newMonth = viewMonth + dir;
    let newYear = viewYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  // Booking status color
  const dayStatusStyle = (status: BookingStatus, isPast: boolean) => {
    if (isPast) return { bg: '#F1F5F9', border: '#E2E8F0', dot: '#CBD5E1' };
    switch (status) {
      case 'booked':    return { bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' };
      case 'check-in':  return { bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' };
      case 'check-out': return { bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' };
      case 'blocked':   return { bg: '#F1F5F9', border: '#CBD5E1', dot: '#94A3B8' };
      default:          return { bg: '#FFFFFF', border: '#E2E8F0', dot: '#10B981' };
    }
  };

  // Room status colors
  const roomStatusStyle = (status: RoomStatus) => {
    switch (status) {
      case 'occupied':    return { bg: '#FEF2F2', text: '#EF4444', icon: 'close-circle' as const };
      case 'maintenance': return { bg: '#FFFBEB', text: '#F59E0B', icon: 'hammer-outline' as const };
      case 'cleaning':    return { bg: '#EFF6FF', text: '#3B82F6', icon: 'sparkles-outline' as const };
      default:            return { bg: '#F0FDF4', text: '#10B981', icon: 'checkmark-circle' as const };
    }
  };

  const totalRevenue = days.filter(d => !d.isPast).reduce((s, d) => s + d.revenue, 0);
  const bookedDays = days.filter(d => !d.isPast && d.status === 'booked').length;
  const totalFutureDays = days.filter(d => !d.isPast).length;

  return (
    <View style={styles.root}>
      {/* ── KPI strip ── */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: H.brandLt }]}>
          <Text style={[styles.kpiVal, { color: H.brand }]}>{occupancyPct}%</Text>
          <Text style={styles.kpiLbl}>Occupancy</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.kpiVal, { color: H.green }]}>{availCount}</Text>
          <Text style={styles.kpiLbl}>Available</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.kpiVal, { color: H.red }]}>{maintCount + cleaningCount}</Text>
          <Text style={styles.kpiLbl}>Out of Order</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.kpiVal, { color: H.amber }]}>{(totalRevenue / 1000).toFixed(0)}K</Text>
          <Text style={styles.kpiLbl}>Projected</Text>
        </View>
      </View>

      {/* ── Inner tabs ── */}
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ═══ CALENDAR TAB ═══ */}
        {tab === 'Calendar' && (
          <>
            {/* Month navigator */}
            <View style={styles.monthNav}>
              <Pressable onPress={() => navigateMonth(-1)} style={styles.monthArrow}>
                <Ionicons name="chevron-back" size={20} color={H.brand} />
              </Pressable>
              <Text style={styles.monthTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
              <Pressable onPress={() => navigateMonth(1)} style={styles.monthArrow}>
                <Ionicons name="chevron-forward" size={20} color={H.brand} />
              </Pressable>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <LegendDot color="#10B981" label="Available" />
              <LegendDot color="#EF4444" label="Booked" />
              <LegendDot color="#F59E0B" label="Check-out" />
              <LegendDot color="#94A3B8" label="Blocked" />
            </View>

            {/* Calendar grid */}
            <View style={styles.calGrid}>
              {/* Day headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <View key={d} style={styles.calHeader}>
                  <Text style={styles.calHeaderText}>{d}</Text>
                </View>
              ))}

              {/* Empty leading cells */}
              {Array.from({ length: new Date(viewYear, viewMonth, 1).getDay() === 0 ? 6 : new Date(viewYear, viewMonth, 1).getDay() - 1 }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.calCellEmpty} />
              ))}

              {/* Days */}
              {days.map((day, i) => {
                const ds = dayStatusStyle(day.status, day.isPast);
                return (
                  <Pressable
                    key={i}
                    style={[styles.calCell, { backgroundColor: ds.bg, borderColor: ds.border }, day.isToday && styles.calCellToday]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDay(day); }}
                  >
                    <Text style={[styles.calDayNum, day.isToday && { color: H.brand, fontFamily: 'mon-b' }, day.isPast && { color: '#CBD5E1' }]}>
                      {day.dayNum}
                    </Text>
                    {!day.isPast && day.status !== 'available' && (
                      <View style={[styles.calDot, { backgroundColor: ds.dot }]} />
                    )}
                    {day.bookings > 0 && !day.isPast && (
                      <Text style={styles.calBookings}>{day.bookings}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Booked days this month</Text>
                <Text style={styles.summaryValue}>{bookedDays} / {totalFutureDays}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Projected revenue</Text>
                <Text style={[styles.summaryValue, { color: H.brand }]}>{totalRevenue.toLocaleString()} DZD</Text>
              </View>
            </View>
          </>
        )}

        {/* ═══ ROOM STATUS TAB ═══ */}
        {tab === 'Room Status' && (
          <>
            <Text style={styles.sectionTitle}>Room Status Matrix</Text>
            <Text style={styles.sectionSub}>Tap a room to update its status</Text>

            {/* Filter bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {(['all', 'available', 'occupied', 'maintenance', 'cleaning'] as const).map(f => (
                <Pressable
                  key={f}
                  style={[styles.filterChip, roomFilter === f && { backgroundColor: H.brand }]}
                  onPress={() => { Haptics.selectionAsync(); setRoomFilter(f); }}
                >
                  <Text style={[styles.filterChipText, roomFilter === f && { color: '#fff' }]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Room grid */}
            <View style={styles.roomMatrix}>
              {filteredRooms.map(room => {
                const rs = roomStatusStyle(room.status);
                return (
                  <Pressable key={room.id} style={[styles.roomCell, { backgroundColor: rs.bg }]}>
                    <Text style={styles.roomCellNum}>{room.number}</Text>
                    <Text style={styles.roomCellType}>{room.type}</Text>
                    <View style={styles.roomCellStatus}>
                      <Ionicons name={rs.icon} size={12} color={rs.text} />
                      <Text style={[styles.roomCellStatusText, { color: rs.text }]}>
                        {room.status}
                      </Text>
                    </View>
                    {room.guest && (
                      <Text style={styles.roomCellGuest} numberOfLines={1}>{room.guest}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Stats footer */}
            <View style={styles.roomStatsRow}>
              <RoomStat label="Available" value={String(availCount)} color="#10B981" />
              <RoomStat label="Occupied" value={String(occupiedCount)} color="#EF4444" />
              <RoomStat label="Maintenance" value={String(maintCount)} color="#F59E0B" />
              <RoomStat label="Cleaning" value={String(cleaningCount)} color="#3B82F6" />
            </View>
          </>
        )}

        {/* ═══ SEASONAL RATES TAB ═══ */}
        {tab === 'Seasonal Rates' && (
          <>
            <Text style={styles.sectionTitle}>Seasonal Rate Adjustments</Text>
            <Text style={styles.sectionSub}>Set different rates for peak seasons and holidays</Text>

            {[
              { season: 'Summer Peak', period: 'Jun 15 – Sep 15', multiplier: '2.0x', color: '#EF4444', active: true },
              { season: 'Ramadan', period: 'Mar 1 – Mar 30', multiplier: '1.3x', color: '#F59E0B', active: false },
              { season: 'Eid al-Adha', period: 'Jun 7 – Jun 10', multiplier: '1.5x', color: '#8B5CF6', active: true },
              { season: 'Winter Low', period: 'Dec 1 – Feb 28', multiplier: '0.8x', color: '#3B82F6', active: false },
              { season: 'Spring Season', period: 'Mar 15 – May 31', multiplier: '1.1x', color: '#10B981', active: true },
              { season: 'National Holidays', period: 'Jul 5', multiplier: '1.4x', color: '#6366F1', active: false },
            ].map((s, i) => (
              <View key={i} style={styles.seasonCard}>
                <View style={[styles.seasonStripe, { backgroundColor: s.color }]} />
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <View style={styles.seasonTop}>
                    <Text style={styles.seasonName}>{s.season}</Text>
                    <View style={[styles.seasonBadge, { backgroundColor: s.color + '18' }]}>
                      <Text style={[styles.seasonBadgeText, { color: s.color }]}>×{s.multiplier}</Text>
                    </View>
                  </View>
                  <Text style={styles.seasonPeriod}>{s.period}</Text>
                  <View style={styles.seasonToggleRow}>
                    <View style={[styles.seasonToggle, s.active && { backgroundColor: H.brand }]} />
                    <Text style={styles.seasonToggleLabel}>{s.active ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
              </View>
            ))}

            <Pressable style={styles.addSeasonBtn}>
              <Ionicons name="add-circle-outline" size={18} color={H.brand} />
              <Text style={styles.addSeasonText}>Add Seasonal Rate</Text>
            </Pressable>
          </>
        )}

      </ScrollView>

      {/* ── Day detail modal ── */}
      {selectedDay && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedDay(null)}>
          <View style={styles.modalBg}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedDay.date.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Pressable onPress={() => setSelectedDay(null)}>
                  <Ionicons name="close" size={24} color={RIHLA.dark} />
                </Pressable>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>Status</Text>
                  <Text style={[styles.modalStatValue, {
                    color: selectedDay.status === 'available' ? '#10B981' : selectedDay.status === 'booked' ? '#EF4444' : selectedDay.status === 'check-in' ? '#3B82F6' : '#F59E0B',
                  }]}>
                    {selectedDay.status === 'check-in' ? '✓ Check-ins' : selectedDay.status === 'check-out' ? '✕ Check-outs' : selectedDay.status.charAt(0).toUpperCase() + selectedDay.status.slice(1)}
                  </Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>Bookings</Text>
                  <Text style={styles.modalStatValue}>{selectedDay.bookings}</Text>
                </View>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatLabel}>Revenue</Text>
                  <Text style={styles.modalStatValue}>{selectedDay.revenue.toLocaleString()} DZD</Text>
                </View>
              </View>
              <View style={styles.modalActions}>
                {selectedDay.status === 'available' && (
                  <Pressable style={styles.modalBtnBlock}>
                    <Ionicons name="lock-closed-outline" size={16} color="#fff" />
                    <Text style={styles.modalBtnText}>Block Date</Text>
                  </Pressable>
                )}
                {selectedDay.status !== 'available' && (
                  <Pressable style={[styles.modalBtnBlock, { backgroundColor: '#F0FDF4' }]}>
                    <Ionicons name="lock-open-outline" size={16} color="#059669" />
                    <Text style={[styles.modalBtnText, { color: '#059669' }]}>Unblock Date</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function RoomStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.roomStat}>
      <Text style={[styles.roomStatValue, { color }]}>{value}</Text>
      <Text style={styles.roomStatLabel}>{label}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

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
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabPillText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },
  content: { gap: 14, paddingBottom: 32 },

  // Month nav
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  monthArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: H.brandLt, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontSize: 17, fontFamily: 'mon-b', color: RIHLA.dark },

  // Legend
  legend: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },

  // Calendar grid
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  calHeader: { width: '13%', alignItems: 'center', paddingVertical: 6 },
  calHeaderText: { fontSize: 9, fontFamily: 'mon-sb', color: '#94A3B8' },
  calCell: { width: '13%', aspectRatio: 1, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  calCellEmpty: { width: '13%', aspectRatio: 1 },
  calCellToday: { borderColor: H.brand, borderWidth: 2 },
  calDayNum: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },
  calDot: { width: 5, height: 5, borderRadius: 3 },
  calBookings: { fontSize: 8, fontFamily: 'mon', color: '#6B7280', position: 'absolute', top: 2, right: 3 },

  // Summary
  summaryCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  summaryValue: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  summaryDivider: { height: 1, backgroundColor: '#E5E7EB' },

  // Room status
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSub: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: -10 },
  filterRow: { gap: 8, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F1F5F9' },
  filterChipText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' },
  roomMatrix: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomCell: { width: '30%', borderRadius: 14, padding: 10, gap: 4, borderWidth: 1, borderColor: 'transparent' },
  roomCellNum: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  roomCellType: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  roomCellStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roomCellStatusText: { fontSize: 10, fontFamily: 'mon-sb', textTransform: 'capitalize' },
  roomCellGuest: { fontSize: 9, fontFamily: 'mon', color: '#94A3B8', marginTop: 2 },
  roomStatsRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  roomStat: { flex: 1, alignItems: 'center', gap: 2, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  roomStatValue: { fontSize: 16, fontFamily: 'mon-b' },
  roomStatLabel: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },

  // Seasonal rates
  seasonCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', paddingRight: 14,
  },
  seasonStripe: { width: 5, alignSelf: 'stretch' },
  seasonTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  seasonName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  seasonBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  seasonBadgeText: { fontSize: 11, fontFamily: 'mon-b' },
  seasonPeriod: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  seasonToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginBottom: 10 },
  seasonToggle: { width: 14, height: 14, borderRadius: 7 },
  seasonToggleLabel: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },
  addSeasonBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: H.brand, backgroundColor: H.brandLt },
  addSeasonText: { fontSize: 13, fontFamily: 'mon-sb', color: H.brand },

  // Day detail modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', gap: 14 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  modalBody: { gap: 10 },
  modalStat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  modalStatLabel: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  modalStatValue: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  modalActions: { gap: 8, marginTop: 4 },
  modalBtnBlock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#EF4444', paddingVertical: 12, borderRadius: 12 },
  modalBtnText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
});
