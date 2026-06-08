import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { hapticMedium } from '@/utils/haptics';

export type CartLine = { id: string; name: string; priceDZD: number; qty: number };

type Props = {
  visible: boolean;
  items: CartLine[];
  onClose: () => void;
  onAdjust: (id: string, delta: number) => void;
  onPlaceOrder: () => void;
  loading?: boolean;
};

export default function FoodCartSheet({
  visible,
  items,
  onClose,
  onAdjust,
  onPlaceOrder,
  loading,
}: Props) {
  const insets = useSafeAreaInsets();
  const total = items.reduce((s, i) => s + i.priceDZD * i.qty, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Your cart</Text>
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.priceDZD * item.qty} DZD</Text>
              </View>
              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyBtn} onPress={() => onAdjust(item.id, -1)}>
                  <Ionicons name="remove" size={18} color={RIHLA.dark} />
                </Pressable>
                <Text style={styles.qty}>{item.qty}</Text>
                <Pressable
                  style={[styles.qtyBtn, styles.qtyBtnPlus]}
                  onPress={() => onAdjust(item.id, 1)}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} DZD</Text>
        </View>
        <Pressable
          style={[styles.orderBtn, loading && { opacity: 0.7 }]}
          disabled={loading || items.length === 0}
          onPress={() => {
            hapticMedium();
            onPlaceOrder();
          }}
        >
          <Text style={styles.orderBtnText}>{loading ? 'Placing…' : 'Place Order'}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,37,64,0.45)' },
  sheet: {
    backgroundColor: RIHLA.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: RIHLA.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 12 },
  list: { maxHeight: 280 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: RIHLA.border,
    gap: 12,
  },
  itemName: { fontSize: 15, fontFamily: 'mon-sb', color: RIHLA.dark },
  itemPrice: { fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: RIHLA.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: { backgroundColor: RIHLA.primary },
  qty: { fontSize: 15, fontFamily: 'mon-b', minWidth: 20, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, fontFamily: 'mon', color: RIHLA.mutedText },
  totalValue: { fontSize: 22, fontFamily: 'mon-b', color: RIHLA.primary },
  orderBtn: {
    backgroundColor: RIHLA.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtnText: { color: '#fff', fontFamily: 'mon-b', fontSize: 16 },
});
