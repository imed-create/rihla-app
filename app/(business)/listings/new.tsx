import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import StackHeader from '@/components/StackHeader';
import ConfirmButton from '@/components/ConfirmButton';
import { BusinessType, useBusinessListings } from '@/store/useBusinessListings';

const TYPES: { id: BusinessType; label: string; icon: string }[] = [
  { id: 'hotel', label: 'Hotel', icon: 'bed-outline' },
  { id: 'resort', label: 'Resort', icon: 'sunny-outline' },
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant-outline' },
  { id: 'cafe', label: 'Café', icon: 'cafe-outline' },
  { id: 'event-venue', label: 'Event venue', icon: 'sparkles-outline' },
  { id: 'tour-office', label: 'Tour office', icon: 'map-outline' },
  { id: 'other', label: 'Other', icon: 'business-outline' },
];

export default function NewBusinessListing() {
  const { addListing } = useBusinessListings();

  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('hotel');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [priceFrom, setPriceFrom] = useState('');

  const canSubmit = useMemo(() => name.trim().length >= 3 && city.trim().length >= 2, [name, city]);

  const handleCreate = () => {
    if (!canSubmit) return;
    const created = addListing({
      name: name.trim(),
      businessType,
      city: city.trim(),
      address: address.trim() || undefined,
      priceFromDzd: priceFrom ? Number(priceFrom) : undefined,
      status: 'draft',
    });
    router.replace(`/(business)/listings/${created.id}` as any);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StackHeader title="New listing" subtitle="Create a draft first" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.block}>
          <Text style={styles.label}>Listing name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Hotel El Aurassi"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Business type</Text>
          <View style={styles.chips}>
            {TYPES.map((t) => {
              const active = t.id === businessType;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setBusinessType(t.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={t.icon as any} size={14} color={active ? '#0a2540' : '#64748B'} />
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.block, { flex: 1 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="Algiers"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>
          <View style={[styles.block, { flex: 1 }]}>
            <Text style={styles.label}>From (DZD)</Text>
            <TextInput
              value={priceFrom}
              onChangeText={setPriceFrom}
              placeholder="15000"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Address (optional)</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Street, district"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Text style={styles.hint}>You can refine this later. Drafts aren’t visible to travelers.</Text>
        </View>

        <View style={styles.footer}>
          <ConfirmButton label={canSubmit ? 'Create draft' : 'Add name + city'} onPress={handleCreate} loading={false} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  block: { gap: 8 },
  label: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A' },
  hint: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16 },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { borderColor: '#DDD6FE', backgroundColor: '#F5F3FF' },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
  chipTextActive: { color: '#0a2540' },
  footer: { paddingTop: 6 },
});

