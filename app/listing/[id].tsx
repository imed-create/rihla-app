/**
 * RIHLA — Listing Detail Screen
 * ---------------------------------
 * Polymorphic dispatcher: reads listing.category and renders the
 * correct interaction UI module (calendar, menu, grid, queue, etc.)
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SAHEL } from '@/constants/Colors';
import { getListingById } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { getListingUIConfig } from '@/types/listing';
import type {
  Listing,
  HotelMetadata,
  RestaurantMetadata,
  BeachMetadata,
  ActivityMetadata,
  EventMetadata,
  GuideMetadata,
  PhotographerMetadata,
  DriverMetadata,
  ExperienceMetadata,
  RentalMetadata,
} from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');

  if (!listing) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <TouchableOpacity style={styles.backCircle} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={SAHEL.dark} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const catDef = getCategoryDef(listing.category);
  const uiConfig = getListingUIConfig(listing.category);

  return (
    <View style={[styles.root, { backgroundColor: SAHEL.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* ── HERO IMAGE ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={[catDef.color + 'CC', SAHEL.primary]} style={styles.hero}>
            <View style={styles.heroNav}>
              <TouchableOpacity style={styles.backCircle} onPress={() => safeGoBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.actionCircle} onPress={() => {}}>
                  <Ionicons name="share-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionCircle}
                  onPress={() => { hapticLight(); toggleFavorite(listing.id); }}
                >
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.heroContent}>
              <View style={[styles.catBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name={catDef.icon as any} size={14} color="#fff" />
                <Text style={styles.catBadgeText}>{catDef.label}</Text>
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

        {/* ── PRICE + ACTION BAR ── */}
        <View style={styles.priceBar}>
          <View>
            <Text style={styles.priceValue}>{listing.price_dzd.toLocaleString()} DZD</Text>
            <Text style={styles.priceUnit}>{getPriceUnit(listing.category)}</Text>
          </View>
          <View style={styles.heroRating}>
            {listing.is_featured && (
              <View style={styles.featPill}>
                <Ionicons name="star" size={12} color={SAHEL.highlight} />
                <Text style={styles.featText}>Featured</Text>
              </View>
            )}
            {listing.is_vip && (
              <View style={[styles.featPill, { backgroundColor: SAHEL.highlight + '20' }]}>
                <Text style={styles.featText}>VIP</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── DESCRIPTION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* ── CATEGORY-SPECIFIC INFO ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoGrid}>
            <CategorySpecificInfo listing={listing} />
          </View>
        </View>

        {/* ── TAGS ── */}
        {listing.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {listing.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── REVIEWS PREVIEW ── */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <Ionicons name="star" size={18} color="#FFD166" />
            <Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text>
          </View>
          <View style={styles.reviewPlaceholder}>
            <Text style={styles.reviewPlaceholderText}>Reviews will appear here once connected to Supabase</Text>
          </View>
        </View>

        {/* ── MAP PREVIEW (placeholder) ── */}
        {uiConfig.show_map_preview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={32} color={SAHEL.mutedText} />
              <Text style={styles.mapPlaceholderText}>{listing.wilaya}, Algeria</Text>
              <Text style={styles.mapCoord}>
                {listing.coordinates.latitude.toFixed(4)}, {listing.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── STICKY BOTTOM BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomPrice}>{listing.price_dzd.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>{getPriceUnit(listing.category)}</Text>
        </View>
        <Pressable
          style={styles.bookBtn}
          onPress={() => {
            hapticSuccess();
            router.push(`/checkout/${listing.id}?price=${listing.price_dzd}` as any);
          }}
        >
          <Text style={styles.bookBtnText}>{uiConfig.primary_action_label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Category-specific info panels ──
function CategorySpecificInfo({ listing }: { listing: Listing }) {
  const m = listing.metadata;

  switch (m.kind) {
    case 'hotel':
      return (
        <>
          <InfoRow icon="bed-outline" label="Rooms" value={`${(m as HotelMetadata).room_count} rooms`} />
          <InfoRow icon="time-outline" label="Check-in" value={(m as HotelMetadata).check_in_time} />
          <InfoRow icon="time-outline" label="Check-out" value={(m as HotelMetadata).check_out_time} />
          <InfoRow icon="restaurant-outline" label="Breakfast" value={(m as HotelMetadata).breakfast_included ? 'Included' : 'Not included'} />
          <InfoRow icon="star-outline" label="Stars" value={'⭐'.repeat((m as HotelMetadata).star_rating)} />
          <InfoRow icon="layers-outline" label="Room types" value={(m as HotelMetadata).room_types.join(', ')} />
        </>
      );
    case 'restaurant':
      return (
        <>
          <InfoRow icon="restaurant-outline" label="Cuisine" value={(m as RestaurantMetadata).cuisine_types.join(', ')} />
          <InfoRow icon="time-outline" label="Hours" value={(m as RestaurantMetadata).opening_hours} />
          <InfoRow icon="people-outline" label="Seating" value={`${(m as RestaurantMetadata).seating_capacity} seats`} />
          <InfoRow icon="bicycle-outline" label="Delivery" value={(m as RestaurantMetadata).delivery_available ? 'Available' : 'Dine-in only'} />
        </>
      );
    case 'beach':
      return (
        <>
          <InfoRow icon="grid-outline" label="Grid" value={`${(m as BeachMetadata).total_rows}×${(m as BeachMetadata).total_cols}`} />
          <InfoRow icon="flag-outline" label="Zone" value={(m as BeachMetadata).zone} />
          <InfoRow icon="timer-outline" label="Hold" value={`${(m as BeachMetadata).hold_duration_minutes} min`} />
          <InfoRow icon="pricetag-outline" label="Per spot" value={`${(m as BeachMetadata).price_per_spot_dzd} DZD`} />
        </>
      );
    case 'rental':
      return (
        <>
          <InfoRow icon="bed-outline" label="Bedrooms" value={String((m as RentalMetadata).bedrooms)} />
          <InfoRow icon="water-outline" label="Bathrooms" value={String((m as RentalMetadata).bathrooms)} />
          <InfoRow icon="people-outline" label="Max guests" value={String((m as RentalMetadata).max_guests)} />
          <InfoRow icon="home-outline" label="Type" value={(m as RentalMetadata).property_type} />
          <InfoRow icon="layers-outline" label="Amenities" value={(m as RentalMetadata).amenities.join(', ')} />
        </>
      );
    case 'activity':
      return (
        <>
          <InfoRow icon="time-outline" label="Duration" value={`${(m as ActivityMetadata).session_duration_minutes} min`} />
          <InfoRow icon="people-outline" label="Max group" value={`${(m as ActivityMetadata).max_participants} people`} />
          <InfoRow icon="speedometer-outline" label="Difficulty" value={(m as ActivityMetadata).difficulty} />
          <InfoRow icon="construct-outline" label="Equipment" value={(m as ActivityMetadata).equipment_included ? 'Included' : 'Bring your own'} />
        </>
      );
    case 'event':
      return (
        <>
          <InfoRow icon="calendar-outline" label="Date" value={(m as EventMetadata).event_date} />
          <InfoRow icon="time-outline" label="Time" value={`${(m as EventMetadata).start_time} – ${(m as EventMetadata).end_time}`} />
          <InfoRow icon="location-outline" label="Venue" value={(m as EventMetadata).venue} />
          <InfoRow icon="ticket-outline" label="Capacity" value={`${(m as EventMetadata).total_capacity} tickets`} />
        </>
      );
    case 'guide':
      return (
        <>
          <InfoRow icon="globe-outline" label="Languages" value={(m as GuideMetadata).languages.join(', ')} />
          <InfoRow icon="time-outline" label="Experience" value={`${(m as GuideMetadata).experience_years} years`} />
          <InfoRow icon="people-outline" label="Group size" value={`Up to ${(m as GuideMetadata).max_group_size}`} />
          <InfoRow icon="school-outline" label="Specialization" value={(m as GuideMetadata).specialization} />
        </>
      );
    case 'photographer':
      return (
        <>
          <InfoRow icon="color-palette-outline" label="Style" value={(m as PhotographerMetadata).style.join(', ')} />
          <InfoRow icon="time-outline" label="Turnaround" value={`${(m as PhotographerMetadata).turnaround_days} days`} />
          <InfoRow icon="airplane-outline" label="Drone" value={(m as PhotographerMetadata).drone_available ? 'Available' : 'No'} />
        </>
      );
    case 'driver':
      return (
        <>
          <InfoRow icon="car-outline" label="Vehicle" value={(m as DriverMetadata).vehicle_name} />
          <InfoRow icon="pricetag-outline" label="Per km" value={`${(m as DriverMetadata).price_per_km_dzd} DZD`} />
          <InfoRow icon="airplane-outline" label="Airport" value={(m as DriverMetadata).airport_transfer ? 'Available' : 'No'} />
        </>
      );
    case 'experience':
      return (
        <>
          <InfoRow icon="calendar-outline" label="Duration" value={`${(m as ExperienceMetadata).duration_days} days`} />
          <InfoRow icon="people-outline" label="Group size" value={`Up to ${(m as ExperienceMetadata).max_group_size}`} />
          <InfoRow icon="speedometer-outline" label="Difficulty" value={(m as ExperienceMetadata).difficulty} />
          <InfoRow icon="checkmark-circle-outline" label="Includes" value={(m as ExperienceMetadata).inclusions.join(', ')} />
        </>
      );
    default:
      return null;
  }
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconWrap}>
        <Ionicons name={icon as any} size={16} color={SAHEL.primary} />
      </View>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function getPriceUnit(category: string): string {
  const units: Record<string, string> = {
    hotel: '/night', restaurant: '/meal', beach: '/spot', rental: '/night',
    activity: '/person', event: '/ticket', guide: '/day', photographer: '/session',
    driver: '/trip', experience: '/person',
  };
  return units[category] ?? '';
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: SAHEL.border },
  iconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: SAHEL.primary + '10', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label: { flex: 1, fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText },
  value: { fontSize: 13, fontFamily: 'mon-sb', color: SAHEL.dark, textAlign: 'right', maxWidth: '50%' },
});

const styles = StyleSheet.create({
  root: { flex: 1 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },

  // Hero
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 32, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 6 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  catBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

  // Price bar
  priceBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: SAHEL.border },
  priceValue: { fontSize: 22, fontFamily: 'mon-b', color: SAHEL.primary },
  priceUnit: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText },
  featPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: SAHEL.highlight + '20' },
  featText: { fontSize: 11, fontFamily: 'mon-b', color: SAHEL.highlight },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark, marginBottom: 10 },
  description: { fontSize: 14, fontFamily: 'mon', color: SAHEL.mutedText, lineHeight: 22 },

  // Info grid
  infoGrid: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 4, paddingHorizontal: 12 },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: SAHEL.primary + '10', borderWidth: 1, borderColor: SAHEL.primary + '20' },
  tagText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.primary },

  // Reviews
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewPlaceholder: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, padding: 20, alignItems: 'center' },
  reviewPlaceholderText: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText },

  // Map
  mapPlaceholder: { height: 140, borderRadius: 14, borderWidth: 1, borderColor: SAHEL.border, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', gap: 6 },
  mapPlaceholderText: { fontSize: 14, fontFamily: 'mon-sb', color: SAHEL.dark },
  mapCoord: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },

  // Bottom bar
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: SAHEL.border,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  bottomInfo: {},
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: SAHEL.primary },
  bottomUnit: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  bookBtn: { backgroundColor: SAHEL.primary, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14, shadowColor: SAHEL.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
