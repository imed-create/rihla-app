/**
 * RIHLA — Business Create Item Dispatcher
 * ─────────────────────────────────────────
 * Renders the correct "Add New" form based on the user's businessType.
 * Each business type gets a completely custom form tailored to what they create.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { safeGoBack } from '@/utils/safeNavigation';

import CreateHotelItem from '@/components/business/create/CreateHotelItem';
import CreateRestaurantItem from '@/components/business/create/CreateRestaurantItem';
import CreateBeachItem from '@/components/business/create/CreateBeachItem';
import CreateRentalItem from '@/components/business/create/CreateRentalItem';
import CreateActivityItem from '@/components/business/create/CreateActivityItem';
import CreateEventItem from '@/components/business/create/CreateEventItem';
import CreateGuideItem from '@/components/business/create/CreateGuideItem';
import CreatePhotographerItem from '@/components/business/create/CreatePhotographerItem';
import CreateDriverItem from '@/components/business/create/CreateDriverItem';
import CreateExperienceItem from '@/components/business/create/CreateExperienceItem';

const CREATE_MAP: Record<string, React.ComponentType> = {
  hotel: CreateHotelItem,
  restaurant: CreateRestaurantItem,
  beach: CreateBeachItem,
  rental: CreateRentalItem,
  activity: CreateActivityItem,
  event: CreateEventItem,
  guide: CreateGuideItem,
  photographer: CreatePhotographerItem,
  driver: CreateDriverItem,
  experience: CreateExperienceItem,
};

const TITLE_MAP: Record<string, string> = {
  hotel: 'Create Hotel Listing',
  restaurant: 'Create Restaurant Listing',
  beach: 'Create Beach Listing',
  rental: 'Create Rental Portfolio',
  activity: 'Create Activity Company',
  event: 'Create Event Venue',
  guide: 'Create Guide Agency',
  photographer: 'Create Photography Studio',
  driver: 'Create Transport Company',
  experience: 'Create Experience Company',
};

export default function NewBusinessListing() {
  const { user } = useApp();
  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as any) : null;
  const Form = CREATE_MAP[businessType] ?? null;
  const title = TITLE_MAP[businessType] ?? 'Create New';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{title}</Text>
          {catDef && <Text style={styles.headerSub}>{catDef.label} · {catDef.description}</Text>}
        </View>
      </View>

      {Form ? <Form /> : (
        <View style={styles.empty}>
          <Ionicons name="business-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Select a business type first</Text>
          <Text style={styles.emptySub}>Go to the Dashboard and choose your business category.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFBFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  headerSub: { fontSize: 11, fontFamily: 'mon', color: '#64748B', marginTop: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
});
