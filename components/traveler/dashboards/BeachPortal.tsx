import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function BeachPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();

  // Find beaches in Mock Listings
  const beaches = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'beach' && l.is_active);
  }, []);

  const featuredBeach = beaches[0] || { id: 'sahel-beach-1', title: 'Sidi Fredj Golden Beach' };

  const handleSubService = (subRoute: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to dedicated beach hub with details
    router.push(`/services/beach/${featuredBeach.id}` as any);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── BEACH WEATHER & SEA CONDITION WIDGET ── */}
      <View style={[styles.weatherCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.weatherHeader}>
          <Text style={[styles.weatherTitle, { color: colors.text }]}>Sidi Fredj Coastal Status</Text>
          <View style={styles.flagBadge}>
            <View style={[styles.flagCircle, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.flagLabel, { color: colors.text }]}>Safe Swim (Green Flag)</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={[styles.metricBox, { backgroundColor: colors.bg }]}>
            <Ionicons name="thermometer-outline" size={18} color="#00a896" />
            <Text style={[styles.metricVal, { color: colors.text }]}>24°C</Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Water Temp</Text>
          </View>
          <View style={[styles.metricBox, { backgroundColor: colors.bg }]}>
            <Ionicons name="water-outline" size={18} color="#00a896" />
            <Text style={[styles.metricVal, { color: colors.text }]}>0.3m</Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Wave Height</Text>
          </View>
          <View style={[styles.metricBox, { backgroundColor: colors.bg }]}>
            <Ionicons name="rainy-outline" size={18} color="#00a896" />
            <Text style={[styles.metricVal, { color: colors.text }]}>0%</Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>Rain Prob.</Text>
          </View>
        </View>
      </View>

      {/* ── FLAGSHIP 3D SPOT SELECTION BANNER ── */}
      <TouchableOpacity 
        style={styles.gridBanner}
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Directly open 3D spots visual selection
          router.push({
            pathname: '/services/beach/spots',
            params: { beachId: featuredBeach.id }
          } as any);
        }}
      >
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop' }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.bannerOverlay}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>NEW 3D GRID</Text>
          </View>
          <Text style={styles.bannerTitle}>Reserve Parasol in 3D</Text>
          <Text style={styles.bannerSubtitle}>Pick your umbrella visual row on the map before arriving.</Text>
          <View style={styles.bannerAction}>
            <Text style={styles.bannerActionText}>Choose Umbrella Spot</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </View>
        </View>
      </TouchableOpacity>

      {/* ── BENTO SUB-SERVICES SHORTCUTS ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Beach Services Hub</Text>
        
        <View style={styles.bentoGrid}>
          <TouchableOpacity 
            style={[styles.bentoCardLarge, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleSubService('parking')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#023E5815' }]}>
              <Ionicons name="car" size={24} color="#023E58" />
            </View>
            <View style={styles.bentoTextWrap}>
              <Text style={[styles.bentoTitle, { color: colors.text }]}>Secure Beach Parking</Text>
              <Text style={[styles.bentoDesc, { color: colors.muted }]}>Book entry slots in advance.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>

          <View style={styles.bentoRow}>
            <TouchableOpacity 
              style={[styles.bentoCardSmall, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSubService('food')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F4A26115' }]}>
                <Ionicons name="restaurant" size={20} color="#F4A261" />
              </View>
              <Text style={[styles.bentoTitleSmall, { color: colors.text }]}>Food to Sunbed</Text>
              <Text style={[styles.bentoDescSmall, { color: colors.muted }]}>Order drinks & snacks.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bentoCardSmall, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSubService('massage')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#845EC215' }]}>
                <Ionicons name="heart" size={20} color="#845EC2" />
              </View>
              <Text style={[styles.bentoTitleSmall, { color: colors.text }]}>Beach Massage</Text>
              <Text style={[styles.bentoDescSmall, { color: colors.muted }]}>Relaxation booking.</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bentoRow}>
            <TouchableOpacity 
              style={[styles.bentoCardSmall, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSubService('beach-items')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#0a254015' }]}>
                <Ionicons name="water" size={20} color="#0a2540" />
              </View>
              <Text style={[styles.bentoTitleSmall, { color: colors.text }]}>Water Rides</Text>
              <Text style={[styles.bentoDescSmall, { color: colors.muted }]}>Jet-skis & banana boats.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.bentoCardSmall, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSubService('powerbank')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#06D6A015' }]}>
                <Ionicons name="battery-charging" size={20} color="#06D6A0" />
              </View>
              <Text style={[styles.bentoTitleSmall, { color: colors.text }]}>Power Bank</Text>
              <Text style={[styles.bentoDescSmall, { color: colors.muted }]}>Keep device charged.</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── BROWSE ALL COASTAL BEACHES ── */}
      <TouchableOpacity 
        style={[styles.browseAllBtn, { borderColor: '#00a896' }]}
        onPress={() => onSearchAll()}
      >
        <Text style={[styles.browseAllText, { color: '#00a896' }]}>Browse All Beaches</Text>
        <Ionicons name="arrow-forward" size={16} color="#00a896" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  weatherCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weatherTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B98112',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flagCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flagLabel: {
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 14,
    fontFamily: 'mon-b',
    marginTop: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: 'mon-sb',
  },
  gridBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,37,64,0.7)',
    padding: 20,
    justifyContent: 'flex-end',
    gap: 4,
  },
  bannerBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#00a896',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bannerBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'mon-b',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'mon-b',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'mon',
    lineHeight: 15,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  bannerActionText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  bentoGrid: {
    gap: 10,
  },
  bentoCardLarge: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoTextWrap: {
    flex: 1,
    gap: 2,
  },
  bentoTitle: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  bentoDesc: {
    fontSize: 10,
    fontFamily: 'mon',
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bentoCardSmall: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  bentoTitleSmall: {
    fontSize: 12,
    fontFamily: 'mon-b',
    marginTop: 4,
  },
  bentoDescSmall: {
    fontSize: 9,
    fontFamily: 'mon',
  },
  browseAllBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  browseAllText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
  },
});
