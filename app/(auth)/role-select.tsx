/**
 * RIHLA — Role Select (Uber-Style Redesign)
 * Gradient hero header with clean role cards
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, UserRole } from '@/context/AppContext';
import { RIHLA } from '@/constants/theme';

const ROLES: {
  id: UserRole;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  accentColor: string;
  perks: string[];
}[] = [
  {
    id: 'traveler',
    title: 'Traveler',
    subtitle: 'Explore Algeria',
    desc: 'Discover beaches, deserts, mountains and historic cities. Book experiences instantly.',
    icon: 'compass-outline',
    accentColor: '#00a896',
    perks: ['Browse all destinations', 'Book services instantly', 'Track your trips'],
  },
  {
    id: 'business',
    title: 'Business Owner',
    subtitle: 'List your business',
    desc: 'Hotel, restaurant, resort or venue — list it on RIHLA and reach thousands of tourists.',
    icon: 'storefront-outline',
    accentColor: RIHLA.primary,
    perks: ['List your business', 'Manage bookings', 'Track revenue'],
  },
  {
    id: 'partner',
    title: 'Service Partner',
    subtitle: 'Rent out your assets',
    desc: 'Jet skis, camels, buggies, quads — list your rentals and earn with every booking.',
    icon: 'flash-outline',
    accentColor: '#f4a261',
    perks: ['List your services', 'Manage active rentals', 'Track your earnings'],
  },
];

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { setRole } = useApp();

  const handleSelect = async (roleId: UserRole) => {
    await setRole(roleId);
    router.replace(`/(auth)/kyc-${roleId}` as any);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Gradient Hero */}
      <LinearGradient colors={[RIHLA.primary, '#0d3b66']} style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>🇩🇿</Text>
        <Text style={styles.heroTitle}>Who are you?</Text>
        <Text style={styles.heroSub}>
          Select the role that best describes you. You'll get a personalized dashboard and features tailored to your needs.
        </Text>
      </LinearGradient>

      {/* Role Cards */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => handleSelect(role.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, { backgroundColor: role.accentColor + '12', borderColor: role.accentColor + '25' }]}>
              <Ionicons name={role.icon as any} size={26} color={role.accentColor} />
            </View>
            <View style={styles.roleInfo}>
              <View style={styles.roleTitleRow}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <View style={[styles.badge, { backgroundColor: role.accentColor + '12' }]}>
                  <Text style={[styles.badgeText, { color: role.accentColor }]}>{role.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.roleDesc}>{role.desc}</Text>
              <View style={styles.perksRow}>
                {role.perks.map((p) => (
                  <View key={p} style={styles.perkItem}>
                    <Ionicons name="checkmark-circle" size={12} color={role.accentColor} />
                    <Text style={styles.perkText}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.arrowCircle, { backgroundColor: role.accentColor + '10' }]}>
              <Ionicons name="arrow-forward" size={16} color={role.accentColor} />
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.footerNote}>
          You can only select one role. Contact support to change it later.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  // Hero
  hero: {
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    gap: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  heroEmoji: { fontSize: 36, marginTop: 4 },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#FFFFFF', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  scroll: { padding: 20, gap: 14, paddingBottom: 40 },

  // Role cards
  roleCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  iconWrap: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
  roleInfo: { flex: 1, gap: 6 },
  roleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  roleTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: 'mon-sb' },
  roleDesc: { fontSize: 13, fontFamily: 'mon', color: '#64748B', lineHeight: 18 },
  perksRow: { gap: 3, marginTop: 2 },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  perkText: { fontSize: 12, fontFamily: 'mon', color: '#475569' },
  arrowCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },

  footerNote: {
    fontSize: 12, fontFamily: 'mon', color: '#94A3B8',
    textAlign: 'center', marginTop: 8,
  },
});
