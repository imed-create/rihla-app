import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';
import { getCategoryDef } from '@/constants/marketplaceCategories';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

export default function RestaurantCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  const steps = [
    { key: 'placed', label: 'Order Placed', icon: 'receipt-outline' },
    { key: 'cooking', label: 'Kitchen Cooking', icon: 'restaurant-outline' },
    { key: 'delivery', label: 'Out for Delivery', icon: 'bicycle-outline' },
    { key: 'delivered', label: 'Delivered to Spot', icon: 'checkmark-circle-outline' }
  ];

  // Active index
  const activeStep = useMemo(() => {
    if (booking.status === 'completed') return 3;
    if (booking.status === 'cancelled') return -1;
    if (booking.status === 'active') return 1; // Preparing
    return 0; // Placed
  }, [booking.status]);

  const handleDownloadInvoice = () => {
    if (downloadProgress !== null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Invoice Downloaded', 'PDF invoice receipt saved to your device.');
          return null;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order Tracking Companion</Text>
      </View>

      {/* ── LIVE KITCHEN PROGRESS STEPPER ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Real-time Stepper Tracker</Text>
        <View style={styles.stepperContainer}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= activeStep;
            const isCurrent = idx === activeStep;
            const stepColor = isCompleted ? '#C56A39' : colors.muted;

            return (
              <View key={step.key} style={styles.stepItem}>
                <View style={styles.stepIndicatorCol}>
                  <View style={[styles.stepCircle, { borderColor: stepColor, backgroundColor: isCurrent ? '#C56A39' : colors.card }]}>
                    <Ionicons name={step.icon as any} size={16} color={isCurrent ? '#FFF' : stepColor} />
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[styles.stepLine, { backgroundColor: idx < activeStep ? '#C56A39' : colors.border }]} />
                  )}
                </View>
                <View style={styles.stepLabelWrap}>
                  <Text style={[styles.stepLabel, { color: isCompleted ? colors.text : colors.muted, fontFamily: isCurrent ? 'mon-b' : 'mon-sb' }]}>
                    {step.label}
                  </Text>
                  <Text style={[styles.stepTime, { color: colors.muted }]}>
                    {idx === 0 ? '19:15' : idx === 1 ? '19:18' : idx === 2 ? 'Estimated 19:30' : 'Pending'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── COURIER CONTACT & ACTION BUTTONS ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('Dialing Courier', 'Calling delivery courier at +213 550-12-34-56...')}
        >
          <Ionicons name="call" size={16} color="#C56A39" />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Call Courier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Alert.alert('Chat Active', 'Direct courier chat portal opened.')}
        >
          <Ionicons name="chatbubble-ellipses" size={16} color="#C56A39" />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Message Courier</Text>
        </TouchableOpacity>
      </View>

      {/* ── INVOICE DOWNLOADER ── */}
      <TouchableOpacity 
        style={[styles.invoiceBtn, { borderColor: '#C56A39', backgroundColor: '#C56A3912' }]}
        onPress={handleInvoiceDownload}
      >
        <Ionicons name="document-text-outline" size={18} color="#C56A39" />
        <Text style={styles.invoiceText}>
          {downloadProgress !== null ? `Downloading Invoice: ${downloadProgress}%` : 'Download PDF Invoice Receipt'}
        </Text>
      </TouchableOpacity>

      {/* ── ORDER ITEMS LIST ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Order Summary</Text>
        <View style={styles.itemsList}>
          <View style={styles.itemRow}>
            <Text style={[styles.itemText, { color: colors.text }]}><Text style={styles.qtyText}>1x</Text> {booking.title}</Text>
            <Text style={[styles.itemPrice, { color: colors.text }]}>{booking.price.toLocaleString()} DA</Text>
          </View>
          {booking.details.delivery_destination && (
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          )}
          {booking.details.delivery_destination && (
            <View style={styles.destinationBox}>
              <Text style={[styles.destLabel, { color: colors.muted }]}>DELIVERY LOCATION</Text>
              <Text style={[styles.destText, { color: colors.text }]}>{String(booking.details.delivery_destination)}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  function handleInvoiceDownload() {
    handleDownloadInvoice();
  }
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  stepperContainer: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 52,
  },
  stepIndicatorCol: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepLabelWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    paddingBottom: 10,
  },
  stepLabel: {
    fontSize: 13,
  },
  stepTime: {
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  invoiceBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  invoiceText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#C56A39',
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  qtyText: {
    color: '#C56A39',
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  divider: {
    height: 1,
  },
  destinationBox: {
    gap: 3,
  },
  destLabel: {
    fontSize: 10,
    fontFamily: 'mon-b',
  },
  destText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
});
