import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import { defaultStyles } from '@/constants/Styles';
import { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import * as Location from 'expo-location';

interface Props {
  listings: any;
}

const INITIAL_REGION = {
  latitude: 36.7538, // Algiers
  longitude: 3.0588,
  latitudeDelta: 9,
  longitudeDelta: 9,
};

const ListingsMap = memo(({ listings }: Props) => {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locating, setLocating] = useState(false);

  // When a marker is selected, navigate to the listing page
  const onMarkerSelected = (event: any) => {
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
      setUserLocation(location);

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

  // Overwrite the renderCluster function to customize the cluster markers
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;
    
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}>
        <View style={styles.marker}>
          <Text
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'mon-sb',
            }}>
            {points}
          </Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={defaultStyles.container}>
      <MapView
        ref={mapRef}
        mapRef={() => {}}
        onRegionChangeComplete={() => {}}
        onClusterPress={() => {}}
        onMarkersChange={() => {}}
        superClusterRef={{ current: null }}
        animationEnabled={false}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        clusterColor="#fff"
        clusterTextColor="#000"
        clusterFontFamily="mon-sb"
        renderCluster={renderCluster}
        showsUserLocation={true}
        showsMyLocationButton={false}
        provider={PROVIDER_DEFAULT} // Default uses Apple Maps on iOS, Google on Android.
      >
        {/* Render all our marker as usual */}
        {listings.features.map((item: any) => (
          <Marker
            coordinate={{
              latitude: item.properties.latitude,
              longitude: item.properties.longitude,
            }}
            key={item.properties.id}
            onPress={() => onMarkerSelected(item)}>
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
    bottom: 30, // Moved to bottom right like typical map apps
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
