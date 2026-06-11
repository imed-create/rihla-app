/**
 * RIHLA — Provider Profile Screen
 * ─────────────────────────────────
 * Universal profile for ALL service providers — guides, photographers,
 * drivers, hotel owners, restaurant owners, etc.
 * Shows avatar, bio, portfolio, reviews, services, and booking CTA.
 */

import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Pressable, Share,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';

// ── Mock provider data (derived from listings) ──

const MOCK_PORTFOLIO = [
  { id: 'pf1', label: 'Beach Sunset', color: '#F59E0B', icon: 'sunny-outline' },
  { id: 'pf2', label: 'City Tour', color: '#3B82F6', icon: 'map-outline' },
  { id: 'pf3', label: 'Mountain Trek', color: '#10B981', icon: 'mountain-outline' },
  { id: 'pf4', label: 'Night Market', color: '#EC4899', icon: 'moon-outline' },
  { id: 'pf5', label: 'Heritage Site', color: '#8B5CF6', icon: 'castle-outline' },
  { id: 'pf6', label: 'Desert Camp', color: '#C56A39', icon: 'flame-outline' },
];

const MOCK_REVIEWS = [
  { id: 'r1', name: 'Ahmed B.', date: '2 days ago', rating: 5, text: 'Amazing experience! Very professional and knew all the hidden spots. Would book again!', avatar: 'A' },
  { id: 'r2', name: 'Sarah M.', date: '1 week ago', rating: 5, text: 'Best guide we ever had. Made our trip unforgettable. Highly recommended for families.', avatar: 'S' },
  { id: 'r3', name: 'Youcef K.', date: '2 weeks ago', rating: 4, text: 'Great knowledge and friendly. The only small issue was timing, but overall excellent.', avatar: 'Y' },
  { id: 'r4', name: 'Fatima H.', date: '3 weeks ago', rating: 5, text: 'Professional, punctual, and passionate about what they do. 5 stars without hesitation!', avatar: 'F' },
];

const MOCK_SERVICES = [
  { id: 's1', title: 'Half-Day Tour', description: '4-hour guided tour with transport', price: 3500, duration: '4h', popular: true },
  { id: 's2', title: 'Full-Day Experience', description: '8-hour immersive tour with lunch', price: 6000, duration: '8h', popular: false },
  { id: 's3', title: 'Multi-Day Package', description: '3-day expedition with accommodation', price: 18000, duration: '3 days', popular: false },
];

const STAR_DIST = { 5: 68, 4: 22, 3: 7, 2: 2, 1: 1 };

// ── Main Screen ──

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'services'>('portfolio');

  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');

  if (!listing) {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.notFound}>
          <Ionicons name="person-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Provider not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const catDef = getCategoryDef(listing.category);
  const catColor = catDef?.color || RIHLA.primary;
  const totalReviews = Object.values(STAR_DIST).reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* ── HERO ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <View style={[styles.hero, { backgroundColor: '#0a2540' }]}>
            <View style={styles.heroNav}>
              <TouchableOpacity style={styles.backCircle} onPress={() => safeGoBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.actionCircle} onPress={async () => { try { await Share.share({ message: `Check out ${listing.title} on RIHLA!` }); } catch {} }}>
                  <Ionicons name="share-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <View style={[styles.avatarWrap, { borderColor: catColor }]}>
                <View style={[styles.avatarInner, { backgroundColor: catColor + '20' }]}>
                  <Ionicons name={catDef?.icon as any} size={32} color={catColor} />
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                </View>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>{listing.title}</Text>
                <Text style={styles.heroSubtitle}>{catDef?.label} · {listing.wilaya}, Algeria</Text>
                <View style={styles.heroRating}>
                  <Ionicons name="star" size={14} color="#FFD166" />
                  <Text style={styles.heroRatingText}>{listing.rating}</Text>
                  <Text style={styles.heroReviewCount}>({listing.review_count} reviews)</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── STATS ROW ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={18} color={catColor} />
            <Text style={styles.statValue}>5+ yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={18} color={catColor} />
            <Text style={styles.statValue}>{listing.review_count}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={18} color={catColor} />
            <Text style={styles.statValue}>&lt;1h</Text>
            <Text style={styles.statLabel}>Response</Text>
          </View>
        </View>

        {/* ── BIO ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{listing.description}</Text>
        </View>

        {/* ── TABS ── */}
        <View style={styles.tabRow}>
          {(['portfolio', 'reviews', 'services'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
            >
              <Ionicons
                name={tab === 'portfolio' ? 'images-outline' : tab === 'reviews' ? 'star-outline' : 'pricetag-outline'}
                size={14}
                color={activeTab === tab ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TAB CONTENT ── */}
        {activeTab === 'portfolio' && (
          <View style={styles.section}>
            <View style={styles.portfolioGrid}>
              {MOCK_PORTFOLIO.map((p) => (
                <TouchableOpacity key={p.id} style={[styles.portfolioItem, { backgroundColor: p.color + '15' }]} activeOpacity={0.7}>
                  <Ionicons name={p.icon as any} size={28} color={p.color} />
                  <Text style={[styles.portfolioLabel, { color: p.color }]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.section}>
            {/* Star Distribution */}
            <View style={styles.starDistCard}>
              <View style={styles.starDistLeft}>
                <Text style={styles.starBig}>{listing.rating}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons key={s} name={s <= Math.round(listing.rating) ? 'star' : 'star-outline'} size={14} color="#FFD166" />
                  ))}
                </View>
                <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
              </View>
              <View style={styles.starDistRight}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <View key={star} style={styles.starBarRow}>
                    <Text style={styles.starBarLabel}>{star}</Text>
                    <View style={styles.starBarBg}>
                      <View style={[styles.starBarFill, { width: `${(STAR_DIST[star as keyof typeof STAR_DIST] / totalReviews) * 100}%`, backgroundColor: catColor }]} />
                    </View>
                    <Text style={styles.starBarPct}>{STAR_DIST[star as keyof typeof STAR_DIST]}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Review Cards */}
            {MOCK_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={[styles.reviewAvatar, { backgroundColor: catColor + '15' }]}>
                    <Text style={[styles.reviewAvatarText, { color: catColor }]}>{review.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name={s <= review.rating ? 'star' : 'star-outline'} size={11} color="#FFD166" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.section}>
            {MOCK_SERVICES.map((svc) => (
              <TouchableOpacity key={svc.id} style={styles.serviceCard} activeOpacity={0.8}>
                {svc.popular && (
                  <View style={styles.popularBadge}>
                    <Ionicons name="flame" size={10} color="#FFFFFF" />
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
                <View style={styles.serviceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{svc.title}</Text>
                    <Text style={styles.serviceDesc}>{svc.description}</Text>
                  </View>
                  <Text style={styles.servicePrice}>{svc.price.toLocaleString()} DZD</Text>
                </View>
                <View style={styles.serviceMeta}>
                  <Ionicons name="time-outline" size={12} color="#64748B" />
                  <Text style={styles.serviceMetaText}>{svc.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── BOTTOM BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>From {listing.price_dzd.toLocaleString()} DZD</Text>
          <Text style={styles.bottomUnit}>per {catDef?.label?.toLowerCase()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: catColor }]}
          onPress={() => { hapticSuccess(); router.push(`/checkout/${listing.id}?price=${listing.price_dzd}` as any); }}
        >
          <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },

  // Hero
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  // Avatar section
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, position: 'relative' },
  avatarInner: { width: '100%', height: '100%', borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  verifiedBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 2 },
  heroInfo: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },

  // Stats
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  statDivider: { width: 1, height: 32, backgroundColor: '#E2E8F0' },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 10 },
  bioText: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },

  // Tabs
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, gap: 8 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9' },
  tabBtnActive: { backgroundColor: '#0d0d0d' },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },

  // Portfolio
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  portfolioItem: { width: '47%', height: 110, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6 },
  portfolioLabel: { fontSize: 12, fontFamily: 'mon-sb' },

  // Star distribution
  starDistCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16, gap: 16 },
  starDistLeft: { alignItems: 'center', gap: 4, minWidth: 80 },
  starBig: { fontSize: 36, fontFamily: 'mon-b', color: '#0F172A' },
  starRow: { flexDirection: 'row', gap: 1 },
  totalReviews: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  starDistRight: { flex: 1, gap: 4, justifyContent: 'center' },
  starBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starBarLabel: { fontSize: 11, fontFamily: 'mon-sb', color: '#64748B', width: 12 },
  starBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F1F5F9' },
  starBarFill: { height: '100%', borderRadius: 3 },
  starBarPct: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8', width: 28, textAlign: 'right' },

  // Reviews
  reviewCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, marginBottom: 8 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { fontSize: 14, fontFamily: 'mon-b' },
  reviewName: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  reviewDate: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewText: { fontSize: 13, fontFamily: 'mon', color: '#475569', lineHeight: 20 },

  // Services
  serviceCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 10, position: 'relative' },
  popularBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#EF4444' },
  popularText: { fontSize: 10, fontFamily: 'mon-b', color: '#FFFFFF' },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  serviceDesc: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  servicePrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  serviceMetaText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },

  // Bottom bar
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#FFFFFF' },
});
