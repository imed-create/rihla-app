/**
 * RIHLA — Payout Settings
 * ───────────────────────
 * Manage where partner earnings are sent. Real CRUD on usePayoutMethods,
 * covering the rails used in Algeria (CCP, bank RIB, BaridiMob, cash).
 */

import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  Field,
  GhostButton,
  type IonName,
  MetricRow,
  Panel,
  PRO,
  PrimaryButton,
  SectionTitle,
  Segmented,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { partnerEarningsDzd } from '@/lib/dashboardStats';
import { type PayoutFrequency, type PayoutKind, usePayoutMethods } from '@/store/usePayoutMethods';

const ACCENT = '#f4a261';

const KINDS: { key: PayoutKind; label: string; icon: IonName; hint: string; placeholder: string }[] = [
  { key: 'ccp', label: 'Algérie Poste CCP', icon: 'mail-outline', hint: 'Most common — free transfers', placeholder: '0012345678 key 45' },
  { key: 'rib', label: 'Bank RIB', icon: 'card-outline', hint: '20-digit bank account', placeholder: '00300123456789012345' },
  { key: 'baridimob', label: 'BaridiMob', icon: 'phone-portrait-outline', hint: 'Instant, linked to your CCP', placeholder: '0555 00 00 00' },
  { key: 'cash', label: 'Cash pickup', icon: 'cash-outline', hint: 'Collect at a RIHLA partner office', placeholder: 'Pickup city' },
];

const FREQUENCIES = ['weekly', 'biweekly', 'monthly'] as const;

const FREQUENCY_LABEL: Record<PayoutFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
};

const FREQUENCY_NOTE: Record<PayoutFrequency, string> = {
  weekly: 'Paid every Sunday. A 200 DZD transfer fee applies to weekly payouts.',
  biweekly: 'Paid on the 1st and 15th of each month. No transfer fee.',
  monthly: 'Paid on the last working day of the month. No transfer fee.',
};

const MIN_PAYOUT = 3000;

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

/** Show only the last 4 characters of an account number. */
function maskAccount(account: string): string {
  const trimmed = account.replace(/\s+/g, '');
  if (trimmed.length <= 4) return trimmed;
  return `•••• ${trimmed.slice(-4)}`;
}

export default function PartnerPayouts() {
  const { serviceRequests } = useApp();
  const { methods, frequency, addMethod, removeMethod, setDefault, setFrequency } = usePayoutMethods();
  const [formOpen, setFormOpen] = useState(false);
  const [kind, setKind] = useState<PayoutKind>('ccp');
  const [holder, setHolder] = useState('');
  const [account, setAccount] = useState('');

  const earned = partnerEarningsDzd(serviceRequests);
  const available = earned * 0.6;
  const canWithdraw = available >= MIN_PAYOUT && methods.length > 0;

  const defaultMethod = useMemo(() => methods.find((m) => m.isDefault), [methods]);
  const activeKind = KINDS.find((k) => k.key === kind) ?? KINDS[0];

  const resetForm = () => {
    setKind('ccp');
    setHolder('');
    setAccount('');
  };

  const handleAdd = () => {
    if (!holder.trim()) {
      showToast('Account holder name is required', 'error');
      return;
    }
    if (!account.trim()) {
      showToast(`Enter your ${activeKind.label} details`, 'error');
      return;
    }
    addMethod({ kind, holder: holder.trim(), account: account.trim() });
    hapticSuccess();
    showToast(`${activeKind.label} added — verification takes 1–2 days`, 'success');
    resetForm();
    setFormOpen(false);
  };

  const confirmRemove = (id: string, label: string) => {
    hapticLight();
    Alert.alert('Remove payout method', `Remove ${label}? Earnings will go to your remaining default method.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeMethod(id);
          showToast('Payout method removed', 'success');
        },
      },
    ]);
  };

  const handleWithdraw = () => {
    if (methods.length === 0) {
      showToast('Add a payout method first', 'info');
      return;
    }
    if (available < MIN_PAYOUT) {
      showToast(`Minimum payout is ${formatDZD(MIN_PAYOUT)}`, 'info');
      return;
    }
    showToast(`${formatDZD(available)} requested to ${defaultMethod ? maskAccount(defaultMethod.account) : 'your account'}`, 'success');
  };

  return (
    <ProScreenChrome
      role="partner"
      title="Payout Settings"
      subtitle="Bank account & payment methods"
      headerRight={
        <Pressable style={[styles.addBtn, { backgroundColor: ACCENT }]} onPress={() => { hapticLight(); setFormOpen(true); }}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Balance ── */}
        <Panel accent={ACCENT}>
          <Text style={styles.balanceLabel}>AVAILABLE TO WITHDRAW</Text>
          <Text style={styles.balanceValue}>{formatDZD(available)}</Text>
          <Text style={styles.note}>
            {formatDZD(earned)} earned all time · minimum payout {formatDZD(MIN_PAYOUT)}
          </Text>
          <PrimaryButton
            label={canWithdraw ? 'Withdraw now' : methods.length === 0 ? 'Add a payout method' : 'Below minimum'}
            icon="arrow-down-circle-outline"
            color={ACCENT}
            disabled={!canWithdraw && methods.length > 0}
            onPress={methods.length === 0 ? () => setFormOpen(true) : handleWithdraw}
          />
        </Panel>

        {/* ── Methods ── */}
        <SectionTitle>Payout methods</SectionTitle>
        {methods.length === 0 ? (
          <EmptyBlock
            icon="wallet-outline"
            title="No payout method"
            subtitle="Add where you want your earnings sent. Most partners use their Algérie Poste CCP — transfers are free and arrive in 3–5 days."
            actionLabel="Add payout method"
            color={ACCENT}
            onAction={() => setFormOpen(true)}
          />
        ) : (
          <View style={styles.rows}>
            {methods.map((m) => {
              const def = KINDS.find((k) => k.key === m.kind);
              return (
                <View key={m.id} style={[styles.methodCard, m.isDefault && { borderColor: ACCENT + '55' }]}>
                  <View style={[styles.methodIcon, { backgroundColor: ACCENT + '15' }]}>
                    <Ionicons name={def?.icon ?? 'card-outline'} size={19} color={ACCENT} />
                  </View>
                  <View style={styles.methodBody}>
                    <View style={styles.methodHead}>
                      <Text style={styles.methodLabel}>{def?.label ?? m.kind.toUpperCase()}</Text>
                      {m.isDefault ? <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View> : null}
                    </View>
                    <Text style={styles.methodAccount}>{maskAccount(m.account)}</Text>
                    <Text style={styles.methodHolder}>{m.holder}</Text>
                  </View>
                  <View style={styles.methodActions}>
                    <StatusPill
                      label={m.verified ? 'Verified' : 'Pending'}
                      color={m.verified ? PRO.green : PRO.amber}
                    />
                    <View style={styles.methodBtns}>
                      {!m.isDefault ? (
                        <Pressable
                          style={styles.iconBtn}
                          onPress={() => { hapticLight(); setDefault(m.id); showToast('Default payout method updated', 'success'); }}
                        >
                          <Ionicons name="star-outline" size={15} color={PRO.muted} />
                        </Pressable>
                      ) : null}
                      <Pressable
                        style={styles.iconBtn}
                        onPress={() => confirmRemove(m.id, def?.label ?? m.kind)}
                      >
                        <Ionicons name="trash-outline" size={15} color={PRO.red} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
            <GhostButton label="Add another method" icon="add-circle-outline" color={ACCENT} onPress={() => setFormOpen(true)} />
          </View>
        )}

        {/* ── Schedule ── */}
        <SectionTitle>Payout schedule</SectionTitle>
        <Panel>
          <Segmented
            options={FREQUENCIES}
            value={frequency}
            onChange={(next) => { setFrequency(next); showToast(`Payouts set to ${FREQUENCY_LABEL[next].toLowerCase()}`, 'success'); }}
            color={ACCENT}
          />
          <Text style={styles.note}>{FREQUENCY_NOTE[frequency]}</Text>
          <View style={styles.divider} />
          <MetricRow label="Schedule" value={FREQUENCY_LABEL[frequency]} />
          <MetricRow label="Minimum payout" value={formatDZD(MIN_PAYOUT)} />
          <MetricRow
            label="Transfer fee"
            value={frequency === 'weekly' ? '200 DZD' : 'Free'}
            color={frequency === 'weekly' ? PRO.amber : PRO.green}
          />
          <MetricRow label="Currency" value="Algerian Dinar (DZD)" />
        </Panel>

        <View style={styles.footerNote}>
          <Ionicons name="lock-closed-outline" size={14} color={PRO.subtle} />
          <Text style={styles.note}>
            Account details are stored on your device and shared only with the payment processor when a
            settlement runs. RIHLA never stores full card numbers.
          </Text>
        </View>
      </ScrollView>

      {/* ── Add method sheet ── */}
      <Modal visible={formOpen} animationType="slide" transparent onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>Add payout method</Text>
                <Pressable style={styles.iconBtn} onPress={() => { hapticLight(); setFormOpen(false); }}>
                  <Ionicons name="close" size={20} color={PRO.muted} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={styles.fieldLabel}>Method type</Text>
                <View style={styles.kindGrid}>
                  {KINDS.map((k) => {
                    const active = k.key === kind;
                    return (
                      <Pressable
                        key={k.key}
                        style={[styles.kindCard, active && { borderColor: ACCENT, backgroundColor: ACCENT + '0D' }]}
                        onPress={() => { hapticLight(); setKind(k.key); }}
                      >
                        <Ionicons name={k.icon} size={19} color={active ? ACCENT : PRO.muted} />
                        <Text style={[styles.kindLabel, active && { color: ACCENT }]}>{k.label}</Text>
                        <Text style={styles.kindHint}>{k.hint}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Field
                  label="Account holder"
                  value={holder}
                  onChangeText={setHolder}
                  placeholder="Name as it appears on the account"
                  icon="person-outline"
                  autoCapitalize="words"
                />
                <Field
                  label={activeKind.label}
                  value={account}
                  onChangeText={setAccount}
                  placeholder={activeKind.placeholder}
                  icon={activeKind.icon}
                  keyboardType={kind === 'cash' ? 'default' : 'numeric'}
                  hint={kind === 'cash' ? undefined : 'Double-check this — a wrong number delays your payout.'}
                />

                <PrimaryButton label="Add method" icon="checkmark-circle-outline" color={ACCENT} onPress={handleAdd} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18, flex: 1 },
  rows: { gap: 10 },
  divider: { height: 1, backgroundColor: PRO.borderSoft, marginVertical: 4 },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  footerNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 4 },

  balanceLabel: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.muted, letterSpacing: 0.5 },
  balanceValue: { fontSize: 30, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.8 },

  methodCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  methodIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  methodBody: { flex: 1, gap: 3 },
  methodHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodLabel: { fontSize: 13, fontFamily: 'mon-b', color: PRO.text },
  defaultBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: ACCENT + '20' },
  defaultText: { fontSize: 10, fontFamily: 'mon-b', color: '#B45309' },
  methodAccount: { fontSize: 14, fontFamily: 'mon-sb', color: PRO.text, letterSpacing: 1 },
  methodHolder: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle },
  methodActions: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  methodBtns: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: PRO.sunken },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalWrap: { width: '100%' },
  sheet: { backgroundColor: PRO.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, maxHeight: '90%' },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: PRO.border },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  sheetTitle: { fontSize: 17, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.4 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  fieldLabel: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  kindGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kindCard: {
    width: '47.5%',
    flexGrow: 1,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
    gap: 5,
  },
  kindLabel: { fontSize: 13, fontFamily: 'mon-b', color: PRO.text },
  kindHint: { fontSize: 11, fontFamily: 'mon', color: PRO.muted, lineHeight: 15 },
});
