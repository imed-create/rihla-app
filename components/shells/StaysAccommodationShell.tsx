/**
 * RIHLA — Shell 1: Stays & Accommodation
 * Date-range calendar reservation picker, capacity items, amenity grid.
 * Categories: hotel, rental
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Listing, HotelMetadata, RentalMetadata } from '@/types/service';

type Props = { listing: Listing };

export default function StaysAccommodationShell({ listing }: Props) {
  const { colors } = useTheme();
  const m = listing.metadata;
  const isHotel = m.kind === 'hotel';
  const meta = m as HotelMetadata | RentalMetadata;

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [nights, setNights] = useState(1);

  const pricePerNight = isHotel
    ? (m as HotelMetadata).price_per_night_dzd
    : (m as RentalMetadata).price_per_night_dzd;
  const total = pricePerNight * nights;

  return (
    <View style={styles.container}>
      {/* CAPACITY STRIP */}
      <View style={styles.capacityStrip}>
        {isHotel ? (
          <>
            <CapacityPill icon="bed-outline" value={`${(m as HotelMetadata).room_count}`} label="Rooms" colors={colors} />
            <CapacityPill icon="star" value={`${(m as HotelMetadata).star_rating}`} label="Stars" colors={colors} />
            <CapacityPill
              icon="restaurant-outline"
              value={(m as HotelMetadata).breakfast_included ? 'Yes' : 'No'}
              label="Breakfast"
              colors={colors}
            />
          </>
        ) : (
          <>
            <CapacityPill icon="bed-outline" value={`${(m as RentalMetadata).bedrooms}`} label="Beds" colors={colors} />
            <CapacityPill icon="water-outline" value={`${(m as RentalMetadata).bathrooms}`} label="Baths" colors={colors} />
            <CapacityPill icon="people-outline" value={`${(m as RentalMetadata).max_guests}`} label="Guests" colors={colors} />
            <CapacityPill icon="home-outline" value={(m as RentalMetadata).property_type} label="Type" colors={colors} />
          </>
        )}
      </View>

      {/* DATE RANGE PICKER */}
      <View style={[styles.datePickerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Select Dates</Text>
        <View style={styles.dateRow}>
          <DateBlock label="Check-in" value={checkIn ?? 'Add date'} active={!checkIn} colors={colors} onPress={() => {
            const d = new Date(); d.setDate(d.getDate() + 1);
            setCheckIn(d.toISOString().slice(0, 10));
          }} />
          <View style={styles.dateArrow}>
            <Ionicons name="arrow-forward" size={16} color={RIHLA.accent} />
          </View>
          <DateBlock label="Check-out" value={checkOut ?? 'Add date'} active={!checkOut} colors={colors} onPress={() => {
            const d = new Date(); d.setDate(d.getDate() + 1 + nights);
            setCheckOut(d.toISOString().slice(0, 10));
          }} />
        </View>
        <View style={styles.nightsRow}>
          <Text style={[styles.nightsLabel, { color: colors.muted }]}>Nights</Text>
          <View style={styles.nightsControl}>
            <Pressable style={[styles.nightsBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setNights(Math.max(1, nights - 1))}>
              <Ionicons name="remove" size={16} color={colors.text} />
            </Pressable>
            <Text style={[styles.nightsValue, { color: colors.text }]}>{nights}</Text>
            <Pressable style={[styles.nightsBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setNights(Math.min(30, nights + 1))}>
              <Ionicons name="add" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* AMENITIES GRID */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
        <View style={styles.amenityGrid}>
          {(isHotel ? (m as HotelMetadata).amenities : (m as RentalMetadata).amenities).map((a) => (
            <View key={a} style={[styles.amenityChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={getAmenityIcon(a) as any} size={14} color={RIHLA.accent} />
              <Text style={[styles.amenityText, { color: colors.text }]}>{a}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* PRICE BREAKDOWN */}
      <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: colors.muted }]}>{pricePerNight.toLocaleString()} DA × {nights} nights</Text>
          <Text style={[styles.priceValue, { color: colors.text }]}>{total.toLocaleString()} DA</Text>
        </View>
        <View style={[styles.priceRow, styles.priceTotal, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString()} DA</Text>
        </View>
      </View>
    </View>
  );
}

function CapacityPill({ icon, value, label, colors }: { icon: string; value: string; label: string; colors: any }) {
  return (
    <View style={[styles.capacityPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon as any} size={14} color={RIHLA.accent} />
      <Text style={[styles.capacityValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.capacityLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function DateBlock({ label, value, active, colors, onPress }: { label: string; value: string; active: boolean; colors: any; onPress: () => void }) {
  return (
    <Pressable style={[styles.dateBlock, { backgroundColor: colors.card, borderColor: colors.border }, active && { borderColor: RIHLA.accent + '40' }]} onPress={onPress}>
      <Text style={[styles.dateLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.dateValue, { color: colors.text }, active && { color: colors.muted }]}>{value}</Text>
    </Pressable>
  );
}

function getAmenityIcon(a: string): string {
  const map: Record<string, string> = {
    wifi: 'wifi', pool: 'water', parking: 'car', restaurant: 'restaurant',
    spa: 'flower', gym: 'barbell', bar: 'wine', beach: 'umbrella',
    ac: 'snow', kitchen: 'restaurant', washer: 'water', balcony: 'sunny',
    garden: 'leaf', bbq: 'flame', terrace: 'sunny', courtyard: 'home',
    rooftop: 'arrow-up', stargazing: 'star', campfire: 'flame',
    kids_club: 'people', water_sports: 'boat',
  };
  return map[a] ?? 'checkmark-circle';
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  capacityStrip: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  capacityPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, flex: 1, minWidth: 80,
  },
  capacityValue: { fontSize: 14, fontFamily: 'mon-b' },
  capacityLabel: { fontSize: 10, fontFamily: 'mon', marginLeft: -2 },

  datePickerCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontFamily: 'mon-b', marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateBlock: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1 },
  dateLabel: { fontSize: 10, fontFamily: 'mon', marginBottom: 4 },
  dateValue: { fontSize: 13, fontFamily: 'mon-sb' },
  dateArrow: { padding: 4 },
  nightsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  nightsLabel: { fontSize: 13, fontFamily: 'mon' },
  nightsControl: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nightsBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  nightsValue: { fontSize: 16, fontFamily: 'mon-b', minWidth: 24, textAlign: 'center' },

  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  amenityText: { fontSize: 12, fontFamily: 'mon-sb' },

  priceCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 13, fontFamily: 'mon' },
  priceValue: { fontSize: 13, fontFamily: 'mon-sb' },
  priceTotal: { borderTopWidth: 1, paddingTop: 8, marginBottom: 0 },
  totalLabel: { fontSize: 15, fontFamily: 'mon-b' },
  totalValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.accent },
});
