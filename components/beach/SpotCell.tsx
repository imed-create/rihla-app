import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SandSpot } from '@/constants/beachLayout';
import { SAHEL } from '@/constants/Colors';
import { hapticLight } from '@/utils/haptics';
import { BeachAssetIcon } from './BeachSvgIcons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type State = 'available' | 'selected' | 'occupied';

type Props = {
  spot: SandSpot;
  state: State;
  isVip: boolean;
  onPress: (spot: SandSpot) => void;
};

function SpotCellInner({ spot, state, isVip, onPress }: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const disabled = state === 'occupied';
  const bg =
    state === 'selected'
      ? SAHEL.primary
      : state === 'occupied'
        ? SAHEL.border
        : SAHEL.card;
  const textColor =
    state === 'selected' ? '#fff' : state === 'occupied' ? '#bbbbbb' : SAHEL.dark;
  const borderColor =
    state === 'selected'
      ? SAHEL.primary
      : isVip && state === 'available'
        ? SAHEL.highlight
        : SAHEL.border;

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={() => {
        hapticLight();
        onPress(spot);
      }}
      onPressIn={() => {
        if (!disabled) scale.value = withSpring(1.08, { damping: 12 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12 });
      }}
      style={[
        styles.cell,
        anim,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isVip && state === 'available' ? 2 : 1,
        },
      ]}
    >
      <BeachAssetIcon
        kind={spot.asset}
        size={22}
        color={state === 'selected' ? '#fff' : state === 'occupied' ? '#bbb' : SAHEL.mutedText}
      />
      <Text
        style={[
          styles.id,
          { color: textColor },
          state === 'occupied' && styles.strike,
        ]}
      >
        {spot.id}
      </Text>
    </AnimatedPressable>
  );
}

export default memo(SpotCellInner);

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    minWidth: '22%',
    maxWidth: '24%',
    aspectRatio: 0.85,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  id: { fontSize: 10, fontFamily: 'mon-b', letterSpacing: 0.3 },
  strike: { textDecorationLine: 'line-through' },
});
