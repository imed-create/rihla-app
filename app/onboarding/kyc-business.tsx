/**
 * RIHLA — 6-Step Business KYC
 * ----------------------------
 * Multi-step business onboarding:
 *   Step 1: Business Type (10 marketplace categories)
 *   Step 2: Business Information (name, description, phone, email)
 *   Step 3: Location / Address (wilaya, city, street)
 *   Step 4: GPS Location (interactive map picker)
 *   Step 5: Identity Verification (ID, Commercial Register, Tax)
 *   Step 6: Brand Assets (logo, cover, gallery)
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useApp, KycData } from '@/context/AppContext';
import { SAHEL } from '@/constants/Colors';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { showToast } from '@/components/Toast';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Business Type', icon: 'briefcase-outline', color: '#00a896' },
  { id: 2, label: 'Information', icon: 'document-text-outline', color: '#3B82F6' },
  { id: 3, label: 'Address', icon: 'location-outline', color: '#8B5CF6' },
  { id: 4, label: 'GPS Location', icon: 'map-outline', color: '#F59E0B' },
  { id: 5, label: 'Verification', icon: 'shield-checkmark-outline', color: '#10B981' },
  { id: 6, label: 'Brand Assets', icon: 'color-palette-outline', color: '#EF4444' },
];

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra',
  'Bechar', 'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda',
  'Sidi Bel Abbes', 'Annaba', 'Guelma', 'Constantine', 'Medea', 'Mostaganem',
  'Msila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
  'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent',
  'Ghardaia', 'Relizane', 'El Mgair', 'El Meniaa', 'Ouled Djellal',
  'Bordj Badji Mokhtar', 'Beni Abbes', 'Timimoun', 'Touggourt', 'Djanet',
  'In Salah', 'In Guezzam',
];

// ─────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <View
              style={[
                styles.stepDot,
                done && { backgroundColor: SAHEL.accent },
                active && { backgroundColor: SAHEL.primary, width: 28, borderRadius: 8 },
              ]}
            />
            {i < total - 1 && (
              <View style={[styles.stepLine, done && { backgroundColor: SAHEL.accent }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function FormField({
  label,
  required,
  placeholder,
  value,
  onChange,
  icon,
  keyboardType,
  multiline,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.fieldBox, multiline && styles.fieldBoxMultiline]}>
        <Ionicons name={icon as any} size={18} color="#64748B" style={styles.fieldIcon} />
        <TextInput
          style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType || 'default'}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STEP COMPONENTS
// ─────────────────────────────────────────────

function Step1_BusinessType({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What type of business?</Text>
      <Text style={styles.stepSub}>Select the category that best describes your business.</Text>
      <View style={styles.typeGrid}>
        {MARKETPLACE_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[styles.typeCard, value === cat.key && styles.typeCardActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(cat.key);
            }}
          >
            <View style={[styles.typeIconWrap, value === cat.key && { backgroundColor: cat.color + '20' }]}>
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={value === cat.key ? cat.color : '#64748B'}
              />
            </View>
            <Text style={[styles.typeLabel, value === cat.key && { color: cat.color, fontFamily: 'mon-b' }]}>
              {cat.label}
            </Text>
            <Text style={styles.typeDesc} numberOfLines={2}>{cat.description}</Text>
            {value === cat.key && (
              <View style={[styles.typeCheck, { backgroundColor: cat.color }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Step2_Info({
  businessName,
  onNameChange,
  description,
  onDescChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange,
  website,
  onWebsiteChange,
}: {
  businessName: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  website: string;
  onWebsiteChange: (v: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Information</Text>
      <Text style={styles.stepSub}>Tell us about your business.</Text>
      <FormField label="Business Name" required placeholder="Hotel El Djazair" value={businessName} onChange={onNameChange} icon="business-outline" />
      <FormField label="Description" placeholder="Describe what makes your business special..." value={description} onChange={onDescChange} icon="text-outline" multiline />
      <FormField label="Phone Number" required placeholder="+213 5XX XXX XXX" value={phone} onChange={onPhoneChange} icon="call-outline" keyboardType="phone-pad" />
      <FormField label="Email" placeholder="hello@business.dz" value={email} onChange={onEmailChange} icon="mail-outline" keyboardType="email-address" />
      <FormField label="Website" placeholder="https://mybusiness.dz" value={website} onChange={onWebsiteChange} icon="globe-outline" keyboardType="url" />
    </View>
  );
}

function Step3_Address({
  wilaya,
  onWilayaChange,
  city,
  onCityChange,
  street,
  onStreetChange,
}: {
  wilaya: string;
  onWilayaChange: (v: string) => void;
  city: string;
  onCityChange: (v: string) => void;
  street: string;
  onStreetChange: (v: string) => void;
}) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Location & Address</Text>
      <Text style={styles.stepSub}>Where is your business located?</Text>
      <FormField label="Street Address" placeholder="123 Rue Didouche Mourad" value={street} onChange={onStreetChange} icon="map-pin-outline" />
      <FormField label="City / Town" placeholder="Constantine" value={city} onChange={onCityChange} icon="location-outline" />

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Wilaya <Text style={styles.required}>*</Text></Text>
        <View style={styles.wilayaGrid}>
          {WILAYAS.slice(0, 20).map((w) => (
            <Pressable
              key={w}
              style={[styles.wilayaChip, wilaya === w && styles.wilayaChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onWilayaChange(w);
              }}
            >
              <Text style={[styles.wilayaChipText, wilaya === w && styles.wilayaChipTextActive]}>
                {w}
              </Text>
            </Pressable>
          ))}
        </View>
        {wilaya && (
          <Text style={styles.wilayaSelected}>Selected: {wilaya}</Text>
        )}
      </View>
    </View>
  );
}

function Step4_GPS({ lat, lng, onLocationPick }: { lat: string; lng: string; onLocationPick: () => void }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>GPS Location</Text>
      <Text style={styles.stepSub}>Pin your exact business location on the map.</Text>

      <TouchableOpacity style={styles.mapPickerCard} onPress={onLocationPick} activeOpacity={0.8}>
        {lat && lng ? (
          <View style={styles.mapPicked}>
            <Ionicons name="checkmark-circle" size={48} color={SAHEL.accent} />
            <Text style={styles.mapPickedTitle}>Location Pinned</Text>
            <Text style={styles.mapPickedCoords}>{lat}, {lng}</Text>
            <Text style={styles.mapPickedHint}>Tap to change location</Text>
          </View>
        ) : (
          <View style={styles.mapEmpty}>
            <View style={styles.mapEmptyIcon}>
              <Ionicons name="map-outline" size={32} color={SAHEL.primary} />
            </View>
            <Text style={styles.mapEmptyTitle}>Pick Location on Map</Text>
            <Text style={styles.mapEmptySub}>Tap here to open the map and pin your business</Text>
            <View style={styles.mapEmptyBtn}>
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.mapEmptyBtnText}>Open Map</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.gpsInfoCard}>
        <Ionicons name="information-circle-outline" size={16} color="#3B82F6" />
        <Text style={styles.gpsInfoText}>
          GPS coordinates help travelers find your exact location and enable map-based discovery.
        </Text>
      </View>
    </View>
  );
}

function Step5_Documents({
  nationalIdUri,
  onNationalId,
  commercialRegUri,
  onCommercialReg,
  taxInfoUri,
  onTaxInfo,
}: {
  nationalIdUri: string | null;
  onNationalId: (uri: string) => void;
  commercialRegUri: string | null;
  onCommercialReg: (uri: string) => void;
  taxInfoUri: string | null;
  onTaxInfo: (uri: string) => void;
}) {
  const pickImage = async (onPick: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled) onPick(result.assets[0].uri);
  };

  const docs = [
    {
      title: 'National ID',
      sub: 'Front & back of your national identity card',
      uri: nationalIdUri,
      onPick: () => pickImage(onNationalId),
      required: true,
    },
    {
      title: 'Commercial Register',
      sub: 'Official business registration document',
      uri: commercialRegUri,
      onPick: () => pickImage(onCommercialReg),
      required: true,
    },
    {
      title: 'Tax Information',
      sub: 'NIF / NIS tax registration document',
      uri: taxInfoUri,
      onPick: () => pickImage(onTaxInfo),
      required: false,
    },
  ];

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identity Verification</Text>
      <Text style={styles.stepSub}>Upload official documents to verify your business.</Text>
      {docs.map((doc) => (
        <TouchableOpacity key={doc.title} style={styles.uploadCard} onPress={doc.onPick} activeOpacity={0.85}>
          {doc.uri ? (
            <View style={styles.uploadDone}>
              <Image source={{ uri: doc.uri }} style={styles.uploadPreview} resizeMode="cover" />
              <View style={styles.uploadDoneOverlay}>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.uploadDoneText}>Uploaded</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploadEmpty}>
              <View style={styles.uploadIconWrap}>
                <Ionicons name="cloud-upload-outline" size={24} color={SAHEL.primary} />
              </View>
              <Text style={styles.uploadTitle}>{doc.title} {doc.required && <Text style={styles.required}>*</Text>}</Text>
              <Text style={styles.uploadSub}>{doc.sub}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Step6_Brand({
  logoUri,
  onLogo,
  coverUri,
  onCover,
}: {
  logoUri: string | null;
  onLogo: (uri: string) => void;
  coverUri: string | null;
  onCover: (uri: string) => void;
}) {
  const pickImage = async (onPick: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) onPick(result.assets[0].uri);
  };

  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Brand Assets</Text>
      <Text style={styles.stepSub}>Add your logo and cover photo to make your listing stand out.</Text>

      {/* Logo */}
      <TouchableOpacity style={styles.brandCard} onPress={() => pickImage(onLogo)} activeOpacity={0.85}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.logoPreview} resizeMode="cover" />
        ) : (
          <View style={styles.brandEmpty}>
            <View style={styles.brandIconWrap}>
              <Ionicons name="image-outline" size={28} color={SAHEL.primary} />
            </View>
            <Text style={styles.brandLabel}>Upload Logo</Text>
            <Text style={styles.brandSub}>Square image, at least 400×400px</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Cover */}
      <TouchableOpacity style={styles.brandCardCover} onPress={() => pickImage(onCover)} activeOpacity={0.85}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverPreview} resizeMode="cover" />
        ) : (
          <View style={styles.brandEmptyCover}>
            <Ionicons name="image-outline" size={28} color={SAHEL.primary} />
            <Text style={styles.brandLabel}>Upload Cover Photo</Text>
            <Text style={styles.brandSub}>Landscape image, at least 1200×630px</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Ionicons name="bulb-outline" size={16} color={SAHEL.accent} />
        <Text style={styles.infoCardText}>
          Great photos increase bookings by 40%. Use high-quality images that showcase your business.
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function KycBusiness6Step() {
  const insets = useSafeAreaInsets();
  const { submitKyc } = useApp();
  const scrollRef = useRef<ScrollView>(null);

  // Wizard state
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form data
  const [businessType, setBusinessType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [nationalIdUri, setNationalIdUri] = useState<string | null>(null);
  const [commercialRegUri, setCommercialRegUri] = useState<string | null>(null);
  const [taxInfoUri, setTaxInfoUri] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return !!businessType;
      case 1: return !!businessName.trim() && !!phone.trim();
      case 2: return !!wilaya;
      case 3: return true; // GPS is optional for now
      case 4: return !!nationalIdUri; // National ID required
      case 5: return true; // Brand assets are optional
      default: return false;
    }
  }, [step, businessType, businessName, phone, wilaya, nationalIdUri]);

  const goNext = () => {
    if (!canProceed()) {
      Alert.alert('Missing Info', 'Please fill in the required fields.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const goBack = () => {
    if (step > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: KycData = {
        fullName: businessName,
        phone,
        businessName,
        businessType: MARKETPLACE_CATEGORIES.find((c) => c.key === businessType)?.label || businessType,
        tradeRegisterUri: commercialRegUri ?? undefined,
      };
      await submitKyc(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('KYC submitted! We will review within 24–48 hours.', 'success');
      router.replace('/onboarding/kyc-pending');
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
    setLoading(false);
  };

  const handleLocationPick = () => {
    // Simulate GPS pick — in production this would open a MapView picker
    setGpsLat('36.3650');
    setGpsLng('6.6147');
    showToast('Location pinned (demo coordinates)', 'success');
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { paddingTop: insets.top }]}
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={22} color={SAHEL.dark} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>Step {step + 1} of {STEPS.length}</Text>
          <Text style={styles.headerTitle}>{STEPS[step].label}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <StepIndicator current={step} total={STEPS.length} />

      {/* ── CONTENT ── */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && <Step1_BusinessType value={businessType} onChange={setBusinessType} />}
        {step === 1 && (
          <Step2_Info
            businessName={businessName} onNameChange={setBusinessName}
            description={description} onDescChange={setDescription}
            phone={phone} onPhoneChange={setPhone}
            email={email} onEmailChange={setEmail}
            website={website} onWebsiteChange={setWebsite}
          />
        )}
        {step === 2 && (
          <Step3_Address
            wilaya={wilaya} onWilayaChange={setWilaya}
            city={city} onCityChange={setCity}
            street={street} onStreetChange={setStreet}
          />
        )}
        {step === 3 && <Step4_GPS lat={gpsLat} lng={gpsLng} onLocationPick={handleLocationPick} />}
        {step === 4 && (
          <Step5_Documents
            nationalIdUri={nationalIdUri} onNationalId={setNationalIdUri}
            commercialRegUri={commercialRegUri} onCommercialReg={setCommercialRegUri}
            taxInfoUri={taxInfoUri} onTaxInfo={setTaxInfoUri}
          />
        )}
        {step === 5 && (
          <Step6_Brand logoUri={logoUri} onLogo={setLogoUri} coverUri={coverUri} onCover={setCoverUri} />
        )}
      </ScrollView>

      {/* ── FOOTER ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {isLastStep ? (
          <Pressable
            style={[styles.submitBtn, !canProceed() && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading || !canProceed()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit for Review</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={[styles.nextBtn, !canProceed() && { opacity: 0.5 }]}
            onPress={goNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerStep: { fontSize: 11, fontFamily: 'mon-sb', color: '#94A3B8', letterSpacing: 0.5 },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginTop: 1 },

  // Step indicator
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 16, gap: 0 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E2E8F0' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 4 },

  scroll: { padding: 24, gap: 14 },

  // Step content
  stepContent: { gap: 14 },
  stepTitle: { fontSize: 22, fontFamily: 'mon-b', color: SAHEL.dark, letterSpacing: -0.3 },
  stepSub: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 20 },

  // Business type grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  typeCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 6,
    position: 'relative',
  },
  typeCardActive: { borderColor: SAHEL.accent, backgroundColor: '#F0FDFA' },
  typeIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 13, fontFamily: 'mon-sb', color: '#334155' },
  typeDesc: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', lineHeight: 15 },
  typeCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  // Form fields
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },
  required: { color: '#EF4444' },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  fieldBoxMultiline: { height: 100, alignItems: 'flex-start', paddingTop: 12 },
  fieldIcon: { marginRight: 10 },
  fieldInput: { flex: 1, fontSize: 15, fontFamily: 'mon', color: '#1E293B' },
  fieldInputMultiline: { flex: 1, fontSize: 14, fontFamily: 'mon', color: '#1E293B', lineHeight: 20 },

  // Wilaya chips
  wilayaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  wilayaChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  wilayaChipActive: { backgroundColor: SAHEL.primary, borderColor: SAHEL.primary },
  wilayaChipText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },
  wilayaChipTextActive: { color: '#FFFFFF' },
  wilayaSelected: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.accent, marginTop: 4 },

  // GPS map picker
  mapPickerCard: {
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
    minHeight: 200,
  },
  mapEmpty: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  mapEmptyIcon: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  mapEmptyTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  mapEmptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  mapEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SAHEL.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  mapEmptyBtnText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  mapPicked: { alignItems: 'center', padding: 24, gap: 6 },
  mapPickedTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  mapPickedCoords: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText },
  mapPickedHint: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', marginTop: 4 },

  // Upload cards
  uploadCard: {
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  uploadEmpty: { alignItems: 'center', padding: 24, gap: 8 },
  uploadIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  uploadSub: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  uploadDone: { height: 140, position: 'relative' },
  uploadPreview: { width: '100%', height: '100%' },
  uploadDoneOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  uploadDoneText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },

  // Brand assets
  brandCard: { height: 120, borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FAFAFA' },
  brandCardCover: { height: 160, borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FAFAFA', marginTop: 4 },
  brandEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  brandEmptyCover: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  brandIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  brandLabel: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  brandSub: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8' },
  logoPreview: { width: '100%', height: '100%' },
  coverPreview: { width: '100%', height: '100%' },

  // Info cards
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 },
  infoCardText: { flex: 1, fontSize: 13, fontFamily: 'mon', color: '#166534', lineHeight: 18 },
  gpsInfoCard: { flexDirection: 'row', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14 },
  gpsInfoText: { flex: 1, fontSize: 13, fontFamily: 'mon', color: '#1E40AF', lineHeight: 18 },

  // Footer
  footer: { paddingHorizontal: 24, paddingTop: 14, backgroundColor: '#FFFFFF', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E2E8F0' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: SAHEL.primary, height: 52, borderRadius: 12,
  },
  nextText: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },
  submitBtn: { backgroundColor: SAHEL.accent, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF' },
});
