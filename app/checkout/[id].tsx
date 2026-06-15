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
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';
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
import { hapticSuccess, hapticLight } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { usePartnerDispatches } from '@/store/usePartnerDispatches';
import * as Haptics from 'expo-haptics';
import MapWithDirections from '@/components/shared/MapWithDirections';
import UberButton from '@/components/shared/UberButton';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─────────────────────────────────────────────
// PAYMENT METHOD SELECTOR
// ─────────────────────────────────────────────

function PaymentMethod({ selected, onSelect }: { selected: string; onSelect: (v: string) => void }) {
  const styles = useStyles();
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
          onPress={() => { hapticLight(); onSelect(m.key); }}
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
  const styles = useStyles();
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

function RestaurantBookingForm({
  listing,
  serviceMode,
  setServiceMode,
  deliveryType,
  setDeliveryType,
  deliverySpot,
  setDeliverySpot,
  deliveryAddress,
  setDeliveryAddress,
}: {
  listing: Listing;
  serviceMode: 'dine_in' | 'delivery';
  setServiceMode: (v: 'dine_in' | 'delivery') => void;
  deliveryType: 'spot' | 'address';
  setDeliveryType: (v: 'spot' | 'address') => void;
  deliverySpot: string;
  setDeliverySpot: (v: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
}) {
  const styles = useStyles();
  const m = listing.metadata as RestaurantMetadata;
  const { colors } = useTheme();

  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Order Details</Text>

      {/* Service Mode Selector */}
      <View style={styles.tabSelectorRow}>
        <Pressable
          style={[styles.tabSelectorBtn, serviceMode === 'delivery' && styles.tabSelectorActive]}
          onPress={() => { hapticLight(); setServiceMode('delivery'); }}
        >
          <Ionicons name="bicycle-outline" size={16} color={serviceMode === 'delivery' ? '#FFF' : RIHLA.accent} />
          <Text style={[styles.tabSelectorText, serviceMode === 'delivery' && styles.tabSelectorTextActive]}>Delivery</Text>
        </Pressable>
        <Pressable
          style={[styles.tabSelectorBtn, serviceMode === 'dine_in' && styles.tabSelectorActive]}
          onPress={() => { hapticLight(); setServiceMode('dine_in'); }}
        >
          <Ionicons name="restaurant-outline" size={16} color={serviceMode === 'dine_in' ? '#FFF' : RIHLA.accent} />
          <Text style={[styles.tabSelectorText, serviceMode === 'dine_in' && styles.tabSelectorTextActive]}>Dine-in</Text>
        </Pressable>
      </View>

      {serviceMode === 'delivery' ? (
        <View style={styles.deliveryDetailsBlock}>
          {/* Delivery Type Selector */}
          <View style={styles.subTabSelectorRow}>
            <Pressable
              style={[styles.subTabBtn, deliveryType === 'spot' && styles.subTabActive]}
              onPress={() => { hapticLight(); setDeliveryType('spot'); }}
            >
              <Text style={[styles.subTabText, deliveryType === 'spot' && styles.subTabTextActive]}>Beach Spot</Text>
            </Pressable>
            <Pressable
              style={[styles.subTabBtn, deliveryType === 'address' && styles.subTabActive]}
              onPress={() => { hapticLight(); setDeliveryType('address'); }}
            >
              <Text style={[styles.subTabText, deliveryType === 'address' && styles.subTabTextActive]}>Manual Address</Text>
            </Pressable>
          </View>

          {deliveryType === 'spot' ? (
            <View style={styles.inputGroup}>
              <Ionicons name="pin-outline" size={18} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Enter Spot ID (e.g., F-03, V-01)"
                placeholderTextColor={colors.muted}
                value={deliverySpot}
                onChangeText={setDeliverySpot}
              />
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Ionicons name="location-outline" size={18} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Enter Street / Hotel details / Coordinates"
                placeholderTextColor={colors.muted}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.dineInBlock}>
          <Ionicons name="calendar-outline" size={24} color={RIHLA.primary} />
          <Text style={[styles.dineInText, { color: colors.text }]}>
            Table reservation will be held for 15 minutes past booking time.
          </Text>
        </View>
      )}
    </View>
  );
}

function BeachBookingForm({ listing }: { listing: Listing }) {
  const styles = useStyles();
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
  const styles = useStyles();
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
  const styles = useStyles();
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

function EventBookingForm({
  listing,
  ticketQuantity,
  setTicketQuantity,
  ticketTier,
  setTicketTier,
  eventTiers,
}: {
  listing: Listing;
  ticketQuantity: number;
  setTicketQuantity: (q: number) => void;
  ticketTier: string;
  setTicketTier: (t: string) => void;
  eventTiers: { name: string; price_dzd: number; quantity: number }[];
}) {
  const styles = useStyles();
  const m = listing.metadata as EventMetadata;
  const { colors } = useTheme();

  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>Select Ticket Level</Text>

      {/* Ticket Tier Picker */}
      <View style={styles.tierGrid}>
        {eventTiers.map((tier) => {
          const isActive = ticketTier.toLowerCase() === tier.name.toLowerCase();
          return (
            <Pressable
              key={tier.name}
              style={[styles.tierCard, isActive && styles.tierCardActive, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { hapticLight(); setTicketTier(tier.name); }}
            >
              <Text style={[styles.tierName, { color: colors.text }]}>{tier.name}</Text>
              <Text style={styles.tierPrice}>{tier.price_dzd.toLocaleString()} DA</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.formLabel, { marginTop: 16 }]}>Ticket Quantity</Text>
      <View style={styles.qtyRow}>
        <Pressable
          style={styles.qtyBtn}
          onPress={() => { hapticLight(); setTicketQuantity(Math.max(1, ticketQuantity - 1)); }}
        >
          <Ionicons name="remove" size={20} color="#0A2540" />
        </Pressable>
        <Text style={[styles.qtyValue, { color: colors.text }]}>{ticketQuantity}</Text>
        <Pressable
          style={styles.qtyBtn}
          onPress={() => { hapticLight(); setTicketQuantity(Math.min(10, ticketQuantity + 1)); }}
        >
          <Ionicons name="add" size={20} color="#0A2540" />
        </Pressable>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={16} color={RIHLA.accent} />
        <Text style={styles.detailText}>Venue: <Text style={styles.detailBold}>{m.venue}</Text></Text>
      </View>
    </View>
  );
}

function GuideBookingForm({ listing }: { listing: Listing }) {
  const styles = useStyles();
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
  const styles = useStyles();
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
  const styles = useStyles();
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
  const styles = useStyles();
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
    </View>
  );
}

// ─────────────────────────────────────────────
// STATIC INVOICE BARCODE DRAWING
// ─────────────────────────────────────────────

function MockBarcode({ code }: { code: string }) {
  const styles = useStyles();
  return (
    <View style={styles.barcodeBox}>
      <Svg width="180" height="42" viewBox="0 0 180 42">
        <Rect x="0" y="0" width="180" height="42" fill="#FFF" />
        <Rect x="10" y="4" width="4" height="34" fill="#000" />
        <Rect x="18" y="4" width="2" height="34" fill="#000" />
        <Rect x="24" y="4" width="6" height="34" fill="#000" />
        <Rect x="34" y="4" width="2" height="34" fill="#000" />
        <Rect x="38" y="4" width="4" height="34" fill="#000" />
        <Rect x="46" y="4" width="8" height="34" fill="#000" />
        <Rect x="58" y="4" width="2" height="34" fill="#000" />
        <Rect x="64" y="4" width="4" height="34" fill="#000" />
        <Rect x="72" y="4" width="6" height="34" fill="#000" />
        <Rect x="82" y="4" width="2" height="34" fill="#000" />
        <Rect x="88" y="4" width="8" height="34" fill="#000" />
        <Rect x="100" y="4" width="4" height="34" fill="#000" />
        <Rect x="108" y="4" width="2" height="34" fill="#000" />
        <Rect x="114" y="4" width="6" height="34" fill="#000" />
        <Rect x="124" y="4" width="4" height="34" fill="#000" />
        <Rect x="132" y="4" width="8" height="34" fill="#000" />
        <Rect x="144" y="4" width="2" height="34" fill="#000" />
        <Rect x="150" y="4" width="4" height="34" fill="#000" />
        <Rect x="158" y="4" width="6" height="34" fill="#000" />
        <Rect x="168" y="4" width="2" height="34" fill="#000" />
      </Svg>
      <Text style={styles.barcodeText}>{code}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────

export default function CheckoutScreen() {
  const { id, price, qty } = useLocalSearchParams<{ id: string; price?: string; qty?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const topPad = Platform.OS === 'web' ? insets.top + 20 : insets.top + 8;

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const { user, addBooking } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('chargily');
  const [loading, setLoading] = useState(false);
  const [contactName, setContactName] = useState(user.name || '');
  const [contactPhone, setContactPhone] = useState(user.phone || '');
  const [notes, setNotes] = useState('');

  // Category specific states
  const [success, setSuccess] = useState(false);
  const [successCode, setSuccessCode] = useState('');
  const [pdfProgress, setPdfProgress] = useState(false);

  // Restaurant Delivery Inputs
  const [restaurantServiceMode, setRestaurantServiceMode] = useState<'dine_in' | 'delivery'>('delivery');
  const [deliveryType, setDeliveryType] = useState<'spot' | 'address'>('spot');
  const [deliverySpot, setDeliverySpot] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Event inputs
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketTier, setTicketTier] = useState('Standard');

  const eventTiers = useMemo(() => {
    if (listing && listing.category === 'event') {
      const m = listing.metadata as EventMetadata;
      return m.ticket_types || [{ name: 'Standard', price_dzd: listing.price_dzd, quantity: 100 }];
    }
    return [];
  }, [listing]);

  const selectedTierPrice = useMemo(() => {
    if (listing && listing.category === 'event') {
      const tier = eventTiers.find((t) => t.name.toLowerCase() === ticketTier.toLowerCase());
      return tier ? tier.price_dzd : listing.price_dzd;
    }
    return listing ? listing.price_dzd : 0;
  }, [listing, ticketTier, eventTiers]);

  const catDef = useMemo(() => (listing ? getCategoryDef(listing.category) : null), [listing]);

  const unitPrice = listing?.category === 'event' ? selectedTierPrice : (price ? parseInt(price, 10) : listing?.price_dzd || 0);
  const quantity = listing?.category === 'event' ? ticketQuantity : (qty ? parseInt(qty, 10) : 1);
  const subtotal = unitPrice * quantity;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  if (!listing || !catDef) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
          <Text style={styles.notFoundText}>Listing not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const handleConfirm = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      showToast('Please fill in your name and phone', 'info');
      return;
    }

    if (listing.category === 'restaurant' && restaurantServiceMode === 'delivery') {
      if (deliveryType === 'spot' && !deliverySpot.trim()) {
        showToast('Please enter your beach spot ID', 'info');
        return;
      }
      if (deliveryType === 'address' && !deliveryAddress.trim()) {
        showToast('Please enter a delivery address', 'info');
        return;
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    const code = `RL-${Math.floor(100000 + Math.random() * 900000)}`;
    setSuccessCode(code);

    const iconMap: Record<string, string> = {
      hotel: 'bed', restaurant: 'restaurant', beach: 'umbrella', rental: 'home',
      activity: 'bicycle', event: 'musical-notes', guide: 'map',
      photographer: 'camera', driver: 'car', experience: 'compass',
    };

    addBooking({
      type: listing.category,
      icon: iconMap[listing.category] || 'pricetag',
      iconFamily: 'Ionicons',
      color: catDef.color,
      title: listing.title,
      subtitle: `${listing.wilaya} · ${catDef.label}`,
      price: total,
      businessId: listing.provider_id,
      details: {
        payment_method: paymentMethod === 'chargily' ? 'Online' : 'Cash on arrival',
        contact_name: contactName,
        contact_phone: contactPhone,
        ...(notes ? { notes } : {}),
        wilaya: listing.wilaya,
        ...(listing.category === 'restaurant' ? {
          service_mode: restaurantServiceMode,
          delivery_type: restaurantServiceMode === 'delivery' ? deliveryType : 'none',
          delivery_destination: restaurantServiceMode === 'delivery' ? (deliveryType === 'spot' ? `Spot #${deliverySpot}` : deliveryAddress) : 'Dine-in Table',
        } : {}),
        ...(listing.category === 'event' ? {
          ticket_tier: ticketTier,
          ticket_quantity: ticketQuantity,
          ticket_code: code,
        } : {}),
      },
    });

    if (listing.category === 'driver' || listing.category === 'guide' || listing.category === 'photographer' || listing.category === 'experience') {
      const typeLabelMap: Record<string, string> = {
        driver: 'transfer',
        guide: 'expedition',
        photographer: 'photos',
        experience: 'expedition',
      };
      usePartnerDispatches.getState().addDispatch({
        jobType: typeLabelMap[listing.category] || 'expedition',
        title: `${listing.title} — Booking`,
        customerName: contactName,
        customerPhone: contactPhone,
        location: listing.wilaya,
        destination: listing.region,
        scheduledTime: 'Immediate',
        priceDZD: total,
        status: 'pending',
        metadata: { bookingCode: code },
      });
    }

    setLoading(false);
    hapticSuccess();
    setSuccess(true);
  };

  const handleDownloadPdf = async () => {
    if (pdfProgress) return;
    setPdfProgress(true);
    hapticLight();
    // Simulate generation of invoice
    await new Promise((r) => setTimeout(r, 1800));
    setPdfProgress(false);
    showToast('Simulated CCP/Invoice PDF downloaded!', 'success');
  };

  if (success) {
    // ─────────────────────────────────────────────
    // RENDER GORGEOUS SUCCESS TICKET PASS OVERLAY
    // ─────────────────────────────────────────────
    return (
      <View style={[styles.successRoot, { backgroundColor: colors.bg }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={[styles.successScroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Booking Confirmed! 🎉</Text>
          <Text style={[styles.successSub, { color: colors.muted }]}>
            Your reservation has been locked in the RIHLA marketplace.
          </Text>

          {/* Scannable Ticket Boarding Pass */}
          <View style={[styles.ticketPassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.ticketHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.ticketCatBadge, { backgroundColor: catDef.color }]}>
                <Ionicons name={catDef.icon as any} size={14} color="#FFF" />
                <Text style={styles.ticketCatText}>{catDef.label}</Text>
              </View>
              <Text style={[styles.ticketDateText, { color: colors.muted }]}>
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>

            <View style={styles.ticketBody}>
              <Text style={[styles.ticketTitle, { color: colors.text }]}>{listing.title}</Text>
              <Text style={[styles.ticketWilaya, { color: colors.muted }]}>{listing.wilaya}, Algeria</Text>

              <View style={styles.ticketInfoGrid}>
                <View style={styles.ticketInfoCol}>
                  <Text style={styles.ticketInfoLabel}>TRAVELER</Text>
                  <Text style={[styles.ticketInfoVal, { color: colors.text }]} numberOfLines={1}>{contactName}</Text>
                </View>
                <View style={styles.ticketInfoCol}>
                  <Text style={styles.ticketInfoLabel}>AMOUNT PAID</Text>
                  <Text style={[styles.ticketInfoVal, { color: colors.text }]}>{total.toLocaleString()} DA</Text>
                </View>
              </View>

              {listing.category === 'restaurant' && (
                <View style={[styles.ticketMetaSection, { borderTopColor: colors.border }]}>
                  <Text style={styles.ticketInfoLabel}>DELIVERY INSTRUCTIONS</Text>
                  <Text style={[styles.ticketInfoVal, { color: RIHLA.accent }]}>
                    {restaurantServiceMode === 'delivery'
                      ? (deliveryType === 'spot' ? `Spot delivery: Umbrella #${deliverySpot}` : `Address: ${deliveryAddress}`)
                      : 'Dine-in Reservation'}
                  </Text>
                </View>
              )}

              {listing.category === 'event' && (
                <View style={[styles.ticketMetaSection, { borderTopColor: colors.border }]}>
                  <Text style={styles.ticketInfoLabel}>TICKET DETAILS</Text>
                  <Text style={[styles.ticketInfoVal, { color: RIHLA.accent }]}>
                    {ticketTier} Tier × {ticketQuantity}
                  </Text>
                </View>
              )}
            </View>

            {/* Scannable Barcode */}
            <View style={[styles.ticketBarcodeArea, { borderTopColor: colors.border }]}>
              <MockBarcode code={successCode} />
            </View>
          </View>

          {/* Action Row */}
          <View style={styles.successActions}>
            <Pressable
              style={[styles.pdfBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleDownloadPdf}
              disabled={pdfProgress}
            >
              {pdfProgress ? (
                <ActivityIndicator size="small" color={RIHLA.primary} />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={18} color={colors.text} />
                  <Text style={[styles.pdfBtnText, { color: colors.text }]}>Download PDF Receipt</Text>
                </>
              )}
            </Pressable>

            <UberButton
              title="Go to Trips"
              onPress={() => router.replace('/(tabs)/trips' as any)}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.bg }]}>
        <Pressable style={styles.backBtn} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
          <Text style={styles.headerSub}>Complete your booking</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* ── LISTING SUMMARY ── */}
        <View style={[styles.listingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.listingIcon, { backgroundColor: catDef.color + '15' }]}>
            <Ionicons name={catDef.icon as any} size={24} color={catDef.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={1}>{listing.title}</Text>
            <Text style={styles.listingCat}>{catDef.label} · {listing.wilaya}</Text>
            <View style={styles.listingRating}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={[styles.listingRatingText, { color: colors.text }]}>{listing.rating}</Text>
            </View>
          </View>
        </View>

        {/* ── DESTINATION MAP ── */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: colors.text }]}>Location</Text>
          <MapWithDirections
            height={160}
            markers={[{
              id: listing.id,
              latitude: listing.coordinates.latitude,
              longitude: listing.coordinates.longitude,
              title: listing.title,
              subtitle: listing.wilaya,
              category: listing.category,
              rating: listing.rating,
              priceDZD: listing.price_dzd,
            }]}
            showDirections={false}
            showUserLocation={true}
            initialCenter={[listing.coordinates.longitude, listing.coordinates.latitude]}
            initialZoom={15}
          />
        </View>

        {/* ── BOOKING FORM ── */}
        {listing.category === 'restaurant' ? (
          <RestaurantBookingForm
            listing={listing}
            serviceMode={restaurantServiceMode}
            setServiceMode={setRestaurantServiceMode}
            deliveryType={deliveryType}
            setDeliveryType={setDeliveryType}
            deliverySpot={deliverySpot}
            setDeliverySpot={setDeliverySpot}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
          />
        ) : listing.category === 'event' ? (
          <EventBookingForm
            listing={listing}
            ticketQuantity={ticketQuantity}
            setTicketQuantity={setTicketQuantity}
            ticketTier={ticketTier}
            setTicketTier={setTicketTier}
            eventTiers={eventTiers}
          />
        ) : (
          <BookingForm listing={listing} />
        )}

        {/* ── CONTACT INFO ── */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: colors.text }]}>Contact Information</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="person-outline" size={18} color={colors.muted} />
            <TextInput style={[styles.input, { color: colors.text }]} placeholder="Your full name" placeholderTextColor={colors.muted} value={contactName} onChangeText={setContactName} />
          </View>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="call-outline" size={18} color={colors.muted} />
            <TextInput style={[styles.input, { color: colors.text }]} placeholder="+213 5XX XXX XXX" placeholderTextColor={colors.muted} value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
          </View>
          <View style={[styles.inputGroup, { height: 80, alignItems: 'flex-start', paddingTop: 14, backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.muted} style={{ marginTop: 2 }} />
            <TextInput style={[styles.input, { height: 60, color: colors.text }]} placeholder="Special requests (optional)" placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
          </View>
        </View>

        {/* ── PAYMENT METHOD ── */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: colors.text }]}>Payment Method</Text>
          <PaymentMethod selected={paymentMethod} onSelect={setPaymentMethod} />
        </View>

        {/* ── PRICE BREAKDOWN ── */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: colors.text }]}>Price Breakdown</Text>
          <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{catDef.label} × {quantity}</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{subtotal.toLocaleString()} DZD</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee (5%)</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{serviceFee.toLocaleString()} DZD</Text>
            </View>
            <View style={[styles.priceDivider, { backgroundColor: colors.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.priceTotal, { color: colors.text }]}>Total</Text>
              <Text style={[styles.priceTotalValue, { color: RIHLA.accent }]}>{total.toLocaleString()} DZD</Text>
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
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View>
          <Text style={styles.bottomPrice}>{total.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>Total · {paymentMethod === 'chargily' ? 'Online payment' : 'Pay on arrival'}</Text>
        </View>
        <UberButton
          title="Confirm Booking"
          bgVariant="secondary"
          onPress={handleConfirm}
          loading={loading}
          style={{ paddingHorizontal: 24, paddingVertical: 16, minWidth: 140 }}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// COMPONENT SELECTOR HELPER
// ─────────────────────────────────────────────

function BookingForm({ listing }: { listing: Listing }) {
  switch (listing.category) {
    case 'hotel': return <HotelBookingForm listing={listing} />;
    case 'beach': return <BeachBookingForm listing={listing} />;
    case 'rental': return <RentalBookingForm listing={listing} />;
    case 'activity': return <ActivityBookingForm listing={listing} />;
    case 'guide': return <GuideBookingForm listing={listing} />;
    case 'photographer': return <PhotographerBookingForm listing={listing} />;
    case 'driver': return <DriverBookingForm listing={listing} />;
    case 'experience': return <ExperienceBookingForm listing={listing} />;
    default: return null;
  }
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const useStyles = () => {
  const { colors, isDark } = useTheme();
  return useMemo(() => StyleSheet.create({
    root: { flex: 1 },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: colors.muted },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: RIHLA.accent, alignItems: 'center', justifyContent: 'center' },
    headerCenter: { flex: 1 },
    headerTitle: { fontSize: 18, fontFamily: 'mon-b' },
    headerSub: { fontSize: 12, fontFamily: 'mon', color: colors.muted },
    listingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 8, borderRadius: 14, borderWidth: 1, padding: 14 },
    listingIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    listingTitle: { fontSize: 15, fontFamily: 'mon-b' },
    listingCat: { fontSize: 12, fontFamily: 'mon', color: colors.muted, marginTop: 2 },
    listingRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    listingRatingText: { fontSize: 12, fontFamily: 'mon-sb' },
    formSection: { paddingHorizontal: 20, paddingTop: 18 },
    formLabel: { fontSize: 14, fontFamily: 'mon-b', marginBottom: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
    detailText: { fontSize: 13, fontFamily: 'mon', color: colors.muted, flex: 1 },
    detailBold: { fontFamily: 'mon-sb', color: colors.text },
    inputGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, height: 50, marginBottom: 8 },
    input: { flex: 1, fontSize: 14, fontFamily: 'mon' },
    payList: { gap: 8 },
    payCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, padding: 14 },
    paySelected: { borderColor: RIHLA.accent, backgroundColor: isDark ? colors.card : '#F0FDFA' },
    payEmoji: { fontSize: 24 },
    payLabel: { fontSize: 14, fontFamily: 'mon-b', color: colors.text },
    payDesc: { fontSize: 11, fontFamily: 'mon', color: colors.muted },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: RIHLA.accent },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: RIHLA.accent },
    priceCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceLabel: { fontSize: 13, fontFamily: 'mon', color: colors.muted },
    priceValue: { fontSize: 13, fontFamily: 'mon-sb' },
    priceDivider: { height: 1, marginVertical: 4 },
    priceTotal: { fontSize: 15, fontFamily: 'mon-b' },
    priceTotalValue: { fontSize: 18, fontFamily: 'mon-b' },
    trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    trustText: { fontSize: 11, fontFamily: 'mon-sb', color: colors.muted },
    bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
    bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.accent },
    bottomUnit: { fontSize: 11, fontFamily: 'mon', color: colors.muted },

    // Tabs for dine-in/delivery mode
    tabSelectorRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    tabSelectorBtn: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: RIHLA.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    tabSelectorActive: {
      backgroundColor: RIHLA.accent,
    },
    tabSelectorText: {
      fontSize: 13,
      fontFamily: 'mon-sb',
      color: RIHLA.accent,
    },
    tabSelectorTextActive: {
      color: '#FFF',
    },
    subTabSelectorRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
      padding: 4,
      borderRadius: 8,
      marginBottom: 10,
    },
    subTabBtn: {
      flex: 1,
      paddingVertical: 6,
      alignItems: 'center',
      borderRadius: 6,
    },
    subTabActive: {
      backgroundColor: '#FFF',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    subTabText: {
      fontSize: 12,
      fontFamily: 'mon-sb',
      color: colors.muted,
    },
    subTabTextActive: {
      color: '#000',
    },
    deliveryDetailsBlock: {
      gap: 6,
    },
    dineInBlock: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#FEF3C7',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dineInText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'mon-sb',
      color: '#D97706',
    },

    // Ticket Selection
    tierGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    tierCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 12,
      alignItems: 'center',
      gap: 4,
    },
    tierCardActive: {
      borderColor: RIHLA.accent,
    },
    tierName: {
      fontSize: 13,
      fontFamily: 'mon-b',
    },
    tierPrice: {
      fontSize: 14,
      fontFamily: 'mon-b',
      color: RIHLA.accent,
    },
    qtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 16,
    },
    qtyBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyValue: {
      fontSize: 18,
      fontFamily: 'mon-b',
      minWidth: 20,
      textAlign: 'center',
    },

    // Success Screen Layout
    successRoot: {
      flex: 1,
    },
    successScroll: {
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    successIconWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    successTitle: {
      fontSize: 22,
      fontFamily: 'mon-b',
      textAlign: 'center',
      marginBottom: 8,
    },
    successSub: {
      fontSize: 14,
      fontFamily: 'mon',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 28,
    },
    ticketPassCard: {
      width: '100%',
      borderRadius: 24,
      borderWidth: 1.5,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      marginBottom: 32,
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    ticketCatBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    ticketCatText: {
      color: '#FFF',
      fontSize: 11,
      fontFamily: 'mon-b',
    },
    ticketDateText: {
      fontSize: 12,
      fontFamily: 'mon-sb',
    },
    ticketBody: {
      padding: 20,
    },
    ticketTitle: {
      fontSize: 18,
      fontFamily: 'mon-b',
    },
    ticketWilaya: {
      fontSize: 13,
      fontFamily: 'mon',
      marginTop: 2,
    },
    ticketInfoGrid: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 20,
    },
    ticketInfoCol: {
      flex: 1,
      gap: 4,
    },
    ticketInfoLabel: {
      fontSize: 9,
      fontFamily: 'mon-b',
      color: colors.muted,
      letterSpacing: 0.5,
    },
    ticketInfoVal: {
      fontSize: 13,
      fontFamily: 'mon-sb',
    },
    ticketMetaSection: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 0.5,
      gap: 4,
    },
    ticketBarcodeArea: {
      alignItems: 'center',
      padding: 16,
      borderTopWidth: 1,
      borderStyle: 'dashed',
      backgroundColor: '#FAFAFA',
    },
    barcodeBox: {
      alignItems: 'center',
      gap: 6,
    },
    barcodeText: {
      fontSize: 10,
      fontFamily: 'mon',
      letterSpacing: 3,
      color: '#334155',
    },
    successActions: {
      width: '100%',
      gap: 8,
    },
    pdfBtn: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    pdfBtnText: {
      fontSize: 14,
      fontFamily: 'mon-sb',
    },
  }), [colors, isDark]);
};
