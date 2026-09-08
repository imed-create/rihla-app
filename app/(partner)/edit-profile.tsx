/**
 * RIHLA — Partner Edit Profile
 * ────────────────────────────
 * The public-facing partner profile: avatar, bio, languages, service
 * areas and contact details. Everything persists through AppContext,
 * with a live preview of how travellers see the profile.
 */

import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  Field,
  Panel,
  PRO,
  PrimaryButton,
  ProgressBar,
  SectionTitle,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { WILAYAS } from '@/constants/wilayas';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { usePartnerServices } from '@/store/usePartnerServices';

const ACCENT = '#f4a261';

const LANGUAGES = ['Arabic', 'French', 'English', 'Tamazight', 'Kabyle', 'Spanish', 'German', 'Italian'] as const;

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export default function PartnerEditProfile() {
  const { user, updateUser } = useApp();
  const { services } = usePartnerServices();

  const [name, setName] = useState(user.name ?? '');
  const [phone, setPhone] = useState(user.phone ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [wilaya, setWilaya] = useState(user.wilaya ?? '');
  const [languages, setLanguages] = useState<string[]>(
    user.travelPreferences?.languagesSpoken ?? ['Arabic', 'French']
  );
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  /** Profile completeness — the thing that actually drives partner ranking. */
  const completeness = useMemo(() => {
    const checks = [
      Boolean(name.trim()),
      Boolean(phone.trim()),
      Boolean(email.trim()),
      bio.trim().length >= 40,
      Boolean(avatarUrl),
      Boolean(wilaya),
      languages.length > 0,
      services.length > 0,
    ];
    const done = checks.filter(Boolean).length;
    return { pct: Math.round((done / checks.length) * 100), done, total: checks.length };
  }, [name, phone, email, bio, avatarUrl, wilaya, languages, services.length]);

  const dirty = useMemo(
    () =>
      name !== (user.name ?? '') ||
      phone !== (user.phone ?? '') ||
      email !== (user.email ?? '') ||
      bio !== (user.bio ?? '') ||
      avatarUrl !== (user.avatarUrl ?? '') ||
      wilaya !== (user.wilaya ?? '') ||
      languages.join(',') !== (user.travelPreferences?.languagesSpoken ?? ['Arabic', 'French']).join(','),
    [name, phone, email, bio, avatarUrl, wilaya, languages, user]
  );

  const pickAvatar = async () => {
    hapticLight();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Photo library permission is required', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || result.assets.length === 0) return;
    setAvatarUrl(result.assets[0].uri);
    showToast('Photo updated — remember to save', 'success');
  };

  const toggleLanguage = (language: string) => {
    hapticLight();
    setLanguages((current) =>
      current.includes(language) ? current.filter((l) => l !== language) : [...current, language]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Your name is required', 'error');
      return;
    }
    updateUser({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl || undefined,
      wilaya: wilaya || undefined,
      travelPreferences: { ...user.travelPreferences, languagesSpoken: languages },
    });
    hapticSuccess();
    showToast('Profile saved', 'success');
  };

  return (
    <ProScreenChrome role="partner" title="Edit Profile" subtitle="Bio, photos & credentials">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* ── Preview ── */}
          <Panel accent={ACCENT}>
            <View style={styles.previewRow}>
              <Pressable style={styles.avatarWrap} onPress={() => void pickAvatar()}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
                ) : (
                  <View style={[styles.avatarEmpty, { backgroundColor: ACCENT + '20' }]}>
                    <Text style={[styles.avatarInitials, { color: ACCENT }]}>{initials(name)}</Text>
                  </View>
                )}
                <View style={[styles.avatarBadge, { backgroundColor: ACCENT }]}>
                  <Ionicons name="camera-outline" size={13} color="#FFFFFF" />
                </View>
              </Pressable>
              <View style={styles.flex}>
                <Text style={styles.previewName} numberOfLines={1}>{name || 'Your name'}</Text>
                <Text style={styles.previewMeta} numberOfLines={1}>
                  {wilaya || 'Service area not set'} · {services.length} service{services.length === 1 ? '' : 's'}
                </Text>
                <View style={styles.previewBadges}>
                  <StatusPill
                    label={user.kycStatus === 'approved' ? 'Verified' : 'Unverified'}
                    color={user.kycStatus === 'approved' ? PRO.green : PRO.subtle}
                  />
                </View>
              </View>
            </View>
            <Text style={styles.note} numberOfLines={3}>
              {bio || 'Add a bio so travellers know who they are booking. Partners with a bio get noticeably more requests.'}
            </Text>
          </Panel>

          {/* ── Completeness ── */}
          <Panel title="Profile strength" badge={`${completeness.pct}%`}>
            <ProgressBar
              pct={completeness.pct}
              color={completeness.pct >= 80 ? PRO.green : completeness.pct >= 50 ? PRO.amber : PRO.red}
            />
            <Text style={styles.note}>
              {completeness.done} of {completeness.total} items complete.
              {completeness.pct < 100
                ? ' A complete profile ranks higher in dispatch and converts more requests.'
                : ' Your profile is complete — nothing left to add.'}
            </Text>
          </Panel>

          {/* ── Details ── */}
          <SectionTitle>Your details</SectionTitle>
          <Panel>
            <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Karim Belhadj" icon="person-outline" autoCapitalize="words" />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="0555 00 00 00" icon="call-outline" keyboardType="phone-pad" />
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
            <Field
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="What you do, how long you have been doing it, what makes your service worth booking…"
              multiline
              hint={bio.trim().length < 40 ? `${bio.trim().length}/40 characters minimum` : `${bio.trim().length} characters`}
            />
          </Panel>

          {/* ── Languages ── */}
          <SectionTitle>Languages you speak</SectionTitle>
          <Panel>
            <View style={styles.chipWrap}>
              {LANGUAGES.map((language) => {
                const active = languages.includes(language);
                return (
                  <Pressable
                    key={language}
                    style={[styles.chip, active && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                    onPress={() => toggleLanguage(language)}
                  >
                    {active ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{language}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.note}>
              Travellers filter partners by language. Only select what you can genuinely hold a conversation in.
            </Text>
          </Panel>

          {/* ── Service area ── */}
          <SectionTitle>Service area</SectionTitle>
          <Panel>
            <Pressable style={styles.selectBox} onPress={() => { hapticLight(); setAreaPickerOpen((open) => !open); }}>
              <Ionicons name="location-outline" size={17} color={wilaya ? ACCENT : PRO.subtle} />
              <Text style={[styles.selectText, !wilaya && { color: PRO.subtle }]}>{wilaya || 'Select your wilaya'}</Text>
              <Ionicons name={areaPickerOpen ? 'chevron-up' : 'chevron-down'} size={17} color={PRO.subtle} />
            </Pressable>
            {areaPickerOpen ? (
              <View style={styles.chipWrap}>
                {WILAYAS.map((w) => {
                  const active = w.name === wilaya;
                  return (
                    <Pressable
                      key={w.id}
                      style={[styles.chip, active && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                      onPress={() => { hapticLight(); setWilaya(w.name); setAreaPickerOpen(false); }}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{w.name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </Panel>

          <PrimaryButton
            label={dirty ? 'Save profile' : 'All changes saved'}
            icon={dirty ? 'checkmark-circle-outline' : 'checkmark-done-outline'}
            color={ACCENT}
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
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },

  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { width: 68, height: 68 },
  avatar: { width: 68, height: 68, borderRadius: 24, borderWidth: 1, borderColor: PRO.border },
  avatarEmpty: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 22, fontFamily: 'mon-b' },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  previewName: { fontSize: 17, fontFamily: 'mon-b', color: PRO.text, letterSpacing: -0.4 },
  previewMeta: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, marginTop: 2 },
  previewBadges: { flexDirection: 'row', gap: 6, marginTop: 7 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  chipTextActive: { color: '#FFFFFF' },

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
});
