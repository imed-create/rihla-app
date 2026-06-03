import React, { useState, useMemo, useRef, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type MapStyleElement } from 'react-native-maps';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  DESTINATIONS,
  Destination,
  DestinationType,
  DESTINATION_TYPES,
} from '@/constants/destinations';
import { categoryColors } from '@/constants/Colors';
import { useColors } from '@/hooks/useColors';
import { GOOGLE_MAP_LIGHT_STYLE } from '@/constants/googleMapStyle';
import BeachGridExplorerModal from '@/components/beach/BeachGridExplorerModal';

const SAHEL_PRIMARY = '#0a2540';

function getLiveMetrics(dest: Destination) {
  const seed = dest.id.length;
  if (dest.type === 'beach') {
    return [
      { label: 'Temp', value: `${22 + (seed % 6)}°C`, icon: 'thermometer-outline' as const },
      { label: 'Eco', value: dest.flag === 'green' ? 'A+' : dest.flag === 'yellow' ? 'B' : 'C', icon: 'leaf-outline' as const },
      { label: 'Surf', value: seed % 2 === 0 ? 'Calm' : 'Light', icon: 'water-outline' as const },
    ];
  }
  if (dest.type === 'mountain') {
    return [
      { label: 'Temp', value: `${8 + (seed % 8)}°C`, icon: 'thermometer-outline' as const },
      { label: 'Visibility', value: `${12 + (seed % 10)} km`, icon: 'eye-outline' as const },
      { label: 'Trail', value: 'Open', icon: 'walk-outline' as const },
    ];
  }
  if (dest.type === 'desert') {
    return [
      { label: 'Temp', value: `${28 + (seed % 12)}°C`, icon: 'thermometer-outline' as const },
      { label: 'Wind', value: `${8 + (seed % 15)} km/h`, icon: 'flag-outline' as const },
      { label: 'Stars', value: 'Excellent', icon: 'moon-outline' as const },
    ];
  }
  return [
    { label: 'Crowd', value: 'Moderate', icon: 'people-outline' as const },
    { label: 'Safety', value: 'High', icon: 'shield-checkmark-outline' as const },
    { label: 'Access', value: 'Easy', icon: 'car-outline' as const },
  ];
}

const DestinationMarker = memo(
  ({
    dest,
    color,
    onPress,
  }: {
    dest: Destination;
    color: string;
    onPress: (d: Destination) => void;
  }) => (
    <Marker
      coordinate={{ latitude: dest.lat, longitude: dest.lng }}
      onPress={() => onPress(dest)}
      tracksViewChanges={false}
    >
      <View style={[styles.customMarker, { backgroundColor: color, borderColor: '#FFFFFF' }]}>
        <Text style={styles.markerText}>
          {DESTINATION_TYPES.find((t) => t.id === dest.type)?.emoji || '📍'}
        </Text>
      </View>
    </Marker>
  )
);

DestinationMarker.displayName = 'DestinationMarker';

export default function AlgeriaMapScreen() {
  const colors = useColors();
  const mapRef = useRef<MapView>(null);
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = useState<DestinationType | 'all'>('all');
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const [gridModalVisible, setGridModalVisible] = useState(false);

  const filteredDestinations = useMemo(() => {
    if (selectedCategory === 'all') return DESTINATIONS;
    return DESTINATIONS.filter((d) => d.type === selectedCategory);
  }, [selectedCategory]);

  const metrics = useMemo(
    () => (activeDestination ? getLiveMetrics(activeDestination) : []),
    [activeDestination]
  );

  const showSheet = useCallback(
    (dest: Destination) => {
      setActiveDestination(dest);
      Animated.spring(sheetAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
      mapRef.current?.animateToRegion(
        {
          latitude: dest.lat - 0.05,
          longitude: dest.lng,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        },
        400
      );
    },
    [sheetAnim]
  );

  const hideSheet = useCallback(() => {
    Animated.timing(sheetAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setActiveDestination(null)
    );
  }, [sheetAnim]);

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 0],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={GOOGLE_MAP_LIGHT_STYLE as unknown as MapStyleElement[]}
        initialRegion={{
          latitude: 33.5,
          longitude: 3.5,
          latitudeDelta: 13.0,
          longitudeDelta: 13.0,
        }}
      >
        {filteredDestinations.map((dest) => (
          <DestinationMarker
            key={dest.id}
            dest={dest}
            color={categoryColors[dest.type]}
            onPress={showSheet}
          />
        ))}
      </MapView>

      <View style={styles.categoryOverlay}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedCategory('all')}
          style={[
            styles.catChip,
            selectedCategory === 'all'
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
          ]}
        >
          <Text
            style={[
              styles.catLabel,
              selectedCategory === 'all' ? { color: '#FFFFFF' } : { color: '#475569' },
            ]}
          >
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
                  : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
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

      {activeDestination && (
        <Animated.View
          style={[
            styles.sheetContainer,
            { opacity: sheetAnim, transform: [{ translateY: sheetTranslate }] },
          ]}
        >
          <View style={[styles.card, { borderColor: '#E2E8F0' }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={hideSheet}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: categoryColors[activeDestination.type] + '20' },
                ]}
              >
                <Text
                  style={[styles.badgeText, { color: categoryColors[activeDestination.type] }]}
                >
                  {DESTINATION_TYPES.find((t) => t.id === activeDestination.type)?.label}
                </Text>
              </View>
              {activeDestination.type === 'beach' && activeDestination.flag && (
                <View
                  style={[
                    styles.safetyPill,
                    {
                      backgroundColor:
                        activeDestination.flag === 'green'
                          ? '#DCFCE7'
                          : activeDestination.flag === 'yellow'
                            ? '#FEF9C3'
                            : '#FEE2E2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.safetyText,
                      {
                        color:
                          activeDestination.flag === 'green'
                            ? '#166534'
                            : activeDestination.flag === 'yellow'
                              ? '#854D0E'
                              : '#991B1B',
                      },
                    ]}
                  >
                    {activeDestination.flag === 'green'
                      ? 'Safe Swim'
                      : activeDestination.flag === 'yellow'
                        ? 'Caution'
                        : 'Restricted'}
                  </Text>
                </View>
              )}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.ratingText}>{activeDestination.rating}</Text>
              </View>
            </View>

            <Text style={styles.name}>{activeDestination.name}</Text>
            <Text style={styles.region}>
              {activeDestination.region} · {activeDestination.distance} away
            </Text>
            <Text style={styles.tagline} numberOfLines={2}>
              {activeDestination.tagline}
            </Text>

            <View style={styles.metricsRow}>
              {metrics.map((m) => (
                <View key={m.label} style={styles.metricPill}>
                  <Ionicons name={m.icon} size={14} color="#64748B" />
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
              ))}
            </View>

            {activeDestination.type === 'beach' ? (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setGridModalVisible(true)}
                style={[styles.exploreBtn, { backgroundColor: SAHEL_PRIMARY }]}
              >
                <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
                <Text style={styles.exploreBtnText}>Explore Interactive Grid</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/destination/${activeDestination.id}`)}
                style={[
                  styles.exploreBtn,
                  { backgroundColor: categoryColors[activeDestination.type] },
                ]}
              >
                <Text style={styles.exploreBtnText}>Book Services</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {activeDestination?.type === 'beach' && (
        <BeachGridExplorerModal
          visible={gridModalVisible}
          destination={activeDestination}
          onClose={() => setGridModalVisible(false)}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerText: { fontSize: 18 },
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
  catEmoji: { fontSize: 13 },
  catLabel: { fontSize: 12, fontFamily: 'mon-sb' },
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
    flexWrap: 'wrap',
    gap: 8,
    paddingRight: 32,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: 'mon-sb', textTransform: 'uppercase' },
  safetyPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  safetyText: { fontSize: 10, fontFamily: 'mon-sb' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  name: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A', marginTop: 10 },
  region: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  tagline: { fontSize: 13, fontFamily: 'mon', color: '#334155', marginTop: 8, lineHeight: 18 },
  metricsRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  metricPill: {
    flex: 1,
    minWidth: width * 0.25,
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: { fontSize: 10, fontFamily: 'mon', color: '#94A3B8' },
  metricValue: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
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
  exploreBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'mon-b' },
});
