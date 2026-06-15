/**
 * RIHLA — Dedicated Filter Screen
 * ──────────────────────────────────
 * Full-screen filter experience based on the StaysFilters template.
 * Sections: Environment, Geo-Region, Service Category, Price Range, Rating, Region (wilaya).
 * Writes to useFilterStore; discover screen reads from it.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import {
  GeoRegion,
  Environment,
  ServiceCategory,
} from '@/constants/destinations';
import { useTranslation } from '@/context/I18nContext';
import { useTheme } from '@/context/ThemeContext';
import { useFilterStore } from '@/store/useFilterStore';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

// ── Constants ──
const GEO_REGIONS: { key: GeoRegion; label: string; icon: string }[] = [
  { key: 'East', label: 'East', icon: 'trending-up-outline' },
  { key: 'Center', label: 'Center', icon: 'ellipse-outline' },
  { key: 'West', label: 'West', icon: 'trending-down-outline' },
  { key: 'Desert', label: 'Desert', icon: 'sunny-outline' },
];

const ENVIRONMENTS: { key: Environment; label: string; emoji: string; color: string }[] = [
  { key: 'beach', label: 'Beach', emoji: '🏖️', color: RIHLA.accent },
  { key: 'desert', label: 'Desert', emoji: '🏜️', color: '#C56A39' },
];

const SERVICE_CATEGORIES: { key: ServiceCategory; label: string; icon: string }[] = [
  { key: 'spots', label: 'Beach Spots', icon: 'umbrella-outline' },
  { key: 'food', label: 'Food & Drinks', icon: 'restaurant-outline' },
  { key: 'camel_trek', label: 'Camel Trek', icon: 'leaf-outline' },
  { key: 'jetski', label: 'Jetski', icon: 'boat-outline' },
  { key: 'massage', label: 'Spa & Massage', icon: 'hand-left-outline' },
  { key: 'parking', label: 'Parking', icon: 'car-outline' },
  { key: 'photos', label: 'Photography', icon: 'camera-outline' },
  { key: 'guide', label: 'Tour Guide', icon: 'compass-outline' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 3.5, label: 'Good 3.5+' },
  { value: 4.0, label: 'Very good 4+' },
  { value: 4.5, label: 'Excellent 4.5+' },
];

const PRICE_PRESETS = [
  { min: 0, max: 50000, label: 'Any price' },
  { min: 0, max: 2000, label: 'Budget (under 2,000)' },
  { min: 2000, max: 8000, label: 'Mid-range (2k–8k)' },
  { min: 8000, max: 20000, label: 'Premium (8k–20k)' },
  { min: 20000, max: 50000, label: 'Luxury (20k+)' },
];

const REGION_OPTIONS = [
  'All regions',
  'Algiers', 'Oran', 'Constantine', 'Annaba', 'Bejaia',
  'Tlemcen', 'Blida', 'Tipaza', 'Jijel', 'Skikda',
  'Tizi Ouzou', 'Bouira', 'Medea', 'Setif', 'Batna',
  'Ghardaia', 'Tamanrasset', 'Timimoun', 'Djanet',
];

export default function FilterScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const store = useFilterStore();

  // Local draft state (user edits these, then hits Apply)
  const [geoRegion, setGeoRegion] = useState<GeoRegion | null>(store.geoRegion);
  const [environment, setEnvironment] = useState<Environment | null>(store.environment);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(store.serviceCategory);
  const [minRating, setMinRating] = useState<number>(store.minRating);
  const [priceIdx, setPriceIdx] = useState<number>(() => {
    // Find matching preset or default to 0
    return PRICE_PRESETS.findIndex(
      (p) => p.min === store.priceMin && p.max === store.priceMax
    ) || 0;
  });
  const [selectedRegion, setSelectedRegion] = useState<string>(store.region ?? 'All regions');

  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;

  const handleApply = () => {
    hapticSuccess();
    const preset = PRICE_PRESETS[priceIdx];
    store.applyFilters({
      geoRegion,
      environment,
      serviceCategory,
      minRating,
      priceMin: preset.min,
      priceMax: preset.max,
      region: selectedRegion === 'All regions' ? null : selectedRegion,
    });
    router.back();
  };

  const handleReset = () => {
    hapticLight();
    setGeoRegion(null);
    setEnvironment(null);
    setServiceCategory(null);
    setMinRating(0);
    setPriceIdx(0);
    setSelectedRegion('All regions');
  };

  const isDirty =
    geoRegion !== store.geoRegion ||
    environment !== store.environment ||
    serviceCategory !== store.serviceCategory ||
    minRating !== store.minRating ||
    PRICE_PRESETS[priceIdx].min !== store.priceMin ||
    PRICE_PRESETS[priceIdx].max !== store.priceMax ||
    (selectedRegion === 'All regions' ? null : selectedRegion) !== store.region;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {/* Uber Dark Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.bg }]}>
        <Pressable onPress={() => safeGoBack()} style={[styles.backBtn, { backgroundColor: colors.border }]}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Filters</Text>
        </View>
        <Pressable onPress={handleReset} style={styles.resetBtn}>
          <Text style={[styles.resetBtnText, { color: colors.muted }]}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── ENVIRONMENT ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t('discover.environment').toUpperCase()}</Text>
          <View style={styles.envRow}>
            {ENVIRONMENTS.map((env) => (
              <Pressable
                key={env.key}
                style={[
                  styles.envCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  environment === env.key && {
                    borderColor: env.color,
                    backgroundColor: env.color + '10',
                  },
                ]}
                onPress={() => {
                  hapticLight();
                  setEnvironment(environment === env.key ? null : env.key);
                }}
              >
                <Text style={styles.envEmoji}>{env.emoji}</Text>
                <Text
                  style={[
                    styles.envLabel,
                    { color: colors.text },
                    environment === env.key && { color: env.color, fontFamily: 'mon-b' },
                  ]}
                >
                  {env.label}
                </Text>
                {environment === env.key && (
                  <View style={[styles.envCheck, { backgroundColor: env.color }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* ── GEO-REGION ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t('discover.geoRegion').toUpperCase()}</Text>
          <View style={styles.chipGrid}>
            {GEO_REGIONS.map((gr) => (
              <Pressable
                key={gr.key}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }, geoRegion === gr.key && styles.chipActive]}
                onPress={() => {
                  hapticLight();
                  setGeoRegion(geoRegion === gr.key ? null : gr.key);
                }}
              >
                <Ionicons
                  name={gr.icon as any}
                  size={14}
                  color={geoRegion === gr.key ? '#FFFFFF' : colors.muted}
                />
                <Text style={[styles.chipText, { color: colors.muted }, geoRegion === gr.key && styles.chipTextActive]}>
                  {gr.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* ── SERVICE CATEGORY ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t('discover.serviceCategory').toUpperCase()}</Text>
          <View style={styles.chipGrid}>
            {SERVICE_CATEGORIES.map((sc) => (
              <Pressable
                key={sc.key}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }, serviceCategory === sc.key && styles.chipActive]}
                onPress={() => {
                  hapticLight();
                  setServiceCategory(serviceCategory === sc.key ? null : sc.key);
                }}
              >
                <Ionicons
                  name={sc.icon as any}
                  size={14}
                  color={serviceCategory === sc.key ? '#FFFFFF' : colors.muted}
                />
                <Text style={[styles.chipText, { color: colors.muted }, serviceCategory === sc.key && styles.chipTextActive]}>
                  {sc.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* ── PRICE RANGE ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>PRICE RANGE</Text>
          <Text style={[styles.sectionSub, { color: colors.muted }]}>Prices in Algerian Dinar (DZD)</Text>
          <View style={styles.priceList}>
            {PRICE_PRESETS.map((preset, i) => (
              <Pressable
                key={preset.label}
                style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }, priceIdx === i && styles.filterRowActive]}
                onPress={() => {
                  hapticLight();
                  setPriceIdx(i);
                }}
              >
                <Text style={[styles.filterRowLabel, { color: colors.text }, priceIdx === i && styles.filterRowLabelActive]}>
                  {preset.label}
                </Text>
                <View style={[styles.radio, { borderColor: colors.border }, priceIdx === i && styles.radioActive]}>
                  {priceIdx === i && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* ── GUEST RATING ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>GUEST RATING</Text>
          <View style={styles.priceList}>
            {RATING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }, minRating === opt.value && styles.filterRowActive]}
                onPress={() => {
                  hapticLight();
                  setMinRating(opt.value);
                }}
              >
                <View style={styles.filterRowLeft}>
                  <Text style={[styles.filterRowLabel, { color: colors.text }, minRating === opt.value && styles.filterRowLabelActive]}>
                    {opt.label}
                  </Text>
                  {opt.value > 0 && (
                    <View style={styles.ratingStars}>
                      {Array.from({ length: Math.ceil(opt.value) }).map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < Math.floor(opt.value) ? 'star' : 'star-half'}
                          size={12}
                          color={RIHLA.highlight}
                        />
                      ))}
                    </View>
                  )}
                </View>
                <View style={[styles.radio, { borderColor: colors.border }, minRating === opt.value && styles.radioActive]}>
                  {minRating === opt.value && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            ))}
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* ── REGION (Wilaya) ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.muted }]}>WILAYA / REGION</Text>
          <View style={styles.chipGrid}>
            {REGION_OPTIONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }, selectedRegion === r && styles.chipActive]}
                onPress={() => {
                  hapticLight();
                  setSelectedRegion(r);
                }}
              >
                <Text style={[styles.chipText, { color: colors.muted }, selectedRegion === r && styles.chipTextActive]}>
                  {r}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── STICKY FOOTER ── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={[styles.footerShadow, { backgroundColor: colors.bg }]} />
        <View style={styles.footerInfo}>
          <Text style={[styles.footerReset, { color: colors.muted }]} onPress={handleReset}>
            Clear all
          </Text>
        </View>
        <Pressable
          style={[styles.applyBtn, !isDirty && !store.hasActiveFilters && { opacity: 0.6 }]}
          onPress={handleApply}
        >
          <Text style={styles.applyBtnText}>Show results</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'mon-b' },
  resetBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  resetBtnText: { fontSize: 14, fontFamily: 'mon-sb' },

  // Scroll
  scrollContent: { paddingTop: 8 },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 4 },
  sectionLabel: { fontSize: 11, fontFamily: 'mon-b', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  sectionSub: { fontSize: 12, fontFamily: 'mon', marginBottom: 10, marginTop: -4 },
  divider: { height: 1, marginTop: 16 },

  // Environment cards
  envRow: { flexDirection: 'row', gap: 12 },
  envCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  envEmoji: { fontSize: 24 },
  envLabel: { flex: 1, fontSize: 14, fontFamily: 'mon-sb' },
  envCheck: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  // Chips grid
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: RIHLA.primary, borderColor: RIHLA.primary },
  chipText: { fontSize: 13, fontFamily: 'mon-sb' },
  chipTextActive: { color: '#FFFFFF' },

  // Filter rows (radio)
  priceList: { gap: 2 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  filterRowActive: { borderColor: RIHLA.primary, backgroundColor: RIHLA.primary + '08' },
  filterRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  filterRowLabel: { fontSize: 14, fontFamily: 'mon' },
  filterRowLabelActive: { fontFamily: 'mon-b', color: RIHLA.primary },
  ratingStars: { flexDirection: 'row', gap: 2 },

  // Radio
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: RIHLA.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: RIHLA.primary },

  // Footer
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerShadow: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    height: 8,
  },
  footerInfo: {},
  footerReset: { fontSize: 14, fontFamily: 'mon-sb', textDecorationLine: 'underline' },
  applyBtn: {
    backgroundColor: RIHLA.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: RIHLA.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  applyBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#FFFFFF' },
});
