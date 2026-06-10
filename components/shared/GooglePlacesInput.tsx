/**
 * RIHLA — Google Places Autocomplete Input
 * ──────────────────────────────────────────
 * Ported from Uber Clone's GoogleTextInput.tsx.
 * Search any place with autocomplete suggestions.
 * Used in search screen and destination picker.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import { useLocationStore } from '@/store/useLocationStore';

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface GooglePlacesInputProps {
  /** Icon to show on the left of the input */
  icon?: string;
  /** Initial placeholder text */
  placeholder?: string;
  /** Background color override */
  backgroundColor?: string;
  /** Called when a place is selected */
  onPlaceSelected?: (params: { latitude: number; longitude: number; address: string }) => void;
  /** If true, updates the user location store on selection */
  setAsUserLocation?: boolean;
  /** If true, updates the destination location store on selection */
  setAsDestination?: boolean;
  /** If true, updates the origin location store on selection */
  setAsOrigin?: boolean;
  /** Container style override */
  containerStyle?: any;
}

export default function GooglePlacesInput({
  icon = 'search',
  placeholder = 'Search destination...',
  backgroundColor = '#FFFFFF',
  onPlaceSelected,
  setAsUserLocation = false,
  setAsDestination = false,
  setAsOrigin = false,
  containerStyle,
}: GooglePlacesInputProps) {
  const {
    setUserLocation,
    setDestinationLocation,
    setOriginLocation,
  } = useLocationStore();

  const handlePress = (data: any, details: any = null) => {
    if (!details?.geometry?.location) return;

    const params = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description || data.formatted_address || '',
    };

    // Update the appropriate store
    if (setAsUserLocation) setUserLocation(params);
    if (setAsDestination) setDestinationLocation(params);
    if (setAsOrigin) setOriginLocation(params);

    // Also call the callback
    onPlaceSelected?.(params);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder={placeholder}
        debounce={300}
        styles={{
          textInputContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 14,
            backgroundColor: 'transparent',
          },
          textInput: {
            backgroundColor: backgroundColor,
            fontSize: 14,
            fontFamily: 'mon',
            fontWeight: '600',
            borderRadius: 14,
            height: 48,
            paddingLeft: 44,
            color: '#111827',
          },
          listView: {
            backgroundColor: backgroundColor,
            borderRadius: 14,
            position: 'absolute',
            top: 52,
            left: 0,
            right: 0,
            zIndex: 99,
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
          },
          row: {
            paddingHorizontal: 14,
            paddingVertical: 12,
            height: 'auto',
          },
          description: {
            fontSize: 13,
            fontFamily: 'mon',
            color: '#374151',
          },
          separator: {
            height: 0.5,
            backgroundColor: '#E5E7EB',
          },
        }}
        onPress={handlePress}
        query={{
          key: googlePlacesApiKey,
          language: 'en',
          components: 'country:dz', // Restrict to Algeria
        }}
        renderLeftButton={() => (
          <View style={styles.leftIcon}>
            <Ionicons name={icon as any} size={18} color="#94A3B8" />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: '#94A3B8',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 50,
    borderRadius: 14,
    overflow: 'visible',
  },
  leftIcon: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 10,
    height: 48,
  },
});
