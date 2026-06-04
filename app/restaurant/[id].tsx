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
import { SAHEL } from '@/constants/Colors';
import { getListingById } from '@/constants/mockListings';
import type { RestaurantMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';

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

function MenuItemCard({ item }: { item: MenuItem }) {
  const [qty, setQty] = useState(0);

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
          <Ionicons name="remove" size={16} color={SAHEL.primary} />
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

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');

  const [selectedCategory, setSelectedCategory] = useState('starters');
  const [reserving, setReserving] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState(2);

  if (!listing || listing.category !== 'restaurant') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="restaurant-outline" size={48} color="#94A3B8" />
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
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── HERO ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#C56A39', SAHEL.primary]} style={styles.hero}>
            <View style={styles.heroNav}>
              <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.actionCircle}>
                  <Ionicons name="share-outline" size={20} color="#fff" />
                </Pressable>
                <Pressable
                  style={styles.actionCircle}
                  onPress={() => { hapticLight(); toggleFavorite(listing.id); }}
                >
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </Pressable>
              </View>
            </View>

            <View style={styles.heroContent}>
              <View style={styles.cuisinePill}>
                <Text style={styles.cuisineText}>
                  {m.cuisine_types.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(' · ')}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.heroRatingText}>{listing.rating}</Text>
                <Text style={styles.heroReviewCount}>({listing.review_count} reviews)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── QUICK INFO ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={18} color={SAHEL.accent} />
            <View>
              <Text style={styles.infoLabel}>Hours</Text>
              <Text style={styles.infoValue}>{m.opening_hours}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={18} color={SAHEL.accent} />
            <View>
              <Text style={styles.infoLabel}>Seating</Text>
              <Text style={styles.infoValue}>{m.seating_capacity} seats</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name={m.delivery_available ? 'bicycle-outline' : 'restaurant-outline'} size={18} color={SAHEL.accent} />
            <View>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{m.delivery_available ? 'Delivery' : 'Dine-in'}</Text>
            </View>
          </View>
        </View>

        {m.delivery_available && (
          <View style={styles.deliveryBanner}>
            <Ionicons name="bicycle-outline" size={16} color={SAHEL.accent} />
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
              <MenuItemCard key={item.id} item={item} />
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
                  <Ionicons name="remove" size={18} color={SAHEL.primary} />
                </Pressable>
                <Text style={styles.guestCount}>{guestCount}</Text>
                <Pressable style={styles.guestBtn} onPress={() => setGuestCount(Math.min(12, guestCount + 1))}>
                  <Ionicons name="add" size={18} color={SAHEL.primary} />
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
                  <Text style={[styles.slotTime, !slot.available && { color: '#CBD5E1' }, selectedSlot === slot.time && { color: '#fff' }]}>
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
              <Ionicons name="walk-outline" size={24} color={SAHEL.accent} />
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
            showToast('Menu ordering — Coming soon!', 'info');
          }}
        >
          <Ionicons name="bag-outline" size={18} color="#fff" />
          <Text style={styles.orderBtnText}>Order</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const menuStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14, marginBottom: 8,
  },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  emoji: { fontSize: 28, marginTop: 2 },
  cardInfo: { flex: 1, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardName: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  popularBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  popularText: { fontSize: 10, fontFamily: 'mon-sb', color: '#B45309' },
  cardDesc: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', lineHeight: 16 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  vegBadge: { fontSize: 10, fontFamily: 'mon-sb', color: '#16A34A', backgroundColor: '#F0FDF4', paddingHorizontal: 4, borderRadius: 4 },
  spiceText: { fontSize: 10 },
  cardPrice: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.primary, marginTop: 2 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: SAHEL.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnAdd: { backgroundColor: SAHEL.accent, borderColor: SAHEL.accent },
  qtyText: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark, minWidth: 20, textAlign: 'center' },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  notFoundLink: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.accent },

  // Hero
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 4 },
  cuisinePill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cuisineText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

  // Quick info
  infoRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 10, fontFamily: 'mon-sb', color: '#94A3B8' },
  infoValue: { fontSize: 12, fontFamily: 'mon-b', color: SAHEL.dark },
  infoDivider: { width: 1, height: 30, backgroundColor: SAHEL.border, marginHorizontal: 8 },

  // Delivery
  deliveryBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 10, padding: 12, borderRadius: 10, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#D1FAE5' },
  deliveryText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.accent },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 12 },

  // Menu categories
  menuCategoryScroll: { gap: 8, marginBottom: 14 },
  menuCatChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: SAHEL.border },
  menuCatChipActive: { backgroundColor: SAHEL.primary, borderColor: SAHEL.primary },
  menuCatEmoji: { fontSize: 14 },
  menuCatText: { fontSize: 13, fontFamily: 'mon-sb', color: '#475569' },
  menuCatTextActive: { color: '#fff' },
  menuList: {},

  // Table reservation
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  guestLabel: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  guestControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  guestBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: SAHEL.border, alignItems: 'center', justifyContent: 'center' },
  guestCount: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.dark, minWidth: 24, textAlign: 'center' },
  slotLabel: { fontSize: 13, fontFamily: 'mon-sb', color: '#64748B', marginBottom: 10 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: { width: '30%', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: SAHEL.border, backgroundColor: '#fff', alignItems: 'center' },
  slotChipUnavailable: { backgroundColor: '#F8FAFC' },
  slotChipSelected: { backgroundColor: SAHEL.accent, borderColor: SAHEL.accent },
  slotTime: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  slotTables: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8', marginTop: 2 },
  slotFull: { fontSize: 10, fontFamily: 'mon-sb', color: '#EF4444', marginTop: 2 },
  reserveBtn: { marginTop: 16, backgroundColor: SAHEL.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  reserveBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },

  // Walk-in
  walkInCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 16 },
  walkInTitle: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  walkInSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },

  // Description
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },

  // Reviews
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewCard: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 14, marginTop: 8 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#C56A39', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#fff' },
  reviewerName: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  reviewStars: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewText: { fontSize: 13, fontFamily: 'mon', color: '#475569', lineHeight: 18, marginTop: 6 },
  reviewDate: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginTop: 4 },

  // Bottom bar
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: SAHEL.border,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  bottomPrice: {},
  bottomPriceValue: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomPriceUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  orderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#C56A39', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14,
  },
  orderBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
