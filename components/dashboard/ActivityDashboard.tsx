/**
 * RIHLA — Activity Business Dashboard
 * ─────────────────────────────────────
 * Identity: Burnt Orange #E76F51
 * Tabs: Overview · Schedule · Programs · Revenue
 * An activity operator sees: live sessions, upcoming schedule, program stats, revenue.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const A = { brand: '#E76F51', brandLt: '#FEF2EE', green: '#10B981', amber: '#F59E0B', red: '#EF4444' };

const SESSIONS = [
  { id: 's1', name: 'Quad Biking', time: '09:00 – 10:30', pax: 6, max: 8, status: 'active', price: 3500 },
  { id: 's2', name: 'Camel Ride', time: '10:00 – 11:00', pax: 4, max: 10, status: 'active', price: 2000 },
  { id: 's3', name: 'Hiking Trail', time: '11:00 – 13:00', pax: 12, max: 15, status: 'upcoming', price: 1500 },
  { id: 's4', name: 'Kayaking', time: '14:00 – 15:30', pax: 0, max: 6, status: 'upcoming', price: 4000 },
  { id: 's5', name: 'Rock Climbing', time: '08:00 – 09:00', pax: 4, max: 4, status: 'completed', price: 5000 },
];

const TABS = ['Overview', 'Schedule', 'Programs', 'Revenue'] as const;
type Tab = typeof TABS[number];

export default function ActivityDashboard() {
  const [tab, setTab] = useState<Tab>('Overview');
  const { assets, getMyAssets } = useBusinessAssets();
  const programs = getMyAssets('activity', 'program');
  const activeSessions = SESSIONS.filter(s => s.status === 'active').length;
  const totalPax = SESSIONS.filter(s => s.status !== 'completed').reduce((s, x) => s + x.pax, 0);
  const todayRevenue = SESSIONS.reduce((s, x) => s + x.pax * x.price, 0);

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: '#FEF2EE' }]}><Text style={[styles.kpiVal, { color: A.brand }]}>{activeSessions}</Text><Text style={styles.kpiLbl}>Active Now</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: A.green }]}>{totalPax}</Text><Text style={styles.kpiLbl}>Participants</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}><Text style={[styles.kpiVal, { color: A.amber }]}>{programs.length}</Text><Text style={styles.kpiLbl}>Programs</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F8FAFC' }]}><Text style={[styles.kpiVal, { color: RIHLA.dark }]}>{(todayRevenue / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Revenue</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: A.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={styles.heroCard}>
              <Ionicons name="pulse-outline" size={24} color={A.brand} />
              <Text style={styles.heroTitle}>⚡ {activeSessions} Activities Running Now</Text>
              <Text style={styles.heroSub}>{totalPax} participants on-site</Text>
              <View style={styles.heroActions}>
                <Pressable style={styles.heroBtn}><Ionicons name="add-circle-outline" size={18} color={A.brand} /><Text style={styles.heroBtnText}>New Activity</Text></Pressable>
                <Pressable style={styles.heroBtn}><Ionicons name="stats-chart-outline" size={18} color={A.brand} /><Text style={styles.heroBtnText}>Analytics</Text></Pressable>
              </View>
            </View>
            <View style={styles.weatherCard}>
              <Ionicons name="sunny-outline" size={18} color={A.amber} />
              <Text style={styles.weatherText}>Clear · 28°C · Perfect conditions for outdoor activities</Text>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="people-outline" value={String(totalPax)} label="Total Participants" color={A.brand} />
              <QuickStat icon="calendar-outline" value={String(SESSIONS.length)} label="Sessions Today" color={A.brand} />
              <QuickStat icon="trending-up-outline" value={String(programs.length)} label="Active Programs" color={A.brand} />
            </View>
          </>
        )}

        {tab === 'Schedule' && (
          <>{SESSIONS.map(s => {
            const fillPct = Math.round((s.pax / s.max) * 100);
            const statusColor = s.status === 'active' ? A.green : s.status === 'upcoming' ? A.amber : '#94A3B8';
            return (
              <View key={s.id} style={styles.sessionCard}>
                <View style={styles.sessionTop}>
                  <View style={[styles.sessionDot, { backgroundColor: statusColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionName}>{s.name}</Text>
                    <Text style={styles.sessionTime}>{s.time}</Text>
                  </View>
                  <View style={[styles.sessionBadge, { backgroundColor: statusColor + '18' }]}>
                    <Text style={[styles.sessionBadgeText, { color: statusColor }]}>{s.status}</Text>
                  </View>
                </View>
                <View style={styles.sessionPax}>
                  <View style={styles.paxBar}><View style={[styles.paxFill, { width: `${fillPct}%`, backgroundColor: fillPct >= 100 ? A.red : A.brand }]} /></View>
                  <Text style={styles.paxText}>{s.pax}/{s.max} spots</Text>
                </View>
                <Text style={styles.sessionPrice}>{s.price.toLocaleString()} DZD/pp</Text>
              </View>
            );
          })}</>
        )}

        {tab === 'Programs' && (
          <>{programs.length === 0 ? (
            <View style={styles.empty}><Ionicons name="bicycle-outline" size={48} color="#94A3B8" /><Text style={styles.emptyTitle}>No programs yet</Text></View>
          ) : programs.map(p => (
            <View key={p.id} style={styles.programCard}>
              <Text style={styles.programName}>{p.name}</Text>
              <Text style={styles.programMeta}>{p.fields.duration || '—'} · {p.fields.maxParticipants || '?'} pax · {p.priceDZD.toLocaleString()} DZD</Text>
              {p.fields.difficulty && <View style={styles.diffChip}><Text style={styles.diffText}>{p.fields.difficulty}</Text></View>}
            </View>
          ))}</>
        )}

        {tab === 'Revenue' && (
          <View style={styles.revCard}>
            <Text style={styles.revValue}>{(todayRevenue / 1000).toFixed(0)}K DZD</Text>
            <Text style={styles.revLabel}>Today's Revenue</Text>
            <View style={styles.revRow}>
              <QuickStat icon="people-outline" value={String(totalPax)} label="Paying Guests" color={A.brand} />
              <QuickStat icon="cash-outline" value={String(SESSIONS.length)} label="Active Sessions" color={A.brand} />
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
  content: { gap: 14, paddingBottom: 32 },

  heroCard: { backgroundColor: A.brandLt, borderRadius: 20, padding: 20, gap: 8, borderWidth: 1, borderColor: A.brand + '30' },
  heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff' },
  heroBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: A.brand },

  weatherCard: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  weatherText: { fontSize: 12, fontFamily: 'mon', color: '#92400E', flex: 1 },

  quickGrid: { flexDirection: 'row', gap: 10 },
  qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280', textAlign: 'center' },

  sessionCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  sessionTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  sessionTime: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  sessionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sessionBadgeText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  sessionPax: { gap: 4 },
  paxBar: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  paxFill: { height: '100%', borderRadius: 3 },
  paxText: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  sessionPrice: { fontSize: 13, fontFamily: 'mon-b', color: A.brand },

  programCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 4 },
  programName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  programMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  diffChip: { backgroundColor: A.brandLt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  diffText: { fontSize: 10, fontFamily: 'mon-sb', color: A.brand, textTransform: 'capitalize' },

  revCard: { backgroundColor: A.brandLt, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8 },
  revValue: { fontSize: 36, fontFamily: 'mon-b', color: A.brand },
  revLabel: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  revRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },

  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#6B7280' },
});
