import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { BEACH_ACCENT } from '@/constants/beachLayout';

export default function SpotHoldBanner({
  spotId,
  expiresAt,
  onExpired,
}: {
  spotId: string;
  expiresAt: string;
  onExpired?: () => void;
}) {
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Ionicons name="timer-outline" size={20} color={BEACH_ACCENT} />
        <View style={styles.textCol}>
          <Text style={styles.title}>20-Minute Expiry Hold</Text>
          <Text style={styles.sub}>
            Spot <Text style={styles.spot}>{spotId}</Text> — will be released if not booked in time
          </Text>
        </View>
      </View>
      <View style={styles.timerBox}>
        <CountdownTimer expiresAt={expiresAt} onExpired={onExpired} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: BEACH_ACCENT,
    shadowColor: BEACH_ACCENT,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  left: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  sub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 17 },
  spot: { fontFamily: 'mon-b', color: BEACH_ACCENT, letterSpacing: 0.5 },
  timerBox: { alignItems: 'flex-end', minWidth: 100 },
});
