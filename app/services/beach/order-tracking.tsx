import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '@/components/Toast';
import { SAHEL } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';
import type { OrderStatus } from '@/types/order';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticSuccess } from '@/utils/haptics';

const STEPS: { key: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'pending', label: 'Pending', icon: 'time-outline' },
  { key: 'preparing', label: 'Preparing', icon: 'restaurant-outline' },
  { key: 'on_the_way', label: 'On the way', icon: 'bicycle-outline' },
  { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle-outline' },
];

const ADVANCE_MS: Record<OrderStatus, number> = {
  pending: 10000,
  preparing: 20000,
  on_the_way: 15000,
  delivered: 0,
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { orders, updateOrderStatus } = useApp();
  const order = orders.find((o) => o.id === id);
  const [timestamps, setTimestamps] = useState<Partial<Record<OrderStatus, string>>>({});

  const status = order?.status ?? 'pending';
  const stepIndex = STEPS.findIndex((s) => s.key === status);
  const progress = useSharedValue(stepIndex / (STEPS.length - 1));

  useEffect(() => {
    progress.value = withTiming(stepIndex / (STEPS.length - 1), { duration: 600 });
  }, [stepIndex, progress]);

  useEffect(() => {
    if (!order || status === 'delivered') return;
    const delay = ADVANCE_MS[status];
    if (!delay) return;
    const t = setTimeout(() => {
      const next: OrderStatus =
        status === 'pending'
          ? 'preparing'
          : status === 'preparing'
            ? 'on_the_way'
            : 'delivered';
      updateOrderStatus(order.id, next);
      setTimestamps((prev) => ({ ...prev, [next]: new Date().toLocaleTimeString() }));
      if (next === 'delivered') {
        hapticSuccess();
        showToast('Your order has arrived! 🎉', 'success');
      }
    }, delay);
    return () => clearTimeout(t);
  }, [order, status, updateOrderStatus]);

  useEffect(() => {
    if (order) {
      setTimestamps({ [order.status]: new Date().toLocaleTimeString() });
    }
  }, [order?.id]);

  const lineStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, progress.value) * 100}%`,
  }));

  const items = order?.items ?? [];

  if (!order) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.missing}>Order not found</Text>
        <Pressable onPress={() => safeGoBack()}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Pressable onPress={() => safeGoBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={SAHEL.dark} />
      </Pressable>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}>
        <Text style={styles.title}>Order tracking</Text>
        <Text style={styles.orderId}>#{order.id.slice(-6)}</Text>

        <View style={styles.stepper}>
          <View style={styles.stepperTrackWrap}>
          <View style={styles.trackBg}>
            <Animated.View style={[styles.trackFill, lineStyle]} />
          </View>
          </View>
          {STEPS.map((step, i) => {
            const done = i <= stepIndex;
            const active = i === stepIndex;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View
                  style={[
                    styles.circle,
                    done && styles.circleDone,
                    active && styles.circleActive,
                  ]}
                >
                  {done && i < stepIndex ? (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  ) : (
                    <Ionicons
                      name={step.icon}
                      size={16}
                      color={done ? '#fff' : SAHEL.mutedText}
                    />
                  )}
                </View>
                <View style={styles.stepText}>
                  <Text style={[styles.stepLabel, active && styles.stepLabelBold]}>
                    {step.label}
                  </Text>
                  {timestamps[step.key] ? (
                    <Text style={styles.stepTime}>{timestamps[step.key]}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order summary</Text>
          {order.spotLabel ? (
            <Text style={styles.spot}>Deliver to spot {order.spotLabel}</Text>
          ) : null}
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}× {item.name}
              </Text>
              <Text style={styles.itemPrice}>{item.priceDZD * item.quantity} DZD</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>{order.totalDZD.toLocaleString()} DZD</Text>
          </View>
        </View>

        <Pressable
          style={styles.outlineBtn}
          onPress={() => Linking.openURL('tel:+213555000000')}
        >
          <Ionicons name="call-outline" size={18} color={SAHEL.primary} />
          <Text style={styles.outlineBtnText}>Contact Beach Staff</Text>
        </Pressable>

        {status === 'delivered' && (
          <Pressable style={styles.rateBtn} onPress={() => showToast('Thanks for your feedback!', 'info')}>
            <Text style={styles.rateBtnText}>Rate Experience</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SAHEL.background },
  back: { padding: 16 },
  title: { fontSize: 26, fontFamily: 'mon-b', color: SAHEL.dark },
  orderId: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText, marginBottom: 20 },
  stepper: { gap: 16, marginBottom: 24, position: 'relative' },
  stepperTrackWrap: { position: 'absolute', left: 19, top: 12, bottom: 12, width: 4, zIndex: 0 },
  trackBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: SAHEL.border,
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: SAHEL.accent,
    borderRadius: 2,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, zIndex: 1 },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SAHEL.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: { backgroundColor: SAHEL.accent },
  circleActive: { backgroundColor: SAHEL.primary },
  stepText: { flex: 1 },
  stepLabel: { fontSize: 15, fontFamily: 'mon', color: SAHEL.mutedText },
  stepLabelBold: { fontFamily: 'mon-b', color: SAHEL.dark },
  stepTime: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText, marginTop: 2 },
  card: {
    backgroundColor: SAHEL.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 4 },
  spot: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.accent, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontFamily: 'mon', color: SAHEL.dark },
  itemPrice: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: SAHEL.border,
  },
  totalLabel: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  totalVal: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: SAHEL.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  outlineBtnText: { fontFamily: 'mon-b', fontSize: 15, color: SAHEL.primary },
  rateBtn: {
    backgroundColor: SAHEL.highlight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rateBtnText: { fontFamily: 'mon-b', fontSize: 15, color: '#fff' },
  missing: { fontSize: 16, fontFamily: 'mon-b', textAlign: 'center', color: SAHEL.dark },
  link: { textAlign: 'center', color: SAHEL.accent, marginTop: 12, fontFamily: 'mon-sb' },
});
