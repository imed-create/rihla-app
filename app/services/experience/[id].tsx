/**
 * RIHLA — Dedicated Experience Screen
 * ──────────────────────────────
 * - Experience banner with host details & rating.
 * - Overview stats: Duration, Difficulty level, Age group, Group size.
 * - Bento-grid "What is Included" (Transport, Equipment, Meal, Tickets).
 * - Immersive Timeline / Itinerary walkthrough (e.g. Stop 1, Stop 2).
 * - Interactive Ticket Booking: quantity selector, live price calculation, date picker.
 * - Fully integrated with AppContext context state & router navigation.
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

export default function ExperienceServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const experience = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (experience ? getListingGallery(experience.cover_image_url ?? '', 'experience', 6) : []),
    [experience]
  );

  const [date, setDate] = useState('2026-07-12');
  const [guests, setGuests] = useState(1);

  if (!experience) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Experience not found</Text>
      </View>
    );
  }

  // Derived price calculation
  const basePrice = experience.price_dzd;
  const totalPrice = basePrice * guests;

  const handleBook = () => {
    hapticSuccess();
    addBooking({
      type: 'experience',
      title: experience.title,
      subtitle: `${guests} ${guests === 1 ? 'Guest' : 'Guests'} · ${date}`,
      price: totalPrice,
      businessId: experience.provider_id,
      icon: 'adventure', // mapped from category
      iconFamily: 'Ionicons',
      color: '#10B981', // green accent for eco/nature experiences
      details: {
        date: date,
        guests: String(guests),
        price_per_guest: `${basePrice.toLocaleString()} DZD`,
        total_price: `${totalPrice.toLocaleString()} DZD`,
        difficulty: 'Moderate',
        duration: '6 Hours',
      },
    });

    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'experience',
        title: experience.title,
        subtitle: `${guests} ${guests === 1 ? 'Guest' : 'Guests'} · ${date}`,
        price: String(totalPrice),
      },
    });
  };

  const handleIncrement = () => {
    hapticLight();
    if (guests < 10) setGuests(g => g + 1);
  };

  const handleDecrement = () => {
    hapticLight();
    if (guests > 1) setGuests(g => g - 1);
  };

  // Static itinerary elements for the timeline
  const itinerary = [
    { title: 'Meeting & Welcome', desc: 'Gather at main square, meet the local host, safety briefing & gear check.', time: '09:00 AM' },
    { title: 'The Scenic Trail Trek', desc: 'Ascend through pine forests with spectacular photo stops overlooking the gorge.', time: '10:30 AM' },
    { title: 'Traditional Berber Lunch', desc: 'Savor organic local dishes cooked on fire wood inside a historic village.', time: '01:30 PM' },
    { title: 'Valley Waterfall Exploration', desc: 'Short descent to refresh near the waterfalls, group photography and relaxation.', time: '03:00 PM' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Cover Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: gallery[0] }} style={styles.heroImg} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.heroOverlay}>
            <Text style={styles.experienceTitle}>{experience.title}</Text>
            <View style={styles.hostRow}>
              <View style={styles.hostAvatar}>
                <Ionicons name="person-circle-outline" size={16} color="#FFF" />
              </View>
              <Text style={styles.hostName}>Hosted by Local Guide</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFD166" />
                <Text style={styles.ratingText}>{experience.rating} ({experience.review_count})</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Key Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time" size={20} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>6 Hours</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Duration</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="speedometer" size={20} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>Moderate</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Difficulty</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="people" size={20} color="#10B981" />
              <Text style={[styles.statValue, { color: colors.text }]}>Max 12</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Group Size</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>The Experience</Text>
            <Text style={[styles.descText, { color: colors.muted }]}>{experience.description}</Text>
          </View>

          {/* What's Included (Bento Cards) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What is Included</Text>
            <View style={styles.bentoWrap}>
              <View style={[styles.bentoMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="restaurant" size={18} color="#10B981" />
                <Text style={[styles.bentoTitle, { color: colors.text }]}>Meal & Drink</Text>
                <Text style={[styles.bentoDesc, { color: colors.muted }]}>Organic lunch, mineral water, and tea.</Text>
              </View>
              <View style={[styles.bentoMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="bus" size={18} color="#10B981" />
                <Text style={[styles.bentoTitle, { color: colors.text }]}>Transportation</Text>
                <Text style={[styles.bentoDesc, { color: colors.muted }]}>SUV pick-up from city center & return.</Text>
              </View>
              <View style={[styles.bentoMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                <Text style={[styles.bentoTitle, { color: colors.text }]}>Safety Gear</Text>
                <Text style={[styles.bentoDesc, { color: colors.muted }]}>Trekking poles & custom first aid kit.</Text>
              </View>
              <View style={[styles.bentoMiniCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="images" size={18} color="#10B981" />
                <Text style={[styles.bentoTitle, { color: colors.text }]}>Photo Album</Text>
                <Text style={[styles.bentoDesc, { color: colors.muted }]}>High quality photos from the host.</Text>
              </View>
            </View>
          </View>

          {/* Detailed Timeline Itinerary */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Itinerary</Text>
            <View style={styles.timelineContainer}>
              {itinerary.map((step, idx) => (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineIndicator}>
                    <View style={styles.timelineDot} />
                    {idx < itinerary.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timeHeader}>
                      <Text style={[styles.timelineTime, { color: '#10B981' }]}>{step.time}</Text>
                      <Text style={[styles.timelineStepTitle, { color: colors.text }]}>{step.title}</Text>
                    </View>
                    <Text style={[styles.timelineStepDesc, { color: colors.muted }]}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Dock */}
      <View style={[styles.bottomDock, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.dockRow}>
          <View>
            <Text style={[styles.dockPriceLabel, { color: colors.muted }]}>Total Price</Text>
            <Text style={[styles.dockPrice, { color: colors.text }]}>{totalPrice.toLocaleString()} DZD</Text>
            <Text style={[styles.dockPriceUnit, { color: colors.muted }]}>{guests} Guest{guests > 1 ? 's' : ''}</Text>
          </View>

          {/* Ticket Counter */}
          <View style={[styles.counterContainer, { borderColor: colors.border }]}>
            <TouchableOpacity style={styles.counterBtn} onPress={handleDecrement}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.counterVal, { color: colors.text }]}>{guests}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={handleIncrement}>
              <Ionicons name="add" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* CTA Book Button */}
          <TouchableOpacity style={styles.bookCTA} onPress={handleBook}>
            <Text style={styles.bookCTAText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  heroContainer: { position: 'relative', height: 240 },
  heroImg: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', left: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,37,64,0.85)', padding: 18,
  },
  experienceTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#FFF' },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  hostAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  hostName: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: 'mon-sb' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  ratingText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontFamily: 'mon-sb' },

  body: { padding: 16 },

  // Stats Grid
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 12, fontFamily: 'mon-b' },
  statLabel: { fontSize: 10, fontFamily: 'mon' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 10 },
  descText: { fontSize: 13, fontFamily: 'mon', lineHeight: 20 },

  // Bento
  bentoWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bentoMiniCard: {
    width: (SCREEN_W - 32 - 8) / 2, padding: 12, borderRadius: 14, borderWidth: 1, gap: 4,
  },
  bentoTitle: { fontSize: 12, fontFamily: 'mon-b' },
  bentoDesc: { fontSize: 10, fontFamily: 'mon', lineHeight: 14 },

  // Timeline
  timelineContainer: { marginTop: 6, paddingLeft: 6 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineIndicator: { alignItems: 'center', width: 16 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', marginTop: 4 },
  timelineLine: { width: 1.5, flex: 1, marginVertical: 6 },
  timelineContent: { flex: 1, paddingBottom: 18 },
  timeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineTime: { fontSize: 11, fontFamily: 'mon-b' },
  timelineStepTitle: { fontSize: 13, fontFamily: 'mon-b' },
  timelineStepDesc: { fontSize: 11, fontFamily: 'mon', marginTop: 4, lineHeight: 16 },

  // Floating Dock
  bottomDock: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12,
  },
  dockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dockPriceLabel: { fontSize: 9, fontFamily: 'mon-b', textTransform: 'uppercase', letterSpacing: 0.5 },
  dockPrice: { fontSize: 18, fontFamily: 'mon-b' },
  dockPriceUnit: { fontSize: 10, fontFamily: 'mon' },

  counterContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, height: 38,
  },
  counterBtn: { width: 34, height: 38, alignItems: 'center', justifyContent: 'center' },
  counterVal: { width: 24, textAlign: 'center', fontSize: 13, fontFamily: 'mon-b' },

  bookCTA: {
    backgroundColor: '#10B981', paddingHorizontal: 20, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  bookCTAText: { color: '#FFF', fontSize: 13, fontFamily: 'mon-b' },
});
