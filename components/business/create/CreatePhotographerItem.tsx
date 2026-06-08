/**
 * RIHLA — Create Photography Studio Listing
 * ───────────────────────────────────────────
 * Creates the PHOTOGRAPHY STUDIO listing that clients see.
 * Asks: studio name, specialties, team, gear, packages, portfolio.
 * NOT an individual package — this is the photography business itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const STUDIO_TYPES = ['Portrait Studio', 'Event Photography', 'Commercial', 'Wedding Specialist', 'Drone/Aerial', 'Product Photography', 'Fashion', 'Food Photography'];
const SPECIALTIES = ['Weddings', 'Portraits', 'Events', 'Real Estate', 'Product', 'Fashion', 'Travel', 'Nature', 'Drone', 'Underwater', 'Food', 'Sports'];
const PACKAGE_EXAMPLES = ['Basic (10 photos)', 'Standard (25 photos)', 'Premium (50 photos + album)', 'Gold (full day + album + drone)'];
const EQUIPMENT = ['DSLR Canon R5', 'Sony A7IV', 'DJI Mavic 3', 'Lighting Kit', 'Studio Backdrops', 'GoPro', 'Lens Collection', 'Tripod Kit'];

export default function CreatePhotographerItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [studioName, setStudioName] = useState('');
  const [studioType, setStudioType] = useState('Portrait Studio');
  const [specialties, setSpecialties] = useState<string[]>(['Portraits', 'Events', 'Weddings']);
  const [equipment, setEquipment] = useState<string[]>(['DSLR Canon R5', 'DJI Mavic 3', 'Lighting Kit']);
  const [packagesOffered, setPackagesOffered] = useState<string[]>(['Basic (10 photos)', 'Standard (25 photos)']);
  const [turnaroundDays, setTurnaroundDays] = useState('3');
  const [priceFrom, setPriceFrom] = useState('');
  const [wilaya, setWilaya] = useState(''); const [phone, setPhone] = useState(''); const [instagram, setInstagram] = useState('');
  const [hasStudio, setHasStudio] = useState(true); const [hasDrone, setHasDrone] = useState(false); const [hasRetouching, setHasRetouching] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'photographer', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceFrom || 0), available: true, description: description.trim(), fields: { type: 'photographer', studioName: studioName.trim(), studioType, specialties, equipment, packagesOffered, turnaroundDays: Number(turnaroundDays), priceFrom: Number(priceFrom || 0), wilaya: wilaya.trim(), phone: phone.trim(), instagram: instagram.trim(), hasStudio, hasDrone, hasRetouching, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#FF499E' }]}>📸 Create Your Photography Studio Listing</Text>
      <Text style={st.sub}>This creates your PHOTOGRAPHY BUSINESS PROFILE that clients browse and book sessions through.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#FF499E', backgroundColor: '#FFF0F6' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#FF499E' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#FF499E" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#FF499E" /><Text style={[st.pt, { color: '#FF499E' }]}>Add Portfolio Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Studio / Business Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={studioName} onChangeText={setStudioName} placeholder="Photographer Name / Brand" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your studio — style, experience, what makes your photography unique..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <Text style={st.lbl}>Studio Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chr}>
        {STUDIO_TYPES.map(t => <TouchableOpacity key={t} style={[st.ch, studioType === t && { backgroundColor: '#FF499E' + '12', borderColor: '#FF499E' }]} onPress={() => { Haptics.selectionAsync(); setStudioType(t); }}><Text style={[st.ct, studioType === t && { color: '#FF499E' }]}>{t}</Text></TouchableOpacity>)}
      </ScrollView>

      <Text style={st.lbl}>Specialties</Text>
      <View style={st.cg}>{SPECIALTIES.map(s => <TouchableOpacity key={s} style={[st.ch, specialties.includes(s) && { backgroundColor: '#FF499E' + '12', borderColor: '#FF499E' }]} onPress={() => toggle(s, specialties, setSpecialties)}><Text style={[st.ct, specialties.includes(s) && { color: '#FF499E' }]}>{s}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Packages Offered (select typical ones)</Text>
      <View style={st.cg}>{PACKAGE_EXAMPLES.map(p => <TouchableOpacity key={p} style={[st.ch, packagesOffered.includes(p) && { backgroundColor: '#FF499E' + '12', borderColor: '#FF499E' }]} onPress={() => toggle(p, packagesOffered, setPackagesOffered)}><Text style={[st.ct, packagesOffered.includes(p) && { color: '#FF499E' }]}>{p}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Equipment</Text>
      <View style={st.cg}>{EQUIPMENT.map(e => <TouchableOpacity key={e} style={[st.ch, equipment.includes(e) && { backgroundColor: '#FF499E' + '12', borderColor: '#FF499E' }]} onPress={() => toggle(e, equipment, setEquipment)}><Ionicons name={equipment.includes(e) ? 'checkmark-circle' : 'add-circle-outline'} size={14} color={equipment.includes(e) ? '#FF499E' : '#94A3B8'} /><Text style={[st.ct, equipment.includes(e) && { color: '#FF499E' }]}>{e}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Turnaround (days)</Text><TextInput style={st.inp} value={turnaroundDays} onChangeText={setTurnaroundDays} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Price From (DZD)</Text><TextInput style={st.inp} value={priceFrom} onChangeText={setPriceFrom} keyboardType="number-pad" placeholder="3000" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={instagram} onChangeText={setInstagram} placeholder="@instagram" placeholderTextColor="#94A3B8" /></View></View>

      <View style={st.tr}>
        {[{ k: 'st', l: 'Physical Studio Available', v: hasStudio, s: setHasStudio }, { k: 'dr', l: 'Drone Photography', v: hasDrone, s: setHasDrone }, { k: 'rt', l: 'Professional Retouching', v: hasRetouching, s: setHasRetouching }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#FF499E' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Photography Studio</Text></TouchableOpacity>
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
