/**
 * RIHLA — Photographer Dashboard
 * ─────────────────────────────────────
 * Identity: Hot Pink #FF499E — creative, editorial, energetic
 * Tabs: Shoots (calendar) · Portfolio (package perf) · Deliverables · Earnings
 *
 * A photographer sees: upcoming shoot calendar, gallery portfolio metrics,
 * pending photo delivery queue, and earnings by package. Zero hotel content.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

// ── Brand colours ────────────────────────────────────────────
const P = {
  brand:   '#FF499E',
  brandLt: '#FFF0F7',
  purple:  '#A855F7',
  purpleLt:'#F3E8FF',
  gold:    '#F59E0B',
  green:   '#10B981',
  navy:    '#0a2540',
};

// ── Mock data ────────────────────────────────────────────────
const SHOOTS = [
  { id: 'p1', client: 'Amina Boudiaf', date: 'Today',     time: '16:30', location: 'Tipaza Ruins',      pkg: 'Sunset Portrait',  status: 'upcoming',  priceDZD: 8000,  paid: true },
  { id: 'p2', client: 'Karim Ferhat',  date: 'Tomorrow',  time: '10:00', location: 'Botanical Garden',  pkg: 'Family Session',   status: 'upcoming',  priceDZD: 12000, paid: false },
  { id: 'p3', client: 'Nadia Sahraoui',date: 'Jun 15',    time: '09:00', location: 'Casbah d\'Alger',   pkg: 'Drone + Video',    status: 'pending',   priceDZD: 25000, paid: false },
  { id: 'p4', client: 'Yasmine Krim',  date: 'Jun 18',    time: '17:00', location: 'El Hamdania Beach', pkg: 'Sunset Portrait',  status: 'confirmed', priceDZD: 8000,  paid: true },
];

const PACKAGES = [
  { id: 'pkg1', name: 'Sunset Portrait', bookings: 12, revenue: 96000,  deliveryTime: '3 days',  rating: 4.9 },
  { id: 'pkg2', name: 'Family Session',  bookings: 8,  revenue: 96000,  deliveryTime: '5 days',  rating: 4.7 },
  { id: 'pkg3', name: 'Drone + Video',   bookings: 3,  revenue: 75000,  deliveryTime: '7 days',  rating: 5.0 },
  { id: 'pkg4', name: 'Event Coverage',  bookings: 5,  revenue: 125000, deliveryTime: '14 days', rating: 4.8 },
];

const DELIVERABLES = [
  { id: 'd1', client: 'Houria Malek',   pkg: 'Family Session',  shots: 87,  edited: 52,  dueDate: 'Jun 09', status: 'editing' },
  { id: 'd2', client: 'Sami Taibi',     pkg: 'Event Coverage',  shots: 234, edited: 234, dueDate: 'Jun 11', status: 'review' },
  { id: 'd3', client: 'Djamila Arous',  pkg: 'Sunset Portrait', shots: 45,  edited: 0,   dueDate: 'Jun 14', status: 'pending' },
];

const TABS = ['Shoots', 'Portfolio', 'Deliverables', 'Earnings'] as const;
type Tab = typeof TABS[number];

// ═══════════════════════════════════════════════════════════════
export default function PhotographerDashboard() {
  const [tab, setTab] = useState<Tab>('Shoots');

  const upcomingCount  = SHOOTS.filter(s => s.status !== 'pending').length;
  const totalRevenue   = PACKAGES.reduce((s, p) => s + p.revenue, 0);
  const editingCount   = DELIVERABLES.filter(d => d.status === 'editing' || d.status === 'pending').length;
  const avgRating      = (PACKAGES.reduce((s, p) => s + p.rating, 0) / PACKAGES.length).toFixed(1);

  return (
    <View style={styles.root}>
      {/* ── KPI strip ── */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: P.brandLt }]}>
          <Text style={[styles.kpiVal, { color: P.brand }]}>{upcomingCount}</Text>
          <Text style={styles.kpiLbl}>Shoots</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: P.purpleLt }]}>
          <Text style={[styles.kpiVal, { color: P.purple }]}>{editingCount}</Text>
          <Text style={styles.kpiLbl}>In Edit</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#FFFBEB' }]}>
          <Text style={[styles.kpiVal, { color: P.gold }]}>{avgRating}★</Text>
          <Text style={styles.kpiLbl}>Rating</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}>
          <Text style={[styles.kpiVal, { color: P.green }]}>{(totalRevenue / 1000).toFixed(0)}K</Text>
          <Text style={styles.kpiLbl}>Earned</Text>
        </View>
      </View>

      {/* ── Internal tab bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable
            key={t}
            style={[styles.tabPill, tab === t && { backgroundColor: P.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
          >
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── SHOOTS TAB ── Upcoming shoot calendar ── */}
        {tab === 'Shoots' && (
          <>
            <Text style={styles.sectionTitle}>📸 Upcoming Shoots</Text>
            <Text style={styles.sectionSub}>Your photography schedule</Text>
            {SHOOTS.map(shoot => (
              <Pressable
                key={shoot.id}
                style={styles.shootCard}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[styles.shootDateBadge, {
                  backgroundColor: shoot.status === 'upcoming' ? P.brandLt : shoot.status === 'confirmed' ? '#F0FDF4' : '#FFFBEB',
                }]}>
                  <Text style={[styles.shootDateDay, {
                    color: shoot.status === 'upcoming' ? P.brand : shoot.status === 'confirmed' ? P.green : P.gold,
                  }]}>
                    {shoot.date === 'Today' ? '🔴' : shoot.date === 'Tomorrow' ? '🟡' : '📅'}
                  </Text>
                  <Text style={[styles.shootDateText, {
                    color: shoot.status === 'upcoming' ? P.brand : shoot.status === 'confirmed' ? P.green : P.gold,
                  }]}>{shoot.date}</Text>
                </View>
                <View style={styles.shootInfo}>
                  <Text style={styles.shootClient}>{shoot.client}</Text>
                  <Text style={styles.shootMeta}>{shoot.time} · {shoot.location}</Text>
                  <View style={styles.shootPkgRow}>
                    <View style={styles.pkgTag}>
                      <Text style={styles.pkgTagText}>{shoot.pkg}</Text>
                    </View>
                    {!shoot.paid && (
                      <View style={styles.unpaidTag}>
                        <Text style={styles.unpaidText}>Unpaid</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.shootPrice}>{shoot.priceDZD.toLocaleString()}{'\n'}DZD</Text>
              </Pressable>
            ))}
          </>
        )}

        {/* ── PORTFOLIO TAB ── Package performance ── */}
        {tab === 'Portfolio' && (
          <>
            <Text style={styles.sectionTitle}>🖼 Package Performance</Text>
            <Text style={styles.sectionSub}>Your studio's bestsellers</Text>
            {PACKAGES.map((pkg, i) => (
              <View key={pkg.id} style={styles.pkgCard}>
                <View style={[styles.pkgRankBadge, { backgroundColor: i === 0 ? P.brand : i === 1 ? P.purple : '#6B7280' }]}>
                  <Text style={styles.pkgRankText}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pkgName}>{pkg.name}</Text>
                  <Text style={styles.pkgMeta}>{pkg.bookings} bookings · {pkg.deliveryTime} delivery</Text>
                  <View style={styles.pkgBarWrap}>
                    <View style={[styles.pkgBarFill, {
                      width: `${(pkg.bookings / PACKAGES[0].bookings) * 100}%`,
                      backgroundColor: i === 0 ? P.brand : P.purple,
                    }]} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={styles.pkgRevenue}>{(pkg.revenue / 1000).toFixed(0)}K DZD</Text>
                  <Text style={styles.pkgRating}>{'★'.repeat(Math.round(pkg.rating))} {pkg.rating}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── DELIVERABLES TAB ── Photo delivery queue ── */}
        {tab === 'Deliverables' && (
          <>
            <Text style={styles.sectionTitle}>💾 Delivery Queue</Text>
            <Text style={styles.sectionSub}>Photo editing & delivery pipeline</Text>
            {DELIVERABLES.map(d => {
              const pct = Math.round((d.edited / d.shots) * 100);
              const statusColor = d.status === 'review' ? P.green : d.status === 'editing' ? P.brand : '#94A3B8';
              return (
                <View key={d.id} style={styles.delivCard}>
                  <View style={styles.delivTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.delivClient}>{d.client}</Text>
                      <Text style={styles.delivPkg}>{d.pkg}</Text>
                    </View>
                    <View style={[styles.delivBadge, { backgroundColor: statusColor + '18' }]}>
                      <Text style={[styles.delivBadgeText, { color: statusColor }]}>
                        {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.delivProgress}>
                    <View style={styles.delivProgressTrack}>
                      <View style={[styles.delivProgressFill, { width: `${pct}%`, backgroundColor: statusColor }]} />
                    </View>
                    <Text style={styles.delivProgressText}>{d.edited}/{d.shots} edited ({pct}%)</Text>
                  </View>
                  <View style={styles.delivFooter}>
                    <Ionicons name="time-outline" size={12} color="#94A3B8" />
                    <Text style={styles.delivDue}>Due {d.dueDate}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── EARNINGS TAB ── Revenue breakdown ── */}
        {tab === 'Earnings' && (
          <>
            <View style={styles.earningsHero}>
              <Text style={styles.earningsTotal}>{(totalRevenue / 1000).toFixed(0)}K DZD</Text>
              <Text style={styles.earningsLabel}>Total Studio Revenue</Text>
              <View style={styles.earningsRow}>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemVal}>28</Text>
                  <Text style={styles.earningsItemLbl}>Total Sessions</Text>
                </View>
                <View style={styles.earningsDivider} />
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemVal}>4.85★</Text>
                  <Text style={styles.earningsItemLbl}>Avg Rating</Text>
                </View>
                <View style={styles.earningsDivider} />
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsItemVal}>96%</Text>
                  <Text style={styles.earningsItemLbl}>On-time</Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Revenue by Package</Text>
            {PACKAGES.map((pkg, i) => (
              <View key={pkg.id} style={styles.earningPkgRow}>
                <View style={[styles.earningColorDot, { backgroundColor: i === 0 ? P.brand : i === 1 ? P.purple : i === 2 ? P.gold : P.green }]} />
                <Text style={styles.earningPkgName}>{pkg.name}</Text>
                <View style={styles.earningPkgBar}>
                  <View style={[styles.earningPkgFill, {
                    width: `${(pkg.revenue / totalRevenue) * 100}%`,
                    backgroundColor: i === 0 ? P.brand : i === 1 ? P.purple : i === 2 ? P.gold : P.green,
                  }]} />
                </View>
                <Text style={styles.earningPkgVal}>{(pkg.revenue / 1000).toFixed(0)}K</Text>
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

  // Shoots tab
  shootCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  shootDateBadge: { width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 10, gap: 2 },
  shootDateDay: { fontSize: 20 },
  shootDateText: { fontSize: 9, fontFamily: 'mon-sb' },
  shootInfo: { flex: 1, gap: 3 },
  shootClient: { fontSize: 14, fontFamily: 'mon-sb', color: '#111827' },
  shootMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  shootPkgRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  pkgTag: { backgroundColor: P.brandLt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  pkgTagText: { fontSize: 10, fontFamily: 'mon-sb', color: P.brand },
  unpaidTag: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  unpaidText: { fontSize: 10, fontFamily: 'mon-sb', color: '#B45309' },
  shootPrice: { fontSize: 12, fontFamily: 'mon-b', color: '#111827', textAlign: 'right', lineHeight: 18 },

  // Portfolio tab
  pkgCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  pkgRankBadge: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pkgRankText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  pkgName: { fontSize: 13, fontFamily: 'mon-sb', color: '#111827' },
  pkgMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  pkgBarWrap: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  pkgBarFill: { height: '100%', borderRadius: 2 },
  pkgRevenue: { fontSize: 12, fontFamily: 'mon-b', color: P.brand },
  pkgRating: { fontSize: 11, fontFamily: 'mon-sb', color: P.gold },

  // Deliverables tab
  delivCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  delivTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  delivClient: { fontSize: 14, fontFamily: 'mon-sb', color: '#111827' },
  delivPkg: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  delivBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  delivBadgeText: { fontSize: 11, fontFamily: 'mon-sb' },
  delivProgress: { gap: 4 },
  delivProgressTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  delivProgressFill: { height: '100%', borderRadius: 4 },
  delivProgressText: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  delivFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  delivDue: { fontSize: 11, fontFamily: 'mon-sb', color: '#94A3B8' },

  // Earnings tab
  earningsHero: { backgroundColor: P.brandLt, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8 },
  earningsTotal: { fontSize: 36, fontFamily: 'mon-b', color: P.brand },
  earningsLabel: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  earningsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: 12, gap: 0, alignItems: 'center', width: '100%', marginTop: 4 },
  earningsItem: { flex: 1, alignItems: 'center', gap: 2 },
  earningsItemVal: { fontSize: 15, fontFamily: 'mon-b', color: '#111827' },
  earningsItemLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  earningsDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  earningPkgRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  earningColorDot: { width: 10, height: 10, borderRadius: 5 },
  earningPkgName: { width: 115, fontSize: 12, fontFamily: 'mon-sb', color: '#111827' },
  earningPkgBar: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  earningPkgFill: { height: '100%', borderRadius: 4 },
  earningPkgVal: { width: 36, fontSize: 12, fontFamily: 'mon-b', color: '#6B7280', textAlign: 'right' },
});
