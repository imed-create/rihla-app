/**
 * RIHLA — Partner Tasks
 * ─────────────────────
 * Every job assigned to this partner, pulled from the real dispatch store
 * plus the service requests in AppContext. Partners move a job through
 * accept → in progress → complete from here.
 */

import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  HeroStat,
  type IonName,
  Panel,
  PRO,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { type DispatchStatus, usePartnerDispatches } from '@/store/usePartnerDispatches';

const ACCENT = '#f4a261';

const TABS = ['Pending', 'In progress', 'Completed', 'All'] as const;
type Tab = (typeof TABS)[number];

const TAB_STATUSES: Record<Exclude<Tab, 'All'>, DispatchStatus[]> = {
  Pending: ['pending'],
  'In progress': ['accepted', 'in-progress'],
  Completed: ['completed'],
};

const STATUS_META: Record<DispatchStatus, { label: string; color: string; icon: IonName }> = {
  pending: { label: 'Pending', color: PRO.amber, icon: 'hourglass-outline' },
  accepted: { label: 'Accepted', color: PRO.blue, icon: 'checkmark-circle-outline' },
  'in-progress': { label: 'In progress', color: PRO.violet, icon: 'navigate-outline' },
  completed: { label: 'Completed', color: PRO.green, icon: 'checkmark-done-outline' },
  declined: { label: 'Declined', color: PRO.subtle, icon: 'close-circle-outline' },
  cancelled: { label: 'Cancelled', color: PRO.red, icon: 'ban-outline' },
};

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PartnerTasks() {
  const { serviceRequests } = useApp();
  const { dispatches, acceptDispatch, declineDispatch, completeDispatch, updateDispatch } =
    usePartnerDispatches();
  const [tab, setTab] = useState<Tab>('Pending');

  const visible = useMemo(() => {
    const sorted = [...dispatches].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (tab === 'All') return sorted;
    const statuses = TAB_STATUSES[tab];
    return sorted.filter((d) => statuses.includes(d.status));
  }, [dispatches, tab]);

  const counts = useMemo(
    () => ({
      pending: dispatches.filter((d) => d.status === 'pending').length,
      active: dispatches.filter((d) => d.status === 'accepted' || d.status === 'in-progress').length,
      completed: dispatches.filter((d) => d.status === 'completed').length,
    }),
    [dispatches]
  );

  const earned = useMemo(
    () =>
      dispatches
        .filter((d) => d.status === 'completed')
        .reduce((sum, d) => sum + d.priceDZD, 0) +
      serviceRequests
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + r.totalDZD, 0),
    [dispatches, serviceRequests]
  );

  const pipelineValue = useMemo(
    () =>
      dispatches
        .filter((d) => d.status === 'pending' || d.status === 'accepted' || d.status === 'in-progress')
        .reduce((sum, d) => sum + d.priceDZD, 0),
    [dispatches]
  );

  const handleAccept = (id: string, title: string) => {
    acceptDispatch(id);
    hapticSuccess();
    showToast(`Accepted — ${title}`, 'success');
  };

  const handleStart = (id: string, title: string) => {
    updateDispatch(id, { status: 'in-progress' });
    hapticLight();
    showToast(`Started — ${title}`, 'info');
  };

  const handleComplete = (id: string, title: string) => {
    completeDispatch(id);
    hapticSuccess();
    showToast(`Completed — ${title}`, 'success');
  };

  const handleDecline = (id: string, title: string) => {
    hapticLight();
    Alert.alert('Decline job', `Decline “${title}”? It will be offered to another partner.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () => {
          declineDispatch(id);
          showToast('Job declined', 'info');
        },
      },
    ]);
  };

  return (
    <ProScreenChrome role="partner" title="My Tasks" subtitle="Pending & completed jobs">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {dispatches.length === 0 ? (
          <EmptyBlock
            icon="checkbox-outline"
            title="No jobs yet"
            subtitle="Jobs dispatched to you appear here. Go online from your dashboard so travellers and businesses can reach you."
            color={ACCENT}
          />
        ) : (
          <>
            <HeroStat
              label="Open pipeline"
              value={formatDZD(pipelineValue)}
              caption={`${counts.pending + counts.active} job${counts.pending + counts.active === 1 ? '' : 's'} not yet completed · ${formatDZD(earned)} earned all time`}
              color={ACCENT}
              icon="briefcase-outline"
            />

            <StatGrid>
              <StatCard icon="hourglass-outline" label="Pending" value={String(counts.pending)} color={PRO.amber} />
              <StatCard icon="navigate-outline" label="In progress" value={String(counts.active)} color={PRO.violet} />
              <StatCard icon="checkmark-done-outline" label="Completed" value={String(counts.completed)} color={PRO.green} />
              <StatCard icon="cash-outline" label="Earned" value={formatDZD(earned)} color={ACCENT} />
            </StatGrid>

            <Segmented options={TABS} value={tab} onChange={setTab} color={ACCENT} />

            <SectionTitle>{`${visible.length} job${visible.length === 1 ? '' : 's'}`}</SectionTitle>

            {visible.length === 0 ? (
              <Panel>
                <Text style={styles.note}>Nothing in this state right now.</Text>
              </Panel>
            ) : (
              <View style={styles.rows}>
                {visible.map((job) => {
                  const meta = STATUS_META[job.status];
                  return (
                    <View key={job.id} style={[styles.jobCard, { borderLeftWidth: 3, borderLeftColor: meta.color }]}>
                      <View style={styles.jobHead}>
                        <View style={[styles.jobIcon, { backgroundColor: meta.color + '15' }]}>
                          <Ionicons name={meta.icon} size={18} color={meta.color} />
                        </View>
                        <View style={styles.jobBody}>
                          <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                          <Text style={styles.jobMeta} numberOfLines={1}>
                            {job.customerName} · {job.jobType.replace(/-/g, ' ')}
                          </Text>
                        </View>
                        <StatusPill label={meta.label} color={meta.color} />
                      </View>

                      {job.description ? <Text style={styles.jobDesc}>{job.description}</Text> : null}

                      <View style={styles.jobFacts}>
                        <View style={styles.fact}>
                          <Ionicons name="location-outline" size={13} color={PRO.subtle} />
                          <Text style={styles.factText} numberOfLines={1}>{job.location}</Text>
                        </View>
                        {job.destination ? (
                          <View style={styles.fact}>
                            <Ionicons name="flag-outline" size={13} color={PRO.subtle} />
                            <Text style={styles.factText} numberOfLines={1}>{job.destination}</Text>
                          </View>
                        ) : null}
                        <View style={styles.fact}>
                          <Ionicons name="time-outline" size={13} color={PRO.subtle} />
                          <Text style={styles.factText}>{formatWhen(job.scheduledTime)}</Text>
                        </View>
                      </View>

                      <View style={styles.jobFoot}>
                        <Text style={styles.jobPrice}>{formatDZD(job.priceDZD)}</Text>
                        <View style={styles.jobActions}>
                          {job.status === 'pending' && (
                            <>
                              <Pressable
                                style={styles.declineBtn}
                                onPress={() => handleDecline(job.id, job.title)}
                              >
                                <Text style={styles.declineText}>Decline</Text>
                              </Pressable>
                              <Pressable
                                style={[styles.actionBtn, { backgroundColor: ACCENT }]}
                                onPress={() => handleAccept(job.id, job.title)}
                              >
                                <Text style={styles.actionText}>Accept</Text>
                              </Pressable>
                            </>
                          )}
                          {job.status === 'accepted' && (
                            <Pressable
                              style={[styles.actionBtn, { backgroundColor: PRO.violet }]}
                              onPress={() => handleStart(job.id, job.title)}
                            >
                              <Text style={styles.actionText}>Start job</Text>
                            </Pressable>
                          )}
                          {job.status === 'in-progress' && (
                            <Pressable
                              style={[styles.actionBtn, { backgroundColor: PRO.green }]}
                              onPress={() => handleComplete(job.id, job.title)}
                            >
                              <Text style={styles.actionText}>Mark complete</Text>
                            </Pressable>
                          )}
                          {job.customerPhone && job.status !== 'completed' ? (
                            <Pressable
                              style={styles.callBtn}
                              onPress={() => { hapticLight(); showToast(`Calling ${job.customerName}`, 'info'); }}
                            >
                              <Ionicons name="call-outline" size={15} color={PRO.text} />
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  rows: { gap: 10 },

  jobCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
    gap: 10,
  },
  jobHead: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  jobIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  jobBody: { flex: 1, gap: 2 },
  jobTitle: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  jobMeta: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, textTransform: 'capitalize' },
  jobDesc: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },

  jobFacts: { gap: 5 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  factText: { flex: 1, fontSize: 12, fontFamily: 'mon', color: PRO.muted },

  jobFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: PRO.borderSoft,
  },
  jobPrice: { fontSize: 16, fontFamily: 'mon-b', color: PRO.text },
  jobActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11 },
  actionText: { fontSize: 12, fontFamily: 'mon-b', color: '#FFFFFF' },
  declineBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 11, backgroundColor: PRO.sunken },
  declineText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PRO.border,
  },
});
