import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import MapWithDirections from '@/components/shared/MapWithDirections';

const { width: SCREEN_W } = Dimensions.get('window');

interface PortalProps {
  onSearchAll: () => void;
}

export default function DriverPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();

  // Ride hailing states
  const [pickup, setPickup] = useState('Algiers Airport (ALG)');
  const [dropoff, setDropoff] = useState('Algiers City Center');
  const [vehicle, setVehicle] = useState<'economy' | 'comfort' | 'suv'>('economy');
  const [bidAdjustment, setBidAdjustment] = useState<number>(0);
  const [requesting, setRequesting] = useState(false);

  const baseFare = useMemo(() => {
    const mult = vehicle === 'economy' ? 1.0 : vehicle === 'comfort' ? 1.5 : 2.0;
    return Math.round(1200 * mult);
  }, [vehicle]);

  const finalFare = baseFare + bidAdjustment;

  const handleRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      // Navigate to detailed ride hailing screen
      router.push('/services/ride' as any);
    }, 1500);
  };

  const handleAdjustBid = (amt: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBidAdjustment(prev => Math.max(-200, Math.min(400, prev + amt)));
  };

  // Mock vehicle markers on map
  const mockCarMarkers = [
    { id: 'car1', latitude: 36.7538, longitude: 3.0588, title: 'Youcef (Comfort)', category: 'driver' },
    { id: 'car2', latitude: 36.7621, longitude: 3.0410, title: 'Amine (Economy)', category: 'driver' },
    { id: 'car3', latitude: 36.7410, longitude: 3.0720, title: 'Sofiane (SUV)', category: 'driver' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── INTERACTIVE HAILING MAP ── */}
      <View style={styles.mapContainer}>
        <MapWithDirections
          markers={mockCarMarkers as any}
          showDirections={false}
          showUserLocation={true}
          height={200}
          initialCenter={[3.0588, 36.7538]}
          initialZoom={12}
        />
        <View style={styles.mapOverlayBadge}>
          <Text style={styles.mapBadgeText}>3 Drivers Nearby</Text>
        </View>
      </View>

      {/* ── RIDE-HAILING PANEL ── */}
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.panelTitle, { color: colors.text }]}>Request a Ride (Yassir-Style)</Text>

        {/* Pickup / Dropoff inputs */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <Ionicons name="ellipse" size={12} color="#10B981" />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Enter pickup location"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.inputRow}>
            <Ionicons name="location" size={14} color="#EF4444" />
            <TextInput 
              style={[styles.input, { color: colors.text }]}
              value={dropoff}
              onChangeText={setDropoff}
              placeholder="Enter destination"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        {/* Vehicle Type selection */}
        <View style={styles.vehicleRow}>
          {[
            { key: 'economy', label: 'Economy', icon: 'car-outline', base: '1200 DA' },
            { key: 'comfort', label: 'Comfort', icon: 'car-sport-outline', base: '1800 DA' },
            { key: 'suv', label: 'SUV Premium', icon: 'bus-outline', base: '2400 DA' },
          ].map((item) => (
            <TouchableOpacity 
              key={item.key}
              style={[styles.vehicleCard, vehicle === item.key && styles.vehicleCardActive, { backgroundColor: colors.bg, borderColor: colors.border }]}
              onPress={() => setVehicle(item.key as any)}
            >
              <Ionicons name={item.icon as any} size={20} color={vehicle === item.key ? '#0a2540' : colors.icon} />
              <Text style={[styles.vehicleLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.vehiclePrice, { color: colors.muted }]}>{item.base}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bid Adjustment panel */}
        <View style={[styles.bidSection, { backgroundColor: colors.bg }]}>
          <Text style={[styles.bidTitle, { color: colors.text }]}>Offer Fare: <Text style={styles.bidHighlight}>{finalFare} DZD</Text></Text>
          <View style={styles.bidActions}>
            <TouchableOpacity style={styles.bidBtn} onPress={() => handleAdjustBid(-50)}>
              <Text style={styles.bidBtnLabel}>-50 DA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bidBtn} onPress={() => handleAdjustBid(50)}>
              <Text style={styles.bidBtnLabel}>+50 DA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Request button */}
        <TouchableOpacity 
          style={styles.requestBtn}
          onPress={handleRequest}
          disabled={requesting}
        >
          <Text style={styles.requestBtnLabel}>
            {requesting ? 'Broadcasting to Drivers...' : 'Request Ride Now'}
          </Text>
          {requesting && <View style={styles.spinner} />}
        </TouchableOpacity>
      </View>

      {/* ── TRANSFER PACKAGES ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Inter-City Transfers & Hire</Text>
        <View style={styles.transferRow}>
          {[
            { route: 'Algiers ⇄ Oran', desc: 'Private sedan transfer', price: '12,000 DA' },
            { route: 'Algiers ⇄ Constantine', desc: 'Luxury SUV transfer', price: '15,000 DA' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx}
              style={[styles.transferCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onSearchAll()}
            >
              <Ionicons name="git-compare" size={18} color="#0a2540" />
              <View style={styles.transferDetails}>
                <Text style={[styles.transferRoute, { color: colors.text }]}>{item.route}</Text>
                <Text style={[styles.transferDesc, { color: colors.muted }]}>{item.desc}</Text>
              </View>
              <Text style={styles.transferPrice}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 200,
    position: 'relative',
  },
  mapOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#0a2540',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  mapBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  panel: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    height: 38,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'mon-sb',
    padding: 0,
  },
  divider: {
    height: 1,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  vehicleCardActive: {
    borderColor: '#0a2540',
    backgroundColor: '#0a25400d',
  },
  vehicleLabel: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  vehiclePrice: {
    fontSize: 9,
    fontFamily: 'mon',
  },
  bidSection: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidTitle: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  bidHighlight: {
    fontFamily: 'mon-b',
    color: '#3B82F6',
  },
  bidActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bidBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bidBtnLabel: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  requestBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0a2540',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  requestBtnLabel: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  spinner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFF',
    borderTopColor: 'transparent',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  transferRow: {
    gap: 10,
  },
  transferCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  transferDetails: {
    flex: 1,
    gap: 2,
  },
  transferRoute: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  transferDesc: {
    fontSize: 10,
    fontFamily: 'mon',
  },
  transferPrice: {
    fontSize: 13,
    fontFamily: 'mon-b',
    color: '#0a2540',
  },
});
