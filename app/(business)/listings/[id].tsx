import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import StackHeader from '@/components/StackHeader';
import ConfirmButton from '@/components/ConfirmButton';
import { BusinessListingStatus, BusinessType, useBusinessListings } from '@/store/useBusinessListings';

const TYPES: { id: BusinessType; label: string }[] = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'resort', label: 'Resort' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'cafe', label: 'Café' },
  { id: 'event-venue', label: 'Event venue' },
  { id: 'tour-office', label: 'Tour office' },
  { id: 'other', label: 'Other' },
];

export default function BusinessListingDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getListingById, updateListing, removeListing } = useBusinessListings();
  const listing = getListingById(id);

  const [name, setName] = useState(listing?.name ?? '');
  const [city, setCity] = useState(listing?.city ?? '');
  const [address, setAddress] = useState(listing?.address ?? '');
  const [priceFrom, setPriceFrom] = useState(
    listing?.priceFromDzd !== undefined ? String(listing.priceFromDzd) : ''
  );

  const canSave = useMemo(() => name.trim().length >= 3 && city.trim().length >= 2, [name, city]);

  if (!listing) {
    return (
      <SafeAreaView style={styles.root}>
        <StackHeader title="Listing" subtitle="Not found" />
        <View style={styles.missing}>
          <Ionicons name="alert-circle-outline" size={44} color="#CBD5E1" />
          <Text style={styles.missingTitle}>This listing doesn’t exist</Text>
          <TouchableOpacity style={styles.backCta} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.backCtaText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const setStatus = (status: BusinessListingStatus) => updateListing(listing.id, { status });

  const handleSave = () => {
    if (!canSave) return;
    updateListing(listing.id, {
      name: name.trim(),
      city: city.trim(),
      address: address.trim() || undefined,
      priceFromDzd: priceFrom ? Number(priceFrom) : undefined,
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete listing?', 'This will remove it from your dashboard.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeListing(listing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StackHeader
        title="Listing"
        subtitle={listing.status === 'published' ? 'Published' : 'Draft'}
        right={
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name="storefront-outline" size={18} color="#0a2540" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {listing.name}
              </Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {labelType(listing.businessType)} · {listing.city}
              </Text>
            </View>
            <View style={[styles.statusPill, pillStyle(listing.status)]}>
              <Text style={[styles.statusText, pillTextStyle(listing.status)]}>{listing.status}</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <ActionChip
              label="Publish"
              icon="rocket-outline"
              color="#0a2540"
              disabled={listing.status === 'published'}
              onPress={() => setStatus('published')}
            />
            <ActionChip
              label="Pause"
              icon="pause-outline"
              color="#B45309"
              disabled={listing.status === 'paused'}
              onPress={() => setStatus('paused')}
            />
            <ActionChip
              label="Draft"
              icon="document-text-outline"
              color="#64748B"
              disabled={listing.status === 'draft'}
              onPress={() => setStatus('draft')}
            />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Listing name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Business type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => {
              const active = t.id === listing.businessType;
              return (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.85}
                  onPress={() => updateListing(listing.id, { businessType: t.id })}
                  style={[styles.typePill, active && styles.typePillActive]}
                >
                  <Text style={[styles.typeText, active && styles.typeTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.block, { flex: 1 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholderTextColor="#94A3B8" />
          </View>
          <View style={[styles.block, { flex: 1 }]}>
            <Text style={styles.label}>From (DZD)</Text>
            <TextInput
              value={priceFrom}
              onChangeText={setPriceFrom}
              keyboardType="number-pad"
              style={styles.input}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Address</Text>
          <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholderTextColor="#94A3B8" />
        </View>

        <ConfirmButton label={canSave ? 'Save changes' : 'Add name + city'} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionChip({
  label,
  icon,
  color,
  onPress,
  disabled,
}: {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.actionChip,
        { borderColor: color + '40', backgroundColor: disabled ? '#F1F5F9' : '#FFFFFF' },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <Ionicons name={icon as any} size={14} color={disabled ? '#94A3B8' : color} />
      <Text style={[styles.actionChipText, { color: disabled ? '#94A3B8' : '#0F172A' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function labelType(type: string) {
  const map: Record<string, string> = {
    hotel: 'Hotel',
    resort: 'Resort',
    restaurant: 'Restaurant',
    cafe: 'Café',
    'event-venue': 'Venue',
    'tour-office': 'Tour office',
    other: 'Other',
  };
  return map[type] ?? 'Other';
}

function pillStyle(status: string) {
  if (status === 'published') return { backgroundColor: '#ECFDF5' };
  if (status === 'paused') return { backgroundColor: '#FEF3C7' };
  return { backgroundColor: '#F1F5F9' };
}

function pillTextStyle(status: string) {
  if (status === 'published') return { color: '#0a2540' };
  if (status === 'paused') return { color: '#B45309' };
  return { color: '#64748B' };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  heroSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 11, fontFamily: 'mon-sb', textTransform: 'capitalize' },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  actionChipText: { fontSize: 12, fontFamily: 'mon-sb' },
  block: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },
  input: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'mon-sb',
    color: '#0F172A',
  },
  row: { flexDirection: 'row', gap: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typePillActive: { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' },
  typeText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
  typeTextActive: { color: '#0a2540' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 36 },
  missingTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  backCta: {
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backCtaText: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
});

