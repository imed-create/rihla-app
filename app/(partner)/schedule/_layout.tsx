/**
 * RIHLA — Partner Schedule Layout
 * ─────────────────────────────────
 * Serves as the default schedule route (availability settings)
 * with navigation to the day-view for live task management.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PartnerScheduleLayout() {
  return (
    <ProScreenChrome role="partner" title="Schedule" subtitle="Set your availability">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Live Dispatch CTA */}
        <TouchableOpacity
          style={styles.liveCta}
          activeOpacity={0.85}
          onPress={() => router.push('/(partner)/dispatch' as any)}
        >
          <View style={styles.liveCtaLeft}>
            <View style={styles.liveDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.liveCtaTitle}>Live Dispatch</Text>
              <Text style={styles.liveCtaSub}>Today's tasks, pickups & departures</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#00a896" />
        </TouchableOpacity>

        <View style={styles.panel}>
          <View style={styles.panelTop}>
            <Text style={styles.panelTitle}>This week</Text>
            <View style={styles.pill}>
              <Ionicons name="time-outline" size={14} color="#00a896" />
              <Text style={styles.pillText}>10:00 → 18:00</Text>
            </View>
          </View>
          <Text style={styles.muted}>
            Set your weekly availability windows. Clients can only book during these hours.
          </Text>
        </View>

        <View style={styles.weekRow}>
          {DAYS.map((d) => (
            <View key={d} style={styles.dayChip}>
              <Text style={styles.dayText}>{d}</Text>
              <View style={styles.dot} />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.cta} activeOpacity={0.9}>
          <Ionicons name="calendar-outline" size={18} color="#0F172A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Add blackout dates</Text>
            <Text style={styles.ctaSub}>Mark unavailable days (maintenance, travel, etc.)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cta} activeOpacity={0.9}>
          <Ionicons name="repeat-outline" size={18} color="#0F172A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Weekly hours</Text>
            <Text style={styles.ctaSub}>Choose default hours for rentals</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },

  // Live CTA
  liveCta: {
    backgroundColor: '#E6FAF7',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  liveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  liveCtaTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  liveCtaSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 1 },

  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  panelTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  panelTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#00a896' },
  muted: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  dayChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  dayText: { fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A7F3D0' },
  cta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  ctaTitle: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  ctaSub: { fontSize: 11, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
});
