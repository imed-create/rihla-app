import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SandZoneId } from '@/constants/beachLayout';
import { RIHLA } from '@/constants/theme';
import { hapticLight } from '@/utils/haptics';

const TABS: { id: SandZoneId; label: string; emoji: string }[] = [
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'vip', label: 'VIP', emoji: '👑' },
  { id: 'free', label: 'Free', emoji: '🌊' },
];

const TAB_WIDTH = (Dimensions.get('window').width - 40) / 3;

type Props = {
  active: SandZoneId;
  onChange: (zone: SandZoneId) => void;
};

export default function ZoneTabs({ active, onChange }: Props) {
  const index = TABS.findIndex((t) => t.id === active);
  const translateX = useSharedValue(index * TAB_WIDTH);

  useEffect(() => {
    const i = TABS.findIndex((t) => t.id === active);
    translateX.value = withSpring(i * TAB_WIDTH, { damping: 18, stiffness: 220 });
  }, [active, translateX]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, { width: TAB_WIDTH }]}
            onPress={() => {
              hapticLight();
              onChange(tab.id);
            }}
          >
            <Text style={styles.emoji}>{tab.emoji}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
      <Animated.View style={[styles.underline, { width: TAB_WIDTH }, underlineStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: RIHLA.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RIHLA.border,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  tab: { alignItems: 'center', paddingVertical: 12, gap: 2 },
  emoji: { fontSize: 16 },
  label: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },
  labelActive: { fontFamily: 'mon-b', color: RIHLA.primary },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: RIHLA.accent,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
