import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';

export default function KycPendingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useApp();

  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (user.kycStatus === 'approved') {
      if (user.role === 'business') {
        router.replace('/(business)' as any);
      } else if (user.role === 'partner') {
        router.replace('/(partner)' as any);
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user.kycStatus, user.role]);

  const ROLE_META = {
    traveler: { color: '#00a896', icon: 'compass-outline', label: 'Traveler', bgColor: '#F0F9FF' },
    business: { color: '#0a2540', icon: 'storefront-outline', label: 'Business Owner', bgColor: '#F5F3FF' },
    partner: { color: '#f4a261', icon: 'flash-outline', label: 'Service Partner', bgColor: '#ECFDF5' },
  };

  const meta = ROLE_META[user.role ?? 'traveler'];

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application submitted</Text>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {/* Big icon */}
        <Animated.View style={[styles.iconRing, { borderColor: meta.color + '30', transform: [{ scale: pulse }] }]}>
          <View style={[styles.iconCircle, { backgroundColor: meta.bgColor }]}>
            <Ionicons name={meta.icon as any} size={44} color={meta.color} />
          </View>
        </Animated.View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>
            {user.kycStatus === 'submitted' ? 'Under Review ⏳' : 'Approved! 🎉'}
          </Text>
          <Text style={styles.subtitle}>
            {user.kycStatus === 'submitted'
              ? 'Your application is being reviewed by our team. This usually takes just a moment...'
              : `Welcome to TourDZ as a ${meta.label}! Setting up your dashboard...`
            }
          </Text>
        </View>

        {/* Progress steps */}
        <View style={styles.stepsCard}>
          <Step done label="Application submitted" color={meta.color} />
          <View style={[styles.stepConnector, { backgroundColor: user.kycStatus === 'approved' ? meta.color : '#E2E8F0' }]} />
          <Step done={user.kycStatus === 'approved'} loading={user.kycStatus === 'submitted'} label="Identity review" color={meta.color} />
          <View style={styles.stepConnector} />
          <Step done={false} label="Account activated" color={meta.color} />
        </View>

        {/* Status info */}
        <View style={[styles.infoCard, { backgroundColor: meta.bgColor, borderColor: meta.color + '25' }]}>
          <Ionicons name="time-outline" size={18} color={meta.color} />
          <Text style={[styles.infoText, { color: meta.color }]}>
            Auto-approving your application. Please wait a moment...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function Step({ done, loading, label, color }: { done: boolean; loading?: boolean; label: string; color: string }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true })
      ).start();
    }
  }, [loading]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, done && { backgroundColor: color, borderColor: color }]}>
        {done
          ? <Ionicons name="checkmark" size={12} color="#fff" />
          : loading
            ? <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="refresh-outline" size={12} color={color} />
              </Animated.View>
            : null
        }
      </View>
      <Text style={[styles.stepLabel, done && { color, fontFamily: 'mon-sb' }]}>{label}</Text>
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
  headerTitle: { fontFamily: 'mon-sb', fontSize: 16, color: '#000000' },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 28,
  },

  iconRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textBlock: { alignItems: 'center', gap: 8 },
  title: {
    fontSize: 26,
    fontFamily: 'mon-b',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },

  stepsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#E2E8F0',
    marginLeft: 11,
    borderRadius: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#94A3B8',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    width: '100%',
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: 'mon', lineHeight: 18 },
});
