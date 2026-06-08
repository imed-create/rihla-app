import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { RIHLA } from "@/constants/theme";

interface ConfirmButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  price?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ConfirmButton({ label, onPress, loading, price }: ConfirmButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[
        styles.btn,
        animStyle,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
          borderWidth: 1,
          borderColor: RIHLA.primaryDark,
        },
      ]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>
          {label}
          {price !== undefined ? `  ·  ${price} DA` : ""}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontSize: 16,
    fontFamily: "mon-b",
    color: "#FFFFFF",
  },
});
