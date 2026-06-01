import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams, Stack } from "expo-router";
import React, { useMemo } from "react";
import { ImageBackground, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getDestinationById } from "@/constants/destinations";
import { getServicesByCategory } from "@/constants/services";
import ServiceCard from "@/components/ServiceCard";
import TypeBadge from "@/components/TypeBadge";
import { useAuth } from "@clerk/clerk-expo";
import { useApp } from "@/context/AppContext";

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { isSignedIn: clerkSignedIn } = useAuth();
  const { user } = useApp();
  const isSignedIn = clerkSignedIn || !!user.email;

  const destination = useMemo(() => {
    return getDestinationById(id ?? "");
  }, [id]);

  const services = useMemo(() => {
    if (!destination) return [];
    return getServicesByCategory(destination.type);
  }, [destination]);

  if (!destination) {
    return (
      <View style={[styles.root, { backgroundColor: "#FFFFFF", paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Destination not found</Text>
        </View>
      </View>
    );
  }

  // Define dynamic info strip items based on category
  const infoItems = useMemo(() => {
    if (destination.type === 'beach') {
      return [
        { icon: "water-outline", label: "Sea Temp", value: "24°C", color: "#0096C7" },
        { icon: "sunny-outline", label: "Air Temp", value: "29°C", color: "#F4A261" },
        { icon: "cloud-outline", label: "Wind", value: "11 km/h", color: "#20C997" },
      ];
    } else if (destination.type === 'desert') {
      return [
        { icon: "sunny-outline", label: "Day Temp", value: "35°C", color: "#E76F51" },
        { icon: "moon-outline", label: "Night Temp", value: "16°C", color: "#3F37C9" },
        { icon: "eye-outline", label: "Visibility", value: "15 km", color: "#A8763E" },
      ];
    } else if (destination.type === 'mountain') {
      return [
        { icon: "trending-up-outline", label: "Altitude", value: "1,850m", color: "#2D6A4F" },
        { icon: "leaf-outline", label: "Eco Level", value: "Pristine", color: "#52B788" },
        { icon: "thermometer-outline", label: "Temp", value: "18°C", color: "#E63946" },
      ];
    } else {
      return [
        { icon: "time-outline", label: "Best Visit", value: "Spring/Fall", color: "#6C63FF" },
        { icon: "walk-outline", label: "Walk Score", value: "Excellent", color: "#4834D4" },
        { icon: "sparkles-outline", label: "Vibe", style: "Historic", value: "Magical", color: "#A855F7" },
      ];
    }
  }, [destination]);

  return (
    <View style={[styles.root, { backgroundColor: "#F7F7F7" }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* ─── GRADIENT HERO HEADER ─── */}
        <ImageBackground source={{ uri: DESTINATION_IMAGES[destination.type] }} style={styles.heroImage}>
        <LinearGradient
          colors={["rgba(0,0,0,0.12)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.78)"]}
          locations={[0, 0.45, 1]}
          style={[styles.heroGradient, { paddingTop: topPad + 16 }]}
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backCircle}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Hero details */}
          <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.heroContent}>
            <View style={styles.topRow}>
              <TypeBadge type={destination.type} />
              {destination.flag && (
                <View style={[styles.flagPill, {
                  backgroundColor: destination.flag === "green" ? "#06D6A0" : destination.flag === "yellow" ? "#FFD166" : "#EF4444"
                }]}>
                  <View style={styles.flagDot} />
                  <Text style={styles.flagText}>
                    {destination.flag === "green" ? "Green Flag" : destination.flag === "yellow" ? "Caution" : "Closed"}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.heroName}>{destination.name}</Text>
            <Text style={styles.heroRegion}>{destination.region}</Text>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.statValue}>{destination.rating}</Text>
                <Text style={styles.statLabel}>({destination.reviews} reviews)</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Feather name="navigation" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statValue}>{destination.distance}</Text>
                <Text style={styles.statLabel}>away</Text>
              </View>
            </View>

            <Text style={styles.heroTagline}>{destination.tagline}</Text>
          </Animated.View>
        </LinearGradient>
        </ImageBackground>

        {/* ─── INFO STRIP ─── */}
        <Animated.View entering={FadeInDown.delay(100)} style={[styles.infoStrip, { borderColor: "#E2E8F0" }]}>
          {infoItems.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <View style={styles.infoSep} />}
              <View style={styles.infoItem}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </React.Fragment>
          ))}
        </Animated.View>

        {/* ─── SERVICES GRID SECTION ─── */}
        <View style={styles.servicesSection}>
          <Animated.View entering={FadeInDown.delay(150)} style={styles.servicesHeader}>
            <Text style={styles.servicesTitle}>Premium Services</Text>
            <Text style={styles.servicesSubtitle}>Everything you need, booked instantly</Text>
          </Animated.View>

          <View style={styles.servicesGrid}>
            {services.map((svc, idx) => (
              <View
                key={svc.id}
                style={styles.gridCol}
              >
                <ServiceCard
                  title={svc.title}
                  tagline={svc.tagline}
                  icon={svc.icon}
                  iconFamily={svc.iconFamily}
                  color={svc.color}
                  onPress={() => {
                    if (!isSignedIn) {
                      router.push("/(modals)/login");
                      return;
                    }
                    // Navigate to the service booking flow, passing destination ID
                    router.push({
                      pathname: svc.route as any,
                      params: { destinationId: destination.id }
                    });
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const DESTINATION_IMAGES: Record<string, string> = {
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
  desert: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1400&q=80",
  mountain: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80",
  historical: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=80",
  city: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { padding: 20 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 100 },
  notFoundText: { fontSize: 16, fontFamily: "mon-sb", color: "#64748B" },

  /* Hero Gradient */
  heroImage: {
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingBottom: 42,
  },
  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  heroContent: {
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  flagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  flagText: {
    fontSize: 11,
    fontFamily: "mon-b",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  heroName: {
    fontSize: 32,
    fontFamily: "mon-b",
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },
  heroRegion: {
    fontSize: 14,
    fontFamily: "mon",
    color: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    fontFamily: "mon-b",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "mon",
    color: "rgba(255,255,255,0.7)",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  heroTagline: {
    fontSize: 14,
    fontFamily: "mon",
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    lineHeight: 20,
  },

  /* Info strip */
  infoStrip: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    padding: 16,
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: "mon-sb",
    color: "#64748B",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "mon-b",
    color: "#0F172A",
  },
  infoSep: {
    width: 1,
    height: "60%",
    alignSelf: "center",
    backgroundColor: "#E2E8F0",
  },

  /* Services grid */
  servicesSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  servicesHeader: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 20,
    fontFamily: "mon-b",
    color: "#0F172A",
  },
  servicesSubtitle: {
    fontSize: 13,
    fontFamily: "mon",
    color: "#64748B",
    marginTop: 2,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridCol: {
    width: "50%",
    padding: 6,
  },
});
