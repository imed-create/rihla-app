import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const SECTIONS = [
  {
    id: "rules",
    title: "Beach Rules",
    icon: "shield-checkmark-outline" as const,
    color: "#00a896",
    items: [
      "No glass bottles on the sand",
      "Keep noise levels respectful after 22:00",
      "No fires or BBQs outside designated areas",
      "All pets must be on a leash",
      "Swimming zone is supervised until 18:00",
      "No diving from the pier",
    ],
  },
  {
    id: "safety",
    title: "Water Safety",
    icon: "warning-outline" as const,
    color: "#FF6B6B",
    items: [
      "Green flag: safe swimming conditions",
      "Yellow flag: moderate caution, swim near shore",
      "Red flag: no swimming — dangerous conditions",
      "Lifeguard on duty 09:00 – 19:00",
      "Children must be supervised at all times",
      "Do not swim after consuming alcohol",
    ],
  },
  {
    id: "facilities",
    title: "Facilities",
    icon: "map-outline" as const,
    color: "#06D6A0",
    items: [
      "Showers & changing rooms: Blocks A, B and C",
      "Toilets: Main entrance and east side",
      "First aid station: Near the main lifeguard tower",
      "Lost & found: Reception office",
      "WiFi: Password posted at reception",
      "ATM: Available at the entrance kiosk",
    ],
  },
  {
    id: "activities",
    title: "Activities",
    icon: "sunny-outline" as const,
    color: "#F4A261",
    items: [
      "Morning yoga: VIP Zone at 06:30",
      "Beach volleyball: Sports Area, all day",
      "Water aerobics: Family Zone at 10:00",
      "Evening entertainment from 19:00 at main stage",
      "Kids club: Family Zone, 10:00 – 17:00",
      "Snorkeling guided tours at 09:00 and 15:00",
    ],
  },
];

const EMERGENCY = [
  { label: "Beach Emergency", number: "17", icon: "call" as const, color: "#EF4444" },
  { label: "First Aid", number: "+213 21 000 001", icon: "medical" as const, color: "#06D6A0" },
  { label: "Security", number: "+213 21 000 002", icon: "shield" as const, color: "#00a896" },
];

export default function GuideScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>("rules");
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <LinearGradient
        colors={["#A8763E", "#8B5E32"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="compass-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Beach Guide</Text>
        <Text style={styles.headerSub}>Everything you need to know</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 12 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.weatherCard, { backgroundColor: "#00a896" }]}>
          <View>
            <Text style={styles.weatherTitle}>Today's Conditions</Text>
            <Text style={styles.weatherSub}>Perfect beach weather</Text>
          </View>
          <View style={styles.weatherStats}>
            <View style={styles.weatherStat}>
              <Ionicons name="thermometer-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherVal}>28°C</Text>
            </View>
            <View style={styles.weatherStat}>
              <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherVal}>24°C sea</Text>
            </View>
            <View style={styles.weatherStat}>
              <Feather name="wind" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.weatherVal}>12 km/h</Text>
            </View>
          </View>
          <View style={[styles.flagRow, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <View style={[styles.flagDot, { backgroundColor: "#06D6A0" }]} />
            <Text style={styles.flagText}>Green Flag — Safe for swimming</Text>
          </View>
        </View>

        {SECTIONS.map((section) => (
          <Pressable
            key={section.id}
            style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: expanded === section.id ? section.color : colors.border, borderWidth: expanded === section.id ? 2 : 1 }]}
            onPress={() => setExpanded(expanded === section.id ? null : section.id)}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + "22" }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Ionicons
                name={expanded === section.id ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </View>
            {expanded === section.id && (
              <View style={styles.sectionContent}>
                {section.items.map((item, i) => (
                  <View key={i} style={styles.itemRow}>
                    <View style={[styles.dot, { backgroundColor: section.color }]} />
                    <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        ))}

        <Text style={[styles.emergencyTitle, { color: colors.muted }]}>EMERGENCY CONTACTS</Text>
        {EMERGENCY.map((e) => (
          <View key={e.label} style={[styles.emergencyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emergencyIcon, { backgroundColor: e.color + "22" }]}>
              <Ionicons name={e.icon} size={20} color={e.color} />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={[styles.emergencyLabel, { color: colors.text }]}>{e.label}</Text>
              <Text style={[styles.emergencyNumber, { color: e.color }]}>{e.number}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center", gap: 4 },
  backBtn: { position: "absolute", left: 20, top: 16, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 8 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  weatherCard: { borderRadius: 20, padding: 18, gap: 12 },
  weatherTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFF" },
  weatherSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  weatherStats: { flexDirection: "row", gap: 16 },
  weatherStat: { flexDirection: "row", alignItems: "center", gap: 5 },
  weatherVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFF" },
  flagRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  flagDot: { width: 12, height: 12, borderRadius: 6 },
  flagText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFF" },
  sectionCard: { borderRadius: 16, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  sectionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sectionContent: { paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  itemText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  emergencyTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 8 },
  emergencyCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  emergencyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  emergencyInfo: { flex: 1 },
  emergencyLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emergencyNumber: { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 2 },
});
