/**
 * SAHEL — Cart & Checkout Screen
 * ──────────────────────────────
 * Order summary, delivery spot confirmation, payment method selection
 * (Chargily online payment or Cash on Delivery), and final order placement.
 *
 * Receives cart data via route params (encoded JSON string).
 * On successful order creation → navigates to order tracking.
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '@/components/Toast';
import { SAHEL } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';
import { useBeachOccupancy } from '@/hooks/useBeachOccupancy';
import { orderTrackingHref } from '@/utils/router';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticHeavy, hapticSuccess } from '@/utils/haptics';

// ── Types ──
type CheckoutItem = { id: string; name: string; priceDZD: number; qty: number };
type PaymentMethod = 'cod' | 'chargily';

// ── Payment method options ──
const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string; desc: string; color: string }[] = [
  {
    key: 'cod',
    label: 'Cash on Delivery',
    icon: 'cash-outline',
    desc: 'Pay when your order arrives at your spot',
    color: SAHEL.accent,
  },
  {
    key: 'chargily',
    label: 'Pay Online',
    icon: 'card-outline',
    desc: 'Secure payment via Chargily (Visum, CCP, BaridiMob)',
    color: SAHEL.primary,
  },
];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { addOrder } = useApp();
  const { deliverySpotId } = useBeachOccupancy();

  // Parse cart data from route params
  const params = useLocalSearchParams<{
    items?: string;
    spotLabel?: string;
    beachId?: string;
  }>();

  const cartItems = useMemo<CheckoutItem[]>(() => {
    try {
      return params.items ? (JSON.parse(params.items) as CheckoutItem[]) : [];
    } catch {
      return [];
    }
  }, [params.items]);

  const spotLabel = params.spotLabel ?? deliverySpotId ?? 'Desk';
  const beachId = params.beachId ?? 'sidi-fredj';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // ── Computed totals ──
  const subtotal = cartItems.reduce((sum, item) => sum + item.priceDZD * item.qty, 0);
  const deliveryFee: number = 0; // Free delivery for now
  const total = subtotal + deliveryFee;
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // ── Place order handler ──
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || loading || orderPlaced) return;
    setLoading(true);
    hapticHeavy();

    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1200));

    const order = addOrder({
      userId: 'guest',
      beachId,
      spotLabel,
      totalDZD: total,
      paid: paymentMethod === 'chargily',
      items: cartItems.map((c) => ({
        id: c.id,
        orderId: '',
        menuItemId: c.id,
        name: c.name,
        quantity: c.qty,
        priceDZD: c.priceDZD,
      })),
    });

    setLoading(false);
    setOrderPlaced(true);
    hapticSuccess();

    if (paymentMethod === 'chargily') {
      showToast('Payment processing — you will be redirected', 'info');
    } else {
      showToast('Order placed! Pay on delivery.', 'success');
    }

    // Navigate to order tracking
    setTimeout(() => {
      router.replace(orderTrackingHref(order.id));
    }, 600);
  };

  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      {/* Header */}
      <LinearGradient colors={[SAHEL.primary, SAHEL.accent]} style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.headerSub}>{itemCount} item(s) · Deliver to {spotLabel}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── DELIVERY INFO ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color={SAHEL.accent} />
            <Text style={styles.sectionTitle}>Delivery Location</Text>
          </View>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.deliverySpot}>{spotLabel}</Text>
              <Text style={styles.deliveryBeach}>Sidi Fredj Beach · Algiers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={SAHEL.mutedText} />
          </View>
        </View>

        {/* ── ORDER SUMMARY ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={18} color={SAHEL.primary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          <View style={styles.summaryCard}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text style={styles.summaryQty}>{item.qty}×</Text>
                  <Text style={styles.summaryName}>{item.name}</Text>
                </View>
                <Text style={styles.summaryPrice}>{(item.priceDZD * item.qty).toLocaleString()} DZD</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{subtotal.toLocaleString()} DZD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: SAHEL.accent }]}>
                {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} DZD`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} DZD</Text>
            </View>
          </View>
        </View>

        {/* ── PAYMENT METHOD ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet-outline" size={18} color={SAHEL.highlight} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          {PAYMENT_METHODS.map((pm) => (
            <Pressable
              key={pm.key}
              style={[
                styles.paymentCard,
                paymentMethod === pm.key && {
                  borderColor: pm.color,
                  backgroundColor: pm.color + '08',
                },
              ]}
              onPress={() => {
                setPaymentMethod(pm.key);
              }}
            >
              <View style={[styles.paymentIconWrap, { backgroundColor: pm.color + '15' }]}>
                <Ionicons name={pm.icon as any} size={22} color={pm.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.paymentLabel,
                    paymentMethod === pm.key && { color: pm.color, fontFamily: 'mon-b' },
                  ]}
                >
                  {pm.label}
                </Text>
                <Text style={styles.paymentDesc}>{pm.desc}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  paymentMethod === pm.key && { borderColor: pm.color, backgroundColor: pm.color },
                ]}
              >
                {paymentMethod === pm.key && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── ESTIMATED TIME ── */}
        <View style={styles.etaCard}>
          <Ionicons name="time-outline" size={18} color={SAHEL.accent} />
          <Text style={styles.etaText}>Estimated delivery: 15–25 minutes</Text>
        </View>
      </ScrollView>

      {/* ── PLACE ORDER BUTTON ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomTotal}>{total.toLocaleString()} DZD</Text>
          <Text style={styles.bottomItems}>{itemCount} item(s)</Text>
        </View>
        <Pressable
          style={[styles.orderBtn, (loading || orderPlaced || cartItems.length === 0) && { opacity: 0.6 }]}
          disabled={loading || orderPlaced || cartItems.length === 0}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.orderBtnText}>
            {loading
              ? 'Processing…'
              : paymentMethod === 'chargily'
                ? 'Pay & Place Order'
                : 'Place Order'}
          </Text>
          {!loading && (
            <Ionicons
              name={paymentMethod === 'chargily' ? 'card-outline' : 'checkmark-circle-outline'}
              size={20}
              color="#fff"
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 8 },
  headerTitle: { fontSize: 24, fontFamily: 'mon-b', color: '#fff' },
  headerSub: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  // Sections
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },

  // Delivery
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 14,
  },
  deliveryDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: SAHEL.accent },
  deliverySpot: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  deliveryBeach: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 2 },

  // Summary
  summaryCard: {
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 16,
    gap: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  summaryQty: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.mutedText, minWidth: 24 },
  summaryName: { fontSize: 14, fontFamily: 'mon', color: SAHEL.dark, flexShrink: 1 },
  summaryPrice: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  summaryLabel: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText },
  summaryValue: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.dark },
  divider: { height: 1, backgroundColor: SAHEL.border, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  totalValue: { fontSize: 20, fontFamily: 'mon-b', color: SAHEL.primary },

  // Payment
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: SAHEL.border,
    padding: 14,
    marginBottom: 10,
  },
  paymentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLabel: { fontSize: 15, fontFamily: 'mon-sb', color: SAHEL.dark },
  paymentDesc: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: SAHEL.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },

  // ETA
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E6FAF7',
    borderRadius: 12,
    padding: 12,
  },
  etaText: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.primary },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: SAHEL.card,
    borderTopWidth: 1,
    borderTopColor: SAHEL.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomInfo: { flex: 1 },
  bottomTotal: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomItems: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SAHEL.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
  },
  orderBtnText: { color: '#fff', fontFamily: 'mon-b', fontSize: 15 },
});
