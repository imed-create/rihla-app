/**
 * RIHLA — Ride Bidding & Matching Bottom Sheet
 * ──────────────────────────────────────────────
 * Yassir / inDrive hybrid bottom sheet for Bucket 1 (Rides).
 * Mutates panels based on the active searchPhase:
 *   Phase 1: Destination entry + route selection
 *   Phase 2: Fare counter-offer (inDrive style)
 *   Phase 3: Live radar + incoming driver bids
 *   Phase 4: Matched driver tracking
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useTravelerRideStore, type RidePhase, type DriverBid } from '@/store/useTravelerRideStore';
import { useLocationStore } from '@/store/useLocationStore';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Helpers ──

function formatDA(amount: number): string {
  return `${amount.toLocaleString('en-US')} DA`;
}

function getEtaLabel(minutes: number): string {
  if (minutes <= 1) return 'Arriving now';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── Radar Pulse Animation ──

function RadarPulse() {
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.5]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.6, 0]),
  }));

  return (
    <View style={radarStyles.container}>
      <Animated.View style={[radarStyles.ring, animatedStyle]} />
      <View style={radarStyles.dot} />
    </View>
  );
}

const radarStyles = StyleSheet.create({
  container: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00FF66',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00FF66',
  },
});

// ── Phase 1: Destination Entry ──

const POPULAR_DESTINATIONS = [
  { name: 'Houari Boumediene Airport', icon: 'airplane-outline', lat: 36.6910, lng: 3.2154 },
  { name: 'Grande Poste Algiers', icon: 'location-outline', lat: 36.7525, lng: 3.0564 },
  { name: 'Jardin d\'Essai', icon: 'leaf-outline', lat: 36.7465, lng: 3.0810 },
  { name: 'Casbah of Algiers', icon: 'castle-outline', lat: 36.7833, lng: 3.0500 },
  { name: 'Martyrs\' Memorial', icon: 'megaphone-outline', lat: 36.7700, lng: 3.0580 },
];

function PhaseDestinationEntry() {
  const { colors } = useTheme();
  const {
    pickupCoords,
    dropoffCoords,
    setPickup,
    setDropoff,
    suggestedFareDZD,
    goToBroadcasting,
    goToSelectingRoute,
    searchPhase,
  } = useTravelerRideStore();
  const { userLatitude, userLongitude, userAddress } = useLocationStore();

  const [pickupText, setPickupText] = useState(pickupCoords?.addressName || userAddress || '');
  const [dropoffText, setDropoffText] = useState(dropoffCoords?.addressName || '');

  // Auto-set pickup on mount
  React.useEffect(() => {
    if (userLatitude && userLongitude && userAddress && !pickupCoords) {
      setPickup({ latitude: userLatitude, longitude: userLongitude, addressName: userAddress });
      setPickupText(userAddress);
    }
  }, [userLatitude, userLongitude, userAddress]);

  const handleUseMyLocation = useCallback(() => {
    if (userLatitude && userLongitude && userAddress) {
      setPickup({ latitude: userLatitude, longitude: userLongitude, addressName: userAddress });
      setPickupText(userAddress);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [userLatitude, userLongitude, userAddress, setPickup]);

  const handleSelectDestination = useCallback((dest: typeof POPULAR_DESTINATIONS[0]) => {
    setDropoffText(dest.name);
    setDropoff({ latitude: dest.lat, longitude: dest.lng, addressName: dest.name });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [setDropoff]);

  const handleSetDropoff = useCallback(() => {
    if (!dropoffText.trim()) return;
    const mockCoords = {
      latitude: (userLatitude || 36.7538) + (Math.random() - 0.5) * 0.05,
      longitude: (userLongitude || 3.0588) + (Math.random() - 0.5) * 0.05,
      addressName: dropoffText.trim(),
    };
    setDropoff(mockCoords);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [dropoffText, userLatitude, userLongitude, setDropoff]);

  const canProceed = pickupCoords && dropoffCoords && suggestedFareDZD > 0;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={phaseStyles.container}>
      <Text style={[phaseStyles.title, { color: colors.text }]}>Where are you going?</Text>
      <Text style={[phaseStyles.subtitle, { color: colors.muted }]}>
        Set your pickup and destination
      </Text>

      {/* Pickup Input */}
      <View style={[phaseStyles.inputRow, { borderColor: colors.border }]}>
        <View style={[phaseStyles.inputDot, { backgroundColor: '#00FF66' }]} />
        <TextInput
          style={[phaseStyles.input, { color: colors.text }]}
          placeholder="Pickup location"
          placeholderTextColor={colors.muted}
          value={pickupText}
          onChangeText={setPickupText}
          onFocus={handleUseMyLocation}
        />
        <TouchableOpacity onPress={handleUseMyLocation} style={phaseStyles.inputAction}>
          <Ionicons name="locate-outline" size={18} color="#00FF66" />
        </TouchableOpacity>
      </View>

      {/* Connection line */}
      <View style={phaseStyles.connectorLine}>
        <View style={[phaseStyles.connectorDot, { backgroundColor: colors.muted }]} />
        <View style={[phaseStyles.connectorBar, { backgroundColor: colors.border }]} />
        <View style={[phaseStyles.connectorDot, { backgroundColor: colors.muted }]} />
      </View>

      {/* Dropoff Input */}
      <View style={[phaseStyles.inputRow, { borderColor: dropoffCoords ? '#00FF66' : colors.border }]}>
        <View style={[phaseStyles.inputDot, { backgroundColor: '#FF4444' }]} />
        <TextInput
          style={[phaseStyles.input, { color: colors.text }]}
          placeholder="Where to?"
          placeholderTextColor={colors.muted}
          value={dropoffText}
          onChangeText={(t) => {
            setDropoffText(t);
          }}
          onSubmitEditing={handleSetDropoff}
        />
        {dropoffText.length > 0 && (
          <TouchableOpacity onPress={() => { setDropoffText(''); setDropoff(null); }} style={phaseStyles.inputAction}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Popular destinations */}
      {!dropoffCoords && (
        <View style={phaseStyles.popularSection}>
          <Text style={[phaseStyles.popularTitle, { color: colors.muted }]}>Popular destinations</Text>
          <View style={phaseStyles.popularGrid}>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => handleSelectDestination(dest)}
                style={[phaseStyles.popularChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Ionicons name={dest.icon as any} size={14} color="#00FF66" />
                <Text style={[phaseStyles.popularChipText, { color: colors.text }]} numberOfLines={1}>
                  {dest.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Suggested Fare Display */}
      {suggestedFareDZD > 0 && (
        <Animated.View
          entering={FadeInUp.delay(200).duration(300)}
          style={[phaseStyles.fareCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Text style={[phaseStyles.fareLabel, { color: colors.muted }]}>Suggested fare</Text>
          <Text style={phaseStyles.fareAmount}>{formatDA(suggestedFareDZD)}</Text>
          <Text style={[phaseStyles.fareNote, { color: colors.muted }]}>
            Based on ~{Math.round(suggestedFareDZD / 35)}km estimated distance
          </Text>
        </Animated.View>
      )}

      {/* Broadcast CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!canProceed}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          goToBroadcasting();
        }}
        style={[
          phaseStyles.ctaBtn,
          canProceed ? phaseStyles.ctaBtnActive : phaseStyles.ctaBtnDisabled,
        ]}
      >
        <Ionicons name="radio-outline" size={18} color={canProceed ? '#000' : '#555'} />
        <Text style={[phaseStyles.ctaText, !canProceed && { color: '#555' }]}>
          {canProceed ? 'Set Fare & Broadcast' : 'Select destination first'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Phase 2: Fare Counter-Offer (inDrive style) ──

function PhaseFareCounter() {
  const { colors } = useTheme();
  const {
    suggestedFareDZD,
    userOfferedFareDZD,
    setUserOfferedFare,
    goToReceivingBids,
    pickupCoords,
    dropoffCoords,
  } = useTravelerRideStore();

  const fare = userOfferedFareDZD || suggestedFareDZD;
  const decrement = () => setUserOfferedFare(Math.max(fare - 50, Math.round(suggestedFareDZD * 0.5)));
  const increment = () => setUserOfferedFare(fare + 50);

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={phaseStyles.container}>
      <Text style={[phaseStyles.title, { color: colors.text }]}>Set your fare</Text>
      <Text style={[phaseStyles.subtitle, { color: colors.muted }]}>
        Offer a price — drivers will accept or counter
      </Text>

      {/* Route summary */}
      <View style={[phaseStyles.routeSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={phaseStyles.routeRow}>
          <View style={[phaseStyles.routeDot, { backgroundColor: '#00FF66' }]} />
          <Text style={[phaseStyles.routeText, { color: colors.text }]} numberOfLines={1}>
            {pickupCoords?.addressName || 'Current location'}
          </Text>
        </View>
        <View style={[phaseStyles.routeConnector, { backgroundColor: colors.border }]} />
        <View style={phaseStyles.routeRow}>
          <View style={[phaseStyles.routeDot, { backgroundColor: '#FF4444' }]} />
          <Text style={[phaseStyles.routeText, { color: colors.text }]} numberOfLines={1}>
            {dropoffCoords?.addressName || 'Destination'}
          </Text>
        </View>
      </View>

      {/* Fare selector */}
      <View style={[phaseStyles.fareSelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[phaseStyles.fareSelectorLabel, { color: colors.muted }]}>Your offer</Text>

        <View style={phaseStyles.fareControls}>
          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); decrement(); }}
            style={[phaseStyles.fareBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
          >
            <Ionicons name="remove" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={phaseStyles.fareDisplay}>
            <Text style={phaseStyles.fareBigNumber}>{formatDA(fare)}</Text>
            {fare < suggestedFareDZD && (
              <View style={[phaseStyles.fareDiffBadge, { backgroundColor: '#FF4444' + '20' }]}>
                <Ionicons name="trending-down" size={12} color="#FF4444" />
                <Text style={phaseStyles.fareDiffText}>
                  {formatDA(suggestedFareDZD - fare)} below suggestion
                </Text>
              </View>
            )}
            {fare > suggestedFareDZD && (
              <View style={[phaseStyles.fareDiffBadge, { backgroundColor: '#00FF66' + '20' }]}>
                <Ionicons name="trending-up" size={12} color="#00FF66" />
                <Text style={[phaseStyles.fareDiffText, { color: '#00FF66' }]}>
                  {formatDA(fare - suggestedFareDZD)} above suggestion
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => { Haptics.selectionAsync(); increment(); }}
            style={[phaseStyles.fareBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
          >
            <Ionicons name="add" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick fare chips */}
        <View style={phaseStyles.fareChips}>
          {[suggestedFareDZD, Math.round(suggestedFareDZD * 0.85), Math.round(suggestedFareDZD * 1.15)].map(
            (f, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { Haptics.selectionAsync(); setUserOfferedFare(f); }}
                style={[
                  phaseStyles.fareChip,
                  fare === f && { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
                ]}
              >
                <Text
                  style={[
                    phaseStyles.fareChipText,
                    { color: fare === f ? '#000' : colors.text },
                  ]}
                >
                  {formatDA(f)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Broadcast CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          goToReceivingBids();
        }}
        style={[phaseStyles.ctaBtn, phaseStyles.ctaBtnActive]}
      >
        <Ionicons name="radio-outline" size={18} color="#000" />
        <Text style={phaseStyles.ctaText}>Broadcast at {formatDA(fare)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Phase 3: Live Radar + Driver Bids ──

function PhaseLiveBidding() {
  const { colors } = useTheme();
  const { incomingDriverBids, searchPhase, goToMatched } = useTravelerRideStore();
  const [elapsed, setElapsed] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptBid = useCallback(
    (bid: DriverBid) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      goToMatched({
        fullName: bid.fullName,
        phone: '+213 5XX XXX XXX',
        licensePlate: '12345-' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        vehicleModel: bid.vehicleInfo,
        vehicleColor: 'Grey',
        currentCoords: {
          latitude: 36.7538 + (Math.random() - 0.5) * 0.02,
          longitude: 3.0588 + (Math.random() - 0.5) * 0.02,
        },
        pickupEtaMinutes: bid.etaMinutes,
        rating: bid.rating,
      });
    },
    [goToMatched]
  );

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={phaseStyles.container}>
      {/* Radar header */}
      <View style={phaseStyles.radarHeader}>
        <RadarPulse />
        <View style={{ flex: 1 }}>
          <Text style={[phaseStyles.title, { color: colors.text }]}>
            Searching nearby drivers...
          </Text>
          <Text style={[phaseStyles.subtitle, { color: colors.muted }]}>
            {elapsed < 5 ? 'Pinging drivers within 5km' : `${incomingDriverBids.length} bid${incomingDriverBids.length !== 1 ? 's' : ''} received`}
          </Text>
        </View>
        <View style={[phaseStyles.timerBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[phaseStyles.timerText, { color: colors.text }]}>{getEtaLabel(elapsed)}</Text>
        </View>
      </View>

      {/* Incoming bids list */}
      {incomingDriverBids.length > 0 ? (
        <ScrollView
          style={phaseStyles.bidsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
        >
          {incomingDriverBids.map((bid, index) => (
            <Animated.View
              key={bid.bidId}
              entering={FadeInDown.delay(index * 100).duration(300)}
            >
              <BidCard bid={bid} onAccept={() => handleAcceptBid(bid)} />
            </Animated.View>
          ))}
        </ScrollView>
      ) : (
        <View style={phaseStyles.emptyBids}>
          <Ionicons name="car-outline" size={32} color={colors.muted} />
          <Text style={[phaseStyles.emptyBidsText, { color: colors.muted }]}>
            Waiting for driver responses...
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ── Bid Card ──

function BidCard({ bid, onAccept }: { bid: DriverBid; onAccept: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={[bidStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={bidStyles.topRow}>
        {/* Avatar */}
        <View style={[bidStyles.avatar, { backgroundColor: colors.bg }]}>
          <Ionicons name="person" size={20} color={colors.muted} />
        </View>

        {/* Driver info */}
        <View style={bidStyles.info}>
          <Text style={[bidStyles.name, { color: colors.text }]} numberOfLines={1}>
            {bid.fullName}
          </Text>
          <View style={bidStyles.metaRow}>
            <Ionicons name="star" size={12} color="#FFD166" />
            <Text style={[bidStyles.metaText, { color: colors.muted }]}>
              {bid.rating} · {bid.totalTrips} trips
            </Text>
          </View>
          <Text style={[bidStyles.vehicle, { color: colors.muted }]}>{bid.vehicleInfo}</Text>
        </View>

        {/* Fare */}
        <View style={bidStyles.fareBlock}>
          <Text style={bidStyles.fareAmount}>{formatDA(bid.proposedFareDZD)}</Text>
          <Text style={[bidStyles.etaText, { color: colors.muted }]}>
            {getEtaLabel(bid.etaMinutes)}
          </Text>
        </View>
      </View>

      {/* Accept CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAccept}
        style={[bidStyles.acceptBtn]}
      >
        <Ionicons name="checkmark-circle" size={16} color="#000" />
        <Text style={bidStyles.acceptText}>Accept Bid</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Phase 4: Matched Driver Tracking ──

function PhaseMatchedTracking() {
  const { colors } = useTheme();
  const { activeMatchedDriver, resetToIdle } = useTravelerRideStore();
  const [arrivalEta, setArrivalEta] = useState(activeMatchedDriver?.pickupEtaMinutes || 5);

  React.useEffect(() => {
    if (arrivalEta <= 0) return;
    const timer = setTimeout(() => setArrivalEta((e) => Math.max(e - 1, 0)), 60000);
    return () => clearTimeout(timer);
  }, [arrivalEta]);

  if (!activeMatchedDriver) return null;

  const driver = activeMatchedDriver;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={phaseStyles.container}>
      {/* Matched status */}
      <View style={[phaseStyles.matchedBadge, { backgroundColor: '#00FF66' + '15' }]}>
        <Ionicons name="checkmark-circle" size={18} color="#00FF66" />
        <Text style={phaseStyles.matchedText}>Driver matched — en route to you</Text>
      </View>

      {/* Driver card */}
      <View style={[matchedStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={matchedStyles.topRow}>
          <View style={[matchedStyles.avatar, { backgroundColor: colors.bg }]}>
            <Ionicons name="person" size={28} color={colors.muted} />
            <View style={[matchedStyles.ratingBadge, { backgroundColor: colors.card }]}>
              <Ionicons name="star" size={10} color="#FFD166" />
              <Text style={[matchedStyles.ratingText, { color: colors.text }]}>{driver.rating}</Text>
            </View>
          </View>

          <View style={matchedStyles.info}>
            <Text style={[matchedStyles.name, { color: colors.text }]}>{driver.fullName}</Text>
            <Text style={[matchedStyles.vehicle, { color: colors.muted }]}>
              {driver.vehicleColor} {driver.vehicleModel}
            </Text>
            <View style={matchedStyles.plateContainer}>
              <Text style={matchedStyles.plateText}>{driver.licensePlate}</Text>
            </View>
          </View>
        </View>

        {/* ETA */}
        <View style={[matchedStyles.etaRow, { borderTopColor: colors.border }]}>
          <View style={matchedStyles.etaBlock}>
            <Text style={[matchedStyles.etaLabel, { color: colors.muted }]}>Arriving in</Text>
            <Text style={matchedStyles.etaValue}>{getEtaLabel(arrivalEta)}</Text>
          </View>
          <View style={[matchedStyles.etaDivider, { backgroundColor: colors.border }]} />
          <View style={matchedStyles.etaBlock}>
            <Text style={[matchedStyles.etaLabel, { color: colors.muted }]}>Status</Text>
            <Text style={[matchedStyles.etaValue, { color: '#00FF66' }]}>
              {arrivalEta > 2 ? 'On the way' : 'Arriving now'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={phaseStyles.matchedActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => Linking.openURL(`tel:${driver.phone}`)}
          style={[matchedStyles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="call" size={18} color="#00FF66" />
          <Text style={[matchedStyles.actionText, { color: colors.text }]}>Call Driver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast('Message sent to driver', 'success');
          }}
          style={[matchedStyles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="chatbubble" size={18} color="#00a896" />
          <Text style={[matchedStyles.actionText, { color: colors.text }]}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            resetToIdle();
          }}
          style={[matchedStyles.actionBtn, matchedStyles.cancelBtn]}
        >
          <Ionicons name="close-circle" size={18} color="#FF4444" />
          <Text style={[matchedStyles.actionText, { color: '#FF4444' }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ── Main Sheet Component ──

export default function RideBiddingSheet() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { searchPhase, isSheetOpen, closeSheet, resetToIdle } = useTravelerRideStore();

  const sheetTranslateY = useSharedValue(400);

  React.useEffect(() => {
    sheetTranslateY.value = withSpring(isSheetOpen ? 0 : 400, {
      damping: 25,
      stiffness: 200,
    });
  }, [isSheetOpen, sheetTranslateY]);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  if (!isSheetOpen && searchPhase === 'IDLE') return null;

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingBottom: insets.bottom + 16,
        },
        animatedSheetStyle,
      ]}
    >
      {/* Handle bar */}
      <View style={styles.handleRow}>
        <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
      </View>

      {/* Close button */}
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: colors.card }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          resetToIdle();
        }}
      >
        <Ionicons name="close" size={16} color={colors.muted} />
      </TouchableOpacity>

      {/* Phase content */}
      {searchPhase === 'SELECTING_ROUTE' && <PhaseDestinationEntry />}
      {searchPhase === 'BROADCASTING_REQUEST' && <PhaseFareCounter />}
      {searchPhase === 'RECEIVING_BIDS' && <PhaseLiveBidding />}
      {searchPhase === 'MATCHED_EN_ROUTE' && <PhaseMatchedTracking />}
    </Animated.View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '75%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: { elevation: 20 },
    }),
  },
  handleRow: { alignItems: 'center', paddingVertical: 8 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

const phaseStyles = StyleSheet.create({
  container: { paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 18, fontFamily: 'mon-b', marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: 'mon', marginBottom: 16 },

  // Route inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  inputDot: { width: 10, height: 10, borderRadius: 5 },
  input: { flex: 1, fontSize: 14, fontFamily: 'mon' },
  inputAction: { padding: 4 },

  // Connector
  connectorLine: { flexDirection: 'column', alignItems: 'center', height: 28, marginLeft: 4 },
  connectorDot: { width: 4, height: 4, borderRadius: 2 },
  connectorBar: { width: 1, flex: 1, marginVertical: 2 },

  // Fare card
  fareCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  fareLabel: { fontSize: 12, fontFamily: 'mon' },
  fareAmount: { fontSize: 28, fontFamily: 'mon-b', color: '#00FF66', marginTop: 4 },
  fareNote: { fontSize: 11, fontFamily: 'mon', marginTop: 4 },

  // Popular destinations
  popularSection: { marginTop: 12 },
  popularTitle: { fontSize: 11, fontFamily: 'mon-sb', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  popularGrid: { gap: 6 },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  popularChipText: { fontSize: 13, fontFamily: 'mon-sb', flex: 1 },

  // CTA button
  ctaBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  ctaBtnActive: { backgroundColor: '#00FF66' },
  ctaBtnDisabled: { backgroundColor: '#1a1a1a' },
  ctaText: { fontSize: 15, fontFamily: 'mon-b', color: '#000' },

  // Route summary
  routeSummary: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeText: { fontSize: 13, fontFamily: 'mon-sb', flex: 1 },
  routeConnector: { width: 1, height: 12, marginLeft: 3.5, marginVertical: 4 },

  // Fare selector
  fareSelector: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  fareSelectorLabel: { fontSize: 12, fontFamily: 'mon', marginBottom: 12 },
  fareControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  fareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fareDisplay: { flex: 1, alignItems: 'center' },
  fareBigNumber: { fontSize: 24, fontFamily: 'mon-b', color: '#FFFFFF' },
  fareDiffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  fareDiffText: { fontSize: 10, fontFamily: 'mon-sb', color: '#FF4444' },

  // Quick fare chips
  fareChips: { flexDirection: 'row', gap: 8, marginTop: 14 },
  fareChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  fareChipText: { fontSize: 12, fontFamily: 'mon-sb' },

  // Radar
  radarHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  timerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  timerText: { fontSize: 12, fontFamily: 'mon-b' },

  // Bids
  bidsList: { maxHeight: 280 },
  emptyBids: { alignItems: 'center', paddingVertical: 40 },
  emptyBidsText: { fontSize: 13, fontFamily: 'mon', marginTop: 8 },

  // Matched
  matchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  matchedText: { fontSize: 13, fontFamily: 'mon-sb', color: '#00FF66' },
  matchedActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
});

const bidStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  topRow: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'mon-b' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, fontFamily: 'mon' },
  vehicle: { fontSize: 11, fontFamily: 'mon', marginTop: 2 },
  fareBlock: { alignItems: 'flex-end' },
  fareAmount: { fontSize: 16, fontFamily: 'mon-b', color: '#00FF66' },
  etaText: { fontSize: 10, fontFamily: 'mon', marginTop: 2 },
  acceptBtn: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#00FF66',
  },
  acceptText: { fontSize: 13, fontFamily: 'mon-b', color: '#000' },
});

const matchedStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  topRow: { flexDirection: 'row', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: { fontSize: 9, fontFamily: 'mon-b' },
  info: { flex: 1 },
  name: { fontSize: 16, fontFamily: 'mon-b' },
  vehicle: { fontSize: 12, fontFamily: 'mon', marginTop: 2 },
  plateContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  plateText: { fontSize: 11, fontFamily: 'mon-b', color: '#FFD166', letterSpacing: 1 },
  etaRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  etaBlock: { flex: 1, alignItems: 'center' },
  etaLabel: { fontSize: 10, fontFamily: 'mon' },
  etaValue: { fontSize: 16, fontFamily: 'mon-b', color: '#FFFFFF', marginTop: 2 },
  etaDivider: { width: 1, marginVertical: -4 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelBtn: { borderColor: '#FF4444' + '40' },
  actionText: { fontSize: 12, fontFamily: 'mon-sb' },
});

// Toast helper (inline to avoid circular import)
function showToast(message: string, type: 'success' | 'error' = 'success') {
  try {
    const { showToast: ts } = require('@/components/Toast');
    ts(message, type);
  } catch {}
}
