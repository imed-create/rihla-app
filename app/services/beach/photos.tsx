import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from "@/components/ConfirmButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PACKAGES = [
  {
    id: "snap",
    name: "Quick Snap",
    desc: "10 edited photos delivered via WhatsApp",
    duration: "30 min",
    photos: "10 photos",
    price: 1500,
    icon: "camera-outline",
  },
  {
    id: "session",
    name: "Full Session",
    desc: "30 edited photos + 1 short video clip",
    duration: "1 hour",
    photos: "30 photos + video",
    price: 3000,
    icon: "camera",
  },
  {
    id: "premium",
    name: "Premium Coverage",
    desc: "Full day coverage: unlimited photos + reels",
    duration: "Full day",
    photos: "Unlimited",
    price: 8000,
    icon: "aperture-outline",
  },
];

const SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export default function PhotosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [pkg, setPkg] = useState(PACKAGES[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  const handleBook = async () => {
    if (!slot) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "photos",
      icon: "camera-outline",
      iconFamily: "Ionicons",
      color: "#FF499E",
      title: `Photo: ${pkg.name}`,
      subtitle: `${pkg.duration} · ${slot}`,
      price: pkg.price,
      details: { packageId: pkg.id, slot, notes },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FF499E", "#C9184A"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="camera-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Photo Service</Text>
        <Text style={styles.headerSub}>Professional beach photography</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Booked!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your photographer will find you at {slot}. Smile!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>CHOOSE PACKAGE</Text>
          {PACKAGES.map((p) => (
            <Pressable
              key={p.id}
              style={[
                styles.pkgCard,
                {
                  backgroundColor: colors.card,
                  borderColor: pkg.id === p.id ? "#FF499E" : colors.border,
                  borderWidth: pkg.id === p.id ? 2 : 1,
                },
              ]}
              onPress={() => setPkg(p)}
            >
              <View style={[styles.pkgIcon, { backgroundColor: pkg.id === p.id ? "#FF499E22" : colors.muted }]}>
                <Ionicons name={p.icon as any} size={28} color={pkg.id === p.id ? "#FF499E" : colors.mutedForeground} />
              </View>
              <View style={styles.pkgInfo}>
                <Text style={[styles.pkgName, { color: colors.foreground }]}>{p.name}</Text>
                <Text style={[styles.pkgDesc, { color: colors.mutedForeground }]}>{p.desc}</Text>
                <View style={styles.pkgMeta}>
                  <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{p.duration}</Text>
                  </View>
                  <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
                    <Ionicons name="images-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{p.photos}</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.pkgPrice, { color: "#FF499E" }]}>{p.price} DZD</Text>
            </Pressable>
          ))}

          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT TIME</Text>
          <View style={styles.slotsGrid}>
            {SLOTS.map((s) => (
              <Pressable
                key={s}
                style={[
                  styles.slotChip,
                  {
                    backgroundColor: slot === s ? "#FF499E" : colors.muted,
                    borderColor: slot === s ? "#FF499E" : colors.border,
                  },
                ]}
                onPress={() => setSlot(s)}
              >
                <Text style={[styles.slotText, { color: slot === s ? "#FFF" : colors.foreground }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>SPECIAL REQUESTS (optional)</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="E.g. group photo, sunset backdrop, specific location..."
            placeholderTextColor={colors.mutedForeground}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
      )}

      {!success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label="Book Photographer" onPress={handleBook} loading={loading} price={pkg.price} />
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
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  pkgCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, gap: 12 },
  pkgIcon: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  pkgInfo: { flex: 1, gap: 5 },
  pkgName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  pkgDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  pkgMeta: { flexDirection: "row", gap: 6 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metaText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  pkgPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  slotText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  notesInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 90 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
