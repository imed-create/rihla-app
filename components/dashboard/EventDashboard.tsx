/**
 * RIHLA — Event Business Dashboard
 * ─────────────────────────────────
 * Identity: Purple #A855F7
 * Tabs: Overview · Tickets · Events · Revenue
 * An event organizer sees: ticket sales, event timeline, inventory, revenue.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const E = { brand: '#A855F7', brandLt: '#F5F3FF', green: '#10B981', amber: '#F59E0B', red: '#EF4444' };

const TICKET_TYPES = [
  { label: 'General Admission', sold: 180, total: 300, price: 2000 },
  { label: 'VIP Access', sold: 42, total: 50, price: 8000 },
  { label: 'Backstage Pass', sold: 8, total: 10, price: 15000 },
];

const UPCOMING = [
  { name: 'Saharan Music Festival', date: 'Jun 15', venue: 'Tlemcen Arena', sold: 230, cap: 360 },
  { name: 'Andalusian Night', date: 'Jun 22', venue: 'Constantine Hall', sold: 85, cap: 200 },
];

const TABS = ['Overview', 'Tickets', 'Events', 'Revenue'] as const;
type Tab = typeof TABS[number];

export default function EventDashboard() {
  const [tab, setTab] = useState<Tab>('Overview');
  const { assets, getMyAssets } = useBusinessAssets();
  const myEvents = getMyAssets('event', 'event');
  const totalSold = TICKET_TYPES.reduce((s, t) => s + t.sold, 0);
  const totalCap = TICKET_TYPES.reduce((s, t) => s + t.total, 0);
  const totalRev = TICKET_TYPES.reduce((s, t) => s + t.sold * t.price, 0);
  const soldPct = totalCap > 0 ? Math.round((totalSold / totalCap) * 100) : 0;

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: E.brandLt }]}><Text style={[styles.kpiVal, { color: E.brand }]}>{totalSold}</Text><Text style={styles.kpiLbl}>Sold</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: E.amber }]}>{soldPct}%</Text><Text style={styles.kpiLbl}>Sell Rate</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: E.green }]}>{myEvents.length}</Text><Text style={styles.kpiLbl}>Events</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F8FAFC' }]}><Text style={[styles.kpiVal, { color: RIHLA.dark }]}>{(totalRev / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Revenue</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: E.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: E.brandLt }]}>
              <Ionicons name="ticket-outline" size={24} color={E.brand} />
              <Text style={styles.heroTitle}>🎪 {totalSold}/{totalCap} Tickets Sold Total</Text>
              <Text style={styles.heroSub}>{soldPct}% sell-through across all events</Text>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="trending-up-outline" value={`${soldPct}%`} label="Sell Rate" color={E.brand} />
              <QuickStat icon="calendar-outline" value={String(UPCOMING.length)} label="Upcoming" color={E.brand} />
              <QuickStat icon="cash-outline" value={(totalRev / 1000).toFixed(0) + 'K'} label="Revenue" color={E.brand} />
            </View>
          </>
        )}

        {tab === 'Tickets' && TICKET_TYPES.map(t => {
          const pct = Math.round((t.sold / t.total) * 100);
          return (
            <View key={t.label} style={styles.ticketCard}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketName}>{t.label}</Text>
                <Text style={styles.ticketPrice}>{t.price.toLocaleString()} DZD</Text>
              </View>
              <View style={styles.pbar}><View style={[styles.pfill, { width: `${pct}%`, backgroundColor: pct > 85 ? E.red : E.brand }]} /></View>
              <View style={styles.ticketBot}>
                <Text style={styles.ticketSold}>{t.sold} of {t.total} sold</Text>
                <Text style={[styles.ticketRemain, { color: t.total - t.sold <= 5 ? E.red : '#6B7280' }]}>{t.total - t.sold} left</Text>
              </View>
            </View>
          );
        })}

        {tab === 'Events' && UPCOMING.map(e => {
          const pct = Math.round((e.sold / e.cap) * 100);
          return (
            <View key={e.name} style={styles.eventCard}>
              <Text style={styles.eventDate}>{e.date}</Text>
              <Text style={styles.eventName}>{e.name}</Text>
              <Text style={styles.eventVenue}>📍 {e.venue}</Text>
              <View style={styles.pbar}><View style={[styles.pfill, { width: `${pct}%`, backgroundColor: E.brand }]} /></View>
              <Text style={styles.eventSold}>{e.sold}/{e.cap} tickets sold</Text>
            </View>
          );
        })}

        {tab === 'Revenue' && (
          <View style={styles.revCard}>
            <Text style={styles.revValue}>{(totalRev / 1000).toFixed(0)}K DZD</Text>
            <Text style={styles.revLabel}>Total Ticket Revenue</Text>
            <View style={styles.revBreakdown}>
              {TICKET_TYPES.map(t => (
                <View key={t.label} style={styles.revRow}>
                  <Text style={styles.revName}>{t.label}</Text>
                  <Text style={styles.revAmt}>{(t.sold * t.price / 1000).toFixed(0)}K</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function QuickStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return <View style={styles.qStat}><Ionicons name={icon as any} size={16} color={color} /><Text style={styles.qVal}>{value}</Text><Text style={styles.qLbl}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  root: {},
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpi: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  kpiVal: { fontSize: 18, fontFamily: 'mon-b' }, kpiLbl: { fontSize: 9, fontFamily: 'mon-sb', color: '#6B7280' },
  tabBar: { marginBottom: 16 }, tabContent: { gap: 8, paddingRight: 8 },
  tabPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },
  content: { gap: 12, paddingBottom: 32 },
  heroCard: { borderRadius: 20, padding: 20, gap: 8 },
  heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  ticketCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 8 },
  ticketInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  ticketPrice: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },
  pbar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  pfill: { height: '100%', borderRadius: 3 },
  ticketBot: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketSold: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  ticketRemain: { fontSize: 11, fontFamily: 'mon-b' },
  eventCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 6 },
  eventDate: { fontSize: 12, fontFamily: 'mon-sb', color: E.brand },
  eventName: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  eventVenue: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  eventSold: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  revCard: { backgroundColor: E.brandLt, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8 },
  revValue: { fontSize: 36, fontFamily: 'mon-b', color: E.brand },
  revLabel: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  revBreakdown: { width: '100%', gap: 8, marginTop: 8 },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  revName: { fontSize: 13, fontFamily: 'mon-sb', color: '#374151' },
  revAmt: { fontSize: 13, fontFamily: 'mon-b', color: E.brand },
});
