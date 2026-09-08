/**
 * RIHLA — Tax Documents
 * ─────────────────────
 * Fiscal records a partner needs for their Algerian tax return: annual
 * income summary, per-month invoices generated from real completed work,
 * and their fiscal identifiers.
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  GhostButton,
  HeroStat,
  ListRow,
  MetricRow,
  Panel,
  PRO,
  SectionTitle,
  Segmented,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { useApp } from '@/context/AppContext';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';

const ACCENT = '#f4a261';

/** RIHLA's commission, withheld before the partner is paid. */
const COMMISSION_RATE = 0.12;

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

type MonthRow = {
  key: string;
  label: string;
  jobs: number;
  gross: number;
};

export default function PartnerTax() {
  const { user, serviceRequests } = useApp();
  const { dispatches } = usePartnerDispatches();

  const years = useMemo(() => {
    const set = new Set<number>();
    dispatches.filter((d) => d.status === 'completed').forEach((d) => set.add(new Date(d.createdAt).getFullYear()));
    serviceRequests.filter((r) => r.status === 'completed').forEach((r) => set.add(new Date(r.createdAt).getFullYear()));
    if (set.size === 0) set.add(new Date().getFullYear());
    return [...set].sort((a, b) => b - a).map(String);
  }, [dispatches, serviceRequests]);

  const [year, setYear] = useState<string>(years[0]);

  /** Completed work in the selected year, from both real sources. */
  const entries = useMemo(() => {
    const rows: { at: string; amount: number }[] = [];
    dispatches
      .filter((d) => d.status === 'completed')
      .forEach((d) => rows.push({ at: d.createdAt, amount: d.priceDZD }));
    serviceRequests
      .filter((r) => r.status === 'completed')
      .forEach((r) => rows.push({ at: r.createdAt, amount: r.totalDZD }));
    return rows.filter((r) => new Date(r.at).getFullYear() === Number(year));
  }, [dispatches, serviceRequests, year]);

  const totals = useMemo(() => {
    const gross = entries.reduce((sum, e) => sum + e.amount, 0);
    const commission = gross * COMMISSION_RATE;
    return { gross, commission, net: gross - commission, jobs: entries.length };
  }, [entries]);

  const byMonth = useMemo<MonthRow[]>(() => {
    const groups = new Map<number, { jobs: number; gross: number }>();
    entries.forEach((e) => {
      const month = new Date(e.at).getMonth();
      const entry = groups.get(month) ?? { jobs: 0, gross: 0 };
      entry.jobs += 1;
      entry.gross += e.amount;
      groups.set(month, entry);
    });
    return [...groups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([month, data]) => ({
        key: `${year}-${month}`,
        label: new Date(Number(year), month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        ...data,
      }));
  }, [entries, year]);

  const hasRecords = entries.length > 0;

  return (
    <ProScreenChrome role="partner" title="Tax Documents" subtitle="Invoices & fiscal records">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {years.length > 1 ? <Segmented options={years} value={year} onChange={setYear} color={ACCENT} /> : null}

        {!hasRecords ? (
          <EmptyBlock
            icon="document-text-outline"
            title={`No records for ${year}`}
            subtitle="Completed jobs generate an invoice automatically. Your annual income summary becomes available as soon as you finish your first job."
            color={ACCENT}
          />
        ) : (
          <>
            <HeroStat
              label={`${year} declared income`}
              value={formatDZD(totals.net)}
              caption={`${totals.jobs} completed job${totals.jobs === 1 ? '' : 's'} · ${formatDZD(totals.gross)} gross before commission`}
              color={ACCENT}
              icon="receipt-outline"
            />

            <Panel title="Annual summary" badge={year}>
              <MetricRow label="Gross revenue" value={formatDZD(totals.gross)} />
              <MetricRow
                label={`RIHLA commission (${Math.round(COMMISSION_RATE * 100)}%)`}
                value={`− ${formatDZD(totals.commission)}`}
                color={PRO.red}
              />
              <View style={styles.divider} />
              <MetricRow label="Net income received" value={formatDZD(totals.net)} color={PRO.green} />
              <MetricRow label="Completed jobs" value={String(totals.jobs)} />
              <MetricRow
                label="Average per job"
                value={formatDZD(totals.jobs > 0 ? totals.gross / totals.jobs : 0)}
              />
              <GhostButton
                label={`Download ${year} annual summary`}
                icon="download-outline"
                color={ACCENT}
                onPress={() => showToast(`${year} summary sent to your email`, 'success')}
              />
            </Panel>

            <SectionTitle>Monthly invoices</SectionTitle>
            <View style={styles.rows}>
              {byMonth.map((m) => (
                <ListRow
                  key={m.key}
                  icon="document-text-outline"
                  iconColor={ACCENT}
                  title={m.label}
                  subtitle={`${m.jobs} job${m.jobs === 1 ? '' : 's'} · ${formatDZD(m.gross * (1 - COMMISSION_RATE))} net`}
                  onPress={() => showToast(`Invoice for ${m.label} downloaded`, 'success')}
                />
              ))}
            </View>
          </>
        )}

        {/* ── Fiscal identity ── */}
        <SectionTitle>Fiscal identity</SectionTitle>
        <Panel>
          <ListRow
            icon="person-outline"
            iconColor={ACCENT}
            title={user.name || 'Name not set'}
            subtitle="Registered partner name"
            showChevron={false}
          />
          <ListRow
            icon="card-outline"
            iconColor={ACCENT}
            title={user.kycData?.tradeRegisterUri ? 'Commercial register on file' : 'No commercial register'}
            subtitle={user.kycData?.tradeRegisterUri ? 'Uploaded during verification' : 'Required for invoices above 100,000 DZD'}
            right={
              <StatusPill
                label={user.kycData?.tradeRegisterUri ? 'On file' : 'Missing'}
                color={user.kycData?.tradeRegisterUri ? PRO.green : PRO.amber}
              />
            }
            showChevron={false}
          />
          <ListRow
            icon="location-outline"
            iconColor={ACCENT}
            title={user.kycData?.wilaya || user.wilaya || 'Wilaya not set'}
            subtitle="Fiscal residence"
            showChevron={false}
          />
        </Panel>

        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color={PRO.subtle} />
          <Text style={styles.note}>
            These documents summarise what RIHLA paid you. They are not a filed tax return — give them to your
            accountant or attach them to your declaration.
          </Text>
        </View>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18, flex: 1 },
  rows: { gap: 10 },
  divider: { height: 1, backgroundColor: PRO.borderSoft, marginVertical: 4 },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 },
});
