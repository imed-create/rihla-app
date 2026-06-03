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

const PRODUCTS = [
  { id: "1", name: "Men's Board Shorts", price: 1800, sizes: ["S", "M", "L", "XL"], color: "#00a896" },
  { id: "2", name: "Women's Bikini Set", price: 2200, sizes: ["XS", "S", "M", "L"], color: "#FF6B6B" },
  { id: "3", name: "Rash Guard Top", price: 1500, sizes: ["S", "M", "L", "XL"], color: "#06D6A0" },
  { id: "4", name: "Kids Swimsuit", price: 1200, sizes: ["4-6", "7-9", "10-12"], color: "#FFD166" },
  { id: "5", name: "Swim Cap", price: 400, sizes: ["One Size"], color: "#845EC2" },
  { id: "6", name: "Towel (Large)", price: 800, sizes: ["One Size"], color: "#F4A261" },
];

export default function ClothesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [selected, setSelected] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const product = PRODUCTS.find((p) => p.id === selected);
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  const handleBuy = async () => {
    if (!product || !size) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "clothes",
      icon: "shirt-outline",
      iconFamily: "Ionicons",
      color: "#FF6B6B",
      title: product.name,
      subtitle: `Size: ${size}`,
      price: product.price,
      details: { productId: product.id, size },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FF6B6B", "#EE5A5A"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <MaterialCommunityIcons name="tshirt-crew-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Swim Clothes</Text>
        <Text style={styles.headerSub}>Buy beach gear on the spot</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Purchase Complete!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your item will be ready for pickup at the store counter
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT ITEM</Text>
          <View style={styles.grid}>
            {PRODUCTS.map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.productCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selected === p.id ? p.color : colors.border,
                    borderWidth: selected === p.id ? 2 : 1,
                  },
                ]}
                onPress={() => {
                  setSelected(p.id);
                  setSize(null);
                }}
              >
                <View style={[styles.productIcon, { backgroundColor: p.color + "22" }]}>
                  <MaterialCommunityIcons name="tshirt-crew-outline" size={28} color={p.color} />
                </View>
                <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
                  {p.name}
                </Text>
                <Text style={[styles.productPrice, { color: colors.primary }]}>
                  {p.price} DZD
                </Text>
                {selected === p.id && (
                  <View style={[styles.checkBadge, { backgroundColor: p.color }]}>
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {product && (
            <>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>SELECT SIZE</Text>
              <View style={styles.sizeRow}>
                {product.sizes.map((s) => (
                  <Pressable
                    key={s}
                    style={[
                      styles.sizeChip,
                      {
                        backgroundColor: size === s ? "#FF6B6B" : colors.muted,
                        borderColor: size === s ? "#FF6B6B" : colors.border,
                      },
                    ]}
                    onPress={() => setSize(s)}
                  >
                    <Text style={[styles.sizeText, { color: size === s ? "#FFF" : colors.foreground }]}>
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {!success && product && size && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label="Buy Now" onPress={handleBuy} loading={loading} price={product.price} />
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  productCard: { width: "47%", borderRadius: 16, padding: 14, gap: 8, position: "relative" },
  productIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  productName: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  productPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  checkBadge: { position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sizeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sizeChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  sizeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
