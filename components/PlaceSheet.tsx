/**
 * RIHLA — Universal Place Sheet
 * ─────────────────────────────
 * Adaptive bottom sheet overlay for any marketplace listing.
 * Implements premium details, swipeable photo carousel, DZD tiers,
 * and category-customized CTA button with haptic feedback.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Listing } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { showToast } from '@/components/Toast';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import PhotoCarousel from '@/components/shared/PhotoCarousel';
import { getListingGallery } from '@/utils/listingPhotos';

const { width: SCREEN_W } = Dimensions.get('window');

interface PlaceSheetProps {
  place: Listing;
  onClose: () => void;
  onBook: () => void;
  distance?: string;
}

export default function PlaceSheet({ place, onClose, onBook, distance }: PlaceSheetProps) {
  const { colors, isDark } = useTheme();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [descExpanded, setDescExpanded] = useState(false);

  const isFavorite = favoriteIds.includes(place.id);

  // Generate gallery photos
  const gallery = useMemo(
    () => getListingGallery(place.cover_image_url ?? '', place.category, 6),
    [place]
  );

  // Dynamic DZD pricing tier indicator (DZD, DZD DZD, DZD DZD DZD)
  const priceIndicator = useMemo(() => {
    const p = place.price_dzd;
    if (p < 2500) return 'DZD';
    if (p < 8000) return 'DZD · DZD';
    return 'DZD · DZD · DZD';
  }, [place.price_dzd]);

  // Dynamic CTA label per category
  const ctaLabel = useMemo(() => {
    switch (place.category) {
      case 'hotel':
        return 'Check Room Availability';
      case 'restaurant':
        return 'View Menu & Reserve';
      case 'beach':
        return 'Book a Spot';
      case 'rental':
        return 'Check Availability';
      case 'event':
        return 'Get Tickets';
      case 'guide':
        return 'Book This Guide';
      case 'experience':
        return 'Explore Itinerary';
      case 'driver':
        return 'Request Ride';
      case 'photographer':
        return 'View Portfolio & Book';
      default:
        return 'Book Now';
    }
  }, [place.category]);

  const ctaIcon = useMemo(() => {
    switch (place.category) {
      case 'hotel': return 'bed-outline';
      case 'restaurant': return 'restaurant-outline';
      case 'beach': return 'umbrella-outline';
      case 'rental': return 'home-outline';
      case 'event': return 'ticket-outline';
      case 'guide': return 'compass-outline';
      case 'experience': return 'sparkles-outline';
      case 'driver': return 'car-outline';
      case 'photographer': return 'camera-outline';
      default: return 'calendar-outline';
    }
  }, [place.category]);

  // Category Theme Color
  const catColor = useMemo(() => {
    switch (place.category) {
      case 'hotel': return '#1A6B3A';
      case 'restaurant': return '#C56A39';
      case 'beach': return '#00a896';
      case 'rental': return '#6C63FF';
      case 'activity': return '#E76F51';
      case 'event': return '#A855F7';
      case 'guide': return '#8B5E3C';
      case 'photographer': return '#FF499E';
      case 'driver': return '#0a2540';
      case 'experience': return '#f4a261';
      default: return RIHLA.primary;
    }
  }, [place.category]);

  // Mock Reviews
  const mockReviews = [
    { id: '1', author: 'Malik B.', text: 'Magnifique endroit ! Très bon service.', rating: 5 },
    { id: '2', author: 'Sofia K.', text: 'Propre, chaleureux, idéal pour les familles.', rating: 4 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Handlebar */}
      <View style={styles.handleBarRow}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title & Close */}
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{place.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={13} color={colors.muted} />
              <Text style={[styles.locationText, { color: colors.muted }]}>
                {place.region ? `${place.region}, ` : ''}{place.wilaya} · {distance || 'Nearby'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: isDark ? '#1C1C1E' : '#F1F5F9' }]}
            onPress={() => { hapticLight(); onClose(); }}
          >
            <Ionicons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Swipeable Photo Carousel */}
        <View style={styles.carouselContainer}>
          <PhotoCarousel photos={gallery} height={180} showCount />
        </View>

        {/* Details Row: Category, Rating, Price, Status */}
        <View style={styles.metaRow}>
          <View style={[styles.metaBadge, { backgroundColor: catColor + '15' }]}>
            <Text style={[styles.metaBadgeText, { color: catColor }]}>
              {place.category.toUpperCase()}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#FFD166" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{place.rating} ({place.review_count})</Text>
          </View>
          <Text style={[styles.priceTier, { color: colors.muted }]}>{priceIndicator}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>Open Now</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descBlock}>
          <Text
            style={[styles.description, { color: colors.muted }]}
            numberOfLines={descExpanded ? undefined : 2}
          >
            {place.description}
          </Text>
          <TouchableOpacity onPress={() => setDescExpanded(!descExpanded)}>
            <Text style={[styles.expandText, { color: RIHLA.accent }]}>
              {descExpanded ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features Chips (max 5) */}
        {place.tags && place.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {place.tags.slice(0, 5).map((tag, idx) => (
              <View key={idx} style={[styles.tagChip, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Reviews Preview */}
        <View style={styles.reviewsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
          {mockReviews.map((rev) => (
            <View key={rev.id} style={styles.reviewItem}>
              <View style={styles.reviewTop}>
                <Text style={[styles.reviewAuthor, { color: colors.text }]}>{rev.author}</Text>
                <View style={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={10}
                      color={i < rev.rating ? '#FFD166' : colors.border}
                    />
                  ))}
                </View>
              </View>
              <Text style={[styles.reviewText, { color: colors.muted }]} numberOfLines={1}>{rev.text}</Text>
            </View>
          ))}
        </View>

        {/* THE BIG CTA BUTTON */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: catColor }]}
          onPress={() => { hapticSuccess(); onBook(); }}
          activeOpacity={0.85}
        >
          <Ionicons name={ctaIcon as any} size={18} color="#FFFFFF" style={styles.ctaIcon} />
          <Text style={styles.ctaText}>{ctaLabel}</Text>
          <Text style={styles.ctaPrice}>· {place.price_dzd.toLocaleString()} DZD</Text>
        </TouchableOpacity>

        {/* Secondary actions: Save ♥ / Directions 📍 / Share 🔗 */}
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              hapticLight();
              toggleFavorite(place.id);
              showToast(isFavorite ? 'Removed from favorites' : 'Saved to favorites!', 'success');
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#FF499E' : colors.muted}
            />
            <Text style={[styles.actionText, { color: colors.muted }, isFavorite && { color: '#FF499E' }]}>
              {isFavorite ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              hapticLight();
              showToast('Opening directions in maps...', 'success');
            }}
          >
            <Ionicons name="navigate-outline" size={18} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.muted }]}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={async () => {
              hapticLight();
              try {
                await Share.share({
                  message: `Check out ${place.title} on RIHLA!\n${place.description}\nPrice: ${place.price_dzd.toLocaleString()} DZD`,
                });
              } catch { /* noop */ }
            }}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.muted} />
            <Text style={[styles.actionText, { color: colors.muted }]}>Share</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  handleBarRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'mon-b',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 9,
    fontFamily: 'mon-b',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  priceTier: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: '#10B981',
  },
  descBlock: {
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    fontFamily: 'mon',
    lineHeight: 18,
  },
  expandText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  reviewsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'mon-b',
    marginBottom: 8,
  },
  reviewItem: {
    marginBottom: 8,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewAuthor: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  reviewText: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  ctaBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 12,
  },
  ctaIcon: {
    marginRight: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  ctaPrice: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  actionBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
});
