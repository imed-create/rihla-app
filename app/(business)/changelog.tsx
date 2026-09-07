/**
 * RIHLA — What's New
 * ──────────────────
 * Release timeline for the business workspace. Entries are grouped by
 * version with typed change tags so owners can see what actually shipped.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  type IonName,
  Panel,
  PRO,
  SectionTitle,
  Segmented,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { hapticLight } from '@/utils/haptics';

type ChangeKind = 'new' | 'improved' | 'fixed';

const KIND_META: Record<ChangeKind, { label: string; color: string; icon: IonName }> = {
  new: { label: 'New', color: '#10B981', icon: 'sparkles-outline' },
  improved: { label: 'Improved', color: '#3B82F6', icon: 'trending-up-outline' },
  fixed: { label: 'Fixed', color: '#F59E0B', icon: 'build-outline' },
};

type Change = { kind: ChangeKind; text: string };

type Release = {
  version: string;
  date: string;
  headline: string;
  changes: Change[];
  highlight?: boolean;
};

const RELEASES: Release[] = [
  {
    version: '2.4',
    date: 'June 2026',
    headline: 'The business workspace grows up',
    highlight: true,
    changes: [
      { kind: 'new', text: 'Earnings & Payouts — settlement balance, withdrawals and payout history in one place.' },
      { kind: 'new', text: 'Staff Management — track your roster, shift patterns and monthly payroll.' },
      { kind: 'new', text: 'Partner Network — connect with nearby providers and earn referral commission.' },
      { kind: 'new', text: 'Reports — export revenue, occupancy, guest and tax summaries as PDF, CSV or Excel.' },
      { kind: 'new', text: 'Marketplace Insights — see where your prices sit against the rest of your category.' },
      { kind: 'improved', text: 'Business Profile now edits your brand assets, address and booking preferences directly.' },
    ],
  },
  {
    version: '2.3',
    date: 'May 2026',
    headline: 'Category dashboards for every business type',
    changes: [
      { kind: 'new', text: 'Dedicated dashboards for hotels, restaurants, beach clubs, rentals and 8 more categories.' },
      { kind: 'new', text: 'QR ticket scanner — validate traveller tickets straight from your dashboard.' },
      { kind: 'improved', text: 'Bookings tab now splits incoming requests from confirmed reservations.' },
      { kind: 'improved', text: 'Inventory Control handles rooms, menu items, spots and assets under one model.' },
      { kind: 'fixed', text: 'Listings occasionally showed a stale availability count after a booking was cancelled.' },
    ],
  },
  {
    version: '2.2',
    date: 'April 2026',
    headline: 'Beach operations and live maps',
    changes: [
      { kind: 'new', text: 'Beach satellite map — draw your zones and place umbrellas on real coordinates.' },
      { kind: 'new', text: 'Live order tickets for food and drinks delivered to a beach spot.' },
      { kind: 'improved', text: 'Analytics gained revenue projections and a conversion funnel.' },
      { kind: 'fixed', text: 'Maps stayed on an infinite loading state when GPS permission was denied.' },
    ],
  },
  {
    version: '2.1',
    date: 'March 2026',
    headline: 'Verification and payouts',
    changes: [
      { kind: 'new', text: 'Six-step business KYC with document upload and GPS pin.' },
      { kind: 'new', text: 'CCP and bank payout methods with monthly settlement cycles.' },
      { kind: 'improved', text: 'Verified badge now shows on every listing owned by a verified business.' },
      { kind: 'fixed', text: 'Commercial register uploads over 5 MB failed silently.' },
    ],
  },
];

const FILTERS = ['All', 'New', 'Improved', 'Fixed'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_KIND: Record<Exclude<Filter, 'All'>, ChangeKind> = {
  New: 'new',
  Improved: 'improved',
  Fixed: 'fixed',
};

export default function BusinessChangelog() {
  const [filter, setFilter] = useState<Filter>('All');
  const [expanded, setExpanded] = useState<string | null>(RELEASES[0].version);

  const releases = useMemo(() => {
    if (filter === 'All') return RELEASES;
    const kind = FILTER_KIND[filter];
    return RELEASES.map((r) => ({ ...r, changes: r.changes.filter((c) => c.kind === kind) })).filter(
      (r) => r.changes.length > 0
    );
  }, [filter]);

  const totalChanges = useMemo(
    () => RELEASES.reduce((sum, r) => sum + r.changes.length, 0),
    []
  );

  return (
    <ProScreenChrome role="business" title="What's New" subtitle="Updates & changelog">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Panel accent={PRO.navy}>
          <View style={styles.introHead}>
            <View style={[styles.introIcon, { backgroundColor: PRO.navy + '15' }]}>
              <Ionicons name="megaphone-outline" size={20} color={PRO.navy} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.introTitle}>RIHLA for Business {RELEASES[0].version}</Text>
              <Text style={styles.note}>
                {totalChanges} changes across {RELEASES.length} releases. Have an idea? Tell us what to build next.
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.feedbackBtn}
            onPress={() => { hapticLight(); showToast('Thanks — your feedback reached the product team', 'success'); }}
          >
            <Ionicons name="bulb-outline" size={15} color={PRO.navy} />
            <Text style={styles.feedbackText}>Suggest a feature</Text>
          </Pressable>
        </Panel>

        <Segmented options={FILTERS} value={filter} onChange={setFilter} color={PRO.navy} />

        <SectionTitle>Release history</SectionTitle>

        <View style={styles.timeline}>
          {releases.map((release, index) => {
            const open = expanded === release.version || filter !== 'All';
            const isLast = index === releases.length - 1;
            return (
              <View key={release.version} style={styles.timelineRow}>
                {/* rail */}
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.railDot,
                      release.highlight ? { backgroundColor: PRO.navy, borderColor: PRO.navy } : null,
                    ]}
                  />
                  {!isLast ? <View style={styles.railLine} /> : null}
                </View>

                {/* card */}
                <Pressable
                  style={styles.releaseCard}
                  onPress={() => { hapticLight(); setExpanded(open && filter === 'All' ? null : release.version); }}
                >
                  <View style={styles.releaseHead}>
                    <View style={styles.flex}>
                      <View style={styles.versionRow}>
                        <Text style={styles.version}>Version {release.version}</Text>
                        {release.highlight ? (
                          <View style={styles.latestBadge}>
                            <Text style={styles.latestText}>Latest</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.releaseDate}>{release.date}</Text>
                    </View>
                    {filter === 'All' ? (
                      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={17} color={PRO.subtle} />
                    ) : null}
                  </View>

                  <Text style={styles.headline}>{release.headline}</Text>

                  {open ? (
                    <View style={styles.changeList}>
                      {release.changes.map((change, i) => {
                        const meta = KIND_META[change.kind];
                        return (
                          <View key={i} style={styles.changeRow}>
                            <View style={[styles.changeTag, { backgroundColor: meta.color + '15' }]}>
                              <Ionicons name={meta.icon} size={11} color={meta.color} />
                              <Text style={[styles.changeTagText, { color: meta.color }]}>{meta.label}</Text>
                            </View>
                            <Text style={styles.changeText}>{change.text}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.collapsedHint}>
                      {release.changes.length} change{release.changes.length === 1 ? '' : 's'} — tap to expand
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  flex: { flex: 1 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },

  introHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  introIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  introTitle: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text, marginBottom: 2 },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: PRO.sunken,
  },
  feedbackText: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.navy },

  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 14, alignItems: 'center', paddingTop: 18 },
  railDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRO.surface,
    borderWidth: 2,
    borderColor: PRO.border,
  },
  railLine: { flex: 1, width: 2, backgroundColor: PRO.border, marginTop: 4 },

  releaseCard: {
    flex: 1,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
    gap: 8,
  },
  releaseHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  versionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  version: { fontSize: 15, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.3 },
  latestBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: '#ECFDF5' },
  latestText: { fontSize: 10, fontFamily: 'mon-b', color: PRO.green },
  releaseDate: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle, marginTop: 2 },
  headline: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.muted, lineHeight: 19 },
  collapsedHint: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle },

  changeList: { gap: 10, marginTop: 4 },
  changeRow: { gap: 6 },
  changeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  changeTagText: { fontSize: 10, fontFamily: 'mon-b' },
  changeText: { fontSize: 13, fontFamily: 'mon', color: PRO.text, lineHeight: 19 },
});
