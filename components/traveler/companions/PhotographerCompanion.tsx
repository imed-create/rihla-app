import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import type { AppBooking } from '@/types/app';

interface CompanionProps {
  booking: AppBooking;
  onBack: () => void;
}

const MOCK_PHOTOS = [
  { id: '1', name: 'Golden Hour Portrait #1', size: '4.2 MB', selected: false },
  { id: '2', name: 'Casbah Architecture Wide', size: '5.8 MB', selected: false },
  { id: '3', name: 'Couple at Maqam El Shahid', size: '3.9 MB', selected: false },
  { id: '4', name: 'Bay of Algiers Panorama', size: '7.1 MB', selected: false },
  { id: '5', name: 'Botanical Garden Candid', size: '4.5 MB', selected: false },
  { id: '6', name: 'Notre Dame Close-up', size: '3.2 MB', selected: false },
  { id: '7', name: 'Sunset Silhouette Series', size: '6.0 MB', selected: false },
  { id: '8', name: 'Street Market Colours', size: '4.8 MB', selected: false },
];

export default function PhotographerCompanion({ booking, onBack }: CompanionProps) {
  const { colors, isDark } = useTheme();
  const [photos, setPhotos] = useState(MOCK_PHOTOS);
  const [selectMode, setSelectMode] = useState(false);

  const toggleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p));
  };

  const selectedCount = photos.filter(p => p.selected).length;

  const handleDownload = (single?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (single) {
      Alert.alert('Downloading', `"${single}" is being downloaded to your device...`);
    } else {
      Alert.alert('Bulk Download', `Downloading ${selectedCount} selected photos. They will appear in your gallery shortly!`);
      setPhotos(prev => prev.map(p => ({ ...p, selected: false })));
      setSelectMode(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.border }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Photos Companion</Text>
      </View>

      {/* ── PHOTOGRAPHER PROFILE ── */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.photoRow}>
          <View style={styles.photogAvatar}>
            <Text style={styles.photogAvatarText}>A</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.photogName, { color: colors.text }]}>Amira Kheddar</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#FFD166" />
              <Text style={[styles.ratingText, { color: colors.text }]}>4.9 · Professional Photographer</Text>
            </View>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.sessionInfo}>
          <View style={styles.sessionItem}>
            <Text style={[styles.sessionKey, { color: colors.muted }]}>SESSION</Text>
            <Text style={[styles.sessionVal, { color: colors.text }]}>2-Hour City Photowalk</Text>
          </View>
          <View style={styles.sessionItem}>
            <Text style={[styles.sessionKey, { color: colors.muted }]}>DELIVERED</Text>
            <Text style={[styles.sessionVal, { color: colors.text }]}>{photos.length} high-res images</Text>
          </View>
        </View>
      </View>

      {/* ── DELIVERY STATUS ── */}
      <View style={[styles.statusCard, { backgroundColor: isDark ? '#1A2E1A' : '#ECFDF5', borderColor: isDark ? '#16A34A30' : '#A7F3D0' }]}>
        <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusTitle, { color: '#16A34A' }]}>Photos Delivered!</Text>
          <Text style={[styles.statusSub, { color: isDark ? '#86EFAC' : '#15803D' }]}>All {photos.length} edited images are ready for download</Text>
        </View>
      </View>

      {/* ── GALLERY LOCKER ── */}
      <View style={styles.galleryHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📸 Photo Locker</Text>
        <TouchableOpacity onPress={() => { setSelectMode(!selectMode); if (selectMode) setPhotos(prev => prev.map(p => ({ ...p, selected: false }))); }}>
          <Text style={[styles.selectToggle, { color: '#E11D48' }]}>{selectMode ? 'Cancel' : 'Select'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.galleryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {photos.map((photo, i) => (
          <TouchableOpacity
            key={photo.id}
            style={[styles.photoItem, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            onPress={() => selectMode ? toggleSelect(photo.id) : handleDownload(photo.name)}
          >
            <View style={[styles.thumbPlaceholder, { backgroundColor: isDark ? '#2A2A2A' : '#F1F5F9' }]}>
              <Ionicons name="image" size={20} color={colors.muted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.photoName, { color: colors.text }]}>{photo.name}</Text>
              <Text style={[styles.photoSize, { color: colors.muted }]}>{photo.size}</Text>
            </View>
            {selectMode ? (
              <View style={[styles.checkbox, photo.selected && styles.checkboxChecked]}>
                {photo.selected && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </View>
            ) : (
              <Ionicons name="download-outline" size={18} color="#E11D48" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── BULK DOWNLOAD ── */}
      {selectMode && selectedCount > 0 && (
        <TouchableOpacity style={styles.bulkBtn} onPress={() => handleDownload()}>
          <Ionicons name="cloud-download" size={18} color="#FFF" />
          <Text style={styles.bulkText}>Download {selectedCount} Selected</Text>
        </TouchableOpacity>
      )}

      {/* ── DOWNLOAD ALL ── */}
      <TouchableOpacity
        style={[styles.downloadAllBtn, { borderColor: '#E11D4840' }]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Downloading All', `All ${photos.length} photos will be downloaded as a ZIP archive.`);
        }}
      >
        <Ionicons name="download" size={16} color="#E11D48" />
        <Text style={[styles.downloadAllText, { color: '#E11D48' }]}>Download All as ZIP</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b' },

  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12, marginBottom: 16 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photogAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E11D4815', borderWidth: 1.5, borderColor: '#E11D48', alignItems: 'center', justifyContent: 'center' },
  photogAvatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#E11D48' },
  photogName: { fontSize: 15, fontFamily: 'mon-b' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 10, fontFamily: 'mon-sb' },
  divider: { height: 1 },
  sessionInfo: { gap: 8 },
  sessionItem: { gap: 2 },
  sessionKey: { fontSize: 9, fontFamily: 'mon-b' },
  sessionVal: { fontSize: 12, fontFamily: 'mon-sb' },

  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  statusTitle: { fontSize: 13, fontFamily: 'mon-sb' },
  statusSub: { fontSize: 11, fontFamily: 'mon', marginTop: 1 },

  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },
  selectToggle: { fontSize: 13, fontFamily: 'mon-sb' },

  galleryCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  photoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  thumbPlaceholder: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  photoName: { fontSize: 13, fontFamily: 'mon-sb' },
  photoSize: { fontSize: 10, fontFamily: 'mon', marginTop: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#E11D48', borderColor: '#E11D48' },

  bulkBtn: { height: 48, borderRadius: 14, backgroundColor: '#E11D48', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  bulkText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  downloadAllBtn: { height: 48, borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  downloadAllText: { fontSize: 14, fontFamily: 'mon-sb' },
});
