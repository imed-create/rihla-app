import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ProTabShell from '@/components/dashboard/TabShell';
import { useTheme } from '@/context/ThemeContext';
import { RIHLA } from '@/constants/theme';
import { usePartnerDispatches, type PartnerDispatch } from '@/store/usePartnerDispatches';
import { showToast } from '@/components/Toast';

export default function LiveDispatch() {
  const { colors } = useTheme();
  const {
    dispatches,
    addDispatch,
    acceptDispatch,
    declineDispatch,
    completeDispatch,
  } = usePartnerDispatches();

  // Seed demo dispatches if none exist so the page has interactive content
  useEffect(() => {
    if (dispatches.length === 0) {
      addDispatch({
        jobType: 'transfer',
        title: 'Airport Transfer to Casbah',
        customerName: 'Yacine Benali',
        customerPhone: '+213 551 23 45 67',
        location: 'Houari Boumediene Airport (ALG)',
        destination: 'Algiers Casbah Citadel',
        scheduledTime: 'Annaba Coastal Route',
        priceDZD: 3000,
        status: 'pending',
        metadata: { vehicleType: 'berline' },
      });
      addDispatch({
        jobType: 'expedition',
        title: 'Sahara Camel Trek Guide',
        customerName: 'Sophie Lardjane',
        customerPhone: '+213 662 98 76 54',
        location: 'Djanet Desert Camp',
        destination: 'Tassili n\'Ajjer Canyons',
        scheduledTime: 'Tomorrow, 06:00',
        priceDZD: 7500,
        status: 'pending',
        metadata: { guides: 1, camels: 2 },
      });
    }
  }, [dispatches]);

  const handleAccept = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    acceptDispatch(id);
    showToast('Job dispatch accepted!', 'success');
  };

  const handleDecline = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    declineDispatch(id);
    showToast('Job dispatch declined.', 'info');
  };

  const handleComplete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeDispatch(id);
    showToast('Job dispatch completed! Payout added.', 'success');
  };

  const pendingJobs = useMemo(() => dispatches.filter((d) => d.status === 'pending'), [dispatches]);
  const activeJobs = useMemo(() => dispatches.filter((d) => d.status === 'accepted' || d.status === 'in-progress'), [dispatches]);
  const historyJobs = useMemo(() => dispatches.filter((d) => d.status === 'completed' || d.status === 'declined' || d.status === 'cancelled'), [dispatches]);

  const renderJobCard = ({ item }: { item: PartnerDispatch }) => {
    const isPending = item.status === 'pending';
    const isActive = item.status === 'accepted' || item.status === 'in-progress';
    const isCompleted = item.status === 'completed';

    const typeIconMap: Record<string, string> = {
      transfer: 'car-sport-outline',
      expedition: 'compass-outline',
      beach: 'umbrella-outline',
      delivery: 'bicycle-outline',
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: RIHLA.accent + '15' }]}>
            <Ionicons name={(typeIconMap[item.jobType] || 'briefcase-outline') as any} size={20} color={RIHLA.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.customerText, { color: colors.muted }]}>
              {item.customerName} · {item.scheduledTime}
            </Text>
          </View>
          <View style={[styles.statusBadge, isPending ? styles.statusPending : isActive ? styles.statusActive : styles.statusDone]}>
            <Text style={[styles.statusText, isPending ? styles.statusTextPending : isActive ? styles.statusTextActive : styles.statusTextDone]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={[styles.cardBody, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="pin-outline" size={14} color={colors.muted} />
            <Text style={[styles.infoVal, { color: colors.text }]} numberOfLines={1}>From: {item.location}</Text>
          </View>
          {item.destination && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={colors.muted} />
              <Text style={[styles.infoVal, { color: colors.text }]} numberOfLines={1}>To: {item.destination}</Text>
            </View>
          )}
          {item.customerPhone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color={colors.muted} />
              <Text style={[styles.infoVal, { color: colors.text }]}>{item.customerPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.priceText, { color: RIHLA.primary }]}>{item.priceDZD.toLocaleString()} DA</Text>
          <View style={styles.actions}>
            {isPending && (
              <>
                <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item.id)}>
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </>
            )}
            {isActive && (
              <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item.id)}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
                <Text style={styles.completeBtnText}>Mark Completed</Text>
              </TouchableOpacity>
            )}
            {isCompleted && (
              <View style={styles.completedTick}>
                <Ionicons name="checkmark-done-circle" size={18} color="#10B981" />
                <Text style={styles.completedTickText}>Paid Out</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <ProTabShell role="partner" title="Live Dispatch" subtitle="Accept / decline incoming traveler jobs">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pending Section */}
        {pendingJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Incoming Offers ({pendingJobs.length})</Text>
            <FlatList
              data={pendingJobs}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderJobCard}
            />
          </View>
        )}

        {/* Active Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Assignments ({activeJobs.length})</Text>
          {activeJobs.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="map-outline" size={28} color={colors.muted} />
              <Text style={[styles.emptyCardText, { color: colors.muted }]}>No active jobs today. Set status to Online.</Text>
            </View>
          ) : (
            <FlatList
              data={activeJobs}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderJobCard}
            />
          )}
        </View>

        {/* History Section */}
        {historyJobs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent History</Text>
            <FlatList
              data={historyJobs.slice(0, 5)}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={renderJobCard}
            />
          </View>
        )}
      </ScrollView>
    </ProTabShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },
  emptyCard: { borderWidth: 1, padding: 24, borderRadius: 16, alignItems: 'center', gap: 8, justifyContent: 'center' },
  emptyCardText: { fontSize: 13, fontFamily: 'mon', textAlign: 'center' },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  jobTitle: { fontSize: 14, fontFamily: 'mon-b' },
  customerText: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusActive: { backgroundColor: '#DBEAFE' },
  statusDone: { backgroundColor: '#E2E8F0' },
  statusText: { fontSize: 9, fontFamily: 'mon-b', textTransform: 'uppercase' },
  statusTextPending: { color: '#D97706' },
  statusTextActive: { color: '#2563EB' },
  statusTextDone: { color: '#64748B' },
  cardBody: { borderTopWidth: 0.5, borderBottomWidth: 0.5, paddingVertical: 10, gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoVal: { fontSize: 12, fontFamily: 'mon-sb' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 16, fontFamily: 'mon-b' },
  actions: { flexDirection: 'row', gap: 8 },
  declineBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444' },
  declineBtnText: { color: '#EF4444', fontSize: 12, fontFamily: 'mon-sb' },
  acceptBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: RIHLA.accent },
  acceptBtnText: { color: '#FFF', fontSize: 12, fontFamily: 'mon-b' },
  completeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', gap: 4 },
  completeBtnText: { color: '#FFF', fontSize: 12, fontFamily: 'mon-b' },
  completedTick: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedTickText: { color: '#10B981', fontSize: 11, fontFamily: 'mon-b' },
});
