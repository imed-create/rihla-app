/**
 * RIHLA — Business Asset Detail Screen
 * ─────────────────────────────────────
 * Rich type-specific detail view for business owners to manage each asset.
 * Shows images, descriptions, full fields per business type.
 * Hotel rooms, rental properties, beach spots, etc.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { showToast } from '@/components/Toast';

const TYPE_CONFIGS: Record<string, { label: string; icon: string; color: string; colorLt: string }> = {
  hotel:        { label: 'Room',       icon: 'bed-outline',        color: '#1A6B3A', colorLt: '#E6F4EC' },
  restaurant:   { label: 'Menu Item',  icon: 'restaurant-outline', color: '#C56A39', colorLt: '#FEF3E8' },
  beach:        { label: 'Spot',       icon: 'umbrella-outline',   color: '#00a896', colorLt: '#F0FDFA' },
  rental:       { label: 'Property',   icon: 'home-outline',       color: '#6C63FF', colorLt: '#EEF2FF' },
  activity:     { label: 'Program',    icon: 'bicycle-outline',    color: '#E76F51', colorLt: '#FEF2EE' },
  event:        { label: 'Event',      icon: 'ticket-outline',     color: '#A855F7', colorLt: '#F5F3FF' },
  guide:        { label: 'Expedition', icon: 'compass-outline',    color: '#8B5E3C', colorLt: '#F5F0EB' },
  photographer: { label: 'Package',    icon: 'camera-outline',     color: '#FF499E', colorLt: '#FFF0F6' },
  driver:       { label: 'Route',      icon: 'car-outline',        color: '#0a2540', colorLt: '#F0F2F5' },
  experience:   { label: 'Experience', icon: 'sparkles-outline',   color: '#f4a261', colorLt: '#FEF8F0' },
};

export default function BusinessAssetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { assets, getAssetById, toggleAvailable, updateAsset, removeAsset } = useBusinessAssets();

  const asset = useMemo(() => getAssetById(id ?? ''), [id, assets]);

  if (!asset) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.missingWrap}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={RIHLA.dark} />
          </TouchableOpacity>
          <Ionicons name="alert-circle-outline" size={48} color="#CBD5E1" />
          <Text style={styles.missingTitle}>Asset not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = TYPE_CONFIGS[asset.businessType] || TYPE_CONFIGS.hotel;
  const f = asset.fields || {};

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={[styles.hero, { backgroundColor: cfg.color }]}>
          <View style={styles.heroNav}>
            <TouchableOpacity style={styles.heroBack} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroDelete} onPress={() => {
              removeAsset(asset.id);
              showToast('Asset removed', 'info');
              router.back();
            }}>
              <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={cfg.icon as any} size={14} color="#fff" />
            <Text style={styles.heroBadgeText}>{cfg.label}</Text>
          </View>
          <Text style={styles.heroName}>{asset.name}</Text>
          <Text style={styles.heroPrice}>{asset.priceDZD.toLocaleString()} DZD</Text>

          {/* Availability toggle */}
          <View style={styles.availRow}>
            <View style={[styles.availDot, { backgroundColor: asset.available ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.availText}>{asset.available ? 'Active & Bookable' : 'Unavailable'}</Text>
            <Switch
              value={asset.available}
              onValueChange={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleAvailable(asset.id); }}
              trackColor={{ false: '#E2E8F0', true: 'rgba(255,255,255,0.5)' }}
              thumbColor={asset.available ? '#fff' : '#94A3B8'}
              style={{ marginLeft: 'auto' }}
            />
          </View>
        </View>

        {/* ── Description ── */}
        {asset.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{asset.description}</Text>
          </View>
        ) : null}

        {/* ── Images ── */}
        {f.images && (f.images as string[]).length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({f.images.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageRow}>
              {(f.images as string[]).map((uri: string, i: number) => (
                <View key={i} style={styles.imageCard}>
                  {uri.startsWith('file://') ? (
                    <Image source={{ uri }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color={cfg.color} />
                    </View>
                  )}
                </View>
              ))}
              <TouchableOpacity style={[styles.addImageBtn, { borderColor: cfg.color }]}>
                <Ionicons name="add-outline" size={20} color={cfg.color} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : null}

        {/* ── Video ── */}
        {f.videoUrl ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Video Tour</Text>
            <View style={styles.videoCard}>
              <Ionicons name="play-circle-outline" size={32} color="#EF4444" />
              <Text style={styles.videoUrlText} numberOfLines={1}>{f.videoUrl}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Type-specific details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsCard}>
            <DetailRow icon="pricetag-outline" label="Price" value={`${asset.priceDZD.toLocaleString()} DZD`} />
            <DetailRow icon="calendar-outline" label="Created" value={new Date(asset.createdAt).toLocaleDateString()} />
            <DetailRow icon="sync-outline" label="Updated" value={new Date(asset.updatedAt).toLocaleDateString()} />

            {/* Hotel room fields */}
            {asset.businessType === 'hotel' && (
              <>
                <DetailRow icon="bed-outline" label="Room Type" value={f.roomType || 'Standard'} />
                <DetailRow icon="bed-outline" label="Bed" value={f.bedType || '1 King'} />
                <DetailRow icon="people-outline" label="Capacity" value={`${f.capacity || 2} guests`} />
                <DetailRow icon="resize-outline" label="Size" value={`${f.sizeSqM || 30} m²`} />
                <DetailRow icon="eye-outline" label="View" value={f.viewType || 'Sea View'} />
                <DetailRow icon="restaurant-outline" label="Breakfast" value={f.hasBreakfast ? 'Included' : 'Not included'} />
                {f.amenities && <DetailRow icon="layers-outline" label="Amenities" value={`${(f.amenities as string[]).length} items`} />}
              </>
            )}

            {/* Rental property fields */}
            {asset.businessType === 'rental' && (
              <>
                <DetailRow icon="bed-outline" label="Bedrooms" value={`${f.bedrooms || 3}`} />
                <DetailRow icon="water-outline" label="Bathrooms" value={`${f.bathrooms || 2}`} />
                <DetailRow icon="people-outline" label="Max Guests" value={`${f.maxGuests || 6}`} />
                <DetailRow icon="resize-outline" label="Size" value={f.sizeSqM ? `${f.sizeSqM} m²` : '120 m²'} />
                <DetailRow icon="home-outline" label="Type" value={f.propertyType || 'villa'} />
                <DetailRow icon="time-outline" label="Check-in" value={f.checkInTime || '14:00'} />
                <DetailRow icon="time-outline" label="Check-out" value={f.checkOutTime || '11:00'} />
                {f.amenities && <DetailRow icon="layers-outline" label="Amenities" value={`${(f.amenities as string[]).length} items`} />}
                {f.houseRules && <DetailRow icon="shield-checkmark-outline" label="Rules" value={`${(f.houseRules as string[]).length} rules`} />}
                <DetailRow icon="refresh-outline" label="Cancellation" value={f.cancellationPolicy || 'Moderate'} />
              </>
            )}

            {/* Beach spot fields */}
            {asset.businessType === 'beach' && (
              <>
                <DetailRow icon="grid-outline" label="Asset Type" value={f.assetType || 'umbrella'} />
                <DetailRow icon="flag-outline" label="Zone" value={f.zone || 'family'} />
                <DetailRow icon="sunny-outline" label="Facing" value={f.facing || 'Sea View'} />
                <DetailRow icon="navigate-outline" label="Grid Position" value={`Row ${f.gridRow || 1}, Col ${f.gridCol || 1}`} />
                {f.gpsLat && <DetailRow icon="locate-outline" label="GPS" value={`${f.gpsLat}, ${f.gpsLng}`} />}
              </>
            )}

            {/* Generic fields for other types */}
            {!['hotel', 'rental', 'beach'].includes(asset.businessType) && Object.entries(f).filter(([k]) => !['images', 'videoUrl'].includes(k)).map(([key, val]) => (
              <DetailRow key={key} icon="information-circle-outline" label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                value={Array.isArray(val) ? `${val.length} items` : String(val)} />
            ))}
          </View>
        </View>

        {/* ── Amenities full list ── */}
        {f.amenities && (f.amenities as string[]).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.tagRow}>
              {(f.amenities as string[]).map((a: string, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: cfg.colorLt, borderColor: cfg.color + '30' }]}>
                  <Ionicons name="checkmark-circle" size={12} color={cfg.color} />
                  <Text style={[styles.tagText, { color: cfg.color }]}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── House Rules ── */}
        {f.houseRules && (f.houseRules as string[]).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>House Rules</Text>
            <View style={styles.tagRow}>
              {(f.houseRules as string[]).map((r: string, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <Ionicons name="close-circle" size={12} color="#EF4444" />
                  <Text style={[styles.tagText, { color: '#DC2626' }]}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Address ── */}
        {f.address ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressCard}>
              <Ionicons name="location-outline" size={16} color={RIHLA.mutedText} />
              <Text style={styles.addressText}>{f.address}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Ionicons name={icon as any} size={15} color="#6B7280" />
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB', gap: 10 },
  label: { flex: 1, fontSize: 13, fontFamily: 'mon', color: '#6B7280' },
  value: { fontSize: 13, fontFamily: 'mon-sb', color: '#0F172A', textAlign: 'right', maxWidth: '55%' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 40 },

  // Missing
  missingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  missingTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },

  // Hero
  hero: { padding: 20, gap: 8, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  heroBack: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  heroDelete: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  heroBadgeText: { fontSize: 12, fontFamily: 'mon-b', color: '#fff' },
  heroName: { fontSize: 24, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.3 },
  heroPrice: { fontSize: 18, fontFamily: 'mon-b', color: 'rgba(255,255,255,0.9)' },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10, marginTop: 4 },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: 13, fontFamily: 'mon-sb', color: '#fff', flex: 1 },

  // Section
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 10 },
  descriptionText: { fontSize: 14, fontFamily: 'mon', color: '#6B7280', lineHeight: 22 },

  // Images
  imageRow: { gap: 10 },
  imageCard: { width: 120, height: 90, borderRadius: 12, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  addImageBtn: { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },

  // Video
  videoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  videoUrlText: { fontSize: 12, fontFamily: 'mon', color: '#6B7280', flex: 1 },

  // Details card
  detailsCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 4, paddingHorizontal: 14 },

  // Tags
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  tagText: { fontSize: 11, fontFamily: 'mon-sb' },

  // Address
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  addressText: { fontSize: 13, fontFamily: 'mon', color: '#6B7280', flex: 1 },
});
