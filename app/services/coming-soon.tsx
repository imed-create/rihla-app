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
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { safeGoBack } from '@/utils/safeNavigation';
import { SAHEL } from '@/constants/Colors';

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
        <Ionicons name="arrow-back" size={24} color={SAHEL.dark} />
      </Pressable>

      <View style={styles.content}>
        <Animated.View style={waveStyle}>
          <Svg width={220} height={100} viewBox="0 0 220 100">
            <Path
              d="M0 50 Q55 20 110 50 T220 50 V100 H0 Z"
              fill={SAHEL.primary}
              opacity={0.85}
            />
            <Path
              d="M0 65 Q55 40 110 65 T220 65 V100 H0 Z"
              fill={SAHEL.beachAccent}
              opacity={0.6}
            />
          </Svg>
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
    backgroundColor: SAHEL.background,
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
    borderColor: SAHEL.border,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 80,
  },
  title: {
    fontSize: 22,
    fontFamily: 'mon-b',
    color: SAHEL.dark,
    textAlign: 'center',
    marginTop: 24,
  },
  comingSoon: {
    fontSize: 32,
    fontFamily: 'mon-b',
    color: SAHEL.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'mon',
    color: SAHEL.mutedText,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
