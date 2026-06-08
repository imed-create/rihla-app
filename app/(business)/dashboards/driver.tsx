/**
 * RIHLA — Driver Business Dashboard
 * ──────────────────────────────────
 * Identity: Navy #0a2540
 * Tabs: Overview · Trips · Fleet · Revenue
 * A driver sees: upcoming trips, fleet status, route management, earnings.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const D = { brand: '#0a2540', brandLt: '#F0F2F5', green: '#10B981', amber: '#F59E0B', red: '#EF4444', teal: '#00a896' };

const TRIPS = [
  { id: 't1', route: 'Algiers Airport → City Center', date: 'Today 14:00', passenger: 'Yacine M.', status: 'confirmed', price: 2500 },
  { id: 't2', route: 'Oran → Tlemcen', date: 'Tomorrow 08:30', passenger: 'Samira T.', status: 'pending', price: 12000 },
  { id: 't3', route: 'Algiers → Tipaza', date: 'Jun 16 09:00', passenger: 'Karim F.', status: 'confirmed', price: 6000 },
];

const FLEET = [
  { name: 'Mercedes V-Class', type: 'Luxury Van', cap: 7, status: 'active' },
  { name: 'Skoda Octavia', type: 'Sedan', cap: 4, status: 'maintenance' },
  { name: 'Toyota Land Cruiser', type: 'SUV', cap: 6, status: 'active' },
];

const TABS = ['Overview', 'Trips', 'Fleet', 'Revenue'] as const;
type Tab = typeof TABS[number];

export default function DriverDashboard() {
  const [tab, setTab] = useState<Tab>('Overview');
  const { assets, getMyAssets } = useBusinessAssets();
  const routes = getMyAssets('driver', 'route');
  const activeVehicles = FLEET.filter(v => v.status === 'active').length;
  const pendingTrips = TRIPS.filter(t => t.status === 'pending').length;
  const confirmedRev = TRIPS.filter(t => t.status === 'confirmed').reduce((s, t) => s + t.price, 0);

  return (
    <View style={styles.root}>
      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: D.brandLt }]}><Text style={[styles.kpiVal, { color: D.brand }]}>{activeVehicles}/{FLEET.length}</Text><Text style={styles.kpiLbl}>Fleet Active</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.kpiVal, { color: D.amber }]}>{pendingTrips}</Text><Text style={styles.kpiLbl}>Pending</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F0FDF4' }]}><Text style={[styles.kpiVal, { color: D.green }]}>{routes.length}</Text><Text style={styles.kpiLbl}>Routes</Text></View>
        <View style={[styles.kpi, { backgroundColor: '#F8FAFC' }]}><Text style={[styles.kpiVal, { color: D.brand }]}>{(confirmedRev / 1000).toFixed(0)}K</Text><Text style={styles.kpiLbl}>Revenue</Text></View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map(t => (
          <Pressable key={t} style={[styles.tabPill, tab === t && { backgroundColor: D.brand }]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'Overview' && (
          <>
            <View style={[styles.heroCard, { backgroundColor: D.brandLt }]}>
              <Ionicons name="car-outline" size={24} color={D.brand} />
              <Text style={styles.heroTitle}>🚗 {activeVehicles} Vehicles Online</Text>
              <Text style={styles.heroSub}>{pendingTrips} pending trip requests · {TRIPS.filter(t => t.status === 'confirmed').length} confirmed</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{routes.length}</Text><Text style={styles.heroStatLbl}>Routes</Text></View>
                <View style={{ width: 1, height: 28, backgroundColor: D.brand + '30' }} />
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{activeVehicles}</Text><Text style={styles.heroStatLbl}>Active</Text></View>
                <View style={{ width: 1, height: 28, backgroundColor: D.brand + '30' }} />
                <View style={styles.heroStat}><Text style={styles.heroStatVal}>{confirmedRev.toLocaleString()}</Text><Text style={styles.heroStatLbl}>DZD</Text></View>
              </View>
            </View>
            <View style={styles.quickGrid}>
              <QuickStat icon="map-outline" value={String(routes.length)} label="Routes" color={D.brand} />
              <QuickStat icon="calendar-outline" value={String(TRIPS.length)} label="Trips" color={D.brand} />
              <QuickStat icon="cash-outline" value={(confirmedRev / 1000).toFixed(0) + 'K'} label="Revenue" color={D.brand} />
            </View>
          </>
        )}

        {tab === 'Trips' && TRIPS.map(t => (
          <View key={t.id} style={styles.tripCard}>
            <View style={styles.tripTop}>
              <View style={styles.tripRoute}>
                <Ionicons name="ellipse" size={8} color={D.teal} />
                <Text style={styles.tripRouteText}>{t.route}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: t.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={[styles.statusText, { color: t.status === 'confirmed' ? '#059669' : '#B45309' }]}>{t.status}</Text>
              </View>
            </View>
            <Text style={styles.tripDate}>{t.date}</Text>
            <View style={styles.tripBot}>
              <Text style={styles.tripPassenger}>👤 {t.passenger}</Text>
              <Text style={styles.tripPrice}>{t.price.toLocaleString()} DZD</Text>
            </View>
          </View>
        ))}

        {tab === 'Fleet' && (
          <>
            <Text style={styles.sectionTitle}>🚙 Fleet Status</Text>
            {FLEET.map(v => (
              <View key={v.name} style={styles.fleetCard}>
                <Ionicons name={v.status === 'active' ? 'car-sport-outline' : 'construct-outline'} size={22} color={v.status === 'active' ? D.green : D.red} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.fleetName}>{v.name}</Text>
                  <Text style={styles.fleetMeta}>{v.type} · {v.cap} pax</Text>
                </View>
                <View style={[styles.fleetStatus, { backgroundColor: v.status === 'active' ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.fleetStatusText, { color: v.status === 'active' ? '#059669' : '#DC2626' }]}>{v.status}</Text>
                </View>
              </View>
            ))}
            <View style={styles.totalKmCard}>
              <Ionicons name="speedometer-outline" size={20} color={D.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.kmLabel}>Total Route Distance</Text>
                <Text style={styles.kmValue}>{routes.reduce((s, r) => s + (r.fields.distance || 0), 0)} km</Text>
              </View>
              <Text style={styles.kmUnit}>today</Text>
            </View>
          </>
        )}

        {tab === 'Revenue' && (
          <View style={styles.revCard}>
            <Text style={styles.revValue}>{(confirmedRev / 1000).toFixed(0)}K DZD</Text>
            <Text style={styles.revLabel}>Confirmed Trip Revenue</Text>
            <View style={styles.revBreakdown}>
              {TRIPS.filter(t => t.status === 'confirmed').map(t => (
                <View key={t.id} style={styles.revRow}>
                  <Text style={styles.revName}>{t.route.split('→')[0].trim()}</Text>
                  <Text style={styles.revAmt}>{t.price.toLocaleString()} DZD</Text>
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
  content: { gap: 14, paddingBottom: 32 },
  heroCard: { borderRadius: 20, padding: 20, gap: 8 },
  heroTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111827' },
  heroSub: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 10, gap: 12, marginTop: 4 },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroStatVal: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  heroStatLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
  quickGrid: { flexDirection: 'row', gap: 10 },
  qStat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  qVal: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, qLbl: { fontSize: 9, fontFamily: 'mon', color: '#6B7280', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#111827' },

  tripCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 8 },
  tripTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tripRoute: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  tripRouteText: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  tripDate: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  tripBot: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  tripPassenger: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' },
  tripPrice: { fontSize: 13, fontFamily: 'mon-b', color: D.brand },

  fleetCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  fleetName: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  fleetMeta: { fontSize: 11, fontFamily: 'mon', color: '#6B7280', marginTop: 2 },
  fleetStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  fleetStatusText: { fontSize: 10, fontFamily: 'mon-b', textTransform: 'capitalize' },
  totalKmCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: D.brandLt, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: D.brand + '20' },
  kmLabel: { fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  kmValue: { fontSize: 18, fontFamily: 'mon-b', color: D.brand },
  kmUnit: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },

  revCard: { backgroundColor: D.brandLt, borderRadius: 20, padding: 20, alignItems: 'center', gap: 8 },
  revValue: { fontSize: 36, fontFamily: 'mon-b', color: D.brand },
  revLabel: { fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  revBreakdown: { width: '100%', gap: 8, marginTop: 8 },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  revName: { fontSize: 13, fontFamily: 'mon-sb', color: '#374151' },
  revAmt: { fontSize: 13, fontFamily: 'mon-b', color: D.brand },
});
