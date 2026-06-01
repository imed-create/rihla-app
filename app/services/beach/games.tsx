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

const GAMES = [
  { id: "1", name: "Domino Set", icon: "domino-mask", pricePerHour: 200, available: true },
  { id: "2", name: "Card Games", icon: "cards-playing-outline", pricePerHour: 150, available: true },
  { id: "3", name: "Chess Board", icon: "chess-queen", pricePerHour: 200, available: true },
  { id: "4", name: "Beach Volleyball", icon: "volleyball", pricePerHour: 500, available: true },
  { id: "5", name: "Table Tennis", icon: "table-tennis", pricePerHour: 400, available: false },
  { id: "6", name: "Baffle / Pétanque", icon: "circle-outline", pricePerHour: 300, available: true },
  { id: "7", name: "Chicha / Shisha", icon: "smoking-off", pricePerHour: 1500, available: true },
  { id: "8", name: "Frisbee", icon: "disc-outline", pricePerHour: 100, available: true },
];

const DURATIONS = [1, 2, 3];

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [selected, setSelected] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const game = GAMES.find((g) => g.id === selected);
  const price = game ? game.pricePerHour * hours : 0;
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleRent = async () => {
    if (!game) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "games",
      icon: "game-controller-outline",
      iconFamily: "Ionicons",
      color: "#20C997",
      title: game.name,
      subtitle: `${hours} hour${hours > 1 ? "s" : ""} rental`,
      price,
      details: { gameId: game.id, hours },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#20C997", "#10B981"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="game-controller-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Games & Fun</Text>
        <Text style={styles.headerSub}>Rent games for beach entertainment</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Game Rented!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Pick up your game at the entertainment booth
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT GAME</Text>
          <View style={styles.gameList}>
            {GAMES.map((g) => (
              <Pressable
                key={g.id}
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selected === g.id ? "#20C997" : colors.border,
                    borderWidth: selected === g.id ? 2 : 1,
                    opacity: g.available ? 1 : 0.5,
                  },
                ]}
                onPress={() => g.available && setSelected(g.id)}
                disabled={!g.available}
              >
                <View style={[styles.gameIcon, { backgroundColor: selected === g.id ? "#20C99722" : colors.muted }]}>
                  <MaterialCommunityIcons
                    name={g.icon as any}
                    size={24}
                    color={selected === g.id ? "#20C997" : colors.mutedForeground}
                  />
                </View>
                <View style={styles.gameInfo}>
                  <Text style={[styles.gameName, { color: colors.foreground }]}>{g.name}</Text>
                  <Text style={[styles.gamePrice, { color: colors.mutedForeground }]}>
                    {g.pricePerHour} DZD/hr
                  </Text>
                </View>
                {!g.available && (
                  <View style={[styles.unavailBadge, { backgroundColor: colors.muted }]}>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>
                      Unavailable
                    </Text>
                  </View>
                )}
                {selected === g.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#20C997" />
                )}
              </Pressable>
            ))}
          </View>

          {game && (
            <>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>DURATION</Text>
              <View style={styles.durationRow}>
                {DURATIONS.map((h) => (
                  <Pressable
                    key={h}
                    style={[
                      styles.durationChip,
                      {
                        backgroundColor: hours === h ? "#20C997" : colors.muted,
                        borderColor: hours === h ? "#20C997" : colors.border,
                      },
                    ]}
                    onPress={() => setHours(h)}
                  >
                    <Text style={[styles.durationText, { color: hours === h ? "#FFF" : colors.foreground }]}>
                      {h}h
                    </Text>
                    <Text style={[styles.durationPrice, { color: hours === h ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                      {game.pricePerHour * h} DZD
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {!success && game && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label="Rent Game" onPress={handleRent} loading={loading} price={price} />
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
  gameList: { gap: 10 },
  gameCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 12 },
  gameIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gameInfo: { flex: 1 },
  gameName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  gamePrice: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  unavailBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  durationRow: { flexDirection: "row", gap: 12 },
  durationChip: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 4 },
  durationText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  durationPrice: { fontSize: 11, fontFamily: "Inter_500Medium" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
