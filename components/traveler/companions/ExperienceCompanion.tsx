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

const MULTI_DAY_ROUTE = [
  { day: 'Day 1', title: 'Algiers → Tikjda', stops: ['Blida Atlas Pass', 'Chréa National Park', 'Tikjda Ski Station'], completed: true },
  { day: 'Day 2', title: 'Tikjda → Djurdjura', stops: ['Tikjda Caves', 'Summit Trek (2308m)', 'Berber Village Lunch'], completed: true },
  { day: 'Day 3', title: 'Djurdjura → Béjaïa', stops: ['Gorges de Kherrata', 'Cap Carbon Lighthouse', 'Béjaïa Bay Sunset'], completed: false },
  { day: 'Day 4', title: 'Béjaïa → Return', stops: ['Gouraya National Park', 'Local Market Visit', 'Airport Transfer'], completed: false },
];

const PACKING_ESSENTIALS = [
  { item: 'Passport / National ID', packed: true },
  { item: 'Travel insurance docs', packed: true },
  { item: 'Comfortable walking shoes', packed: false },
  { item: 'Portable charger', packed: false },
  { item: 'Warm layer (mountain nights)', packed: true },
  { item: 'Reusable water bottle', packed: false },
];

const EMERGENCY_CONTACTS = [
  { label: 'Experience Leader', name: 'Rafik M.', phone: '+213 661-XX-XX', icon: 'person-circle', color: '#6366F1' },
  { label: 'Local Emergency', name: 'Protection Civile', phone: '14', icon: 'medkit', color: '#EF4444' },
  { label: 'Embassy Hotline', name: 'Consular Assistance', phone: '+213 21-XX-XX', icon: 'globe', color: '#0EA5E9' },
];

export default function ExperienceCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [route, setRoute] = useState(MULTI_DAY_ROUTE);
  const [packList, setPackList] = useState(PACKING_ESSENTIALS);

  const toggleDay = (dayIdx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRoute(prev => prev.map((d, i) => i === dayIdx ? { ...d, completed: !d.completed } : d));
  };

  const togglePack = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPackList(prev => prev.map((p, i) => i === idx ? { ...p, packed: !p.packed } : p));
  };

  const completedDays = route.filter(d => d.completed).length;
  const packedCount = packList.filter(p => p.packed).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Experience Companion</Text>
      </View>

      {/* ── EXPERIENCE OVERVIEW ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.expTitle, { color: colors.text }]}>{booking.title}</Text>
        <Text style={[styles.expSub, { color: colors.muted }]}>{booking.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: '#6366F115' }]}>
            <Ionicons name="calendar-outline" size={14} color="#6366F1" />
            <Text style={[styles.statText, { color: '#6366F1' }]}>{route.length} Days</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#10B98115' }]}>
            <Ionicons name="location-outline" size={14} color="#10B981" />
            <Text style={[styles.statText, { color: '#10B981' }]}>{route.reduce((sum, d) => sum + d.stops.length, 0)} Stops</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#F59E0B15' }]}>
            <Ionicons name="people-outline" size={14} color="#F59E0B" />
            <Text style={[styles.statText, { color: '#F59E0B' }]}>Small Group</Text>
          </View>
        </View>
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={[styles.progressCard, { backgroundColor: isDark ? '#1A2332' : '#EFF6FF', borderColor: isDark ? '#1E3A5F' : '#BFDBFE' }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: '#3B82F6' }]}>Journey Progress</Text>
          <Text style={[styles.progressVal, { color: '#3B82F6' }]}>{completedDays}/{route.length} days</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1E3A5F' : '#BFDBFE' }]}>
          <View style={[styles.progressFill, { width: `${(completedDays / route.length) * 100}%` }]} />
        </View>
      </View>

      {/* ── MULTI-DAY ROUTE TIMELINE ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🗺️ Route Timeline</Text>
      {route.map((day, i) => (
        <TouchableOpacity key={i} style={[styles.dayCard, { backgroundColor: colors.card, borderColor: day.completed ? '#6366F140' : colors.border }]} onPress={() => toggleDay(i)}>
          <View style={styles.dayHeader}>
            <View style={[styles.dayBadge, { backgroundColor: day.completed ? '#6366F1' : colors.border }]}>
              <Text style={[styles.dayBadgeText, { color: day.completed ? '#FFF' : colors.muted }]}>{day.day}</Text>
            </View>
            <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>
            {day.completed && <Ionicons name="checkmark-circle" size={18} color="#6366F1" />}
          </View>
          <View style={styles.stopsRow}>
            {day.stops.map((stop, j) => (
              <View key={j} style={styles.stopItem}>
                <View style={[styles.stopDot, { backgroundColor: day.completed ? '#6366F1' : colors.muted }]} />
                <Text style={[styles.stopText, { color: colors.muted }]}>{stop}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}

      {/* ── PACKING CHECKLIST ── */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>🎒 Packing Essentials ({packedCount}/{packList.length})</Text>
      <View style={[styles.packCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {packList.map((p, i) => (
          <TouchableOpacity key={i} style={[styles.packRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]} onPress={() => togglePack(i)}>
            <View style={[styles.checkbox, p.packed && styles.checkboxChecked]}>
              {p.packed && <Ionicons name="checkmark" size={12} color="#FFF" />}
            </View>
            <Text style={[styles.packText, { color: colors.text }, p.packed && styles.packDone]}>{p.item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── EMERGENCY CONTACTS ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🚨 Emergency Contacts</Text>
      {EMERGENCY_CONTACTS.map((c, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.emergCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert(`Calling ${c.name}`, `Dialing ${c.phone}...`)}
        >
          <View style={[styles.emergIcon, { backgroundColor: c.color + '15' }]}>
            <Ionicons name={c.icon as any} size={18} color={c.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.emergLabel, { color: colors.muted }]}>{c.label}</Text>
            <Text style={[styles.emergName, { color: colors.text }]}>{c.name}</Text>
          </View>
          <Ionicons name="call" size={16} color={c.color} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b' },

  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10, marginBottom: 16 },
  expTitle: { fontSize: 18, fontFamily: 'mon-b' },
  expSub: { fontSize: 13, fontFamily: 'mon' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statText: { fontSize: 11, fontFamily: 'mon-sb' },

  progressCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontFamily: 'mon-sb' },
  progressVal: { fontSize: 12, fontFamily: 'mon-b' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 },

  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10, marginTop: 4 },

  dayCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dayBadgeText: { fontSize: 11, fontFamily: 'mon-b' },
  dayTitle: { flex: 1, fontSize: 14, fontFamily: 'mon-sb' },
  stopsRow: { gap: 6, paddingLeft: 4 },
  stopItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stopDot: { width: 6, height: 6, borderRadius: 3 },
  stopText: { fontSize: 12, fontFamily: 'mon' },

  packCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  packText: { fontSize: 13, fontFamily: 'mon', flex: 1 },
  packDone: { textDecorationLine: 'line-through', opacity: 0.5 },

  emergCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  emergIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emergLabel: { fontSize: 10, fontFamily: 'mon-b' },
  emergName: { fontSize: 13, fontFamily: 'mon-sb' },
});
