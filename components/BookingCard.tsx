import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Booking } from "@/context/AppContext";
import CountdownTimer from "./CountdownTimer";

interface BookingCardProps {
  booking: Booking;
  onCancel?: (id: string) => void;
}

function BookingIcon({ icon, iconFamily, color }: { icon: string; iconFamily: string; color: string }) {
  if (iconFamily === "Feather") return <Feather name={icon as any} size={20} color={color} />;
  if (iconFamily === "MaterialCommunityIcons") return <MaterialCommunityIcons name={icon as any} size={20} color={color} />;
  return <Ionicons name={icon as any} size={20} color={color} />;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#06D6A0",
  completed: "#64748B",
  cancelled: "#EF4444",
};

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[booking.status] ?? "#64748B";
  const isActive = booking.status === "active";

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/booking/${booking.id}` as any);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: "#FFFFFF", borderColor: '#DDDDDD' },
        pressed && { opacity: 0.95 },
      ]}
      onPress={handlePress}
    >
      {/* Left: colored icon box */}
      <View style={[styles.iconBox, { backgroundColor: booking.color + "15" }]}>
        <BookingIcon icon={booking.icon} iconFamily={booking.iconFamily} color={booking.color} />
      </View>

      {/* Center: content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: '#222222' }]} numberOfLines={1}>
            {booking.title}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + "15" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[booking.status]}
            </Text>
          </View>
        </View>

        <Text style={[styles.subtitle, { color: '#717171' }]} numberOfLines={1}>
          {booking.subtitle}
        </Text>

        {booking.expiresAt && isActive && (
          <CountdownTimer
            expiresAt={booking.expiresAt}
            onExpired={() => onCancel?.(booking.id)}
          />
        )}

        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: booking.price === 0 ? '#717171' : '#222222' }]}>
            {booking.price === 0 ? "Free" : `${booking.price.toLocaleString()} DA`}
          </Text>
          <View style={styles.actions}>
            {/* QR code chip */}
            {isActive && (
              <View style={[styles.qrChip, { backgroundColor: colors.primary + "12" }]}>
                <Ionicons name="qr-code-outline" size={12} color={colors.primary} />
                <Text style={[styles.qrChipText, { color: colors.primary }]}>QR</Text>
              </View>
            )}
            {/* Chevron */}
            <Feather name="chevron-right" size={16} color="#B0B0B0" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 2,
    marginBottom: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  content: { flex: 1, gap: 3 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontFamily: "mon-b",
    flex: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "mon-sb" },
  subtitle: {
    fontSize: 12,
    fontFamily: "mon",
    lineHeight: 16,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: { fontSize: 14, fontFamily: "mon-b" },
  actions: { flexDirection: "row", alignItems: "center", gap: 6 },
  qrChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  qrChipText: {
    fontSize: 10,
    fontFamily: "mon-b",
  },
});
