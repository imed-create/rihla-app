/**
 * RIHLA — Partner Analytics
 * ─────────────────────────
 * Performance for a service partner: acceptance rate, completion rate,
 * earnings trend and which of their services actually earn. Everything
 * derives from the real dispatch store and AppContext service requests.
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  HeroStat,
  MetricRow,
  Panel,
  PRO,
  ProgressBar,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
} from '@/components/pro/ProKit';
import { useApp } from '@/context/AppContext';
import { last7DaysEarnings, partnerEarningsDzd } from '@/lib/dashboardStats';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import { usePartnerServices } from '@/store/usePartnerServices';

const ACCENT = '#f4a261';
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const PERIODS = ['7 days', '30 days', '90 days'] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_DAYS: Record<Period, number> = {
  '7 days': 7,
  '30 days': 30,
  '90 days': 90,
};

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default function PartnerAnalytics() {
  const { serviceRequests } = useApp();
  const { dispatches } = usePartnerDispatches();
  const { services } = usePartnerServices();
  const [period, setPeriod] = useState<Period>('30 days');

  const weekChart = last7DaysEarnings(serviceRequests);
  const chartMax = Math.max(...weekChart, 1);

  const funnel = useMemo(() => {
    const offered = dispatches.length;
    const accepted = dispatches.filter((d) =>
      ['accepted', 'in-progress', 'completed'].includes(d.status)
    ).length;
    const completed = dispatches.filter((d) => d.status === 'completed').length;
    const declined = dispatches.filter((d) => d.status === 'declined').length;
    const cancelled = dispatches.filter((d) => d.status === 'cancelled').length;
    return { offered, accepted, completed, declined, cancelled };
  }, [dispatches]);

  const acceptanceRate = pct(funnel.accepted, funnel.offered);
  const completionRate = pct(funnel.completed, funnel.accepted);

  const earnings = useMemo(() => {
    const fromDispatches = dispatches
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.priceDZD, 0);
    const fromRequests = partnerEarningsDzd(serviceRequests);
    const total = fromDispatches + fromRequests;
    const jobs = funnel.completed + serviceRequests.filter((r) => r.status === 'completed').length;
    return {
      total,
      jobs,
      avgPerJob: jobs > 0 ? total / jobs : 0,
      /** Simple run-rate for the selected window. */
      projected: (total / 30) * PERIOD_DAYS[period],
    };
  }, [dispatches, serviceRequests, funnel.completed, period]);

  /** Which service types actually earn — grouped from the dispatch job types. */
  const byJobType = useMemo(() => {
    const groups = new Map<string, { jobs: number; revenue: number }>();
    dispatches
      .filter((d) => d.status === 'completed')
      .forEach((d) => {
        const key = d.jobType || 'other';
        const entry = groups.get(key) ?? { jobs: 0, revenue: 0 };
        entry.jobs += 1;
        entry.revenue += d.priceDZD;
        groups.set(key, entry);
      });
    return [...groups.entries()]
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [dispatches]);

  const maxTypeRevenue = byJobType.length > 0 ? byJobType[0].revenue : 1;
  const publishedServices = services.filter((s) => s.status === 'published').length;

  const hasData = dispatches.length > 0 || serviceRequests.length > 0;

  return (
    <ProScreenChrome role="partner" title="My Analytics" subtitle="Performance metrics & trends">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!hasData ? (
          <EmptyBlock
            icon="analytics-outline"
            title="No performance data yet"
            subtitle="Once you start accepting jobs, your acceptance rate, earnings trend and best-performing services show up here."
            color={ACCENT}
          />
        ) : (
          <>
            <HeroStat
              label="Total earned"
              value={formatDZD(earnings.total)}
              caption={`${earnings.jobs} completed job${earnings.jobs === 1 ? '' : 's'} · ${formatDZD(earnings.avgPerJob)} average`}
              color={ACCENT}
              icon="trending-up-outline"
            />

            <Segmented options={PERIODS} value={period} onChange={setPeriod} color={ACCENT} />

            <StatGrid>
              <StatCard
                icon="checkmark-circle-outline"
                label="Acceptance rate"
                value={`${acceptanceRate}%`}
                color={acceptanceRate >= 70 ? PRO.green : acceptanceRate >= 40 ? PRO.amber : PRO.red}
                hint={`${funnel.accepted} of ${funnel.offered} offers`}
              />
              <StatCard
                icon="checkmark-done-outline"
                label="Completion rate"
                value={`${completionRate}%`}
                color={completionRate >= 90 ? PRO.green : PRO.amber}
                hint={`${funnel.completed} finished`}
              />
              <StatCard
                icon="cube-outline"
                label="Live services"
                value={String(publishedServices)}
                color={PRO.blue}
                hint={`${services.length} total`}
              />
              <StatCard
                icon="calculator-outline"
                label={`${period} run-rate`}
                value={formatDZD(earnings.projected)}
                color={ACCENT}
                hint="at current pace"
              />
            </StatGrid>

            {/* ── Weekly earnings ── */}
            <Panel title="Last 7 days" badge={formatDZD(weekChart.reduce((s, v) => s + v, 0))}>
              <View style={styles.chart}>
                {weekChart.map((value, i) => (
                  <View key={i} style={styles.chartCol}>
                    <View style={styles.chartBarWrap}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: `${Math.max(4, (value / chartMax) * 100)}%`,
                            backgroundColor: value > 0 ? ACCENT : PRO.sunken,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{DAY_LABELS[i]}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.note}>
                Peak day earned {formatDZD(chartMax)}. Staying online during your best hours is the single
                biggest lever on weekly income.
              </Text>
            </Panel>

            {/* ── Job funnel ── */}
            <Panel title="Job funnel" badge={`${funnel.offered} offered`}>
              <FunnelRow label="Offered" value={funnel.offered} total={funnel.offered} color={PRO.subtle} />
              <FunnelRow label="Accepted" value={funnel.accepted} total={funnel.offered} color={PRO.blue} />
              <FunnelRow label="Completed" value={funnel.completed} total={funnel.offered} color={PRO.green} />
              <View style={styles.divider} />
              <MetricRow label="Declined" value={String(funnel.declined)} color={PRO.subtle} />
              <MetricRow label="Cancelled" value={String(funnel.cancelled)} color={PRO.red} />
              {acceptanceRate < 60 && funnel.offered >= 3 ? (
                <View style={styles.tipBox}>
                  <Ionicons name="bulb-outline" size={15} color={PRO.amber} />
                  <Text style={styles.tipText}>
                    Your acceptance rate is below 60%. Partners who accept more offers get ranked higher in
                    dispatch and see more jobs.
                  </Text>
                </View>
              ) : null}
            </Panel>

            {/* ── Revenue by job type ── */}
            {byJobType.length > 0 && (
              <>
                <SectionTitle>Revenue by job type</SectionTitle>
                <Panel>
                  {byJobType.map((row) => (
                    <View key={row.type} style={styles.typeRow}>
                      <View style={styles.typeHead}>
                        <Text style={styles.typeName}>
                          {row.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Text>
                        <Text style={styles.typeValue}>
                          {row.jobs} × {formatDZD(row.revenue / row.jobs)}
                        </Text>
                      </View>
                      <ProgressBar pct={(row.revenue / maxTypeRevenue) * 100} color={ACCENT} height={6} />
                    </View>
                  ))}
                </Panel>
              </>
            )}
          </>
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

function FunnelRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <View style={styles.funnelRow}>
      <Text style={styles.funnelLabel}>{label}</Text>
      <View style={styles.funnelBar}>
        <ProgressBar pct={percentage} color={color} height={8} />
      </View>
      <Text style={styles.funnelValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  divider: { height: 1, backgroundColor: PRO.borderSoft, marginVertical: 4 },

  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 120, marginVertical: 4 },
  chartCol: { flex: 1, alignItems: 'center', gap: 6 },
  chartBarWrap: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 5, minHeight: 4 },
  chartLabel: { fontSize: 10, fontFamily: 'mon-sb', color: PRO.subtle },

  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  funnelLabel: { width: 74, fontSize: 12, fontFamily: 'mon', color: PRO.muted },
  funnelBar: { flex: 1 },
  funnelValue: { width: 34, fontSize: 13, fontFamily: 'mon-b', color: PRO.text, textAlign: 'right' },

  tipBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 4,
  },
  tipText: { flex: 1, fontSize: 12, fontFamily: 'mon', color: '#92400E', lineHeight: 18 },

  typeRow: { gap: 6, paddingVertical: 5 },
  typeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeName: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  typeValue: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
});
