import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function RestaurantPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<'delivery' | 'dinein'>('delivery');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  // Active delivery orders
  const activeOrder = useMemo(() => {
    return orders.find(
      (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'on_the_way'
    );
  }, [orders]);

  const restaurants = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'restaurant' && l.is_active);
  }, []);

  const displayedRestaurants = useMemo(() => {
    if (!selectedCuisine) return restaurants;
    return restaurants.filter((r) =>
      r.tags.some((t) => t.toLowerCase().includes(selectedCuisine.toLowerCase()))
    );
  }, [restaurants, selectedCuisine]);

  const handleRestaurantPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/services/restaurant/${id}` as any);
  };

  const cuisines = [
    { key: 'traditional', label: 'Traditional', emoji: '🍲' },
    { key: 'seafood', label: 'Seafood', emoji: '🐟' },
    { key: 'pizza', label: 'Pizza & Fast', emoji: '🍕' },
    { key: 'cafe', label: 'Café & Pastry', emoji: '☕' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── LIVE KITCHEN ORDER TRACKER ── */}
      {activeOrder && (
        <View style={styles.activeOrderBox}>
          <View style={styles.activeOrderHeader}>
            <View style={styles.activeHubPulse} />
            <Text style={styles.activeOrderTitle}>Active Food Order</Text>
          </View>
          <View style={styles.activeOrderInfo}>
            <Ionicons name="restaurant" size={24} color="#C56A39" />
            <View style={styles.activeOrderDetails}>
              <Text style={styles.activeOrderName}>
                {MOCK_LISTINGS.find((l) => l.id === activeOrder.beachId)?.title || 'Algerian Restaurant'}
              </Text>
              <Text style={styles.activeOrderStatus}>
                Status: {activeOrder.status === 'pending' ? '🍳 Preparing Kitchen' : activeOrder.status === 'preparing' ? '👩‍🍳 Cooking' : '🚴 Out for Delivery'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.trackBtn}
              onPress={() => router.push('/(tabs)/trips' as any)}
            >
              <Text style={styles.trackText}>Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── IMMERSIVE RESTAURANT HERO ── */}
      <View style={[styles.heroCard, { backgroundColor: '#C56A39' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Algerian Flavors & Fine Dining</Text>
          <Text style={styles.heroSubtitle}>Couscous, Bourek, Fresh Seafood & Traditional Cafes.</Text>
        </View>
        <Ionicons name="restaurant" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── DUAL TAB SELECTION (DELIVERY VS DINE-IN) ── */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable 
          style={[styles.tab, activeTab === 'delivery' && [styles.tabActive, { backgroundColor: '#C56A39' }]]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('delivery');
          }}
        >
          <Ionicons name="bicycle-outline" size={16} color={activeTab === 'delivery' ? '#FFF' : colors.icon} />
          <Text style={[styles.tabLabel, activeTab === 'delivery' ? styles.tabLabelActive : { color: colors.text }]}>Food Delivery</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'dinein' && [styles.tabActive, { backgroundColor: '#C56A39' }]]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('dinein');
          }}
        >
          <Ionicons name="time-outline" size={16} color={activeTab === 'dinein' ? '#FFF' : colors.icon} />
          <Text style={[styles.tabLabel, activeTab === 'dinein' ? styles.tabLabelActive : { color: colors.text }]}>Book Table</Text>
        </Pressable>
      </View>

      {/* ── CUISINES CHIPS ── */}
      <View style={styles.cuisinesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineScroll}>
          <TouchableOpacity 
            style={[styles.cuisineChip, !selectedCuisine && [styles.cuisineChipActive, { backgroundColor: '#C56A39' }], { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelectedCuisine(null)}
          >
            <Text style={[styles.cuisineText, !selectedCuisine ? styles.cuisineTextActive : { color: colors.text }]}>All Cuisines</Text>
          </TouchableOpacity>
          {cuisines.map((c) => (
            <TouchableOpacity 
              key={c.key} 
              style={[styles.cuisineChip, selectedCuisine === c.key && [styles.cuisineChipActive, { backgroundColor: '#C56A39' }], { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCuisine(c.key);
              }}
            >
              <Text style={styles.cuisineEmoji}>{c.emoji}</Text>
              <Text style={[styles.cuisineText, selectedCuisine === c.key ? styles.cuisineTextActive : { color: colors.text }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── LISTINGS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeTab === 'delivery' ? 'Quick Delivery Restaurants' : 'Reserve a Table Nearby'}
          </Text>
        </View>

        <View style={styles.restaurantList}>
          {displayedRestaurants.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.restaurantCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleRestaurantPress(item.id)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: item.cover_image_url }} style={styles.restaurantImage} />
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantRow}>
                  <Text style={[styles.resName, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={12} color="#FFD166" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.resDesc, { color: colors.muted }]} numberOfLines={1}>{item.description}</Text>
                
                <View style={styles.restaurantFooter}>
                  <Text style={[styles.resLoc, { color: colors.muted }]}>
                    <Ionicons name="location-outline" size={11} color={colors.muted} /> {item.wilaya}
                  </Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>Avg: {item.price_dzd.toLocaleString()} DA</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  activeOrderBox: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C56A39',
    backgroundColor: '#C56A3912',
    padding: 12,
    gap: 8,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeHubPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  activeOrderTitle: {
    fontSize: 12,
    fontFamily: 'mon-b',
    color: '#C56A39',
  },
  activeOrderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeOrderDetails: {
    flex: 1,
    gap: 2,
  },
  activeOrderName: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  activeOrderStatus: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#666',
  },
  trackBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#C56A39',
  },
  trackText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'mon-sb',
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
  tabContainer: {
    marginHorizontal: 20,
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    // Dynamic BG applied in render
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  tabLabelActive: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  cuisinesContainer: {
    marginTop: 14,
  },
  cuisineScroll: {
    paddingLeft: 20,
    paddingRight: 12,
    gap: 8,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  cuisineChipActive: {
    // Dynamic color
  },
  cuisineEmoji: {
    fontSize: 14,
  },
  cuisineText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  cuisineTextActive: {
    color: '#FFF',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  restaurantList: {
    gap: 12,
  },
  restaurantCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  restaurantImage: {
    width: '100%',
    height: 130,
  },
  restaurantInfo: {
    padding: 14,
    gap: 4,
  },
  restaurantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resName: {
    fontSize: 15,
    fontFamily: 'mon-b',
    flex: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  resDesc: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resLoc: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  priceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 11,
    fontFamily: 'mon-b',
    color: '#C56A39',
  },
});
