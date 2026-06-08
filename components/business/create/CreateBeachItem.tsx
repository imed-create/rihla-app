/**
 * RIHLA — Create Beach Listing
 * ──────────────────────────────
 * Main BEACH LISTING — name, zones, spots count, GPS, services, hours, rules.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const SERVICES = ['Parking', 'Showers', 'Food Court', 'Massage', 'Powerbank Rental', 'Jet Ski Rental', 'Pedalo', 'Beach Sports', 'Kids Play Area', 'Sunset Lounge'];
const ZONE_TYPES = ['Family Zone', 'VIP Zone', 'Free Zone'];

export default function CreateBeachItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [zones, setZones] = useState<string[]>(['Family Zone', 'VIP Zone']); const [totalSpots, setTotalSpots] = useState('50');
  const [priceVIP, setPriceVIP] = useState('3500'); const [priceFamily, setPriceFamily] = useState('1500');
  const [wilaya, setWilaya] = useState(''); const [gpsLat, setGpsLat] = useState('36.7525'); const [gpsLng, setGpsLng] = useState('3.0420');
  const [openingHours, setOpeningHours] = useState('07:00 - 19:00'); const [phone, setPhone] = useState('');
  const [hasLifeguard, setHasLifeguard] = useState(true); const [hasHoldTimer, setHasHoldTimer] = useState(true);
  const [services, setServices] = useState<string[]>(['Parking', 'Showers', 'Food Court']);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'beach', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceVIP || 0), available: true, description: description.trim(), fields: { type: 'beach', zones, totalSpots: Number(totalSpots), priceVIP: Number(priceVIP), priceFamily: Number(priceFamily), wilaya: wilaya.trim(), gpsLat: Number(gpsLat), gpsLng: Number(gpsLng), openingHours, phone: phone.trim(), hasLifeguard, hasHoldTimer, services, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#00a896' }]}>🏖️ Create Your Beach Listing</Text>
      <Text style={st.sub}>This creates the BEACH PROFILE travelers will explore and book spots on.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#00a896', backgroundColor: '#F0FDFA' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#00a896' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#00a896" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#00a896" /><Text style={[st.pt, { color: '#00a896' }]}>Add Beach Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Beach Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your beach — location, atmosphere, what makes it special..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />
      <TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" />

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Total Spots</Text><TextInput style={st.inp} value={totalSpots} onChangeText={setTotalSpots} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>VIP Price</Text><TextInput style={st.inp} value={priceVIP} onChangeText={setPriceVIP} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Family Price</Text><TextInput style={st.inp} value={priceFamily} onChangeText={setPriceFamily} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
      </View>

      <Text style={st.lbl}>Zones Available</Text>
      <View style={st.cg}>{ZONE_TYPES.map(z => <TouchableOpacity key={z} style={[st.ch, zones.includes(z) && { backgroundColor: '#00a896' + '12', borderColor: '#00a896' }]} onPress={() => toggle(z, zones, setZones)}><Text style={[st.ct, zones.includes(z) && { color: '#00a896' }]}>{z}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Services</Text>
      <View style={st.cg}>{SERVICES.map(s => <TouchableOpacity key={s} style={[st.ch, services.includes(s) && { backgroundColor: '#00a896' + '12', borderColor: '#00a896' }]} onPress={() => toggle(s, services, setServices)}><Ionicons name={services.includes(s) ? 'checkmark-circle' : 'add-circle-outline'} size={14} color={services.includes(s) ? '#00a896' : '#94A3B8'} /><Text style={[st.ct, services.includes(s) && { color: '#00a896' }]}>{s}</Text></TouchableOpacity>)}</View>

      <View style={st.r}><View style={st.h}><Text style={st.lbl}>Latitude</Text><TextInput style={st.inp} value={gpsLat} onChangeText={setGpsLat} placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Longitude</Text><TextInput style={st.inp} value={gpsLng} onChangeText={setGpsLng} placeholderTextColor="#94A3B8" /></View></View>

      <TextInput style={st.inp} value={openingHours} onChangeText={setOpeningHours} placeholder="Hours — 07:00 - 19:00" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" />

      <View style={st.tr}>
        {[{ k: 'hl', l: 'Lifeguard on Duty', v: hasLifeguard, s: setHasLifeguard }, { k: 'ht', l: '20-min Hold Timer', v: hasHoldTimer, s: setHasHoldTimer }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}>
            <Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#00a896' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Beach Listing</Text></TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { fontSize: 20, fontFamily: 'mon-b' }, sub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -6 },
  lbl: { fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  inp: { height: 48, borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', fontFamily: 'mon-sb', color: '#0F172A' },
  ta: { height: 80, paddingTop: 12, textAlignVertical: 'top' }, r: { flexDirection: 'row', gap: 10 }, h: { flex: 1, gap: 6 },
  cg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, ch: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  ct: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tg: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  tgt: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  ip: { minHeight: 100, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  ir: { gap: 8 }, tw: { position: 'relative' }, th: { width: 80, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9' }, ab: { width: 60, height: 60, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 13, fontFamily: 'mon-sb' },
  cb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  cbt: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
