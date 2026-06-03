import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import StackHeader from '@/components/StackHeader';
import ConfirmButton from '@/components/ConfirmButton';
import { PartnerServiceStatus, usePartnerServices } from '@/store/usePartnerServices';

export default function PartnerServiceDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getServiceById, updateService, removeService } = usePartnerServices();
  const service = getServiceById(id);

  const [title, setTitle] = useState(service?.title ?? '');
  const [price, setPrice] = useState(service ? String(service.pricePerHourDzd) : '');
  const [notes, setNotes] = useState(service?.notes ?? '');

  const canSave = useMemo(() => title.trim().length >= 3 && Number(price) > 0, [title, price]);

  if (!service) {
    return (
      <SafeAreaView style={styles.root}>
        <StackHeader title="Service" subtitle="Not found" />
        <View style={styles.missing}>
          <Ionicons name="alert-circle-outline" size={44} color="#CBD5E1" />
          <Text style={styles.missingTitle}>This service doesn’t exist</Text>
          <TouchableOpacity style={styles.backCta} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.backCtaText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const setStatus = (status: PartnerServiceStatus) => updateService(service.id, { status });

  const handleSave = () => {
    if (!canSave) return;
    updateService(service.id, {
      title: title.trim(),
      pricePerHourDzd: Number(price),
      notes: notes.trim() || undefined,
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete service?', 'This will remove it from your dashboard.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeService(service.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StackHeader
        title="Service"
        subtitle={service.status === 'published' ? 'Published' : 'Draft'}
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
              <Ionicons name="flash-outline" size={18} color="#f4a261" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {service.title}
              </Text>
              <Text style={styles.heroSub} numberOfLines={1}>
                {service.category} · {prettyAsset(service.assetType)}
              </Text>
            </View>
            <View style={[styles.statusPill, pillStyle(service.status)]}>
              <Text style={[styles.statusText, pillTextStyle(service.status)]}>{service.status}</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <ActionChip
              label="Publish"
              icon="rocket-outline"
              color="#f4a261"
              disabled={service.status === 'published'}
              onPress={() => setStatus('published')}
            />
            <ActionChip
              label="Pause"
              icon="pause-outline"
              color="#B45309"
              disabled={service.status === 'paused'}
              onPress={() => setStatus('paused')}
            />
            <ActionChip
              label="Draft"
              icon="document-text-outline"
              color="#64748B"
              disabled={service.status === 'draft'}
              onPress={() => setStatus('draft')}
            />
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#94A3B8" />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Price per hour (DZD)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            style={styles.input}
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, { height: 110, paddingTop: 12 }]}
            placeholderTextColor="#94A3B8"
            multiline
          />
        </View>

        <ConfirmButton label={canSave ? 'Save changes' : 'Add title + price'} onPress={handleSave} />
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

function prettyAsset(s: string) {
  return (s || 'asset').replace(/-/g, ' ');
}

function pillStyle(status: string) {
  if (status === 'published') return { backgroundColor: '#ECFDF5' };
  if (status === 'paused') return { backgroundColor: '#FEF3C7' };
  return { backgroundColor: '#F1F5F9' };
}

function pillTextStyle(status: string) {
  if (status === 'published') return { color: '#f4a261' };
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
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  heroSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2, textTransform: 'capitalize' },
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

