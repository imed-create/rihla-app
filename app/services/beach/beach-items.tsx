import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from '@/components/shared/ConfirmButton';
import VisualSlotGrid, { VisualSlot } from "@/components/beach/VisualSlotGrid";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { useBeachOccupancy } from "@/hooks/useBeachOccupancy";
import { safeGoBack } from "@/utils/safeNavigation";

const ITEMS = [
  {
    id: "jetski",
    name: "Jet Ski",
    icon: "boat-outline",
    desc: "High-speed watercraft. Safety briefing included.",
    prices: [
      { label: "15 min", price: 1500 },
      { label: "30 min", price: 2500 },
      { label: "1 hour", price: 4000 },
    ],
    dockCount: 6,
    color: "#0a2540",
  },
  {
    id: "pedalo",
    name: "Pedalo",
    icon: "sail-boat",
    desc: "Relaxing pedal boat for up to 4 people.",
    prices: [
      { label: "30 min", price: 600 },
      { label: "1 hour", price: 1000 },
      { label: "2 hours", price: 1700 },
    ],
    dockCount: 5,
    color: "#48CAE4",
  },
];

function buildDockSlots(itemId: string, count: number): VisualSlot[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `dock-${itemId}-${i + 1}`,
    label: `Dock ${i + 1}`,
    sublabel: itemId === "jetski" ? "Jet Ski" : "Pedalo",
  }));
}

export default function BeachItemsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const { occupiedAssetSlots } = useBeachOccupancy();

  const [selectedItem, setSelectedItem] = useState(ITEMS[0]);
  const [selectedPrice, setSelectedPrice] = useState(ITEMS[0].prices[0]);
  const [assetSlotId, setAssetSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const slots = useMemo(
    () => buildDockSlots(selectedItem.id, selectedItem.dockCount),
    [selectedItem]
  );

  const handleBook = async () => {
    if (!assetSlotId) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const slotLabel = slots.find((s) => s.id === assetSlotId)?.label ?? assetSlotId;
    const booking = addBooking({
      type: "beach-items",
      icon: "water-outline",
      iconFamily: "Ionicons",
      color: selectedItem.color,
      title: selectedItem.name,
      subtitle: `${slotLabel} · ${selectedPrice.label}`,
      price: selectedPrice.price,
      details: {
        itemId: selectedItem.id,
        duration: selectedPrice.label,
        assetSlotId,
      },
    });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/booking/${booking.id}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0a2540", "#023E58"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="water-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Beach Activities</Text>
        <Text style={styles.headerSub}>Jet Ski · Pedalo · Water docks</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT ACTIVITY</Text>
        <View style={styles.itemRow}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedItem.id === item.id ? item.color : colors.border,
                  borderWidth: selectedItem.id === item.id ? 2 : 1,
                },
              ]}
              onPress={() => {
                setSelectedItem(item);
                setSelectedPrice(item.prices[0]);
                setAssetSlotId(null);
              }}
            >
              <LinearGradient colors={[item.color, item.color + "BB"]} style={styles.itemIconBg}>
                <MaterialCommunityIcons name={item.icon as any} size={36} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.itemDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.desc}
              </Text>
            </Pressable>
          ))}
        </View>

        <VisualSlotGrid
          title="WATERCRAFT DOCK LAYOUT"
          subtitle="Tap an open dock — green available, red rented"
          layout="dock"
          slots={slots}
          selectedId={assetSlotId}
          occupiedIds={occupiedAssetSlots}
          onSelect={setAssetSlotId}
        />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT DURATION</Text>
        <View style={styles.priceRow}>
          {selectedItem.prices.map((p) => (
            <Pressable
              key={p.label}
              style={[
                styles.priceCard,
                {
                  backgroundColor: selectedPrice.label === p.label ? selectedItem.color : colors.card,
                  borderColor: selectedPrice.label === p.label ? selectedItem.color : colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setSelectedPrice(p)}
            >
              <Text
                style={[
                  styles.priceDuration,
                  { color: selectedPrice.label === p.label ? "#FFF" : colors.foreground },
                ]}
              >
                {p.label}
              </Text>
              <Text
                style={[
                  styles.priceAmount,
                  {
                    color:
                      selectedPrice.label === p.label ? "rgba(255,255,255,0.9)" : colors.primary,
                  },
                ]}
              >
                {p.price} DA
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.safetyCard, { backgroundColor: "#FFF8E1", borderColor: "#C9A84C" }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#C9A84C" />
          <Text style={{ flex: 1, color: "#9A7A20", fontSize: 13, fontFamily: "mon", lineHeight: 18 }}>
            Life jacket provided. Age 12+. Safety briefing mandatory before activity.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
        <ConfirmButton
          label={assetSlotId ? `Book ${selectedItem.name}` : "Select a dock slot"}
          onPress={handleBook}
          loading={loading}
          price={assetSlotId ? selectedPrice.price : undefined}
        />
      </View>
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
  itemRow: { flexDirection: "row", gap: 12 },
  itemCard: { flex: 1, borderRadius: 16, padding: 14, gap: 8, alignItems: "center" },
  itemIconBg: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  itemName: { fontSize: 16, fontFamily: "mon-b", textAlign: "center" },
  itemDesc: { fontSize: 12, fontFamily: "mon", textAlign: "center", lineHeight: 16 },
  priceRow: { flexDirection: "row", gap: 10 },
  priceCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 4 },
  priceDuration: { fontSize: 14, fontFamily: "mon-sb" },
  priceAmount: { fontSize: 13, fontFamily: "mon-b" },
  safetyCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
});
