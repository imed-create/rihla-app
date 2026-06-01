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

const BUSINESS_TYPES = [
  'Hotel / Riad', 'Beach Resort', 'Restaurant / Café', 'Travel Agency',
  'Desert Camp', 'Spa / Hammam', 'Tour Operator', 'Activity Center', 'Other',
];

export default function KycBusinessScreen() {
  const insets = useSafeAreaInsets();
  const { submitKyc } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [tradeRegisterUri, setTradeRegisterUri] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled) setTradeRegisterUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim() || !businessName.trim() || !businessType) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    const data: KycData = { fullName, phone, businessName, businessType, tradeRegisterUri: tradeRegisterUri ?? undefined };
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
          <Text style={styles.headerTitle}>Business Verification</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>List your business</Text>
          <Text style={styles.introSub}>
            Provide your business details so we can verify and activate your listing on TourDZ.
          </Text>
        </View>

        {/* Owner info section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>OWNER INFORMATION</Text>

          <Field
            label="Owner Full Name"
            required
            placeholder="Karim Boudiaf"
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
        </View>

        {/* Business info section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>BUSINESS INFORMATION</Text>

          <Field
            label="Business Name"
            required
            placeholder="Sidi Fredj Resort"
            value={businessName}
            onChange={setBusinessName}
            icon="business-outline"
          />

          {/* Business type picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Business Type <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.selectBox} onPress={() => setShowTypePicker(!showTypePicker)}>
              <Ionicons name="briefcase-outline" size={18} color="#64748B" />
              <Text style={[styles.selectText, !businessType && { color: '#94A3B8' }]}>
                {businessType || 'Select business type'}
              </Text>
              <Ionicons name={showTypePicker ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
            </TouchableOpacity>
            {showTypePicker && (
              <View style={styles.pickerDropdown}>
                {BUSINESS_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.pickerOption, businessType === t && styles.pickerOptionActive]}
                    onPress={() => { setBusinessType(t); setShowTypePicker(false); }}
                  >
                    <Text style={[styles.pickerOptionText, businessType === t && styles.pickerOptionTextActive]}>{t}</Text>
                    {businessType === t && <Ionicons name="checkmark" size={16} color="#7C3AED" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Document upload */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>TRADE REGISTER <Text style={styles.optionalTag}>(optional)</Text></Text>

          <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
            {tradeRegisterUri ? (
              <Image source={{ uri: tradeRegisterUri }} style={styles.docPreview} resizeMode="cover" />
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#7C3AED" />
                </View>
                <Text style={styles.uploadTitle}>Upload Trade Register</Text>
                <Text style={styles.uploadSub}>Photo of your official business registration document</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
          <Text style={[styles.infoText, { color: '#5B21B6' }]}>
            Documents are reviewed within 24–48 hours by our team.
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Submit for Review</Text>
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

  scroll: { padding: 24, gap: 24 },

  introBlock: { gap: 6 },
  introTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#000000' },
  introSub: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 20 },

  formSection: { gap: 14 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -2,
  },
  optionalTag: { color: '#CBD5E1', textTransform: 'none', fontFamily: 'mon' },

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
  pickerOptionActive: { backgroundColor: '#F5F3FF' },
  pickerOptionText: { fontSize: 14, fontFamily: 'mon', color: '#334155' },
  pickerOptionTextActive: { color: '#7C3AED', fontFamily: 'mon-sb' },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: { fontSize: 14, fontFamily: 'mon-sb', color: '#7C3AED' },
  uploadSub: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  docPreview: { width: '100%', height: 160, borderRadius: 10 },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'mon', lineHeight: 18 },

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
