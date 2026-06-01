import { Ionicons } from "@expo/vector-icons";
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
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MENU = [
  { id: "1", category: "Drinks", name: "Fresh Orange Juice", price: 250, icon: "🥤" },
  { id: "2", category: "Drinks", name: "Coconut Water", price: 300, icon: "🥥" },
  { id: "3", category: "Drinks", name: "Limonade", price: 150, icon: "🍋" },
  { id: "4", category: "Drinks", name: "Café Noisette", price: 200, icon: "☕" },
  { id: "5", category: "Food", name: "Sandwich Thon", price: 450, icon: "🥪" },
  { id: "6", category: "Food", name: "Salad Fraîche", price: 500, icon: "🥗" },
  { id: "7", category: "Food", name: "Pizza Margherita", price: 800, icon: "🍕" },
  { id: "8", category: "Food", name: "Chicken Wrap", price: 600, icon: "🌯" },
  { id: "9", category: "Snacks", name: "Chips & Dips", price: 200, icon: "🍟" },
  { id: "10", category: "Snacks", name: "Fruit Platter", price: 400, icon: "🍓" },
  { id: "11", category: "Snacks", name: "Ice Cream", price: 180, icon: "🍦" },
];

const CATEGORIES = ["All", "Drinks", "Food", "Snacks"];

type CartItem = { id: string; name: string; price: number; qty: number };

export default function FoodScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const filtered = MENU.filter(
    (item) => category === "All" || item.category === category
  );
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const addToCart = (item: (typeof MENU)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c));
    });
  };

  const getQty = (id: string) => cart.find((c) => c.id === id)?.qty ?? 0;

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const itemNames = cart.map((c) => `${c.qty}x ${c.name}`).join(", ");
    addBooking({
      type: "food",
      icon: "restaurant-outline",
      iconFamily: "Ionicons",
      color: "#F4A261",
      title: "Food & Drinks Order",
      subtitle: itemNames,
      price: total,
      details: { items: itemNames, itemCount: cartCount },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#F4A261", "#E76F51"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="restaurant" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Food & Drinks</Text>
        <Text style={styles.headerSub}>Order delivered to your spot</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Order Placed!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your order will be delivered to your spot shortly
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
            showsVerticalScrollIndicator={false}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
            >
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: category === c ? "#F4A261" : colors.muted,
                      borderColor: category === c ? "#F4A261" : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(c)}
                >
                  <Text
                    style={[
                      styles.catText,
                      { color: category === c ? "#FFF" : colors.foreground },
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.menuList}>
              {filtered.map((item) => {
                const qty = getQty(item.id);
                return (
                  <View
                    key={item.id}
                    style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <Text style={styles.menuEmoji}>{item.icon}</Text>
                    <View style={styles.menuInfo}>
                      <Text style={[styles.menuName, { color: colors.foreground }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.menuPrice, { color: colors.primary }]}>
                        {item.price} DZD
                      </Text>
                    </View>
                    <View style={styles.qtyControl}>
                      {qty > 0 ? (
                        <>
                          <Pressable
                            onPress={() => removeFromCart(item.id)}
                            style={[styles.qtyBtn, { backgroundColor: colors.muted }]}
                          >
                            <Ionicons name="remove" size={16} color={colors.foreground} />
                          </Pressable>
                          <Text style={[styles.qtyNum, { color: colors.foreground }]}>
                            {qty}
                          </Text>
                        </>
                      ) : null}
                      <Pressable
                        onPress={() => addToCart(item)}
                        style={[styles.qtyBtn, { backgroundColor: "#F4A261" }]}
                      >
                        <Ionicons name="add" size={16} color="#FFF" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {cart.length > 0 && (
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
              <Text style={[styles.cartSummary, { color: colors.mutedForeground }]}>
                {cartCount} items · Total: {total} DZD
              </Text>
              <ConfirmButton
                label="Place Order"
                onPress={handleOrder}
                loading={loading}
                price={total}
              />
            </View>
          )}
        </>
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
  catRow: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  menuList: { paddingHorizontal: 20, gap: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  menuEmoji: { fontSize: 28 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 2 },
  menuPrice: { fontSize: 13, fontFamily: "Inter_700Bold" },
  qtyControl: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 15, fontFamily: "Inter_700Bold", minWidth: 20, textAlign: "center" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0", gap: 8 },
  cartSummary: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
