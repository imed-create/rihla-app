/**
 * RIHLA — Unified Booking Confirmation Screen
 * ──────────────────────────────────────────
 * - Displays a premium, high-fidelity booking success ticket.
 * - Dynamic SVG-like dotted line or receipt look.
 * - Custom success animation or pulse checkmark.
 * - Interactive CTAs: "Go to My Trips" or "Back to Explore".
 * - Centralized color themes matching the dark/light mode configurations.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticSuccess, hapticLight } from '@/utils/haptics';

const { width: SCREEN_W } = Dimensions.get('window');

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { type, title, subtitle, price } = useLocalSearchParams<{
    type: string;
    title: string;
    subtitle: string;
    price: string;
  }>();

  useEffect(() => {
    // Centralized trigger for success haptic feedback
    hapticSuccess();
  }, []);

  const getServiceColor = () => {
    switch (type) {
      case 'hotel': return '#0A2540';
      case 'restaurant': return '#FF5A5F';
      case 'beach': return '#00A699';
      case 'ride': return '#E6B022';
      case 'rental': return '#484848';
      case 'event': return '#7B2CBF';
      case 'guide': return '#8B5E3C';
      case 'photographer': return '#E65F2B';
      case 'experience': return '#10B981';
      default: return '#10B981';
    }
  };

  const getServiceIcon = () => {
    switch (type) {
      case 'hotel': return 'business';
      case 'restaurant': return 'restaurant';
      case 'beach': return 'sunny';
      case 'ride': return 'car-sport';
      case 'rental': return 'home';
      case 'event': return 'ticket';
      case 'guide': return 'compass';
      case 'photographer': return 'camera';
      case 'experience': return 'leaf';
      default: return 'checkmark-circle';
    }
  };

  const serviceColor = getServiceColor();
  const serviceIcon = getServiceIcon();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Success Banner */}
      <View style={[styles.header, { backgroundColor: serviceColor, paddingTop: insets.top + 20 }]}>
        <View style={styles.successBadge}>
          <Ionicons name="checkmark" size={32} color="#FFF" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>Your trip has been successfully scheduled</Text>
      </View>

      {/* Ticket Container */}
      <View style={styles.ticketContainer}>
        <View style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header Row */}
          <View style={styles.ticketHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${serviceColor}15` }]}>
              <Ionicons name={serviceIcon as any} size={22} color={serviceColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.categoryLabel, { color: colors.muted }]}>
                {type ? type.toUpperCase() : 'BOOKING'}
              </Text>
              <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={1}>
                {title || 'Service Booking'}
              </Text>
            </View>
          </View>

          {/* Dotted Divider line */}
          <View style={styles.dividerContainer}>
            <View style={[styles.circleCutout, { left: -22, backgroundColor: colors.bg, borderColor: colors.border }]} />
            <View style={styles.dottedLine} />
            <View style={[styles.circleCutout, { right: -22, backgroundColor: colors.bg, borderColor: colors.border }]} />
          </View>

          {/* Details Row */}
          <View style={styles.detailsBody}>
            <View style={styles.detailsRow}>
              <View style={styles.detailsCol}>
                <Text style={[styles.detailsLabel, { color: colors.muted }]}>DATE / SCHEDULE</Text>
                <Text style={[styles.detailsValue, { color: colors.text }]}>
                  {subtitle || 'Flexible Date'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailsCol}>
                <Text style={[styles.detailsLabel, { color: colors.muted }]}>STATUS</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.greenPulse} />
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>
              <View style={styles.detailsCol}>
                <Text style={[styles.detailsLabel, { color: colors.muted }]}>TOTAL PRICE</Text>
                <Text style={[styles.priceValue, { color: serviceColor }]}>
                  {price ? `${Number(price).toLocaleString()} DZD` : 'Contact Service'}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <View style={[styles.ticketFooter, { borderTopColor: colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
            <Text style={[styles.footerText, { color: colors.muted }]}>
              Protected by RIHLA Trust Guarantee
            </Text>
          </View>
        </View>
      </View>

      {/* Booking Actions */}
      <View style={[styles.actionsBox, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: serviceColor }]}
          onPress={() => {
            hapticLight();
            router.replace('/(tabs)/trips');
          }}
        >
          <Ionicons name="calendar-outline" size={18} color="#FFF" />
          <Text style={styles.primaryBtnText}>View My Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={() => {
            hapticLight();
            router.replace('/(tabs)/explore');
          }}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Back to Map Hub</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 220, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
  successBadge: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF',
    marginBottom: 12,
  },
  successTitle: { fontSize: 20, fontFamily: 'mon-b', color: '#FFF' },
  successSubtitle: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },

  // Ticket styling
  ticketContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', marginTop: -20 },
  ticketCard: {
    borderRadius: 20, borderWidth: 1, overflow: 'visible',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 5,
  },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 9, fontFamily: 'mon-b', letterSpacing: 1 },
  listingTitle: { fontSize: 16, fontFamily: 'mon-b', marginTop: 2 },

  // Ticket Cutouts & Dotted Line
  dividerContainer: { height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  circleCutout: {
    width: 20, height: 20, borderRadius: 10, borderStyle: 'solid', borderWidth: 1,
    position: 'absolute', top: 0,
  },
  dottedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: '#E5E7EB', marginHorizontal: 20 },

  detailsBody: { padding: 18, gap: 18 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  detailsCol: { flex: 1 },
  detailsLabel: { fontSize: 9, fontFamily: 'mon-b', letterSpacing: 0.5 },
  detailsValue: { fontSize: 13, fontFamily: 'mon-sb', marginTop: 4 },
  priceValue: { fontSize: 16, fontFamily: 'mon-b', marginTop: 4 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)', borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4,
  },
  greenPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  statusText: { fontSize: 11, fontFamily: 'mon-sb', color: '#10B981' },

  ticketFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderTopWidth: 0.5, paddingVertical: 14,
  },
  footerText: { fontSize: 11, fontFamily: 'mon' },

  // Actions
  actionsBox: { paddingHorizontal: 20, gap: 10 },
  primaryBtn: {
    flexDirection: 'row', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },
  secondaryBtn: {
    height: 48, borderRadius: 12, borderStyle: 'solid', borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontFamily: 'mon-b' },
});
