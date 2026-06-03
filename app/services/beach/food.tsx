import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodCartSheet, { CartLine } from '@/components/beach/FoodCartSheet';
import DeliverySpotMatrix from '@/components/beach/DeliverySpotMatrix';
import { showToast } from '@/components/Toast';
import { FOOD_CATEGORIES, FOOD_MENU } from '@/constants/foodMenu';
import { SAHEL } from '@/constants/Colors';
import { SandSpot, SandZoneId } from '@/constants/beachLayout';
import { useApp } from '@/context/AppContext';
import { useBeachOccupancy } from '@/hooks/useBeachOccupancy';
import type { MenuCategory } from '@/types/order';
import { orderTrackingHref } from '@/utils/router';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

const TAB_W = (Dimensions.get('window').width - 32) / 3;

type CartItem = { id: string; name: string; priceDZD: number; qty: number };

export default function FoodScreen() {
  const insets = useSafeAreaInsets();
  const { addOrder } = useApp();
  const { occupiedSpotIds, deliverySpotId } = useBeachOccupancy();

  const [category, setCategory] = useState<MenuCategory>('drinks');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [zone, setZone] = useState<SandZoneId>('family');
  const [spot, setSpot] = useState<SandSpot | null>(null);
  const [loading, setLoading] = useState(false);
  const cartScale = useSharedValue(1);

  const tabIndex = FOOD_CATEGORIES.findIndex((c) => c.key === category);
  const tabX = useSharedValue(tabIndex * TAB_W);

  const menu = useMemo(
    () => FOOD_MENU.filter((m) => m.category === category),
    [category]
  );
  const total = cart.reduce((s, i) => s + i.priceDZD * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const tabUnderline = useAnimatedStyle(() => ({
    transform: [{ translateX: tabX.value }],
  }));

  const cartBarAnim = useAnimatedStyle(() => ({
    transform: [{ scale: cartScale.value }],
  }));

  const setCat = (key: MenuCategory) => {
    hapticLight();
    setCategory(key);
    const i = FOOD_CATEGORIES.findIndex((c) => c.key === key);
    tabX.value = withSpring(i * TAB_W, { damping: 18, stiffness: 220 });
  };

  const addToCart = (item: (typeof FOOD_MENU)[0]) => {
    hapticLight();
    const wasEmpty = cart.length === 0;
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      if (ex) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id: item.id, name: item.name, priceDZD: item.priceDZD, qty: 1 }];
    });
    if (wasEmpty) {
      cartScale.value = withSpring(1.05, { damping: 8 }, () => {
        cartScale.value = withSpring(1);
      });
    }
  };

  const adjustCart = (id: string, delta: number) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === id);
      if (!ex) return prev;
      const qty = ex.qty + delta;
      if (qty <= 0) return prev.filter((c) => c.id !== id);
      return prev.map((c) => (c.id === id ? { ...c, qty } : c));
    });
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const deliveryId = spot?.id ?? deliverySpotId ?? 'Desk';
    const order = addOrder({
      userId: 'guest',
      beachId: 'sidi-fredj',
      spotLabel: String(deliveryId),
      totalDZD: total,
      paid: false,
      items: cart.map((c) => ({
        id: c.id,
        orderId: '',
        menuItemId: c.id,
        name: c.name,
        quantity: c.qty,
        priceDZD: c.priceDZD,
      })),
    });
    setLoading(false);
    setCart([]);
    setCartOpen(false);
    hapticSuccess();
    showToast('Order placed!', 'success');
    router.push(orderTrackingHref(order.id));
  };

  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <LinearGradient
        colors={[SAHEL.primary, SAHEL.accent]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Food & Drinks</Text>
          {count > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{count}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}>
        <DeliverySpotMatrix
          deliveryZone={zone}
          deliverySpotId={deliverySpotId}
          selectedSpotId={spot?.id ?? null}
          occupiedSpotIds={occupiedSpotIds}
          onSelectSpot={(s: SandSpot) => {
            setSpot(s);
            setZone(s.zone);
          }}
        />

        <View style={styles.tabs}>
          {FOOD_CATEGORIES.map((c) => (
            <Pressable
              key={c.key}
              style={[styles.tab, { width: TAB_W }]}
              onPress={() => c.key !== 'all' && setCat(c.key)}
            >
              <Text style={styles.tabEmoji}>{c.emoji}</Text>
              <Text style={[styles.tabLabel, category === c.key && styles.tabLabelOn]}>
                {c.label}
              </Text>
            </Pressable>
          ))}
          <Animated.View style={[styles.tabLine, { width: TAB_W }, tabUnderline]} />
        </View>

        {menu.map((item) => {
          const qty = cart.find((c) => c.id === item.id)?.qty ?? 0;
          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.nameAr}>{item.nameAr}</Text>
                <Text style={styles.price}>{item.priceDZD} DZD</Text>
              </View>
              <View style={styles.qtyCol}>
                {qty > 0 ? (
                  <>
                    <Pressable style={styles.minus} onPress={() => adjustCart(item.id, -1)}>
                      <Ionicons name="remove" size={16} color={SAHEL.dark} />
                    </Pressable>
                    <Text style={styles.qtyN}>{qty}</Text>
                  </>
                ) : null}
                <Pressable style={styles.plus} onPress={() => addToCart(item)}>
                  <Ionicons name="add" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {count > 0 && (
        <Animated.View style={[styles.floatBar, cartBarAnim, { paddingBottom: insets.bottom + 10 }]}>
          <Pressable style={styles.floatInner} onPress={() => setCartOpen(true)}>
            <View style={styles.floatBadge}>
              <Text style={styles.floatBadgeText}>{count}</Text>
            </View>
            <Text style={styles.floatLabel}>View Cart</Text>
            <Text style={styles.floatTotal}>{total.toLocaleString()} DZD →</Text>
          </Pressable>
        </Animated.View>
      )}

      <FoodCartSheet
        visible={cartOpen}
        items={cart as CartLine[]}
        onClose={() => setCartOpen(false)}
        onAdjust={adjustCart}
        onPlaceOrder={placeOrder}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#fff' },
  cartBadge: {
    backgroundColor: SAHEL.highlight,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: SAHEL.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SAHEL.border,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  tab: { alignItems: 'center', paddingVertical: 10 },
  tabEmoji: { fontSize: 18 },
  tabLabel: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  tabLabelOn: { fontFamily: 'mon-b', color: SAHEL.primary },
  tabLine: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: SAHEL.accent,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 14,
    marginBottom: 10,
  },
  emoji: { fontSize: 32 },
  name: { fontSize: 15, fontFamily: 'mon-sb', color: SAHEL.dark },
  nameAr: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  price: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.accent, marginTop: 4 },
  qtyCol: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  minus: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: SAHEL.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: SAHEL.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyN: { fontSize: 14, fontFamily: 'mon-b', minWidth: 18, textAlign: 'center' },
  floatBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  floatInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SAHEL.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: SAHEL.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  floatBadge: {
    backgroundColor: SAHEL.highlight,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatBadgeText: { color: '#fff', fontFamily: 'mon-b', fontSize: 12 },
  floatLabel: { flex: 1, color: '#fff', fontFamily: 'mon-sb', fontSize: 15 },
  floatTotal: { color: '#fff', fontFamily: 'mon-b', fontSize: 14 },
});
