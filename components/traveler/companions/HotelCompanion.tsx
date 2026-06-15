import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

export default function HotelCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [chatMsg, setChatMsg] = useState('');
  const [chats, setChats] = useState([
    { id: '1', sender: 'hotel', text: 'Welcome to Hotel El Djazair! Let us know if you need anything.' }
  ]);

  const handleRequest = (serviceName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Concierge Request', `${serviceName} request has been sent to the front desk. A staff member is on it!`);
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChats(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: chatMsg }
    ]);
    setChatMsg('');
    setTimeout(() => {
      setChats(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'hotel', text: 'Received. We will get back to you shortly!' }
      ]);
    }, 1000);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hotel Stay Companion</Text>
      </View>

      {/* ── ROOM & STAY WIDGET ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.roomHeader}>
          <View>
            <Text style={[styles.roomLabel, { color: colors.muted }]}>ROOM NUMBER</Text>
            <Text style={[styles.roomNo, { color: colors.text }]}>{booking.details?.room_type ? 'Room 205' : 'Room 104'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active Stay</Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stayDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.muted }]}>Check-In Date</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>{booking.details?.check_in || '2026-06-10'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailKey, { color: colors.muted }]}>Check-Out Date</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>{booking.details?.check_out || '2026-06-14'}</Text>
          </View>
        </View>
      </View>

      {/* ── CONCIERGE ASSISTANCE (BENTO GRID) ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🛎️ Room Stay Services</Text>
      <View style={styles.bentoGrid}>
        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleRequest('Extra Towels')}
        >
          <Ionicons name="shirt-outline" size={24} color="#1A6B3A" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Clean Towels</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleRequest('Room Cleaning')}
        >
          <Ionicons name="sparkles-outline" size={24} color="#1A6B3A" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Clean Room</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleRequest('Late Check-out')}
        >
          <Ionicons name="time-outline" size={24} color="#1A6B3A" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Late Check-out</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Calling Front Desk', 'Dialing hotel lobby at +213 21 00-00-00...');
          }}
        >
          <Ionicons name="call-outline" size={24} color="#1A6B3A" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Lobby Call</Text>
        </TouchableOpacity>
      </View>

      {/* ── RECEPTION CHAT LOCKER ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Front Desk Chat</Text>
      <View style={[styles.chatBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ScrollView style={styles.chatScroll} nestedScrollEnabled>
          {chats.map((c) => (
            <View key={c.id} style={[styles.msgBubble, c.sender === 'user' ? styles.msgUser : [styles.msgHotel, { backgroundColor: colors.bg }]]}>
              <Text style={[styles.msgText, { color: c.sender === 'user' ? '#FFF' : colors.text }]}>{c.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.chatInputRow, { borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.chatInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Type request details..."
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomLabel: {
    fontSize: 10,
    fontFamily: 'mon-b',
  },
  roomNo: {
    fontSize: 22,
    fontFamily: 'mon-b',
  },
  badge: {
    backgroundColor: '#1A6B3A12',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    color: '#1A6B3A',
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  divider: {
    height: 1,
  },
  stayDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailKey: {
    fontSize: 12,
    fontFamily: 'mon',
  },
  detailVal: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
    marginBottom: 12,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  bentoCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  bentoLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  chatBox: {
    borderRadius: 18,
    borderWidth: 1,
    height: 200,
    overflow: 'hidden',
  },
  chatScroll: {
    flex: 1,
    padding: 12,
  },
  msgBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '85%',
  },
  msgUser: {
    backgroundColor: '#1A6B3A',
    alignSelf: 'flex-end',
  },
  msgHotel: {
    alignSelf: 'flex-start',
  },
  msgText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  chatInputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'mon',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A6B3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
