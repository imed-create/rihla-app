/**
 * RIHLA — Dedicated Photographer Screen
 * ──────────────────────────────
 * - Photographer bio, rating, location coverage.
 * - Dynamic masonry portfolio grid (premium visual showcase).
 * - Gear list / equipment specs (bento cards).
 * - Packages offered (Quick Shoot, Event Coverage, Premium Cinematic) with per-package booking CTAs.
 * - Integration with AppContext for bookings and redirect to booking confirmation.
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
  FlatList,
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

type PackageType = {
  id: string;
  name: string;
  duration: string;
  photosCount: string;
  price: number;
  description: string;
  features: string[];
};

export default function PhotographerServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const photographer = useMemo(() => getListingById(id ?? ''), [id]);
  const gallery = useMemo(
    () => (photographer ? getListingGallery(photographer.cover_image_url ?? '', 'photographer', 8) : []),
    [photographer]
  );

  const [activeTab, setActiveTab] = useState<'portfolio' | 'packages' | 'gear'>('portfolio');

  if (!photographer) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Photographer not found</Text>
      </View>
    );
  }

  const packages: PackageType[] = [
    {
      id: 'p1',
      name: 'Standard Portrait Session',
      duration: '1.5 Hours',
      photosCount: '25 edited photos',
      price: photographer.price_dzd,
      description: 'Ideal for individual outdoor portraits, professional headshots, or casual couple shoots.',
      features: ['1 location included', 'High-res digital files', 'Delivery in 5 days'],
    },
    {
      id: 'p2',
      name: 'Premium & Drone Shoot',
      duration: '3 Hours',
      photosCount: '50 edited photos + 5 drone shots',
      price: Math.round(photographer.price_dzd * 2.2),
      description: 'Stunning landscapes, travel shoots, or artistic styling with aerial drone photography.',
      features: ['Up to 2 locations', 'Drone cinematography', 'Delivery in 3 days', 'Advanced skin retouching'],
    },
    {
      id: 'p3',
      name: 'Event / Ceremony Coverage',
      duration: 'Full Day (8 Hours)',
      photosCount: '200+ edited photos',
      price: Math.round(photographer.price_dzd * 5.0),
      description: 'Complete coverage for weddings, private banquets, corporate meetings or live events.',
      features: ['Full day coverage', 'Online private gallery link', 'All RAW files provided', 'Sneak peek in 24 hours'],
    },
  ];

  const gearList = [
    { name: 'Sony Alpha 7R V', category: 'Camera Body', icon: 'camera-outline' },
    { name: 'FE 24-70mm f/2.8 GM II', category: 'Lens', icon: 'aperture-outline' },
    { name: 'FE 85mm f/1.4 GM', category: 'Portrait Lens', icon: 'aperture-outline' },
    { name: 'DJI Mavic 3 Pro', category: 'Drone', icon: 'airplane-outline' },
    { name: 'Profoto B10X Plus', category: 'Lighting', icon: 'flash-outline' },
  ];

  const handleBookPackage = (pkg: PackageType) => {
    hapticSuccess();
    addBooking({
      type: 'photographer',
      title: photographer.title,
      subtitle: `${pkg.name} · ${pkg.duration}`,
      price: pkg.price,
      businessId: photographer.provider_id,
      icon: 'camera',
      iconFamily: 'Ionicons',
      color: '#E65F2B',
      details: {
        package_name: pkg.name,
        duration: pkg.duration,
        delivery: pkg.photosCount,
        price: `${pkg.price.toLocaleString()} DZD`,
      },
    });

    router.replace({
      pathname: '/booking/confirm',
      params: {
        type: 'photographer',
        title: photographer.title,
        subtitle: `${pkg.name} · ${pkg.duration}`,
        price: String(pkg.price),
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Header Cover */}
        <View style={styles.headerCover}>
          <Image source={{ uri: gallery[0] }} style={styles.headerImg} />
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.titleText}>{photographer.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>PRO PHOTOGRAPHER</Text>
              </View>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={13} color="#FFD166" />
                <Text style={styles.ratingText}>{photographer.rating} ({photographer.review_count})</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.container}>
          {/* Bio Section */}
          <View style={styles.bioCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Artist Profile</Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {photographer.description}
            </Text>
          </View>

          {/* Segment Tabs */}
          <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(['portfolio', 'packages', 'gear'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && { backgroundColor: '#E65F2B' },
                ]}
                onPress={() => { hapticLight(); setActiveTab(tab); }}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: activeTab === tab ? '#FFF' : colors.muted },
                  ]}
                >
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <View style={styles.portfolioContainer}>
              <View style={styles.masonryGrid}>
                {gallery.map((url, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.masonryCard,
                      { width: (SCREEN_W - 38) / 2 },
                      idx % 3 === 0 ? { height: 210 } : { height: 140 },
                    ]}
                  >
                    <Image source={{ uri: url }} style={styles.masonryImage} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <View style={styles.packagesContainer}>
              {packages.map((pkg) => (
                <View key={pkg.id} style={[styles.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.pkgHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pkgName, { color: colors.text }]}>{pkg.name}</Text>
                      <Text style={[styles.pkgMeta, { color: colors.muted }]}>
                        {pkg.duration} · {pkg.photosCount}
                      </Text>
                    </View>
                    <Text style={styles.pkgPrice}>{pkg.price.toLocaleString()} DZD</Text>
                  </View>

                  <Text style={[styles.pkgDesc, { color: colors.muted }]}>{pkg.description}</Text>

                  <View style={styles.pkgFeatures}>
                    {pkg.features.map((feat, i) => (
                      <View key={i} style={styles.featRow}>
                        <Ionicons name="checkmark-sharp" size={14} color="#10B981" />
                        <Text style={[styles.featText, { color: colors.text }]}>{feat}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => handleBookPackage(pkg)}
                  >
                    <Text style={styles.bookBtnText}>Book Package</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Gear Tab */}
          {activeTab === 'gear' && (
            <View style={styles.gearContainer}>
              <Text style={[styles.gearSubTitle, { color: colors.muted }]}>PROFESSIONAL EQUIPMENT LIST</Text>
              {gearList.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.gearItemCard,
                    { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                >
                  <View style={styles.gearIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color="#E65F2B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gearName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.gearCategory, { color: colors.muted }]}>{item.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  headerCover: { position: 'relative', height: 260 },
  headerImg: { width: '100%', height: '100%' },
  backBtn: {
    position: 'absolute', left: 16, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,37,64,0.85)', padding: 18,
  },
  titleText: { fontSize: 20, fontFamily: 'mon-b', color: '#FFF' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  tagBadge: { backgroundColor: '#E65F2B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { color: '#FFF', fontSize: 9, fontFamily: 'mon-b' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontFamily: 'mon-sb' },

  container: { padding: 16 },
  bioCard: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', marginBottom: 8 },
  description: { fontSize: 13, fontFamily: 'mon', lineHeight: 20 },

  // Tabs
  tabContainer: {
    flexDirection: 'row', padding: 4, borderRadius: 12, borderWidth: 1, marginBottom: 20,
  },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, fontFamily: 'mon-b' },

  // Portfolio
  portfolioContainer: { marginTop: 4 },
  masonryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  masonryCard: { borderRadius: 12, overflow: 'hidden' },
  masonryImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Packages
  packagesContainer: { gap: 16 },
  packageCard: { borderRadius: 16, borderStyle: 'solid', borderWidth: 1, padding: 16, gap: 12 },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  pkgName: { fontSize: 15, fontFamily: 'mon-b' },
  pkgMeta: { fontSize: 11, fontFamily: 'mon', marginTop: 2 },
  pkgPrice: { fontSize: 16, fontFamily: 'mon-b', color: '#E65F2B' },
  pkgDesc: { fontSize: 12, fontFamily: 'mon', lineHeight: 18 },
  pkgFeatures: { gap: 6, marginVertical: 4 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featText: { fontSize: 11, fontFamily: 'mon-sb' },
  bookBtn: {
    height: 44, backgroundColor: '#E65F2B', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  bookBtnText: { color: '#FFF', fontSize: 13, fontFamily: 'mon-b' },

  // Gear
  gearContainer: { gap: 10 },
  gearSubTitle: { fontSize: 10, fontFamily: 'mon-b', letterSpacing: 0.5, marginBottom: 4 },
  gearItemCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    borderRadius: 12, borderWidth: 1,
  },
  gearIconContainer: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(230,95,43,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  gearName: { fontSize: 13, fontFamily: 'mon-b' },
  gearCategory: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },
});
