/**
 * RIHLA — Business Listings Dispatcher
 * ─────────────────────────────────────
 * Renders the correct listing/management panel based on the user's businessType.
 * Each business type gets a completely custom interface tailored to what they manage.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import ProTabShell from '@/components/dashboard/TabShell';
import { getCategoryDef } from '@/constants/marketplaceCategories';

// Listings panels — each is unique to its business type
import HotelListings from '@/components/business/listings/HotelListings';
import RestaurantListings from '@/components/business/listings/RestaurantListings';
import BeachListings from '@/components/business/listings/BeachListings';
import RentalListings from '@/components/business/listings/RentalListings';
import ActivityListings from '@/components/business/listings/ActivityListings';
import EventListings from '@/components/business/listings/EventListings';
import GuideListings from '@/components/business/listings/GuideListings';
import PhotographerListings from '@/components/business/listings/PhotographerListings';
import DriverListings from '@/components/business/listings/DriverListings';
import ExperienceListings from '@/components/business/listings/ExperienceListings';

const PANEL_MAP: Record<string, React.ComponentType> = {
  hotel: HotelListings,
  restaurant: RestaurantListings,
  beach: BeachListings,
  rental: RentalListings,
  activity: ActivityListings,
  event: EventListings,
  guide: GuideListings,
  photographer: PhotographerListings,
  driver: DriverListings,
  experience: ExperienceListings,
};

const SUBTITLE_MAP: Record<string, string> = {
  hotel: 'Manage rooms, pricing & availability',
  restaurant: 'Manage menu items, categories & pricing',
  beach: 'Manage spots, zones & beach assets',
  rental: 'Manage properties, amenities & availability',
  activity: 'Manage programs, schedules & capacity',
  event: 'Manage events, tickets & venues',
  guide: 'Manage expeditions, languages & pricing',
  photographer: 'Manage portfolio packages & pricing',
  driver: 'Manage routes, vehicles & pricing',
  experience: 'Manage multi-day experiences & itineraries',
};

export default function BusinessListings() {
  const { user } = useApp();
  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as any) : null;
  const Panel = PANEL_MAP[businessType] ?? null;
  const subtitle = SUBTITLE_MAP[businessType] ?? 'Manage your listings';

  return (
    <ProTabShell
      role="business"
      title={catDef ? `${catDef.label}` : 'Listings'}
      subtitle={subtitle}
    >
      <View style={styles.container}>
        {Panel ? <Panel /> : null}
      </View>
    </ProTabShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
