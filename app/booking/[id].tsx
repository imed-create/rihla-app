/**
 * RIHLA — Booking Detail (Polished)
 * Premium booking detail with live tracker, QR, countdown, clean layout
 */

import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import CountdownTimer from '@/components/shared/CountdownTimer';
import LiveTracker from '@/components/shared/LiveTracker';
import { getCompanion, getCompanionLabel } from '@/components/traveler/companions';
import { RIHLA } from '@/constants/theme';
import { useLocationStore } from '@/store/useLocationStore';
import {
  ALGIERS_CENTER,
  buildRoutePoints,
  estimateEtaMinutes,
  resolveBookingLocation,
} from '@/utils/bookingLocation';
import { hapticLight } from '@/utils/haptics';

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

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { getBookingById, cancelBooking } = useApp();
  const booking = getBookingById(id ?? "");

  const [qrVisible, setQrVisible] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);

  const userLatitude = useLocationStore((s) => s.userLatitude);
  const userLongitude = useLocationStore((s) => s.userLongitude);

  // Category-specific live companion, when this booking's type has one.
  const Companion = booking ? getCompanion(booking.type) : null;
  const companionLabel = booking ? getCompanionLabel(booking.type) : null;

  // Real coordinates for this booking, instead of a hardcoded Algiers pin.
  const destination = useMemo(
    () => (booking ? resolveBookingLocation(booking) : null),
    [booking]
  );
  const origin = useMemo(
    () => ({
      latitude: userLatitude ?? ALGIERS_CENTER.latitude,
      longitude: userLongitude ?? ALGIERS_CENTER.longitude,
    }),
    [userLatitude, userLongitude]
  );
  const routePoints = useMemo(
    () => (destination ? buildRoutePoints(origin, destination) : []),
    [origin, destination]
  );
  const etaMinutes = useMemo(
    () => (destination ? estimateEtaMinutes(origin, destination) : 0),
    [origin, destination]
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  const STATUS_COLOR: Record<string, string> = {
    active: isDark ? "#10B981" : "#06D6A0",
    completed: colors.muted,
    cancelled: "#EF4444",
  };

  if (!booking) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: topPad + 40, paddingHorizontal: 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: colors.card }]}>
          <Feather name="arrow-left" size={22} color={colors.icon} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
          <Text style={[styles.notFoundText, { color: colors.muted }]}>Booking not found</Text>
        </View>
      </View>
    );
  }

  // The companion takes over the whole screen; it renders its own back header.
  if (companionOpen && Companion) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: topPad }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Companion booking={booking} onBack={() => setCompanionOpen(false)} />
      </View>
    );
  }

  const statusColor = STATUS_COLOR[booking.status] ?? colors.muted;
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
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.bg }]}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={handleBack}>
            <Feather name="arrow-left" size={22} color={colors.icon} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Details</Text>
            <Text style={[styles.headerId, { color: colors.muted }]}>Ref: {booking.id.slice(-8).toUpperCase()}</Text>
          </View>
          <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.border }]} onPress={handleShare}>
            <Feather name="share" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Service Info Card */}
          <View style={[styles.serviceCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={[styles.serviceIconWrap, { backgroundColor: (booking.color || RIHLA.primary) + "15" }]}>
              <BookingIcon icon={booking.icon} iconFamily={booking.iconFamily} color={booking.color} size={28} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceTitle, { color: colors.text }]}>{booking.title}</Text>
              <Text style={[styles.serviceSubtitle, { color: colors.muted }]}>{booking.subtitle}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABEL[booking.status]}</Text>
            </View>
          </View>

          {/* Live Tracker */}
          {isActive && destination && (
            <>
              <LiveTracker
                userLatitude={origin.latitude}
                userLongitude={origin.longitude}
                destinationLatitude={destination.latitude}
                destinationLongitude={destination.longitude}
                totalEtaMinutes={etaMinutes}
                providerName={booking.title}
                category={booking.type}
                isActive={true}
                height={220}
                color={booking.color || RIHLA.primary}
                routePoints={routePoints}
              />
              {destination.label ? (
                <View style={styles.destinationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.muted} />
                  <Text style={[styles.destinationText, { color: colors.muted }]} numberOfLines={1}>
                    {destination.label}
                  </Text>
                </View>
              ) : null}
            </>
          )}

          {/* Countdown */}
          {booking.expiresAt && isActive && (
            <View style={[styles.countdownCard, { backgroundColor: isDark ? '#2D1F00' : '#FFFBEB', borderColor: isDark ? '#5C3D00' : '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={18} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.countdownLabel, { color: '#D97706' }]}>Time remaining to arrive</Text>
                <CountdownTimer expiresAt={booking.expiresAt} onExpired={() => {}} />
              </View>
            </View>
          )}

          {/* Companion entry — category-specific live experience */}
          {Companion && companionLabel && booking.status !== "cancelled" && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.companionCard,
                { backgroundColor: colors.card, borderColor: (booking.color || RIHLA.primary) + "40" },
              ]}
              onPress={() => { hapticLight(); setCompanionOpen(true); }}
            >
              <View
                style={[
                  styles.companionIcon,
                  { backgroundColor: (booking.color || RIHLA.primary) + "15" },
                ]}
              >
                <Ionicons
                  name={companionLabel.icon}
                  size={22}
                  color={booking.color || RIHLA.primary}
                />
              </View>
              <View style={styles.companionBody}>
                <View style={styles.companionTitleRow}>
                  <Text style={[styles.companionTitle, { color: colors.text }]}>
                    {companionLabel.title}
                  </Text>
                  {isActive ? (
                    <View style={[styles.liveBadge, { backgroundColor: (booking.color || RIHLA.primary) + "18" }]}>
                      <View style={[styles.liveDot, { backgroundColor: booking.color || RIHLA.primary }]} />
                      <Text style={[styles.liveText, { color: booking.color || RIHLA.primary }]}>Live</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.companionSub, { color: colors.muted }]}>
                  {companionLabel.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}

          {/* QR Ticket Block */}
          <View style={[styles.qrBlock, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={styles.qrBlockLeft}>
              <Text style={[styles.qrTitle, { color: colors.text }]}>Entry Ticket QR</Text>
              <Text style={[styles.qrSub, { color: colors.muted }]}>
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
            <View style={[styles.qrPreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <QRCode value={qrValue} size={80} color={booking.color} backgroundColor={colors.card} />
            </View>
          </View>

          {/* Booking Reference */}
          <View style={[styles.refRow, { backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9' }]}>
            <Text style={[styles.refLabel, { color: colors.muted }]}>Booking Reference</Text>
            <Text style={[styles.refValue, { color: colors.text }]}>{booking.id.slice(-10).toUpperCase()}</Text>
          </View>

          {/* Price */}
          <View style={[styles.priceRow, { borderColor: colors.border }]}>
            <Text style={[styles.priceLabel, { color: colors.muted }]}>Total paid</Text>
            <Text style={[styles.priceValue, { color: booking.color || RIHLA.primary }]}>
              {booking.price === 0 ? "Free" : `${booking.price.toLocaleString()} DA`}
            </Text>
          </View>

          {/* Booking Details */}
          {detailEntries.length > 0 && (
            <View style={[styles.detailsCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.detailsTitle, { color: colors.text }]}>Booking Summary</Text>
              {detailEntries.map(([key, value]) => (
                <View key={key} style={[styles.detailRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.detailKey, { color: colors.muted }]}>
                    {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Date */}
          <View style={[styles.dateCard, { backgroundColor: isDark ? '#1A1A1A' : '#F8FAFC' }]}>
            <Feather name="calendar" size={16} color={colors.muted} />
            <Text style={[styles.dateText, { color: colors.muted }]}>
              Booked on {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>

          {/* Cancel Button */}
          {isActive && (
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: isDark ? '#5C2020' : '#FEE2E2', backgroundColor: isDark ? '#2D0F0F' : '#FEF2F2' }]}
              onPress={handleCancel}
            >
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
          <Pressable style={[styles.modalCard, { backgroundColor: colors.card }]} onPress={() => {}}>
            <TouchableOpacity style={[styles.modalClose, { backgroundColor: isDark ? '#2A2A2A' : '#F1F5F9' }]} onPress={() => setQrVisible(false)}>
              <Feather name="x" size={20} color={colors.icon} />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>{booking.title}</Text>
            <Text style={[styles.modalSub, { color: colors.muted }]}>{booking.subtitle}</Text>

            <View style={[styles.modalQrWrap, { borderColor: colors.border }]}>
              <QRCode value={qrValue} size={220} color={booking.color || RIHLA.primary} backgroundColor={colors.card} />
            </View>

            <View style={[styles.modalRefRow, { backgroundColor: isDark ? '#1A1A1A' : '#F1F5F9' }]}>
              <Text style={[styles.modalRefLabel, { color: colors.muted }]}>REF</Text>
              <Text style={[styles.modalRefValue, { color: colors.text }]}>{booking.id.slice(-10).toUpperCase()}</Text>
            </View>

            <View style={[styles.modalStatusRow, { backgroundColor: statusColor + "15" }]}>
              <View style={[styles.modalStatusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.modalStatusText, { color: statusColor }]}>
                {STATUS_LABEL[booking.status]}
              </Text>
              {booking.price > 0 && (
                <Text style={[styles.modalPrice, { color: colors.muted }]}> · {booking.price.toLocaleString()} DA</Text>
              )}
            </View>

            <Text style={[styles.modalHint, { color: colors.muted }]}>
              Present this code to local operators for entry validation
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  companionIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  companionBody: { flex: 1, gap: 3 },
  companionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  companionTitle: { fontSize: 15, fontFamily: 'mon-b', letterSpacing: -0.3 },
  companionSub: { fontSize: 12, fontFamily: 'mon', lineHeight: 17 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  liveDot: { width: 5, height: 5, borderRadius: 3 },
  liveText: { fontSize: 10, fontFamily: 'mon-b' },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: -4 },
  destinationText: { flex: 1, fontSize: 12, fontFamily: 'mon' },

  root: { flex: 1 },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 20,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "mon-b" },
  headerId: { fontSize: 11, fontFamily: "mon", marginTop: 1 },
  shareBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },

  content: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  notFound: { flex: 1, alignItems: "center", paddingTop: 80, gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "mon" },

  // Service Card
  serviceCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16, borderWidth: 1,
  },
  serviceIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  serviceInfo: { flex: 1 },
  serviceTitle: { fontSize: 16, fontFamily: "mon-b", lineHeight: 20 },
  serviceSubtitle: { fontSize: 13, fontFamily: "mon", marginTop: 2 },
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
  countdownLabel: { fontSize: 12, fontFamily: "mon-sb", marginBottom: 2 },

  // QR Block
  qrBlock: {
    flexDirection: "row", alignItems: "center",
    padding: 16, borderRadius: 16, borderWidth: 1, gap: 16,
  },
  qrBlockLeft: { flex: 1, gap: 6 },
  qrTitle: { fontSize: 15, fontFamily: "mon-b" },
  qrSub: { fontSize: 12, fontFamily: "mon", lineHeight: 17 },
  qrBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 4,
  },
  qrBtnText: { fontSize: 13, fontFamily: "mon-b", color: "#FFFFFF" },
  qrPreview: {
    padding: 8, borderRadius: 12,
    borderWidth: 1,
  },

  // Reference
  refRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  refLabel: { fontSize: 12, fontFamily: "mon-sb" },
  refValue: { fontSize: 13, fontFamily: "mon-b", letterSpacing: 1 },

  // Price
  priceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1,
  },
  priceLabel: { fontSize: 14, fontFamily: "mon" },
  priceValue: { fontSize: 22, fontFamily: "mon-b" },

  // Details
  detailsCard: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
  },
  detailsTitle: {
    fontSize: 14, fontFamily: "mon-b",
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
  },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 11, borderTopWidth: 1,
  },
  detailKey: { fontSize: 13, fontFamily: "mon" },
  detailValue: { fontSize: 13, fontFamily: "mon-sb" },

  // Date
  dateCard: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  dateText: { fontSize: 12, fontFamily: "mon" },

  // Cancel
  cancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    height: 52, borderRadius: 14,
    borderWidth: 1.5, marginTop: 4,
  },
  cancelBtnText: { fontSize: 15, fontFamily: "mon-sb", color: "#EF4444" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(15,23,42,0.65)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    borderRadius: 28, padding: 28,
    alignItems: "center", width: "100%", maxWidth: 340, gap: 10,
  },
  modalClose: {
    position: "absolute", top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  modalTitle: { fontSize: 18, fontFamily: "mon-b", textAlign: "center", marginTop: 12 },
  modalSub: { fontSize: 13, fontFamily: "mon", textAlign: "center" },
  modalQrWrap: {
    marginVertical: 16, padding: 16, borderRadius: 16,
    borderWidth: 1,
  },
  modalRefRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
  },
  modalRefLabel: { fontSize: 11, fontFamily: "mon-b", letterSpacing: 1.5 },
  modalRefValue: { fontSize: 14, fontFamily: "mon-b", letterSpacing: 2 },
  modalStatusRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  modalStatusDot: { width: 7, height: 7, borderRadius: 4 },
  modalStatusText: { fontSize: 13, fontFamily: "mon-sb" },
  modalPrice: { fontSize: 13, fontFamily: "mon" },
  modalHint: {
    fontSize: 11, fontFamily: "mon",
    textAlign: "center", lineHeight: 16, marginTop: 4,
  },
});
