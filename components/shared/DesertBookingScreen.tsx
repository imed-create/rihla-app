import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from '@/components/shared/ConfirmButton';
import { getDestinationById } from "@/constants/destinations";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type IconFamily = "Ionicons" | "MaterialCommunityIcons";

export interface DesertOption {
  id: string;
  label: string;
  desc: string;
  price: number;
}

export interface DesertCountOption {
  label: string;
  value: number;
}

interface DesertBookingScreenProps {
  title: string;
  subtitle: string;
  bookingTitle: string;
  icon: string;
  iconFamily: IconFamily;
  color: string;
  gradient: [string, string];
  primaryLabel: string;
  primaryOptions: DesertOption[];
  countLabel: string;
  countOptions: DesertCountOption[];
  countDetailKey: string;
  countUnitSingular: string;
  countUnitPlural: string;
  priceMultiplier?: "count" | "none";
}

export default function DesertBookingScreen({
  title,
  subtitle,
  bookingTitle,
  icon,
  iconFamily,
  color,
  gradient,
  primaryLabel,
  primaryOptions,
  countLabel,
  countOptions,
  countDetailKey,
  countUnitSingular,
  countUnitPlural,
  priceMultiplier = "count",
}: DesertBookingScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();
  const { destinationId } = useLocalSearchParams<{ destinationId: string }>();
  const destination = getDestinationById(destinationId ?? "");

  const [selected, setSelected] = useState(primaryOptions[0]);
  const [count, setCount] = useState(countOptions[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const unit = count.value === 1 ? countUnitSingular : countUnitPlural;
  const totalPrice = priceMultiplier === "count" ? selected.price * count.value : selected.price;
  const HeaderIcon = iconFamily === "MaterialCommunityIcons" ? MaterialCommunityIcons : Ionicons;

  const handleBook = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addBooking({
      type: "desert",
      icon,
      iconFamily,
      color,
      title: bookingTitle,
      subtitle: `${selected.label} - ${count.label} - ${destination?.name || "Sahara"}`,
      price: totalPrice,
      details: {
        option: selected.id,
        [countDetailKey]: count.value,
        destination: destination?.name || "Sahara",
      },
    });

    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/trips"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={gradient} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <HeaderIcon name={icon as never} size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSub}>{subtitle}</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Booking Confirmed!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your desert service is now in bookings.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{primaryLabel}</Text>
          {primaryOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selected.id === option.id ? color : colors.border,
                  borderWidth: selected.id === option.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(option)}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.optionIcon, { backgroundColor: color + "22" }]}>
                  <HeaderIcon name={icon as never} size={20} color={color} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={[styles.optionTitle, { color: colors.foreground }]}>{option.label}</Text>
                  <Text style={[styles.optionDesc, { color: colors.mutedForeground }]}>{option.desc}</Text>
                </View>
                <Text style={[styles.optionPrice, { color }]}>{option.price} DA</Text>
              </View>
            </Pressable>
          ))}

          <Text style={[styles.label, { color: colors.mutedForeground }]}>{countLabel}</Text>
          <View style={styles.chipRow}>
            {countOptions.map((option) => (
              <Pressable
                key={option.label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: count.label === option.label ? color : colors.muted,
                    borderColor: count.label === option.label ? color : colors.border,
                  },
                ]}
                onPress={() => setCount(option)}
              >
                <Text style={[styles.chipText, { color: count.label === option.label ? "#FFFFFF" : colors.foreground }]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Selection</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{selected.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{countLabel}</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                {count.label} {unit}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total</Text>
              <Text style={[styles.totalValue, { color }]}>{totalPrice} DA</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {!success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label={`Book ${title}`} onPress={handleBook} loading={loading} price={totalPrice} />
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
  scroll: { flex: 1 },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  optionCard: { borderRadius: 16, padding: 14 },
  optionHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  optionDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginTop: 2 },
  optionPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  summaryTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { flex: 1, textAlign: "right", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  totalValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
