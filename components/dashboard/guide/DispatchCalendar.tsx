/**
 * RIHLA — Guide Business Dashboard
 * ──────────────────────────────────
 * Identity: Brown #8B5E3C
 * Tabs: Overview · Dispatch · Tours · Revenue
 * A tour guide sees: daily dispatch timeline, expeditions, client schedule, earnings.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const G = { brand: '#8B5E3C', brandLt: '#F5F0EB', green: '#10B981', amber: '#F59E0B', red: '#EF4444', navy: '#0a2540' };

const SCHEDULE = [
  { id: 's1', time: '08:00', title: 'Casbah Guided Tour', travelers: 8, guide: 'Youcef', gearChecked: true },
  { id: 's2', time: '11:00', title: 'Constantine Bridges Trek', travelers: 12, guide: 'Amine', gearChecked: false },
  { id: 's3', time: '16:00', title: 'Sunset Sahara Caravan', travelers: 6, guide: 'Hamid', gearChecked: false },
];

const TABS = ['Overview', 'Dispatch', 'Tours', 'Revenue'] as const;
type Tab = typeof TABS[number];

export default function DispatchCalendar() {
  const [tab, setTab] = useState<Tab>('Overview');
  const [schedule, setSchedule] = useState(SCHEDULE);
  const { assets, getMyAssets } = useBusinessAssets();
  const expeditions = getMyAssets('guide', 'expedition');
  const totalTravelers = schedule.reduce((s, x) => s + x.travelers, 0);
  const todayRev = schedule.reduce((s, x) => s + x.travelers * 4000, 0);

  const toggleGear = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSchedule(prev => prev.map(x => x.id === id ? { ...x, gearChecked: !x.gearChecked } : x));
  };

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: G.brandLt }]}><Text style={[styles.kpiVal, { color: G.brand }]}>{schedule.length}</Text><Text style={styles.kpiLbl}>Today's Tours</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: G.green }]}>{totalTravelers}</Text><Text style={styles.kpiLbl}>Travelers</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.kpiVal, { color: G.amber }]}>{expeditions.length}</Text><Text style={styles.kpiLbl}>Expeditions</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F8FAFC' }]}><Text style={[styles.kpiVal, { color: G.navy }]}>{(todayRev / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Revenue</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: G.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: G.brandLt }]}>
              <Ionicons name="compass-outline" size={24} color={G.brand} />
              <Text style={styles.heroTitle}>🧭 {schedule.length} Tours Today</Text>
              <Text style={styles.heroSub}>{totalTravelers} travelers to guide · Clear conditions</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{schedule.filter(s => s.gearChecked).length}</Text><Text style={styles.heroStatLbl}>Gear Ready</Text></View>
                <View style={{ width: 1, height: 28, backgroundColor: G.brand + '30' }} />
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{schedule.length}/3</Text><Text style={styles.heroStatLbl}>Briefed</Text></View>
                <View style={{ width: 1, height: 28, backgroundColor: G.brand + '30' }} />
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{totalTravelers}</Text><Text style={styles.heroStatLbl}>Total</Text></View>
              </View>
            </View>
            <View style={styles.weatherCard}>
              <Ionicons name="partly-sunny-outline" size={18} color={G.amber} />
              <Text style={styles.weatherText}>Clear desert skies · 32°C · Wind: 12km/h · Great conditions for hiking</Text>
            </View>
          </>
        )}

        {tab === 'Dispatch' && (
          <>
            <Text style={styles.sectionTitle}>🗓 Daily Dispatch Timeline</Text>
            {schedule.map(item => (
              <View key={item.id} style={styles.dispatchCard}>
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View style={styles.timeLine} />
                </View>
                <View style={styles.cardCol}>
                  <View style={styles.dispatchContent}>
                    <Text style={styles.dispatchTitle}>{item.title}</Text>
                    <Text style={styles.dispatchMeta}>👤 {item.travelers} travelers · Lead: {item.guide}</Text>
                    <Pressable style={styles.gearBtn} onPress={() => toggleGear(item.id)}>
                      <Ionicons name={item.gearChecked ? 'checkbox' : 'square-outline'} size={18} color={item.gearChecked ? G.green : '#94A3B8'} />
                      <Text style={[styles.gearText, item.gearChecked && { color: G.green }]}>Gear Verified</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === 'Tours' && (
          <>{expeditions.length === 0 ? (
            <View style={styles.empty}><Ionicons name="compass-outline" size={48} color="#94A3B8" /><Text style={styles.emptyTitle}>No expeditions yet</Text></View>
          ) : expeditions.map(e => (
            <View key={e.id} style={styles.tourCard}>
              <Text style={styles.tourName}>{e.name}</Text>
              <Text style={styles.tourMeta}>{e.fields.duration || '—'} · Up to {e.fields.maxGroup || '?'} pax · {e.priceDZD.toLocaleString()} DZD/day</Text>
              {e.fields.languages && <Text style={styles.tourLangs}>🗣 {(e.fields.languages as string[]).join(', ')}</Text>}
            </View>
          ))}</>
        )}

        {tab === 'Revenue' && (
          <View style={styles.revCard}>
            <Text style={styles.revValue}>{(todayRev / 1000).toFixed(0)}K DZD</Text>
            <Text style={styles.revLabel}>Today's Tour Revenue</Text>
            <View style={styles.revRow}>
              <QuickStat icon="people-outline" value={String(totalTravelers)} label="Travelers" color={G.brand} />
              <QuickStat icon="cash-outline" value={String(schedule.length)} label="Tours" color={G.brand} />
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
  heroCard: { borderRadius: 20, padding: 20, gap: 8 },
  heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10, gap: 12, marginTop: 4 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  weatherCard: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
  weatherText: { fontSize: 12, fontFamily: 'mon', color: '#92400E', flex: 1 },
  qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },

  dispatchCard: { flexDirection: 'row', minHeight: 100 },
  timeCol: { width: 55, alignItems: 'center' },
  timeText: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  timeLine: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginVertical: 8 },
  cardCol: { flex: 1, paddingBottom: 16 },
  dispatchContent: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 8 },
  dispatchTitle: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  dispatchMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  gearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  gearText: { fontSize: 10, fontFamily: 'mon-sb', color: '#94A3B8' },

  tourCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 4 },
  tourName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  tourMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  tourLangs: { fontSize: 11, fontFamily: 'mon', color: G.brand, marginTop: 2 },

  revCard: { backgroundColor: G.brandLt, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8 },
  revValue: { fontSize: 36, fontFamily: 'mon-b', color: G.brand },
  revLabel: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  revRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#6B7280' },
});
