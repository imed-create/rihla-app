import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import BeachSandGrid from './BeachSandGrid';
import SpotHoldBanner from './SpotHoldBanner';
import ConfirmButton from '@/components/shared/ConfirmButton';
import { useApp } from '@/context/AppContext';
import { useBeachOccupancy } from '@/hooks/useBeachOccupancy';
import { SandSpot, SandZoneId, ZONE_CONFIG } from '@/constants/beachLayout';
import type { Destination } from '@/constants/destinations';

const DURATIONS = [
  { label: '2 hours', hours: 2 },
  { label: '4 hours', hours: 4 },
  { label: 'Full Day', hours: 8 },
];

const PRICES: Record<SandZoneId, Record<number, number>> = {
  family: { 2: 400, 4: 700, 8: 1000 },
  vip: { 2: 1200, 4: 2000, 8: 3000 },
  free: { 2: 0, 4: 0, 8: 0 },
};

export default function BeachGridExplorerModal({
  visible,
  destination,
  onClose,
}: {
  visible: boolean;
  destination: Destination;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const { occupiedSpotIds } = useBeachOccupancy();
  const [zone, setZone] = useState<SandZoneId>('family');
  const [spot, setSpot] = useState<SandSpot | null>(null);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const price = PRICES[zone][duration.hours];

  const handleSelectSpot = (s: SandSpot) => {
    setSpot(s);
    setZone(s.zone);
    if (s.zone !== 'free') {
      setHoldExpiresAt(new Date(Date.now() + 20 * 60 * 1000).toISOString());
    } else {
      setHoldExpiresAt(null);
    }
  };

  const handleBook = async () => {
    if (!spot) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const booking = addBooking({
      type: 'spots',
      icon: 'umbrella-outline',
      iconFamily: 'Ionicons',
      color: ZONE_CONFIG[zone].accent,
      title: `${ZONE_CONFIG[zone].label} · ${destination.name}`,
      subtitle: `${spot.id} · ${duration.label}`,
      price,
      expiresAt: zone !== 'free' ? holdExpiresAt ?? undefined : undefined,
      details: { zone, spotId: spot.id, hours: duration.hours, destinationId: destination.id },
    });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
    router.push(`/booking/${booking.id}` as any);
  };

  const zones: SandZoneId[] = useMemo(() => ['family', 'vip', 'free'], []);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#00a896', '#0a2540']} style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{destination.name}</Text>
          <Text style={styles.headerSub}>Interactive sand grid</Text>
        </LinearGradient>

        {spot && holdExpiresAt && zone !== 'free' && (
          <SpotHoldBanner spotId={spot.id} expiresAt={holdExpiresAt} onExpired={() => setSpot(null)} />
        )}

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.zoneTabs}>
            {zones.map((z) => (
              <Pressable
                key={z}
                onPress={() => {
                  setZone(z);
                  setSpot(null);
                  setHoldExpiresAt(null);
                }}
                style={[
                  styles.zoneTab,
                  zone === z && { backgroundColor: ZONE_CONFIG[z].accent, borderColor: ZONE_CONFIG[z].accent },
                ]}
              >
                <Text style={[styles.zoneTabText, zone === z && { color: '#FFF' }]}>
                  {ZONE_CONFIG[z].label}
                </Text>
              </Pressable>
            ))}
          </View>

          <BeachSandGrid
            selectedZone={zone}
            selectedId={spot?.id}
            occupiedIds={occupiedSpotIds}
            onSelect={handleSelectSpot}
          />

          <Text style={styles.label}>DURATION</Text>
          <View style={styles.row}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.label}
                onPress={() => setDuration(d)}
                style={[
                  styles.chip,
                  duration.label === d.label && { backgroundColor: '#0a2540', borderColor: '#0a2540' },
                ]}
              >
                <Text style={[styles.chipText, duration.label === d.label && { color: '#FFF' }]}>
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <ConfirmButton
            label={spot ? `Reserve · ${price === 0 ? 'Free' : `${price} DA`}` : 'Select a plot'}
            onPress={handleBook}
            loading={loading}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  header: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  closeBtn: { position: 'absolute', left: 16, top: Platform.OS === 'web' ? 12 : 8, padding: 8 },
  headerTitle: { fontSize: 20, fontFamily: 'mon-b', color: '#FFF', marginTop: 8 },
  headerSub: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.75)' },
  zoneTabs: { flexDirection: 'row', gap: 8 },
  zoneTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  zoneTabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },
  label: { fontSize: 11, fontFamily: 'mon-sb', letterSpacing: 1, color: '#64748B' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chipText: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
