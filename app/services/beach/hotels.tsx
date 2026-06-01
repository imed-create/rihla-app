import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const LISTINGS = [
  {
    id: "1",
    type: "Hotel",
    name: "Blue Wave Resort",
    location: "200m from beach",
    rating: 4.8,
    price: 8500,
    unit: "night",
    amenities: ["Pool", "Breakfast", "AC", "WiFi"],
    badge: "Most Popular",
    color: "#0096C7",
  },
  {
    id: "2",
    type: "Villa",
    name: "Casa Marina",
    location: "Beachfront",
    rating: 4.9,
    price: 15000,
    unit: "night",
    amenities: ["Private Beach", "BBQ", "4 Rooms", "Parking"],
    badge: "Premium",
    color: "#C9A84C",
  },
  {
    id: "3",
    type: "Apartment",
    name: "Sea Breeze Studio",
    location: "5 min walk",
    rating: 4.6,
    price: 4500,
    unit: "night",
    amenities: ["Kitchen", "AC", "WiFi", "Sea View"],
    badge: null,
    color: "#06D6A0",
  },
  {
    id: "4",
    type: "House",
    name: "Fisherman's Cottage",
    location: "3 min walk",
    rating: 4.7,
    price: 6000,
    unit: "night",
    amenities: ["Garden", "BBQ", "3 Rooms", "Parking"],
    badge: "Family Favorite",
    color: "#FF6B6B",
  },
];

const TYPES = ["All", "Hotel", "Villa", "Apartment", "House"];

export default function HotelsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [typeFilter, setTypeFilter] = useState("All");
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const filtered = LISTINGS.filter(
    (l) => typeFilter === "All" || l.type === typeFilter
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1A6B3A", "#145C30"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="bed-outline" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Stay Nearby</Text>
        <Text style={styles.headerSub}>Hotels, villas & rentals near the beach</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {TYPES.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.filterChip,
                {
                  backgroundColor: typeFilter === t ? "#1A6B3A" : colors.muted,
                  borderColor: typeFilter === t ? "#1A6B3A" : colors.border,
                },
              ]}
              onPress={() => setTypeFilter(t)}
            >
              <Text style={[styles.filterText, { color: typeFilter === t ? "#FFF" : colors.foreground }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}>
          {filtered.map((listing) => (
            <View
              key={listing.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <LinearGradient
                colors={[listing.color, listing.color + "BB"]}
                style={styles.cardImage}
              >
                {listing.badge && (
                  <View style={styles.badgeWrap}>
                    <Text style={styles.badgeText}>{listing.badge}</Text>
                  </View>
                )}
                <View style={styles.typeTag}>
                  <Text style={styles.typeTagText}>{listing.type}</Text>
                </View>
              </LinearGradient>
              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Text style={[styles.cardName, { color: colors.foreground }]}>{listing.name}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#F4A261" />
                    <Text style={[styles.rating, { color: colors.foreground }]}>{listing.rating}</Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.location, { color: colors.mutedForeground }]}>{listing.location}</Text>
                </View>
                <View style={styles.amenitiesRow}>
                  {listing.amenities.map((a) => (
                    <View key={a} style={[styles.amenityChip, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.amenityText, { color: colors.mutedForeground }]}>{a}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={[styles.price, { color: colors.primary }]}>
                      {listing.price.toLocaleString()} DZD
                    </Text>
                    <Text style={[styles.priceUnit, { color: colors.mutedForeground }]}>per {listing.unit}</Text>
                  </View>
                  <Pressable style={[styles.contactBtn, { backgroundColor: listing.color }]}>
                    <Feather name="phone" size={14} color="#FFF" />
                    <Text style={styles.contactText}>Contact</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
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
  filterRow: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  listContent: { paddingHorizontal: 20, gap: 16 },
  card: { borderRadius: 20, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardImage: { height: 140, justifyContent: "space-between", padding: 12, flexDirection: "row", alignItems: "flex-start" },
  badgeWrap: { backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: "#FFF", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  typeTag: { backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" },
  typeTagText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#023E58" },
  cardBody: { padding: 14, gap: 8 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardName: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  rating: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 12, fontFamily: "Inter_400Regular" },
  amenitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  amenityChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  amenityText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  price: { fontSize: 18, fontFamily: "Inter_700Bold" },
  priceUnit: { fontSize: 11, fontFamily: "Inter_400Regular" },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  contactText: { color: "#FFF", fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
