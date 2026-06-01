import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DESTINATIONS, Destination, DestinationType, DESTINATION_TYPES } from '@/constants/destinations';
import { categoryColors } from '@/constants/Colors';
import { useColors } from '@/hooks/useColors';

export default function AlgeriaMapScreen() {
  const colors = useColors();
  const mapRef = useRef<MapView>(null);
  const [selectedCategory, setSelectedCategory] = useState<DestinationType | 'all'>('all');
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  // Filtered destinations
  const filteredDestinations = useMemo(() => {
    if (selectedCategory === 'all') return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.type === selectedCategory);
  }, [selectedCategory]);

  const handleMarkerPress = (dest: Destination) => {
    setActiveDestination(dest);
    mapRef.current?.animateToRegion({
      latitude: dest.lat - 0.05, // Offset slightly to accommodate the bottom card
      longitude: dest.lng,
      latitudeDelta: 0.25,
      longitudeDelta: 0.25,
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* ─── MAP VIEW ─── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 33.5,
          longitude: 3.5,
          latitudeDelta: 13.0,
          longitudeDelta: 13.0,
        }}
      >
        {filteredDestinations.map((dest) => {
          const color = categoryColors[dest.type];
          return (
            <Marker
              key={dest.id}
              coordinate={{ latitude: dest.lat, longitude: dest.lng }}
              onPress={() => handleMarkerPress(dest)}
              pinColor={color}
            >
              <View style={[styles.customMarker, { backgroundColor: color, borderColor: '#FFFFFF' }]}>
                <Text style={styles.markerText}>
                  {DESTINATION_TYPES.find((t) => t.id === dest.type)?.emoji || '📍'}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ─── TOP CATEGORY SELECTOR OVERLAY ─── */}
      <View style={styles.categoryOverlay}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.catChip,
            selectedCategory === 'all' 
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }
          ]}
        >
          <Text style={[styles.catLabel, selectedCategory === 'all' ? { color: '#FFFFFF' } : { color: '#475569' }]}>
            All
          </Text>
        </TouchableOpacity>

        {DESTINATION_TYPES.map((type) => {
          const isSelected = selectedCategory === type.id;
          const activeColor = categoryColors[type.id];
          return (
            <TouchableOpacity
              key={type.id}
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(type.id)}
              style={[
                styles.catChip,
                isSelected 
                  ? { backgroundColor: activeColor, borderColor: activeColor }
                  : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }
              ]}
            >
              <Text style={styles.catEmoji}>{type.emoji}</Text>
              <Text style={[styles.catLabel, isSelected ? { color: '#FFFFFF' } : { color: '#475569' }]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── BOTTOM DETAIL SHEET ─── */}
      {activeDestination && (
        <View style={styles.sheetContainer}>
          <View style={[styles.card, { borderColor: '#E2E8F0' }]}>
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setActiveDestination(null)}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardHeader}>
              <View style={[styles.badge, { backgroundColor: categoryColors[activeDestination.type] + '20' }]}>
                <Text style={[styles.badgeText, { color: categoryColors[activeDestination.type] }]}>
                  {DESTINATION_TYPES.find((t) => t.id === activeDestination.type)?.label}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.ratingText}>{activeDestination.rating}</Text>
              </View>
            </View>

            <Text style={styles.name}>{activeDestination.name}</Text>
            <Text style={styles.region}>{activeDestination.region} · {activeDestination.distance} away</Text>
            <Text style={styles.tagline} numberOfLines={2}>{activeDestination.tagline}</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                router.push(`/destination/${activeDestination.id}`);
              }}
              style={[styles.exploreBtn, { backgroundColor: categoryColors[activeDestination.type] }]}
            >
              <Text style={styles.exploreBtnText}>Book Services</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerText: {
    fontSize: 16,
  },
  categoryOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  catEmoji: {
    fontSize: 13,
  },
  catLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'mon-sb',
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 24, // Keep room for close button
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'mon-b',
    color: '#0F172A',
  },
  name: {
    fontSize: 22,
    fontFamily: 'mon-b',
    color: '#0F172A',
    marginTop: 10,
  },
  region: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#64748B',
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#334155',
    marginTop: 8,
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'mon-b',
  },
});
