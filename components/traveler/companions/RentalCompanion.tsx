import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

const HOUSE_RULES = [
  { icon: 'volume-off-outline', text: 'No loud noise after 22:00' },
  { icon: 'paw-outline', text: 'No pets allowed' },
  { icon: 'bonfire-outline', text: 'No smoking indoors' },
  { icon: 'trash-outline', text: 'Take trash to bin area before check-out' },
];

const AMENITIES = [
  { icon: 'wifi-outline', label: 'WiFi', detail: 'SSID: DarSahra_5G · Pass: bienvenue2026' },
  { icon: 'snow-outline', label: 'A/C', detail: 'Remote on living room shelf' },
  { icon: 'car-outline', label: 'Parking', detail: 'Spot #B12, underground level' },
  { icon: 'water-outline', label: 'Pool', detail: 'Open 08:00 – 21:00 daily' },
];

export default function RentalCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [chatMsg, setChatMsg] = useState('');
  const [chats, setChats] = useState([
    { id: '1', sender: 'host', text: 'Merhba bik! Your apartment is ready. Smart lock code sent below 🏠' }
  ]);

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChats(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: chatMsg }]);
    setChatMsg('');
    setTimeout(() => {
      setChats(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'host', text: 'Noted! I\'ll handle that for you.' }]);
    }, 1200);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rental Stay Companion</Text>
      </View>

      {/* ── CHECK-IN CARD ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.checkInHeader}>
          <View>
            <Text style={[styles.labelMuted, { color: colors.muted }]}>PROPERTY</Text>
            <Text style={[styles.propName, { color: colors.text }]}>{booking.title}</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active Stay</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stayDates}>
          <View style={styles.dateCol}>
            <Text style={[styles.dateLabel, { color: colors.muted }]}>Check-In</Text>
            <Text style={[styles.dateVal, { color: colors.text }]}>{String(booking.details?.check_in || '2026-06-12')}</Text>
          </View>
          <Ionicons name="arrow-forward" size={14} color={colors.muted} />
          <View style={styles.dateCol}>
            <Text style={[styles.dateLabel, { color: colors.muted }]}>Check-Out</Text>
            <Text style={[styles.dateVal, { color: colors.text }]}>{String(booking.details?.check_out || '2026-06-16')}</Text>
          </View>
        </View>
      </View>

      {/* ── SMART LOCK CODE ── */}
      <View style={[styles.lockCard, { backgroundColor: isDark ? '#1A2332' : '#EFF6FF', borderColor: isDark ? '#1E3A5F' : '#BFDBFE' }]}>
        <Ionicons name="lock-closed" size={20} color="#3B82F6" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.lockLabel, { color: '#3B82F6' }]}>Smart Lock Code</Text>
          <Text style={[styles.lockCode, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>4 – 7 – 2 – 9 – 1</Text>
        </View>
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Copied!', 'Lock code copied to clipboard.'); }}>
          <Ionicons name="copy-outline" size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* ── AMENITIES ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🏡 Property Amenities</Text>
      {AMENITIES.map((a, i) => (
        <View key={i} style={[styles.amenityRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.amenityIcon, { backgroundColor: '#8B5CF615' }]}>
            <Ionicons name={a.icon as any} size={18} color="#8B5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.amenityLabel, { color: colors.text }]}>{a.label}</Text>
            <Text style={[styles.amenityDetail, { color: colors.muted }]}>{a.detail}</Text>
          </View>
        </View>
      ))}

      {/* ── HOUSE RULES ── */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 8 }]}>📋 House Rules</Text>
      <View style={[styles.rulesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {HOUSE_RULES.map((r, i) => (
          <View key={i} style={[styles.ruleRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Ionicons name={r.icon as any} size={16} color={colors.muted} />
            <Text style={[styles.ruleText, { color: colors.text }]}>{r.text}</Text>
          </View>
        ))}
      </View>

      {/* ── HOST CHAT ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Message Host</Text>
      <View style={[styles.chatBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ScrollView style={styles.chatScroll} nestedScrollEnabled>
          {chats.map((c) => (
            <View key={c.id} style={[styles.msgBubble, c.sender === 'user' ? styles.msgUser : [styles.msgHost, { backgroundColor: colors.bg }]]}>
              <Text style={[styles.msgText, { color: c.sender === 'user' ? '#FFF' : colors.text }]}>{c.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.chatInputRow, { borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.chatInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Ask your host anything..."
            placeholderTextColor={colors.muted}
            value={chatMsg}
            onChangeText={setChatMsg}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
            <Ionicons name="send" size={16} color="#FFF" />
          </TouchableOpacity>
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

  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12, marginBottom: 16 },
  checkInHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelMuted: { fontSize: 10, fontFamily: 'mon-b' },
  propName: { fontSize: 18, fontFamily: 'mon-b', marginTop: 2 },
  activeBadge: { backgroundColor: '#8B5CF615', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  activeBadgeText: { color: '#8B5CF6', fontSize: 11, fontFamily: 'mon-sb' },
  divider: { height: 1 },
  stayDates: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateCol: { gap: 2 },
  dateLabel: { fontSize: 10, fontFamily: 'mon-b' },
  dateVal: { fontSize: 13, fontFamily: 'mon-sb' },

  lockCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  lockLabel: { fontSize: 11, fontFamily: 'mon-sb' },
  lockCode: { fontSize: 20, fontFamily: 'mon-b', letterSpacing: 4, marginTop: 2 },

  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10 },
  amenityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  amenityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  amenityLabel: { fontSize: 13, fontFamily: 'mon-sb' },
  amenityDetail: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },

  rulesCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  ruleText: { fontSize: 12, fontFamily: 'mon', flex: 1 },

  chatBox: { borderRadius: 18, borderWidth: 1, height: 200, overflow: 'hidden' },
  chatScroll: { flex: 1, padding: 12 },
  msgBubble: { padding: 10, borderRadius: 10, marginBottom: 8, maxWidth: '85%' },
  msgUser: { backgroundColor: '#8B5CF6', alignSelf: 'flex-end' },
  msgHost: { alignSelf: 'flex-start' },
  msgText: { fontSize: 12, fontFamily: 'mon-sb' },
  chatInputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, gap: 8, alignItems: 'center' },
  chatInput: { flex: 1, height: 36, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, fontSize: 12, fontFamily: 'mon' },
  sendBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' },
});
