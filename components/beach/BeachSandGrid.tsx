import React, { memo, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Line, Path, Circle, G } from 'react-native-svg';
import { RIHLA } from '@/constants/theme';
import {
  BEACH_ACCENT,
  SandSpot,
  SandZoneId,
  SPOT_STATE_COLORS,
  ZONE_CONFIG,
  makeZoneSpots,
} from '@/constants/beachLayout';

const { width: SCREEN_W } = Dimensions.get('window');

// ─────────────────────────────────────────────
// 1. ANIMATED SEA WAVES HEADER
// ─────────────────────────────────────────────

function OceanWaves() {
  const waveAnim = useSharedValue(0);

  useEffect(() => {
    waveAnim.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 2800 }),
        withTiming(0, { duration: 2800 })
      ),
      -1,
      true
    );
  }, []);

  const waveStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: waveAnim.value }],
  }));

  const waveStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: -waveAnim.value * 0.8 }, { translateY: 3 }],
  }));

  return (
    <View style={styles.oceanContainer}>
      <Animated.View style={[styles.waveRow, waveStyle1]}>
        <Svg width="600" height="45" viewBox="0 0 600 45" fill="none">
          <Path
            d="M0 20 Q30 10 60 20 T120 20 T180 20 T240 20 T300 20 T360 20 T420 20 T480 20 T540 20 T600 20 L600 0 L0 0 Z"
            fill="#48CAE4"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.waveRow, waveStyle2]}>
        <Svg width="600" height="45" viewBox="0 0 600 45" fill="none">
          <Path
            d="M0 25 Q30 15 60 25 T120 25 T180 25 T240 25 T300 25 T360 25 T420 25 T480 25 T540 25 T600 25 L600 0 L0 0 Z"
            fill="#00A896"
            opacity={0.8}
          />
        </Svg>
      </Animated.View>
      <View style={styles.shoreFoam} />
    </View>
  );
}

// ─────────────────────────────────────────────
// 2. GLOWING SELECTION RING
// ─────────────────────────────────────────────

function SelectedRing() {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.4, { duration: 1200 }), -1, false);
    opacity.value = withRepeat(withTiming(0, { duration: 1200 }), -1, false);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.pulseRing, ringStyle]} />;
}

// ─────────────────────────────────────────────
// 3. 3D ISOMETRIC UMBRELLA
// ─────────────────────────────────────────────

const ThreeDUmbrella = ({
  color,
  isOccupied,
  isSelected,
}: {
  color: string;
  isOccupied: boolean;
  isSelected: boolean;
}) => {
  const bob = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      bob.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 900 }),
          withTiming(0, { duration: 900 })
        ),
        -1,
        true
      );
    } else {
      bob.value = 0;
    }
  }, [isSelected]);

  const canopyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value - 24 }],
  }));

  if (isOccupied) {
    // Occupied = Closed umbrella lying on the sand
    return (
      <View style={styles.assetWrap}>
        <Svg width="54" height="54" viewBox="0 0 54 54" style={styles.staticSvg}>
          <Ellipse cx="27" cy="42" rx="7" ry="2.2" fill="rgba(0,0,0,0.12)" />
          <Line x1="27" y1="42" x2="21" y2="28" stroke="#94A3B8" strokeWidth={2} />
          <Path d="M20 28 L23 27 L28 41 L25 42 Z" fill="#64748B" />
        </Svg>
      </View>
    );
  }

  return (
    <View style={styles.assetWrap}>
      <Svg width="54" height="54" viewBox="0 0 54 54" style={styles.staticSvg}>
        {/* Towel/sunbed flat on sand */}
        <G transform="translate(6, 35)">
          <Path d="M0 5 L10 0 L20 5 L10 10 Z" fill={isSelected ? '#FFF' : 'rgba(255,255,255,0.75)'} opacity={0.8} />
          <Path d="M2 4 L10 1 L17 5 L9 8 Z" fill={color} opacity={0.7} />
        </G>
        {/* Shadow */}
        <Ellipse cx="27" cy="43" rx="14" ry="4.5" fill="rgba(0,0,0,0.14)" />
        {/* Pole */}
        <Line x1="27" y1="43" x2="27" y2="21" stroke="#E5E7EB" strokeWidth={2.2} />
      </Svg>

      <Animated.View style={[styles.umbrellaCanopy, canopyStyle]}>
        <Svg width="48" height="30" viewBox="0 0 48 30">
          <Path d="M24 2 C10 2 2 16 2 16 L46 16 C46 16 38 2 24 2 Z" fill={color} />
          <Path d="M24 2 C18 2 13 16 13 16 L18 16 C18 16 21 2 24 2 Z" fill="#FFF" opacity={0.3} />
          <Path d="M24 2 C30 2 35 16 35 16 L30 16 C30 16 27 2 24 2 Z" fill="#FFF" opacity={0.3} />
          <Circle cx="24" cy="1.5" r="2" fill="#F59E0B" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// ─────────────────────────────────────────────
// 4. 3D ISOMETRIC LOUNGER
// ─────────────────────────────────────────────

const ThreeDLounger = ({
  color,
  isOccupied,
  isSelected,
}: {
  color: string;
  isOccupied: boolean;
  isSelected: boolean;
}) => {
  const activeColor = isOccupied ? '#94A3B8' : color;
  return (
    <View style={styles.assetWrap}>
      <Svg width="54" height="54" viewBox="0 0 54 54" style={styles.staticSvg}>
        {/* Flat Shadow */}
        <Path d="M12 43 L20 39 L44 43 L36 47 Z" fill="rgba(0,0,0,0.11)" />
        {/* Frame */}
        <Path d="M14 41 L22 37 L40 41 L32 45 Z" fill="#E2E8F0" />
        {/* Mattress Cushion */}
        <Path d="M15 40 L23 36 L39 40 L31 44 Z" fill={activeColor} opacity={0.85} />
        {/* Backrest Head tilt */}
        <Path d="M15 40 L23 36 L20 28 L12 32 Z" fill={activeColor} />
      </Svg>
    </View>
  );
};

// ─────────────────────────────────────────────
// 5. 3D ISOMETRIC TABLE
// ─────────────────────────────────────────────

const ThreeDTable = ({
  color,
  isOccupied,
  isSelected,
}: {
  color: string;
  isOccupied: boolean;
  isSelected: boolean;
}) => {
  const activeColor = isOccupied ? '#94A3B8' : color;
  return (
    <View style={styles.assetWrap}>
      <Svg width="54" height="54" viewBox="0 0 54 54" style={styles.staticSvg}>
        <Ellipse cx="27" cy="42" rx="12" ry="4" fill="rgba(0,0,0,0.11)" />
        <Line x1="20" y1="41" x2="20" y2="30" stroke="#94A3B8" strokeWidth={1.8} />
        <Line x1="34" y1="41" x2="34" y2="30" stroke="#94A3B8" strokeWidth={1.8} />
        <Line x1="27" y1="42" x2="27" y2="32" stroke="#64748B" strokeWidth={1.8} />
        <Ellipse cx="27" cy="30" rx="14" ry="5" fill={activeColor} opacity={0.9} />
      </Svg>
    </View>
  );
};

// ─────────────────────────────────────────────
// 6. ISOMETRIC SPOT ELEMENT
// ─────────────────────────────────────────────

type GridCell = SandSpot & {
  state: 'available' | 'selected' | 'occupied' | 'delivery';
  x: number;
  y: number;
};

const IsometricCell = memo(
  ({
    cell,
    color,
    onPress,
  }: {
    cell: GridCell;
    color: string;
    onPress: (spot: SandSpot) => void;
  }) => {
    const isSelected = cell.state === 'selected';
    const isOccupied = cell.state === 'occupied';

    const handlePress = () => {
      if (!isOccupied) {
        Haptics.selectionAsync();
        onPress(cell);
      }
    };

    return (
      <Pressable
        onPress={handlePress}
        disabled={isOccupied}
        style={[styles.cellContainer, { left: cell.x, top: cell.y }]}
      >
        {/* Pulse selected ring under umbrellas */}
        {isSelected && <SelectedRing />}

        {/* 3D Asset Dispatcher */}
        {cell.asset === 'lounger' ? (
          <ThreeDLounger color={color} isOccupied={isOccupied} isSelected={isSelected} />
        ) : cell.asset === 'table' ? (
          <ThreeDTable color={color} isOccupied={isOccupied} isSelected={isSelected} />
        ) : (
          <ThreeDUmbrella color={color} isOccupied={isOccupied} isSelected={isSelected} />
        )}

        {/* Floating Cell Label */}
        <View
          style={[
            styles.labelTag,
            {
              backgroundColor: isSelected
                ? BEACH_ACCENT
                : isOccupied
                ? '#E2E8F0'
                : 'rgba(255,255,255,0.95)',
            },
          ]}
        >
          <Text
            style={[
              styles.labelText,
              { color: isSelected ? '#FFF' : isOccupied ? '#94A3B8' : '#0F172A' },
            ]}
          >
            {cell.id}
          </Text>
        </View>

        {cell.state === 'delivery' && (
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>Order</Text>
          </View>
        )}
      </Pressable>
    );
  }
);

IsometricCell.displayName = 'IsometricCell';

// ─────────────────────────────────────────────
// 7. ZONE SECTION BOARD
// ─────────────────────────────────────────────

function ZoneSection({
  zoneId,
  spots,
  selectedId,
  occupiedIds,
  highlightDeliveryId,
  onSelect,
}: {
  zoneId: SandZoneId;
  spots: SandSpot[];
  selectedId?: string | null;
  occupiedIds: Set<string>;
  highlightDeliveryId?: string | null;
  onSelect: (spot: SandSpot) => void;
}) {
  const zone = ZONE_CONFIG[zoneId];
  const cols = zoneId === 'vip' ? 2 : zoneId === 'family' ? 4 : 5;
  const rows = Math.ceil(spots.length / cols);

  const cellWidth = 72;
  const cellHeight = 72;
  const topOffset = 80;

  // Calculate centered positions for isometric placement
  const cells: GridCell[] = useMemo(() => {
    // container center
    const boardW = 340;
    const centerX = boardW / 2 - cellWidth / 2;

    return spots.map((s) => {
      const idx = s.index - 1;
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      // Isometric transformations
      const x = (col - row) * (cellWidth * 0.5) + centerX;
      const y = (col + row) * (cellHeight * 0.36) + topOffset;

      let state: 'available' | 'selected' | 'occupied' | 'delivery' = 'available';
      if (highlightDeliveryId === s.id) state = 'delivery';
      else if (occupiedIds.has(s.id) && selectedId !== s.id) state = 'occupied';
      else if (selectedId === s.id) state = 'selected';

      return { ...s, state, x, y };
    });
  }, [spots, occupiedIds, selectedId, highlightDeliveryId, cols, rows]);

  // Height of the isometric sandbox board
  const boardHeight = (rows + cols - 1) * cellHeight * 0.36 + topOffset + 60;

  return (
    <View style={[styles.zoneBlock, { backgroundColor: '#F3E5D8', borderColor: zone.border }]}>
      <View style={styles.zoneHeader}>
        <View style={styles.zoneLabelWrap}>
          <View style={[styles.colorIndicator, { backgroundColor: zone.accent }]} />
          <Text style={[styles.zoneTitle, { color: RIHLA.primary }]}>{zone.label}</Text>
        </View>
        <Text style={styles.zoneCount}>{spots.length} spots</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardHorizontalScroll}
      >
        {/* Sandbox Canvas */}
        <View style={[styles.sandboxCanvas, { height: boardHeight }]}>
          <OceanWaves />
          {cells.map((cell) => (
            <IsometricCell
              key={cell.id}
              cell={cell}
              color={zone.accent}
              onPress={onSelect}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// 8. EXPORTED BEACH SAND GRID
// ─────────────────────────────────────────────

export default function BeachSandGrid({
  selectedZone,
  selectedId,
  occupiedIds = [],
  highlightDeliveryId,
  onSelect,
  showAllZones = false,
}: {
  selectedZone: SandZoneId;
  selectedId?: string | null;
  occupiedIds?: string[];
  highlightDeliveryId?: string | null;
  onSelect: (spot: SandSpot) => void;
  showAllZones?: boolean;
}) {
  const occupied = useMemo(() => new Set(occupiedIds), [occupiedIds]);
  const zones: SandZoneId[] = showAllZones ? ['family', 'vip', 'free'] : [selectedZone];

  return (
    <View style={styles.wrap}>
      {zones.map((z) => (
        <ZoneSection
          key={z}
          zoneId={z}
          spots={makeZoneSpots(z, ZONE_CONFIG[z].spots)}
          selectedId={z === selectedZone ? selectedId : null}
          occupiedIds={occupied}
          highlightDeliveryId={highlightDeliveryId}
          onSelect={onSelect}
        />
      ))}
      <View style={styles.legend}>
        <LegendDot label="Available Spot" color={RIHLA.primary} icon />
        <LegendDot label="Selected Spot" color={BEACH_ACCENT} pulse />
        <LegendDot label="Occupied (Folded)" color="#94A3B8" occupied />
      </View>
    </View>
  );
}

function LegendDot({
  label,
  color,
  icon = false,
  pulse = false,
  occupied = false,
}: {
  label: string;
  color: string;
  icon?: boolean;
  pulse?: boolean;
  occupied?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { borderColor: color }]}>
        {occupied ? (
          <View style={styles.legendClosed} />
        ) : pulse ? (
          <View style={[styles.legendActive, { backgroundColor: color }]} />
        ) : (
          <View style={[styles.legendOpen, { backgroundColor: color }]} />
        )}
      </View>
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  zoneBlock: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#78350F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 53, 15, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  zoneLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorIndicator: { width: 10, height: 10, borderRadius: 5 },
  zoneTitle: { fontSize: 14, fontFamily: 'mon-b' },
  zoneCount: { fontSize: 11, fontFamily: 'mon-sb', color: '#78350F', opacity: 0.75 },
  boardHorizontalScroll: { minWidth: '100%', justifyContent: 'center' },
  sandboxCanvas: {
    width: 350,
    position: 'relative',
    backgroundColor: '#F5E6D3', // sand color
  },
  oceanContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    overflow: 'hidden',
  },
  waveRow: {
    position: 'absolute',
    left: -100,
    right: 0,
    height: 45,
  },
  shoreFoam: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#FFF',
    opacity: 0.3,
  },

  // Cell absolutely positioned in isometric layout
  cellContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  assetWrap: {
    width: 54,
    height: 54,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staticSvg: {
    position: 'absolute',
  },
  threeDSvg: {
    position: 'absolute',
  },
  umbrellaCanopy: {
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    bottom: 0,
    width: 44,
    height: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#00F3FF',
    backgroundColor: 'rgba(0, 243, 255, 0.08)',
  },
  labelTag: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  labelText: {
    fontSize: 9,
    fontFamily: 'mon-b',
  },
  deliveryBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  deliveryText: {
    color: '#FFF',
    fontSize: 8,
    fontFamily: 'mon-b',
  },

  // Legend Styling
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingTop: 6,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendLabel: { fontSize: 11, fontFamily: 'mon-sb', color: '#64748B' },
  legendOpen: { width: 10, height: 10, borderRadius: 3 },
  legendActive: { width: 10, height: 10, borderRadius: 3, shadowColor: '#00F3FF', shadowOpacity: 0.5 },
  legendClosed: { width: 2, height: 10, backgroundColor: '#94A3B8', transform: [{ rotate: '45deg' }] },
});
