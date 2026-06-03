import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import StackHeader from '@/components/StackHeader';
import ConfirmButton from '@/components/ConfirmButton';
import { PartnerServiceCategory, usePartnerServices } from '@/store/usePartnerServices';

const CATEGORIES: { id: PartnerServiceCategory; label: string; icon: string; color: string }[] = [
  { id: 'beach', label: 'Beach', icon: 'sunny-outline', color: '#00a896' },
  { id: 'desert', label: 'Desert', icon: 'flame-outline', color: '#E76F51' },
  { id: 'mountain', label: 'Mountain', icon: 'leaf-outline', color: '#2D6A4F' },
  { id: 'city', label: 'City', icon: 'business-outline', color: '#6C63FF' },
  { id: 'historical', label: 'Historical', icon: 'library-outline', color: '#8B5E3C' },
  { id: 'other', label: 'Other', icon: 'cube-outline', color: '#64748B' },
];

export default function NewPartnerService() {
  const { addService } = usePartnerServices();

  const [title, setTitle] = useState('');
  const [assetType, setAssetType] = useState('');
  const [category, setCategory] = useState<PartnerServiceCategory>('beach');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const canSubmit = useMemo(() => title.trim().length >= 3 && assetType.trim().length >= 2 && Number(price) > 0, [
    title,
    assetType,
    price,
  ]);

  const handleCreate = () => {
    if (!canSubmit) return;
    const created = addService({
      title: title.trim(),
      category,
      assetType: assetType.trim().toLowerCase().replace(/\s+/g, '-'),
      pricePerHourDzd: Number(price),
      notes: notes.trim() || undefined,
      status: 'draft',
    });
    router.replace(`/(partner)/services/${created.id}` as any);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StackHeader title="New service" subtitle="Create a draft first" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.block}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Jet ski rental (1 hour)"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Asset type</Text>
          <TextInput
            value={assetType}
            onChangeText={setAssetType}
            placeholder="Jet ski, buggy, camel..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />
          <Text style={styles.hint}>Tip: keep it short. You can add details in Notes.</Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => {
              const active = c.id === category;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.chip,
                    active && { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' },
                  ]}
                  onPress={() => setCategory(c.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons name={c.icon as any} size={14} color={active ? '#f4a261' : '#64748B'} />
                  <Text style={[styles.chipText, active && { color: '#f4a261' }]}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Price per hour (DZD)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="5000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Safety rules, meeting point, requirements..."
            placeholderTextColor="#94A3B8"
            style={[styles.input, { height: 96, paddingTop: 12 }]}
            multiline
          />
        </View>

        <View style={styles.footer}>
          <ConfirmButton label={canSubmit ? 'Create draft' : 'Fill required fields'} onPress={handleCreate} />
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
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: '#64748B' },
  footer: { paddingTop: 6 },
});

