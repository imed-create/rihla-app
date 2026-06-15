import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const INITIAL_SLOTS = [
  { id: '1', time: '09:00 - 11:00', title: 'Casbah Photography Session', package: 'Premium Video + 30 Pixels', guest: 'Lyna K.', status: 'ready' },
  { id: '2', time: '14:00 - 15:30', title: 'Parasailing Adventure Shoot', package: 'Drone Footage Addon', guest: 'Faris M.', status: 'delivered' },
];

export default function ActivityPartnerOverview() {
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const { colors } = useTheme();

  const toggleDelivery = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSlots(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'ready' ? 'delivered' : 'ready';
        if (nextStatus === 'delivered') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  return (
    <View style={styles.container}>
      {/* ── TIME SLOT ALLOCATION ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Booked Photo & Adventure Slots</Text>
      <View style={styles.slotList}>
        {slots.map(slot => (
          <View key={slot.id} style={[styles.slotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.slotHeader}>
              <View style={styles.slotTimeBlock}>
                <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
                <Text style={[styles.slotTime, { color: colors.text }]}>{slot.time}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: slot.status === 'delivered' ? '#ECFDF5' : '#FFFBEB' }]}>
                <Text style={[styles.statusBadgeText, { color: slot.status === 'delivered' ? '#10B981' : '#D97706' }]}>
                  {slot.status === 'delivered' ? 'Photos Delivered' : 'Processing Output'}
                </Text>
              </View>
            </View>

            <View style={styles.slotBody}>
              <Text style={[styles.slotTitle, { color: colors.text }]}>{slot.title}</Text>
              <Text style={[styles.slotGuest, { color: colors.muted }]}>Client: {slot.guest} · Package: {slot.package}</Text>
            </View>

            <Pressable
              style={[styles.deliverBtn, slot.status === 'delivered' && styles.deliverBtnActive]}
              onPress={() => toggleDelivery(slot.id)}
            >
              <Ionicons name={slot.status === 'delivered' ? 'checkmark-circle' : 'cloud-upload-outline'} size={18} color="#FFF" />
              <Text style={styles.deliverText}>
                {slot.status === 'delivered' ? 'Delivered successfully' : 'Upload & Deliver Digital Files'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b' },
  
  slotList: { gap: 12 },
  slotCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotTimeBlock: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  slotTime: { fontSize: 12, fontFamily: 'mon-b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontFamily: 'mon-sb' },
  
  slotBody: { gap: 4 },
  slotTitle: { fontSize: 14, fontFamily: 'mon-b' },
  slotGuest: { fontSize: 12, fontFamily: 'mon' },
  
  deliverBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: RIHLA.accent },
  deliverBtnActive: { backgroundColor: '#10B981' },
  deliverText: { color: '#FFF', fontFamily: 'mon-sb', fontSize: 13 },
});
