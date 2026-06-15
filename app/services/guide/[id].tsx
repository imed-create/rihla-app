/**
 * RIHLA — Dedicated Guide Screen
 * ──────────────────────────────
 * Works like Airbnb Experiences:
 * - Guide profile hero with photo, languages, specialty badges.
 * - Portfolio masonry grid.
 * - Tour types offered with per-tour booking CTAs.
 * - Reviews section & availability calendar.
 * - "Message Guide" + "Book This Tour" actions.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
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
import { showToast } from '@/components/Toast';

const { width: SCREEN_W } = Dimensions.get('window');

type TourType = {
  id: string;
  name: string;
  duration: string;
  groupSize: string;
  pricePP: number;
  highlights: string[];
};

export default function GuideServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const guide = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (guide ? getListingGallery(guide.cover_image_url ?? '', 'guide', 6) : []),
    [guide]
  );

  const [selectedTour, setSelectedTour] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('2026-07-05');

  if (!guide) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Guide not found</Text>
      </View>
    );
  }

  const tours: TourType[] = [
    {
      id: 't1',
      name: 'Heritage Walking Tour',
      duration: '3 hours',
      groupSize: 'Max 8 people',
      pricePP: guide.price_dzd,
      highlights: ['Ottoman architecture', 'Local street food tasting', 'Photo opportunities'],
    },
    {
      id: 't2',
      name: 'Full-Day Adventure',
      duration: '8 hours',
      groupSize: 'Max 6 people',
      pricePP: Math.round(guide.price_dzd * 2.5),
      highlights: ['Mountain trails & gorges', 'Traditional lunch included', 'Waterfall visit'],
    },
    {
      id: 't3',
      name: 'Sunset & Night Culture',
      duration: '4 hours',
      groupSize: 'Max 10 people',
      pricePP: Math.round(guide.price_dzd * 1.4),
      highlights: ['Best sunset viewpoints', 'Evening street culture', 'Tea ceremony'],
    },
  ];

  const handleBookTour = (tour: TourType) => {
    hapticSuccess();
    addBooking({
      type: 'guide',
      title: guide.title,
      subtitle: `${tour.name} · ${tour.duration}`,
      price: tour.pricePP,
      businessId: guide.provider_id,
      icon: 'compass',
      iconFamily: 'Ionicons',
      color: '#8B5E3C',
      details: {
        tour_name: tour.name,
        duration: tour.duration,
        group_size: tour.groupSize,
        date: selectedDate,
        price_per_person: `${tour.pricePP.toLocaleString()} DZD`,
      },
    });

    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'guide',
        title: guide.title,
        subtitle: `${tour.name} · ${tour.duration}`,
        price: String(tour.pricePP),
      },
    });
  };

  const languages = ['Arabic', 'French', 'English', 'Tamazight'];
  const specialties = ['History', 'Food & Culture', 'Nature & Adventure', 'Photography'];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Profile Hero */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: gallery[0] }} style={styles.heroImage} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroOverlay}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideName}>{guide.title}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#FFD166" />
                  <Text style={styles.ratingText}>{guide.rating} ({guide.review_count} reviews)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.container}>
          {/* Language Chips */}
          <View style={styles.chipSection}>
            <Text style={[styles.chipSectionTitle, { color: colors.muted }]}>LANGUAGES</Text>
            <View style={styles.chipRow}>
              {languages.map((lang) => (
                <View key={lang} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color="#8B5E3C" />
                  <Text style={[styles.chipText, { color: colors.text }]}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Specialty Badges */}
          <View style={styles.chipSection}>
            <Text style={[styles.chipSectionTitle, { color: colors.muted }]}>SPECIALTIES</Text>
            <View style={styles.chipRow}>
              {specialties.map((spec) => (
                <View key={spec} style={[styles.chip, { backgroundColor: 'rgba(139,94,60,0.08)', borderColor: 'rgba(139,94,60,0.2)' }]}>
                  <Ionicons name="ribbon-outline" size={12} color="#8B5E3C" />
                  <Text style={[styles.chipText, { color: '#8B5E3C' }]}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Guide</Text>
            <Text style={[styles.descText, { color: colors.muted }]}>{guide.description}</Text>
          </View>

          {/* Portfolio Masonry Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio</Text>
            <View style={styles.masonryGrid}>
              {gallery.slice(0, 6).map((photo, idx) => (
                <Image
                  key={idx}
                  source={{ uri: photo }}
                  style={[
                    styles.masonryImage,
                    idx % 3 === 0 ? styles.masonryLarge : styles.masonrySmall,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Tour Types */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Tours</Text>
            {tours.map((tour) => (
              <View key={tour.id} style={[styles.tourCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.tourHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tourName, { color: colors.text }]}>{tour.name}</Text>
                    <View style={styles.tourMetaRow}>
                      <Ionicons name="time-outline" size={12} color={colors.muted} />
                      <Text style={[styles.tourMeta, { color: colors.muted }]}>{tour.duration}</Text>
                      <Ionicons name="people-outline" size={12} color={colors.muted} style={{ marginLeft: 8 }} />
                      <Text style={[styles.tourMeta, { color: colors.muted }]}>{tour.groupSize}</Text>
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.tourPrice, { color: colors.text }]}>
                      {tour.pricePP.toLocaleString()} DZD
                    </Text>
                    <Text style={[styles.tourPriceUnit, { color: colors.muted }]}>/person</Text>
                  </View>
                </View>

                <View style={[styles.tourHighlights, { borderTopColor: colors.border }]}>
                  {tour.highlights.map((hl, i) => (
                    <View key={i} style={styles.highlightRow}>
                      <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                      <Text style={[styles.highlightText, { color: colors.muted }]}>{hl}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.bookTourBtn}
                  onPress={() => handleBookTour(tour)}
                >
                  <Text style={styles.bookTourBtnText}>Book This Tour</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Reviews Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Guest Reviews</Text>
            {[
              { name: 'Amina', text: 'Incredible knowledge of the area. We learned so much about the history and culture!', rating: 5 },
              { name: 'Marc', text: 'Very friendly and professional. Perfectly spoke French and English.', rating: 5 },
            ].map((rev, idx) => (
              <View key={idx} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarLetter}>{rev.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>{rev.name}</Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons key={i} name="star" size={10} color={i < rev.rating ? '#FFD166' : colors.border} />
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={[styles.reviewBody, { color: colors.muted }]}>{rev.text}</Text>
              </View>
            ))}
          </View>

          {/* Message Guide Button */}
          <TouchableOpacity
            style={[styles.messageBtn, { borderColor: colors.border }]}
            onPress={() => { hapticLight(); showToast('Messaging feature coming soon!', 'success'); }}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.text} />
            <Text style={[styles.messageBtnText, { color: colors.text }]}>Message Guide</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: 220 },
  backBtn: {
    position: 'absolute', left: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,37,64,0.85)', padding: 16,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#8B5E3C',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF',
  },
  avatarLetter: { color: '#FFF', fontSize: 20, fontFamily: 'mon-b' },
  guideName: { fontSize: 18, fontFamily: 'mon-b', color: '#FFF' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.85)' },

  container: { padding: 16 },

  chipSection: { marginBottom: 16 },
  chipSectionTitle: { fontSize: 10, fontFamily: 'mon-b', letterSpacing: 0.5, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontFamily: 'mon-sb' },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10 },
  descText: { fontSize: 13, fontFamily: 'mon', lineHeight: 20 },

  // Masonry
  masonryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  masonryImage: { borderRadius: 12 },
  masonryLarge: { width: SCREEN_W - 32, height: 160 },
  masonrySmall: { width: (SCREEN_W - 32 - 6) / 2, height: 120 },

  // Tour cards
  tourCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 10 },
  tourHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tourName: { fontSize: 14, fontFamily: 'mon-b' },
  tourMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  tourMeta: { fontSize: 11, fontFamily: 'mon' },
  tourPrice: { fontSize: 15, fontFamily: 'mon-b', textAlign: 'right' },
  tourPriceUnit: { fontSize: 10, fontFamily: 'mon', textAlign: 'right' },
  tourHighlights: { borderTopWidth: 0.5, paddingTop: 8, gap: 4 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightText: { fontSize: 11, fontFamily: 'mon' },
  bookTourBtn: {
    height: 42, backgroundColor: '#8B5E3C', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  bookTourBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'mon-b' },

  // Reviews
  reviewCard: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#8B5E3C20',
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarLetter: { fontSize: 13, fontFamily: 'mon-b', color: '#8B5E3C' },
  reviewerName: { fontSize: 12, fontFamily: 'mon-b' },
  starsRow: { flexDirection: 'row', gap: 1, marginTop: 2 },
  reviewBody: { fontSize: 12, fontFamily: 'mon', lineHeight: 18 },

  // Message CTA
  messageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, borderRadius: 12, borderWidth: 1.5, marginTop: 20,
  },
  messageBtnText: { fontSize: 14, fontFamily: 'mon-b' },
});
