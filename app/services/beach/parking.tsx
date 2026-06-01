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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from "@/components/ConfirmButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const ZONES = [
  { id: "A", label: "Zone A", spots: ["A-01", "A-02", "A-03", "A-04", "A-05"] },
  { id: "B", label: "Zone B", spots: ["B-01", "B-02", "B-03", "B-04", "B-05"] },
  { id: "C", label: "Zone C", spots: ["C-01", "C-02", "C-03", "C-04", "C-05"] },
];

const DURATIONS = [
  { label: "1 hour", hours: 1, price: 200 },
  { label: "2 hours", hours: 2, price: 350 },
  { label: "3 hours", hours: 3, price: 500 },
  { label: "Full Day", hours: 8, price: 800 },
];

export default function ParkingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [zone, setZone] = useState(ZONES[0]);
  const [spot, setSpot] = useState(ZONES[0].spots[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async () => {
    if (!plate.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();
    addBooking({
      type: "parking",
      icon: "car-outline",
      iconFamily: "Ionicons",
      color: "#023E58",
      title: `Parking ${spot}`,
      subtitle: `${zone.label} · ${duration.label} · ${plate.toUpperCase()}`,
      price: duration.price,
      expiresAt,
      details: { zone: zone.id, spot, hours: duration.hours, plate },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  const topPad =
    Platform.OS === "web"
      ? insets.top + 67
      : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#023E58", "#034F6E"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <MaterialCommunityIcons name="car" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Parking Spot</Text>
        <Text style={styles.headerSub}>Reserve your spot in advance</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>
            Spot Reserved!
          </Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            You have 20 minutes to arrive before auto-cancel
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            SELECT ZONE
          </Text>
          <View style={styles.row}>
            {ZONES.map((z) => (
              <Pressable
                key={z.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      zone.id === z.id ? "#023E58" : colors.muted,
                    borderColor:
                      zone.id === z.id ? "#023E58" : colors.border,
                  },
                ]}
                onPress={() => {
                  setZone(z);
                  setSpot(z.spots[0]);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: zone.id === z.id ? "#FFF" : colors.foreground,
                    },
                  ]}
                >
                  {z.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            SELECT SPOT
          </Text>
          <View style={styles.spotGrid}>
            {zone.spots.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.spotBtn,
                  {
                    backgroundColor:
                      spot === s ? "#023E58" : colors.card,
                    borderColor: spot === s ? "#023E58" : colors.border,
                  },
                ]}
                onPress={() => setSpot(s)}
              >
                <Text
                  style={[
                    styles.spotText,
                    { color: spot === s ? "#FFF" : colors.foreground },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>

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
                      duration.label === d.label ? "#023E58" : colors.muted,
                    borderColor:
                      duration.label === d.label ? "#023E58" : colors.border,
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
            LICENSE PLATE
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. 123 ALG 16"
            placeholderTextColor={colors.mutedForeground}
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
          />

          <View
            style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
              Booking Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>Spot</Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                {spot}
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
                {duration.price} DZD
              </Text>
            </View>
            <View style={[styles.alertRow, { backgroundColor: "#FFF8E1" }]}>
              <Ionicons name="time-outline" size={14} color="#C9A84C" />
              <Text style={{ color: "#C9A84C", fontSize: 12, flex: 1 }}>
                {" "}Auto-cancelled if you don't arrive within 20 minutes
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {!success && (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 16, backgroundColor: colors.background },
          ]}
        >
          <ConfirmButton
            label="Reserve Parking"
            onPress={handleBook}
            loading={loading}
            price={duration.price}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
    gap: 4,
  },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginTop: 8,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 12 },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginTop: 8,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  spotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  spotBtn: {
    width: 68,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spotText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#B8DFF0",
  },
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  successTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  successSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
