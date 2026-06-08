/**
 * RIHLA — Create Guide Agency Listing
 * ─────────────────────────────────────
 * Creates the GUIDE AGENCY listing that travelers see.
 * Asks: agency name, team size, tour types, territories, certifications.
 * NOT an individual expedition — this is the guide business itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const TOUR_TYPES = ['Historical Tours', 'Nature Walks', 'Desert Expeditions', 'Mountain Treks', 'Cultural Immersion', 'Food Tours', 'City Walks', 'Photography Safaris', 'Bird Watching', 'Archaeological'];
const TERRITORIES = ['Algiers', 'Constantine', 'Oran', 'Tizi Ouzou', 'Béjaïa', 'Ghardaïa', 'Tamanrasset', 'Djanet', 'Tlemcen', 'Annaba', 'Setif', 'Biskra'];
const CERTIFICATIONS = ['Ministry of Tourism Licensed', 'First Aid Certified', 'Mountain Rescue', 'Desert Survival', 'Cultural Heritage Guide', 'Multi-Language Certified'];

export default function CreateGuideItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [foundedYear, setFoundedYear] = useState('2020');
  const [teamSize, setTeamSize] = useState('5'); const [totalGuides, setTotalGuides] = useState('8');
  const [tourTypes, setTourTypes] = useState<string[]>(['Historical Tours', 'Desert Expeditions']);
  const [territories, setTerritories] = useState<string[]>(['Algiers', 'Tizi Ouzou', 'Ghardaïa']);
  const [certifications, setCertifications] = useState<string[]>(['Ministry of Tourism Licensed']);
  const [languages, setLanguages] = useState<string[]>(['Arabic', 'French', 'English']);
  const [priceFrom, setPriceFrom] = useState('');
  const [wilaya, setWilaya] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [hasCustomTours, setHasCustomTours] = useState(true); const [hasTransport, setHasTransport] = useState(false); const [hasMeals, setHasMeals] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'guide', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceFrom || 0), available: true, description: description.trim(), fields: { type: 'guide', foundedYear: Number(foundedYear), teamSize: Number(teamSize), totalGuides: Number(totalGuides), tourTypes, territories, certifications, languages, priceFrom: Number(priceFrom || 0), wilaya: wilaya.trim(), phone: phone.trim(), email: email.trim(), hasCustomTours, hasTransport, hasMeals, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#8B5E3C' }]}>🧭 Create Your Guide Agency Listing</Text>
      <Text style={st.sub}>This creates your GUIDE AGENCY PROFILE that travelers discover and book tours through.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#8B5E3C', backgroundColor: '#F5F0EB' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#8B5E3C' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#8B5E3C" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#8B5E3C" /><Text style={[st.pt, { color: '#8B5E3C' }]}>Add Agency Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Agency / Tour Company Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your agency — your mission, areas of expertise, what makes your tours special..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Founded</Text><TextInput style={st.inp} value={foundedYear} onChangeText={setFoundedYear} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Team Size</Text><TextInput style={st.inp} value={teamSize} onChangeText={setTeamSize} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Total Guides</Text><TextInput style={st.inp} value={totalGuides} onChangeText={setTotalGuides} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
      </View>

      <Text style={st.lbl}>Tour Types</Text>
      <View style={st.cg}>{TOUR_TYPES.map(t => <TouchableOpacity key={t} style={[st.ch, tourTypes.includes(t) && { backgroundColor: '#8B5E3C' + '12', borderColor: '#8B5E3C' }]} onPress={() => toggle(t, tourTypes, setTourTypes)}><Text style={[st.ct, tourTypes.includes(t) && { color: '#8B5E3C' }]}>{t}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Operating Territories</Text>
      <View style={st.cg}>{TERRITORIES.map(t => <TouchableOpacity key={t} style={[st.ch, territories.includes(t) && { backgroundColor: '#8B5E3C' + '12', borderColor: '#8B5E3C' }]} onPress={() => toggle(t, territories, setTerritories)}><Text style={[st.ct, territories.includes(t) && { color: '#8B5E3C' }]}>{t}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Languages</Text>
      <View style={st.chr}>{['Arabic', 'French', 'English', 'Spanish', 'Italian', 'German', 'Tuareg', 'Berber'].map(l => <TouchableOpacity key={l} style={[st.ch, languages.includes(l) && { backgroundColor: '#8B5E3C' + '12', borderColor: '#8B5E3C' }]} onPress={() => toggle(l, languages, setLanguages)}><Text style={[st.ct, languages.includes(l) && { color: '#8B5E3C' }]}>{l}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Certifications</Text>
      <View style={st.cg}>{CERTIFICATIONS.map(c => <TouchableOpacity key={c} style={[st.ch, certifications.includes(c) && { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]} onPress={() => toggle(c, certifications, setCertifications)}><Ionicons name={certifications.includes(c) ? 'checkmark-circle' : 'add-circle-outline'} size={14} color={certifications.includes(c) ? '#059669' : '#94A3B8'} /><Text style={[st.ct, certifications.includes(c) && { color: '#059669' }]}>{c}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Price From (DZD)</Text><TextInput style={st.inp} value={priceFrom} onChangeText={setPriceFrom} keyboardType="number-pad" placeholder="4000" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94A3B8" /></View></View>

      <View style={st.tr}>
        {[{ k: 'cust', l: 'Custom Tours Available', v: hasCustomTours, s: setHasCustomTours }, { k: 'tr', l: 'Transport Included', v: hasTransport, s: setHasTransport }, { k: 'ml', l: 'Meals Included', v: hasMeals, s: setHasMeals }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#8B5E3C' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Guide Agency</Text></TouchableOpacity>
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
