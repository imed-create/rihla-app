/**
 * RIHLA — Multi-Step Hotel Creation Funnel
 * ─────────────────────────────────────────
 * PROMPTFULL §Step 3: Premium multi-step listing creation.
 *
 * Step 1: Core Details    — Hotel name, star rating, description, contact info
 * Step 2: Location Mapping — Wilaya, city, address, GPS coordinates
 * Step 3: Visual Assets    — Multi-photo uploader for exterior & shared spaces
 * Step 4: Inventory Setup  — Room categories, pricing, capacity, amenities, facilities
 *
 * On publish: creates the HOTEL listing + individual ROOM assets.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { showToast } from '@/components/Toast';

// ── CONSTANTS ─────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Core Details',   icon: 'document-text-outline', color: '#1A6B3A' },
  { id: 2, label: 'Location',       icon: 'location-outline',      color: '#3B82F6' },
  { id: 3, label: 'Photos',         icon: 'images-outline',        color: '#8B5CF6' },
  { id: 4, label: 'Rooms & Extras', icon: 'bed-outline',           color: '#F59E0B' },
];

const STAR_RATINGS = [1, 2, 3, 4, 5];
const HOTEL_CATEGORIES = ['3-Star Hotel', '4-Star Hotel', '5-Star Hotel', 'Luxury Resort', 'Boutique Hotel', 'Guest House', 'Eco-Lodge', 'Riad / Dar'];

const FACILITIES = ['Pool', 'Restaurant', 'Gym', 'Spa', 'Parking', 'Free WiFi', 'Airport Shuttle', 'Room Service', 'Bar/Lounge', 'Conference Room', 'Kids Club', 'Beach Access', '24hr Front Desk', 'Laundry', 'Concierge'];
const LANGUAGES = ['Arabic', 'French', 'English', 'Spanish', 'Italian', 'German', 'Turkish'];
const BED_TYPES = ['Single Bed', 'Double Bed', 'Queen Bed', 'King Bed', 'Twin Beds', 'Bunk Beds', 'Sofa Bed'];

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Bejaia', 'Biskra',
  'Bechar', 'Blida', 'Bouira', 'Tamanrasset', 'Tebessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Setif', 'Saida', 'Skikda',
  'Sidi Bel Abbes', 'Annaba', 'Guelma', 'Constantine', 'Medea', 'Mostaganem',
  'Msila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj',
  'Boumerdes', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Ain Defla', 'Naama', 'Ain Temouchent',
  'Ghardaia', 'Relizane',
];

// ── ROOM TYPE TEMPLATE ────────────────────────────────────────

interface RoomInput {
  id: string;
  name: string;
  bedType: string;
  capacity: string;
  price: string;
  quantity: string;
  amenities: string[];
}

function createRoom(): RoomInput {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: '',
    bedType: 'Double Bed',
    capacity: '2',
    price: '',
    quantity: '1',
    amenities: ['WiFi', 'AC', 'TV'],
  };
}

const ROOM_AMENITIES = ['WiFi', 'AC', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Sea View', 'Bathtub', 'Kitchenette', 'Sofa', 'Desk', 'Soundproof'];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CreateHotelItem() {
  const { addAsset } = useBusinessAssets();
  const scrollRef = useRef<ScrollView>(null);

  // Wizard state
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Core Details ──
  const [name, setName] = useState('');
  const [hotelCategory, setHotelCategory] = useState('4-Star Hotel');
  const [starRating, setStarRating] = useState(4);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState('14:00');
  const [checkOut, setCheckOut] = useState('11:00');

  // ── Step 2: Location ──
  const [wilaya, setWilaya] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');

  // ── Step 3: Photos ──
  const [images, setImages] = useState<string[]>([]);

  // ── Step 4: Rooms & Extras ──
  const [rooms, setRooms] = useState<RoomInput[]>([createRoom()]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['Free WiFi', 'Parking', 'Restaurant']);
  const [spokenLangs, setSpokenLangs] = useState<string[]>(['Arabic', 'French', 'English']);
  const [hasBreakfast, setHasBreakfast] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState('Free 24h');

  // ── Validation ──
  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return name.trim().length >= 2;
      case 1: return !!wilaya;
      case 2: return true; // Photos optional
      case 3: return rooms.some(r => r.name.trim() && Number(r.price) > 0);
      default: return false;
    }
  }, [step, name, wilaya, rooms]);

  // ── Navigation ──
  const goNext = () => {
    if (!canProceed()) {
      Alert.alert('Missing Info', 'Please fill in the required fields to continue.');
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

  // ── Image Picker ──
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (uri: string) => setImages(prev => prev.filter(u => u !== uri));

  // ── Room Management ──
  const updateRoom = (id: string, field: keyof RoomInput, value: string) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const toggleRoomAmenity = (id: string, amenity: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== id) return r;
      const has = r.amenities.includes(amenity);
      return { ...r, amenities: has ? r.amenities.filter(a => a !== amenity) : [...r.amenities, amenity] };
    }));
  };

  const addRoom = () => setRooms(prev => [...prev, createRoom()]);
  const removeRoom = (id: string) => {
    if (rooms.length <= 1) return;
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  // ── Toggle helpers ──
  const toggleFacility = (item: string) => {
    Haptics.selectionAsync();
    setSelectedFacilities(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  const toggleLang = (item: string) => {
    Haptics.selectionAsync();
    setSpokenLangs(prev =>
      prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]
    );
  };

  // ── GPS Picker ──
  const handlePickLocation = () => {
    // Simulated — in production opens MapView
    setGpsLat('36.3650');
    setGpsLng('6.6147');
    showToast('📍 Location pinned (demo)', 'success');
  };

  // ── Publish ──
  const handlePublish = () => {
    if (!canProceed()) {
      Alert.alert('Missing Info', 'Please add at least one room with a name and price.');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Create the HOTEL listing
    addAsset({
      businessType: 'hotel',
      assetKind: 'listing',
      name: name.trim(),
      priceDZD: Number(rooms[0]?.price || 0),
      available: true,
      description: description.trim(),
      fields: {
        type: 'hotel',
        hotelCategory,
        starRating,
        checkIn,
        checkOut,
        wilaya: wilaya.trim(),
        city: city.trim(),
        address: address.trim(),
        gpsLat,
        gpsLng,
        phone: phone.trim(),
        email: email.trim(),
        facilities: selectedFacilities,
        languages: spokenLangs,
        hasBreakfast,
        cancellationPolicy,
        images,
        roomCount: rooms.length,
        totalUnits: rooms.reduce((sum, r) => sum + Number(r.quantity || 1), 0),
      },
    });

    // Create each ROOM as a separate asset
    rooms.forEach(room => {
      if (!room.name.trim() || Number(room.price) <= 0) return;
      const qty = Number(room.quantity || 1);
      for (let i = 0; i < qty; i++) {
        addAsset({
          businessType: 'hotel',
          assetKind: 'room',
          name: `${room.name.trim()}${qty > 1 ? ` #${i + 1}` : ''}`,
          priceDZD: Number(room.price),
          available: true,
          description: `${room.bedType} · Up to ${room.capacity} guests`,
          fields: {
            roomType: room.name.trim(),
            bedType: room.bedType,
            capacity: Number(room.capacity || 2),
            amenities: room.amenities,
            pricePerNight: Number(room.price),
            parentHotel: name.trim(),
          },
        });
      }
    });

    setLoading(false);
    showToast(`🏨 ${name.trim()} published with ${rooms.length} room types!`, 'success');
    router.back();
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerStep}>Step {step + 1} of {STEPS.length}</Text>
            <Text style={styles.headerTitle}>{STEPS[step].label}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* ── STEP INDICATOR ── */}
        <View style={styles.stepIndicator}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <View
                style={[
                  styles.stepDot,
                  i < step && { backgroundColor: s.color },
                  i === step && { backgroundColor: s.color, width: 28, borderRadius: 8 },
                  i > step && { backgroundColor: '#E2E8F0' },
                ]}
              />
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < step && { backgroundColor: STEPS[i].color }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ── CONTENT ── */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <Step1_CoreDetails
              name={name} onNameChange={setName}
              hotelCategory={hotelCategory} onCategoryChange={setHotelCategory}
              starRating={starRating} onStarChange={setStarRating}
              description={description} onDescChange={setDescription}
              phone={phone} onPhoneChange={setPhone}
              email={email} onEmailChange={setEmail}
              checkIn={checkIn} onCheckInChange={setCheckIn}
              checkOut={checkOut} onCheckOutChange={setCheckOut}
            />
          )}

          {step === 1 && (
            <Step2_Location
              wilaya={wilaya} onWilayaChange={setWilaya}
              city={city} onCityChange={setCity}
              address={address} onAddressChange={setAddress}
              gpsLat={gpsLat} gpsLng={gpsLng} onPickLocation={handlePickLocation}
            />
          )}

          {step === 2 && (
            <Step3_Photos
              images={images} onPickImages={pickImage} onRemoveImage={removeImage}
            />
          )}

          {step === 3 && (
            <Step4_Inventory
              rooms={rooms}
              updateRoom={updateRoom}
              toggleRoomAmenity={toggleRoomAmenity}
              addRoom={addRoom}
              removeRoom={removeRoom}
              selectedFacilities={selectedFacilities}
              toggleFacility={toggleFacility}
              spokenLangs={spokenLangs}
              toggleLang={toggleLang}
              hasBreakfast={hasBreakfast}
              setHasBreakfast={setHasBreakfast}
              cancellationPolicy={cancellationPolicy}
              setCancellationPolicy={setCancellationPolicy}
            />
          )}
        </ScrollView>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          {isLastStep ? (
            <TouchableOpacity
              style={[styles.publishBtn, !canProceed() && { opacity: 0.5 }]}
              onPress={handlePublish}
              disabled={loading || !canProceed()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.publishText}>Publish Hotel Listing</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, !canProceed() && { opacity: 0.5 }]}
              onPress={goNext}
              disabled={!canProceed()}
            >
              <Text style={styles.nextText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1: CORE DETAILS
// ═══════════════════════════════════════════════════════════════

function Step1_CoreDetails({
  name, onNameChange,
  hotelCategory, onCategoryChange,
  starRating, onStarChange,
  description, onDescChange,
  phone, onPhoneChange,
  email, onEmailChange,
  checkIn, onCheckInChange,
  checkOut, onCheckOutChange,
}: {
  name: string; onNameChange: (v: string) => void;
  hotelCategory: string; onCategoryChange: (v: string) => void;
  starRating: number; onStarChange: (v: number) => void;
  description: string; onDescChange: (v: string) => void;
  phone: string; onPhoneChange: (v: string) => void;
  email: string; onEmailChange: (v: string) => void;
  checkIn: string; onCheckInChange: (v: string) => void;
  checkOut: string; onCheckOutChange: (v: string) => void;
}) {
  return (
    <View style={s.step}>
      <Text style={s.stepIcon}>📋</Text>
      <Text style={s.stepTitle}>Core Details</Text>
      <Text style={s.stepSub}>Tell travelers about your hotel.</Text>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Hotel Name <Text style={s.required}>*</Text></Text>
        <TextInput style={s.input} value={name} onChangeText={onNameChange} placeholder="e.g. Hotel El Djazair" placeholderTextColor="#94A3B8" />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipScroll}>
          {HOTEL_CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[s.chip, hotelCategory === c && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
              onPress={() => { Haptics.selectionAsync(); onCategoryChange(c); }}
            >
              <Text style={[s.chipText, hotelCategory === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Star Rating</Text>
        <View style={s.starRow}>
          {STAR_RATINGS.map(sr => (
            <TouchableOpacity key={sr} onPress={() => { Haptics.selectionAsync(); onStarChange(sr); }}>
              <Ionicons name={sr <= starRating ? 'star' : 'star-outline'} size={30} color={sr <= starRating ? '#F59E0B' : '#D1D5DB'} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Description</Text>
        <TextInput style={[s.input, s.textarea]} value={description} onChangeText={onDescChange}
          placeholder="Describe your hotel — location, atmosphere, what makes it special..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />
      </View>

      <View style={s.row}>
        <View style={s.half}>
          <Text style={s.fieldLabel}>Phone</Text>
          <TextInput style={s.input} value={phone} onChangeText={onPhoneChange} placeholder="+213 5XX XXX XXX" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />
        </View>
        <View style={s.half}>
          <Text style={s.fieldLabel}>Email</Text>
          <TextInput style={s.input} value={email} onChangeText={onEmailChange} placeholder="hotel@example.dz" placeholderTextColor="#94A3B8" keyboardType="email-address" />
        </View>
      </View>

      <View style={s.row}>
        <View style={s.half}>
          <Text style={s.fieldLabel}>Check-in Time</Text>
          <TextInput style={s.input} value={checkIn} onChangeText={onCheckInChange} placeholder="14:00" placeholderTextColor="#94A3B8" />
        </View>
        <View style={s.half}>
          <Text style={s.fieldLabel}>Check-out Time</Text>
          <TextInput style={s.input} value={checkOut} onChangeText={onCheckOutChange} placeholder="11:00" placeholderTextColor="#94A3B8" />
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2: LOCATION MAPPING
// ═══════════════════════════════════════════════════════════════

function Step2_Location({
  wilaya, onWilayaChange,
  city, onCityChange,
  address, onAddressChange,
  gpsLat, gpsLng, onPickLocation,
}: {
  wilaya: string; onWilayaChange: (v: string) => void;
  city: string; onCityChange: (v: string) => void;
  address: string; onAddressChange: (v: string) => void;
  gpsLat: string; gpsLng: string; onPickLocation: () => void;
}) {
  return (
    <View style={s.step}>
      <Text style={s.stepIcon}>📍</Text>
      <Text style={s.stepTitle}>Location Mapping</Text>
      <Text style={s.stepSub}>Where is your hotel located?</Text>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Wilaya <Text style={s.required}>*</Text></Text>
        <View style={s.wilayaGrid}>
          {WILAYAS.slice(0, 20).map(w => (
            <TouchableOpacity
              key={w}
              style={[s.wilayaChip, wilaya === w && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
              onPress={() => { Haptics.selectionAsync(); onWilayaChange(w); }}
            >
              <Text style={[s.wilayaText, wilaya === w && { color: '#fff' }]}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>City / Town</Text>
        <TextInput style={s.input} value={city} onChangeText={onCityChange} placeholder="e.g. Constantine" placeholderTextColor="#94A3B8" />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Street Address</Text>
        <TextInput style={s.input} value={address} onChangeText={onAddressChange} placeholder="123 Rue Didouche Mourad" placeholderTextColor="#94A3B8" />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>GPS Coordinates</Text>
        <TouchableOpacity style={s.gpsCard} onPress={onPickLocation} activeOpacity={0.8}>
          <Ionicons name="map-outline" size={24} color={gpsLat ? '#1A6B3A' : '#94A3B8'} />
          {gpsLat ? (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={s.gpsText}>{gpsLat}, {gpsLng}</Text>
              <Text style={s.gpsHint}>Tap to change</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Text style={s.gpsLabel}>Pin your location on the map</Text>
              <Text style={s.gpsHint}>Helps travelers find you</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3: VISUAL ASSETS
// ═══════════════════════════════════════════════════════════════

function Step3_Photos({
  images, onPickImages, onRemoveImage,
}: {
  images: string[]; onPickImages: () => void; onRemoveImage: (uri: string) => void;
}) {
  return (
    <View style={s.step}>
      <Text style={s.stepIcon}>📸</Text>
      <Text style={s.stepTitle}>Visual Assets</Text>
      <Text style={s.stepSub}>Upload high-quality photos of your hotel exterior and shared spaces.</Text>

      {/* Photo grid */}
      <View style={s.photoGrid}>
        {images.map((uri, i) => (
          <View key={i} style={s.photoCell}>
            <Image source={{ uri }} style={s.photoPreview} />
            <TouchableOpacity style={s.photoRemove} onPress={() => onRemoveImage(uri)}>
              <Ionicons name="close-circle" size={22} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={s.photoAdd} onPress={onPickImages}>
          <Ionicons name="camera-outline" size={28} color="#1A6B3A" />
          <Text style={s.photoAddText}>Add Photos</Text>
        </TouchableOpacity>
      </View>

      <View style={s.infoCard}>
        <Ionicons name="bulb-outline" size={16} color="#1A6B3A" />
        <Text style={s.infoText}>
          Hotels with 10+ photos get 40% more bookings. Include exterior, lobby, rooms, and amenities.
        </Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 4: INVENTORY SETUP
// ═══════════════════════════════════════════════════════════════

function Step4_Inventory({
  rooms, updateRoom, toggleRoomAmenity, addRoom, removeRoom,
  selectedFacilities, toggleFacility,
  spokenLangs, toggleLang,
  hasBreakfast, setHasBreakfast,
  cancellationPolicy, setCancellationPolicy,
}: {
  rooms: RoomInput[];
  updateRoom: (id: string, field: keyof RoomInput, value: string) => void;
  toggleRoomAmenity: (id: string, amenity: string) => void;
  addRoom: () => void;
  removeRoom: (id: string) => void;
  selectedFacilities: string[];
  toggleFacility: (f: string) => void;
  spokenLangs: string[];
  toggleLang: (l: string) => void;
  hasBreakfast: boolean;
  setHasBreakfast: (v: boolean) => void;
  cancellationPolicy: string;
  setCancellationPolicy: (v: string) => void;
}) {
  return (
    <View style={s.step}>
      <Text style={s.stepIcon}>🏨</Text>
      <Text style={s.stepTitle}>Rooms & Amenities</Text>
      <Text style={s.stepSub}>Add room categories, set pricing, and configure amenities.</Text>

      {/* Room cards */}
      {rooms.map((room, idx) => (
        <View key={room.id} style={s.roomCard}>
          <View style={s.roomCardHeader}>
            <View style={s.roomCardBadge}>
              <Text style={s.roomCardBadgeText}>Room {idx + 1}</Text>
            </View>
            {rooms.length > 1 && (
              <TouchableOpacity onPress={() => removeRoom(room.id)}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          <TextInput style={s.input} value={room.name} onChangeText={(v) => updateRoom(room.id, 'name', v)}
            placeholder="Room type name * (e.g. Deluxe Double)" placeholderTextColor="#94A3B8" />

          <View style={s.row}>
            <View style={s.half}>
              <Text style={s.fieldLabel}>Bed Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipScroll}>
                {BED_TYPES.map(b => (
                  <TouchableOpacity key={b}
                    style={[s.miniChip, room.bedType === b && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
                    onPress={() => { Haptics.selectionAsync(); updateRoom(room.id, 'bedType', b); }}>
                    <Text style={[s.miniChipText, room.bedType === b && { color: '#fff' }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={s.row}>
            <View style={s.half}>
              <Text style={s.fieldLabel}>Capacity</Text>
              <TextInput style={s.input} value={room.capacity} onChangeText={(v) => updateRoom(room.id, 'capacity', v)}
                keyboardType="number-pad" placeholder="2" placeholderTextColor="#94A3B8" />
            </View>
            <View style={s.half}>
              <Text style={s.fieldLabel}>Price/night (DZD) *</Text>
              <TextInput style={s.input} value={room.price} onChangeText={(v) => updateRoom(room.id, 'price', v)}
                keyboardType="number-pad" placeholder="7500" placeholderTextColor="#94A3B8" />
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.fieldLabel}>Quantity Available</Text>
            <TextInput style={s.input} value={room.quantity} onChangeText={(v) => updateRoom(room.id, 'quantity', v)}
              keyboardType="number-pad" placeholder="5" placeholderTextColor="#94A3B8" />
          </View>

          <Text style={s.fieldLabel}>Room Amenities</Text>
          <View style={s.amenityGrid}>
            {ROOM_AMENITIES.map(a => (
              <TouchableOpacity key={a}
                style={[s.miniChip, room.amenities.includes(a) && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
                onPress={() => { Haptics.selectionAsync(); toggleRoomAmenity(room.id, a); }}>
                <Ionicons name={room.amenities.includes(a) ? 'checkmark-circle' : 'add-circle-outline'} size={12}
                  color={room.amenities.includes(a) ? '#fff' : '#94A3B8'} />
                <Text style={[s.miniChipText, room.amenities.includes(a) && { color: '#fff' }]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Add room button */}
      <TouchableOpacity style={s.addRoomBtn} onPress={addRoom}>
        <Ionicons name="add-circle-outline" size={20} color="#1A6B3A" />
        <Text style={s.addRoomText}>Add Another Room Type</Text>
      </TouchableOpacity>

      {/* Hotel facilities */}
      <Text style={[s.sectionLabel, { marginTop: 16 }]}>Hotel Facilities</Text>
      <View style={s.chipGrid}>
        {FACILITIES.map(f => (
          <TouchableOpacity key={f}
            style={[s.chip, selectedFacilities.includes(f) && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
            onPress={() => toggleFacility(f)}>
            <Text style={[s.chipText, selectedFacilities.includes(f) && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionLabel}>Languages Spoken</Text>
      <View style={s.chipGrid}>
        {LANGUAGES.map(l => (
          <TouchableOpacity key={l}
            style={[s.chip, spokenLangs.includes(l) && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
            onPress={() => toggleLang(l)}>
            <Text style={[s.chipText, spokenLangs.includes(l) && { color: '#fff' }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Toggles */}
      <TouchableOpacity style={s.toggleRow}
        onPress={() => { Haptics.selectionAsync(); setHasBreakfast(!hasBreakfast); }}>
        <Ionicons name={hasBreakfast ? 'checkmark-circle' : 'close-circle-outline'} size={22}
          color={hasBreakfast ? '#10B981' : '#94A3B8'} />
        <Text style={[s.toggleText, hasBreakfast && { color: '#059669' }]}>Breakfast Included</Text>
      </TouchableOpacity>

      <View style={s.fieldGroup}>
        <Text style={s.sectionLabel}>Cancellation Policy</Text>
        <View style={s.chipRow}>
          {['Free 24h', 'Free 5 Days', 'Non-Refundable'].map(c => (
            <TouchableOpacity key={c}
              style={[s.chip, cancellationPolicy === c && { backgroundColor: '#1A6B3A', borderColor: '#1A6B3A' }]}
              onPress={() => { Haptics.selectionAsync(); setCancellationPolicy(c); }}>
              <Text style={[s.chipText, cancellationPolicy === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Styles ──
const s = StyleSheet.create({
  step: { padding: 20, gap: 14 },
  stepIcon: { fontSize: 32 },
  stepTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A', letterSpacing: -0.3 },
  stepSub: { fontSize: 13, fontFamily: 'mon', color: '#64748B', marginTop: -8, lineHeight: 19 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  required: { color: '#EF4444' },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', fontFamily: 'mon-sb', color: '#0F172A', fontSize: 14 },
  textarea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, gap: 6 },
  starRow: { flexDirection: 'row', gap: 4 },
  chipScroll: { gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  chipText: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Wilaya
  wilayaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wilayaChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  wilayaText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },

  // GPS
  gpsCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#1A6B3A33', borderStyle: 'dashed' },
  gpsLabel: { fontSize: 14, fontFamily: 'mon-sb', color: '#1A6B3A' },
  gpsText: { fontSize: 13, fontFamily: 'mon', color: '#1A6B3A' },
  gpsHint: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },

  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoCell: { width: '30%', aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoPreview: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 4, right: 4 },
  photoAdd: { width: '30%', aspectRatio: 4 / 3, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#1A6B3A', backgroundColor: '#E6F4EC', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoAddText: { fontSize: 11, fontFamily: 'mon-sb', color: '#1A6B3A' },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 },
  infoText: { flex: 1, fontSize: 12, fontFamily: 'mon', color: '#166534', lineHeight: 17 },

  // Rooms
  roomCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, gap: 10 },
  roomCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomCardBadge: { backgroundColor: '#1A6B3A' + '12', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roomCardBadgeText: { fontSize: 11, fontFamily: 'mon-b', color: '#1A6B3A' },
  sectionLabel: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A', marginBottom: 4 },
  miniChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  miniChipText: { fontSize: 10, fontFamily: 'mon-sb', color: '#6B7280' },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  addRoomBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#1A6B3A', backgroundColor: '#F0FDF4' },
  addRoomText: { fontSize: 13, fontFamily: 'mon-sb', color: '#1A6B3A' },

  // Toggles
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14 },
  toggleText: { fontSize: 13, fontFamily: 'mon-sb', color: '#6B7280' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerStep: { fontSize: 11, fontFamily: 'mon-sb', color: '#94A3B8', letterSpacing: 0.5 },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A', marginTop: 1 },

  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 14, backgroundColor: '#fff', gap: 0 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4 },

  scrollContent: { paddingBottom: 40 },

  footer: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A6B3A', height: 52, borderRadius: 14 },
  nextText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A6B3A', height: 52, borderRadius: 14 },
  publishText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
});
