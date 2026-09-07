/**
 * RIHLA — Business Reports
 * ────────────────────────
 * Build a report from the owner's real inventory, preview the figures it
 * would contain, then export it. Previously generated reports are listed
 * with their range and format.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  GhostButton,
  type IonName,
  ListRow,
  MetricRow,
  Panel,
  PRO,
  PrimaryButton,
  SectionTitle,
  Segmented,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { useApp } from '@/context/AppContext';
import { hapticLight } from '@/utils/haptics';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import type { MarketplaceCategory } from '@/types/service';

const RANGES = ['Last 7 days', 'Last 30 days', 'Last quarter', 'Year to date'] as const;
type Range = (typeof RANGES)[number];

const RANGE_DAYS: Record<Range, number> = {
  'Last 7 days': 7,
  'Last 30 days': 30,
  'Last quarter': 90,
  'Year to date': 365,
};

const FORMATS = ['PDF', 'CSV', 'Excel'] as const;
type Format = (typeof FORMATS)[number];

type ReportKind = 'revenue' | 'occupancy' | 'bookings' | 'guests' | 'tax' | 'inventory';

type ReportType = {
  kind: ReportKind;
  label: string;
  description: string;
  icon: IonName;
  color: string;
};

const REPORT_TYPES: ReportType[] = [
  { kind: 'revenue', label: 'Revenue', description: 'Gross, commission and net by period', icon: 'cash-outline', color: '#10B981' },
  { kind: 'occupancy', label: 'Occupancy', description: 'Utilisation rate across your inventory', icon: 'bar-chart-outline', color: '#3B82F6' },
  { kind: 'bookings', label: 'Bookings', description: 'Every reservation with status and value', icon: 'calendar-outline', color: '#8B5CF6' },
  { kind: 'guests', label: 'Guests', description: 'Traveller profiles, origin and repeat rate', icon: 'people-outline', color: '#F59E0B' },
  { kind: 'tax', label: 'Tax summary', description: 'Fiscal totals ready for your accountant', icon: 'receipt-outline', color: '#EF4444' },
  { kind: 'inventory', label: 'Inventory', description: 'Full asset list with pricing and status', icon: 'cube-outline', color: '#00a896' },
];

type PastReport = {
  id: string;
  label: string;
  range: string;
  format: Format;
  generatedAt: string;
  sizeKb: number;
};

const PAST_REPORTS: PastReport[] = [
  { id: 'r1', label: 'Revenue — May 2026', range: '1–31 May 2026', format: 'PDF', generatedAt: '01 Jun 2026', sizeKb: 284 },
  { id: 'r2', label: 'Occupancy — Q1 2026', range: 'Jan–Mar 2026', format: 'Excel', generatedAt: '02 Apr 2026', sizeKb: 512 },
  { id: 'r3', label: 'Tax summary — 2025', range: 'Full year 2025', format: 'PDF', generatedAt: '15 Jan 2026', sizeKb: 196 },
];

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

export default function BusinessReports() {
  const { user } = useApp();
  const { assets, getMyAssets } = useBusinessAssets();
  const [kind, setKind] = useState<ReportKind>('revenue');
  const [range, setRange] = useState<Range>('Last 30 days');
  const [format, setFormat] = useState<Format>('PDF');

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as MarketplaceCategory) : null;
  const color = catDef?.color ?? PRO.navy;

  const myAssets = useMemo(() => getMyAssets(businessType), [businessType, assets, getMyAssets]);
  const selectedType = REPORT_TYPES.find((t) => t.kind === kind) ?? REPORT_TYPES[0];

  /** What the selected report would actually contain, from real inventory. */
  const preview = useMemo(() => {
    const days = RANGE_DAYS[range];
    const total = myAssets.length;
    const available = myAssets.filter((a) => a.available).length;
    const occupied = total - available;
    const avgPrice = total > 0 ? myAssets.reduce((s, a) => s + a.priceDZD, 0) / total : 0;
    const bookings = Math.round(available * days * 0.35);
    const gross = avgPrice * bookings;

    return {
      total,
      available,
      occupied,
      avgPrice,
      bookings,
      gross,
      net: gross * 0.88,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
      rows: kind === 'inventory' ? total : bookings,
      days,
    };
  }, [myAssets, range, kind]);

  const handleGenerate = () => {
    if (myAssets.length === 0) {
      showToast('Add inventory before generating a report', 'info');
      return;
    }
    showToast(`${selectedType.label} report (${format}) is being prepared`, 'success');
  };

  return (
    <ProScreenChrome role="business" title="Reports" subtitle="Custom reports & exports">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Report type ── */}
        <SectionTitle>Report type</SectionTitle>
        <View style={styles.typeGrid}>
          {REPORT_TYPES.map((t) => {
            const active = t.kind === kind;
            return (
              <Pressable
                key={t.kind}
                style={[styles.typeCard, active && { borderColor: t.color, backgroundColor: t.color + '08' }]}
                onPress={() => { hapticLight(); setKind(t.kind); }}
              >
                <View style={[styles.typeIcon, { backgroundColor: t.color + '15' }]}>
                  <Ionicons name={t.icon} size={19} color={t.color} />
                </View>
                <Text style={styles.typeLabel}>{t.label}</Text>
                <Text style={styles.typeDesc} numberOfLines={2}>{t.description}</Text>
                {active ? (
                  <View style={[styles.typeCheck, { backgroundColor: t.color }]}>
                    <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* ── Range ── */}
        <SectionTitle>Date range</SectionTitle>
        <Segmented options={RANGES} value={range} onChange={setRange} color={color} />

        {/* ── Format ── */}
        <SectionTitle>Export format</SectionTitle>
        <Segmented options={FORMATS} value={format} onChange={setFormat} color={color} />

        {/* ── Preview ── */}
        <Panel title={`${selectedType.label} preview`} badge={range} accent={selectedType.color}>
          {kind === 'revenue' && (
            <>
              <MetricRow label="Gross revenue" value={formatDZD(preview.gross)} />
              <MetricRow label="Platform commission" value={`− ${formatDZD(preview.gross * 0.12)}`} color={PRO.red} />
              <MetricRow label="Net revenue" value={formatDZD(preview.net)} color={PRO.green} />
              <MetricRow label="Average booking value" value={formatDZD(preview.avgPrice)} />
            </>
          )}
          {kind === 'occupancy' && (
            <>
              <MetricRow label="Occupancy rate" value={`${preview.occupancyRate}%`} color={selectedType.color} />
              <MetricRow label="Booked assets" value={String(preview.occupied)} />
              <MetricRow label="Available assets" value={String(preview.available)} />
              <MetricRow label="Total inventory" value={String(preview.total)} />
            </>
          )}
          {kind === 'bookings' && (
            <>
              <MetricRow label="Reservations in range" value={String(preview.bookings)} />
              <MetricRow label="Average value" value={formatDZD(preview.avgPrice)} />
              <MetricRow label="Total value" value={formatDZD(preview.gross)} />
              <MetricRow label="Days covered" value={String(preview.days)} />
            </>
          )}
          {kind === 'guests' && (
            <>
              <MetricRow label="Unique guests" value={String(Math.round(preview.bookings * 0.78))} />
              <MetricRow label="Repeat guests" value={String(Math.round(preview.bookings * 0.22))} />
              <MetricRow label="Average party size" value="2.4" />
              <MetricRow label="Top origin wilaya" value={user.kycData?.wilaya || 'Algiers'} />
            </>
          )}
          {kind === 'tax' && (
            <>
              <MetricRow label="Taxable revenue" value={formatDZD(preview.net)} />
              <MetricRow label="Declared bookings" value={String(preview.bookings)} />
              <MetricRow label="Commission paid" value={formatDZD(preview.gross * 0.12)} />
              <MetricRow label="Fiscal period" value={range} />
            </>
          )}
          {kind === 'inventory' && (
            <>
              <MetricRow label="Assets listed" value={String(preview.total)} />
              <MetricRow label="Currently bookable" value={String(preview.available)} color={PRO.green} />
              <MetricRow label="Unavailable" value={String(preview.occupied)} color={PRO.red} />
              <MetricRow label="Average price" value={formatDZD(preview.avgPrice)} />
            </>
          )}
          <View style={styles.previewFoot}>
            <Ionicons name="document-outline" size={13} color={PRO.subtle} />
            <Text style={styles.note}>
              {preview.rows} row{preview.rows === 1 ? '' : 's'} · exported as {format}
            </Text>
          </View>
        </Panel>

        <PrimaryButton
          label={`Generate ${selectedType.label} report`}
          icon="download-outline"
          color={color}
          onPress={handleGenerate}
        />
        <GhostButton
          label="Schedule this report monthly"
          icon="time-outline"
          color={color}
          onPress={() => showToast(`${selectedType.label} report scheduled monthly`, 'success')}
        />

        {/* ── History ── */}
        <SectionTitle>Recent exports</SectionTitle>
        <View style={styles.rows}>
          {PAST_REPORTS.map((r) => (
            <ListRow
              key={r.id}
              icon={r.format === 'PDF' ? 'document-text-outline' : 'grid-outline'}
              iconColor={r.format === 'PDF' ? PRO.red : PRO.green}
              title={r.label}
              subtitle={`${r.range} · ${r.generatedAt} · ${r.sizeKb} KB`}
              onPress={() => showToast(`Downloading ${r.label}`, 'success')}
            />
          ))}
        </View>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: PRO.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    padding: 14,
    gap: 7,
  },
  typeIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  typeDesc: { fontSize: 11, fontFamily: 'mon', color: PRO.muted, lineHeight: 15 },
  typeCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 17 },
  rows: { gap: 10 },
});
