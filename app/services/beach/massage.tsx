import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from "@/components/ConfirmButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MASSAGE_TYPES = [
  { id: "swedish", name: "Swedish Relaxation", desc: "Gentle, full-body relaxation massage", icon: "hand-heart-outline" },
  { id: "deep", name: "Deep Tissue", desc: "Targets muscle tension and knots", icon: "arm-flex-outline" },
  { id: "hot-stone", name: "Hot Stone", desc: "Smooth heated basalt stones for deep relaxation", icon: "fire" },
  { id: "foot", name: "Foot Reflexology", desc: "Focused foot and ankle treatment", icon: "shoe-print" },
];

const DURATIONS = [
  { label: "30 min", minutes: 30, multiplier: 1 },
  { label: "60 min", minutes: 60, multiplier: 1.7 },
  { label: "90 min", minutes: 90, multiplier: 2.3 },
];

const BASE_PRICES: Record<string, number> = {
  swedish: 2000,
  deep: 2500,
  "hot-stone": 3000,
  foot: 1500,
};

const SLOTS = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

export default function MassageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [massageType, setMassageType] = useState(MASSAGE_TYPES[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = Math.round(BASE_PRICES[massageType.id] * duration.multiplier);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBook = async () => {
    if (!slot) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "massage",
      icon: "hand-heart-outline",
      iconFamily: "MaterialCommunityIcons",
      color: "#845EC2",
      title: massageType.name,
      subtitle: `${duration.label} · ${slot}`,
      price,
      details: { type: massageType.id, minutes: duration.minutes, slot },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#845EC2", "#6B46C1"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <MaterialCommunityIcons name="hand-heart-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Massage</Text>
        <Text style={styles.headerSub}>Relax and recharge by the sea</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Booked!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your therapist will meet you at the beach cabana at {slot}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>MASSAGE TYPE</Text>
          <View style={styles.typeGrid}>
            {MASSAGE_TYPES.map((m) => (
              <Pressable
                key={m.id}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: massageType.id === m.id ? "#845EC2" : colors.border,
                    borderWidth: massageType.id === m.id ? 2 : 1,
                  },
                ]}
                onPress={() => setMassageType(m)}
              >
                <MaterialCommunityIcons
                  name={m.icon as any}
                  size={28}
                  color={massageType.id === m.id ? "#845EC2" : colors.mutedForeground}
                />
                <Text style={[styles.typeName, { color: colors.foreground }]}>{m.name}</Text>
                <Text style={[styles.typeDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{m.desc}</Text>
                <Text style={[styles.typeBase, { color: colors.primary }]}>
                  from {BASE_PRICES[m.id]} DZD
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>DURATION</Text>
          <View style={styles.row}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.label}
                style={[
                  styles.durationChip,
                  {
                    backgroundColor: duration.label === d.label ? "#845EC2" : colors.muted,
                    borderColor: duration.label === d.label ? "#845EC2" : colors.border,
                  },
                ]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.chipText, { color: duration.label === d.label ? "#FFF" : colors.foreground }]}>
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT TIME SLOT</Text>
          <View style={styles.slotsGrid}>
            {SLOTS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.slotChip,
                  {
                    backgroundColor: slot === s ? "#845EC2" : colors.muted,
                    borderColor: slot === s ? "#845EC2" : colors.border,
                  },
                ]}
                onPress={() => setSlot(s)}
              >
                <Text style={[styles.slotText, { color: slot === s ? "#FFF" : colors.foreground }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.priceBox, { backgroundColor: "#845EC222", borderColor: "#845EC244" }]}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Total Price</Text>
            <Text style={[styles.priceValue, { color: "#845EC2" }]}>{price} DZD</Text>
          </View>
        </ScrollView>
      )}

      {!success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label="Book Massage" onPress={handleBook} loading={loading} price={price} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center", gap: 4 },
  backBtn: { position: "absolute", left: 20, top: 16, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 8 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 4 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  typeCard: { width: "47%", borderRadius: 16, padding: 14, gap: 6 },
  typeName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  typeDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
  typeBase: { fontSize: 12, fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", gap: 10 },
  durationChip: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  slotText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  priceBox: { borderRadius: 16, borderWidth: 1, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  priceValue: { fontSize: 24, fontFamily: "Inter_700Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
