/**
 * RIHLA — Create Restaurant Listing
 * ───────────────────────────────────
 * Creates the MAIN RESTAURANT LISTING that travelers see.
 * Asks: restaurant name, cuisine, hours, seating, delivery, menu style, ambiance.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useBusinessAssets } from '@/store/useBusinessAssets';

const CUISINES = ['Traditional Algerian', 'Mediterranean', 'Seafood', 'Italian', 'French', 'Asian', 'Fusion', 'Cafe/Bakery', 'Fast Food'];
const AMBIANCE = ['Casual', 'Family-Friendly', 'Romantic', 'Luxury', 'Rooftop', 'Garden', 'Beachfront', 'Traditional Decor'];
const PAYMENT = ['Cash', 'Card', 'Baridi Mob', 'Edahabia'];

export default function CreateRestaurantItem() {
  const { addAsset } = useBusinessAssets();
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [cuisines, setCuisines] = useState<string[]>(['Traditional Algerian', 'Mediterranean']); const [ambiance, setAmbiance] = useState<string[]>(['Casual', 'Family-Friendly']);
  const [openingHours, setOpeningHours] = useState('08:00 - 23:00'); const [seating, setSeating] = useState('60'); const [avgMealPrice, setAvgMealPrice] = useState('');
  const [wilaya, setWilaya] = useState(''); const [address, setAddress] = useState(''); const [phone, setPhone] = useState('');
  const [hasDelivery, setHasDelivery] = useState(false); const [hasOutdoor, setHasOutdoor] = useState(true); const [hasLiveMusic, setHasLiveMusic] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string[]>(['Cash', 'Card']);
  const [images, setImages] = useState<string[]>([]);

  const toggle = (item: string, list: string[], set: (l: string[]) => void) => { Haptics.selectionAsync(); set(list.includes(item) ? list.filter(x => x !== item) : [...list, item]); };
  const pickImg = async () => { const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 }); if (!r.canceled && r.assets[0]) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setImages(p => [...p, r.assets[0].uri]); } };

  const create = () => { if (!name.trim()) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); addAsset({ businessType: 'restaurant', assetKind: 'listing', name: name.trim(), priceDZD: Number(avgMealPrice || 0), available: true, description: description.trim(), fields: { type: 'restaurant', cuisines, ambiance, openingHours, seating: Number(seating), avgMealPrice: Number(avgMealPrice || 0), wilaya: wilaya.trim(), address: address.trim(), phone: phone.trim(), hasDelivery, hasOutdoor, hasLiveMusic, payment: selectedPayment, images } }); router.back(); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <Text style={st.title}>🍽️ Create Your Restaurant Listing</Text>
      <Text style={st.sub}>This creates the RESTAURANT PROFILE travelers will browse and book.</Text>

      <TouchableOpacity style={st.ip} onPress={pickImg}>
        {images.length > 0 ? <ScrollView horizontal contentContainerStyle={st.ir}>{images.map((u, i) => <View key={i} style={st.tw}><Image source={{ uri: u }} style={st.th} /><TouchableOpacity onPress={() => setImages(p => p.filter((_, idx) => idx !== i))}><Ionicons name="close-circle" size={16} color="#EF4444" /></TouchableOpacity></View>)}<TouchableOpacity style={st.ab} onPress={pickImg}><Ionicons name="camera-outline" size={20} color="#C56A39" /></TouchableOpacity></ScrollView> : <><Ionicons name="images-outline" size={32} color="#C56A39" /><Text style={st.pt}>Add Restaurant Photos</Text></>}
      </TouchableOpacity>

      <TextInput style={st.inp} value={name} onChangeText={setName} placeholder="Restaurant Name *" placeholderTextColor="#94A3B8" />
      <TextInput style={[st.inp, st.ta]} value={description} onChangeText={setDescription} placeholder="Describe the restaurant, signature dishes, dining experience..." placeholderTextColor="#94A3B8" multiline numberOfLines={3} />

      <Text style={st.lbl}>Cuisine Types</Text>
      <View style={st.cg}>{CUISINES.map(c => <TouchableOpacity key={c} style={[st.ch, cuisines.includes(c) && st.con]} onPress={() => toggle(c, cuisines, setCuisines)}><Text style={[st.ct, cuisines.includes(c) && { color: '#C56A39' }]}>{c}</Text></TouchableOpacity>)}</View>

      <Text style={st.lbl}>Ambiance</Text>
      <View style={st.cg}>{AMBIANCE.map(a => <TouchableOpacity key={a} style={[st.ch, ambiance.includes(a) && st.con]} onPress={() => toggle(a, ambiance, setAmbiance)}><Text style={[st.ct, ambiance.includes(a) && { color: '#C56A39' }]}>{a}</Text></TouchableOpacity>)}</View>

      <View style={st.r}><View style={st.h}><Text style={st.lbl}>Seating</Text><TextInput style={st.inp} value={seating} onChangeText={setSeating} keyboardType="number-pad" placeholderTextColor="#94A3B8" /></View>
        <View style={st.h}><Text style={st.lbl}>Avg Meal (DZD)</Text><TextInput style={st.inp} value={avgMealPrice} onChangeText={setAvgMealPrice} keyboardType="number-pad" placeholder="1500" placeholderTextColor="#94A3B8" /></View></View>

      <Text style={st.lbl}>Hours</Text><TextInput style={st.inp} value={openingHours} onChangeText={setOpeningHours} placeholder="08:00 - 23:00" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={wilaya} onChangeText={setWilaya} placeholder="Wilaya" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={address} onChangeText={setAddress} placeholder="Address" placeholderTextColor="#94A3B8" />
      <TextInput style={st.inp} value={phone} onChangeText={setPhone} placeholder="Phone" placeholderTextColor="#94A3B8" />

      <View style={st.tr}>
        {[{ k: 'hasDelivery', l: 'Delivery Available', v: hasDelivery, s: setHasDelivery }, { k: 'hasOutdoor', l: 'Outdoor Seating', v: hasOutdoor, s: setHasOutdoor }, { k: 'hasLiveMusic', l: 'Live Music', v: hasLiveMusic, s: setHasLiveMusic }].map(t => (
          <TouchableOpacity key={t.k} style={[st.tg, t.v && { backgroundColor: '#F0FDF4', borderColor: '#10B981' }]} onPress={() => { Haptics.selectionAsync(); t.s(!t.v); }}>
            <Ionicons name={t.v ? 'checkmark-circle' : 'close-circle-outline'} size={18} color={t.v ? '#10B981' : '#94A3B8'} />
            <Text style={[st.tgt, t.v && { color: '#059669' }]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={st.lbl}>Payment Methods</Text>
      <View style={st.cg}>{PAYMENT.map(p => <TouchableOpacity key={p} style={[st.ch, selectedPayment.includes(p) && st.con]} onPress={() => toggle(p, selectedPayment, setSelectedPayment)}><Text style={[st.ct, selectedPayment.includes(p) && { color: '#C56A39' }]}>{p}</Text></TouchableOpacity>)}</View>

      <TouchableOpacity style={st.cb} onPress={create}><Ionicons name="checkmark-circle" size={18} color="#fff" /><Text style={st.cbt}>Publish Restaurant Listing</Text></TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 }, content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { fontSize: 20, fontFamily: 'mon-b', color: '#C56A39' }, sub: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', marginTop: -6 },
  lbl: { fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  inp: { height: 48, borderRadius: 14, paddingHorizontal: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', fontFamily: 'mon-sb', color: '#0F172A' },
  ta: { height: 80, paddingTop: 12, textAlignVertical: 'top' }, r: { flexDirection: 'row', gap: 10 }, h: { flex: 1, gap: 6 },
  cg: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, ch: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  con: { backgroundColor: '#C56A39' + '12', borderColor: '#C56A39' }, ct: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, tg: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  tgt: { fontSize: 11, fontFamily: 'mon-sb', color: '#6B7280' },
  ip: { minHeight: 100, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C56A39', backgroundColor: '#FEF3E8', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 },
  ir: { gap: 8 }, tw: { position: 'relative' }, th: { width: 80, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9' }, ab: { width: 60, height: 60, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C56A39', alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 13, fontFamily: 'mon-sb', color: '#C56A39' },
  cb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#C56A39', paddingVertical: 14, borderRadius: 14 },
  cbt: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
