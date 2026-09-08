/**
 * RIHLA — Partner Notifications
 * ─────────────────────────────
 * Readable inbox backed by useNotificationInbox, seeded once from the
 * partner's real dispatch state so the feed reflects actual jobs rather
 * than invented events. Also exposes the push preference toggles.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  type IonName,
  Panel,
  PRO,
  SectionTitle,
  Segmented,
  Toggle,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { hapticLight } from '@/utils/haptics';
import { type InboxCategory, useNotificationInbox } from '@/store/useNotificationInbox';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';

const ACCENT = '#f4a261';

const FILTERS = ['All', 'Unread', 'Jobs', 'Payouts', 'System'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_CATEGORY: Partial<Record<Filter, InboxCategory>> = {
  Jobs: 'job',
  Payouts: 'payout',
  System: 'system',
};

const CATEGORY_META: Record<InboxCategory, { label: string; color: string; icon: IonName }> = {
  job: { label: 'Job', color: '#8B5CF6', icon: 'briefcase-outline' },
  payout: { label: 'Payout', color: '#10B981', icon: 'cash-outline' },
  review: { label: 'Review', color: '#f4a261', icon: 'star-outline' },
  system: { label: 'System', color: '#3B82F6', icon: 'information-circle-outline' },
  promo: { label: 'Offer', color: '#EF4444', icon: 'pricetag-outline' },
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMinutes = Math.round((Date.now() - then) / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function PartnerNotifications() {
  const { items, push, markRead, markAllRead, remove, clearAll } = useNotificationInbox();
  const { dispatches } = usePartnerDispatches();
  const [filter, setFilter] = useState<Filter>('All');

  const [pushJobs, setPushJobs] = useState(true);
  const [pushPayouts, setPushPayouts] = useState(true);
  const [pushPromos, setPushPromos] = useState(false);

  /** Seed the inbox once from real pending jobs so it isn't empty on first open. */
  useEffect(() => {
    if (items.length > 0) return;
    const pending = dispatches.filter((d) => d.status === 'pending').slice(0, 5);
    pending.forEach((job) => {
      push({
        category: 'job',
        title: 'New job offer',
        body: `${job.title} — ${job.customerName} at ${job.location}. ${job.priceDZD.toLocaleString('en-US')} DZD.`,
        href: '/(partner)/tasks',
      });
    });
    if (pending.length === 0 && dispatches.length > 0) {
      push({
        category: 'system',
        title: 'You are all caught up',
        body: 'No job offers are waiting on you right now. Stay online to receive new dispatches.',
      });
    }
  }, [items.length, dispatches, push]);

  const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const visible = useMemo(() => {
    if (filter === 'All') return items;
    if (filter === 'Unread') return items.filter((i) => !i.read);
    const category = FILTER_CATEGORY[filter];
    return category ? items.filter((i) => i.category === category) : items;
  }, [items, filter]);

  const handleOpen = (id: string, href?: string) => {
    hapticLight();
    markRead(id);
    if (href) router.push(href as never);
  };

  return (
    <ProScreenChrome
      role="partner"
      title="Notifications"
      subtitle="Alerts & booking requests"
      headerRight={
        unread > 0 ? (
          <Pressable
            style={styles.markAllBtn}
            onPress={() => { hapticLight(); markAllRead(); showToast('All marked as read', 'success'); }}
          >
            <Ionicons name="checkmark-done-outline" size={19} color={ACCENT} />
          </Pressable>
        ) : undefined
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <EmptyBlock
            icon="notifications-outline"
            title="Inbox is empty"
            subtitle="Job offers, payout confirmations and platform updates land here. Go online from your dashboard to start receiving dispatches."
            color={ACCENT}
          />
        ) : (
          <>
            <Segmented options={FILTERS} value={filter} onChange={setFilter} color={ACCENT} />

            <SectionTitle
              right={
                unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unread} unread</Text>
                  </View>
                ) : undefined
              }
            >
              {filter === 'All' ? 'All notifications' : filter}
            </SectionTitle>

            {visible.length === 0 ? (
              <Panel>
                <Text style={styles.note}>Nothing here right now.</Text>
              </Panel>
            ) : (
              <View style={styles.rows}>
                {visible.map((item) => {
                  const meta = CATEGORY_META[item.category];
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.card, !item.read && { borderColor: meta.color + '45', backgroundColor: meta.color + '06' }]}
                      onPress={() => handleOpen(item.id, item.href)}
                    >
                      <View style={[styles.cardIcon, { backgroundColor: meta.color + '15' }]}>
                        <Ionicons name={meta.icon} size={18} color={meta.color} />
                      </View>
                      <View style={styles.cardBody}>
                        <View style={styles.cardHead}>
                          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                          {!item.read ? <View style={[styles.dot, { backgroundColor: meta.color }]} /> : null}
                        </View>
                        <Text style={styles.cardText} numberOfLines={3}>{item.body}</Text>
                        <View style={styles.cardFoot}>
                          <Text style={[styles.cardTag, { color: meta.color }]}>{meta.label}</Text>
                          <Text style={styles.dotSep}>·</Text>
                          <Text style={styles.cardTime}>{relativeTime(item.createdAt)}</Text>
                        </View>
                      </View>
                      <Pressable
                        style={styles.dismissBtn}
                        onPress={() => { hapticLight(); remove(item.id); }}
                        hitSlop={8}
                      >
                        <Ionicons name="close" size={16} color={PRO.subtle} />
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Pressable
              style={styles.clearBtn}
              onPress={() => { hapticLight(); clearAll(); showToast('Inbox cleared', 'info'); }}
            >
              <Ionicons name="trash-outline" size={15} color={PRO.muted} />
              <Text style={styles.clearText}>Clear all notifications</Text>
            </Pressable>
          </>
        )}

        {/* ── Preferences ── */}
        <SectionTitle>Push preferences</SectionTitle>
        <Panel>
          <Toggle
            label="Job offers"
            description="Get notified the moment a job is dispatched to you."
            value={pushJobs}
            onValueChange={setPushJobs}
            color={ACCENT}
          />
          <View style={styles.hairline} />
          <Toggle
            label="Payouts"
            description="Confirmation when a settlement reaches your account."
            value={pushPayouts}
            onValueChange={setPushPayouts}
            color={ACCENT}
          />
          <View style={styles.hairline} />
          <Toggle
            label="Offers & tips"
            description="Occasional partner promotions and earning tips."
            value={pushPromos}
            onValueChange={setPushPromos}
            color={ACCENT}
          />
        </Panel>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  rows: { gap: 10 },
  hairline: { height: 1, backgroundColor: PRO.borderSoft },

  markAllBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  unreadBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: ACCENT + '20' },
  unreadText: { fontSize: 11, fontFamily: 'mon-b', color: '#B45309' },

  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  cardIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 4 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  dot: { width: 7, height: 7, borderRadius: 4 },
  cardText: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  cardTag: { fontSize: 11, fontFamily: 'mon-b' },
  dotSep: { fontSize: 11, color: PRO.subtle },
  cardTime: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle },
  dismissBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PRO.sunken,
  },
  clearText: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.muted },
});
