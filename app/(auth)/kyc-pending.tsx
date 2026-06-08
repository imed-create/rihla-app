/**
 * RIHLA — KYC Pending Screen (Real Verification Engine)
 * ───────────────────────────────────────────────────────
 * Shows document-level verification progress with per-doc status.
 * Includes simulated admin approval/rejection for demo purposes.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import type { DocStatus } from '@/types/app';
import * as Haptics from 'expo-haptics';

const DOC_LABELS: Record<string, string> = {
  nationalIdDoc: 'National ID',
  commercialRegDoc: 'Commercial Register',
  taxInfoDoc: 'Tax Information',
};

const DOC_ICONS: Record<string, string> = {
  nationalIdDoc: 'id-card-outline',
  commercialRegDoc: 'document-text-outline',
  taxInfoDoc: 'receipt-outline',
};

export default function KycPendingScreen() {
  const insets = useSafeAreaInsets();
  const { user, simulateKycApproval, rejectKyc, resubmitKyc } = useApp();
  const [adminModal, setAdminModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Navigate on approval
  useEffect(() => {
    if (user.kycStatus === 'approved') {
      const timer = setTimeout(() => {
        if (user.role === 'business') router.replace('/(business)' as any);
        else if (user.role === 'partner') router.replace('/(partner)' as any);
        else router.replace('/(tabs)');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user.kycStatus, user.role]);

  const docs = ['nationalIdDoc', 'commercialRegDoc', 'taxInfoDoc'] as const;
  const allApproved = docs.every(d => user.kycData[d]?.status === 'approved');
  const anyRejected = docs.some(d => user.kycData[d]?.status === 'rejected');
  const pendingCount = docs.filter(d => user.kycData[d]?.status === 'pending').length;

  const ROLE_META = {
    traveler: { color: '#00a896', icon: 'compass-outline', label: 'Traveler', bgColor: '#F0F9FF' },
    business: { color: '#0a2540', icon: 'storefront-outline', label: 'Business Owner', bgColor: '#F5F3FF' },
    partner: { color: '#f4a261', icon: 'flash-outline', label: 'Service Partner', bgColor: '#ECFDF5' },
  };

  const meta = ROLE_META[user.role ?? 'traveler'];

  const handleAdminApprove = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await simulateKycApproval();
    setAdminModal(false);
  };

  const handleAdminReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Reason required', 'Please enter a reason for rejection.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    await rejectKyc(rejectReason.trim());
    setAdminModal(false);
    setRejectReason('');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user.kycStatus === 'rejected' ? 'Application Reverted' : 'Application Submitted'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeIn }]}>
          {/* Big icon */}
          <Animated.View style={[styles.iconRing, { borderColor: meta.color + '30', transform: [{ scale: pulse }] }]}>
            <View style={[styles.iconCircle, { backgroundColor: meta.bgColor }]}>
              <Ionicons
                name={user.kycStatus === 'rejected' ? 'close-circle-outline' : meta.icon as any}
                size={44}
                color={user.kycStatus === 'rejected' ? '#EF4444' : meta.color}
              />
            </View>
          </Animated.View>

          {/* Status */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>
              {user.kycStatus === 'approved' ? '✅ Approved!' :
               user.kycStatus === 'rejected' ? '❌ Documents Rejected' :
               `⏳ ${pendingCount} of 3 Documents Pending`}
            </Text>
            <Text style={styles.subtitle}>
              {user.kycStatus === 'approved'
                ? `Welcome to RIHLA as a ${meta.label}! Setting up your dashboard...`
                : user.kycStatus === 'rejected'
                  ? user.kycRejectionReason || 'Some documents need to be resubmitted. Please upload clearer versions.'
                  : 'Your documents are being reviewed. Each document is checked individually for compliance.'}
            </Text>
          </View>

          {/* Document status cards */}
          <View style={styles.docsCard}>
            <Text style={styles.docsCardTitle}>Document Verification Status</Text>
            {docs.map((docKey) => {
              const doc = user.kycData[docKey];
              const status: DocStatus = doc?.status ?? 'pending';
              const isRejected = status === 'rejected';
              const isApproved = status === 'approved';

              return (
                <View key={docKey} style={styles.docRow}>
                  <View style={[styles.docIcon, {
                    backgroundColor: isApproved ? '#F0FDF4' : isRejected ? '#FEF2F2' : '#F1F5F9',
                  }]}>
                    <Ionicons
                      name={DOC_ICONS[docKey] as any}
                      size={18}
                      color={isApproved ? '#10B981' : isRejected ? '#EF4444' : '#94A3B8'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName}>{DOC_LABELS[docKey]}</Text>
                    {isRejected && doc?.rejectedReason && (
                      <Text style={styles.docReason}>Reason: {doc.rejectedReason}</Text>
                    )}
                  </View>
                  <View style={[styles.docBadge, {
                    backgroundColor: isApproved ? '#F0FDF4' : isRejected ? '#FEF2F2' : '#F1F5F9',
                  }]}>
                    <Text style={[styles.docBadgeText, {
                      color: isApproved ? '#059669' : isRejected ? '#DC2626' : '#94A3B8',
                    }]}>
                      {isApproved ? '✓ Verified' : isRejected ? '✕ Rejected' : '⏳ Pending'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Progress card */}
          <View style={styles.stepsCard}>
            <Text style={styles.stepsCardTitle}>Application Progress</Text>
            <Step done label="Documents uploaded" color={meta.color} />
            <View style={[styles.stepConnector, { backgroundColor: allApproved ? meta.color : '#E2E8F0' }]} />
            <Step done={allApproved} loading={!allApproved && !anyRejected} label="Document verification" color={meta.color} />
            <View style={[styles.stepConnector, { backgroundColor: user.kycStatus === 'approved' ? meta.color : '#E2E8F0' }]} />
            <Step done={user.kycStatus === 'approved'} label="Account activated" color={meta.color} />
          </View>

          {/* Action buttons */}
          {user.kycStatus === 'rejected' ? (
            <Pressable
              style={styles.resubmitBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back();
              }}
            >
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.resubmitText}>Resubmit Documents</Text>
            </Pressable>
          ) : user.kycStatus !== 'approved' ? (
            <View style={styles.pendingInfo}>
              <Ionicons name="time-outline" size={18} color={meta.color} />
              <Text style={[styles.pendingInfoText, { color: meta.color }]}>
                Verification typically takes 24-48 hours. You'll be notified once approved.
              </Text>
            </View>
          ) : null}

          {/* Admin controls (for demo) */}
          {user.kycStatus !== 'approved' && user.kycStatus !== 'rejected' && (
            <Pressable
              style={styles.adminToggle}
              onPress={() => setAdminModal(true)}
            >
              <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
              <Text style={styles.adminToggleText}>Admin Review Panel (Demo)</Text>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Admin Review Modal ── */}
      <Modal visible={adminModal} transparent animationType="slide" onRequestClose={() => setAdminModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <Text style={styles.modalTitle}>📋 Admin Review Panel</Text>
            <Text style={styles.modalSubtitle}>Simulate document review (demo mode)</Text>

            {/* Document review actions */}
            {docs.map((docKey) => {
              const doc = user.kycData[docKey];
              const hasDoc = !!doc?.uri;
              return (
                <View key={docKey} style={styles.modalDocRow}>
                  <Ionicons name={DOC_ICONS[docKey] as any} size={18} color="#6B7280" />
                  <Text style={styles.modalDocName}>{DOC_LABELS[docKey]}</Text>
                  <View style={[styles.modalDocStatus, {
                    backgroundColor: hasDoc ? '#F0FDF4' : '#FEF2F2',
                  }]}>
                    <Text style={[styles.modalDocStatusText, {
                      color: hasDoc ? '#059669' : '#DC2626',
                    }]}>{hasDoc ? 'Uploaded ✓' : 'Missing ✕'}</Text>
                  </View>
                </View>
              );
            })}

            {/* Approve button */}
            <Pressable style={styles.approveBtn} onPress={handleAdminApprove}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.approveText}>Approve All Documents</Text>
            </Pressable>

            {/* Reject reason */}
            <Text style={styles.rejectLabel}>Reject with reason (optional):</Text>
            <TextInput
              style={styles.rejectInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="e.g. ID document is unclear, please resubmit"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
            />
            <Pressable style={styles.rejectBtn} onPress={handleAdminReject}>
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.rejectText}>Reject Application</Text>
            </Pressable>

            <Pressable style={styles.modalCancel} onPress={() => setAdminModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Step({ done, loading, label, color }: { done: boolean; loading?: boolean; label: string; color: string }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true })
      ).start();
    }
  }, [loading]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, done && { backgroundColor: color, borderColor: color }]}>
        {done
          ? <Ionicons name="checkmark" size={12} color="#fff" />
          : loading
            ? <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="refresh-outline" size={12} color={color} />
              </Animated.View>
            : null}
      </View>
      <Text style={[styles.stepLabel, done && { color, fontFamily: 'mon-sb' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0', alignItems: 'center' },
  headerTitle: { fontFamily: 'mon-sb', fontSize: 16, color: '#000000' },

  scroll: { flexGrow: 1 },
  content: { alignItems: 'center', paddingHorizontal: 28, gap: 24, paddingTop: 32, paddingBottom: 40 },

  iconRing: { width: 128, height: 128, borderRadius: 64, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },

  textBlock: { alignItems: 'center', gap: 8 },
  title: { fontSize: 26, fontFamily: 'mon-b', color: '#000000', textAlign: 'center', letterSpacing: -0.4 },
  subtitle: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },

  // Document status cards
  docsCard: { width: '100%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10 },
  docsCardTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 4 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  docIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 13, fontFamily: 'mon-sb', color: '#1F2937' },
  docReason: { fontSize: 11, fontFamily: 'mon', color: '#EF4444', marginTop: 2 },
  docBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  docBadgeText: { fontSize: 10, fontFamily: 'mon-b' },

  // Steps card
  stepsCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', gap: 0 },
  stepsCardTitle: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  stepConnector: { width: 2, height: 16, marginLeft: 11, borderRadius: 1 },
  stepLabel: { fontSize: 14, fontFamily: 'mon', color: '#94A3B8' },

  // Pending info
  pendingInfo: { flexDirection: 'row', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, width: '100%', borderWidth: 1, borderColor: '#E2E8F0' },
  pendingInfoText: { flex: 1, fontSize: 13, fontFamily: 'mon', lineHeight: 18 },

  // Resubmit
  resubmitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#0a2540', paddingVertical: 14, borderRadius: 14, width: '100%' },
  resubmitText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },

  // Admin toggle
  adminToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  adminToggleText: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },

  // Admin modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(10,37,64,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, gap: 14 },
  modalKnob: { width: 44, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontFamily: 'mon-b', color: '#111827' },
  modalSubtitle: { fontSize: 13, fontFamily: 'mon', color: '#6B7280', marginTop: -8 },
  modalDocRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  modalDocName: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: '#1F2937' },
  modalDocStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalDocStatusText: { fontSize: 11, fontFamily: 'mon-b' },

  approveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#10B981', height: 48, borderRadius: 12 },
  approveText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },

  rejectLabel: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280', marginTop: 4 },
  rejectInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 13, fontFamily: 'mon', minHeight: 60, textAlignVertical: 'top' },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#EF4444', height: 48, borderRadius: 12 },
  rejectText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  modalCancel: { height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontFamily: 'mon-sb', color: '#4B5563' },
});
