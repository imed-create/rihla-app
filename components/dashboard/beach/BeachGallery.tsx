/**
 * RIHLA — Beach Gallery (Business Dashboard)
 * ────────────────────────────────────────────
 * Photo gallery management — upload, organize, caption beach photos.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

const GALLERY_PHOTOS = [
  { id: '1', label: 'Aerial Beach View', category: 'Overview', date: 'Jun 2026' },
  { id: '2', label: 'VIP Cabana Section', category: 'VIP Zone', date: 'May 2026' },
  { id: '3', label: 'Family Area with Umbrellas', category: 'Family Zone', date: 'Jun 2026' },
  { id: '4', label: 'Sunset Lounge', category: 'VIP Zone', date: 'Apr 2026' },
  { id: '5', label: 'Beach Restaurant & Bar', category: 'Services', date: 'May 2026' },
  { id: '6', label: 'Parking Area', category: 'Services', date: 'Jun 2026' },
  { id: '7', label: 'Kids Play Zone', category: 'Family Zone', date: 'Mar 2026' },
  { id: '8', label: 'Event Setup on Beach', category: 'Events', date: 'Jun 2026' },
  { id: '9', label: 'Entrance & Welcome Area', category: 'Overview', date: 'May 2026' },
];

const CATEGORY_ICONS: Record<string, string> = {
  Overview: 'eye-outline',
  'VIP Zone': 'diamond-outline',
  'Family Zone': 'people-outline',
  Services: 'cafe-outline',
  Events: 'calendar-outline',
};

export default function BeachGallery() {
  const [filterCat, setFilterCat] = useState<string>('all');
  const categories = ['all', ...new Set(GALLERY_PHOTOS.map(p => p.category))];

  const filtered = filterCat === 'all' ? GALLERY_PHOTOS : GALLERY_PHOTOS.filter(p => p.category === filterCat);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── STATS ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{GALLERY_PHOTOS.length}</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{categories.length - 1}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>120</Text>
          <Text style={styles.statLabel}>Views/Day</Text>
        </View>
      </View>

      {/* ── CATEGORY FILTER ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catTab, filterCat === cat && { backgroundColor: '#00a896', borderColor: '#00a896' }]}
            onPress={() => { Haptics.selectionAsync(); setFilterCat(cat); }}
          >
            {cat !== 'all' && (
              <Ionicons
                name={(CATEGORY_ICONS[cat] || 'image-outline') as any}
                size={13}
                color={filterCat === cat ? '#fff' : '#00a896'}
              />
            )}
            <Text style={[styles.catTabText, { color: filterCat === cat ? '#fff' : '#00a896' }]}>
              {cat === 'all' ? 'All' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── PHOTO GRID ── */}
      <View style={styles.photoGrid}>
        {filtered.map(photo => (
          <View key={photo.id} style={styles.photoCard}>
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#00a896" />
            </View>
            <View style={styles.photoInfo}>
              <Text style={styles.photoLabel} numberOfLines={1}>{photo.label}</Text>
              <Text style={styles.photoMeta}>{photo.category} · {photo.date}</Text>
            </View>
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoActionBtn}>
                <Ionicons name="create-outline" size={14} color={RIHLA.mutedText} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoActionBtn}>
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add photo card */}
        <TouchableOpacity style={styles.addCard}>
          <Ionicons name="add-circle-outline" size={36} color="#00a896" />
          <Text style={styles.addText}>Upload New Photo</Text>
          <Text style={styles.addSub}>JPG, PNG, HEIC · Max 10MB</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: '#E5E7EB', padding: 14, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },

  catRow: { gap: 8, paddingRight: 8 },
  catTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  catTabText: { fontSize: 12, fontFamily: 'mon-sb' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1,
    borderColor: '#E5E7EB', overflow: 'hidden',
  },
  photoPlaceholder: {
    height: 110, backgroundColor: '#F0FDFA', alignItems: 'center', justifyContent: 'center',
  },
  photoInfo: { padding: 10, gap: 2 },
  photoLabel: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  photoMeta: { fontSize: 10, fontFamily: 'mon', color: '#6B7280' },
  photoActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 8,
    paddingHorizontal: 10, paddingBottom: 10,
  },
  photoActionBtn: { padding: 4 },

  addCard: {
    width: '47%', borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed',
    borderColor: '#00a896', padding: 20, alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#F0FDFA',
  },
  addText: { fontSize: 13, fontFamily: 'mon-b', color: '#00a896' },
  addSub: { fontSize: 9, fontFamily: 'mon', color: '#6B7280' },
});
