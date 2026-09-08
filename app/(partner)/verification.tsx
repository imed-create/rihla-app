/**
 * RIHLA — Partner Verification
 * ────────────────────────────
 * Real KYC document upload for partners. Each document is picked with
 * ImagePicker and written into the user's kycData through AppContext,
 * with per-document status shown from the stored KycDocument records.
 */

import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  type IonName,
  Panel,
  PRO,
  PrimaryButton,
  ProgressBar,
  SectionTitle,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import type { DocStatus, KycData, KycDocument, KycStatus } from '@/types/app';

const ACCENT = '#f4a261';

type DocKey = 'nationalIdDoc' | 'commercialRegDoc' | 'taxInfoDoc';

type DocSpec = {
  key: DocKey;
  label: string;
  description: string;
  icon: IonName;
  required: boolean;
};

const DOCS: DocSpec[] = [
  {
    key: 'nationalIdDoc',
    label: 'National ID card',
    description: 'Front side, all four corners visible and readable.',
    icon: 'card-outline',
    required: true,
  },
  {
    key: 'commercialRegDoc',
    label: 'Commercial register',
    description: 'Your registre de commerce. Required to invoice above 100,000 DZD.',
    icon: 'document-text-outline',
    required: false,
  },
  {
    key: 'taxInfoDoc',
    label: 'Tax identification',
    description: 'NIF or article d\'imposition issued by the tax office.',
    icon: 'receipt-outline',
    required: false,
  },
];

const DOC_STATUS_META: Record<DocStatus, { label: string; color: string }> = {
  pending: { label: 'In review', color: PRO.amber },
  approved: { label: 'Approved', color: PRO.green },
  rejected: { label: 'Rejected', color: PRO.red },
};

const KYC_META: Record<KycStatus, { label: string; color: string; icon: IonName; headline: string; body: string }> = {
  none: {
    label: 'Not started',
    color: PRO.subtle,
    icon: 'alert-circle-outline',
    headline: 'Verify your identity',
    body: 'Verified partners get the trust badge, rank higher in dispatch and can receive payouts.',
  },
  submitted: {
    label: 'In review',
    color: PRO.amber,
    icon: 'time-outline',
    headline: 'Documents under review',
    body: 'Our team is checking your documents. This normally takes 24–48 hours — no action needed from you.',
  },
  approved: {
    label: 'Verified',
    color: PRO.green,
    icon: 'shield-checkmark-outline',
    headline: 'You are verified',
    body: 'Your trust badge is live on every service you publish, and payouts are unlocked.',
  },
  rejected: {
    label: 'Action needed',
    color: PRO.red,
    icon: 'close-circle-outline',
    headline: 'Something needs fixing',
    body: 'One or more documents were rejected. Re-upload them below and review starts again immediately.',
  },
};

export default function PartnerVerification() {
  const { user, updateUser, submitKyc } = useApp();
  const kyc = user.kycData ?? {};
  const [busyKey, setBusyKey] = useState<DocKey | null>(null);

  const meta = KYC_META[user.kycStatus] ?? KYC_META.none;

  const uploaded = useMemo(
    () => DOCS.filter((d) => Boolean((kyc[d.key] as KycDocument | undefined)?.uri)).length,
    [kyc]
  );
  const requiredDone = DOCS.filter((d) => d.required).every(
    (d) => Boolean((kyc[d.key] as KycDocument | undefined)?.uri)
  );
  const progress = (uploaded / DOCS.length) * 100;

  const pickDocument = async (spec: DocSpec) => {
    hapticLight();
    setBusyKey(spec.key);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast('Photo library permission is required', 'error');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (result.canceled || result.assets.length === 0) return;

      const document: KycDocument = { uri: result.assets[0].uri, status: 'pending' };
      const nextKyc: KycData = { ...kyc, [spec.key]: document };
      updateUser({ kycData: nextKyc });
      hapticSuccess();
      showToast(`${spec.label} uploaded`, 'success');
    } finally {
      setBusyKey(null);
    }
  };

  const handleSubmit = async () => {
    if (!requiredDone) {
      showToast('Upload your national ID before submitting', 'error');
      return;
    }
    await submitKyc(kyc);
    hapticSuccess();
    showToast('Documents submitted for review', 'success');
  };

  return (
    <ProScreenChrome role="partner" title="Verification" subtitle="KYC & document uploads">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Status ── */}
        <Panel accent={meta.color}>
          <View style={styles.statusHead}>
            <View style={[styles.statusIcon, { backgroundColor: meta.color + '15' }]}>
              <Ionicons name={meta.icon} size={24} color={meta.color} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.statusTitle}>{meta.headline}</Text>
              <Text style={styles.note}>{meta.body}</Text>
            </View>
          </View>
          <View style={styles.statusFoot}>
            <StatusPill label={meta.label} color={meta.color} />
            <Text style={styles.progressText}>{uploaded} of {DOCS.length} documents</Text>
          </View>
          <ProgressBar pct={progress} color={meta.color} height={6} />
          {user.kycStatus === 'rejected' && user.kycRejectionReason ? (
            <View style={styles.rejectBox}>
              <Ionicons name="information-circle-outline" size={15} color={PRO.red} />
              <Text style={[styles.note, { color: PRO.red }]}>{user.kycRejectionReason}</Text>
            </View>
          ) : null}
        </Panel>

        {/* ── Documents ── */}
        <SectionTitle>Documents</SectionTitle>
        <View style={styles.rows}>
          {DOCS.map((spec) => {
            const document = kyc[spec.key] as KycDocument | undefined;
            const uploadedDoc = Boolean(document?.uri);
            const docMeta = document ? DOC_STATUS_META[document.status] : null;
            const busy = busyKey === spec.key;
            return (
              <Pressable
                key={spec.key}
                style={[styles.docCard, uploadedDoc && { borderColor: (docMeta?.color ?? ACCENT) + '45' }]}
                onPress={() => void pickDocument(spec)}
                disabled={busy}
              >
                {uploadedDoc && document ? (
                  <Image source={{ uri: document.uri }} style={styles.docThumb} resizeMode="cover" />
                ) : (
                  <View style={[styles.docIcon, { backgroundColor: ACCENT + '15' }]}>
                    <Ionicons name={spec.icon} size={20} color={ACCENT} />
                  </View>
                )}
                <View style={styles.docBody}>
                  <View style={styles.docHead}>
                    <Text style={styles.docLabel}>{spec.label}</Text>
                    {spec.required ? <Text style={styles.requiredMark}>Required</Text> : null}
                  </View>
                  <Text style={styles.note}>
                    {document?.status === 'rejected' && document.rejectedReason
                      ? document.rejectedReason
                      : spec.description}
                  </Text>
                </View>
                <View style={styles.docAction}>
                  {docMeta ? (
                    <StatusPill label={docMeta.label} color={docMeta.color} />
                  ) : (
                    <View style={[styles.uploadBtn, { backgroundColor: ACCENT }]}>
                      <Ionicons name={busy ? 'hourglass-outline' : 'cloud-upload-outline'} size={15} color="#FFFFFF" />
                    </View>
                  )}
                  {uploadedDoc ? <Text style={styles.replaceHint}>Tap to replace</Text> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── Submit ── */}
        {user.kycStatus !== 'approved' && (
          <PrimaryButton
            label={user.kycStatus === 'submitted' ? 'Resubmit documents' : 'Submit for review'}
            icon="shield-checkmark-outline"
            color={ACCENT}
            disabled={!requiredDone}
            onPress={() => void handleSubmit()}
          />
        )}

        {/* ── Guidance ── */}
        <Panel title="What gets a document rejected">
          <Guidance text="Blurry photos or glare covering the text." />
          <Guidance text="Cropped edges — all four corners must be visible." />
          <Guidance text="A screenshot of another screen instead of the document itself." />
          <Guidance text="An expired commercial register." />
          <Guidance text="A name that does not match the name on your RIHLA account." />
        </Panel>

        <View style={styles.footerNote}>
          <Ionicons name="lock-closed-outline" size={14} color={PRO.subtle} />
          <Text style={styles.note}>
            Documents are used only to verify your identity and are never shown to travellers.
          </Text>
        </View>
      </ScrollView>
    </ProScreenChrome>
  );
}

function Guidance({ text }: { text: string }) {
  return (
    <View style={styles.guidanceRow}>
      <Ionicons name="close-circle" size={14} color={PRO.red} />
      <Text style={styles.guidanceText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  flex: { flex: 1 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 17, flex: 1 },
  rows: { gap: 10 },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 },

  statusHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  statusIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontSize: 15, fontFamily: 'mon-b', color: PRO.text, marginBottom: 3 },
  statusFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  progressText: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.muted },
  rejectBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 4,
  },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  docIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  docThumb: { width: 46, height: 46, borderRadius: 15, borderWidth: 1, borderColor: PRO.border },
  docBody: { flex: 1, gap: 3 },
  docHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docLabel: { fontSize: 13, fontFamily: 'mon-b', color: PRO.text },
  requiredMark: { fontSize: 10, fontFamily: 'mon-b', color: PRO.red },
  docAction: { alignItems: 'flex-end', gap: 5 },
  uploadBtn: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  replaceHint: { fontSize: 10, fontFamily: 'mon', color: PRO.subtle },

  guidanceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 4 },
  guidanceText: { flex: 1, fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
});
