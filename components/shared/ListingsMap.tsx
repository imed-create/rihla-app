import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { memo, useRef, useState } from 'react';
import { defaultStyles } from '@/constants/theme';
import { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import MapView from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/theme';
import * as Location from 'expo-location';
import type { AirbnbListingFeature, AirbnbListingCollection } from '@/types/airbnb-listing';

interface Props {
  listings: AirbnbListingCollection;
}

const INITIAL_REGION = {
  latitude: 36.7538, // Algiers
  longitude: 3.0588,
  latitudeDelta: 9,
  longitudeDelta: 9,
};

const ListingsMap = memo(({ listings }: Props) => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);

  // When a marker is selected, navigate to the listing page
  const onMarkerSelected = (event: AirbnbListingFeature) => {
    router.push(`/listing/${event.properties.id}`);
  };

  // Focus the map on the user's location
  const onLocateMe = async () => {
    setLocating(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocating(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      mapRef.current?.animateToRegion(region);
    } catch (e) {
      console.log('Error getting location:', e);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={defaultStyles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        provider={PROVIDER_DEFAULT}
      >
        {/* Render all markers */}
        {listings.features.map((item: AirbnbListingFeature) => (
          <Marker
            coordinate={{
              latitude: Number(item.properties.latitude),
              longitude: Number(item.properties.longitude),
            }}
            key={item.properties.id}
            onPress={() => onMarkerSelected(item)}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>DZD {item.properties.price}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.locateBtn} onPress={onLocateMe} disabled={locating}>
        {locating ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="locate" size={24} color={Colors.dark} />
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  marker: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 10,
    },
  },
  markerText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
  },
  locateBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
});

export default ListingsMap;
