/**
 * RIHLA — Business Bookings Dispatcher
 * ──────────────────────────────────────
 * Renders the correct bookings/reservations panel based on the user's businessType.
 * Each business type gets a completely custom interface tailored to their operations.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '@/context/AppContext';
import ProTabShell from '@/components/dashboard/TabShell';
import { getCategoryDef } from '@/constants/marketplaceCategories';

// Bookings panels — each is unique to its business type
import HotelBookings from '@/components/business/bookings/HotelBookings';
import RestaurantBookings from '@/components/business/bookings/RestaurantBookings';
import BeachBookings from '@/components/business/bookings/BeachBookings';
import RentalBookings from '@/components/business/bookings/RentalBookings';
import ActivityBookings from '@/components/business/bookings/ActivityBookings';
import EventBookings from '@/components/business/bookings/EventBookings';
import GuideBookings from '@/components/business/bookings/GuideBookings';
import PhotographerBookings from '@/components/business/bookings/PhotographerBookings';
import DriverBookings from '@/components/business/bookings/DriverBookings';
import ExperienceBookings from '@/components/business/bookings/ExperienceBookings';

const PANEL_MAP: Record<string, React.ComponentType> = {
  hotel: HotelBookings,
  restaurant: RestaurantBookings,
  beach: BeachBookings,
  rental: RentalBookings,
  activity: ActivityBookings,
  event: EventBookings,
  guide: GuideBookings,
  photographer: PhotographerBookings,
  driver: DriverBookings,
  experience: ExperienceBookings,
};

const SUBTITLE_MAP: Record<string, string> = {
  hotel: 'Guest reservations & check-ins',
  restaurant: 'Live food orders & prep status',
  beach: 'Spot bookings & service requests',
  rental: 'Property rental bookings',
  activity: 'Activity groups & participant lists',
  event: 'Ticket sales & attendee check-ins',
  guide: 'Client tours & schedules',
  photographer: 'Shoot sessions & bookings',
  driver: 'Ride trips & routes',
  experience: 'Experience group bookings',
};

export default function BusinessBookings() {
  const { user } = useApp();
  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as any) : null;
  const Panel = PANEL_MAP[businessType] ?? null;
  const subtitle = SUBTITLE_MAP[businessType] ?? 'Manage your bookings';

  return (
    <ProTabShell
      role="business"
      title={catDef ? `${catDef.label} Bookings` : 'Bookings'}
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
