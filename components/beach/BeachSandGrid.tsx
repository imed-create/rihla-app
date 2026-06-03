import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ListRenderItem } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  BEACH_ACCENT,
  SandSpot,
  SandZoneId,
  SPOT_STATE_COLORS,
  ZONE_CONFIG,
  makeZoneSpots,
} from '@/constants/beachLayout';
import { BeachAssetIcon } from './BeachSvgIcons';

type CellState = 'available' | 'selected' | 'occupied' | 'delivery';

type GridCell = SandSpot & { state: CellState };

const SandCell = memo(
  ({
    cell,
    onPress,
  }: {
    cell: GridCell;
    onPress: (spot: SandSpot) => void;
  }) => {
    const palette = SPOT_STATE_COLORS[cell.state === 'delivery' ? 'deliveryPulse' : cell.state];
    const disabled = cell.state === 'occupied';

    return (
      <Pressable
        onPress={() => {
          if (!disabled) {
            Haptics.selectionAsync();
            onPress(cell);
          }
        }}
        disabled={disabled}
        style={[
          styles.cell,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderWidth: cell.state === 'selected' || cell.state === 'delivery' ? 2 : 1,
          },
        ]}
      >
        <BeachAssetIcon kind={cell.asset} size={26} color={palette.icon} />
        <Text style={[styles.cellId, { color: cell.state === 'occupied' ? '#94A3B8' : '#0F172A' }]}>
          {cell.id}
        </Text>
        {cell.state === 'occupied' && <Text style={styles.taken}>Taken</Text>}
        {cell.state === 'delivery' && <Text style={styles.delivery}>Delivery</Text>}
      </Pressable>
    );
  }
);

SandCell.displayName = 'SandCell';

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
  const cells: GridCell[] = useMemo(
    () =>
      spots.map((s) => {
        let state: CellState = 'available';
        if (highlightDeliveryId === s.id) state = 'delivery';
        else if (occupiedIds.has(s.id) && selectedId !== s.id) state = 'occupied';
        else if (selectedId === s.id) state = 'selected';
        return { ...s, state };
      }),
    [spots, occupiedIds, selectedId, highlightDeliveryId]
  );

  const renderItem: ListRenderItem<GridCell> = useCallback(
    ({ item }) => <SandCell cell={item} onPress={onSelect} />,
    [onSelect]
  );

  const keyExtractor = useCallback((item: GridCell) => item.id, []);

  return (
    <View style={[styles.zoneBlock, { backgroundColor: zone.tint, borderColor: zone.border }]}>
      <View style={styles.zoneHeader}>
        <Text style={[styles.zoneTitle, { color: zone.accent }]}>{zone.label}</Text>
        <Text style={styles.zoneCount}>{spots.length} plots</Text>
      </View>
      <FlatList
        data={cells}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridInner}
      />
    </View>
  );
}

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
        <LegendDot label="Available" color={SPOT_STATE_COLORS.available.border} />
        <LegendDot label="Selected" color={BEACH_ACCENT} />
        <LegendDot label="Occupied" color={SPOT_STATE_COLORS.occupied.border} />
      </View>
    </View>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { borderColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  zoneBlock: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneTitle: { fontSize: 13, fontFamily: 'mon-b' },
  zoneCount: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },
  gridInner: { gap: 8 },
  row: { gap: 8, justifyContent: 'flex-start' },
  cell: {
    flex: 1,
    minWidth: '22%',
    maxWidth: '24%',
    aspectRatio: 0.85,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  cellId: { fontSize: 10, fontFamily: 'mon-sb', letterSpacing: 0.3 },
  taken: { fontSize: 8, fontFamily: 'mon-sb', color: '#94A3B8' },
  delivery: { fontSize: 8, fontFamily: 'mon-b', color: '#EA580C' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    paddingTop: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  legendLabel: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },
});
