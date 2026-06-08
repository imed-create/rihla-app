/**
 * RIHLA — Unified Listing Detail Dispatcher
 * -----------------------------------------
 * Single dynamic route that renders the correct detail component
 * based on the `category` param.
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HotelDetail from '@/components/listing/HotelDetail';
import RestaurantDetail from '@/components/listing/RestaurantDetail';
import BeachMapDetail from '@/components/listing/BeachMapDetail';
import ActivityDetail from '@/components/listing/ActivityDetail';
import EventDetail from '@/components/listing/EventDetail';
import GuideDetail from '@/components/listing/GuideDetail';
import PhotographerDetail from '@/components/listing/PhotographerDetail';
import DriverDetail from '@/components/listing/DriverDetail';
import ExperienceDetail from '@/components/listing/ExperienceDetail';
import RentalDetail from '@/components/listing/RentalDetail';

const DETAIL_MAP: Record<string, React.ComponentType<{ id: string }>> = {
  hotel: HotelDetail,
  restaurant: RestaurantDetail,
  beach: BeachMapDetail,
  'beach-map': BeachMapDetail,
  activity: ActivityDetail,
  event: EventDetail,
  guide: GuideDetail,
  photographer: PhotographerDetail,
  driver: DriverDetail,
  experience: ExperienceDetail,
  rental: RentalDetail,
};

export default function ListingDetailScreen() {
  const { category, id } = useLocalSearchParams<{ category: string; id: string }>();
  const Detail = DETAIL_MAP[category ?? ''];

  if (!Detail) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.notFoundText}>Category "{category}" not found</Text>
      </View>
    );
  }

  return <Detail id={id ?? ''} />;
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FAFBFC',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'mon-sb',
    color: '#64748B',
  },
});
