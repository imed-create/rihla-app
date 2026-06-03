import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ConfirmButton from "@/components/ConfirmButton";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const EVENTS = [
  {
    id: "1",
    title: "Sunset Beach Party",
    date: "Sat, Jun 7",
    time: "20:00 – 02:00",
    location: "Main Beach Stage",
    price: 2000,
    description: "DJ sets, live music, cocktails & amazing sunset views. All inclusive drinks.",
    tickets: 45,
    color: "#FF70A6",
  },
  {
    id: "2",
    title: "Family Barbecue Night",
    date: "Sun, Jun 8",
    time: "18:00 – 22:00",
    location: "Family Zone",
    price: 1500,
    description: "Traditional BBQ with family activities, live entertainment and kids games.",
    tickets: 20,
    color: "#F4A261",
  },
  {
    id: "3",
    title: "Yoga at Sunrise",
    date: "Mon, Jun 9",
    time: "06:30 – 08:00",
    location: "VIP Zone",
    price: 800,
    description: "Guided sunrise yoga session by a certified instructor. Mats provided.",
    tickets: 15,
    color: "#845EC2",
  },
  {
    id: "4",
    title: "Beach Volleyball Tournament",
    date: "Tue, Jun 10",
    time: "10:00 – 16:00",
    location: "Sports Area",
    price: 1000,
    description: "Team registration for 4v4 tournament. Prizes for top 3 teams.",
    tickets: 8,
    color: "#20C997",
  },
];

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addBooking } = useApp();

  const [selected, setSelected] = useState<string | null>(null);
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const event = EVENTS.find((e) => e.id === selected);
  const total = event ? event.price * tickets : 0;
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  const handleBuy = async () => {
    if (!event) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBooking({
      type: "events",
      icon: "musical-notes-outline",
      iconFamily: "Ionicons",
      color: event.color,
      title: event.title,
      subtitle: `${tickets} ticket${tickets > 1 ? "s" : ""} · ${event.date}`,
      price: total,
      details: { eventId: event.id, tickets, date: event.date },
    });
    setLoading(false);
    setSuccess(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => router.push("/(tabs)/bookings"), 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FF70A6", "#E0508C"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="musical-notes-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Events & Parties</Text>
        <Text style={styles.headerSub}>Buy tickets for upcoming events</Text>
      </LinearGradient>

      {success ? (
        <View style={styles.successWrap}>
          <Ionicons name="checkmark-circle" size={80} color="#06D6A0" />
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Tickets Purchased!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your e-tickets are saved in Bookings. See you there!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 140, gap: 16 }} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>UPCOMING EVENTS</Text>
          {EVENTS.map((ev) => (
            <Pressable
              key={ev.id}
              style={[
                styles.eventCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selected === ev.id ? ev.color : colors.border,
                  borderWidth: selected === ev.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(ev.id)}
            >
              <View style={[styles.eventColorBar, { backgroundColor: ev.color }]} />
              <View style={styles.eventBody}>
                <View style={styles.eventRow}>
                  <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {ev.title}
                  </Text>
                  <View style={[styles.ticketBadge, { backgroundColor: ev.color + "22" }]}>
                    <Text style={[styles.ticketText, { color: ev.color }]}>{ev.tickets} left</Text>
                  </View>
                </View>
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{ev.date} · {ev.time}</Text>
                </View>
                <View style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{ev.location}</Text>
                </View>
                <Text style={[styles.eventDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {ev.description}
                </Text>
                <Text style={[styles.eventPrice, { color: ev.color }]}>{ev.price} DZD / ticket</Text>
              </View>
            </Pressable>
          ))}

          {event && (
            <>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>NUMBER OF TICKETS</Text>
              <View style={styles.ticketControl}>
                <Pressable
                  style={[styles.controlBtn, { backgroundColor: colors.muted }]}
                  onPress={() => setTickets(Math.max(1, tickets - 1))}
                >
                  <Ionicons name="remove" size={20} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.ticketCount, { color: colors.foreground }]}>{tickets}</Text>
                <Pressable
                  style={[styles.controlBtn, { backgroundColor: event.color }]}
                  onPress={() => setTickets(Math.min(event.tickets, tickets + 1))}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </Pressable>
              </View>
              <View style={[styles.totalRow, { backgroundColor: event.color + "22", borderColor: event.color + "44" }]}>
                <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>{tickets} ticket{tickets > 1 ? "s" : ""}</Text>
                <Text style={[styles.totalValue, { color: event.color }]}>{total} DZD</Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {!success && event && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
          <ConfirmButton label="Buy Tickets" onPress={handleBuy} loading={loading} price={total} />
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
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  eventCard: { borderRadius: 16, overflow: "hidden", flexDirection: "row" },
  eventColorBar: { width: 5 },
  eventBody: { flex: 1, padding: 14, gap: 5 },
  eventRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eventTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  ticketBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ticketText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  eventMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  eventDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  eventPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  ticketControl: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 },
  controlBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  ticketCount: { fontSize: 28, fontFamily: "Inter_700Bold", minWidth: 40, textAlign: "center" },
  totalRow: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  totalValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B8DFF0" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
