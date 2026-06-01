import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from "@/components/ConfirmButton";
import ZoneBadge from "@/components/ZoneBadge";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const ZONES = [
  {
    id: "family" as const,
    label: "Family Zone",
    desc: "Quiet area for families with children. Supervised swimming.",
    color: "#0077B6",
    spots: 20,
  },
  {
    id: "vip" as const,
    label: "VIP Zone",
    desc: "Premium sunbeds, private service & direct sea access.",
    color: "#C9A84C",
    spots: 10,
  },
  {
    id: "free" as const,
    label: "Free Zone",
    desc: "Open area for everyone. Bring your own gear.",
    color: "#06D6A0",
    spots: 30,
  },
];

const DURATIONS = [
  { label: "2 hours", hours: 2 },
  { label: "4 hours", hours: 4 },
  { label: "Full Day", hours: 8 },
];

const PRICES: Record<string, Record<number, number>> = {
  family: { 2: 400, 4: 700, 8: 1000 },
  vip: { 2: 1200, 4: 2000, 8: 3000 },
  free: { 2: 0, 4: 0, 8: 0 },
};

const CHAIR_OPTIONS = [2, 4, 6];

export default function SpotsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [zone, setZone] = useState(ZONES[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [chairs, setChairs] = useState(2);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = PRICES[zone.id][duration.hours];
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBook = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const expiresAt =
      zone.id !== "free"
        ? new Date(Date.now() + 20 * 60 * 1000).toISOString()
        : undefined;
    addBooking({
      type: "spots",
      icon: "umbrella-outline",
      iconFamily: "Ionicons",
      color: zone.color,
      title: `${zone.label} Spot`,
      subtitle: `${chairs} chairs · ${duration.label}`,
      price,
      expiresAt,
      details: { zone: zone.id, chairs, hours: duration.hours },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0096C7", "#0077B6"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <MaterialCommunityIcons name="umbrella-beach" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Beach Spots</Text>
        <Text style={styles.headerSub}>Choose your zone & reserve a spot</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Spot Booked!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            {zone.id !== "free"
              ? "Arrive within 20 minutes to keep your spot"
              : "Your free spot is confirmed!"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            SELECT ZONE
          </Text>
          {ZONES.map((z) => (
            <Pressable
              key={z.id}
              style={[
                styles.zoneCard,
                {
                  backgroundColor: colors.card,
                  borderColor: zone.id === z.id ? z.color : colors.border,
                  borderWidth: zone.id === z.id ? 2 : 1,
                },
              ]}
              onPress={() => setZone(z)}
            >
              <View style={styles.zoneRow}>
                <ZoneBadge zone={z.id} />
                <Text style={[styles.zoneSpots, { color: colors.mutedForeground }]}>
                  {z.spots} spots
                </Text>
              </View>
              <Text style={[styles.zoneDesc, { color: colors.mutedForeground }]}>
                {z.desc}
              </Text>
              {zone.id === z.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={z.color}
                  style={styles.checkIcon}
                />
              )}
            </Pressable>
          ))}

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            DURATION
          </Text>
          <View style={styles.row}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.label}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      duration.label === d.label ? "#0096C7" : colors.muted,
                    borderColor:
                      duration.label === d.label ? "#0096C7" : colors.border,
                  },
                ]}
                onPress={() => setDuration(d)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        duration.label === d.label ? "#FFF" : colors.foreground,
                    },
                  ]}
                >
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            NUMBER OF CHAIRS
          </Text>
          <View style={styles.row}>
            {CHAIR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.chip,
                  {
                    backgroundColor: chairs === c ? "#0096C7" : colors.muted,
                    borderColor: chairs === c ? "#0096C7" : colors.border,
                  },
                ]}
                onPress={() => setChairs(c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: chairs === c ? "#FFF" : colors.foreground },
                  ]}
                >
                  {c} chairs
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
              Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Zone</Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                {zone.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Duration</Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                {duration.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Total</Text>
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 16 }}>
                {price === 0 ? "FREE" : `${price} DZD`}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {!success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton
            label="Book Spot"
            onPress={handleBook}
            loading={loading}
            price={price > 0 ? price : undefined}
          />
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
  scroll: { flex: 1 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 4 },
  zoneCard: { borderRadius: 16, padding: 16, gap: 8, position: "relative" },
  zoneRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  zoneSpots: { fontSize: 12, fontFamily: "Inter_500Medium" },
  zoneDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  checkIcon: { position: "absolute", top: 12, right: 12 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10, marginTop: 4 },
  summaryTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
