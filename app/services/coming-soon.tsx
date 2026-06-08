import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { safeGoBack } from '@/utils/safeNavigation';
import { RIHLA } from '@/constants/theme';

export default function ComingSoonScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const insets = useSafeAreaInsets();
  const title = name ? decodeURIComponent(String(name)) : 'Service';
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 1200 }), withTiming(1, { duration: 1200 })),
      -1,
      true
    );
  }, [scale]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <Pressable onPress={() => safeGoBack()} style={styles.backBtn} hitSlop={12}>
        <Ionicons name="arrow-back" size={24} color={RIHLA.dark} />
      </Pressable>

      <View style={styles.content}>
        <Animated.View style={[waveStyle, styles.waveContainer]}>
          {/* Wave layer 1 */}
          <View style={[styles.waveBand, { backgroundColor: RIHLA.primary, opacity: 0.85, top: 0 }]} />
          {/* Wave layer 2 */}
          <View style={[styles.waveBand, { backgroundColor: RIHLA.beachAccent ?? RIHLA.primary, opacity: 0.55, top: 22 }]} />
          {/* Decorative circles for wave feel */}
          <View style={[styles.waveCircle, { left: -30, top: -30, backgroundColor: RIHLA.primary, opacity: 0.15 }]} />
          <View style={[styles.waveCircle, { right: -20, top: -10, backgroundColor: RIHLA.beachAccent ?? RIHLA.primary, opacity: 0.2, width: 90, height: 90 }]} />
        </Animated.View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.subtitle}>We&apos;re working on bringing this service to you</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: RIHLA.background,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RIHLA.border,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  waveContainer: {
    width: 220,
    height: 100,
    overflow: 'hidden',
    borderRadius: 20,
    marginBottom: 8,
  },
  waveBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    borderRadius: 40,
  },
  waveCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 22,
    fontFamily: 'mon-b',
    color: RIHLA.dark,
    textAlign: 'center',
    marginTop: 24,
  },
  comingSoon: {
    fontSize: 32,
    fontFamily: 'mon-b',
    color: RIHLA.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'mon',
    color: RIHLA.mutedText,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
