import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';
import MapWithDirections from '@/components/shared/MapWithDirections';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

export default function DriverCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();

  // Mock driver vehicle en-route coordinates
  const driverMarker = [
    { id: 'driver-car', latitude: 36.7460, longitude: 3.0320, title: 'Karim (Dacia Logan)', category: 'driver' }
  ];

  const handleSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      '🚨 SOS Emergency Triggered',
      'This will call emergency services and share your live GPS location with designated contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Call', style: 'destructive', onPress: () => Alert.alert('Dialing Emergency', 'Calling Algiers Emergency dispatch at 112...') }
      ]
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ride Hailing Companion</Text>
      </View>

      {/* ── RIDE MAP TRACKER ── */}
      <View style={[styles.mapCard, { borderColor: colors.border }]}>
        <MapWithDirections
          markers={driverMarker as any}
          showDirections={false}
          showUserLocation={true}
          height={220}
          initialCenter={[3.0320, 36.7460]}
          initialZoom={13}
        />
        <View style={styles.etaOverlay}>
          <Text style={styles.etaText}>Driver arriving in 3 mins</Text>
        </View>
      </View>

      {/* ── DRIVER DETAILS PROFILE ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.driverProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>Karim Bensaid</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={[styles.ratingText, { color: colors.text }]}>4.8 · Verified Driver</Text>
            </View>
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.priceVal}>{booking.price.toLocaleString()} DA</Text>
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Confirmed Fare</Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.vehicleDetails}>
          <View style={styles.detailBox}>
            <Text style={[styles.detailKey, { color: colors.muted }]}>VEHICLE TYPE</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>{String(booking.details?.vehicle || 'Dacia Logan (Grey)')}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={[styles.detailKey, { color: colors.muted }]}>LICENSE PLATE</Text>
            <Text style={[styles.detailVal, { color: colors.text }]}>01842-116-16</Text>
          </View>
        </View>
      </View>

      {/* ── INTERACTION ACTIONS ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('Dialing Driver', 'Calling Karim at +213 671-12-34-56...')}
        >
          <Ionicons name="call" size={16} color="#3B82F6" />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Call Driver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('Chat Active', 'Direct driver chat interface opened.')}
        >
          <Ionicons name="chatbubble-ellipses" size={16} color="#3B82F6" />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Message Driver</Text>
        </TouchableOpacity>
      </View>

      {/* ── SOS EMERGENCY PANIC BUTTON ── */}
      <TouchableOpacity 
        style={styles.sosBtn}
        onPress={handleSOS}
      >
        <Ionicons name="alert-circle" size={18} color="#FFF" />
        <Text style={styles.sosText}>Trigger SOS Safety Alert</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
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
  mapCard: {
    height: 220,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  etaOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#0a2540',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  etaText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F615',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#3B82F6',
  },
  driverInfo: {
    flex: 1,
    gap: 2,
  },
  driverName: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  priceWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  priceVal: {
    fontSize: 15,
    fontFamily: 'mon-b',
    color: '#3B82F6',
  },
  priceLabel: {
    fontSize: 9,
    fontFamily: 'mon-sb',
  },
  divider: {
    height: 1,
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailBox: {
    flex: 1,
    gap: 3,
  },
  detailKey: {
    fontSize: 9,
    fontFamily: 'mon-b',
  },
  detailVal: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  sosBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sosText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'mon-b',
  },
});
