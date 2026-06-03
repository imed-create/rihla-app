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

const SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const PERSON_OPTIONS = [1, 2, 3, 4];

const ADDONS = [
  { id: "towel", label: "Towel Rental", price: 200 },
  { id: "soap", label: "Soap & Shampoo Kit", price: 150 },
  { id: "locker", label: "Locker Access", price: 300 },
];

export default function ShowersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [slot, setSlot] = useState<string | null>(null);
  const [persons, setPersons] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const basePrice = persons * 300;
  const addonTotal = addons.reduce((s, id) => s + (ADDONS.find((a) => a.id === id)?.price ?? 0), 0);
  const total = basePrice + addonTotal;
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  const toggleAddon = (id: string) => {
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const handleBook = async () => {
    if (!slot) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "showers",
      icon: "shower-head",
      iconFamily: "MaterialCommunityIcons",
      color: "#48CAE4",
      title: "Shower Booking",
      subtitle: `${persons} person${persons > 1 ? "s" : ""} · ${slot}`,
      price: total,
      details: { slot, persons, addons: addons.join(", ") },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#48CAE4", "#00a896"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <MaterialCommunityIcons name="shower-head" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Showers & Cleaning</Text>
        <Text style={styles.headerSub}>Fresh up before you leave</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Booked!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your shower cabin is reserved for {slot}. Head to the facilities block.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>NUMBER OF PEOPLE</Text>
          <View style={styles.personRow}>
            {PERSON_OPTIONS.map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.personBtn,
                  {
                    backgroundColor: persons === p ? "#48CAE4" : colors.muted,
                    borderColor: persons === p ? "#48CAE4" : colors.border,
                  },
                ]}
                onPress={() => setPersons(p)}
              >
                <MaterialCommunityIcons name="account-outline" size={20} color={persons === p ? "#FFF" : colors.mutedForeground} />
                <Text style={[styles.personText, { color: persons === p ? "#FFF" : colors.foreground }]}>{p}</Text>
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
                    backgroundColor: slot === s ? "#48CAE4" : colors.muted,
                    borderColor: slot === s ? "#48CAE4" : colors.border,
                  },
                ]}
                onPress={() => setSlot(s)}
              >
                <Text style={[styles.slotText, { color: slot === s ? "#FFF" : colors.foreground }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>ADD-ONS</Text>
          <View style={styles.addonList}>
            {ADDONS.map((a) => {
              const isOn = addons.includes(a.id);
              return (
                <Pressable
                  key={a.id}
                  style={[
                    styles.addonCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isOn ? "#48CAE4" : colors.border,
                      borderWidth: isOn ? 2 : 1,
                    },
                  ]}
                  onPress={() => toggleAddon(a.id)}
                >
                  <View>
                    <Text style={[styles.addonLabel, { color: colors.foreground }]}>{a.label}</Text>
                    <Text style={[styles.addonPrice, { color: colors.primary }]}>+{a.price} DZD</Text>
                  </View>
                  <View style={[styles.addonCheck, { backgroundColor: isOn ? "#48CAE4" : colors.muted }]}>
                    {isOn && <Ionicons name="checkmark" size={14} color="#FFF" />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.totalRow, { backgroundColor: "#48CAE422", borderColor: "#48CAE444" }]}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
            <Text style={[styles.totalValue, { color: "#48CAE4" }]}>{total} DZD</Text>
          </View>
        </ScrollView>
      )}

      {!success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label="Book Shower" onPress={handleBook} loading={loading} price={total} />
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
  personRow: { flexDirection: "row", gap: 10 },
  personBtn: { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  personText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  slotText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  addonList: { gap: 10 },
  addonCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 14 },
  addonLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  addonPrice: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  addonCheck: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  totalRow: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  totalValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
