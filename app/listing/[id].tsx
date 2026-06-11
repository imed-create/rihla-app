/**
 * RIHLA — Listing Detail Screen (Premium)
 * -----------------------------------------
 * Polymorphic dispatcher with photo carousel hero, star distribution,
 * and beautiful layout.
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
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
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import { getListingGallery, getCategoryHeroGradient } from '@/utils/listingPhotos';
import MapWithDirections from '@/components/shared/MapWithDirections';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');

  const gallery = useMemo(
    () => listing ? getListingGallery(listing.cover_image_url ?? '', listing.category, 6) : [],
    [listing],
  );

  if (!listing) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable style={styles.backCircle} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={22} color={RIHLA.dark} />
        </Pressable>
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
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* ── HERO PHOTO CAROUSEL ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <PhotoCarousel
            photos={gallery}
            height={380}
            showCount={true}
          />
          {/* Nav overlay */}
          <View style={[styles.heroNav, { top: topPad + 12 }]}>
            <Pressable style={styles.navCircle} onPress={() => safeGoBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.navRight}>
              <Pressable style={styles.navCircle} onPress={async () => {
                try {
                  await Share.share({
                    message: `Check out ${listing.title} on RIHLA! ${listing.price_dzd.toLocaleString()} DZD · ${listing.wilaya}`,
                  });
                } catch { /* noop */ }
              }}>
                <Ionicons name="share-outline" size={20} color="#fff" />
              </Pressable>
              <Pressable
                style={styles.navCircle}
                onPress={() => { hapticLight(); toggleFavorite(listing.id); }}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
              </Pressable>
            </View>
          </View>
          {/* Bottom gradient with title */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.heroGradient}>
            <View style={styles.heroOverlay}>
              <View style={[styles.catBadge, { backgroundColor: catDef.color }]}>
                <Ionicons name={catDef.icon as any} size={12} color="#fff" />
                <Text style={styles.catBadgeText}>{catDef.label}</Text>
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

        {/* ── PRICE BAR ── */}
        <View style={styles.priceBar}>
          <View>
            <Text style={styles.priceValue}>{listing.price_dzd.toLocaleString()} DZD</Text>
            <Text style={styles.priceUnit}>{getPriceUnit(listing.category)}</Text>
          </View>
          <View style={styles.priceBadges}>
            {listing.is_featured && (
              <View style={styles.featPill}>
                <Ionicons name="star" size={11} color={RIHLA.highlight} />
                <Text style={styles.featText}>Featured</Text>
              </View>
            )}
            {listing.is_vip && (
              <View style={[styles.featPill, { backgroundColor: RIHLA.highlight + '18' }]}>
                <Text style={[styles.featText, { color: RIHLA.highlight }]}>VIP</Text>
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
            <View style={styles.tagRow}>
              {listing.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── REVIEWS ── */}
        <View style={styles.section}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewBigRating}>
              <Text style={styles.reviewBigNumber}>{listing.rating}</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Guest Reviews</Text>
              <Text style={styles.reviewSub}>{listing.review_count} verified reviews</Text>
            </View>
          </View>

          {/* Star distribution */}
          <View style={styles.starDistribution}>
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
              return (
                <View key={star} style={styles.starRow}>
                  <Text style={styles.starLabel}>{star}</Text>
                  <Ionicons name="star" size={11} color="#FFD166" />
                  <View style={styles.starBar}>
                    <View style={[styles.starBarFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.starPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>

          {/* Review cards */}
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>{review.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.reviewNameRow}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    {review.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={11} color={RIHLA.accent} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.reviewStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={10} color="#FFD166" />
                    ))}
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        {/* ── MAP PREVIEW ── */}
        {uiConfig.show_map_preview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapWrap}>
              <MapWithDirections
                height={180}
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
                autoCalculateTimes={false}
                initialRegion={{
                  latitude: listing.coordinates.latitude,
                  longitude: listing.coordinates.longitude,
                  latitudeDelta: 0.06,
                  longitudeDelta: 0.06,
                }}
              />
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
        <Ionicons name={icon as any} size={16} color={RIHLA.accent} />
      </View>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const MOCK_REVIEWS = [
  { id: 'r1', name: 'Ahmed B.', avatar: 'A', date: '2 days ago', rating: 5, text: 'Amazing experience! The host was very welcoming and the place was exactly as described. Would definitely come back.', verified: true },
  { id: 'r2', name: 'Sarah M.', avatar: 'S', date: '1 week ago', rating: 4, text: 'Great location and clean facilities. The only minor issue was the WiFi speed, but overall a wonderful stay.', verified: true },
  { id: 'r3', name: 'Youcef K.', avatar: 'Y', date: '2 weeks ago', rating: 5, text: 'Perfect for our family trip. The kids loved it and we felt very safe. Highly recommended!', verified: false },
];

function getPriceUnit(category: string): string {
  const units: Record<string, string> = {
    hotel: '/night', restaurant: '/meal', beach: '/spot', rental: '/night',
    activity: '/person', event: '/ticket', guide: '/day', photographer: '/session',
    driver: '/trip', experience: '/person',
  };
  return units[category] ?? '';
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: RIHLA.border,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: RIHLA.accent + '10',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  label: { flex: 1, fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText },
  value: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.dark, textAlign: 'right', maxWidth: '50%' },
});

const styles = StyleSheet.create({
  root: { flex: 1 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },

  // Hero
  heroWrap: { position: 'relative' },
  heroNav: {
    position: 'absolute', left: 16, right: 16, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  navCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  navRight: { flexDirection: 'row', gap: 8 },
  heroGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
    justifyContent: 'flex-end',
  },
  heroOverlay: { paddingHorizontal: 20, paddingBottom: 14, gap: 3 },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    alignSelf: 'flex-start',
  },
  catBadgeText: { fontSize: 11, fontFamily: 'mon-b', color: '#fff' },
  heroTitle: { fontSize: 26, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocation: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: RIHLA.primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5,
  },
  ratingBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

  // Price bar
  priceBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: RIHLA.border,
  },
  priceValue: { fontSize: 22, fontFamily: 'mon-b', color: RIHLA.primary },
  priceUnit: { fontSize: 13, fontFamily: 'mon', color: RIHLA.mutedText },
  priceBadges: { flexDirection: 'row', gap: 6 },
  featPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: RIHLA.highlight + '18',
  },
  featText: { fontSize: 11, fontFamily: 'mon-b', color: RIHLA.highlight },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 17, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 10 },
  description: { fontSize: 14, fontFamily: 'mon', color: '#475569', lineHeight: 22 },

  // Info grid
  infoGrid: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: RIHLA.border, padding: 4, paddingHorizontal: 12,
  },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: RIHLA.accent + '08', borderWidth: 1, borderColor: RIHLA.accent + '15',
  },
  tagText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Reviews
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reviewBigRating: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: RIHLA.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  reviewBigNumber: { fontSize: 20, fontFamily: 'mon-b', color: '#fff' },
  reviewSub: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8' },
  starDistribution: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: RIHLA.border, padding: 12, marginBottom: 10 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  starLabel: { fontSize: 11, fontFamily: 'mon-b', color: '#475569', width: 12, textAlign: 'right' },
  starBar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  starBarFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFD166' },
  starPct: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8', width: 26, textAlign: 'right' },
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14, marginBottom: 8 },
  reviewCardHeader: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: RIHLA.primary + '12', alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.primary },
  reviewNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewerName: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.dark },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verifiedText: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.accent },
  reviewStarsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  reviewDate: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8', marginLeft: 4 },
  reviewText: { fontSize: 13, fontFamily: 'mon', color: '#475569', lineHeight: 20 },

  // Map
  mapWrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: RIHLA.border },

  // Bottom bar
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
    paddingHorizontal: 20, paddingTop: 14,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: RIHLA.border,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12,
  },
  bottomInfo: {},
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
  bottomUnit: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: {
    backgroundColor: RIHLA.accent, paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14,
    shadowColor: RIHLA.accent, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
