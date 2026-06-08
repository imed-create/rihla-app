import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import {
  last7DaysEarnings,
  partnerEarningsDzd,
  partnerEarningsThisWeek,
} from '@/lib/dashboardStats';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PartnerEarnings() {
  const { serviceRequests } = useApp();

  const weekTotal = partnerEarningsThisWeek(serviceRequests);
  const allTotal = partnerEarningsDzd(serviceRequests);
  const chart = last7DaysEarnings(serviceRequests);
  const max = Math.max(...chart, 1);

  const completed = useMemo(
    () =>
      [...serviceRequests]
        .filter((r) => r.status === 'confirmed' || r.status === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20),
    [serviceRequests]
  );

  return (
    <ProScreenChrome role="partner" title="Earnings" subtitle="Track payouts and performance">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>This week</Text>
          <Text style={styles.balanceValue}>{weekTotal.toLocaleString()} DZD</Text>
          <Text style={styles.muted}>All-time: {allTotal.toLocaleString()} DZD</Text>
        </View>

        <Text style={styles.sectionTitle}>Last 7 days</Text>
        <View style={styles.chart}>
          {chart.map((val, i) => (
            <View key={i} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${Math.max(8, (val / max) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{DAYS[i]}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Completed requests</Text>
        {completed.length === 0 ? (
          <Text style={styles.empty}>No completed requests yet.</Text>
        ) : (
          completed.map((r) => (
            <View key={r.id} style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="flash-outline" size={18} color={RIHLA.highlight} />
                <View>
                  <Text style={styles.rowTitle}>{r.customerName}</Text>
                  <Text style={styles.rowSub}>{r.serviceType} · {r.date.slice(0, 10)}</Text>
                </View>
              </View>
              <Text style={styles.rowAmount}>+{r.totalDZD.toLocaleString()} DZD</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  balanceCard: {
    backgroundColor: RIHLA.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: RIHLA.border,
    padding: 16,
    gap: 6,
  },
  balanceLabel: { fontSize: 14, fontFamily: 'mon', color: RIHLA.mutedText },
  balanceValue: { fontSize: 32, fontFamily: 'mon-b', color: RIHLA.primary },
  muted: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark, marginTop: 8 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    backgroundColor: RIHLA.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RIHLA.border,
    padding: 16,
    paddingBottom: 8,
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: {
    width: 28,
    height: 100,
    backgroundColor: RIHLA.muted,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: RIHLA.accent,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 8,
  },
  barLabel: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: RIHLA.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RIHLA.border,
    marginBottom: 8,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.dark },
  rowSub: { fontSize: 11, fontFamily: 'mon', color: RIHLA.mutedText },
  rowAmount: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.highlight },
  empty: { fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText },
});
