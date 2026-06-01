import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp, KycData } from '@/context/AppContext';

const NATIONALITIES = [
  'Algerian', 'French', 'Moroccan', 'Tunisian', 'Egyptian', 'British',
  'American', 'German', 'Spanish', 'Italian', 'Other',
];

export default function KycTravelerScreen() {
  const insets = useSafeAreaInsets();
  const { submitKyc } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [showNatPicker, setShowNatPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickSelfie = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setSelfieUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim() || !nationality) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const data: KycData = { fullName, phone, nationality, selfieUri: selfieUri ?? undefined };
    await submitKyc(data);
    setLoading(false);
    router.replace('/onboarding/kyc-pending');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>Step 2 of 2</Text>
          <Text style={styles.headerTitle}>Traveler Verification</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>Tell us about yourself</Text>
          <Text style={styles.introSub}>
            We need a few details to verify your identity and personalise your experience.
          </Text>
        </View>

        {/* Selfie */}
        <TouchableOpacity onPress={pickSelfie} style={styles.selfieContainer}>
          {selfieUri ? (
            <Image source={{ uri: selfieUri }} style={styles.selfieImg} />
          ) : (
            <View style={styles.selfiePlaceholder}>
              <Ionicons name="camera-outline" size={28} color="#0096C7" />
              <Text style={styles.selfieTip}>Add Profile Photo</Text>
              <Text style={styles.selfieHint}>Optional · Tap to upload</Text>
            </View>
          )}
          {selfieUri && (
            <View style={styles.selfieBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>

          <Field
            label="Full Name"
            required
            placeholder="Ahmed Bensalem"
            value={fullName}
            onChange={setFullName}
            icon="person-outline"
          />
          <Field
            label="Phone Number"
            required
            placeholder="+213 5XX XXX XXX"
            value={phone}
            onChange={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          {/* Nationality */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              Nationality <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowNatPicker(!showNatPicker)}>
              <Ionicons name="globe-outline" size={18} color="#64748B" />
              <Text style={[styles.selectText, !nationality && { color: '#94A3B8' }]}>
                {nationality || 'Select nationality'}
              </Text>
              <Ionicons name={showNatPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
            </TouchableOpacity>
            {showNatPicker && (
              <View style={styles.pickerDropdown}>
                {NATIONALITIES.map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.pickerOption, nationality === n && styles.pickerOptionActive]}
                    onPress={() => { setNationality(n); setShowNatPicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, nationality === n && styles.pickerOptionTextActive]}>{n}</Text>
                    {nationality === n && <Ionicons name="checkmark" size={16} color="#0096C7" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#0096C7" />
          <Text style={styles.infoText}>Your data is encrypted and never shared with third parties.</Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Submit Verification</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, required, placeholder, value, onChange, icon, keyboardType }: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.fieldBox}>
        <Ionicons name={icon} size={18} color="#64748B" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerStep: { fontSize: 11, fontFamily: 'mon-sb', color: '#94A3B8', letterSpacing: 0.5 },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#000000', marginTop: 1 },

  // Scroll
  scroll: { padding: 24, gap: 20 },

  introBlock: { gap: 6 },
  introTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#000000' },
  introSub: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 20 },

  // Selfie
  selfieContainer: {
    alignSelf: 'center',
    position: 'relative',
  },
  selfieImg: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#E2E8F0' },
  selfiePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  selfieTip: { fontSize: 10, fontFamily: 'mon-sb', color: '#0096C7' },
  selfieHint: { fontSize: 9, fontFamily: 'mon', color: '#94A3B8' },
  selfieBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#0096C7',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  // Form
  formSection: { gap: 16 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  required: { color: '#EF4444' },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
  },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: 'mon', color: '#1E293B' },

  // Nationality picker
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  selectText: { flex: 1, fontSize: 15, fontFamily: 'mon', color: '#1E293B' },
  pickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: -4,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  pickerOptionActive: { backgroundColor: '#F0F9FF' },
  pickerOptionText: { fontSize: 14, fontFamily: 'mon', color: '#334155' },
  pickerOptionTextActive: { color: '#0096C7', fontFamily: 'mon-sb' },

  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'mon', color: '#0369A1', lineHeight: 18 },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  submitBtn: {
    backgroundColor: '#FF385C',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },
});
