/**
 * RIHLA — Polymorphic Checkout / Booking Screen
 * -----------------------------------------------
 * Handles booking for ALL 10 marketplace categories.
 * Reads listing.category and renders the correct booking form,
 * pricing breakdown, and payment CTA.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import type {
  Listing,
  HotelMetadata,
  RestaurantMetadata,
  BeachMetadata,
  RentalMetadata,
  ActivityMetadata,
  EventMetadata,
  GuideMetadata,
  PhotographerMetadata,
  DriverMetadata,
  ExperienceMetadata,
} from '@/types/service';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

// ─────────────────────────────────────────────
// PAYMENT METHOD SELECTOR
// ─────────────────────────────────────────────

function PaymentMethod({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const methods = [
    { key: 'chargily', label: 'Chargily Pay', icon: '💳', desc: 'Visa, Mastercard, CCP' },
    { key: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you arrive' },
  ];
  return (
    <View style={styles.payList}>
      {methods.map((m) => (
        <Pressable
          key={m.key}
          style={[styles.payCard, selected === m.key && styles.paySelected]}
          onPress={() => onSelect(m.key)}
        >
          <Text style={styles.payEmoji}>{m.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.payLabel}>{m.label}</Text>
            <Text style={styles.payDesc}>{m.desc}</Text>
          </View>
          <View style={[styles.radioOuter, selected === m.key && styles.radioActive]}>
            {selected === m.key && <View style={styles.radioInner} />}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────
// CATEGORY-SPECIFIC BOOKING FORMS
// ─────────────────────────────────────────────

function HotelBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as HotelMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Booking Details</Text>
      <View style={styles.detailRow}>
        <Ionicons name="bed-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Room type: <Text style={styles.detailBold}>Double Room</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Check-in: <Text style={styles.detailBold}>{m.check_in_time}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Check-out: <Text style={styles.detailBold}>{m.check_out_time}</Text></Text>
      </View>
      {m.breakfast_included && (
        <View style={styles.detailRow}>
          <Ionicons name="cafe-outline" size={16} color={RIHLA.accent} />
          <Text style={styles.detailText}>Breakfast <Text style={[styles.detailBold, { color: '#10B981' }]}>included</Text></Text>
        </View>
      )}
    </View>
  );
}

function RestaurantBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as RestaurantMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Order Details</Text>
      <View style={styles.detailRow}>
        <Ionicons name="restaurant-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Cuisine: <Text style={styles.detailBold}>{m.cuisine_types.join(', ')}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name={m.delivery_available ? 'bicycle-outline' : 'restaurant-outline'} size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Service: <Text style={styles.detailBold}>{m.delivery_available ? 'Delivery available' : 'Dine-in only'}</Text></Text>
      </View>
    </View>
  );
}

function BeachBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as BeachMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Spot Reservation</Text>
      <View style={styles.detailRow}>
        <Ionicons name="grid-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Zone: <Text style={styles.detailBold}>{m.zone.charAt(0).toUpperCase() + m.zone.slice(1)} Zone</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="timer-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Hold: <Text style={styles.detailBold}>{m.hold_duration_minutes} min countdown</Text></Text>
      </View>
    </View>
  );
}

function RentalBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as RentalMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Reservation</Text>
      <View style={styles.detailRow}>
        <Ionicons name="bed-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>{m.bedrooms} bedrooms · {m.bathrooms} bathrooms</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="people-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Max {m.max_guests} guests · {m.property_type}</Text>
      </View>
      {m.monthly_available && (
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={RIHLA.accent} />
          <Text style={styles.detailText}>Monthly rental <Text style={[styles.detailBold, { color: '#10B981' }]}>available</Text></Text>
        </View>
      )}
    </View>
  );
}

function ActivityBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as ActivityMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Session Booking</Text>
      <View style={styles.detailRow}>
        <Ionicons name="flash-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Type: <Text style={styles.detailBold}>{m.activity_type}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Duration: <Text style={styles.detailBold}>{m.session_duration_minutes} min</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="speedometer-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Difficulty: <Text style={styles.detailBold}>{m.difficulty}</Text></Text>
      </View>
      {m.equipment_included && (
        <View style={styles.detailRow}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
          <Text style={styles.detailText}>Equipment <Text style={[styles.detailBold, { color: '#10B981' }]}>included</Text></Text>
        </View>
      )}
    </View>
  );
}

function EventBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as EventMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Ticket Purchase</Text>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Date: <Text style={styles.detailBold}>{m.event_date}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Time: <Text style={styles.detailBold}>{m.start_time} – {m.end_time}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Venue: <Text style={styles.detailBold}>{m.venue}</Text></Text>
      </View>
      {m.age_restriction && (
        <View style={styles.detailRow}>
          <Ionicons name="alert-circle-outline" size={16} color="#F59E0B" />
          <Text style={styles.detailText}>Age: <Text style={[styles.detailBold, { color: '#F59E0B' }]}>{m.age_restriction}</Text></Text>
        </View>
      )}
    </View>
  );
}

function GuideBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as GuideMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Session Booking</Text>
      <View style={styles.detailRow}>
        <Ionicons name="globe-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Languages: <Text style={styles.detailBold}>{m.languages.join(', ')}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="compass-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Specialization: <Text style={styles.detailBold}>{m.specialization}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="people-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Max group: <Text style={styles.detailBold}>{m.max_group_size}</Text></Text>
      </View>
    </View>
  );
}

function PhotographerBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as PhotographerMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Session Booking</Text>
      <View style={styles.detailRow}>
        <Ionicons name="color-palette-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Styles: <Text style={styles.detailBold}>{m.style.join(', ')}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Turnaround: <Text style={styles.detailBold}>{m.turnaround_days} days</Text></Text>
      </View>
      {m.drone_available && (
        <View style={styles.detailRow}>
          <Ionicons name="airplane-outline" size={16} color="#10B981" />
          <Text style={styles.detailText}>Drone <Text style={[styles.detailBold, { color: '#10B981' }]}>available</Text></Text>
        </View>
      )}
    </View>
  );
}

function DriverBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as DriverMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Ride Booking</Text>
      <View style={styles.detailRow}>
        <Ionicons name="car-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Vehicle: <Text style={styles.detailBold}>{m.vehicle_name}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="pricetag-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Rate: <Text style={styles.detailBold}>{m.price_per_km_dzd} DZD/km</Text></Text>
      </View>
      {m.airport_transfer && (
        <View style={styles.detailRow}>
          <Ionicons name="airplane-outline" size={16} color="#10B981" />
          <Text style={styles.detailText}>Airport transfer <Text style={[styles.detailBold, { color: '#10B981' }]}>available</Text></Text>
        </View>
      )}
    </View>
  );
}

function ExperienceBookingForm({ listing }: { listing: Listing }) {
  const m = listing.metadata as ExperienceMetadata;
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Trip Booking</Text>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Duration: <Text style={styles.detailBold}>{m.duration_days} days</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="speedometer-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Difficulty: <Text style={styles.detailBold}>{m.difficulty}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="people-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Max group: <Text style={styles.detailBold}>{m.max_group_size}</Text></Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
        <Text style={styles.detailText}>Includes: <Text style={styles.detailBold}>{m.inclusions.slice(0, 3).join(', ')}{m.inclusions.length > 3 ? '...' : ''}</Text></Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// DISPATCHER
// ─────────────────────────────────────────────

function BookingForm({ listing }: { listing: Listing }) {
  switch (listing.category) {
    case 'hotel': return <HotelBookingForm listing={listing} />;
    case 'restaurant': return <RestaurantBookingForm listing={listing} />;
    case 'beach': return <BeachBookingForm listing={listing} />;
    case 'rental': return <RentalBookingForm listing={listing} />;
    case 'activity': return <ActivityBookingForm listing={listing} />;
    case 'event': return <EventBookingForm listing={listing} />;
    case 'guide': return <GuideBookingForm listing={listing} />;
    case 'photographer': return <PhotographerBookingForm listing={listing} />;
    case 'driver': return <DriverBookingForm listing={listing} />;
    case 'experience': return <ExperienceBookingForm listing={listing} />;
    default: return null;
  }
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function CheckoutScreen() {
  const { id, price, qty } = useLocalSearchParams<{ id: string; price?: string; qty?: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 20 : insets.top + 8;

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const [paymentMethod, setPaymentMethod] = useState('chargily');
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  if (!listing) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Listing not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const catDef = getCategoryDef(listing.category);
  const unitPrice = price ? parseInt(price, 10) : listing.price_dzd;
  const quantity = qty ? parseInt(qty, 10) : 1;
  const subtotal = unitPrice * quantity;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handleConfirm = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      showToast('Please fill in your name and phone', 'info');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast('Booking confirmed! 🎉 Check your email for details.', 'success');
    router.replace('/(tabs)/bookings' as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable style={styles.backBtn} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={RIHLA.dark} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSub}>Complete your booking</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── LISTING SUMMARY ── */}
        <View style={styles.listingCard}>
          <View style={[styles.listingIcon, { backgroundColor: catDef.color + '15' }]}>
            <Ionicons name={catDef.icon as any} size={24} color={catDef.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
            <Text style={styles.listingCat}>{catDef.label} · {listing.wilaya}</Text>
            <View style={styles.listingRating}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={styles.listingRatingText}>{listing.rating}</Text>
            </View>
          </View>
        </View>

        {/* ── BOOKING FORM ── */}
        <BookingForm listing={listing} />

        {/* ── CONTACT INFO ── */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Contact Information</Text>
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={18} color="#64748B" />
            <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor="#94A3B8" value={contactName} onChangeText={setContactName} />
          </View>
          <View style={styles.inputGroup}>
            <Ionicons name="call-outline" size={18} color="#64748B" />
            <TextInput style={styles.input} placeholder="+213 5XX XXX XXX" placeholderTextColor="#94A3B8" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
          </View>
          <View style={[styles.inputGroup, { height: 80, alignItems: 'flex-start', paddingTop: 14 }]}>
            <Ionicons name="chatbubble-outline" size={18} color="#64748B" style={{ marginTop: 2 }} />
            <TextInput style={[styles.input, { height: 60 }]} placeholder="Special requests (optional)" placeholderTextColor="#94A3B8" value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
          </View>
        </View>

        {/* ── PAYMENT METHOD ── */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Payment Method</Text>
          <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
        </View>

        {/* ── PRICE BREAKDOWN ── */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{catDef.label} × {quantity}</Text>
              <Text style={styles.priceValue}>{subtotal.toLocaleString()} DZD</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee (5%)</Text>
              <Text style={styles.priceValue}>{serviceFee.toLocaleString()} DZD</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotal}>Total</Text>
              <Text style={styles.priceTotalValue}>{total.toLocaleString()} DZD</Text>
            </View>
          </View>
        </View>

        {/* ── TRUST BADGES ── */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.trustText}>Secure payment</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.trustText}>Free cancellation</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="headset-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.trustText}>24/7 support</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── STICKY CONFIRM BUTTON ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{total.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>Total · {paymentMethod === 'chargily' ? 'Online payment' : 'Pay on arrival'}</Text>
        </View>
        <Pressable
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Confirm Booking</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: RIHLA.card, borderWidth: 1, borderColor: RIHLA.border, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.dark },
  headerSub: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },

  // Listing summary
  listingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14 },
  listingIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listingTitle: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  listingCat: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  listingRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  listingRatingText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.dark },

  // Form sections
  formSection: { paddingHorizontal: 20, paddingTop: 18 },
  formLabel: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: RIHLA.border },
  detailText: { fontSize: 13, fontFamily: 'mon', color: '#475569', flex: 1 },
  detailBold: { fontFamily: 'mon-sb', color: RIHLA.dark },

  // Contact inputs
  inputGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: RIHLA.border, paddingHorizontal: 14, height: 50, marginBottom: 8 },
  input: { flex: 1, fontSize: 14, fontFamily: 'mon', color: RIHLA.dark },

  // Payment
  payList: { gap: 8 },
  payCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: RIHLA.border, padding: 14 },
  paySelected: { borderColor: RIHLA.accent, backgroundColor: '#F0FDFA' },
  payEmoji: { fontSize: 24 },
  payLabel: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  payDesc: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: RIHLA.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: RIHLA.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: RIHLA.accent },

  // Price breakdown
  priceCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 16, gap: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 13, fontFamily: 'mon', color: '#64748B' },
  priceValue: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark },
  priceDivider: { height: 1, backgroundColor: RIHLA.border, marginVertical: 4 },
  priceTotal: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  priceTotalValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },

  // Trust
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustText: { fontSize: 11, fontFamily: 'mon-sb', color: '#64748B' },

  // Bottom bar
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: RIHLA.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  confirmBtn: { backgroundColor: RIHLA.accent, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 14, minWidth: 140, alignItems: 'center' },
  confirmText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
