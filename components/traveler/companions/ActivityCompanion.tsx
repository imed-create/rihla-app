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

const TIMELINE_STEPS = [
  { time: '07:00', title: 'Meeting Point', desc: 'Gather at the base camp parking lot', icon: 'flag-outline', done: true },
  { time: '07:30', title: 'Safety Briefing', desc: 'Equipment check & route overview', icon: 'shield-checkmark-outline', done: true },
  { time: '08:00', title: 'Trail Start', desc: 'Begin the ascent towards Tikjda ridge', icon: 'trail-sign-outline', done: false },
  { time: '11:30', title: 'Summit / Lunch Break', desc: 'Panoramic views & packed lunch', icon: 'sunny-outline', done: false },
  { time: '14:00', title: 'Descent & Return', desc: 'Guided descent back to base camp', icon: 'arrow-down-circle-outline', done: false },
];

const PACKING_ITEMS = [
  { item: 'Hiking boots (ankle-support)', checked: true },
  { item: 'Windproof jacket', checked: true },
  { item: '2L water bottle', checked: false },
  { item: 'Sunscreen SPF 50+', checked: false },
  { item: 'Trail snacks / energy bars', checked: false },
  { item: 'First-aid kit', checked: true },
  { item: 'Headlamp / flashlight', checked: false },
];

export default function ActivityCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [packList, setPackList] = useState(PACKING_ITEMS);

  const togglePack = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPackList(prev => prev.map((p, i) => i === idx ? { ...p, checked: !p.checked } : p));
  };

  const packedCount = packList.filter(p => p.checked).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Activity Companion</Text>
      </View>

      {/* ── ACTIVITY INFO CARD ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.actTitle, { color: colors.text }]}>{booking.title}</Text>
        <Text style={[styles.actSub, { color: colors.muted }]}>{booking.subtitle}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: '#F59E0B15' }]}>
            <Ionicons name="fitness-outline" size={14} color="#F59E0B" />
            <Text style={[styles.metaText, { color: '#F59E0B' }]}>Moderate</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="time-outline" size={14} color="#10B981" />
            <Text style={[styles.metaText, { color: '#10B981' }]}>~7 hours</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: '#6366F115' }]}>
            <Ionicons name="people-outline" size={14} color="#6366F1" />
            <Text style={[styles.metaText, { color: '#6366F1' }]}>Group (8)</Text>
          </View>
        </View>
      </View>

      {/* ── WEATHER CONDITIONS ── */}
      <View style={[styles.weatherCard, { backgroundColor: isDark ? '#1A2E1A' : '#ECFDF5', borderColor: isDark ? '#16A34A30' : '#A7F3D0' }]}>
        <Ionicons name="partly-sunny" size={22} color="#16A34A" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.weatherTitle, { color: '#16A34A' }]}>Today's Conditions</Text>
          <Text style={[styles.weatherDetail, { color: isDark ? '#86EFAC' : '#15803D' }]}>28°C · Sunny with light breeze · UV Index: 6</Text>
        </View>
      </View>

      {/* ── EXPEDITION TIMELINE ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🗺️ Expedition Timeline</Text>
      <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TIMELINE_STEPS.map((step, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <Text style={[styles.timelineTime, { color: colors.muted }]}>{step.time}</Text>
              {i < TIMELINE_STEPS.length - 1 && (
                <View style={[styles.timelineLine, { backgroundColor: step.done ? '#16A34A' : colors.border }]} />
              )}
            </View>
            <View style={[styles.timelineDot, { backgroundColor: step.done ? '#16A34A' : colors.border }]}>
              {step.done && <Ionicons name="checkmark" size={10} color="#FFF" />}
            </View>
            <View style={[styles.timelineContent, i < TIMELINE_STEPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={styles.timelineTitleRow}>
                <Ionicons name={step.icon as any} size={14} color={step.done ? '#16A34A' : colors.muted} />
                <Text style={[styles.timelineTitle, { color: colors.text }]}>{step.title}</Text>
              </View>
              <Text style={[styles.timelineDesc, { color: colors.muted }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── PACKING CHECKLIST ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🎒 Packing Checklist ({packedCount}/{packList.length})</Text>
      <View style={[styles.packCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {packList.map((p, i) => (
          <TouchableOpacity key={i} style={[styles.packRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]} onPress={() => togglePack(i)}>
            <View style={[styles.checkbox, p.checked && styles.checkboxChecked]}>
              {p.checked && <Ionicons name="checkmark" size={12} color="#FFF" />}
            </View>
            <Text style={[styles.packText, { color: colors.text }, p.checked && styles.packDone]}>{p.item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── EMERGENCY CONTACTS ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🚨 Emergency Contacts</Text>
      <View style={styles.emergencyRow}>
        <TouchableOpacity
          style={[styles.emergBtn, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); Alert.alert('Calling Emergency', 'Dialing Protection Civile at 14...'); }}
        >
          <Ionicons name="call" size={16} color="#EF4444" />
          <Text style={[styles.emergLabel, { color: '#EF4444' }]}>Emergency 14</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emergBtn, { backgroundColor: '#3B82F615', borderColor: '#3B82F640' }]}
          onPress={() => Alert.alert('Guide Contact', 'Calling your guide Rafik at +213 551-XX-XX...')}
        >
          <Ionicons name="person" size={16} color="#3B82F6" />
          <Text style={[styles.emergLabel, { color: '#3B82F6' }]}>Call Guide</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b' },

  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10, marginBottom: 16 },
  actTitle: { fontSize: 18, fontFamily: 'mon-b' },
  actSub: { fontSize: 13, fontFamily: 'mon' },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  metaText: { fontSize: 11, fontFamily: 'mon-sb' },

  weatherCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  weatherTitle: { fontSize: 12, fontFamily: 'mon-sb' },
  weatherDetail: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },

  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10, marginTop: 4 },

  timelineCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 56 },
  timelineLeft: { width: 42, alignItems: 'center' },
  timelineTime: { fontSize: 10, fontFamily: 'mon-sb' },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  timelineDot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 12 },
  timelineTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timelineTitle: { fontSize: 13, fontFamily: 'mon-sb' },
  timelineDesc: { fontSize: 11, fontFamily: 'mon', marginTop: 2 },

  packCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  packText: { fontSize: 13, fontFamily: 'mon', flex: 1 },
  packDone: { textDecorationLine: 'line-through', opacity: 0.5 },

  emergencyRow: { flexDirection: 'row', gap: 10 },
  emergBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  emergLabel: { fontSize: 12, fontFamily: 'mon-sb' },
});
