/**
 * RIHLA — Map Bottom Sheet Layout (Uber RideLayout adaptation)
 * ───────────────────────────────────────────────────────────────
 * Ported from Uber Clone's RideLayout.tsx design.
 * Full-screen layout with MapView in the background + @gorhom/bottom-sheet overlay.
 * Used for: find ride, confirm ride, choose service provider flows.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import MapWithDirections from './MapWithDirections';
import type { ServiceMarker } from '@/store/useLocationStore';

interface MapBottomSheetLayoutProps {
  title: string;
  snapPoints?: string[];
  children: React.ReactNode;
  /** Map markers to show on the background map */
  markers?: ServiceMarker[];
  /** Whether to show directions on the map */
  showDirections?: boolean;
  /** Whether the bottom sheet content should scroll */
  scrollable?: boolean;
  /** Called when marker is pressed */
  onMarkerPress?: (marker: ServiceMarker) => void;
  /** Back button action override */
  onBack?: () => void;
}

export default function MapBottomSheetLayout({
  title,
  snapPoints,
  children,
  markers,
  showDirections = false,
  scrollable = false,
  onMarkerPress,
  onBack,
}: MapBottomSheetLayoutProps) {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { colors, isDark } = useTheme();

  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as any);
  };

  const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Map Background */}
        <MapWithDirections
          height={Platform.OS === 'web' ? 400 : undefined}
          markers={markers}
          showDirections={showDirections}
          showUserLocation={true}
          onMarkerPress={onMarkerPress}
          initialCenter={markers && markers.length > 0 ? [markers[0].longitude, markers[0].latitude] : undefined}
          initialZoom={14}
        />

        {/* Back button overlay */}
        <Pressable
          onPress={handleBack}
          style={[
            styles.backBtn,
            { top: Platform.OS === 'ios' ? insets.top + 12 : insets.top + 8, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.icon} />
        </Pressable>

        {/* Title overlay */}
        <View style={[styles.titleContainer, { top: Platform.OS === 'ios' ? insets.top + 12 : insets.top + 8 }]}>
          <Text style={[styles.title, { color: colors.text, backgroundColor: colors.card }]}>{title}</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints || ['40%', '85%']}
        index={0}
        enablePanDownToClose={false}
        backgroundStyle={[styles.sheetBg, { backgroundColor: colors.card }]}
        handleIndicatorStyle={[styles.sheetHandle, { backgroundColor: colors.muted }]}
      >
        <ContentWrapper style={styles.sheetContent}>
          {children}
        </ContentWrapper>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: 'mon-b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  sheetBg: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetContent: {
    padding: 20,
    paddingTop: 8,
  },
});
