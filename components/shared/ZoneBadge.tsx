import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ZoneId = "family" | "vip" | "free";

const ZONE_META: Record<ZoneId, { label: string; color: string; bg: string }> =
  {
    family: { label: "Family Zone", color: "#0a2540", bg: "#E0F4FF" },
    vip: { label: "VIP Zone", color: "#9A7B00", bg: "#FFF8DC" },
    free: { label: "Free Zone", color: "#047857", bg: "#D1FAE5" },
  };

interface ZoneBadgeProps {
  zone: ZoneId;
}

export default function ZoneBadge({ zone }: ZoneBadgeProps) {
  const meta = ZONE_META[zone] ?? ZONE_META.free;
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={[styles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
