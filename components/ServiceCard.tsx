import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export type IconFamily = "Ionicons" | "Feather" | "MaterialCommunityIcons";

interface ServiceCardProps {
  title: string;
  tagline: string;
  icon: string;
  iconFamily: IconFamily;
  color: string;
  gradientEnd?: string;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ServiceIcon({ icon, iconFamily, size, color }: { icon: string; iconFamily: IconFamily; size: number; color: string }) {
  if (iconFamily === "Feather") return <Feather name={icon as any} size={size} color={color} />;
  if (iconFamily === "MaterialCommunityIcons") return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  return <Ionicons name={icon as any} size={size} color={color} />;
}

export default function ServiceCard({ title, tagline, icon, iconFamily, color, onPress }: ServiceCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, animStyle, { borderColor: color + "30" }]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      }}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + "14" }]}>
        <ServiceIcon icon={icon} iconFamily={iconFamily} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.tagline} numberOfLines={2}>{tagline}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    minHeight: 132,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: "mon-sb",
    color: "#1a1a1a",
    marginTop: 4,
  },
  tagline: {
    fontSize: 11,
    fontFamily: "mon",
    color: "#888888",
    lineHeight: 15,
    marginTop: 2,
  },
});
