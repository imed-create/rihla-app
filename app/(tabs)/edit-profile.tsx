/**
 * RIHLA — Edit Profile Screen (Uber Style)
 * ──────────────────────────────────────────
 * Full editable profile with sections: Personal Info, Travel Documents,
 * Emergency Contact, Travel Preferences, Notification Settings.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import type { TravelPreferences, EmergencyContact } from '@/types/app';

const BUDGET_OPTIONS = [
  { key: 'budget', label: 'Budget', icon: 'wallet-outline', desc: 'Under 5,000 DZD/day' },
  { key: 'mid-range', label: 'Mid-Range', icon: 'cash-outline', desc: '5,000 – 15,000 DZD/day' },
  { key: 'premium', label: 'Premium', icon: 'diamond-outline', desc: '15,000 – 30,000 DZD/day' },
  { key: 'luxury', label: 'Luxury', icon: 'star-outline', desc: '30,000+ DZD/day' },
] as const;

const ACCOMMODATION_OPTIONS = [
  { key: 'hotel', label: 'Hotels', icon: 'bed-outline' },
  { key: 'hostel', label: 'Hostels', icon: 'people-outline' },
  { key: 'rental', label: 'Rentals', icon: 'home-outline' },
  { key: 'camping', label: 'Camping', icon: 'leaf-outline' },
  { key: 'any', label: 'No preference', icon: 'help-circle-outline' },
] as const;

const TRAVEL_STYLES = [
  { key: 'solo', label: 'Solo', icon: 'person-outline' },
  { key: 'couple', label: 'Couple', icon: 'heart-outline' },
  { key: 'family', label: 'Family', icon: 'people-outline' },
  { key: 'group', label: 'Group', icon: 'people-circle-outline' },
  { key: 'any', label: 'Flexible', icon: 'help-circle-outline' },
] as const;

const INTEREST_OPTIONS = [
  'Beach & Sun', 'Desert Adventures', 'Mountain Hiking', 'History & Culture',
  'Food & Cuisine', 'Nightlife', 'Photography', 'Water Sports',
  'Shopping', 'Nature & Wildlife', 'Relaxation & Spa', 'Sports & Fitness',
];

const DIETARY_OPTIONS = ['None', 'Halal', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Allergies'];

const RELATIONSHIP_OPTIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

// ── Section Header ──
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: RIHLA.primary + '10' }]}>
        <Ionicons name={icon as any} size={18} color={RIHLA.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.sectionSub, { color: colors.muted }]}>{subtitle}</Text>}
      </View>
    </View>
  );
}

// ── Input Row ──
function InputRow({
  label, value, onChangeText, placeholder, keyboardType, icon, multiline,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any; icon?: string; multiline?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.muted }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }, multiline && { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
        {icon && <Ionicons name={icon as any} size={18} color={colors.muted} style={{ marginTop: multiline ? 2 : 0 }} />}
        <TextInput
          style={[styles.input, { color: colors.text }, multiline && { height: 60 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#CBD5E1"
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}

// ── Chip Selector ──
function ChipSelector<T extends string>({
  label, options, selected, onSelect, multi,
}: {
  label: string; options: readonly { key: T; label: string; icon?: string; desc?: string }[];
  selected: T | T[] | undefined; onSelect: (v: T) => void; multi?: boolean;
}) {
  const { colors } = useTheme();
  const isActive = (key: T) => multi
    ? Array.isArray(selected) && selected.includes(key)
    : selected === key;

  return (
    <View style={styles.chipSection}>
      <Text style={[styles.chipLabel, { color: colors.muted }]}>{label}</Text>
      <View style={styles.chipGrid}>
        {options.map((opt) => {
          const active = isActive(opt.key);
          return (
            <Pressable
              key={opt.key}
              style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, active && styles.chipActive]}
              onPress={() => { hapticLight(); onSelect(opt.key); }}
            >
              {opt.icon && (
                <Ionicons
                  name={opt.icon as any}
                  size={14}
                  color={active ? colors.text : colors.muted}
                />
              )}
              <Text style={[styles.chipText, { color: colors.muted }, active && { color: colors.text }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Toggle Row ──
function ToggleRow({ label, value, onValueChange, subtitle }: {
  label: string; value: boolean; onValueChange: (v: boolean) => void; subtitle?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.toggleSub, { color: colors.muted }]}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: RIHLA.accent + '60' }}
        thumbColor={value ? RIHLA.accent : colors.border}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

// ── Section Card (card with header + children) ──
function SectionCard({ icon, title, subtitle, children }: {
  icon: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.sectionCardHeader}>
        <Ionicons name={icon as any} size={18} color={RIHLA.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.cardSub, { color: colors.muted }]}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

// ── MAIN SCREEN ──
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const { colors } = useTheme();
  const topPad = Platform.OS === 'web' ? insets.top + 20 : insets.top;

  // Personal Info
  const [fullName, setFullName] = useState(user.kycData.fullName || user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [dob, setDob] = useState(user.dateOfBirth || '');
  const [gender, setGender] = useState(user.gender);
  const [bio, setBio] = useState(user.bio || '');

  // Location
  const [nationality, setNationality] = useState(user.nationality || user.kycData.nationality || '');
  const [wilaya, setWilaya] = useState(user.wilaya || '');
  const [address, setAddress] = useState(user.address || '');

  // Travel Documents
  const [passportNumber, setPassportNumber] = useState(user.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState(user.passportExpiry || '');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState(user.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user.emergencyContact?.phone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(user.emergencyContact?.relationship || '');

  // Travel Preferences
  const [budget, setBudget] = useState<TravelPreferences['budget']>(user.travelPreferences?.budget);
  const [accommodation, setAccommodation] = useState<TravelPreferences['accommodation']>(user.travelPreferences?.accommodation);
  const [travelStyle, setTravelStyle] = useState<TravelPreferences['travelStyle']>(user.travelPreferences?.travelStyle);
  const [interests, setInterests] = useState<string[]>(user.travelPreferences?.interests || []);
  const [dietary, setDietary] = useState<string[]>(user.travelPreferences?.dietaryRestrictions || []);

  // Notifications
  const [pushEnabled, setPushEnabled] = useState(user.notificationPrefs?.pushEnabled ?? true);
  const [emailEnabled, setEmailEnabled] = useState(user.notificationPrefs?.emailEnabled ?? false);
  const [bookingUpdates, setBookingUpdates] = useState(user.notificationPrefs?.bookingUpdates ?? true);
  const [promotions, setPromotions] = useState(user.notificationPrefs?.promotions ?? false);

  const toggleInterest = useCallback((interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }, []);

  const toggleDietary = useCallback((item: string) => {
    if (item === 'None') {
      setDietary([]);
      return;
    }
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  }, []);

  const handleSave = () => {
    hapticSuccess();
    updateUser({
      name: fullName,
      phone,
      email,
      dateOfBirth: dob,
      gender,
      bio,
      nationality,
      wilaya,
      address,
      passportNumber,
      passportExpiry,
      emergencyContact: emergencyName || emergencyPhone
        ? { name: emergencyName, phone: emergencyPhone, relationship: emergencyRelation }
        : undefined,
      travelPreferences: {
        budget,
        accommodation,
        travelStyle,
        interests,
        dietaryRestrictions: dietary,
        languagesSpoken: user.travelPreferences?.languagesSpoken,
      },
      notificationPrefs: { pushEnabled, emailEnabled, smsEnabled: false, bookingUpdates, promotions },
      kycData: { ...user.kycData, fullName, phone, nationality, wilaya },
    });
    Alert.alert('Profile Saved ✅', 'Your profile has been updated.');
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Uber Dark Header */}
      <View style={[styles.header, { backgroundColor: colors.bg, paddingTop: topPad + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={[styles.saveText, { color: colors.text }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* ── PERSONAL INFO ── */}
        <View style={styles.section}>
          <SectionHeader icon="person-outline" title="Personal Information" subtitle="Your basic details" />
          <InputRow label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter your full name" icon="person-outline" />
          <InputRow label="Phone" value={phone} onChangeText={setPhone} placeholder="+213 5XX XXX XXX" keyboardType="phone-pad" icon="call-outline" />
          <InputRow label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" icon="mail-outline" />
          <InputRow label="Date of Birth" value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" icon="calendar-outline" />

          <Text style={[styles.chipLabel, { color: colors.muted }]}>Gender</Text>
          <View style={styles.chipGrid}>
            {(['male', 'female', 'other', 'prefer-not-to-say'] as const).map((g) => (
              <Pressable
                key={g}
                style={[styles.chip, { backgroundColor: colors.card }, gender === g && styles.chipActive]}
                onPress={() => { hapticLight(); setGender(g); }}
              >
                <Text style={[styles.chipText, { color: colors.muted }, gender === g && { color: colors.text }]}>
                  {g === 'prefer-not-to-say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <InputRow label="Bio" value={bio} onChangeText={setBio} placeholder="Tell other travelers about yourself..." icon="chatbubble-outline" multiline />
        </View>

        {/* ── LOCATION ── */}
        <View style={styles.section}>
          <SectionHeader icon="location-outline" title="Location" subtitle="Where are you based?" />
          <InputRow label="Nationality" value={nationality} onChangeText={setNationality} placeholder="e.g. Algerian" icon="globe-outline" />
          <InputRow label="Wilaya" value={wilaya} onChangeText={setWilaya} placeholder="Select your wilaya" icon="map-outline" />
          <InputRow label="Address" value={address} onChangeText={setAddress} placeholder="Street address (optional)" icon="home-outline" />
        </View>

        {/* ── TRAVEL DOCUMENTS ── */}
        <View style={styles.section}>
          <SectionCard icon="card-outline" title="Travel Documents" subtitle="Passport & ID info for bookings">
            <InputRow label="Passport Number" value={passportNumber} onChangeText={setPassportNumber} placeholder="Optional" icon="card-outline" />
            <InputRow label="Passport Expiry" value={passportExpiry} onChangeText={setPassportExpiry} placeholder="YYYY-MM-DD" icon="calendar-outline" />
          </SectionCard>
        </View>

        {/* ── EMERGENCY CONTACT ── */}
        <View style={styles.section}>
          <SectionCard icon="alert-circle-outline" title="Emergency Contact" subtitle="Someone we can reach in case of emergency">
            <InputRow label="Contact Name" value={emergencyName} onChangeText={setEmergencyName} placeholder="Full name" icon="person-outline" />
            <InputRow label="Contact Phone" value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="+213 5XX XXX XXX" keyboardType="phone-pad" icon="call-outline" />
            <Text style={[styles.chipLabel, { color: colors.muted }]}>Relationship</Text>
            <View style={styles.chipGrid}>
              {RELATIONSHIP_OPTIONS.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.chip, { backgroundColor: colors.card }, emergencyRelation === r && styles.chipActive]}
                  onPress={() => { hapticLight(); setEmergencyRelation(r); }}
                >
                  <Text style={[styles.chipText, { color: colors.muted }, emergencyRelation === r && { color: colors.text }]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </SectionCard>
        </View>

        {/* ── TRAVEL PREFERENCES ── */}
        <View style={styles.section}>
          <SectionHeader icon="compass-outline" title="Travel Preferences" subtitle="Help us personalize your experience" />

          <ChipSelector
            label="Daily Budget"
            options={BUDGET_OPTIONS}
            selected={budget}
            onSelect={(v) => setBudget(v as any)}
          />

          <ChipSelector
            label="Preferred Accommodation"
            options={ACCOMMODATION_OPTIONS}
            selected={accommodation}
            onSelect={(v) => setAccommodation(v as any)}
          />

          <ChipSelector
            label="Travel Style"
            options={TRAVEL_STYLES}
            selected={travelStyle}
            onSelect={(v) => setTravelStyle(v as any)}
          />

          {/* Interests */}
          <Text style={[styles.chipLabel, { color: colors.muted }]}>Interests</Text>
          <View style={styles.chipGrid}>
            {INTEREST_OPTIONS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, active && { backgroundColor: RIHLA.accent, borderColor: RIHLA.accent }]}
                  onPress={() => { hapticLight(); toggleInterest(interest); }}
                >
                  <Text style={[styles.chipText, { color: colors.muted }, active && { color: colors.text }]}>{interest}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Dietary */}
          <Text style={[styles.chipLabel, { color: colors.muted, marginTop: 12 }]}>Dietary Restrictions</Text>
          <View style={styles.chipGrid}>
            {DIETARY_OPTIONS.map((item) => {
              const active = dietary.includes(item);
              return (
                <Pressable
                  key={item}
                  style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }, active && { backgroundColor: RIHLA.highlight, borderColor: RIHLA.highlight }]}
                  onPress={() => { hapticLight(); toggleDietary(item); }}
                >
                  <Text style={[styles.chipText, { color: colors.muted }, active && { color: colors.text }]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── NOTIFICATIONS ── */}
        <View style={styles.section}>
          <SectionHeader icon="notifications-outline" title="Notifications" subtitle="Choose what you want to hear about" />
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ToggleRow label="Push Notifications" value={pushEnabled} onValueChange={setPushEnabled} subtitle="Get alerts on your device" />
            <ToggleRow label="Email Notifications" value={emailEnabled} onValueChange={setEmailEnabled} subtitle="Receive updates via email" />
            <ToggleRow label="Booking Updates" value={bookingUpdates} onValueChange={setBookingUpdates} subtitle="Status changes for your bookings" />
            <ToggleRow label="Promotions & Deals" value={promotions} onValueChange={setPromotions} subtitle="Special offers and discounts" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: 8 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'mon-b', textAlign: 'center' },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    backgroundColor: RIHLA.accent,
  },
  saveText: { fontSize: 14, fontFamily: 'mon-b' },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b' },
  sectionSub: { fontSize: 12, fontFamily: 'mon', marginTop: 1 },

  // Inputs
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontFamily: 'mon-sb', marginBottom: 6, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14, height: 48,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'mon' },

  // Chips
  chipSection: { marginBottom: 12 },
  chipLabel: { fontSize: 12, fontFamily: 'mon-sb', marginBottom: 8, marginLeft: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  chipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  chipText: { fontSize: 13, fontFamily: 'mon-sb' },

  // Card
  card: {
    borderRadius: 14,
    borderWidth: 1, padding: 16,
  },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontFamily: 'mon-b' },
  cardSub: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },

  // Toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: { fontSize: 14, fontFamily: 'mon-sb' },
  toggleSub: { fontSize: 12, fontFamily: 'mon', marginTop: 1 },
});
