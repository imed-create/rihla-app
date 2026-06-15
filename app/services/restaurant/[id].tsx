/**
 * RIHLA — Dedicated Restaurant Screen
 * ───────────────────────────────────
 * Works like Zomato + OpenTable:
 * - Two Tabs: 🍽️ Menu / 📅 Reserve Table
 * - Menu: Category chips, item additions, slide-up order preview panel.
 * - Table: Dynamic date slot selections, guest counters, special notes.
 * - Integrates order checkouts with AppContext and confirms tickets.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getListingById } from '@/constants/mockListings';
import { getListingGallery } from '@/utils/listingPhotos';
import { useApp } from '@/context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

const { width: SCREEN_W } = Dimensions.get('window');

type CartItem = {
  id: string;
  name: string;
  priceDZD: number;
  qty: number;
};

export default function RestaurantServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { addBooking, addOrder } = useApp();
  const insets = useSafeAreaInsets();

  const restaurant = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (restaurant ? getListingGallery(restaurant.cover_image_url ?? '', 'restaurant', 4) : []),
    [restaurant]
  );

  // Tab State
  const [activeTab, setActiveTab] = useState<'menu' | 'reserve'>('menu');

  // Menu Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('plats');

  // Cart State for delivery orders
  const [cart, setCart] = useState<CartItem[]>([]);

  // Reservation State
  const [reserveDate, setReserveDate] = useState<string>('2026-06-20');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('19:30');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');

  if (!restaurant) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Restaurant not found</Text>
      </View>
    );
  }

  // Restaurant Menu Data (Bespoe premium dishes)
  const menuItems = [
    // Plats
    { id: 'm1', category: 'plats', name: 'Couscous Royal Algérien', desc: 'Traditional couscous served with mutton, chicken, merguez, and fresh vegetables.', price: 1800, image: gallery[1] || gallery[0], tag: 'Signature' },
    { id: 'm2', category: 'plats', name: 'Tajine de Poulet aux Citrons', desc: 'Slow-cooked chicken thigh with green olives, preserved lemons, and saffron.', price: 1200, image: gallery[2] || gallery[0] },
    { id: 'm3', category: 'plats', name: 'Rechta Algéroise', desc: 'Thin handmade noodles served with chicken, white turnip, and cinnamon gravy.', price: 1100, image: gallery[3] || gallery[0] },
    
    // Entrées
    { id: 'm4', category: 'entrées', name: 'Bourek Viande Hachée', desc: 'Crispy brick pastry rolls stuffed with spiced minced meat, egg, and cheese.', price: 350, image: gallery[0] },
    { id: 'm5', category: 'entrées', name: 'Chorba Frik', desc: 'Traditional Algerian wheat soup with lamb, chickpeas, coriander, and mint.', price: 500, image: gallery[1] || gallery[0] },
    { id: 'm6', category: 'entrées', name: 'Salade Mechouia', desc: 'Grilled bell peppers, tomatoes, and garlic paste, topped with boiled egg and tuna.', price: 450, image: gallery[2] || gallery[0] },

    // Desserts
    { id: 'm7', category: 'desserts', name: 'Baklawa aux Amandes', desc: 'Layered phyllo pastry filled with crushed almonds, soaked in pure honey.', price: 250, image: gallery[3] || gallery[0] },
    { id: 'm8', category: 'desserts', name: 'Hrissa Kalb El Louz', desc: 'Traditional semolina cake flavored with orange blossom water.', price: 200, image: gallery[1] || gallery[0] },

    // Boissons
    { id: 'm9', category: 'boissons', name: 'Fresh Mint Tea', desc: 'Traditional green tea infused with fresh mint leaves and sugar.', price: 150, image: gallery[2] || gallery[0] },
    { id: 'm10', category: 'boissons', name: 'Hamoud Boualem Selecto', desc: 'Algerian classic dark soft drink.', price: 180, image: gallery[3] || gallery[0] },
  ];

  const filteredMenu = menuItems.filter((i) => i.category === selectedCategory);

  const cartTotalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + item.priceDZD * item.qty, 0);

  // Time Slots
  const timeSlots = [
    { time: '12:00', available: true },
    { time: '13:00', available: true },
    { time: '14:00', available: false },
    { time: '18:30', available: true },
    { time: '19:30', available: true },
    { time: '20:30', available: true },
    { time: '21:30', available: true },
    { time: '22:30', available: false },
  ];

  // ── Cart Handlers ──
  const handleAddToCart = (item: typeof menuItems[0]) => {
    hapticLight();
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, priceDZD: item.price, qty: 1 }];
    });
  };

  const handleAdjustQty = (id: string, delta: number) => {
    hapticLight();
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  // ── Checkout / Booking Submission ──
  const handleMenuCheckout = () => {
    if (cart.length === 0) return;
    hapticSuccess();

    // Add order to AppContext store
    addOrder({
      userId: 'guest',
      beachId: restaurant.provider_id,
      totalDZD: cartTotalPrice,
      paid: false,
      service_variant: 'restaurant',
      items: cart.map((i) => ({
        id: i.id,
        orderId: '',
        menuItemId: i.id,
        name: i.name,
        quantity: i.qty,
        priceDZD: i.priceDZD,
      })),
      spotLabel: 'Dining Room',
    });

    // Navigate to confirmation page
    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'restaurant',
        title: restaurant.title,
        subtitle: `Food Order — ${cartTotalQty} items`,
        price: String(cartTotalPrice),
      },
    });
  };

  const handleTableReservation = () => {
    hapticSuccess();

    // Add booking to AppContext store
    addBooking({
      type: 'restaurant',
      title: restaurant.title,
      subtitle: `Table Reservation — ${guests} guests`,
      price: 0,
      businessId: restaurant.provider_id,
      icon: 'restaurant',
      iconFamily: 'Ionicons',
      color: '#C56A39',
      details: {
        date: reserveDate,
        time: selectedTimeSlot,
        guests: guests,
        notes: notes || 'None',
      },
    });

    // Navigate to confirmation page
    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'restaurant',
        title: restaurant.title,
        subtitle: `Table Reservation — ${guests} guests`,
        price: '0',
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
        {/* 1. Header Image */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: gallery[0] }} style={styles.heroImage} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.restaurantMetaBox}>
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>RESTAURANT</Text>
            </View>
            <Text style={styles.restaurantName}>{restaurant.title}</Text>
            <Text style={styles.restaurantRegion}>
              Traditional & International Cuisine · {restaurant.wilaya}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#FFD166" />
              <Text style={styles.ratingText}>
                {restaurant.rating} ({restaurant.review_count} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Menu / Reserve Tab Switcher */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'menu' && [styles.tabBtnActive, { borderBottomColor: '#C56A39' }]]}
            onPress={() => { hapticLight(); setActiveTab('menu'); }}
          >
            <Ionicons name="restaurant-outline" size={18} color={activeTab === 'menu' ? '#C56A39' : colors.muted} />
            <Text style={[styles.tabLabel, { color: activeTab === 'menu' ? '#C56A39' : colors.text }]}>🍽️ Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reserve' && [styles.tabBtnActive, { borderBottomColor: '#C56A39' }]]}
            onPress={() => { hapticLight(); setActiveTab('reserve'); }}
          >
            <Ionicons name="calendar-outline" size={18} color={activeTab === 'reserve' ? '#C56A39' : colors.muted} />
            <Text style={[styles.tabLabel, { color: activeTab === 'reserve' ? '#C56A39' : colors.text }]}>📅 Reserve Table</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Contents */}
        {activeTab === 'menu' ? (
          // ── MENU TAB ──
          <View style={styles.container}>
            {/* Horizontal menu category scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {[
                { key: 'plats', label: 'Plats Principal' },
                { key: 'entrées', label: 'Entrées' },
                { key: 'desserts', label: 'Desserts' },
                { key: 'boissons', label: 'Boissons' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => { hapticLight(); setSelectedCategory(cat.key); }}
                    style={[
                      styles.categoryChip,
                      isActive ? { backgroundColor: '#C56A39', borderColor: '#C56A39' } : { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.categoryLabelText, { color: isActive ? '#FFF' : colors.text }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Menu Items List */}
            <View style={styles.menuItemsList}>
              {filteredMenu.map((item) => (
                <View key={item.id} style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {item.image ? <Image source={{ uri: item.image }} style={styles.menuItemImage} /> : null}
                  <View style={styles.menuItemInfo}>
                    <View style={styles.menuItemTitleRow}>
                      <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                      {item.tag ? (
                        <View style={styles.tagPill}>
                          <Text style={styles.tagPillText}>{item.tag}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.menuItemDesc, { color: colors.muted }]} numberOfLines={2}>
                      {item.desc}
                    </Text>
                    <View style={styles.menuItemPriceRow}>
                      <Text style={[styles.menuItemPrice, { color: colors.text }]}>
                        {item.price.toLocaleString()} DZD
                      </Text>
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => handleAddToCart(item)}
                      >
                        <Ionicons name="add" size={16} color="#FFF" />
                        <Text style={styles.addBtnText}>Add</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          // ── RESERVE TABLE TAB ──
          <View style={styles.container}>
            {/* Table Details */}
            <View style={styles.reservationForm}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Table Reservation</Text>

              {/* Date Input */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.muted }]}>DATE</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="calendar-outline" size={18} color={colors.muted} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={reserveDate}
                    onChangeText={setReserveDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>

              {/* Time Slots Grid */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.muted }]}>AVAILABLE TIME SLOTS</Text>
                <View style={styles.slotsGrid}>
                  {timeSlots.map((slot, idx) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.slotCell,
                          {
                            backgroundColor: slot.available
                              ? isSelected
                                ? '#C56A39'
                                : 'rgba(197,106,57,0.08)'
                              : colors.border,
                            borderColor: slot.available ? '#C56A39' : 'transparent',
                          },
                          isSelected && { borderWidth: 1.5 },
                        ]}
                        disabled={!slot.available}
                        onPress={() => { hapticLight(); setSelectedTimeSlot(slot.time); }}
                      >
                        <Text
                          style={[
                            styles.slotText,
                            {
                              color: slot.available
                                ? isSelected
                                  ? '#FFF'
                                  : '#C56A39'
                                : colors.muted,
                            },
                          ]}
                        >
                          {slot.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Guests Count Selector */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.muted }]}>NUMBER OF GUESTS</Text>
                <View style={styles.guestsControls}>
                  <TouchableOpacity
                    style={[styles.gBtn, { borderColor: colors.border }]}
                    onPress={() => { hapticLight(); setGuests(Math.max(1, guests - 1)); }}
                  >
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.guestsValue, { color: colors.text }]}>{guests} Guests</Text>
                  <TouchableOpacity
                    style={[styles.gBtn, { borderColor: colors.border }]}
                    onPress={() => { hapticLight(); setGuests(guests + 1); }}
                  >
                    <Ionicons name="add" size={18} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Special Request Notes */}
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.muted }]}>SPECIAL REQUESTS (OPTIONAL)</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  multiline
                  numberOfLines={3}
                  placeholder="Allergies, seating preference, birthday notes..."
                  placeholderTextColor={colors.muted}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {/* Reserve button */}
              <TouchableOpacity
                style={styles.reserveTableBtn}
                onPress={handleTableReservation}
              >
                <Text style={styles.reserveTableBtnText}>Reserve Table</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Panel (Only shows when menu items added in Menu Tab) */}
      {activeTab === 'menu' && cart.length > 0 && (
        <View style={[styles.cartOverlay, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.cartSummary}>
            <View style={styles.cartQtyArea}>
              <View style={styles.cartBadgeCircle}>
                <Text style={styles.cartBadgeVal}>{cartTotalQty}</Text>
              </View>
              <Text style={[styles.cartTotalLabel, { color: colors.text }]}>Items Added</Text>
            </View>
            <View style={styles.cartPriceArea}>
              <Text style={[styles.cartTotalLabel, { color: colors.muted }]}>Subtotal:</Text>
              <Text style={[styles.cartTotalPrice, { color: colors.text }]}>
                {cartTotalPrice.toLocaleString()} DZD
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleMenuCheckout}>
            <Text style={styles.checkoutBtnText}>Checkout Order</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 200 },
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
  restaurantMetaBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,37,64,0.85)',
    padding: 16,
    gap: 2,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C56A39',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  catBadgeText: { color: '#FFF', fontSize: 9, fontFamily: 'mon-b' },
  restaurantName: { fontSize: 20, fontFamily: 'mon-b', color: '#FFF' },
  restaurantRegion: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 11, fontFamily: 'mon-sb', color: '#FFF' },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 48,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
  },
  tabLabel: { fontSize: 13, fontFamily: 'mon-sb' },

  container: { padding: 16 },

  // Menu styles
  categoryScroll: { gap: 8, height: 36, marginBottom: 12 },
  categoryChip: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryLabelText: { fontSize: 12, fontFamily: 'mon-sb' },
  menuItemsList: { gap: 12 },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
  },
  menuItemImage: { width: 80, height: 80, borderRadius: 10 },
  menuItemInfo: { flex: 1, gap: 4 },
  menuItemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuItemName: { fontSize: 14, fontFamily: 'mon-b' },
  tagPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagPillText: { color: '#D97706', fontSize: 8, fontFamily: 'mon-b' },
  menuItemDesc: { fontSize: 11, fontFamily: 'mon', lineHeight: 16 },
  menuItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  menuItemPrice: { fontSize: 13, fontFamily: 'mon-b' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C56A39',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: '#FFF', fontSize: 11, fontFamily: 'mon-b' },

  // Reservation Form
  reservationForm: { gap: 16 },
  formTitle: { fontSize: 16, fontFamily: 'mon-b' },
  formGroup: { gap: 6 },
  formLabel: { fontSize: 10, fontFamily: 'mon-b', letterSpacing: 0.5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, fontFamily: 'mon' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCell: {
    width: (SCREEN_W - 32 - 24) / 4,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontSize: 12, fontFamily: 'mon-b' },
  guestsControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  gBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestsValue: { fontSize: 14, fontFamily: 'mon-b' },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontFamily: 'mon',
    textAlignVertical: 'top',
  },
  reserveTableBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#C56A39',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  reserveTableBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  // Floating Cart Panel
  cartOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  cartSummary: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 10 },
  cartQtyArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cartBadgeCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#C56A39', alignItems: 'center', justifyContent: 'center' },
  cartBadgeVal: { color: '#FFF', fontSize: 10, fontFamily: 'mon-b' },
  cartTotalLabel: { fontSize: 12, fontFamily: 'mon-sb' },
  cartPriceArea: { alignItems: 'flex-end' },
  cartTotalPrice: { fontSize: 15, fontFamily: 'mon-b' },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#C56A39',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },
  checkoutBtnText: { color: '#FFF', fontSize: 12, fontFamily: 'mon-b' },
});
