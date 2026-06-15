/**
 * RIHLA — Restaurant Detail Screen
 * -----------------------------------
 * Full restaurant listing detail with menu categories, menu items,
 * table reservation, opening hours, delivery options, and reviews.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Image,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { RestaurantMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import { getListingGallery } from '@/utils/listingPhotos';
import { useTheme } from '@/context/ThemeContext';

// ─────────────────────────────────────────────
// MOCK MENU DATA
// ─────────────────────────────────────────────

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price_dzd: number;
  category: string;
  emoji: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  spiceLevel?: number;
};

type MenuCategory = {
  key: string;
  label: string;
  emoji: string;
};

const MOCK_MENUS: Record<string, { categories: MenuCategory[]; items: MenuItem[] }> = {
  'rest-1': {
    categories: [
      { key: 'starters', label: 'Starters', emoji: '🥗' },
      { key: 'main', label: 'Main Course', emoji: '🍛' },
      { key: 'desserts', label: 'Desserts', emoji: '🍰' },
      { key: 'drinks', label: 'Drinks', emoji: '🍹' },
    ],
    items: [
      { id: 'm1', name: 'Chorba Frik', description: 'Traditional Algerian soup with freekeh wheat, lamb, and fresh herbs', price_dzd: 600, category: 'starters', emoji: '🥣', isPopular: true, spiceLevel: 1 },
      { id: 'm2', name: 'Bourek', description: 'Crispy pastry rolls filled with minced meat and onions', price_dzd: 800, category: 'starters', emoji: '🥟', isPopular: true },
      { id: 'm3', name: 'Mechouia Salad', description: 'Grilled pepper and tomato salad with olive oil and garlic', price_dzd: 500, category: 'starters', emoji: '🫑', isVegetarian: true },
      { id: 'm4', name: 'Couscous Royal', description: 'Steamed semolina with lamb, chicken, merguez, and seven vegetables', price_dzd: 2200, category: 'main', emoji: '🍚', isPopular: true, spiceLevel: 2 },
      { id: 'm5', name: 'Tajine Lahlou', description: 'Slow-cooked lamb with prunes, almonds, and cinnamon', price_dzd: 1800, category: 'main', emoji: '🍖' },
      { id: 'm6', name: 'Rechta', description: 'Thin pasta with chicken, chickpeas, and turnip sauce', price_dzd: 1600, category: 'main', emoji: '🍝', spiceLevel: 1 },
      { id: 'm7', name: 'Chakhchoukha', description: 'Torn flatbread with lamb and chickpea stew — Biskra style', price_dzd: 1500, category: 'main', emoji: '🥘' },
      { id: 'm8', name: 'Makroud', description: 'Semolina pastry filled with date paste, dipped in honey', price_dzd: 400, category: 'desserts', emoji: '🟫', isPopular: true },
      { id: 'm9', name: 'Kalb El Louz', description: 'Almond semolina cake soaked in orange blossom syrup', price_dzd: 500, category: 'desserts', emoji: '🍰', isVegetarian: true },
      { id: 'm10', name: 'Mint Tea', description: 'Traditional fresh mint tea with pine nuts', price_dzd: 200, category: 'drinks', emoji: '🍵', isPopular: true },
      { id: 'm11', name: 'Jallab', description: 'Refreshing drink with dates, carob, and grape molasses', price_dzd: 300, category: 'drinks', emoji: '🥤' },
      { id: 'm12', name: 'Orange Juice', description: 'Freshly squeezed orange juice from Annaba oranges', price_dzd: 250, category: 'drinks', emoji: '🍊', isVegetarian: true },
    ],
  },
};

const DEFAULT_MENU = {
  categories: [
    { key: 'starters', label: 'Starters', emoji: '🥗' },
    { key: 'main', label: 'Main', emoji: '🍛' },
    { key: 'drinks', label: 'Drinks', emoji: '🍹' },
  ],
  items: [
    { id: 'd1', name: 'Couscous', description: 'Traditional couscous with vegetables', price_dzd: 1500, category: 'main', emoji: '🍚', isPopular: true },
    { id: 'd2', name: 'Salad', description: 'Fresh garden salad', price_dzd: 400, category: 'starters', emoji: '🥗' },
    { id: 'd3', name: 'Mint Tea', description: 'Fresh mint tea', price_dzd: 150, category: 'drinks', emoji: '🍵' },
  ],
};

type ReservationSlot = { time: string; available: boolean; tables: number };

const MOCK_SLOTS: ReservationSlot[] = [
  { time: '12:00', available: true, tables: 3 },
  { time: '12:30', available: true, tables: 5 },
  { time: '13:00', available: true, tables: 2 },
  { time: '13:30', available: false, tables: 0 },
  { time: '14:00', available: true, tables: 4 },
  { time: '19:00', available: true, tables: 6 },
  { time: '19:30', available: true, tables: 3 },
  { time: '20:00', available: true, tables: 1 },
  { time: '20:30', available: false, tables: 0 },
  { time: '21:00', available: true, tables: 2 },
];

// ─────────────────────────────────────────────
// MENU ITEM CARD
// ─────────────────────────────────────────────

function MenuItemCard({ item, colors }: { item: MenuItem; colors: any }) {
  const [qty, setQty] = useState(0);

  const menuStyles = useMemo(() => StyleSheet.create({
    card: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8,
    },
    cardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
    emoji: { fontSize: 28, marginTop: 2 },
    cardInfo: { flex: 1, gap: 3 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    cardName: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    popularBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
    popularText: { fontSize: 10, fontFamily: 'mon-sb', color: '#B45309' },
    cardDesc: { fontSize: 12, fontFamily: 'mon', color: colors.muted, lineHeight: 16 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    vegBadge: { fontSize: 10, fontFamily: 'mon-sb', color: '#16A34A', backgroundColor: '#F0FDF4', paddingHorizontal: 4, borderRadius: 4 },
    spiceText: { fontSize: 10 },
    cardPrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.primary, marginTop: 2 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    qtyBtnAdd: { backgroundColor: RIHLA.accent, borderColor: RIHLA.accent },
    qtyText: { fontSize: 15, fontFamily: 'mon-b', color: colors.text, minWidth: 20, textAlign: 'center' },
  }), [colors]);

  return (
    <View style={menuStyles.card}>
      <View style={menuStyles.cardLeft}>
        <Text style={menuStyles.emoji}>{item.emoji}</Text>
        <View style={menuStyles.cardInfo}>
          <View style={menuStyles.cardTitleRow}>
            <Text style={menuStyles.cardName}>{item.name}</Text>
            {item.isPopular && (
              <View style={menuStyles.popularBadge}>
                <Text style={menuStyles.popularText}>🔥 Popular</Text>
              </View>
            )}
          </View>
          <Text style={menuStyles.cardDesc} numberOfLines={2}>{item.description}</Text>
          <View style={menuStyles.cardMeta}>
            {item.isVegetarian && <Text style={menuStyles.vegBadge}>🌿 Veg</Text>}
            {item.spiceLevel != null && item.spiceLevel > 0 && (
              <Text style={menuStyles.spiceText}>{'🌶️'.repeat(item.spiceLevel)}</Text>
            )}
          </View>
          <Text style={menuStyles.cardPrice}>{item.price_dzd.toLocaleString()} DZD</Text>
        </View>
      </View>
      <View style={menuStyles.qtyControls}>
        <Pressable
          style={[menuStyles.qtyBtn, qty === 0 && { opacity: 0.3 }]}
          onPress={() => setQty(Math.max(0, qty - 1))}
        >
          <Ionicons name="remove" size={16} color={RIHLA.primary} />
        </Pressable>
        {qty > 0 ? (
          <Text style={menuStyles.qtyText}>{qty}</Text>
        ) : (
          <Pressable
            style={[menuStyles.qtyBtn, menuStyles.qtyBtnAdd]}
            onPress={() => setQty(1)}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { colors } = useTheme();

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');

  const [selectedCategory, setSelectedCategory] = useState('starters');
  const [reserving, setReserving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: colors.muted },
    notFoundLink: { fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent },

    heroWrap: { position: 'relative' },
    heroNav: { position: 'absolute', left: 16, right: 16, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between' },
    navCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
    heroActions: { flexDirection: 'row', gap: 8 },
    heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, justifyContent: 'flex-end' },
    heroOverlay: { paddingHorizontal: 20, paddingBottom: 14, gap: 3 },
    cuisinePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    cuisineText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
    heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
    heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    heroLocation: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
    ratingBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
    heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14 },
    infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoLabel: { fontSize: 10, fontFamily: 'mon-sb', color: colors.muted },
    infoValue: { fontSize: 12, fontFamily: 'mon-b', color: colors.text },
    infoDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: 8 },

    deliveryBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#D1FAE5' },
    deliveryText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

    section: { paddingHorizontal: 20, paddingTop: 24 },
    sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: colors.text, marginBottom: 12 },

    menuCategoryScroll: { gap: 8, marginBottom: 14 },
    menuCatChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    menuCatChipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
    menuCatEmoji: { fontSize: 14 },
    menuCatText: { fontSize: 13, fontFamily: 'mon-sb', color: colors.muted },
    menuCatTextActive: { color: '#fff' },
    menuList: {},

    guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    guestLabel: { fontSize: 14, fontFamily: 'mon-sb', color: colors.text },
    guestControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    guestCount: { fontSize: 18, fontFamily: 'mon-b', color: colors.text, minWidth: 24, textAlign: 'center' },
    slotLabel: { fontSize: 13, fontFamily: 'mon-sb', color: colors.muted, marginBottom: 10 },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slotChip: { width: '30%', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' },
    slotChipUnavailable: { backgroundColor: colors.card },
    slotChipSelected: { backgroundColor: RIHLA.accent, borderColor: RIHLA.accent },
    slotTime: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    slotTables: { fontSize: 10, fontFamily: 'mon', color: colors.muted, marginTop: 2 },
    slotFull: { fontSize: 10, fontFamily: 'mon-sb', color: '#EF4444', marginTop: 2 },
    reserveBtn: { marginTop: 16, backgroundColor: RIHLA.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    reserveBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },

    walkInCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16 },
    walkInTitle: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    walkInSub: { fontSize: 12, fontFamily: 'mon', color: colors.muted, marginTop: 2 },

    description: { fontSize: 14, fontFamily: 'mon', color: colors.muted, lineHeight: 22 },

    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    reviewCard: { flexDirection: 'row', gap: 12, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 8 },
    reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C56A39', alignItems: 'center', justifyContent: 'center' },
    reviewAvatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
    reviewerName: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
    reviewText: { fontSize: 13, fontFamily: 'mon', color: colors.muted, lineHeight: 18, marginTop: 6 },
    reviewDate: { fontSize: 11, fontFamily: 'mon', color: colors.muted, marginTop: 4 },

    bottomBar: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      paddingHorizontal: 20, paddingTop: 14,
      backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border,
      shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12,
    },
    bottomPrice: {},
    bottomPriceValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
    bottomPriceUnit: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    orderBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: '#C56A39', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14,
    },
    orderBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
  }), [colors]);

  if (!listing || listing.category !== 'restaurant') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <View style={styles.notFound}>
          <Ionicons name="restaurant-outline" size={48} color={colors.muted} />
          <Text style={styles.notFoundText}>Restaurant not found</Text>
          <Pressable onPress={() => safeGoBack()}>
            <Text style={styles.notFoundLink}>← Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as RestaurantMetadata;
  const menu = MOCK_MENUS[id ?? ''] ?? DEFAULT_MENU;
  const filteredItems = menu.items.filter((item) => item.category === selectedCategory);
  const activeCategory = menu.categories.find((c) => c.key === selectedCategory);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── HERO PHOTO CAROUSEL ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <PhotoCarousel
            photos={getListingGallery(listing.cover_image_url ?? '', 'restaurant', 6)}
            height={360}
            showCount={true}
          />
          <View style={[styles.heroNav, { top: topPad + 12 }]}>
            <Pressable style={styles.navCircle} onPress={() => safeGoBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable style={styles.navCircle}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.navCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
              </Pressable>
            </View>
          </View>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.heroGradient}>
            <View style={styles.heroOverlay}>
              <View style={styles.cuisinePill}>
                <Text style={styles.cuisineText}>
                  {m.cuisine_types.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(' · ')}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <View style={styles.heroLocationRow}>
                <Ionicons name="location" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              </View>
              <View style={styles.heroRating}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#fff" />
                  <Text style={styles.ratingBadgeText}>{listing.rating}</Text>
                </View>
                <Text style={styles.heroReviewCount}>· {listing.review_count} reviews</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── QUICK INFO ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={18} color={RIHLA.accent} />
            <View>
              <Text style={styles.infoLabel}>Hours</Text>
              <Text style={styles.infoValue}>{m.opening_hours}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={18} color={RIHLA.accent} />
            <View>
              <Text style={styles.infoLabel}>Seating</Text>
              <Text style={styles.infoValue}>{m.seating_capacity} seats</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name={m.delivery_available ? 'bicycle-outline' : 'restaurant-outline'} size={18} color={RIHLA.accent} />
            <View>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{m.delivery_available ? 'Delivery' : 'Dine-in'}</Text>
            </View>
          </View>
        </View>

        {m.delivery_available && (
          <View style={styles.deliveryBanner}>
            <Ionicons name="bicycle-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.deliveryText}>🚗 Delivery available — order directly from the menu</Text>
          </View>
        )}

        {/* ── MENU ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {/* Category tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuCategoryScroll}>
            {menu.categories.map((cat) => (
              <Pressable
                key={cat.key}
                style={[styles.menuCatChip, selectedCategory === cat.key && styles.menuCatChipActive]}
                onPress={() => {
                  setSelectedCategory(cat.key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.menuCatEmoji}>{cat.emoji}</Text>
                <Text style={[styles.menuCatText, selectedCategory === cat.key && styles.menuCatTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Menu items */}
          <View style={styles.menuList}>
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} colors={colors} />
            ))}
          </View>
        </View>

        {/* ── TABLE RESERVATION ── */}
        {m.reservation_required ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reserve a Table</Text>
            {/* Guest count */}
            <View style={styles.guestRow}>
              <Text style={styles.guestLabel}>Guests</Text>
              <View style={styles.guestControls}>
                <Pressable style={styles.guestBtn} onPress={() => setGuestCount(Math.max(1, guestCount - 1))}>
                  <Ionicons name="remove" size={18} color={RIHLA.primary} />
                </Pressable>
                <Text style={styles.guestCount}>{guestCount}</Text>
                <Pressable style={styles.guestBtn} onPress={() => setGuestCount(Math.min(12, guestCount + 1))}>
                  <Ionicons name="add" size={18} color={RIHLA.primary} />
                </Pressable>
              </View>
            </View>

            {/* Time slots */}
            <Text style={styles.slotLabel}>Available Times</Text>
            <View style={styles.slotGrid}>
              {MOCK_SLOTS.map((slot) => (
                <Pressable
                  key={slot.time}
                  style={[
                    styles.slotChip,
                    !slot.available && styles.slotChipUnavailable,
                    selectedSlot === slot.time && styles.slotChipSelected,
                  ]}
                  onPress={() => {
                    if (!slot.available) return;
                    setSelectedSlot(slot.time);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  disabled={!slot.available}
                >
                  <Text style={[styles.slotTime, !slot.available && { color: colors.muted }, selectedSlot === slot.time && { color: '#fff' }]}>
                    {slot.time}
                  </Text>
                  {slot.available && (
                    <Text style={[styles.slotTables, selectedSlot === slot.time && { color: 'rgba(255,255,255,0.8)' }]}>
                      {slot.tables} tables
                    </Text>
                  )}
                  {!slot.available && <Text style={styles.slotFull}>Full</Text>}
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.reserveBtn, !selectedSlot && { opacity: 0.5 }]}
              onPress={() => {
                if (!selectedSlot) return;
                hapticSuccess();
                showToast(`Table reserved for ${guestCount} guests at ${selectedSlot}`, 'success');
              }}
            >
              <Text style={styles.reserveBtnText}>
                {selectedSlot ? `Reserve Table at ${selectedSlot}` : 'Select a time slot'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.walkInCard}>
              <Ionicons name="walk-outline" size={24} color={RIHLA.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.walkInTitle}>Walk-in Friendly</Text>
                <Text style={styles.walkInSub}>No reservation needed. Just walk in during opening hours.</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── DESCRIPTION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* ── REVIEWS ── */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Ionicons name="star" size={18} color="#FFD166" />
            <Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text>
          </View>
          <View style={styles.reviewCard}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>F</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewerName}>Fatima Z.</Text>
              <View style={styles.reviewStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name={s <= 5 ? 'star' : 'star-outline'} size={12} color="#FFD166" />
                ))}
              </View>
              <Text style={styles.reviewText}>Best couscous royal in Constantine! The mint tea with pine nuts is a must-try. Very family-friendly atmosphere.</Text>
              <Text style={styles.reviewDate}>1 week ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── STICKY BOTTOM BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceValue}>~{m.avg_meal_price_dzd.toLocaleString()} DZD</Text>
          <Text style={styles.bottomPriceUnit}>avg. meal</Text>
        </View>
        <Pressable
          style={styles.orderBtn}
          onPress={() => {
            hapticSuccess();
            router.push(`/checkout/${listing.id}?price=${m.avg_meal_price_dzd}` as any);
          }}
        >
          <Ionicons name="bag-outline" size={18} color="#fff" />
          <Text style={styles.orderBtnText}>Order</Text>
        </Pressable>
      </View>
    </View>
  );
}
