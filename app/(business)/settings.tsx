/**
 * RIHLA — Business Profile & Settings
 * ───────────────────────────────────
 * Edits the owner's real profile + KYC record through AppContext.
 * Brand assets, business details, address, verification state and
 * operating preferences all persist via updateUser().
 */

import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  Field,
  GhostButton,
  type IonName,
  ListRow,
  Panel,
  PRO,
  PrimaryButton,
  SectionTitle,
  StatusPill,
  Toggle,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { WILAYAS } from '@/constants/wilayas';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import type { KycStatus } from '@/types/app';
import type { MarketplaceCategory } from '@/types/service';

const KYC_META: Record<KycStatus, { label: string; color: string; icon: IonName; note: string }> = {
  none: {
    label: 'Not submitted',
    color: PRO.subtle,
    icon: 'alert-circle-outline',
    note: 'Complete verification to publish listings and receive payouts.',
  },
  submitted: {
    label: 'Under review',
    color: PRO.amber,
    icon: 'time-outline',
    note: 'Our team is reviewing your documents. This usually takes 24–48 hours.',
  },
  approved: {
    label: 'Verified',
    color: PRO.green,
    icon: 'shield-checkmark-outline',
    note: 'Your business is verified. The verified badge shows on all your listings.',
  },
  rejected: {
    label: 'Action required',
    color: PRO.red,
    icon: 'close-circle-outline',
    note: 'Some documents were rejected. Re-upload them to restore your verified badge.',
  },
};

export default function BusinessSettings() {
  const { user, updateUser } = useApp();
  const kyc = user.kycData ?? {};

  const businessType = (kyc.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as MarketplaceCategory) : null;
  const color = catDef?.color ?? PRO.navy;

  const [businessName, setBusinessName] = useState(kyc.businessName ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [wilaya, setWilaya] = useState(kyc.wilaya ?? '');
  const [city, setCity] = useState(kyc.city ?? '');
  const [street, setStreet] = useState(kyc.street ?? '');
  const [logoUri, setLogoUri] = useState(kyc.logoUri ?? '');
  const [coverUri, setCoverUri] = useState(kyc.coverUri ?? '');
  const [wilayaPickerOpen, setWilayaPickerOpen] = useState(false);

  const [instantBooking, setInstantBooking] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [showPhone, setShowPhone] = useState(true);

  const kycMeta = KYC_META[user.kycStatus] ?? KYC_META.none;

  const dirty = useMemo(
    () =>
      businessName !== (kyc.businessName ?? '') ||
      phone !== (user.phone ?? '') ||
      email !== (user.email ?? '') ||
      bio !== (user.bio ?? '') ||
      wilaya !== (kyc.wilaya ?? '') ||
      city !== (kyc.city ?? '') ||
      street !== (kyc.street ?? '') ||
      logoUri !== (kyc.logoUri ?? '') ||
      coverUri !== (kyc.coverUri ?? ''),
    [businessName, phone, email, bio, wilaya, city, street, logoUri, coverUri, kyc, user]
  );

  const pickImage = async (target: 'logo' | 'cover') => {
    hapticLight();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Photo library permission is required', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: target === 'logo' ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    const uri = result.assets[0].uri;
    if (target === 'logo') setLogoUri(uri);
    else setCoverUri(uri);
    showToast(`${target === 'logo' ? 'Logo' : 'Cover'} updated — remember to save`, 'success');
  };

  const handleSave = () => {
    if (!businessName.trim()) {
      showToast('Business name is required', 'error');
      return;
    }
    updateUser({
      phone: phone.trim(),
      email: email.trim(),
      bio: bio.trim(),
      wilaya: wilaya || undefined,
      kycData: {
        ...kyc,
        businessName: businessName.trim(),
        wilaya: wilaya || undefined,
        city: city.trim() || undefined,
        street: street.trim() || undefined,
        logoUri: logoUri || undefined,
        coverUri: coverUri || undefined,
      },
    });
    hapticSuccess();
    showToast('Business profile saved', 'success');
  };

  return (
    <ProScreenChrome role="business" title="Business Profile" subtitle="Brand, details & KYC">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* ── Verification state ── */}
          <Panel accent={kycMeta.color}>
            <View style={styles.kycHead}>
              <View style={[styles.kycIcon, { backgroundColor: kycMeta.color + '15' }]}>
                <Ionicons name={kycMeta.icon} size={22} color={kycMeta.color} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.kycTitle}>Verification</Text>
                <Text style={styles.note}>{kycMeta.note}</Text>
              </View>
              <StatusPill label={kycMeta.label} color={kycMeta.color} />
            </View>
            {user.kycStatus === 'rejected' && user.kycRejectionReason ? (
              <View style={styles.rejectBox}>
                <Ionicons name="information-circle-outline" size={15} color={PRO.red} />
                <Text style={[styles.note, { color: PRO.red }]}>{user.kycRejectionReason}</Text>
              </View>
            ) : null}
          </Panel>

          {/* ── Brand assets ── */}
          <SectionTitle>Brand assets</SectionTitle>
          <Panel>
            <Pressable style={styles.coverPicker} onPress={() => void pickImage('cover')}>
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
              ) : (
                <View style={[styles.coverEmpty, { backgroundColor: color + '0D' }]}>
                  <Ionicons name="image-outline" size={26} color={color} />
                  <Text style={styles.pickerHint}>Add a cover image (16:9)</Text>
                </View>
              )}
              <View style={styles.coverEditBadge}>
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
              </View>
            </Pressable>

            <View style={styles.logoRow}>
              <Pressable style={styles.logoPicker} onPress={() => void pickImage('logo')}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.logoEmpty, { backgroundColor: color + '15' }]}>
                    <Ionicons name="business-outline" size={22} color={color} />
                  </View>
                )}
              </Pressable>
              <View style={styles.flex}>
                <Text style={styles.rowTitle}>Business logo</Text>
                <Text style={styles.note}>Square image, shown on your listings and receipts.</Text>
              </View>
            </View>
          </Panel>

          {/* ── Business details ── */}
          <SectionTitle>Business details</SectionTitle>
          <Panel>
            <Field
              label="Business name"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="e.g. Riad Yasmine"
              icon="business-outline"
              autoCapitalize="words"
            />
            <View style={styles.readonlyRow}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={[styles.readonlyBox, { borderColor: color + '35', backgroundColor: color + '0D' }]}>
                <Ionicons name={(catDef?.icon ?? 'grid-outline') as IonName} size={17} color={color} />
                <Text style={[styles.readonlyText, { color }]}>{catDef?.label ?? 'Not set'}</Text>
                <Ionicons name="lock-closed-outline" size={14} color={PRO.subtle} />
              </View>
              <Text style={styles.fieldHint}>Category is locked after verification. Contact support to change it.</Text>
            </View>
            <Field
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="0555 00 00 00"
              icon="call-outline"
              keyboardType="phone-pad"
            />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="contact@business.dz"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="About your business"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell travellers what makes your place special…"
              multiline
              hint={`${bio.length}/280 characters`}
            />
          </Panel>

          {/* ── Location ── */}
          <SectionTitle>Location</SectionTitle>
          <Panel>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Wilaya</Text>
              <Pressable
                style={styles.selectBox}
                onPress={() => { hapticLight(); setWilayaPickerOpen((open) => !open); }}
              >
                <Ionicons name="location-outline" size={17} color={wilaya ? color : PRO.subtle} />
                <Text style={[styles.selectText, !wilaya && { color: PRO.subtle }]}>
                  {wilaya || 'Select a wilaya'}
                </Text>
                <Ionicons name={wilayaPickerOpen ? 'chevron-up' : 'chevron-down'} size={17} color={PRO.subtle} />
              </Pressable>
              {wilayaPickerOpen ? (
                <View style={styles.wilayaGrid}>
                  {WILAYAS.map((w) => {
                    const active = w.name === wilaya;
                    return (
                      <Pressable
                        key={w.id}
                        style={[styles.wilayaChip, active && { backgroundColor: color, borderColor: color }]}
                        onPress={() => { hapticLight(); setWilaya(w.name); setWilayaPickerOpen(false); }}
                      >
                        <Text style={[styles.wilayaChipText, active && styles.wilayaChipTextActive]}>{w.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
            <Field label="City / commune" value={city} onChangeText={setCity} placeholder="e.g. Sidi Fredj" icon="map-outline" autoCapitalize="words" />
            <Field label="Street address" value={street} onChangeText={setStreet} placeholder="Street, building, landmark" icon="navigate-outline" />
            {kyc.gpsLat && kyc.gpsLng ? (
              <ListRow
                icon="pin-outline"
                iconColor={color}
                title="GPS pin set"
                subtitle={`${kyc.gpsLat}, ${kyc.gpsLng}`}
                right={<StatusPill label="On map" color={PRO.green} />}
                showChevron={false}
              />
            ) : (
              <GhostButton
                label="Set GPS location"
                icon="pin-outline"
                color={color}
                onPress={() => showToast('Set your pin during KYC verification', 'info')}
              />
            )}
          </Panel>

          {/* ── Booking preferences ── */}
          <SectionTitle>Booking preferences</SectionTitle>
          <Panel>
            <Toggle
              label="Instant booking"
              description="Travellers can book without waiting for your confirmation."
              value={instantBooking}
              onValueChange={setInstantBooking}
              color={color}
            />
            <View style={styles.hairline} />
            <Toggle
              label="Auto-accept requests"
              description="Automatically accept requests that match your availability."
              value={autoAccept}
              onValueChange={setAutoAccept}
              color={color}
            />
            <View style={styles.hairline} />
            <Toggle
              label="Show phone on listings"
              description="Display your number publicly so travellers can call you."
              value={showPhone}
              onValueChange={setShowPhone}
              color={color}
            />
          </Panel>

          <PrimaryButton
            label={dirty ? 'Save changes' : 'All changes saved'}
            icon={dirty ? 'checkmark-circle-outline' : 'checkmark-done-outline'}
            color={color}
            disabled={!dirty}
            onPress={handleSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 56, gap: 14 },

  kycHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kycIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  kycTitle: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  rejectBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 17, flex: 1 },
  rowTitle: { fontSize: 14, fontFamily: 'mon-sb', color: PRO.text },

  coverPicker: { height: 140, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: PRO.border },
  coverImage: { width: '100%', height: '100%' },
  coverEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  coverEditBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerHint: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  logoPicker: { width: 60, height: 60, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: PRO.border },
  logoImage: { width: '100%', height: '100%' },
  logoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  field: { gap: 7 },
  fieldLabel: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  fieldHint: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle },
  readonlyRow: { gap: 7 },
  readonlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  readonlyText: { flex: 1, fontSize: 14, fontFamily: 'mon-sb' },

  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.canvas,
  },
  selectText: { flex: 1, fontSize: 14, fontFamily: 'mon', color: PRO.text },
  wilayaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  wilayaChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  wilayaChipText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  wilayaChipTextActive: { color: '#FFFFFF' },

  hairline: { height: 1, backgroundColor: PRO.borderSoft },
});
