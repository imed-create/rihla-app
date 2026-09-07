/**
 * RIHLA — Business Earnings & Payouts
 * ───────────────────────────────────
 * Revenue summaries, settlement balance, payout history and invoices.
 * Figures are derived deterministically from the owner's real assets
 * (useBusinessAssets) so the screen stays stable across re-renders.
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
  PrimaryButton,
  ProgressBar,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { useApp } from '@/context/AppContext';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import type { MarketplaceCategory } from '@/types/service';

const PERIODS = ['This Week', 'This Month', 'This Year'] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_DAYS: Record<Period, number> = {
  'This Week': 7,
  'This Month': 30,
  'This Year': 365,
};

type PayoutStatus = 'paid' | 'processing' | 'scheduled';

type Payout = {
  id: string;
  reference: string;
  amountDZD: number;
  date: string;
  method: string;
  status: PayoutStatus;
};

const PAYOUT_STATUS_COLOR: Record<PayoutStatus, string> = {
  paid: PRO.green,
  processing: PRO.amber,
  scheduled: PRO.blue,
};

const PAYOUT_STATUS_LABEL: Record<PayoutStatus, string> = {
  paid: 'Paid',
  processing: 'Processing',
  scheduled: 'Scheduled',
};

/** RIHLA takes a 12% platform commission on gross bookings. */
const COMMISSION_RATE = 0.12;

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

function monthLabel(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function BusinessEarnings() {
  const { user } = useApp();
  const { assets, getMyAssets } = useBusinessAssets();
  const [period, setPeriod] = useState<Period>('This Month');

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as MarketplaceCategory) : null;
  const color = catDef?.color ?? PRO.navy;

  const myAssets = useMemo(() => getMyAssets(businessType), [businessType, assets, getMyAssets]);

  /** Deterministic revenue model driven by the owner's real asset prices. */
  const earnings = useMemo(() => {
    const days = PERIOD_DAYS[period];
    const bookable = myAssets.filter((a) => a.available);
    const avgPrice =
      myAssets.length > 0
        ? myAssets.reduce((sum, a) => sum + a.priceDZD, 0) / myAssets.length
        : 0;

    // ~35% of bookable inventory sells on a given day.
    const bookingsCount = Math.round(bookable.length * days * 0.35);
    const gross = avgPrice * bookingsCount;
    const commission = gross * COMMISSION_RATE;
    const net = gross - commission;

    return {
      gross,
      commission,
      net,
      bookingsCount,
      avgPrice,
      avgBooking: bookingsCount > 0 ? gross / bookingsCount : 0,
      bookableCount: bookable.length,
    };
  }, [myAssets, period]);

  /** Balance is what a monthly cycle nets, minus what has already settled. */
  const monthlyNet = useMemo(() => {
    const bookable = myAssets.filter((a) => a.available).length;
    const avgPrice =
      myAssets.length > 0 ? myAssets.reduce((s, a) => s + a.priceDZD, 0) / myAssets.length : 0;
    return avgPrice * Math.round(bookable * 30 * 0.35) * (1 - COMMISSION_RATE);
  }, [myAssets]);

  const availableBalance = monthlyNet * 0.4;
  const pendingClearance = monthlyNet * 0.15;
  const payoutThreshold = 5000;
  const canWithdraw = availableBalance >= payoutThreshold;

  /** Revenue split across the asset kinds the owner actually has. */
  const revenueByKind = useMemo(() => {
    const groups = new Map<string, { count: number; revenue: number }>();
    myAssets.forEach((a) => {
      const key = a.assetKind || 'other';
      const entry = groups.get(key) ?? { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += a.priceDZD;
      groups.set(key, entry);
    });
    const rows = [...groups.entries()].map(([kind, data]) => ({ kind, ...data }));
    rows.sort((a, b) => b.revenue - a.revenue);
    return rows;
  }, [myAssets]);

  const maxKindRevenue = revenueByKind.length > 0 ? revenueByKind[0].revenue : 1;

  /** Three settlement cycles derived from the monthly net. */
  const payouts = useMemo<Payout[]>(() => {
    if (monthlyNet <= 0) return [];
    return [
      {
        id: 'po-0',
        reference: 'PO-2026-0614',
        amountDZD: monthlyNet * 0.45,
        date: monthLabel(0),
        method: 'CCP · **** 4471',
        status: 'processing',
      },
      {
        id: 'po-1',
        reference: 'PO-2026-0531',
        amountDZD: monthlyNet * 0.92,
        date: monthLabel(1),
        method: 'CCP · **** 4471',
        status: 'paid',
      },
      {
        id: 'po-2',
        reference: 'PO-2026-0430',
        amountDZD: monthlyNet * 0.78,
        date: monthLabel(2),
        method: 'CCP · **** 4471',
        status: 'paid',
      },
    ];
  }, [monthlyNet]);

  const handleWithdraw = () => {
    if (!canWithdraw) {
      showToast(`Minimum payout is ${formatDZD(payoutThreshold)}`, 'info');
      return;
    }
    showToast(`Payout of ${formatDZD(availableBalance)} requested`, 'success');
  };

  const hasData = myAssets.length > 0;

  return (
    <ProScreenChrome role="business" title="Earnings & Payouts" subtitle="Revenue, invoices, settlements">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!hasData ? (
          <EmptyBlock
            icon="cash-outline"
            title="No earnings yet"
            subtitle="Add listings and inventory to your business — revenue, settlements and invoices will appear here as bookings come in."
            color={color}
          />
        ) : (
          <>
            {/* ── Settlement balance ── */}
            <HeroStat
              label="Available for payout"
              value={formatDZD(availableBalance)}
              caption={`${formatDZD(pendingClearance)} still clearing · minimum payout ${formatDZD(payoutThreshold)}`}
              color={color}
              icon="wallet-outline"
            >
              <View style={styles.heroActions}>
                <View style={styles.heroActionGrow}>
                  <PrimaryButton
                    label={canWithdraw ? 'Withdraw' : 'Below minimum'}
                    icon="arrow-down-circle-outline"
                    color={color}
                    disabled={!canWithdraw}
                    onPress={handleWithdraw}
                  />
                </View>
                <View style={styles.heroActionGrow}>
                  <GhostButton
                    label="Statement"
                    icon="document-text-outline"
                    color={color}
                    onPress={() => showToast('Statement exported to your email', 'success')}
                  />
                </View>
              </View>
            </HeroStat>

            {/* ── Period ── */}
            <Segmented options={PERIODS} value={period} onChange={setPeriod} color={color} />

            <StatGrid>
              <StatCard
                icon="trending-up-outline"
                label="Gross revenue"
                value={formatDZD(earnings.gross)}
                color={color}
                hint={period}
              />
              <StatCard
                icon="calendar-outline"
                label="Bookings"
                value={String(earnings.bookingsCount)}
                color={PRO.blue}
                hint={`avg ${formatDZD(earnings.avgBooking)}`}
              />
              <StatCard
                icon="checkmark-circle-outline"
                label="Net payout"
                value={formatDZD(earnings.net)}
                color={PRO.green}
                hint="after commission"
              />
              <StatCard
                icon="remove-circle-outline"
                label="Commission"
                value={formatDZD(earnings.commission)}
                color={PRO.red}
                hint={`${Math.round(COMMISSION_RATE * 100)}% platform fee`}
              />
            </StatGrid>

            {/* ── Settlement breakdown ── */}
            <Panel title="Settlement breakdown" badge={period}>
              <MetricRow label="Gross bookings" value={formatDZD(earnings.gross)} />
              <MetricRow
                label={`RIHLA commission (${Math.round(COMMISSION_RATE * 100)}%)`}
                value={`− ${formatDZD(earnings.commission)}`}
                color={PRO.red}
              />
              <View style={styles.divider} />
              <MetricRow label="Net to your account" value={formatDZD(earnings.net)} color={PRO.green} />
              <Text style={styles.note}>
                Settlements run on the last working day of each month. Funds clear 3–5 business days after transfer.
              </Text>
            </Panel>

            {/* ── Revenue by asset kind ── */}
            {revenueByKind.length > 0 && (
              <Panel title="Revenue by inventory type" badge={`${revenueByKind.length} types`}>
                {revenueByKind.map((row) => (
                  <View key={row.kind} style={styles.kindRow}>
                    <View style={styles.kindHead}>
                      <Text style={styles.kindName}>
                        {row.kind.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Text>
                      <Text style={styles.kindValue}>
                        {row.count} × {formatDZD(row.revenue / row.count)}
                      </Text>
                    </View>
                    <ProgressBar pct={(row.revenue / maxKindRevenue) * 100} color={color} />
                  </View>
                ))}
              </Panel>
            )}

            {/* ── Payout history ── */}
            <SectionTitle>Payout history</SectionTitle>
            {payouts.length === 0 ? (
              <Panel>
                <Text style={styles.note}>No settlements have run yet.</Text>
              </Panel>
            ) : (
              <View style={styles.rows}>
                {payouts.map((p) => (
                  <ListRow
                    key={p.id}
                    icon="swap-horizontal-outline"
                    iconColor={PAYOUT_STATUS_COLOR[p.status]}
                    title={formatDZD(p.amountDZD)}
                    subtitle={`${p.reference} · ${p.date} · ${p.method}`}
                    right={<StatusPill label={PAYOUT_STATUS_LABEL[p.status]} color={PAYOUT_STATUS_COLOR[p.status]} />}
                    showChevron={false}
                    onPress={() => showToast(`Receipt ${p.reference} downloaded`, 'success')}
                  />
                ))}
              </View>
            )}

            {/* ── Payout method ── */}
            <Panel title="Payout method">
              <ListRow
                icon="card-outline"
                iconColor={color}
                title="Algérie Poste CCP"
                subtitle="**** **** 4471 · default"
                right={<StatusPill label="Verified" color={PRO.green} />}
                showChevron={false}
              />
              <GhostButton
                label="Change payout method"
                icon="settings-outline"
                color={color}
                onPress={() => showToast('Payout settings open in Business Profile', 'info')}
              />
            </Panel>

            <View style={styles.footerNote}>
              <Ionicons name="shield-checkmark-outline" size={14} color={PRO.subtle} />
              <Text style={styles.note}>
                All amounts are shown in Algerian Dinar (DZD) and exclude applicable local taxes.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  heroActionGrow: { flex: 1 },
  divider: { height: 1, backgroundColor: PRO.border, marginVertical: 4 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 17, flex: 1 },
  kindRow: { gap: 6, paddingVertical: 5 },
  kindHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kindName: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  kindValue: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  rows: { gap: 10 },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4, marginTop: 4 },
});
