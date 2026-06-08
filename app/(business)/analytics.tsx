/**
 * RIHLA — Business Analytics (Upgraded)
 * ─────────────────────────────────────
 * PROMPTFULL §Tab 4: Reputation & Growth Analytics
 * Uses real data from useBusinessAssets store.
 * Shows: revenue projections, occupancy trends, room-type breakdown, listing health.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { useApp } from '@/context/AppContext';
import { getCategoryDef } from '@/constants/marketplaceCategories';

const PERIODS = ['7 Days', '30 Days', '90 Days'] as const;
type Period = typeof PERIODS[number];

export default function BusinessAnalytics() {
  const { user } = useApp();
  const { assets, getMyAssets, getAssetCount, getTotalValue, getAvailableCount } = useBusinessAssets();
  const [period, setPeriod] = useState<Period>('30 Days');

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as any) : null;
  const color = catDef?.color ?? '#0a2540';
  const myAssets = useMemo(() => getMyAssets(businessType), [businessType, assets]);

  const stats = useMemo(() => {
    const total = myAssets.length;
    const available = myAssets.filter(a => a.available).length;
    const unavailable = total - available;
    const totalValue = myAssets.reduce((s, a) => s + a.priceDZD, 0);
    const avgPrice = total > 0 ? Math.round(totalValue / total) : 0;
    const occupancyRate = total > 0 ? Math.round((unavailable / total) * 100) : 0;
    return { total, available, unavailable, totalValue, avgPrice, occupancyRate };
  }, [myAssets]);

  // Mock projections based on real asset data
  const projections = useMemo(() => {
    const dailyRate = stats.avgPrice;
    const availableRooms = Math.max(stats.available, 1);
    const multiplier = period === '7 Days' ? 7 : period === '30 Days' ? 30 : 90;
    const projectedRevenue = dailyRate * availableRooms * (1 - stats.occupancyRate / 100) * multiplier * 0.6;
    const projectedBookings = Math.round(availableRooms * multiplier * 0.3);
    return {
      revenue: Math.round(projectedRevenue),
      bookings: projectedBookings,
      views: projectedBookings * 12,
      saves: Math.round(projectedBookings * 0.4),
    };
  }, [stats, period]);

  // Room-type breakdown from actual assets
  const typeBreakdown = useMemo(() => {
    const rooms = myAssets.filter(a => a.assetKind === 'room');
    const groups: Record<string, { count: number; revenue: number }> = {};
    rooms.forEach(r => {
      const type = r.fields?.roomType || r.name || 'Standard';
      if (!groups[type]) groups[type] = { count: 0, revenue: 0 };
      groups[type].count++;
      groups[type].revenue += r.priceDZD;
    });
    return Object.entries(groups).map(([name, data]) => ({ name, ...data }));
  }, [myAssets]);

  const maxRevenue = typeBreakdown.length > 0 ? Math.max(...typeBreakdown.map(t => t.revenue)) : 1;

  return (
    <ProScreenChrome role="business" title="Analytics" subtitle="Your performance overview">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <Pressable
              key={p}
              style={[styles.periodPill, period === p && { backgroundColor: color }]}
              onPress={() => { Haptics.selectionAsync(); setPeriod(p); }}
            >
              <Text style={[styles.periodText, period === p && { color: '#fff' }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* Asset health */}
        <Text style={styles.sectionTitle}>Listings Health</Text>
        <View style={styles.grid}>
          <StatCard icon="checkmark-circle-outline" label="Available" value={String(stats.available)} color="#10B981" />
          <StatCard icon="bed-outline" label="Total Assets" value={String(stats.total)} color={color} />
          <StatCard icon="close-circle-outline" label="Unavailable" value={String(stats.unavailable)} color="#EF4444" />
          <StatCard icon="trending-up-outline" label="Avg Price" value={`${stats.avgPrice.toLocaleString()} DZD`} color="#F59E0B" />
        </View>

        {/* Revenue projection */}
        <View style={[styles.panel, { borderLeftColor: color, borderLeftWidth: 3 }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Revenue Projection</Text>
            <View style={styles.pill}><Text style={styles.pillText}>{period}</Text></View>
          </View>
          <Text style={styles.bigValue}>{projections.revenue.toLocaleString()} DZD</Text>
          <View style={styles.kpiRow}>
            <Kpi label="Bookings" value={String(projections.bookings)} />
            <Kpi label="Views" value={String(projections.views)} />
            <Kpi label="Saves" value={String(projections.saves)} />
          </View>
        </View>

        {/* Occupancy */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Occupancy Rate</Text>
          </View>
          <View style={styles.occRow}>
            <View style={styles.occBar}>
              <View style={[styles.occFill, { width: `${stats.occupancyRate}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.occValue, { color }]}>{stats.occupancyRate}%</Text>
          </View>
          <Text style={styles.muted}>
            {stats.available} of {stats.total} assets are currently bookable
          </Text>
        </View>

        {/* Room-type breakdown */}
        {typeBreakdown.length > 0 && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>By Type Breakdown</Text>
              <View style={styles.pill}><Text style={styles.pillText}>{typeBreakdown.length} types</Text></View>
            </View>
            {typeBreakdown.map((t, i) => {
              const pct = Math.round((t.revenue / maxRevenue) * 100);
              return (
                <View key={i} style={styles.revTypeRow}>
                  <Text style={styles.revTypeName} numberOfLines={1}>{t.name}</Text>
                  <View style={styles.revTypeBar}>
                    <View style={[styles.revTypeFill, { width: `${pct}%`, backgroundColor: color, opacity: 0.8 - i * 0.1 }]} />
                  </View>
                  <Text style={styles.revTypeVal}>{t.count} × {t.revenue.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Conversion funnel */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Conversion Funnel</Text>
          </View>
          <FunnelRow label="Views" value={String(projections.views)} pct={100} color="#94A3B8" />
          <FunnelRow label="Saves" value={String(projections.saves)} pct={Math.round((projections.saves / projections.views) * 100)} color="#3B82F6" />
          <FunnelRow label="Bookings" value={String(projections.bookings)} pct={Math.round((projections.bookings / projections.views) * 100)} color="#10B981" />
        </View>

      </ScrollView>
    </ProScreenChrome>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function FunnelRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <View style={styles.funnelRow}>
      <Text style={styles.funnelLabel}>{label}</Text>
      <View style={styles.funnelBar}>
        <View style={[styles.funnelFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.funnelValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 14 },

  periodRow: { flexDirection: 'row', gap: 8 },
  periodPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F1F5F9' },
  periodText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' },

  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  statCard: { width: '47%', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 8 },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },

  panel: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10, marginTop: 4 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F1F5F9' },
  pillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#64748B' },
  bigValue: { fontSize: 28, fontFamily: 'mon-b', color: '#0F172A' },
  muted: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },

  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#fafbfc', borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  kpiValue: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  kpiLabel: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },

  occRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  occBar: { flex: 1, height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  occFill: { height: '100%', borderRadius: 5 },
  occValue: { fontSize: 18, fontFamily: 'mon-b', width: 55, textAlign: 'right' },

  revTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  revTypeName: { width: 100, fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  revTypeBar: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  revTypeFill: { height: '100%', borderRadius: 4 },
  revTypeVal: { width: 80, fontSize: 11, fontFamily: 'mon-b', color: '#0F172A', textAlign: 'right' },

  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  funnelLabel: { width: 65, fontSize: 12, fontFamily: 'mon', color: '#6B7280' },
  funnelBar: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  funnelFill: { height: '100%', borderRadius: 4 },
  funnelValue: { width: 50, fontSize: 12, fontFamily: 'mon-b', color: '#0F172A', textAlign: 'right' },
});
