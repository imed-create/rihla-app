import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

const LINEUP_SCHEDULE = [
  { time: '18:00', act: 'Doors Open', stage: 'Main Gate', active: true },
  { time: '19:00', act: 'DJ Djalil', stage: 'Stage A', active: false },
  { time: '20:30', act: 'Cheb Khaled', stage: 'Main Stage', active: false },
  { time: '22:00', act: 'Soolking', stage: 'Main Stage', active: false },
  { time: '23:30', act: 'Afterparty Set', stage: 'Rooftop Lounge', active: false },
];

const VOUCHERS = [
  { label: '1× Beverage', code: 'DRK-2026-A1', used: false },
  { label: '1× Snack Plate', code: 'SNK-2026-B3', used: false },
  { label: 'VIP Lounge Pass', code: 'VIP-2026-X9', used: true },
];

export default function EventCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [vouchers, setVouchers] = useState(VOUCHERS);

  const handleUseVoucher = (idx: number) => {
    if (vouchers[idx].used) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Voucher Activated', `${vouchers[idx].label} has been redeemed! Show this to staff.`);
    setVouchers(prev => prev.map((v, i) => i === idx ? { ...v, used: true } : v));
  };

  const qrValue = JSON.stringify({
    id: booking.id,
    type: 'event_pass',
    title: booking.title,
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Event Companion</Text>
      </View>

      {/* ── GLOWING QR PASS TICKET ── */}
      <View style={[styles.ticketCard, { backgroundColor: isDark ? '#2D1B4E' : '#F5F3FF', borderColor: isDark ? '#7C3AED40' : '#C4B5FD' }]}>
        <View style={styles.ticketTop}>
          <View>
            <Text style={[styles.ticketTitle, { color: isDark ? '#C4B5FD' : '#6D28D9' }]}>{booking.title}</Text>
            <Text style={[styles.ticketSub, { color: colors.muted }]}>{booking.subtitle}</Text>
          </View>
          <View style={[styles.passBadge, { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.passBadgeText}>PASS</Text>
          </View>
        </View>
        <View style={styles.qrWrap}>
          <View style={styles.qrGlow}>
            <QRCode
              value={qrValue}
              size={140}
              color={isDark ? '#C4B5FD' : '#6D28D9'}
              backgroundColor={isDark ? '#2D1B4E' : '#F5F3FF'}
            />
          </View>
        </View>
        <Text style={[styles.qrHint, { color: colors.muted }]}>Present to door staff for entry scan</Text>
      </View>

      {/* ── LINEUP SCHEDULE ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🎤 Line-Up Schedule</Text>
      <View style={[styles.lineupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LINEUP_SCHEDULE.map((item, i) => (
          <View key={i} style={[styles.lineupRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Text style={[styles.lineupTime, { color: item.active ? '#7C3AED' : colors.muted }]}>{item.time}</Text>
            <View style={styles.lineupInfo}>
              <Text style={[styles.lineupAct, { color: colors.text }]}>{item.act}</Text>
              <Text style={[styles.lineupStage, { color: colors.muted }]}>{item.stage}</Text>
            </View>
            {item.active && (
              <View style={styles.liveDot}>
                <View style={styles.liveDotInner} />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* ── FOOD & BEVERAGE VOUCHERS ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🎟️ F&B Vouchers</Text>
      <View style={styles.voucherGrid}>
        {vouchers.map((v, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.voucherCard, { backgroundColor: v.used ? (isDark ? '#1A1A1A' : '#F1F5F9') : colors.card, borderColor: v.used ? colors.border : '#7C3AED40' }]}
            onPress={() => handleUseVoucher(i)}
            disabled={v.used}
          >
            <View style={[styles.voucherIcon, { backgroundColor: v.used ? '#9CA3AF20' : '#7C3AED15' }]}>
              <Ionicons name={v.used ? 'checkmark-done' : 'ticket-outline'} size={20} color={v.used ? '#9CA3AF' : '#7C3AED'} />
            </View>
            <Text style={[styles.voucherLabel, { color: v.used ? colors.muted : colors.text }]}>{v.label}</Text>
            <Text style={[styles.voucherCode, { color: colors.muted }]}>{v.code}</Text>
            <View style={[styles.voucherStatus, { backgroundColor: v.used ? '#9CA3AF20' : '#7C3AED15' }]}>
              <Text style={{ color: v.used ? '#9CA3AF' : '#7C3AED', fontSize: 10, fontFamily: 'mon-sb' }}>{v.used ? 'Used' : 'Tap to Use'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── VENUE MAP NOTE ── */}
      <View style={[styles.venueNote, { backgroundColor: isDark ? '#2D1F00' : '#FFFBEB', borderColor: isDark ? '#5C3D00' : '#FEF3C7' }]}>
        <Ionicons name="map-outline" size={18} color="#D97706" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.venueNoteTitle, { color: '#D97706' }]}>Venue Map</Text>
          <Text style={[styles.venueNoteText, { color: isDark ? '#FCD34D' : '#92400E' }]}>Stage map and venue layout are available at the info desk near Gate B.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b' },

  ticketCard: { borderRadius: 20, borderWidth: 1.5, padding: 20, alignItems: 'center', marginBottom: 16 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 16 },
  ticketTitle: { fontSize: 17, fontFamily: 'mon-b' },
  ticketSub: { fontSize: 12, fontFamily: 'mon', marginTop: 2 },
  passBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  passBadgeText: { color: '#FFF', fontSize: 10, fontFamily: 'mon-b', letterSpacing: 2 },
  qrWrap: { alignItems: 'center', marginBottom: 12 },
  qrGlow: {
    padding: 16,
    borderRadius: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  qrHint: { fontSize: 11, fontFamily: 'mon' },

  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10, marginTop: 4 },

  lineupCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  lineupRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  lineupTime: { fontSize: 12, fontFamily: 'mon-b', width: 42 },
  lineupInfo: { flex: 1 },
  lineupAct: { fontSize: 14, fontFamily: 'mon-sb' },
  lineupStage: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },
  liveDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF444420', alignItems: 'center', justifyContent: 'center' },
  liveDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },

  voucherGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  voucherCard: { width: '48%', borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
  voucherIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  voucherLabel: { fontSize: 13, fontFamily: 'mon-sb', textAlign: 'center' },
  voucherCode: { fontSize: 9, fontFamily: 'mon', letterSpacing: 1 },
  voucherStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  venueNote: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  venueNoteTitle: { fontSize: 12, fontFamily: 'mon-sb' },
  venueNoteText: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },
});
