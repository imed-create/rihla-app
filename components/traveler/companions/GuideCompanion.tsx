import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

const ITINERARY = [
  { step: 1, title: 'Casbah Entrance', desc: 'Start at Bab El Oued gate, panoramic view of the Bay of Algiers', visited: true },
  { step: 2, title: 'Ketchaoua Mosque', desc: 'Ottoman-era mosque, UNESCO World Heritage Site', visited: true },
  { step: 3, title: 'Dar Aziza Palace', desc: 'Historic 16th-century palace with traditional tilework', visited: false },
  { step: 4, title: 'Bastion 23', desc: 'Coastal fort turned art gallery with Mediterranean views', visited: false },
  { step: 5, title: 'Local Tea Break', desc: 'Traditional mint tea & makroud at Café El Boustane', visited: false },
];

const DARJA_PHRASES = [
  { phrase: 'Saha (صحا)', meaning: 'Hello / Thank you', icon: 'hand-left-outline' },
  { phrase: 'Wesh rak? (واش راك؟)', meaning: 'How are you?', icon: 'chatbox-ellipses-outline' },
  { phrase: 'Bezzaf (بزاف)', meaning: 'A lot / Very much', icon: 'heart-outline' },
  { phrase: 'Yatik essaha (يعطيك الصحة)', meaning: 'Thank you (formal)', icon: 'thumbs-up-outline' },
  { phrase: 'B\'shweya (بشويا)', meaning: 'Slowly / Gently', icon: 'walk-outline' },
  { phrase: 'Win kayn...? (وين كاين...؟)', meaning: 'Where is...?', icon: 'navigate-outline' },
];

export default function GuideCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [itinerary, setItinerary] = useState(ITINERARY);

  const toggleVisited = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItinerary(prev => prev.map((s, i) => i === idx ? { ...s, visited: !s.visited } : s));
  };

  const visitedCount = itinerary.filter(s => s.visited).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Guide Companion</Text>
      </View>

      {/* ── GUIDE PROFILE ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.guideRow}>
          <View style={styles.guideAvatar}>
            <Text style={styles.guideAvatarText}>Y</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.guideName, { color: colors.text }]}>Yacine Boucherit</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={[styles.ratingText, { color: colors.text }]}>4.9 · Certified Local Guide</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: '#0EA5E915' }]}
            onPress={() => Alert.alert('Calling Guide', 'Calling Yacine at +213 555-XX-XX...')}
          >
            <Ionicons name="call" size={16} color="#0EA5E9" />
          </TouchableOpacity>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.guideMetaRow}>
          <View style={[styles.guideMeta, { backgroundColor: '#0EA5E910' }]}>
            <Ionicons name="language-outline" size={14} color="#0EA5E9" />
            <Text style={[styles.guideMetaText, { color: '#0EA5E9' }]}>Arabic, French, English</Text>
          </View>
          <View style={[styles.guideMeta, { backgroundColor: '#F59E0B10' }]}>
            <Ionicons name="ribbon-outline" size={14} color="#F59E0B" />
            <Text style={[styles.guideMetaText, { color: '#F59E0B' }]}>6 years exp.</Text>
          </View>
        </View>
      </View>

      {/* ── WALKING ITINERARY CHECKLIST ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>📍 Walking Itinerary ({visitedCount}/{itinerary.length})</Text>
      <View style={[styles.itineraryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {itinerary.map((stop, i) => (
          <TouchableOpacity key={i} style={[styles.itRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]} onPress={() => toggleVisited(i)}>
            <View style={styles.itLeft}>
              <View style={[styles.stepCircle, stop.visited ? styles.stepDone : { borderColor: colors.border }]}>
                {stop.visited ? <Ionicons name="checkmark" size={12} color="#FFF" /> : <Text style={[styles.stepNum, { color: colors.muted }]}>{stop.step}</Text>}
              </View>
              {i < itinerary.length - 1 && <View style={[styles.stepLine, { backgroundColor: stop.visited ? '#0EA5E9' : colors.border }]} />}
            </View>
            <View style={styles.itContent}>
              <Text style={[styles.itTitle, { color: colors.text }, stop.visited && styles.itVisited]}>{stop.title}</Text>
              <Text style={[styles.itDesc, { color: colors.muted }]}>{stop.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── DIALECT AUDIO PHRASES ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🗣️ Algerian Darja Quick Phrases</Text>
      <View style={[styles.phrasesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {DARJA_PHRASES.map((p, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.phraseRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('🔊 Listen', `"${p.phrase}"\nMeaning: ${p.meaning}`);
            }}
          >
            <View style={[styles.phraseIcon, { backgroundColor: '#0EA5E910' }]}>
              <Ionicons name={p.icon as any} size={16} color="#0EA5E9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phraseText, { color: colors.text }]}>{p.phrase}</Text>
              <Text style={[styles.phraseMeaning, { color: colors.muted }]}>{p.meaning}</Text>
            </View>
            <Ionicons name="volume-high-outline" size={18} color="#0EA5E9" />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TIP YOUR GUIDE ── */}
      <TouchableOpacity
        style={styles.tipBtn}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Tip Sent! 🎉', 'Your generous tip of 500 DA has been sent to Yacine. Shukran!');
        }}
      >
        <Ionicons name="gift-outline" size={18} color="#FFF" />
        <Text style={styles.tipText}>Tip Your Guide</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b' },

  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12, marginBottom: 16 },
  guideRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guideAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0EA5E915', borderWidth: 1.5, borderColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' },
  guideAvatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#0EA5E9' },
  guideName: { fontSize: 15, fontFamily: 'mon-b' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 10, fontFamily: 'mon-sb' },
  callBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1 },
  guideMetaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  guideMetaText: { fontSize: 11, fontFamily: 'mon-sb' },

  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10, marginTop: 4 },

  itineraryCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  itRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 14 },
  itLeft: { width: 30, alignItems: 'center' },
  stepCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: '#0EA5E9', borderColor: '#0EA5E9' },
  stepNum: { fontSize: 10, fontFamily: 'mon-b' },
  stepLine: { width: 2, flex: 1, marginTop: 4 },
  itContent: { flex: 1, paddingLeft: 10 },
  itTitle: { fontSize: 13, fontFamily: 'mon-sb' },
  itVisited: { textDecorationLine: 'line-through', opacity: 0.5 },
  itDesc: { fontSize: 11, fontFamily: 'mon', marginTop: 2 },

  phrasesCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  phraseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  phraseIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  phraseText: { fontSize: 14, fontFamily: 'mon-sb' },
  phraseMeaning: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },

  tipBtn: { height: 52, borderRadius: 16, backgroundColor: '#0EA5E9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tipText: { color: '#FFF', fontSize: 15, fontFamily: 'mon-b' },
});
