/**
 * RIHLA — Create Activity Company Listing
 * ─────────────────────────────────────────
 * Creates the ACTIVITY COMPANY listing that travelers see.
 * Asks: company name, activity types, base location, season, certifications.
 * NOT an individual program — this is the activity business itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const ACTIVITY_TYPES = ['Hiking', 'Climbing', 'Water Sports', 'Quad Biking', 'Camel Trek', 'Paragliding', 'Diving', 'Horse Riding', 'Cycling', 'Yoga & Wellness', 'Cooking Classes', 'Photography Tours'];
const DIFFICULTIES = ['Easy (beginners)', 'Moderate', 'Challenging', 'Extreme/Expert'];
const SEASONS = ['All Year', 'Spring', 'Summer', 'Fall', 'Winter'];

export default function CreateActivityItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [activityTypes, setActivityTypes] = useState<string[]>(['Hiking', 'Camel Trek', 'Quad Biking']);
  const [difficultyRange, setDifficultyRange] = useState('Easy → Challenging');
  const [baseLocation, setBaseLocation] = useState(''); const [wilaya, setWilaya] = useState('');
  const [groupSize, setGroupSize] = useState('2–15'); const [priceFrom, setPriceFrom] = useState('');
  const [season, setSeason] = useState('All Year');
  const [hasEquipment, setHasEquipment] = useState(true); const [hasInsurance, setHasInsurance] = useState(true); const [hasTransport, setHasTransport] = useState(false);
  const [phone, setPhone] = useState(''); const [website, setWebsite] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'activity', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceFrom || 0), available: true, description: description.trim(), fields: { type: 'activity', companyName: companyName.trim(), activityTypes, difficultyRange, baseLocation: baseLocation.trim(), wilaya: wilaya.trim(), groupSize, season, priceFrom: Number(priceFrom || 0), hasEquipment, hasInsurance, hasTransport, phone: phone.trim(), website: website.trim(), images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#E76F51' }]}>⚡ Create Your Activity Company Listing</Text>
      <Text style={st.sub}>This creates your ACTIVITY COMPANY PROFILE that adventurers browse and book from.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#E76F51', backgroundColor: '#FEF2EE' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#E76F51' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#E76F51" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#E76F51" /><Text style={[st.pt, { color: '#E76F51' }]}>Add Company Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Activity Business Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={companyName} onChangeText={setCompanyName} placeholder="Company / Brand Name (optional)" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your activity company — your philosophy, best trips, what makes you unique..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <Text style={st.lbl}>Activity Types Offered</Text>
      <View style={st.cg}>{ACTIVITY_TYPES.map(a => <TouchableOpacity key={a} style={[st.ch, activityTypes.includes(a) && { backgroundColor: '#E76F51' + '12', borderColor: '#E76F51' }]} onPress={() => toggle(a, activityTypes, setActivityTypes)}><Text style={[st.ct, activityTypes.includes(a) && { color: '#E76F51' }]}>{a}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Base Location</Text><TextInput style={st.inp} value={baseLocation} onChangeText={setBaseLocation} placeholder="e.g. Tizi Ouzou" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Wilaya</Text><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Group Size</Text><TextInput style={st.inp} value={groupSize} onChangeText={setGroupSize} placeholder="2–15" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Price From (DZD)</Text><TextInput style={st.inp} value={priceFrom} onChangeText={setPriceFrom} keyboardType="number-pad" placeholder="5000" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Difficulty Range</Text><TextInput style={st.inp} value={difficultyRange} onChangeText={setDifficultyRange} placeholder="Easy → Challenging" placeholderTextColor="#94A3B8" /></View>
      </View>

      <Text style={st.lbl}>Operating Season</Text>
      <View style={st.chr}>{SEASONS.map(s => <TouchableOpacity key={s} style={[st.ch, season === s && { backgroundColor: '#E76F51' + '12', borderColor: '#E76F51' }]} onPress={() => { Haptics.selectionAsync(); setSeason(s); }}><Ionicons name={s === 'All Year' ? 'infinite-outline' : s === 'Summer' ? 'sunny-outline' : s === 'Winter' ? 'snow-outline' : 'leaf-outline'} size={14} color={season === s ? '#E76F51' : '#94A3B8'} /><Text style={[st.ct, season === s && { color: '#E76F51' }]}>{s}</Text></TouchableOpacity>)}</View>

      <View style={st.tr}>
        {[{ k: 'eq', l: 'Equipment Provided', v: hasEquipment, s: setHasEquipment }, { k: 'ins', l: 'Insurance Included', v: hasInsurance, s: setHasInsurance }, { k: 'tr', l: 'Transport Included', v: hasTransport, s: setHasTransport }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={website} onChangeText={setWebsite} placeholder="Website / Instagram" placeholderTextColor="#94A3B8" /></View></View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#E76F51' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Activity Company</Text></TouchableOpacity>
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
