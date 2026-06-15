/**
 * RIHLA — Dedicated Beach Screen
 * ──────────────────────────────
 * Flagship bento hub connecting travelers to all 13 sub-services:
 * - Spots grid, Parking reservations, Food orders, Swim shop, etc.
 * - Dynamic category colors, icons, price indicators.
 * - Navigates directly into the sub-service screen stack.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getListingById } from '@/constants/mockListings';
import { getListingGallery } from '@/utils/listingPhotos';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight } from '@/utils/haptics';

const { width: SCREEN_W } = Dimensions.get('window');

type BeachSubService = {
  id: string;
  title: string;
  tagline: string;
  icon: string;
  color: string;
  route: string;
  size: 'small' | 'large'; // for bento layout spacing
};

export default function BeachServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const beach = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (beach ? getListingGallery(beach.cover_image_url ?? '', 'beach', 3) : []),
    [beach]
  );

  if (!beach) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Beach not found</Text>
      </View>
    );
  }

  // 13 Sub-services
  const subServices: BeachSubService[] = [
    { id: 'spots', title: 'Beach Spots', tagline: 'Umbrella & chairs', icon: 'umbrella-outline', color: '#00a896', route: '/services/beach/spots', size: 'large' },
    { id: 'parking', title: 'Parking', tagline: 'Reserve your slot', icon: 'car-outline', color: '#023E58', route: '/services/beach/parking', size: 'large' },
    { id: 'food', title: 'Food & Drinks', tagline: 'Order to spot', icon: 'restaurant-outline', color: '#F4A261', route: '/services/beach/food', size: 'small' },
    { id: 'beach-items', title: 'Water Rides', tagline: 'Jet-ski & pedalo', icon: 'water-outline', color: '#0a2540', route: '/services/beach/beach-items', size: 'small' },
    { id: 'massage', title: 'Massage', tagline: 'Relaxation zone', icon: 'hand-heart-outline', color: '#845EC2', route: '/services/beach/massage', size: 'small' },
    { id: 'clothes', title: 'Swim Shop', tagline: 'Swimwear & gear', icon: 'shirt-outline', color: '#FF6B6B', route: '/services/beach/clothes', size: 'small' },
    { id: 'games', title: 'Games & Fun', tagline: 'ATVs & rentals', icon: 'game-controller-outline', color: '#20C997', route: '/services/beach/games', size: 'small' },
    { id: 'showers', title: 'Showers', tagline: 'Fresh & clean', icon: 'water-outline', color: '#48CAE4', route: '/services/beach/showers', size: 'small' },
    { id: 'events', title: 'Beach Events', tagline: 'Parties & tickets', icon: 'musical-notes-outline', color: '#FF70A6', route: '/services/beach/events', size: 'small' },
    { id: 'powerbank', title: 'Power Bank', tagline: 'Stay charged', icon: 'battery-charging-outline', color: '#06D6A0', route: '/services/beach/powerbank', size: 'small' },
    { id: 'photos', title: 'Photography', tagline: 'Sunset photoshoot', icon: 'camera-outline', color: '#FF499E', route: '/services/beach/photos', size: 'small' },
    { id: 'guide', title: 'Beach Guide', tagline: 'Rules & safety', icon: 'compass-outline', color: '#A8763E', route: '/services/beach/guide', size: 'small' },
    { id: 'hotels', title: 'Stay & Rent', tagline: 'Nearby hotels', icon: 'bed-outline', color: '#1A6B3A', route: '/services/beach/hotels', size: 'large' },
  ];

  const handleSubServicePress = (route: string) => {
    hapticLight();
    // pass the current beach ID to sub-services so they map coordinates/checkouts appropriately
    router.push({ pathname: route, params: { beachId: beach.id } } as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Hero Section */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: gallery[0] }} style={styles.heroImage} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroOverlay}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEACH SUPER-HUB</Text>
            </View>
            <Text style={styles.beachName}>{beach.title}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{beach.wilaya} · Active Zone</Text>
              <Ionicons name="star" size={13} color="#FFD166" style={{ marginLeft: 8 }} />
              <Text style={styles.metaText}>{beach.rating} ({beach.review_count} reviews)</Text>
            </View>
          </View>
        </View>

        {/* Bento Grid layout for 13 Beach Services */}
        <View style={styles.container}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Beach Services</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Book anything from your sunbed. Everything delivered straight to your spot.
          </Text>

          {/* Large layout grids */}
          <View style={styles.bentoGrid}>
            {subServices.map((service) => {
              const isLarge = service.size === 'large';
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.bentoCard,
                    isLarge ? styles.cardLarge : styles.cardSmall,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleSubServicePress(service.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.cardIconWrap, { backgroundColor: service.color + '15' }]}>
                    <Ionicons name={service.icon as any} size={20} color={service.color} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {service.title}
                    </Text>
                    <Text style={[styles.cardTagline, { color: colors.muted }]} numberOfLines={1}>
                      {service.tagline}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.muted} style={styles.arrow} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 220 },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,37,64,0.85)',
    padding: 16,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#00a896',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: { color: '#FFF', fontSize: 9, fontFamily: 'mon-b' },
  beachName: { fontSize: 22, fontFamily: 'mon-b', color: '#FFF', letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 12, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.85)' },

  container: { padding: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'mon-b' },
  sectionSubtitle: { fontSize: 12, fontFamily: 'mon', lineHeight: 18, marginTop: 4, marginBottom: 16 },

  // Bento layout
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bentoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLarge: {
    width: '100%',
  },
  cardSmall: {
    width: (SCREEN_W - 32 - 10) / 2, // split two column
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: { fontSize: 13, fontFamily: 'mon-b' },
  cardTagline: { fontSize: 10, fontFamily: 'mon' },
  arrow: {
    marginLeft: 'auto',
  },
});
