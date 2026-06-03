import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export default function SkeletonCard() {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.45, { duration: 700 })),
      -1,
      true
    );
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.card, anim]}>
      <View style={styles.image} />
      <View style={styles.body}>
        <View style={styles.lineLg} />
        <View style={styles.lineSm} />
        <View style={styles.lineMd} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  image: {
    height: 180,
    backgroundColor: '#e2e8f0',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  lineLg: {
    height: 14,
    width: '70%',
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  lineMd: {
    height: 12,
    width: '45%',
    borderRadius: 6,
    backgroundColor: '#f0ebe4',
  },
  lineSm: {
    height: 10,
    width: '35%',
    borderRadius: 6,
    backgroundColor: '#f0ebe4',
  },
});
