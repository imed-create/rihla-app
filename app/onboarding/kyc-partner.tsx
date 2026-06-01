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

const ASSET_TYPES = [
  { id: 'jet-ski', label: 'Jet Ski', icon: 'boat-outline' },
  { id: 'camel', label: 'Camels', icon: 'paw-outline' },
  { id: 'buggy', label: 'Dune Buggy', icon: 'car-sport-outline' },
  { id: 'quad', label: 'Quad Bike', icon: 'bicycle-outline' },
  { id: 'kayak', label: 'Kayak', icon: 'water-outline' },
  { id: 'horse', label: 'Horses', icon: 'logo-buffer' },
  { id: 'paraglider', label: 'Paraglider', icon: 'airplane-outline' },
  { id: 'other', label: 'Other', icon: 'cube-outline' },
];

const COUNTS = [1, 2, 3, 4, 5, '6+'];

export default function KycPartnerScreen() {
  const insets = useSafeAreaInsets();
  const { submitKyc } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [assetType, setAssetType] = useState('');
  const [assetCount, setAssetCount] = useState<number>(1);
  const [assetPhotoUri, setAssetPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickAssetPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled) setAssetPhotoUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim() || !assetType) {
      Alert.alert('Missing Info', 'Please fill in your name, phone and select an asset type.');
      return;
    }
    setLoading(true);
    const data: KycData = { fullName, phone, assetType, assetCount, assetPhotoUri: assetPhotoUri ?? undefined };
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
          <Text style={styles.headerTitle}>Partner Verification</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introBlock}>
          <Text style={styles.introTitle}>List your assets</Text>
          <Text style={styles.introSub}>
            Tell us about what you're renting out. We'll get you earning as quickly as possible.
          </Text>
        </View>

        {/* Personal info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>YOUR INFORMATION</Text>
          <Field
            label="Full Name"
            required
            placeholder="Yacine Meziani"
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

        {/* Asset type */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>WHAT DO YOU HAVE TO RENT? <Text style={styles.requiredTag}>*</Text></Text>
          <View style={styles.assetGrid}>
            {ASSET_TYPES.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.assetCard, assetType === a.id && styles.assetCardActive]}
                onPress={() => setAssetType(a.id)}
              >
                <Ionicons name={a.icon as any} size={24} color={assetType === a.id ? '#059669' : '#94A3B8'} />
                <Text style={[styles.assetLabel, assetType === a.id && styles.assetLabelActive]}>
                  {a.label}
                </Text>
                {assetType === a.id && (
                  <View style={styles.assetCheck}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Count */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>HOW MANY? <Text style={styles.requiredTag}>*</Text></Text>
          <View style={styles.countRow}>
            {COUNTS.map((c) => (
              <TouchableOpacity
                key={String(c)}
                style={[styles.countBtn, assetCount === (typeof c === 'number' ? c : 6) && styles.countBtnActive]}
                onPress={() => setAssetCount(typeof c === 'number' ? c : 6)}
              >
                <Text style={[styles.countText, assetCount === (typeof c === 'number' ? c : 6) && styles.countTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photo upload */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>ASSET PHOTO <Text style={styles.optionalTag}>(optional)</Text></Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickAssetPhoto}>
            {assetPhotoUri ? (
              <Image source={{ uri: assetPhotoUri }} style={styles.docPreview} resizeMode="cover" />
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <Ionicons name="image-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.uploadTitle}>Upload a Photo</Text>
                <Text style={styles.uploadSub}>Helps tourists choose your service with confidence</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="flash-outline" size={18} color="#059669" />
          <Text style={styles.infoText}>
            Your listing will go live once approved. Earnings are paid weekly.
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Submit Application</Text>
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
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
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
  requiredTag: { color: '#EF4444' },
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

  // Asset grid
  assetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  assetCard: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  assetCardActive: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  assetLabel: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  assetLabelActive: { color: '#059669', fontFamily: 'mon-sb' },
  assetCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Count
  countRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  countBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    minWidth: 52,
    alignItems: 'center',
  },
  countBtnActive: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  countText: { fontSize: 15, fontFamily: 'mon-sb', color: '#94A3B8' },
  countTextActive: { color: '#059669' },

  // Upload
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
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
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: { fontSize: 14, fontFamily: 'mon-sb', color: '#059669' },
  uploadSub: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  docPreview: { width: '100%', height: 160, borderRadius: 10 },

  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'mon', color: '#065F46', lineHeight: 18 },

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
