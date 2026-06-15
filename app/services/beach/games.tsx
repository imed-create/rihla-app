import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from '@/components/shared/ConfirmButton';
import VisualSlotGrid, { VisualSlot } from "@/components/beach/VisualSlotGrid";
import { RIHLA } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useBeachOccupancy } from "@/hooks/useBeachOccupancy";
import { safeGoBack } from "@/utils/safeNavigation";

const GAMES = [
  { id: "1", name: "Domino Set", icon: "domino-mask", pricePerHour: 200, available: true, slotLayout: "gear" as const },
  { id: "2", name: "Card Games", icon: "cards-playing-outline", pricePerHour: 150, available: true, slotLayout: "gear" as const },
  { id: "3", name: "Chess Board", icon: "chess-queen", pricePerHour: 200, available: true, slotLayout: "gear" as const },
  { id: "4", name: "Beach Volleyball", icon: "volleyball", pricePerHour: 500, available: true, slotLayout: "court" as const },
  { id: "5", name: "Table Tennis", icon: "table-tennis", pricePerHour: 400, available: false, slotLayout: "gear" as const },
  { id: "6", name: "Baffle / Pétanque", icon: "circle-outline", pricePerHour: 300, available: true, slotLayout: "gear" as const },
  { id: "7", name: "Chicha / Shisha", icon: "smoking-off", pricePerHour: 1500, available: true, slotLayout: "gear" as const },
  { id: "8", name: "Frisbee", icon: "disc-outline", pricePerHour: 100, available: true, slotLayout: "gear" as const },
];

const DURATIONS = [1, 2, 3];

function buildSlots(gameId: string, layout: "court" | "gear"): VisualSlot[] {
  if (layout === "court") {
    return Array.from({ length: 4 }, (_, i) => ({
      id: `vb-${gameId}-c${i + 1}`,
      label: `Court ${i + 1}`,
      sublabel: "Beach VB",
    }));
  }
  return Array.from({ length: 6 }, (_, i) => ({
    id: `gear-${gameId}-s${i + 1}`,
    label: `Set ${i + 1}`,
    sublabel: "Pickup booth",
  }));
}

export default function GamesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const { occupiedAssetSlots } = useBeachOccupancy();

  const [selected, setSelected] = useState<string | null>(null);
  const [assetSlotId, setAssetSlotId] = useState<string | null>(null);
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);

  const game = GAMES.find((g) => g.id === selected);
  const price = game ? game.pricePerHour * hours : 0;
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const slots = useMemo(
    () => (game ? buildSlots(game.id, game.slotLayout) : []),
    [game]
  );

  const handleRent = async () => {
    if (!game || !assetSlotId) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const slotLabel = slots.find((s) => s.id === assetSlotId)?.label ?? assetSlotId;
    const booking = addBooking({
      type: "games",
      icon: "game-controller-outline",
      iconFamily: "Ionicons",
      color: "#20C997",
      title: game.name,
      subtitle: `${slotLabel} · ${hours}h`,
      price,
      details: { gameId: game.id, hours, assetSlotId },
    });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/booking/${booking.id}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={["#20C997", "#10B981"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="game-controller-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Games & Fun</Text>
        <Text style={styles.headerSub}>Pick your court or gear slot visually</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, { color: colors.muted }]}>SELECT GAME</Text>
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
              onPress={() => {
                if (!g.available) return;
                setSelected(g.id);
                setAssetSlotId(null);
              }}
              disabled={!g.available}
            >
              <View style={[styles.gameIcon, { backgroundColor: selected === g.id ? "#20C99722" : colors.card }]}>
                <MaterialCommunityIcons
                  name={g.icon as any}
                  size={24}
                  color={selected === g.id ? "#20C997" : colors.muted}
                />
              </View>
              <View style={styles.gameInfo}>
                <Text style={[styles.gameName, { color: colors.text }]}>{g.name}</Text>
                <Text style={[styles.gamePrice, { color: colors.muted }]}>
                  {g.pricePerHour} DA/hr
                </Text>
              </View>
              {!g.available && (
                <View style={[styles.unavailBadge, { backgroundColor: colors.card }]}>
                  <Text style={{ fontSize: 11, color: colors.muted, fontFamily: "mon-sb" }}>
                    Unavailable
                  </Text>
                </View>
              )}
              {selected === g.id && <Ionicons name="checkmark-circle" size={22} color="#20C997" />}
            </Pressable>
          ))}
        </View>

        {game && (
          <>
            <VisualSlotGrid
              title={game.slotLayout === "court" ? "VOLLEYBALL COURTS" : "GEAR LOCKER SLOTS"}
              subtitle="Green = open · Red = rented · Tap your slot"
              layout={game.slotLayout}
              slots={slots}
              selectedId={assetSlotId}
              occupiedIds={occupiedAssetSlots}
              onSelect={setAssetSlotId}
            />

            <Text style={[styles.label, { color: colors.muted }]}>DURATION</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map((h) => (
                <Pressable
                  key={h}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: hours === h ? "#20C997" : colors.card,
                      borderColor: hours === h ? "#20C997" : colors.border,
                    },
                  ]}
                  onPress={() => setHours(h)}
                >
                  <Text style={[styles.durationText, { color: hours === h ? "#FFF" : colors.text }]}>
                    {h}h
                  </Text>
                  <Text
                    style={[
                      styles.durationPrice,
                      { color: hours === h ? "rgba(255,255,255,0.8)" : colors.muted },
                    ]}
                  >
                    {game.pricePerHour * h} DA
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {game && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.bg }]}>
          <ConfirmButton
            label={assetSlotId ? `Rent · ${price} DA` : "Select a slot"}
            onPress={handleRent}
            loading={loading}
            price={assetSlotId ? price : undefined}
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
  headerTitle: { fontSize: 24, fontFamily: "mon-b", color: "#FFFFFF", marginTop: 8 },
  headerSub: { fontSize: 13, fontFamily: "mon", color: "rgba(255,255,255,0.7)" },
  label: { fontSize: 11, fontFamily: "mon-sb", letterSpacing: 1 },
  gameList: { gap: 10 },
  gameCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 12 },
  gameIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gameInfo: { flex: 1 },
  gameName: { fontSize: 14, fontFamily: "mon-sb" },
  gamePrice: { fontSize: 12, fontFamily: "mon", marginTop: 2 },
  unavailBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  durationRow: { flexDirection: "row", gap: 12 },
  durationChip: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 4 },
  durationText: { fontSize: 18, fontFamily: "mon-b" },
  durationPrice: { fontSize: 11, fontFamily: "mon" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
});
