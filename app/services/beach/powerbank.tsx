import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from '@/components/shared/ConfirmButton';
import { RIHLA } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const BANKS = [
  { id: "10k", name: "10,000 mAh", desc: "Charges up to 2 phones", price: 300, icon: "battery-70" },
  { id: "20k", name: "20,000 mAh", desc: "Charges up to 4 phones", price: 500, icon: "battery" },
  { id: "30k", name: "30,000 mAh", desc: "Ideal for tablets too", price: 700, icon: "battery-plus" },
];

const DURATIONS = [
  { label: "2 hours", hours: 2, multiplier: 1 },
  { label: "4 hours", hours: 4, multiplier: 1.7 },
  { label: "Full Day", hours: 8, multiplier: 2.5 },
];

export default function PowerBankScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [bank, setBank] = useState(BANKS[0]);
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [withTable, setWithTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const tablePrice = withTable ? 500 : 0;
  const total = Math.round(bank.price * duration.multiplier) + tablePrice;
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  const handleRent = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "powerbank",
      icon: "battery-charging-outline",
      iconFamily: "Ionicons",
      color: "#06D6A0",
      title: `Power Bank ${bank.name}`,
      subtitle: `${duration.label}${withTable ? " · With Table" : ""}`,
      price: total,
      details: { bankId: bank.id, hours: duration.hours, withTable },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/trips"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={["#06D6A0", "#f4a261"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="battery-charging-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Power Bank Rental</Text>
        <Text style={styles.headerSub}>Stay charged all day long</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.text }]}>Rented!</Text>
          <Text style={[styles.successSub, { color: colors.muted }]}>
            Pick up your power bank at the service desk. Deposit: 2000 DZD (refunded on return).
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.muted }]}>SELECT POWER BANK</Text>
          <View style={styles.bankList}>
            {BANKS.map((b) => (
              <Pressable
                key={b.id}
                style={[
                  styles.bankCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: bank.id === b.id ? "#06D6A0" : colors.border,
                    borderWidth: bank.id === b.id ? 2 : 1,
                  },
                ]}
                onPress={() => setBank(b)}
              >
                <View style={[styles.bankIcon, { backgroundColor: bank.id === b.id ? "#06D6A022" : colors.card }]}>
                  <MaterialCommunityIcons name={b.icon as any} size={32} color={bank.id === b.id ? "#06D6A0" : colors.muted} />
                </View>
                <View style={styles.bankInfo}>
                  <Text style={[styles.bankName, { color: colors.text }]}>{b.name}</Text>
                  <Text style={[styles.bankDesc, { color: colors.muted }]}>{b.desc}</Text>
                  <Text style={[styles.bankPrice, { color: RIHLA.primary }]}>from {b.price} DZD</Text>
                </View>
                {bank.id === b.id && <Ionicons name="checkmark-circle" size={22} color="#06D6A0" />}
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>DURATION</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.label}
                style={[
                  styles.durationChip,
                  {
                    backgroundColor: duration.label === d.label ? "#06D6A0" : colors.card,
                    borderColor: duration.label === d.label ? "#06D6A0" : colors.border,
                  },
                ]}
                onPress={() => setDuration(d)}
              >
                <Text style={[styles.durationText, { color: duration.label === d.label ? "#FFF" : colors.text }]}>
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>OPTIONS</Text>
          <Pressable
            style={[
              styles.tableOption,
              {
                backgroundColor: colors.card,
                borderColor: withTable ? "#06D6A0" : colors.border,
                borderWidth: withTable ? 2 : 1,
              },
            ]}
            onPress={() => setWithTable(!withTable)}
          >
            <View style={[styles.tableIcon, { backgroundColor: withTable ? "#06D6A022" : colors.card }]}>
              <MaterialCommunityIcons name="table-furniture" size={24} color={withTable ? "#06D6A0" : colors.muted} />
            </View>
            <View style={styles.tableInfo}>
              <Text style={[styles.tableName, { color: colors.text }]}>Include Beach Table</Text>
              <Text style={[styles.tableDesc, { color: colors.muted }]}>Shaded table for charging +500 DZD</Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: withTable ? "#06D6A0" : colors.card }]}>
              {withTable && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </View>
          </Pressable>

          <View style={[styles.totalBox, { backgroundColor: "#06D6A022", borderColor: "#06D6A044" }]}>
            <Text style={[styles.totalLabel, { color: colors.muted }]}>Rental Total</Text>
            <Text style={[styles.totalValue, { color: "#06D6A0" }]}>{total} DZD</Text>
          </View>

          <View style={[styles.depositNote, { backgroundColor: colors.card }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.muted} />
            <Text style={[styles.depositText, { color: colors.muted }]}>
              A refundable deposit of 2,000 DZD is required when picking up the power bank.
            </Text>
          </View>
        </ScrollView>
      )}

      {!success && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.bg }]}>
          <ConfirmButton label="Rent Now" onPress={handleRent} loading={loading} price={total} />
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
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 4 },
  bankList: { gap: 10 },
  bankCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 14 },
  bankIcon: { width: 56, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bankInfo: { flex: 1 },
  bankName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  bankDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  bankPrice: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  durationRow: { flexDirection: "row", gap: 10 },
  durationChip: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  durationText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tableOption: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, gap: 12 },
  tableIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tableInfo: { flex: 1 },
  tableName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tableDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  toggle: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  totalBox: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  totalValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  depositNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12 },
  depositText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
