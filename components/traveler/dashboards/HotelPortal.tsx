import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import type { Listing } from '@/types/service';

interface PortalProps {
  onSearchAll: () => void;
  onFilterWilaya: (wilaya: string | null) => void;
  selectedWilaya: string | null;
}

export default function HotelPortal({ onSearchAll, onFilterWilaya, selectedWilaya }: PortalProps) {
  const { colors } = useTheme();

  // Filter out hotels from Mock Listings
  const hotels = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'hotel' && l.is_active);
  }, []);

  const featuredHotels = useMemo(() => {
    return hotels.filter((h) => h.is_featured);
  }, [hotels]);

  const handleListingPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/services/hotel/${id}` as any);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── IMMERSIVE HERO CARD ── */}
      <View style={[styles.heroCard, { backgroundColor: '#1A6B3A' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Boutique Hotels & Traditional Riads</Text>
          <Text style={styles.heroSubtitle}>Discover authentic stays with Algerian hospitality.</Text>
        </View>
        <Ionicons name="bed" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── QUICK PLANNER PANEL ── */}
      <View style={[styles.plannerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.plannerTitle, { color: colors.text }]}>Find Your Perfect Stay</Text>
        
        <View style={styles.plannerRow}>
          <Pressable 
            style={[styles.plannerInput, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={() => onSearchAll()}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.icon} />
            <Text style={[styles.plannerInputText, { color: colors.muted }]}>Choose Dates</Text>
          </Pressable>
          <Pressable 
            style={[styles.plannerInput, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={() => onSearchAll()}
          >
            <Ionicons name="people-outline" size={16} color={colors.icon} />
            <Text style={[styles.plannerInputText, { color: colors.muted }]}>2 Guests</Text>
          </Pressable>
        </View>

        <TouchableOpacity 
          style={[styles.searchBtn, { backgroundColor: '#1A6B3A' }]}
          onPress={() => onSearchAll()}
        >
          <Text style={styles.searchBtnText}>Search Available Stays</Text>
          <Ionicons name="search" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── FEATURED BOUTIQUE STAYS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Riads & Boutique Stays</Text>
          <TouchableOpacity onPress={() => onSearchAll()}>
            <Text style={[styles.seeAll, { color: '#1A6B3A' }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {featuredHotels.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.hotelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleListingPress(item.id)}
            >
              <Image source={{ uri: item.cover_image_url }} style={styles.hotelImage} />
              <View style={styles.hotelInfo}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#FFD166" />
                  <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating} ({item.review_count})</Text>
                </View>
                <Text style={[styles.hotelTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.hotelLoc, { color: colors.muted }]} numberOfLines={1}>
                  <Ionicons name="location-outline" size={10} color={colors.muted} /> {item.wilaya} · {item.region}
                </Text>
                <Text style={styles.hotelPrice}>{item.price_dzd.toLocaleString()} DZD <Text style={styles.priceSub}>/ night</Text></Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── COLLECTION FILTER CATEGORIES ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20, marginBottom: 12 }]}>Curated Collections</Text>
        <View style={styles.collectionGrid}>
          {[
            { key: 'riad', title: 'Traditional Riads', emoji: '🕌', desc: 'Courtyards & architecture' },
            { key: 'desert', title: 'Desert Camps', emoji: '🏜️', desc: 'Sahara luxury under stars' },
            { key: 'beachfront', title: 'Coastal Resorts', emoji: '🏖️', desc: 'Overlooking the Mediterranean' },
            { key: 'modern', title: 'City Lodgings', emoji: '🏙️', desc: 'Business & luxury suites' },
          ].map((col) => (
            <TouchableOpacity 
              key={col.key}
              style={[styles.collectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSearchAll();
              }}
            >
              <Text style={styles.colEmoji}>{col.emoji}</Text>
              <Text style={[styles.colTitle, { color: colors.text }]}>{col.title}</Text>
              <Text style={[styles.colDesc, { color: colors.muted }]}>{col.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── BROWSE ALL BUTTON ── */}
      <TouchableOpacity 
        style={[styles.browseAllBtn, { borderColor: '#1A6B3A' }]}
        onPress={() => onSearchAll()}
      >
        <Text style={[styles.browseAllText, { color: '#1A6B3A' }]}>Browse All Hotels & Riads</Text>
        <Ionicons name="arrow-forward" size={16} color="#1A6B3A" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    height: 140,
    justifyContent: 'center',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  heroContent: {
    maxWidth: '80%',
    zIndex: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'mon-b',
    lineHeight: 26,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'mon',
    marginTop: 6,
    lineHeight: 16,
  },
  plannerCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  plannerTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
  },
  plannerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  plannerInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  plannerInputText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  searchBtn: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'mon-sb',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 12,
  },
  hotelCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 120,
  },
  hotelInfo: {
    padding: 12,
    gap: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  hotelTitle: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  hotelLoc: {
    fontSize: 10,
    fontFamily: 'mon',
  },
  hotelPrice: {
    fontSize: 13,
    fontFamily: 'mon-b',
    color: '#1A6B3A',
    marginTop: 2,
  },
  priceSub: {
    fontSize: 10,
    fontFamily: 'mon',
    color: '#666',
  },
  collectionGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  collectionCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  colEmoji: {
    fontSize: 24,
  },
  colTitle: {
    fontSize: 13,
    fontFamily: 'mon-b',
    marginTop: 4,
  },
  colDesc: {
    fontSize: 10,
    fontFamily: 'mon',
  },
  browseAllBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  browseAllText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
  },
});
