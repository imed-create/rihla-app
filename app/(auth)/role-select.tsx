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
import { useApp, UserRole } from '@/context/AppContext';
import { StyleSheet as RNStyleSheet } from 'react-native';

const ROLES: {
  id: UserRole;
  title: string;
  subtitle: string;
  desc: string;
  icon: string;
  accentColor: string;
  bgColor: string;
  perks: string[];
}[] = [
  {
    id: 'traveler',
    title: 'Traveler',
    subtitle: 'Explore Algeria',
    desc: 'Discover beaches, deserts, mountains and historic cities. Book experiences instantly.',
    icon: 'compass-outline',
    accentColor: '#00a896',
    bgColor: '#EFF6FF',
    perks: ['Browse all destinations', 'Book services instantly', 'Track your trips'],
  },
  {
    id: 'business',
    title: 'Business Owner',
    subtitle: 'List your business',
    desc: 'Hotel, restaurant, resort or venue — list it on TourDZ and reach thousands of tourists.',
    icon: 'storefront-outline',
    accentColor: '#0a2540',
    bgColor: '#F5F3FF',
    perks: ['List your business', 'Manage bookings', 'Track revenue'],
  },
  {
    id: 'partner',
    title: 'Service Partner',
    subtitle: 'Rent out your assets',
    desc: 'Jet skis, camels, buggies, quads — list your rentals and earn with every booking.',
    icon: 'flash-outline',
    accentColor: '#f4a261',
    bgColor: '#ECFDF5',
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
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose your role</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome copy */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.mainTitle}>Who are you? 🇩🇿</Text>
          <Text style={styles.mainSub}>
            Select the role that best describes you. You'll get a personalized dashboard and features tailored to your needs.
          </Text>
        </View>

        {/* Role cards */}
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => handleSelect(role.id)}
            activeOpacity={0.75}
          >
            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: role.bgColor }]}>
              <Ionicons name={role.icon as any} size={28} color={role.accentColor} />
            </View>

            {/* Text */}
            <View style={styles.roleInfo}>
              <View style={styles.roleTitleRow}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <View style={[styles.badge, { backgroundColor: role.bgColor }]}>
                  <Text style={[styles.badgeText, { color: role.accentColor }]}>{role.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.roleDesc}>{role.desc}</Text>
              <View style={styles.perksRow}>
                {role.perks.map((p) => (
                  <View key={p} style={styles.perkItem}>
                    <Ionicons name="checkmark-circle" size={13} color={role.accentColor} />
                    <Text style={styles.perkText}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Arrow */}
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'mon-sb',
    fontSize: 16,
    color: '#000000',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    gap: 16,
  },
  welcomeBlock: {
    gap: 6,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 26,
    fontFamily: 'mon-b',
    color: '#000000',
    letterSpacing: -0.5,
  },
  mainSub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#64748B',
    lineHeight: 21,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleInfo: {
    flex: 1,
    gap: 6,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  roleTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  roleDesc: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#64748B',
    lineHeight: 18,
  },
  perksRow: {
    gap: 4,
    marginTop: 4,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  perkText: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#475569',
  },
  footerNote: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
