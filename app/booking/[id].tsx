/**
 * RIHLA — Booking Detail (Polished)
 * Premium booking detail with live tracker, QR, countdown, clean layout
 */

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import CountdownTimer from '@/components/shared/CountdownTimer';
import LiveTracker from '@/components/shared/LiveTracker';
import { RIHLA } from '@/constants/theme';

function BookingIcon({ icon, iconFamily, color, size = 22 }: { icon: string; iconFamily: string; color: string; size?: number }) {
  if (iconFamily === "MaterialCommunityIcons")
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  if (iconFamily === "Feather")
    return <Feather name={icon as any} size={size} color={color} />;
  return <Ionicons name={icon as any} size={size} color={color} />;
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  active: "#06D6A0",
  completed: "#64748B",
  cancelled: "#EF4444",
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { getBookingById, cancelBooking } = useApp();
  const booking = getBookingById(id ?? "");

  const [qrVisible, setQrVisible] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  if (!booking) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40, paddingHorizontal: 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Booking not found</Text>
        </View>
      </View>
    );
  }

  const statusColor = STATUS_COLOR[booking.status] ?? "#64748B";
  const isActive = booking.status === "active";

  const qrValue = JSON.stringify({
    id: booking.id, type: booking.type, title: booking.title,
    status: booking.status, price: booking.price,
    ...(booking.expiresAt ? { expiresAt: booking.expiresAt } : {}),
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `RIHLA Booking\n${booking.title}\n${booking.subtitle}\nRef: ${booking.id.slice(-8).toUpperCase()}`,
      });
    } catch { /* noop */ }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      `Cancel your ${booking.title} booking?`,
      [
        { text: "Keep It", style: "cancel" },
        {
          text: "Cancel", style: "destructive",
          onPress: () => { cancelBooking(booking.id); handleBack(); },
        },
      ]
    );
  };

  const detailEntries = Object.entries(booking.details).filter(
    ([k]) => !["status", "id"].includes(k)
  );

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Uber dark header */}
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Booking Details</Text>
            <Text style={styles.headerId}>Ref: {booking.id.slice(-8).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Feather name="share" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Service Info Card */}
          <View style={[styles.serviceCard, { borderColor: "#E2E8F0" }]}>
            <View style={[styles.serviceIconWrap, { backgroundColor: (booking.color || RIHLA.primary) + "15" }]}>
              <BookingIcon icon={booking.icon} iconFamily={booking.iconFamily} color={booking.color} size={28} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{booking.title}</Text>
              <Text style={styles.serviceSubtitle}>{booking.subtitle}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABEL[booking.status]}</Text>
            </View>
          </View>

          {/* Live Tracker */}
          {isActive && (
            <LiveTracker
              userLatitude={36.7538}
              userLongitude={3.0588}
              destinationLatitude={36.7369}
              destinationLongitude={2.8658}
              totalEtaMinutes={18}
              providerName={booking.title}
              category={booking.type}
              isActive={true}
              height={220}
              color={booking.color || RIHLA.primary}
              routePoints={[
                { latitude: 36.7538, longitude: 3.0588 },
                { latitude: 36.748, longitude: 3.02 },
                { latitude: 36.743, longitude: 2.98 },
                { latitude: 36.74, longitude: 2.92 },
                { latitude: 36.7369, longitude: 2.8658 },
              ]}
            />
          )}

          {/* Countdown */}
          {booking.expiresAt && isActive && (
            <View style={[styles.countdownCard, { backgroundColor: "#FFFBEB", borderColor: "#FEF3C7" }]}>
              <Ionicons name="time-outline" size={18} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.countdownLabel}>Time remaining to arrive</Text>
                <CountdownTimer expiresAt={booking.expiresAt} onExpired={() => {}} />
              </View>
            </View>
          )}

          {/* QR Ticket Block */}
          <View style={[styles.qrBlock, { borderColor: "#E2E8F0" }]}>
            <View style={styles.qrBlockLeft}>
              <Text style={styles.qrTitle}>Entry Ticket QR</Text>
              <Text style={styles.qrSub}>
                Show this ticket code to local operators at the venue
              </Text>
              <TouchableOpacity
                style={[styles.qrBtn, { backgroundColor: booking.color || RIHLA.primary }]}
                onPress={() => setQrVisible(true)}
              >
                <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
                <Text style={styles.qrBtnText}>Expand Ticket</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.qrPreview}>
              <QRCode value={qrValue} size={80} color={booking.color} backgroundColor="#FFFFFF" />
            </View>
          </View>

          {/* Booking Reference */}
          <View style={[styles.refRow, { backgroundColor: "#F1F5F9" }]}>
            <Text style={styles.refLabel}>Booking Reference</Text>
            <Text style={styles.refValue}>{booking.id.slice(-10).toUpperCase()}</Text>
          </View>

          {/* Price */}
          <View style={[styles.priceRow, { borderColor: "#E2E8F0" }]}>
            <Text style={styles.priceLabel}>Total paid</Text>
            <Text style={[styles.priceValue, { color: booking.color || RIHLA.primary }]}>
              {booking.price === 0 ? "Free" : `${booking.price.toLocaleString()} DA`}
            </Text>
          </View>

          {/* Booking Details */}
          {detailEntries.length > 0 && (
            <View style={[styles.detailsCard, { borderColor: "#E2E8F0" }]}>
              <Text style={styles.detailsTitle}>Booking Summary</Text>
              {detailEntries.map(([key, value]) => (
                <View key={key} style={[styles.detailRow, { borderTopColor: "#F1F5F9" }]}>
                  <Text style={styles.detailKey}>
                    {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                  <Text style={styles.detailValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Date */}
          <View style={[styles.dateCard, { backgroundColor: "#F8FAFC" }]}>
            <Feather name="calendar" size={16} color="#64748B" />
            <Text style={styles.dateText}>
              Booked on {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>

          {/* Cancel Button */}
          {isActive && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* QR Full-Screen Modal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setQrVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setQrVisible(false)}>
              <Feather name="x" size={20} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>{booking.title}</Text>
            <Text style={styles.modalSub}>{booking.subtitle}</Text>

            <View style={styles.modalQrWrap}>
              <QRCode value={qrValue} size={220} color={booking.color || RIHLA.primary} backgroundColor="#FFFFFF" />
            </View>

            <View style={styles.modalRefRow}>
              <Text style={styles.modalRefLabel}>REF</Text>
              <Text style={styles.modalRefValue}>{booking.id.slice(-10).toUpperCase()}</Text>
            </View>

            <View style={[styles.modalStatusRow, { backgroundColor: statusColor + "15" }]}>
              <View style={[styles.modalStatusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.modalStatusText, { color: statusColor }]}>
                {STATUS_LABEL[booking.status]}
              </Text>
              {booking.price > 0 && (
                <Text style={styles.modalPrice}> · {booking.price.toLocaleString()} DA</Text>
              )}
            </View>

            <Text style={styles.modalHint}>
              Present this code to local operators for entry validation
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },

  // Uber dark header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 20,
    backgroundColor: '#0d0d0d',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "mon-b", color: "#FFFFFF" },
  headerId: { fontSize: 11, fontFamily: "mon", color: "rgba(255,255,255,0.6)", marginTop: 1 },
  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },

  content: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  notFound: { flex: 1, alignItems: "center", paddingTop: 80, gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "mon", color: "#64748B" },

  // Service Card
  serviceCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16, borderWidth: 1, backgroundColor: "#FFFFFF",
  },
  serviceIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 16, fontFamily: "mon-b", color: "#0F172A", lineHeight: 20 },
  serviceSubtitle: { fontSize: 13, fontFamily: "mon", color: "#64748B", marginTop: 2 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: "mon-sb" },

  // Countdown
  countdownCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  countdownLabel: { fontSize: 12, fontFamily: "mon-sb", color: "#D97706", marginBottom: 2 },

  // QR Block
  qrBlock: {
    flexDirection: "row", alignItems: "center",
    padding: 16, borderRadius: 16, borderWidth: 1, gap: 16, backgroundColor: "#FFFFFF",
  },
  qrBlockLeft: { flex: 1, gap: 6 },
  qrTitle: { fontSize: 15, fontFamily: "mon-b", color: "#0F172A" },
  qrSub: { fontSize: 12, fontFamily: "mon", color: "#64748B", lineHeight: 17 },
  qrBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 4,
  },
  qrBtnText: { fontSize: 13, fontFamily: "mon-b", color: "#FFFFFF" },
  qrPreview: {
    padding: 8, borderRadius: 12, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#F1F5F9",
  },

  // Reference
  refRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  refLabel: { fontSize: 12, fontFamily: "mon-sb", color: "#64748B" },
  refValue: { fontSize: 13, fontFamily: "mon-b", color: "#0F172A", letterSpacing: 1 },

  // Price
  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1,
  },
  priceLabel: { fontSize: 14, fontFamily: "mon", color: "#64748B" },
  priceValue: { fontSize: 22, fontFamily: "mon-b" },

  // Details
  detailsCard: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden", backgroundColor: "#FFFFFF",
  },
  detailsTitle: {
    fontSize: 14, fontFamily: "mon-b", color: "#0F172A",
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1,
  },
  detailKey: { fontSize: 13, fontFamily: "mon", color: "#64748B" },
  detailValue: { fontSize: 13, fontFamily: "mon-sb", color: "#0F172A" },

  // Date
  dateCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  dateText: { fontSize: 12, fontFamily: "mon", color: "#64748B" },

  // Cancel
  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: "#FEE2E2", backgroundColor: "#FEF2F2", marginTop: 4,
  },
  cancelBtnText: { fontSize: 15, fontFamily: "mon-sb", color: "#EF4444" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(15,23,42,0.65)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF", borderRadius: 28, padding: 28,
    alignItems: "center", width: "100%", maxWidth: 340, gap: 10,
  },
  modalClose: {
    position: "absolute", top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  modalTitle: { fontSize: 18, fontFamily: "mon-b", color: "#0F172A", textAlign: "center", marginTop: 12 },
  modalSub: { fontSize: 13, fontFamily: "mon", color: "#64748B", textAlign: "center" },
  modalQrWrap: {
    marginVertical: 16, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: "#F1F5F9",
  },
  modalRefRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  modalRefLabel: { fontSize: 11, fontFamily: "mon-b", color: "#64748B", letterSpacing: 1.5 },
  modalRefValue: { fontSize: 14, fontFamily: "mon-b", color: "#0F172A", letterSpacing: 2 },
  modalStatusRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  modalStatusDot: { width: 7, height: 7, borderRadius: 4 },
  modalStatusText: { fontSize: 13, fontFamily: "mon-sb" },
  modalPrice: { fontSize: 13, fontFamily: "mon", color: "#64748B" },
  modalHint: {
    fontSize: 11, fontFamily: "mon", color: "#64748B",
    textAlign: "center", lineHeight: 16, marginTop: 4,
  },
});
