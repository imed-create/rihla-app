/**
 * RIHLA — Find Nearby Providers (Uber-style ride-hailing flow)
 * ──────────────────────────────────────────────────────────────
 * Shows a full-screen map with provider markers and a bottom sheet
 * listing available service providers with category filter tabs.
 * Users can browse, filter, and select a provider.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import MapBottomSheetLayout from '@/components/shared/MapBottomSheetLayout';
import ServiceProviderCard, { type ServiceProvider } from '@/components/shared/ServiceProviderCard';
import UberButton from '@/components/shared/UberButton';
import { RIHLA } from '@/constants/theme';
import { useLocationStore, type ServiceMarker } from '@/store/useLocationStore';

// Mock providers — one per category to demonstrate the flow
const MOCK_PROVIDERS: ServiceProvider[] = [
  { id: 'guide-01', name: 'Yasmine K.', title: 'Local Guide', category: 'guide', rating: 4.9, priceDZD: 3500, time: 8, badge: '⭐ Top Rated', isAvailable: true },
  { id: 'guide-02', name: 'Mehdi R.', title: 'Mountain Guide', category: 'guide', rating: 4.7, priceDZD: 2800, time: 12, isAvailable: true },
  { id: 'driver-01', name: 'Karim M.', title: 'Private Driver', category: 'driver', rating: 4.8, priceDZD: 2000, time: 5, seats: 4, isAvailable: true },
  { id: 'driver-02', name: 'Sofia L.', title: 'Tour Driver', category: 'driver', rating: 4.6, priceDZD: 3000, time: 7, seats: 6, badge: '🚐 Minibus', isAvailable: true },
  { id: 'photographer-01', name: 'Lina S.', title: 'Photographer', category: 'photographer', rating: 4.9, priceDZD: 5000, time: 15, badge: '📸 Pro', isAvailable: true },
  { id: 'photographer-02', name: 'Amine B.', title: 'Drone Pilot', category: 'photographer', rating: 4.8, priceDZD: 7000, time: 20, isAvailable: true },
  { id: 'hotel-01', name: 'Le Méridien', title: 'Hotel', category: 'hotel', rating: 4.5, priceDZD: 12000, isAvailable: true },
  { id: 'restaurant-01', name: 'Dar El Bahri', title: 'Restaurant', category: 'restaurant', rating: 4.7, priceDZD: 3500, time: 10, badge: '🔥 Popular', isAvailable: true },
  { id: 'experience-01', name: 'Sahara Dreams', title: 'Desert Camping', category: 'experience', rating: 4.9, priceDZD: 15000, time: 60, badge: '⭐ Must-do', isAvailable: true },
  { id: 'activity-01', name: 'Quad Aventure', title: 'Quad Rental', category: 'activity', rating: 4.6, priceDZD: 4500, time: 0, isAvailable: true },
  { id: 'beach-01', name: 'Sidi Fredj Plage', title: 'Beach Service', category: 'beach', rating: 4.4, priceDZD: 1500, time: 5, isAvailable: true },
  { id: 'event-01', name: 'Djemaa Fest', title: 'Event', category: 'event', rating: 4.8, priceDZD: 2500, badge: '🎵 Live Music', isAvailable: true },
  { id: 'rental-01', name: 'Villa Palmier', title: 'Home Rental', category: 'rental', rating: 4.7, priceDZD: 8000, badge: '🏡 New', isAvailable: true },
];

// Map markers for each provider category
const MOCK_MARKERS: ServiceMarker[] = [
  { id: 'guide-01', latitude: 36.7525, longitude: 3.0419, title: 'Yasmine K.', subtitle: 'Local Guide', category: 'guide', rating: 4.9 },
  { id: 'driver-01', latitude: 36.7550, longitude: 3.0500, title: 'Karim M.', subtitle: 'Private Driver', category: 'driver', rating: 4.8 },
  { id: 'photographer-01', latitude: 36.7480, longitude: 3.0350, title: 'Lina S.', subtitle: 'Photographer', category: 'photographer', rating: 4.9 },
  { id: 'restaurant-01', latitude: 36.7530, longitude: 3.0450, title: 'Dar El Bahri', subtitle: 'Restaurant', category: 'restaurant', rating: 4.7 },
  { id: 'beach-01', latitude: 36.7500, longitude: 3.0300, title: 'Sidi Fredj', subtitle: 'Beach Service', category: 'beach', rating: 4.4 },
];

const PROVIDER_CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps-outline' as const },
  { key: 'guide', label: 'Guides', icon: 'compass-outline' as const },
  { key: 'driver', label: 'Drivers', icon: 'car-outline' as const },
  { key: 'photographer', label: 'Photographers', icon: 'camera-outline' as const },
  { key: 'restaurant', label: 'Restaurants', icon: 'restaurant-outline' as const },
  { key: 'beach', label: 'Beach', icon: 'umbrella-outline' as const },
];

export default function FindProvidersScreen() {
  const { category: initialCategory, lat, lng, name: listingName } = useLocalSearchParams<Record<string, string>>();
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');

  const { setDestinationLocation } = useLocationStore();

  // Use listing coordinates if passed from explore screen
  const destinationCoords = lat && lng
    ? { latitude: parseFloat(lat), longitude: parseFloat(lng) }
    : null;

  // Set destination on mount so map centers on the listing's location
  useEffect(() => {
    if (destinationCoords) {
      setDestinationLocation({
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude,
        address: listingName || 'Selected listing',
      });
    }
  }, []);

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredProviders = useMemo(() => {
    if (activeCategory === 'all') return MOCK_PROVIDERS;
    return MOCK_PROVIDERS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const filteredMarkers = useMemo(() => {
    if (activeCategory === 'all') return MOCK_MARKERS;
    return MOCK_MARKERS.filter(m => m.category === activeCategory);
  }, [activeCategory]);

  const selectedProviderData = useMemo(
    () => MOCK_PROVIDERS.find(p => p.id === selectedProvider),
    [selectedProvider]
  );

  const handleSelectProvider = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedProvider(id);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MapBottomSheetLayout
        title={selectedProvider ? 'Confirm Provider' : 'Find Nearby Services'}
        snapPoints={['30%', '65%']}
        markers={filteredMarkers}
        onMarkerPress={(marker) => handleSelectProvider(marker.id)}
      >
        {/* Category Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}
        >
          {PROVIDER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveCategory(cat.key);
                  setSelectedProvider(null);
                  setShowConfirmation(false);
                }}
                style={[
                  styles.filterChip,
                  isActive && {
                    backgroundColor: RIHLA.primary,
                    borderColor: RIHLA.primary,
                  },
                ]}
              >
                <Ionicons
                  name={cat.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[
                    styles.filterLabel,
                    isActive && { color: '#FFFFFF' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Provider List */}
        <ScrollView
          style={styles.providerList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {showConfirmation && selectedProviderData ? (
            /* Uber-style confirmation card */
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Confirm your selection</Text>
              <ServiceProviderCard
                provider={selectedProviderData}
                selected
                onSelect={() => {}}
              />
              <View style={styles.confirmMeta}>
                <View style={styles.confirmMetaItem}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.confirmMetaText}>Your location → Provider</Text>
                </View>
                <View style={styles.confirmMetaItem}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.confirmMetaText}>
                    Arrives in ~{selectedProviderData.time || 10} min
                  </Text>
                </View>
                <View style={styles.confirmMetaItem}>
                  <Ionicons name="card-outline" size={14} color="#64748B" />
                  <Text style={styles.confirmMetaText}>
                    {selectedProviderData.priceDZD.toLocaleString()} DZD
                  </Text>
                </View>
              </View>
              <UberButton
                title="Confirm & Request"
                onPress={handleConfirm}
                IconRight={() => <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
                style={{ marginTop: 12 }}
              />
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowConfirmation(false);
                  setSelectedProvider(null);
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Provider Cards */
            <>
              <View style={styles.resultHeader}>
                <Text style={styles.resultCount}>
                  {filteredProviders.length} {activeCategory === 'all' ? 'providers' : `${activeCategory}s`} nearby
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.back();
                  }}
                >
                  <Text style={styles.viewMapText}>View map</Text>
                </TouchableOpacity>
              </View>

              {filteredProviders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={40} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No providers found</Text>
                  <Text style={styles.emptySubtext}>Try a different category</Text>
                </View>
              ) : (
                filteredProviders.map((provider) => (
                  <ServiceProviderCard
                    key={provider.id}
                    provider={provider}
                    selected={selectedProvider === provider.id}
                    onSelect={() => handleSelectProvider(provider.id)}
                  />
                ))
              )}
            </>
          )}
        </ScrollView>
      </MapBottomSheetLayout>
    </>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    marginBottom: 8,
    marginTop: -4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterLabel: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#475569',
  },
  providerList: {
    flex: 1,
    marginTop: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#64748B',
  },
  viewMapText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: RIHLA.accent,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#94A3B8',
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#CBD5E1',
  },

  // Confirmation card
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: RIHLA.border,
  },
  confirmTitle: {
    fontSize: 17,
    fontFamily: 'mon-b',
    color: RIHLA.dark,
    marginBottom: 12,
  },
  confirmMeta: {
    gap: 8,
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmMetaText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#475569',
  },
  cancelBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
    color: '#EF4444',
  },
});
