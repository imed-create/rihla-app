/**
 * RIHLA — Shell 5: Mobility On-Demand
 * Vehicle spec cards, per-km route fare estimators, fixed routes.
 * Category: driver
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Listing, DriverMetadata } from '@/types/service';

type Props = { listing: Listing };

const VEHICLE_ICONS: Record<string, string> = {
  sedan: 'car-outline', suv: 'car-sport-outline', van: 'bus-outline', bus: 'bus-outline', luxury: 'car-outline',
};

export default function MobilityOnDemandShell({ listing }: Props) {
  const { colors } = useTheme();
  const m = listing.metadata as DriverMetadata;
  const [selectedRoute, setSelectedRoute] = useState(0);

  return (
    <View style={styles.container}>
      {/* VEHICLE SPEC */}
      <View style={[styles.vehicleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.vehicleIconWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name={VEHICLE_ICONS[m.vehicle_type] as any} size={28} color={RIHLA.accent} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>{m.vehicle_name}</Text>
          <View style={styles.vehicleTypeRow}>
            <View style={[styles.vehicleTypeChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.vehicleTypeText, { color: colors.muted }]}>{m.vehicle_type}</Text>
            </View>
            {m.airport_transfer && (
              <View style={[styles.vehicleBadge, { borderColor: RIHLA.highlight + '30' }]}>
                <Ionicons name="airplane-outline" size={10} color={RIHLA.highlight} />
                <Text style={styles.vehicleBadgeText}>Airport</Text>
              </View>
            )}
            {m.multi_day_hire && (
              <View style={[styles.vehicleBadge, { borderColor: RIHLA.online + '30' }]}>
                <Ionicons name="briefcase-outline" size={10} color={RIHLA.online} />
                <Text style={[styles.vehicleBadgeText, { color: RIHLA.online }]}>Multi-Day</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* STATUS */}
      <View style={[styles.statusBar, { backgroundColor: colors.card, borderColor: RIHLA.online + '20' }]}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Available Now</Text>
        <Text style={[styles.statusEta, { color: colors.muted }]}>~8 min away</Text>
      </View>

      {/* FARE */}
      <View style={[styles.fareCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fareTitle, { color: colors.muted }]}>Rate</Text>
        <View style={styles.fareMain}>
          <Text style={styles.fareValue}>{m.price_per_km_dzd}</Text>
          <Text style={[styles.fareUnit, { color: colors.muted }]}>DA / km</Text>
        </View>
      </View>

      {/* FIXED ROUTES */}
      {m.fixed_routes.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fixed Routes</Text>
          {m.fixed_routes.map((route, i) => (
            <Pressable
              key={i}
              style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }, selectedRoute === i && { borderColor: RIHLA.accent, backgroundColor: RIHLA.accent + '08' }]}
              onPress={() => setSelectedRoute(i)}
            >
              <View style={styles.routeStops}>
                <View style={styles.routeStop}>
                  <View style={[styles.routeDot, { backgroundColor: RIHLA.accent }]} />
                  <Text style={[styles.routeStopText, { color: colors.text }]} numberOfLines={1}>{route.from}</Text>
                </View>
                <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
                <View style={styles.routeStop}>
                  <View style={[styles.routeDot, { backgroundColor: RIHLA.highlight }]} />
                  <Text style={[styles.routeStopText, { color: colors.text }]} numberOfLines={1}>{route.to}</Text>
                </View>
              </View>
              <Text style={styles.routePrice}>{route.price_dzd.toLocaleString()} DA</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* FARE ESTIMATOR */}
      <View style={[styles.estimatorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.fareTitle, { color: colors.muted }]}>Estimated Fare</Text>
        <View style={styles.estimatorRow}>
          <Text style={[styles.estimatorLabel, { color: colors.muted }]}>Base fare</Text>
          <Text style={[styles.estimatorValue, { color: colors.text }]}>{listing.price_dzd.toLocaleString()} DA</Text>
        </View>
        <View style={styles.estimatorRow}>
          <Text style={[styles.estimatorLabel, { color: colors.muted }]}>Per km</Text>
          <Text style={[styles.estimatorValue, { color: colors.text }]}>{m.price_per_km_dzd} DA</Text>
        </View>
        <View style={[styles.estimatorRow, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Starting from</Text>
          <Text style={styles.totalValue}>{listing.price_dzd.toLocaleString()} DA</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },

  vehicleCard: { flexDirection: 'row', gap: 14, borderRadius: 16, borderWidth: 1, padding: 16 },
  vehicleIconWrap: { width: 56, height: 56, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  vehicleInfo: { flex: 1, gap: 6 },
  vehicleName: { fontSize: 16, fontFamily: 'mon-b' },
  vehicleTypeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  vehicleTypeChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  vehicleTypeText: { fontSize: 11, fontFamily: 'mon-sb' },
  vehicleBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  vehicleBadgeText: { fontSize: 10, fontFamily: 'mon-b', color: RIHLA.highlight },

  statusBar: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: RIHLA.online },
  statusText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.online, flex: 1 },
  statusEta: { fontSize: 12, fontFamily: 'mon' },

  fareCard: { borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center' },
  fareTitle: { fontSize: 12, fontFamily: 'mon', marginBottom: 4 },
  fareMain: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  fareValue: { fontSize: 32, fontFamily: 'mon-b', color: RIHLA.accent },
  fareUnit: { fontSize: 14, fontFamily: 'mon' },

  routeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  routeStops: { flex: 1, gap: 4 },
  routeStop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeStopText: { fontSize: 12, fontFamily: 'mon-sb', flex: 1 },
  routeLine: { width: 1, height: 12, marginLeft: 3.5 },
  routePrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.accent, marginLeft: 12 },

  estimatorCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  estimatorRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  estimatorLabel: { fontSize: 13, fontFamily: 'mon' },
  estimatorValue: { fontSize: 13, fontFamily: 'mon-sb' },
  totalLabel: { fontSize: 15, fontFamily: 'mon-b' },
  totalValue: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.accent },
});
