/**
 * RIHLA — Create Event Venue / Company Listing
 * ──────────────────────────────────────────────
 * Creates the EVENT VENUE or COMPANY listing that attendees see.
 * Asks: venue name, event types, capacity, facilities, in-house services.
 * NOT an individual event — this is the event business/venue itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const VENUE_TYPES = ['Indoor Hall', 'Outdoor Garden', 'Rooftop', 'Beachfront', 'Convention Center', 'Stadium', 'Amphitheater', 'Private Club'];
const EVENT_CATEGORIES = ['Concerts', 'Festivals', 'Conferences', 'Weddings', 'Exhibitions', 'Sports', 'Cultural', 'Nightlife', 'Corporate', 'Private Parties'];
const FACILITIES = ['Stage', 'Sound System', 'Lighting Rig', 'VIP Lounge', 'Backstage', 'Parking', 'Catering', 'Bar', 'AC', 'Heating', 'Green Room', 'Security', 'First Aid', 'Wheelchair Access'];

export default function CreateEventItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [venueType, setVenueType] = useState('Indoor Hall');
  const [eventCategories, setEventCategories] = useState<string[]>(['Concerts', 'Cultural']);
  const [capacity, setCapacity] = useState('500'); const [indoorCapacity, setIndoorCapacity] = useState('300');
  const [wilaya, setWilaya] = useState(''); const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(['Stage', 'Sound System', 'Lighting Rig', 'Parking']);
  const [hasInHouseCatering, setHasInHouseCatering] = useState(false);
  const [hasInHouseSound, setHasInHouseSound] = useState(true);
  const [hasBookingSystem, setHasBookingSystem] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'event', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceRange.replace(/[^0-9]/g, '') || 0), available: true, description: description.trim(), fields: { type: 'event', venueType, eventCategories, capacity: Number(capacity), indoorCapacity: Number(indoorCapacity), wilaya: wilaya.trim(), address: address.trim(), priceRange, phone: phone.trim(), email: email.trim(), facilities: selectedFacilities, hasInHouseCatering, hasInHouseSound, hasBookingSystem, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#A855F7' }]}>🎪 Create Your Event Venue Listing</Text>
      <Text style={st.sub}>This creates your VENUE / EVENT COMPANY PROFILE that organizers and attendees browse.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#A855F7', backgroundColor: '#F5F3FF' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#A855F7' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#A855F7" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#A855F7" /><Text style={[st.pt, { color: '#A855F7' }]}>Add Venue Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Venue / Company Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your venue or event company — atmosphere, capacity, what makes it special..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <Text style={st.lbl}>Venue Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chr}>
        {VENUE_TYPES.map(v => <TouchableOpacity key={v} style={[st.ch, venueType === v && { backgroundColor: '#A855F7' + '12', borderColor: '#A855F7' }]} onPress={() => { Haptics.selectionAsync(); setVenueType(v); }}><Text style={[st.ct, venueType === v && { color: '#A855F7' }]}>{v}</Text></TouchableOpacity>)}
      </ScrollView>

      <Text style={st.lbl}>Event Categories Hosted</Text>
      <View style={st.cg}>{EVENT_CATEGORIES.map(c => <TouchableOpacity key={c} style={[st.ch, eventCategories.includes(c) && { backgroundColor: '#A855F7' + '12', borderColor: '#A855F7' }]} onPress={() => toggle(c, eventCategories, setEventCategories)}><Text style={[st.ct, eventCategories.includes(c) && { color: '#A855F7' }]}>{c}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Total Capacity</Text><TextInput style={st.inp} value={capacity} onChangeText={setCapacity} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Indoor Capacity</Text><TextInput style={st.inp} value={indoorCapacity} onChangeText={setIndoorCapacity} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
      </View>

      <Text style={st.lbl}>Facilities & Equipment</Text>
      <View style={st.cg}>{FACILITIES.map(f => <TouchableOpacity key={f} style={[st.ch, selectedFacilities.includes(f) && { backgroundColor: '#A855F7' + '12', borderColor: '#A855F7' }]} onPress={() => toggle(f, selectedFacilities, setSelectedFacilities)}><Text style={[st.ct, selectedFacilities.includes(f) && { color: '#A855F7' }]}>{f}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><TextInput style={st.inp} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Price Range</Text><TextInput style={st.inp} value={priceRange} onChangeText={setPriceRange} placeholder="50,000 – 500,000 DZD" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94A3B8" /></View></View>

      <View style={st.tr}>
        {[{ k: 'cat', l: 'In-House Catering', v: hasInHouseCatering, s: setHasInHouseCatering }, { k: 'snd', l: 'In-House Sound/Lights', v: hasInHouseSound, s: setHasInHouseSound }, { k: 'bk', l: 'Online Booking System', v: hasBookingSystem, s: setHasBookingSystem }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#A855F7' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Event Venue</Text></TouchableOpacity>
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
  ch: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  ct: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tg: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  tgt: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  ip: { minHeight: 100, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  ir: { gap: 8 }, tw: { position: 'relative' }, th: { width: 80, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9' }, ab: { width: 60, height: 60, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 13, fontFamily: 'mon-sb' },
  cb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  cbt: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
