/**
 * RIHLA — Create Rental Business Listing
 * ────────────────────────────────────────
 * Creates the RENTAL PROPERTY PORTFOLIO listing that travelers see.
 * Asks: company name, property types, locations, fleet size, policies.
 * NOT an individual property — this is the rental business itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const PROPERTY_TYPES = ['Villas', 'Apartments', 'Riad/Houses', 'Studios', 'Eco-Lodges', 'Mountain Cabins', 'Beach Houses'];
const AMENITIES = ['WiFi', 'AC', 'Kitchen', 'Pool', 'Parking', 'Garden', 'Sea View', 'Mountain View', 'Generator', 'Security', 'Maid Service', 'Airport Transfer'];
const POLICIES = ['Flexible (free 24h)', 'Moderate (free 5 days)', 'Strict (free 30 days)'];

export default function CreateRentalItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [baseCity, setBaseCity] = useState(''); const [wilaya, setWilaya] = useState('');
  const [totalProperties, setTotalProperties] = useState('12'); const [propertyTypes, setPropertyTypes] = useState<string[]>(['Villas', 'Apartments']);
  const [priceRange, setPriceRange] = useState('8000 – 45000');
  const [cancellationPolicy, setCancellationPolicy] = useState('Moderate (free 5 days)');
  const [checkInDefault, setCheckInDefault] = useState('14:00'); const [checkOutDefault, setCheckOutDefault] = useState('11:00');
  const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['WiFi', 'AC', 'Kitchen', 'Parking']);
  const [hasInsurance, setHasInsurance] = useState(true); const [hasCleaning, setHasCleaning] = useState(true); const [hasPetFriendly, setHasPetFriendly] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'rental', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceRange.replace(/[^0-9]/g, '') || 0), available: true, description: description.trim(), fields: { type: 'rental', baseCity: baseCity.trim(), wilaya: wilaya.trim(), totalProperties: Number(totalProperties), propertyTypes, priceRange, cancellationPolicy, checkIn: checkInDefault, checkOut: checkOutDefault, phone: phone.trim(), email: email.trim(), amenities: selectedAmenities, hasInsurance, hasCleaning, hasPetFriendly, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#6C63FF' }]}>🏠 Create Your Rental Business Listing</Text>
      <Text style={st.sub}>This creates your RENTAL PORTFOLIO PROFILE that travelers browse and book properties from.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#6C63FF', backgroundColor: '#F0EFFF' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#6C63FF' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#6C63FF" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#6C63FF" /><Text style={[st.pt, { color: '#6C63FF' }]}>Add Portfolio Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Property Business Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your rental portfolio — locations, property styles, what makes you special..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <View style={st.r}>
        <View style={st.h}><TextInput style={st.inp} value={baseCity} onChangeText={setBaseCity} placeholder="Base City" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Total Properties</Text><TextInput style={st.inp} value={totalProperties} onChangeText={setTotalProperties} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Price Range (DZD)</Text><TextInput style={st.inp} value={priceRange} onChangeText={setPriceRange} placeholder="8000 – 45000" placeholderTextColor="#94A3B8" /></View>
      </View>

      <Text style={st.lbl}>Property Types Offered</Text>
      <View style={st.cg}>{PROPERTY_TYPES.map(t => <TouchableOpacity key={t} style={[st.ch, propertyTypes.includes(t) && { backgroundColor: '#6C63FF' + '12', borderColor: '#6C63FF' }]} onPress={() => toggle(t, propertyTypes, setPropertyTypes)}><Text style={[st.ct, propertyTypes.includes(t) && { color: '#6C63FF' }]}>{t}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Default Amenities (included in properties)</Text>
      <View style={st.cg}>{AMENITIES.map(a => <TouchableOpacity key={a} style={[st.ch, selectedAmenities.includes(a) && { backgroundColor: '#6C63FF' + '12', borderColor: '#6C63FF' }]} onPress={() => toggle(a, selectedAmenities, setSelectedAmenities)}><Ionicons name={selectedAmenities.includes(a) ? 'checkmark-circle' : 'add-circle-outline'} size={14} color={selectedAmenities.includes(a) ? '#6C63FF' : '#94A3B8'} /><Text style={[st.ct, selectedAmenities.includes(a) && { color: '#6C63FF' }]}>{a}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Default Policy</Text>
      <View style={st.chr}>{POLICIES.map(p => <TouchableOpacity key={p} style={[st.ch, cancellationPolicy === p && { backgroundColor: '#6C63FF' + '12', borderColor: '#6C63FF' }]} onPress={() => { Haptics.selectionAsync(); setCancellationPolicy(p); }}><Text style={[st.ct, cancellationPolicy === p && { color: '#6C63FF' }]}>{p}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Check-in</Text><TextInput style={st.inp} value={checkInDefault} onChangeText={setCheckInDefault} placeholder="14:00" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Check-out</Text><TextInput style={st.inp} value={checkOutDefault} onChangeText={setCheckOutDefault} placeholder="11:00" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94A3B8" /></View></View>

      <View style={st.tr}>
        {[{ k: 'ins', l: 'Damage Insurance', v: hasInsurance, s: setHasInsurance }, { k: 'cln', l: 'Cleaning Service', v: hasCleaning, s: setHasCleaning }, { k: 'pet', l: 'Pet Friendly Options', v: hasPetFriendly, s: setHasPetFriendly }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#6C63FF' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Rental Portfolio</Text></TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { fontSize: 20, fontFamily: 'mon-b' }, sub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -6 },
  lbl: { fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  inp: { height: 48, borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', fontFamily: 'mon-sb', color: '#0F172A' },
  ta: { height: 80, paddingTop: 12, textAlignVertical: 'top' }, r: { flexDirection: 'row', gap: 10 }, h: { flex: 1, gap: 6 },
  cg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, chr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  ct: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tg: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  tgt: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  ip: { minHeight: 100, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  ir: { gap: 8 }, tw: { position: 'relative' }, th: { width: 80, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9' }, ab: { width: 60, height: 60, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 13, fontFamily: 'mon-sb' },
  cb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  cbt: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
