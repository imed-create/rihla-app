/**
 * RIHLA — Dedicated Ride Screen
 * ─────────────────────────────
 * Works like Yassir / InDriver:
 * - Geolocation-aware pickup, destination search with autocomplete suggestions.
 * - Map preview with route simulation.
 * - Vehicle categories: Berline, SUV, Moto, Van (with distinct fares in DZD).
 * - Real-time bidding & matching workflow simulation.
 * - Triggers booking actions in AppContext and completes checkouts.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useLocationStore } from '@/store/useLocationStore';
import { useApp } from '@/context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import MapWithDirections from '@/components/shared/MapWithDirections';

const { width: SCREEN_W } = Dimensions.get('window');

type VehicleType = {
  id: string;
  name: string;
  eta: string;
  baseFare: number;
  icon: string;
  desc: string;
};

export default function RideServiceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addBooking } = useApp();
  const insets = useSafeAreaInsets();

  const {
    userLatitude,
    userLongitude,
    userAddress,
    setDestinationLocation,
    clearDestination,
  } = useLocationStore();

  // Route state
  const [pickup, setPickup] = useState(userAddress || 'My Current Location');
  const [destination, setDestination] = useState('');
  const [destFocused, setDestFocused] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('berline');
  const [userOfferFare, setUserOfferFare] = useState<number>(700);

  // Booking Flow Steps: 'search' | 'requesting' | 'bidding' | 'matched'
  const [step, setStep] = useState<'search' | 'requesting' | 'bidding' | 'matched'>('search');

  type Bid = {
    driver: string;
    car: string;
    fare: number;
    rating: number;
  };
  const [dynamicBids, setDynamicBids] = useState<Bid[]>([]);

  // Clear destination on unmount
  useEffect(() => {
    return () => {
      clearDestination();
    };
  }, []);

  const vehicles: VehicleType[] = [
    { id: 'berline', name: 'Berline', eta: '4 min', baseFare: 700, icon: 'car-sport-outline', desc: 'Standard comfortable sedans' },
    { id: 'suv', name: 'SUV Comfort', eta: '6 min', baseFare: 1100, icon: 'car-outline', desc: 'Spacious 4x4 SUVs' },
    { id: 'moto', name: 'Moto Fast', eta: '2 min', baseFare: 400, icon: 'bicycle-outline', desc: 'Fast single-rider motorbikes' },
    { id: 'van', name: 'Van Family', eta: '9 min', baseFare: 1800, icon: 'bus-outline', desc: 'Up to 7 passenger vans' },
  ];

  const currentFare = useMemo(() => {
    const veh = vehicles.find((v) => v.id === selectedVehicle);
    return veh ? veh.baseFare : 700;
  }, [selectedVehicle]);

  // Destination search autocomplete suggestions
  const destinationsSuggestions = [
    'Houari Boumediene Airport (ALG)',
    'Algiers Casbah Ottoman Citadel',
    'Garden City Mall, Cheraga',
    'Sidi Fredj Beach Resort, Tipaza',
    'Constantine Suspension Bridges, East',
  ];

  const SUGGESTION_COORDS: Record<string, { lat: number; lng: number }> = {
    'Houari Boumediene Airport (ALG)': { lat: 36.6918, lng: 3.2183 },
    'Algiers Casbah Ottoman Citadel': { lat: 36.7850, lng: 3.0600 },
    'Garden City Mall, Cheraga': { lat: 36.7565, lng: 2.9555 },
    'Sidi Fredj Beach Resort, Tipaza': { lat: 36.7620, lng: 2.8485 },
    'Constantine Suspension Bridges, East': { lat: 36.3650, lng: 6.6147 },
  };

  const filteredSuggestions = useMemo(() => {
    if (!destination.trim()) return [];
    return destinationsSuggestions.filter((d) =>
      d.toLowerCase().includes(destination.toLowerCase())
    );
  }, [destination]);

  // Sync offer fare to base fare of selected vehicle type
  useEffect(() => {
    const veh = vehicles.find((v) => v.id === selectedVehicle);
    if (veh) {
      setUserOfferFare(veh.baseFare);
    }
  }, [selectedVehicle]);

  // Request & Bidding simulations
  useEffect(() => {
    if (step === 'requesting') {
      const timer = setTimeout(() => {
        setStep('bidding');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const generateDynamicBids = (offer: number, vehicleType: string): Bid[] => {
    const models: Record<string, { entry: string; mid: string; premium: string }> = {
      berline: { entry: 'Dacia Logan', mid: 'Hyundai Accent', premium: 'Toyota Camry' },
      suv: { entry: 'Dacia Duster', mid: 'Hyundai Tucson', premium: 'Kia Sportage' },
      moto: { entry: 'Yamaha X-Max', mid: 'Vespa Sprint', premium: 'TMax 560' },
      van: { entry: 'Hyundai H1', mid: 'Mercedes Vito', premium: 'Peugeot Traveller' },
    };

    const cars = models[vehicleType] || models.berline;

    return [
      { driver: 'Karim', car: cars.entry, fare: offer, rating: 4.7 },
      { driver: 'Youcef', car: cars.mid, fare: Math.round((offer * 1.15) / 50) * 50, rating: 4.8 },
      { driver: 'Bilal', car: cars.premium, fare: Math.round((offer * 0.9) / 50) * 50, rating: 4.9 },
    ];
  };

  const handleRequestRide = () => {
    if (!destination) return;
    hapticLight();
    setDynamicBids(generateDynamicBids(userOfferFare, selectedVehicle));
    setStep('requesting');
  };

  const handleAcceptBid = (driverName: string, finalFare: number, vehicleName: string) => {
    hapticSuccess();
    setStep('matched');

    // Simulate final match phase
    setTimeout(() => {
      // Add booking details
      addBooking({
        type: 'driver',
        title: `${driverName} — Ride Request`,
        subtitle: `${pickup} → ${destination}`,
        price: finalFare,
        businessId: 'sim-driver-id',
        icon: 'car',
        iconFamily: 'Ionicons',
        color: '#000000',
        details: {
          vehicle: vehicleName,
          pickup: pickup,
          dropoff: destination,
          eta: '4 min',
          driver_rating: '4.8★',
        },
      });

      // Navigate to confirmation page
      router.replace({
        pathname: '/booking/confirm',
        params: {
          type: 'driver',
          title: `${driverName} — Ride Request`,
          subtitle: `${pickup} → ${destination}`,
          price: String(finalFare),
        },
      });
    }, 2500);
  };

  const mapCenter = useMemo<[number, number]>(() => {
    if (userLongitude && userLatitude) return [userLongitude, userLatitude];
    return [3.0588, 36.7538];
  }, [userLongitude, userLatitude]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Full Map Layer Behind */}
      <View style={styles.mapLayer}>
        <MapWithDirections
          showUserLocation
          initialCenter={mapCenter}
          initialZoom={14}
        />
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 10 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Interactive Bottom Sheet Console */}
      <View style={[styles.consoleCard, { backgroundColor: colors.card, borderTopColor: colors.border }]} pointerEvents="box-none">
        
        {step === 'search' && (
          // ── STEP 1: Search pickup/dropoff ──
          <ScrollView style={styles.consoleScroll} keyboardShouldPersistTaps="handled">
            <Text style={[styles.consoleTitle, { color: colors.text }]}>Where are you going?</Text>

            {/* Form */}
            <View style={styles.form}>
              <View style={[styles.inputRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Ionicons name="pin-outline" size={18} color="#10B981" />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Pickup location"
                  value={pickup}
                  onChangeText={setPickup}
                />
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Ionicons name="location-outline" size={18} color="#EF4444" />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Where to?"
                  placeholderTextColor={colors.muted}
                  value={destination}
                  onChangeText={(text) => {
                    setDestination(text);
                    setDestFocused(true);
                  }}
                  onFocus={() => setDestFocused(true)}
                />
              </View>

              {/* Suggestions */}
              {destFocused && filteredSuggestions.length > 0 && (
                <View style={[styles.suggestionsBox, { borderColor: colors.border }]}>
                  {filteredSuggestions.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.suggestionItem}
                      onPress={() => {
                        hapticLight();
                        setDestination(item);
                        setDestFocused(false);
                        const coords = SUGGESTION_COORDS[item];
                        if (coords) {
                          setDestinationLocation({
                            latitude: coords.lat,
                            longitude: coords.lng,
                            address: item,
                          });
                        }
                      }}
                    >
                      <Ionicons name="time-outline" size={14} color={colors.muted} />
                      <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Vehicle Selection List */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Select Fare Mode</Text>
            <View style={styles.vehiclesList}>
              {vehicles.map((veh) => {
                const isSelected = selectedVehicle === veh.id;
                return (
                  <TouchableOpacity
                    key={veh.id}
                    style={[
                      styles.vehicleCard,
                      { backgroundColor: colors.bg, borderColor: isSelected ? RIHLA.primary : colors.border },
                      isSelected && { borderWidth: 2 },
                    ]}
                    onPress={() => { hapticLight(); setSelectedVehicle(veh.id); }}
                    activeOpacity={0.9}
                  >
                    <Ionicons name={veh.icon as any} size={24} color={isSelected ? RIHLA.accent : colors.text} />
                    <View style={styles.vehicleInfo}>
                      <Text style={[styles.vehicleName, { color: colors.text }]}>{veh.name}</Text>
                      <Text style={[styles.vehicleDesc, { color: colors.muted }]}>{veh.desc}</Text>
                    </View>
                    <View style={styles.vehicleFareArea}>
                      <Text style={[styles.vehicleFare, { color: colors.text }]}>{veh.baseFare} DZD</Text>
                      <Text style={[styles.vehicleEta, { color: colors.muted }]}>{veh.eta}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Offer Fare negotiation */}
            <View style={styles.offerFareContainer}>
              <Text style={[styles.offerFareLabel, { color: colors.text }]}>Suggest Your Fare (DZD)</Text>
              <View style={styles.offerFareRow}>
                <TouchableOpacity
                  style={[styles.fareAdjustBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setUserOfferFare(prev => Math.max(100, prev - 50)); }}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.fareInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }]}
                  keyboardType="number-pad"
                  value={String(userOfferFare)}
                  onChangeText={(val) => {
                    const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
                    setUserOfferFare(num);
                  }}
                />
                <TouchableOpacity
                  style={[styles.fareAdjustBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                  onPress={() => { hapticLight(); setUserOfferFare(prev => prev + 50); }}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Request CTA */}
            <TouchableOpacity
              style={[styles.requestBtn, !destination && { opacity: 0.5 }]}
              disabled={!destination}
              onPress={handleRequestRide}
            >
              <Text style={styles.requestBtnText}>Request Ride Estimate</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === 'requesting' && (
          // ── STEP 2: Broadcasting radar ──
          <View style={styles.broadcastingCard}>
            <ActivityIndicator size="large" color={RIHLA.accent} />
            <Text style={[styles.progressTitle, { color: colors.text }]}>Broadcasting Ride Request</Text>
            <Text style={[styles.progressSub, { color: colors.muted }]}>
              Searching drivers near {pickup.slice(0, 30)}...
            </Text>
          </View>
        )}

        {step === 'bidding' && (
          // ── STEP 3: Driver bids / negotiations ──
          <View style={styles.biddingCard}>
            <View style={styles.biddingHeader}>
              <View style={styles.pulseDot} />
              <Text style={[styles.biddingTitle, { color: colors.text }]}>Driver Bids Received</Text>
            </View>
            <Text style={[styles.biddingSub, { color: colors.muted }]}>
              Drivers have proposed these fares. Choose your ride:
            </Text>

            <View style={styles.bidsList}>
              {dynamicBids.map((bid, idx) => (
                <View key={idx} style={[styles.bidRow, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <View style={styles.bidDriverInfo}>
                    <Text style={[styles.bidDriverName, { color: colors.text }]}>{bid.driver}</Text>
                    <Text style={[styles.bidCar, { color: colors.muted }]}>
                      {bid.car} · ⭐ {bid.rating}
                    </Text>
                  </View>
                  <View style={styles.bidFareRow}>
                    <Text style={[styles.bidPrice, { color: colors.text }]}>{bid.fare} DZD</Text>
                    <TouchableOpacity
                      style={styles.acceptBidBtn}
                      onPress={() => handleAcceptBid(bid.driver, bid.fare, bid.car)}
                    >
                      <Text style={styles.acceptBidText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 'matched' && (
          // ── STEP 4: Matched! ──
          <View style={styles.matchedCard}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={[styles.matchedTitle, { color: colors.text }]}>Ride Match Confirmed!</Text>
            <Text style={[styles.matchedSub, { color: colors.muted }]}>
              Your driver is heading to your location.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  mapLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Interactive sheet console
  consoleCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 16,
    maxHeight: '65%',
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  consoleScroll: { maxHeight: '100%' },
  consoleTitle: { fontSize: 18, fontFamily: 'mon-b', marginBottom: 12 },
  form: { gap: 8, marginBottom: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, fontSize: 13, fontFamily: 'mon' },
  suggestionsBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginTop: 4,
    gap: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  suggestionText: { fontSize: 13, fontFamily: 'mon-sb' },

  // Vehicle Cards
  sectionTitle: { fontSize: 14, fontFamily: 'mon-b', marginBottom: 8 },
  vehiclesList: { gap: 8 },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  vehicleInfo: { flex: 1, gap: 2 },
  vehicleName: { fontSize: 13, fontFamily: 'mon-b' },
  vehicleDesc: { fontSize: 10, fontFamily: 'mon' },
  vehicleFareArea: { alignItems: 'flex-end', gap: 2 },
  vehicleFare: { fontSize: 14, fontFamily: 'mon-b' },
  vehicleEta: { fontSize: 10, fontFamily: 'mon-sb' },

  // Request CTA
  requestBtn: {
    height: 48,
    backgroundColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  requestBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'mon-b' },

  // Broadcasting Phase
  broadcastingCard: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  progressTitle: { fontSize: 16, fontFamily: 'mon-b' },
  progressSub: { fontSize: 12, fontFamily: 'mon' },

  // Bidding Phase
  biddingCard: { paddingVertical: 12 },
  biddingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  biddingTitle: { fontSize: 16, fontFamily: 'mon-b' },
  biddingSub: { fontSize: 12, fontFamily: 'mon', marginBottom: 12 },
  bidsList: { gap: 8 },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  bidDriverInfo: { flex: 1, gap: 2 },
  bidDriverName: { fontSize: 13, fontFamily: 'mon-b' },
  bidCar: { fontSize: 11, fontFamily: 'mon' },
  bidFareRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bidPrice: { fontSize: 14, fontFamily: 'mon-b' },
  acceptBidBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptBidText: { color: '#FFF', fontSize: 12, fontFamily: 'mon-b' },

  // Matched Phase
  matchedCard: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  matchedTitle: { fontSize: 16, fontFamily: 'mon-b' },
  matchedSub: { fontSize: 12, fontFamily: 'mon' },
  // Offer Fare Styling
  offerFareContainer: {
    marginVertical: 12,
    gap: 8,
  },
  offerFareLabel: {
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  offerFareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fareAdjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fareInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'mon-b',
  },
});
