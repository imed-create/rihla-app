import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';
import CountdownTimer from '../shared/CountdownTimer';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

export default function BeachCompanion({ booking, onBack }: CompanionProps) {
  const { colors } = useTheme();

  const handleBentoPress = (serviceName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to beach sub-service list or details
    router.push(`/services/beach/${booking.businessId || 'sahel-beach-1'}` as any);
  };

  const isPending = booking.status === 'pending';

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Beach Spot Companion</Text>
      </View>

      {/* ── FLAG FORECAST CARD ── */}
      <View style={[styles.forecastCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.forecastHeader}>
          <Text style={[styles.forecastTitle, { color: colors.text }]}>Sea Safety Condition</Text>
          <View style={styles.flagBadge}>
            <View style={styles.flagDot} />
            <Text style={styles.flagText}>Calm Sea (Green Flag)</Text>
          </View>
        </View>
        <Text style={[styles.forecastDesc, { color: colors.muted }]}>
          Excellent swimming conditions today. Winds are calm at 6 km/h. Enjoy your sunbed stay!
        </Text>
      </View>

      {/* ── SPOT INFORMATION ── */}
      <View style={[styles.spotCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.spotRow}>
          <View>
            <Text style={[styles.spotLabel, { color: colors.muted }]}>RESERVED SPOT</Text>
            <Text style={[styles.spotNo, { color: colors.text }]}>
              {booking.details?.spot || 'Spot A3'}
            </Text>
          </View>
          <View style={styles.zoneBadge}>
            <Text style={styles.zoneText}>{String(booking.details?.zone || 'Family')} Zone</Text>
          </View>
        </View>

        {isPending && booking.expiresAt && (
          <View style={styles.holdTimerWrap}>
            <Ionicons name="time-outline" size={16} color="#D97706" />
            <View style={styles.timerContent}>
              <Text style={styles.timerLabel}>Umbrella Hold Countdown</Text>
              <CountdownTimer expiresAt={booking.expiresAt} onExpired={() => {}} />
            </View>
          </View>
        )}
      </View>

      {/* ── BENTO LINKS (APP INSIDE APP SHORTCUTS) ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>🏖️ Sunbed Services (Order Direct)</Text>
      <View style={styles.bentoGrid}>
        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleBentoPress('food')}
        >
          <Ionicons name="restaurant-outline" size={24} color="#00a896" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Food to Umbrella</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleBentoPress('parking')}
        >
          <Ionicons name="car-outline" size={24} color="#00a896" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Reserve Parking</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleBentoPress('beach-items')}
        >
          <Ionicons name="water-outline" size={24} color="#00a896" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Rent Water Rides</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bentoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => handleBentoPress('massage')}
        >
          <Ionicons name="hand-heart-outline" size={24} color="#00a896" />
          <Text style={[styles.bentoLabel, { color: colors.text }]}>Massage Zone</Text>
        </TouchableOpacity>
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
  forecastCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 16,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forecastTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  flagText: {
    fontSize: 10,
    fontFamily: 'mon-sb',
    color: '#10B981',
  },
  forecastDesc: {
    fontSize: 12,
    fontFamily: 'mon',
    lineHeight: 16,
  },
  spotCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 20,
  },
  spotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotLabel: {
    fontSize: 10,
    fontFamily: 'mon-b',
  },
  spotNo: {
    fontSize: 22,
    fontFamily: 'mon-b',
  },
  zoneBadge: {
    backgroundColor: '#00a89612',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  zoneText: {
    color: '#00a896',
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  holdTimerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
  },
  timerContent: {
    flex: 1,
    gap: 2,
  },
  timerLabel: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#D97706',
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
});
