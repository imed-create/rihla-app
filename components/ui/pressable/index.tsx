import React from 'react';
import { Pressable as RN_Pressable, PressableProps, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

export function Pressable({ children, style, onPress, ...props }: PressableProps & { children?: React.ReactNode }) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };

  return (
    <RN_Pressable
      style={({ pressed }) => [
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed } as any) : style,
      ]}
      onPress={handlePress}
      {...props}
    >
      {children}
    </RN_Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
