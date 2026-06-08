/**
 * RIHLA — Create Transport Company Listing
 * ──────────────────────────────────────────
 * Creates the TRANSPORT COMPANY listing that travelers see.
 * Asks: company name, fleet size, vehicle types, routes, coverage.
 * NOT an individual route — this is the transport business itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const VEHICLE_TYPES = ['Sedans', 'SUVs', 'Vans/Minibuses', 'Luxury Cars', '4x4 Off-road', 'Buses', 'Pickup Trucks', 'Eco/Electric'];
const SERVICES = ['Airport Transfers', 'City Tours', 'Intercity Travel', 'Desert Safaris', 'Corporate Transport', 'Wedding Fleet', 'School Transport', 'Delivery/Courier'];
const COVERAGE = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Setif', 'Béjaïa', 'Tizi Ouzou', 'Tlemcen', 'Biskra', 'Ghardaïa', 'Tamanrasset', 'Djanet', 'Adrar', 'Illizi'];

export default function CreateDriverItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [fleetSize, setFleetSize] = useState('10');
  const [fleetTypes, setFleetTypes] = useState<string[]>(['Sedans', 'SUVs', '4x4 Off-road']);
  const [services, setServices] = useState<string[]>(['Airport Transfers', 'City Tours']);
  const [coverage, setCoverage] = useState<string[]>(['Algiers', 'Oran']);
  const [pricePerKm, setPricePerKm] = useState('');
  const [baseCity, setBaseCity] = useState(''); const [wilaya, setWilaya] = useState('');
  const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hasApp, setHasApp] = useState(false); const [hasGPS, setHasGPS] = useState(true); const [hasInsurance, setHasInsurance] = useState(true); const [hasAC, setHasAC] = useState(true); const [hasWiFi, setHasWifi] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'driver', assetKind: 'listing', name: name.trim(), priceDZD: Number(pricePerKm || 0), available: true, description: description.trim(), fields: { type: 'driver', fleetSize: Number(fleetSize), fleetTypes, services, coverage, pricePerKm: Number(pricePerKm || 0), baseCity: baseCity.trim(), wilaya: wilaya.trim(), phone: phone.trim(), email: email.trim(), licenseNumber: licenseNumber.trim(), hasApp, hasGPS, hasInsurance, hasAC, hasWiFi, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#0a2540' }]}>🚗 Create Your Transport Company Listing</Text>
      <Text style={st.sub}>This creates your TRANSPORT COMPANY PROFILE that travelers browse and book rides from.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#0a2540', backgroundColor: '#F0F2F5' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#0a2540' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#0a2540" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#0a2540" /><Text style={[st.pt, { color: '#0a2540' }]}>Add Fleet Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Company Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your transport company — fleet quality, services, reliability, coverage..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Fleet Size</Text><TextInput style={st.inp} value={fleetSize} onChangeText={setFleetSize} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Price/km (DZD)</Text><TextInput style={st.inp} value={pricePerKm} onChangeText={setPricePerKm} keyboardType="number-pad" placeholder="100" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>License #</Text><TextInput style={st.inp} value={licenseNumber} onChangeText={setLicenseNumber} placeholder="16-123-AB" placeholderTextColor="#94A3B8" /></View>
      </View>

      <Text style={st.lbl}>Fleet Vehicle Types</Text>
      <View style={st.cg}>{VEHICLE_TYPES.map(v => <TouchableOpacity key={v} style={[st.ch, fleetTypes.includes(v) && { backgroundColor: '#0a2540' + '12', borderColor: '#0a2540' }]} onPress={() => toggle(v, fleetTypes, setFleetTypes)}><Ionicons name={v === 'Luxury Cars' ? 'diamond-outline' : v === '4x4 Off-road' ? 'bonfire-outline' : v === 'Buses' ? 'bus-outline' : v.includes('Eco') ? 'leaf-outline' : 'car-outline'} size={14} color={fleetTypes.includes(v) ? '#0a2540' : '#94A3B8'} /><Text style={[st.ct, fleetTypes.includes(v) && { color: '#0a2540' }]}>{v}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Services Offered</Text>
      <View style={st.cg}>{SERVICES.map(s => <TouchableOpacity key={s} style={[st.ch, services.includes(s) && { backgroundColor: '#0a2540' + '12', borderColor: '#0a2540' }]} onPress={() => toggle(s, services, setServices)}><Text style={[st.ct, services.includes(s) && { color: '#0a2540' }]}>{s}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Coverage Area</Text>
      <View style={st.cg}>{COVERAGE.map(c => <TouchableOpacity key={c} style={[st.ch, coverage.includes(c) && { backgroundColor: '#0a2540' + '12', borderColor: '#0a2540' }]} onPress={() => toggle(c, coverage, setCoverage)}><Text style={[st.ct, coverage.includes(c) && { color: '#0a2540' }]}>{c}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><TextInput style={st.inp} value={baseCity} onChangeText={setBaseCity} placeholder="Base City" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94A3B8" /></View></View>

      <Text style={st.lbl}>Vehicle Amenities</Text>
      <View style={st.tr}>
        {[{ k: 'ac', l: 'Air Conditioning', v: hasAC, s: setHasAC }, { k: 'gps', l: 'GPS Tracking', v: hasGPS, s: setHasGPS }, { k: 'ins', l: 'Insurance Covered', v: hasInsurance, s: setHasInsurance }, { k: 'wifi', l: 'In-Car WiFi', v: hasWiFi, s: setHasWifi }, { k: 'app', l: 'Online Booking App', v: hasApp, s: setHasApp }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#0a2540' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Transport Company</Text></TouchableOpacity>
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
  ir: { gap: 8 }, tw: { position: 'relative' }, th: { width: 80, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9' }, ab: { width: 60, height: 60, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 13, fontFamily: 'mon-sb' },
  cb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14 },
  cbt: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
