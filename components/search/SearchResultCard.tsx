/**
 * RIHLA — Category-Specific Search Result Cards
 * ----------------------------------------------
 * Each marketplace category renders a distinct card layout
 * showing the most relevant metadata for that vertical.
 * Supports dark/light theme.
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import type { Listing, MarketplaceCategory } from '@/types/service';

type Props = { item: Listing; isWide?: boolean };

export default function SearchResultCard({ item, isWide }: Props) {
  const catDef = getCategoryDef(item.category);
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, isWide && { width: '48%' }]}
      onPress={() => router.push(`/listing/${item.id}` as any)}
    >
      <View style={[styles.imageArea, { backgroundColor: catDef.color + '12' }]}>
        <Ionicons name={catDef.icon as any} size={28} color={catDef.color} />
        {item.is_featured && (
          <View style={styles.featBadge}>
            <Text style={styles.featBadgeText}>Featured</Text>
          </View>
        )}
        {item.is_vip && (
          <View style={[styles.vipBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="diamond" size={10} color="#f4a261" />
            <Text style={styles.vipBadgeText}>VIP</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        {/* Top row: category badge + rating */}
        <View style={styles.topRow}>
          <View style={[styles.catBadge, { backgroundColor: catDef.color + '15' }]}>
            <Ionicons name={catDef.icon as any} size={10} color={catDef.color} />
            <Text style={[styles.catBadgeText, { color: catDef.color }]}>{catDef.label}</Text>
          </View>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#FFD166" />
            <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
            <Text style={[styles.reviewCount, { color: colors.muted }]}>({item.review_count})</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>

        {/* Category-specific metadata */}
        <CategoryMeta item={item} isDark={isDark} colors={colors} />

        {/* Bottom row: location + price */}
        <View style={styles.bottom}>
          <Text style={[styles.location, { color: colors.muted }]}>
            <Ionicons name="location" size={10} color={colors.muted} /> {item.wilaya}
          </Text>
          <PriceDisplay item={item} />
        </View>
      </View>
    </Pressable>
  );
}

// ─── Category-Specific Metadata Rows ───────────────────────

function CategoryMeta({ item, isDark, colors }: { item: Listing; isDark: boolean; colors: any }) {
  const m = item.metadata as any;
  const metaBg = isDark ? '#1A1A1A' : '#F1F5F9';
  const metaText = isDark ? '#94A3B8' : '#64748B';

  const metaChipStyle = { backgroundColor: metaBg };

  switch (item.category) {
    case 'hotel':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="star" label={`${m.star_rating}-star`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="bed" label={m.room_types?.[0] || 'Room'} bgColor={metaBg} textColor={metaText} />
          {m.breakfast_included && <MetaChip icon="cafe" label="Breakfast" bgColor={metaBg} textColor={metaText} />}
          <MetaChip icon="time" label={`${m.check_in_time}–${m.check_out_time}`} bgColor={metaBg} textColor={metaText} />
        </View>
      );
    case 'restaurant':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="restaurant" label={m.cuisine_types?.[0] || 'Dining'} bgColor={metaBg} textColor={metaText} />
          {m.reservation_required && <MetaChip icon="calendar" label="Reservation" bgColor={metaBg} textColor={metaText} />}
          {m.delivery_available && <MetaChip icon="bicycle" label="Delivery" bgColor={metaBg} textColor={metaText} />}
          <MetaChip icon="time" label={m.opening_hours} bgColor={metaBg} textColor={metaText} />
        </View>
      );
    case 'beach':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="flag" label={`${m.zone} zone`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="grid" label={`${m.total_rows}×${m.total_cols}`} bgColor={metaBg} textColor={metaText} />
          {m.hold_enabled && <MetaChip icon="timer" label={`${m.hold_duration_minutes}min hold`} bgColor={metaBg} textColor={metaText} />}
          {m.services?.length > 0 && <MetaChip icon="apps" label={`${m.services.length} services`} bgColor={metaBg} textColor={metaText} />}
        </View>
      );
    case 'rental':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="bed" label={`${m.bedrooms} bed`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="water" label={`${m.bathrooms} bath`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="people" label={`${m.max_guests} guests`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="home" label={m.property_type} bgColor={metaBg} textColor={metaText} />
        </View>
      );
    case 'driver':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="car" label={m.vehicle_type} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="pricetag" label={`${m.price_per_km_dzd} DZD/km`} bgColor={metaBg} textColor={metaText} />
          {m.airport_transfer && <MetaChip icon="airplane" label="Airport" bgColor={metaBg} textColor={metaText} />}
          {m.fixed_routes?.length > 0 && (
            <MetaChip icon="route" label={`${m.fixed_routes.length} routes`} bgColor={metaBg} textColor={metaText} />
          )}
        </View>
      );
    case 'activity':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="flash" label={m.activity_type} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="time" label={`${m.session_duration_minutes}min`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="speedometer" label={m.difficulty} bgColor={metaBg} textColor={metaText} />
          {m.equipment_included && <MetaChip icon="build" label="Equipment incl." bgColor={metaBg} textColor={metaText} />}
        </View>
      );
    case 'guide':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="compass" label={m.specialization} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="globe" label={m.languages?.[0] || 'Multi'} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="time" label={`${m.experience_years}yr exp`} bgColor={metaBg} textColor={metaText} />
          {m.group_tours && <MetaChip icon="people" label="Group tours" bgColor={metaBg} textColor={metaText} />}
        </View>
      );
    case 'photographer':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="camera" label={m.style?.[0] || 'Photo'} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="time" label={`${m.turnaround_days}d turnaround`} bgColor={metaBg} textColor={metaText} />
          {m.drone_available && <MetaChip icon="airplane" label="Drone" bgColor={metaBg} textColor={metaText} />}
          {m.packages?.length > 0 && (
            <MetaChip icon="pricetag" label={`${m.packages.length} packages`} bgColor={metaBg} textColor={metaText} />
          )}
        </View>
      );
    case 'event':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="musical-notes" label={m.event_type} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="calendar" label={m.event_date?.slice(5) || 'TBD'} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="time" label={m.start_time} bgColor={metaBg} textColor={metaText} />
          {m.age_restriction && <MetaChip icon="warning" label={m.age_restriction} bgColor={metaBg} textColor={metaText} />}
        </View>
      );
    case 'experience':
      return (
        <View style={styles.metaRow}>
          <MetaChip icon="map" label={`${m.duration_days} days`} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="speedometer" label={m.difficulty} bgColor={metaBg} textColor={metaText} />
          <MetaChip icon="people" label={`Max ${m.max_group_size}`} bgColor={metaBg} textColor={metaText} />
          {m.departure_dates?.length > 0 && (
            <MetaChip icon="calendar" label={`${m.departure_dates.length} dates`} bgColor={metaBg} textColor={metaText} />
          )}
        </View>
      );
    default:
      return null;
  }
}

// ─── Price Display (category-aware) ───────────────────────

function PriceDisplay({ item }: { item: Listing }) {
  const m = item.metadata as any;
  let priceText = `${item.price_dzd.toLocaleString()} DZD`;
  let suffix = '';

  switch (item.category) {
    case 'hotel':
    case 'rental':
      suffix = '/night';
      priceText = `${(m.price_per_night_dzd || item.price_dzd).toLocaleString()} DZD`;
      break;
    case 'driver':
      suffix = '/km';
      priceText = `${m.price_per_km_dzd} DZD`;
      break;
    case 'activity':
      if (m.pricing_model === 'per_person') suffix = '/person';
      break;
    case 'experience':
      suffix = '/person';
      priceText = `${(m.price_per_person_dzd || item.price_dzd).toLocaleString()} DZD`;
      break;
    case 'restaurant':
      suffix = '/meal';
      priceText = `${(m.avg_meal_price_dzd || item.price_dzd).toLocaleString()} DZD`;
      break;
    case 'guide':
      suffix = '/day';
      priceText = `${(m.daily_rate_dzd || item.price_dzd).toLocaleString()} DZD`;
      break;
    case 'beach':
      suffix = '/spot';
      priceText = `${(m.price_per_spot_dzd || item.price_dzd).toLocaleString()} DZD`;
      break;
  }

  return (
    <View style={styles.priceWrap}>
      <Text style={styles.price}>{priceText}</Text>
      {suffix ? <Text style={styles.priceSuffix}>{suffix}</Text> : null}
    </View>
  );
}

// ─── Small reusable chip ──────────────────────────────────

function MetaChip({ icon, label, bgColor, textColor }: { icon: string; label: string; bgColor: string; textColor: string }) {
  return (
    <View style={[styles.metaChip, { backgroundColor: bgColor }]}>
      <Ionicons name={icon as any} size={10} color={textColor} />
      <Text style={[styles.metaChipText, { color: textColor }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1,
    overflow: 'hidden', marginBottom: 4,
  },
  imageArea: {
    height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  featBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#f4a261', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  featBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#FFFFFF' },
  vipBadge: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  vipBadgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#f4a261' },

  info: { padding: 12, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catBadgeText: { fontSize: 9, fontFamily: 'mon-b' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontFamily: 'mon-b' },
  reviewCount: { fontSize: 10, fontFamily: 'mon' },

  title: { fontSize: 14, fontFamily: 'mon-b', marginTop: 2 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4,
  },
  metaChipText: { fontSize: 9, fontFamily: 'mon', maxWidth: 80 },

  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  location: { fontSize: 11, fontFamily: 'mon', flex: 1 },
  priceWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  price: { fontSize: 13, fontFamily: 'mon-b', color: RIHLA.primary },
  priceSuffix: { fontSize: 9, fontFamily: 'mon', color: '#94A3B8' },
});
