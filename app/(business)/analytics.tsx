import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/pro/ProScreenChrome';
import { useBusinessListings } from '@/store/useBusinessListings';

export default function BusinessAnalytics() {
  const { listings } = useBusinessListings();

  const stats = useMemo(() => {
    const published = listings.filter((l) => l.status === 'published').length;
    const paused = listings.filter((l) => l.status === 'paused').length;
    const drafts = listings.filter((l) => l.status === 'draft').length;
    return { published, paused, drafts, total: listings.length };
  }, [listings]);

  return (
    <ProScreenChrome role="business" title="Analytics" subtitle="Your performance overview">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Listings health</Text>
        <View style={styles.grid}>
          <StatCard icon="checkmark-circle-outline" label="Published" value={String(stats.published)} color="#f4a261" />
          <StatCard icon="pause-circle-outline" label="Paused" value={String(stats.paused)} color="#B45309" />
          <StatCard icon="document-text-outline" label="Drafts" value={String(stats.drafts)} color="#64748B" />
          <StatCard icon="apps-outline" label="Total" value={String(stats.total)} color="#0a2540" />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Revenue</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Last 30 days</Text>
            </View>
          </View>
          <Text style={styles.bigValue}>0 DA</Text>
          <Text style={styles.muted}>
            Connect real payments later (Stripe / local gateway) and we’ll chart your payouts here.
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Conversion</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>This month</Text>
            </View>
          </View>

          <View style={styles.kpiRow}>
            <Kpi label="Views" value="0" />
            <Kpi label="Saves" value="0" />
            <Kpi label="Bookings" value="0" />
          </View>
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

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
    marginTop: 4,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F1F5F9' },
  pillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#64748B' },
  bigValue: { fontSize: 28, fontFamily: 'mon-b', color: '#0F172A' },
  muted: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#fafbfc',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  kpiValue: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  kpiLabel: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },
});

