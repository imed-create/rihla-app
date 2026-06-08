/**
 * RIHLA — Create Experience Company Listing
 * ───────────────────────────────────────────
 * Creates the EXPERIENCE COMPANY listing that travelers see.
 * Asks: company name, experience themes, destinations, group sizes, duration.
 * NOT an individual experience — this is the experience business itself.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const THEMES = ['Desert Camps', 'Mountain Retreats', 'Coastal Escapes', 'Cultural Immersion', 'Wellness & Yoga', 'Adventure', 'Luxury Safari', 'Culinary Journeys', 'Historical Expeditions', 'Photography Tours', 'Stargazing', 'Eco-Tourism'];
const DESTINATIONS = ['Sahara Desert, Tamanrasset', 'Djanet & Tadrart Rouge', 'Ghardaïa Valley', 'Tizi Ouzou Mountains', 'Béjaïa Coast', 'Oran Seafront', 'Constantine Old City', 'Tlemcen Gardens', 'Annaba Beaches', 'Setif Highlands'];
const DURATIONS = ['Half Day', 'Full Day', '2 Days', '3 Days', '5 Days', '7 Days', '10 Days', '14 Days'];

export default function CreateExperienceItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [themes, setThemes] = useState<string[]>(['Desert Camps', 'Cultural Immersion', 'Adventure']);
  const [destinations, setDestinations] = useState<string[]>(['Sahara Desert, Tamanrasset', 'Ghardaïa Valley']);
  const [durationRange, setDurationRange] = useState('2–7 Days');
  const [groupSize, setGroupSize] = useState('2–12');
  const [priceFrom, setPriceFrom] = useState('');
  const [wilaya, setWilaya] = useState(''); const [phone, setPhone] = useState(''); const [email, setEmail] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [hasAccommodation, setHasAccommodation] = useState(true); const [hasMeals, setHasMeals] = useState(true); const [hasTransport, setHasTransport] = useState(false); const [hasGuide, setHasGuide] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [16, 9], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'experience', assetKind: 'listing', name: name.trim(), priceDZD: Number(priceFrom || 0), available: true, description: description.trim(), fields: { type: 'experience', companyName: companyName.trim(), themes, destinations, durationRange, groupSize, priceFrom: Number(priceFrom || 0), wilaya: wilaya.trim(), phone: phone.trim(), email: email.trim(), difficulty, hasAccommodation, hasMeals, hasTransport, hasGuide, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={[st.title, { color: '#f4a261' }]}>✨ Create Your Experience Company Listing</Text>
      <Text style={st.sub}>This creates your EXPERIENCE COMPANY PROFILE that travelers discover and book unique journeys through.</Text>

      <TouchableOpacity style={[st.ip, { borderColor: '#f4a261', backgroundColor: '#FFF8F0' }]} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={[st.ab, { borderColor: '#f4a261' }]} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#f4a261" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#f4a261" /><Text style={[st.pt, { color: '#f4a261' }]}>Add Experience Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Experience Business Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={companyName} onChangeText={setCompanyName} placeholder="Company / Brand Name" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe your experience company — your philosophy, the journeys you create, what's unforgettable..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <Text style={st.lbl}>Experience Themes</Text>
      <View style={st.cg}>{THEMES.map(t => <TouchableOpacity key={t} style={[st.ch, themes.includes(t) && { backgroundColor: '#f4a261' + '12', borderColor: '#f4a261' }]} onPress={() => toggle(t, themes, setThemes)}><Text style={[st.ct, themes.includes(t) && { color: '#c97a35' }]}>{t}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Key Destinations</Text>
      <View style={st.cg}>{DESTINATIONS.map(d => <TouchableOpacity key={d} style={[st.ch, destinations.includes(d) && { backgroundColor: '#f4a261' + '12', borderColor: '#f4a261' }]} onPress={() => toggle(d, destinations, setDestinations)}><Text style={[st.ct, destinations.includes(d) && { color: '#c97a35' }]}>{d}</Text></TouchableOpacity>)}</View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Duration Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chr}>
            {DURATIONS.map(d => <TouchableOpacity key={d} style={[st.ch, durationRange === d && { backgroundColor: '#f4a261' + '12', borderColor: '#f4a261' }]} onPress={() => { Haptics.selectionAsync(); setDurationRange(d); }}><Text style={[st.ct, durationRange === d && { color: '#c97a35' }]}>{d}</Text></TouchableOpacity>)}
          </ScrollView>
        </View>
      </View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Group Size</Text><TextInput style={st.inp} value={groupSize} onChangeText={setGroupSize} placeholder="2–12" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Price From (DZD)</Text><TextInput style={st.inp} value={priceFrom} onChangeText={setPriceFrom} keyboardType="number-pad" placeholder="45000" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}>
        <View style={st.h}><Text style={st.lbl}>Difficulty</Text>
          <View style={st.chr}>{['Easy', 'Moderate', 'Challenging'].map(d => <TouchableOpacity key={d} style={[st.ch, difficulty === d && { backgroundColor: '#f4a261' + '12', borderColor: '#f4a261' }]} onPress={() => { Haptics.selectionAsync(); setDifficulty(d); }}><Text style={[st.ct, difficulty === d && { color: '#c97a35' }]}>{d}</Text></TouchableOpacity>)}</View>
        </View>
        <View style={st.h}><TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" /></View>
      </View>

      <View style={st.r}><View style={st.h}><TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" /></View><View style={st.h}><TextInput style={st.inp} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#94A3B8" /></View></View>

      <Text style={st.lbl}>What's Included</Text>
      <View style={st.tr}>
        {[{ k: 'acc', l: 'Accommodation', v: hasAccommodation, s: setHasAccommodation }, { k: 'ml', l: 'All Meals', v: hasMeals, s: setHasMeals }, { k: 'tr', l: 'Transport', v: hasTransport, s: setHasTransport }, { k: 'gd', l: 'Professional Guide', v: hasGuide, s: setHasGuide }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}><Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} /><Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text></TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[st.cb, { backgroundColor: '#f4a261' }]} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Experience Company</Text></TouchableOpacity>
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
