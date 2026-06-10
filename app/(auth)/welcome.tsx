/**
 * RIHLA — Uber-Style Onboarding / Welcome Screen
 * ────────────────────────────────────────────────
 * Clean swiper slides • Uber-style dot indicators • Minimal UI
 * Premium gradients • Demo bottom-sheet chooser
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RIHLA } from '@/constants/theme';
import { useApp, UserRole } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import UberButton from '@/components/shared/UberButton';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  emoji: string;
  gradient: [string, string, string];
  tag: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Discover\nAlgeria',
    subtitle:
      'From golden Sahara dunes to turquoise Mediterranean shores — your next adventure starts here.',
    icon: 'compass',
    emoji: '🏔️',
    gradient: ['#061422', '#0a2540', '#0d3b6e'],
    tag: '1,200+ Destinations',
  },
  {
    id: '2',
    title: 'Book\nInstantly',
    subtitle:
      'Hotels, beach resorts, desert camps, quad tours, restaurants, and local guides — all in one tap.',
    icon: 'calendar',
    emoji: '🐫',
    gradient: ['#0a1a0a', '#1A6B3A', '#00a896'],
    tag: '500+ Experiences',
  },
  {
    id: '3',
    title: 'Grow Your\nBusiness',
    subtitle:
      'Hotel owner? Restaurant? Beach resort? List your services and reach thousands of travelers daily.',
    icon: 'trending-up',
    emoji: '💼',
    gradient: ['#1a0a00', '#8B5E3C', '#C56A39'],
    tag: '10 Business Categories',
  },
];

const DEMO_ACCOUNTS = [
  {
    role: 'traveler' as UserRole,
    title: 'Traveler',
    desc: 'Browse destinations, book tours & beach stays',
    icon: 'compass',
    color: '#00a896',
    bg: '#E6FAF7',
  },
  {
    role: 'business' as UserRole,
    businessType: 'hotel',
    title: 'Hotel Owner',
    desc: 'Manage rooms, bookings & occupancy dashboard',
    icon: 'bed-outline',
    color: '#1A6B3A',
    bg: '#F0FDF4',
  },
  {
    role: 'business' as UserRole,
    businessType: 'restaurant',
    title: 'Restaurant Owner',
    desc: 'Live kitchen orders, table occupancy, menu',
    icon: 'restaurant-outline',
    color: '#C56A39',
    bg: '#FFF7ED',
  },
  {
    role: 'business' as UserRole,
    businessType: 'beach',
    title: 'Beach Resort',
    desc: 'Spot maps, umbrella inventory, passes',
    icon: 'umbrella-outline',
    color: '#00a896',
    bg: '#E6FAF7',
  },
  {
    role: 'business' as UserRole,
    businessType: 'rental',
    title: 'Home Rental',
    desc: 'Properties, calendar, guest requests',
    icon: 'home-outline',
    color: '#6C63FF',
    bg: '#F5F3FF',
  },
  {
    role: 'business' as UserRole,
    businessType: 'activity',
    title: 'Activity Operator',
    desc: 'Sessions, guides on duty, gear status',
    icon: 'bicycle-outline',
    color: '#E76F51',
    bg: '#FFF1EE',
  },
  {
    role: 'business' as UserRole,
    businessType: 'event',
    title: 'Event Organiser',
    desc: 'Ticket sales, capacity, lineup',
    icon: 'musical-notes-outline',
    color: '#A855F7',
    bg: '#F5F3FF',
  },
  {
    role: 'partner' as UserRole,
    title: 'Service Partner',
    desc: 'Beach services, on-demand rentals, earnings',
    icon: 'flash',
    color: '#f4a261',
    bg: '#FFFBEB',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUser } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [demoVisible, setDemoVisible] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef<FlatList>(null);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    router.replace('/(tabs)');
  };

  const selectDemo = (role: UserRole, businessType?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDemoVisible(false);
    const demoEmail = `${role}${businessType ? `-${businessType}` : ''}@demo.rihla.dz`;
    const demoName = `Demo ${businessType ? businessType.charAt(0).toUpperCase() + businessType.slice(1) : role.charAt(0).toUpperCase() + role.slice(1)}`;
    updateUser({
      email: demoEmail,
      name: demoName,
      role,
      kycStatus: 'approved',
      isOnboarded: true,
      kycData: {
        fullName: demoName,
        phone: '+213 555 00 00 00',
        nationality: 'Algerian',
        ...(role === 'business' && { businessType: businessType || 'hotel', businessName: `Demo ${businessType} Business` }),
        ...(role === 'partner' && { serviceType: 'jetski' }),
      },
    });
    setTimeout(() => router.replace('/'), 120);
  };

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── SLIDES ── */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => <Slide slide={item} />}
      />

      {/* ── UBER-STYLE TOP BAR ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brandBadge}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>R</Text>
          </View>
          <Text style={styles.brandLogo}>RIHLA</Text>
        </View>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.skipTxt}>Skip</Text>
          <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </View>

      {/* ── UBER-STYLE BOTTOM PANEL ── */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 24 }]}>
        {/* Uber-style dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const scale = scrollX.interpolate({ inputRange, outputRange: [1, 1.3, 1], extrapolate: 'clamp' });
            const op = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { opacity: op, transform: [{ scale }] },
                ]}
              />
            );
          })}
        </View>

        {/* Slide text */}
        <View style={styles.slideText}>
          <Text style={styles.slideTitle}>{currentSlide.title}</Text>
          <Text style={styles.slideSub}>{currentSlide.subtitle}</Text>
        </View>

        {/* Uber-style CTA Row */} 
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => { Haptics.selectionAsync(); setDemoVisible(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="flash-outline" size={16} color="#fff" />
            <Text style={styles.demoBtnTxt}>Demo</Text>
          </TouchableOpacity>
          <UberButton
            title={isLast ? 'Get Started' : 'Next'}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goNext(); }}
            IconRight={() => (
              <Ionicons name={isLast ? 'arrow-forward-circle' : 'chevron-forward'} size={20} color="#0a2540" />
            )}
            bgVariant="outline"
            textVariant="secondary"
            style={styles.ctaMain}
            textStyle={styles.ctaMainTxt}
          />
        </View>

        {/* Uber-style sign-in prompt */}
        <TouchableOpacity
          style={styles.signinRow}
          onPress={() => { Haptics.selectionAsync(); router.push('/(auth)/login'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.signinText}>Already have an account?</Text>
          <Text style={styles.signinLink}> Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* ── DEMO MODAL ── */}
      <Modal visible={demoVisible} transparent animationType="slide" onRequestClose={() => setDemoVisible(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setDemoVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalKnob} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Jump In</Text>
                <Text style={styles.modalSub}>Choose a demo profile to explore RIHLA</Text>
              </View>
              <TouchableOpacity
                style={styles.modalDemoBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  selectDemo('traveler');
                }}
              >
                <Text style={styles.modalDemoBtnText}>Quick Try</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.5 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <TouchableOpacity
                  key={acc.title}
                  style={[styles.demoCard, { borderLeftColor: acc.color }]}
                  onPress={() => selectDemo(acc.role, (acc as any).businessType)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.demoIcon, { backgroundColor: acc.bg }]}>
                    <Ionicons name={acc.icon as any} size={22} color={acc.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.demoTitle}>{acc.title}</Text>
                    <Text style={styles.demoDesc}>{acc.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setDemoVisible(false)}>
              <Text style={styles.modalCancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Slide({ slide }: { slide: Slide }) {
  return (
    <LinearGradient colors={slide.gradient} style={styles.slide} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.slideVisual}>
        {/* Uber-style central icon ring */}
        <View style={styles.outerRing}>
          <View style={styles.innerRing}>
            <Text style={styles.slideEmoji}>{slide.emoji}</Text>
          </View>
        </View>
        {/* Uber-style floating badges */}
        <View style={[styles.floatingBadge, styles.floatingBadgeTop]}>
          <View style={styles.floatingBadgeDot} />
          <Text style={styles.floatingBadgeText}>Live</Text>
        </View>
        <View style={[styles.floatingBadge, styles.floatingBadgeBottom]}>
          <Ionicons name="star" size={11} color="#FFD700" />
          <Text style={styles.floatingBadgeText}>4.9</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#061422' },

  // Slide
  slide: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -100,
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideEmoji: { fontSize: 56 },
  floatingBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  floatingBadgeTop: { top: 16, right: -10 },
  floatingBadgeBottom: { bottom: 16, left: -10 },
  floatingBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  floatingBadgeText: { fontSize: 10, fontFamily: 'mon-sb', color: '#fff' },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#0a2540',
  },
  brandLogo: {
    fontSize: 18,
    fontFamily: 'mon-b',
    color: '#fff',
    letterSpacing: 3,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skipTxt: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: 'rgba(255,255,255,0.7)',
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    gap: 16,
  },
  slideText: { gap: 8 },
  slideTitle: {
    fontSize: 34,
    fontFamily: 'mon-b',
    color: '#fff',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  slideSub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
  },

  // Uber-style dots
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  // CTA
  ctaRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 4 },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  demoBtnTxt: {
    fontSize: 14,
    fontFamily: 'mon-sb',
    color: '#fff',
  },
  ctaMain: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  ctaMainTxt: {
    fontSize: 17,
    fontFamily: 'mon-b',
    color: '#0a2540',
  },

  // Sign-in prompt
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  signinText: {
    fontSize: 13,
    fontFamily: 'mon',
    color: 'rgba(255,255,255,0.5)',
  },
  signinLink: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#FFFFFF',
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,20,34,0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalKnob: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A' },
  modalSub: { fontSize: 13, fontFamily: 'mon', color: '#64748B', lineHeight: 18, marginTop: 2 },
  modalDemoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalDemoBtnText: { fontSize: 12, fontFamily: 'mon-b', color: RIHLA.primary },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 5,
    marginBottom: 10,
  },
  demoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: { fontSize: 14, fontFamily: 'mon-sb', color: '#1F2937', marginBottom: 2 },
  demoDesc: { fontSize: 11, fontFamily: 'mon', color: '#6B7280' },
  modalCancel: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelTxt: { fontSize: 15, fontFamily: 'mon-sb', color: '#475569' },
});
