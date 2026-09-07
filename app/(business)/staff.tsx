/**
 * RIHLA — Staff Management
 * ────────────────────────
 * Real roster CRUD backed by useStaffStore: add team members, cycle their
 * status, filter by shift or state, and track the monthly payroll cost.
 */

import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  Field,
  GhostButton,
  HeroStat,
  type IonName,
  Panel,
  PRO,
  PrimaryButton,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import {
  type ShiftPattern,
  type StaffRole,
  type StaffStatus,
  useStaffStore,
} from '@/store/useStaffStore';
import type { MarketplaceCategory } from '@/types/service';

const FILTERS = ['All', 'Active', 'On leave', 'Inactive'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_STATUS: Record<Exclude<Filter, 'All'>, StaffStatus> = {
  Active: 'active',
  'On leave': 'on-leave',
  Inactive: 'inactive',
};

const ROLES: { key: StaffRole; label: string; icon: IonName }[] = [
  { key: 'manager', label: 'Manager', icon: 'briefcase-outline' },
  { key: 'reception', label: 'Reception', icon: 'person-outline' },
  { key: 'operations', label: 'Operations', icon: 'construct-outline' },
  { key: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
  { key: 'housekeeping', label: 'Housekeeping', icon: 'sparkles-outline' },
  { key: 'security', label: 'Security', icon: 'shield-outline' },
  { key: 'driver', label: 'Driver', icon: 'car-outline' },
];

const SHIFTS: { key: ShiftPattern; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'evening', label: 'Evening' },
  { key: 'night', label: 'Night' },
  { key: 'flexible', label: 'Flexible' },
];

const STATUS_META: Record<StaffStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: PRO.green },
  'on-leave': { label: 'On leave', color: PRO.amber },
  inactive: { label: 'Inactive', color: PRO.subtle },
};

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function BusinessStaff() {
  const { user } = useApp();
  const { staff, addStaff, cycleStatus, removeStaff, getMonthlyPayroll } = useStaffStore();
  const [filter, setFilter] = useState<Filter>('All');
  const [formOpen, setFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pay, setPay] = useState('');
  const [role, setRole] = useState<StaffRole>('reception');
  const [shift, setShift] = useState<ShiftPattern>('morning');

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as MarketplaceCategory) : null;
  const color = catDef?.color ?? PRO.navy;

  const visible = useMemo(() => {
    if (filter === 'All') return staff;
    return staff.filter((m) => m.status === FILTER_STATUS[filter]);
  }, [staff, filter]);

  const counts = useMemo(
    () => ({
      active: staff.filter((m) => m.status === 'active').length,
      onLeave: staff.filter((m) => m.status === 'on-leave').length,
      inactive: staff.filter((m) => m.status === 'inactive').length,
    }),
    [staff]
  );

  const payroll = getMonthlyPayroll();
  const avgPay = staff.length > 0 ? payroll / Math.max(staff.length - counts.inactive, 1) : 0;

  const resetForm = () => {
    setName('');
    setPhone('');
    setPay('');
    setRole('reception');
    setShift('morning');
  };

  const handleAdd = () => {
    if (!name.trim()) {
      showToast('Staff name is required', 'error');
      return;
    }
    const payValue = Number.parseInt(pay.replace(/\D/g, ''), 10);
    if (!Number.isFinite(payValue) || payValue <= 0) {
      showToast('Enter a valid monthly pay', 'error');
      return;
    }
    addStaff({
      name: name.trim(),
      role,
      phone: phone.trim(),
      status: 'active',
      shift,
      monthlyPayDZD: payValue,
      startedAt: new Date().toISOString(),
    });
    hapticSuccess();
    showToast(`${name.trim()} added to the team`, 'success');
    resetForm();
    setFormOpen(false);
  };

  const confirmRemove = (id: string, memberName: string) => {
    hapticLight();
    Alert.alert('Remove staff member', `Remove ${memberName} from your team?`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeStaff(id);
          showToast(`${memberName} removed`, 'success');
        },
      },
    ]);
  };

  return (
    <ProScreenChrome
      role="business"
      title="Staff Management"
      subtitle="Roster, shifts & payroll"
      headerRight={
        <Pressable
          style={[styles.addBtn, { backgroundColor: color }]}
          onPress={() => { hapticLight(); setFormOpen(true); }}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {staff.length === 0 ? (
          <EmptyBlock
            icon="people-outline"
            title="No team members yet"
            subtitle="Add the people who run your business day to day. Track their shifts, status and monthly payroll in one place."
            actionLabel="Add first member"
            color={color}
            onAction={() => setFormOpen(true)}
          />
        ) : (
          <>
            <HeroStat
              label="Monthly payroll"
              value={formatDZD(payroll)}
              caption={`${counts.active + counts.onLeave} paid staff · average ${formatDZD(avgPay)} each`}
              color={color}
              icon="wallet-outline"
            />

            <StatGrid>
              <StatCard icon="checkmark-circle-outline" label="Active" value={String(counts.active)} color={PRO.green} />
              <StatCard icon="airplane-outline" label="On leave" value={String(counts.onLeave)} color={PRO.amber} />
              <StatCard icon="pause-circle-outline" label="Inactive" value={String(counts.inactive)} color={PRO.subtle} />
              <StatCard icon="people-outline" label="Total team" value={String(staff.length)} color={color} />
            </StatGrid>

            <Segmented options={FILTERS} value={filter} onChange={setFilter} color={color} />

            <SectionTitle>
              {filter === 'All' ? 'Full roster' : filter}
            </SectionTitle>

            {visible.length === 0 ? (
              <Panel>
                <Text style={styles.note}>No staff match this filter.</Text>
              </Panel>
            ) : (
              <View style={styles.rows}>
                {visible.map((member) => {
                  const meta = STATUS_META[member.status];
                  const roleDef = ROLES.find((r) => r.key === member.role);
                  return (
                    <View key={member.id} style={styles.staffCard}>
                      <View style={[styles.avatar, { backgroundColor: color + '15' }]}>
                        <Text style={[styles.avatarText, { color }]}>{initials(member.name)}</Text>
                      </View>
                      <View style={styles.staffBody}>
                        <Text style={styles.staffName} numberOfLines={1}>{member.name}</Text>
                        <View style={styles.staffMeta}>
                          <Ionicons name={roleDef?.icon ?? 'person-outline'} size={12} color={PRO.muted} />
                          <Text style={styles.staffMetaText}>
                            {roleDef?.label ?? member.role} · {member.shift} shift
                          </Text>
                        </View>
                        <Text style={styles.staffPay}>{formatDZD(member.monthlyPayDZD)} / month</Text>
                      </View>
                      <View style={styles.staffActions}>
                        <Pressable onPress={() => { hapticLight(); cycleStatus(member.id); }}>
                          <StatusPill label={meta.label} color={meta.color} />
                        </Pressable>
                        <Pressable
                          style={styles.iconBtn}
                          onPress={() => confirmRemove(member.id, member.name)}
                        >
                          <Ionicons name="trash-outline" size={16} color={PRO.red} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <GhostButton label="Add team member" icon="person-add-outline" color={color} onPress={() => { setFormOpen(true); }} />
          </>
        )}
      </ScrollView>

      {/* ── Add staff sheet ── */}
      <Modal visible={formOpen} animationType="slide" transparent onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHead}>
                <Text style={styles.sheetTitle}>Add team member</Text>
                <Pressable style={styles.iconBtn} onPress={() => { hapticLight(); setFormOpen(false); }}>
                  <Ionicons name="close" size={20} color={PRO.muted} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Amine Belkacem" icon="person-outline" autoCapitalize="words" />
                <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="0555 00 00 00" icon="call-outline" keyboardType="phone-pad" />
                <Field label="Monthly pay (DZD)" value={pay} onChangeText={setPay} placeholder="45000" icon="cash-outline" keyboardType="numeric" />

                <Text style={styles.fieldLabel}>Role</Text>
                <View style={styles.chipWrap}>
                  {ROLES.map((r) => {
                    const active = r.key === role;
                    return (
                      <Pressable
                        key={r.key}
                        style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
                        onPress={() => { hapticLight(); setRole(r.key); }}
                      >
                        <Ionicons name={r.icon} size={13} color={active ? '#FFFFFF' : PRO.muted} />
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Shift pattern</Text>
                <View style={styles.chipWrap}>
                  {SHIFTS.map((s) => {
                    const active = s.key === shift;
                    return (
                      <Pressable
                        key={s.key}
                        style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
                        onPress={() => { hapticLight(); setShift(s.key); }}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <PrimaryButton label="Add to team" icon="checkmark-circle-outline" color={color} onPress={handleAdd} />
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
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 17 },
  rows: { gap: 10 },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  avatar: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontFamily: 'mon-b' },
  staffBody: { flex: 1, gap: 3 },
  staffName: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  staffMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  staffMetaText: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, textTransform: 'capitalize' },
  staffPay: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.text },
  staffActions: { alignItems: 'flex-end', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: PRO.sunken },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalWrap: { width: '100%' },
  sheet: {
    backgroundColor: PRO.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    maxHeight: '88%',
  },
  sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: PRO.border },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  sheetTitle: { fontSize: 17, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.4 },
  sheetBody: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  fieldLabel: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  chipTextActive: { color: '#FFFFFF' },
});
