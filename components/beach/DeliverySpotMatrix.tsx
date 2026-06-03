import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import BeachSandGrid from './BeachSandGrid';
import { SandSpot, SandZoneId } from '@/constants/beachLayout';

function PulsingWrap({ active, children }: { active: boolean; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!active) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.72, { duration: 400 })),
      -1,
      true
    );
  }, [active, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!active) return <>{children}</>;
  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

export default function DeliverySpotMatrix({
  deliverySpotId,
  deliveryZone,
  occupiedSpotIds,
  onSelectSpot,
  selectedSpotId,
}: {
  deliverySpotId: string | null;
  deliveryZone: SandZoneId;
  occupiedSpotIds: string[];
  onSelectSpot?: (spot: SandSpot) => void;
  selectedSpotId?: string | null;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Delivery coordinates</Text>
      <Text style={styles.sub}>
        Your reserved plot lights up on the sand matrix — staff delivers straight to your umbrella.
      </Text>
      <PulsingWrap active={!!deliverySpotId}>
        <BeachSandGrid
          selectedZone={deliveryZone}
          selectedId={selectedSpotId ?? deliverySpotId}
          occupiedIds={occupiedSpotIds}
          highlightDeliveryId={deliverySpotId}
          onSelect={onSelectSpot ?? (() => {})}
        />
      </PulsingWrap>
      {deliverySpotId ? (
        <View style={styles.confirmPill}>
          <Text style={styles.confirmText}>Deliver to {deliverySpotId}</Text>
        </View>
      ) : (
        <Text style={styles.hint}>Book a beach spot first, or tap a plot below.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  sub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 17 },
  confirmPill: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  confirmText: { fontSize: 12, fontFamily: 'mon-b', color: '#EA580C' },
  hint: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
});
