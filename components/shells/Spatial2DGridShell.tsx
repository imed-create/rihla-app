/**
 * RIHLA — Shell 2: Spatial 2D Grid
 * Live 2D grid matrix for spot/table selection.
 * Categories: beach, restaurant
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Listing, BeachMetadata, RestaurantMetadata } from '@/types/service';

type Props = { listing: Listing };
type SpotStatus = 'available' | 'occupied' | 'selected' | 'reserved';

export default function Spatial2DGridShell({ listing }: Props) {
  const { colors } = useTheme();
  const m = listing.metadata;
  const isBeach = m.kind === 'beach';

  const rows = isBeach ? (m as BeachMetadata).total_rows : 5;
  const cols = isBeach ? (m as BeachMetadata).total_cols : 6;
  const zone = isBeach ? (m as BeachMetadata).zone : 'family';
  const holdMin = isBeach ? (m as BeachMetadata).hold_duration_minutes : 0;

  const [selected, setSelected] = useState<string | null>(null);

  const grid = useMemo(() => {
    const g: { id: string; row: number; col: number; status: SpotStatus }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id = `${r}-${c}`;
        const hash = (r * cols + c + listing.id.charCodeAt(listing.id.length - 1)) % 10;
        let status: SpotStatus = 'available';
        if (hash < 2) status = 'occupied';
        else if (hash < 3) status = 'reserved';
        g.push({ id, row: r, col: c, status });
      }
    }
    return g;
  }, [rows, cols, listing.id]);

  const handlePress = (spot: typeof grid[0]) => {
    if (spot.status === 'occupied' || spot.status === 'reserved') return;
    setSelected(spot.id === selected ? null : spot.id);
  };

  const pricePerSpot = isBeach ? (m as BeachMetadata).price_per_spot_dzd : listing.price_dzd;

  return (
    <View style={styles.container}>
      {/* ZONE INFO */}
      <View style={styles.zoneBar}>
        <View style={[styles.zoneChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="flag-outline" size={14} color={RIHLA.accent} />
          <Text style={[styles.zoneText, { color: colors.text }]}>{isBeach ? `${zone} zone` : 'Dining Area'}</Text>
        </View>
        {holdMin > 0 && (
          <View style={[styles.holdChip, { backgroundColor: colors.card, borderColor: RIHLA.busy + '30' }]}>
            <Ionicons name="timer-outline" size={14} color={RIHLA.busy} />
            <Text style={styles.holdText}>{holdMin}min hold</Text>
          </View>
        )}
      </View>

      {/* 2D GRID */}
      <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.gridInner}>
          {Array.from({ length: rows }).map((_, r) => (
            <View key={r} style={styles.gridRow}>
              <Text style={[styles.rowLabel, { color: colors.muted }]}>{String.fromCharCode(65 + r)}</Text>
              {grid.filter((s) => s.row === r).map((spot) => {
                const isSelected = spot.id === selected;
                const isOccupied = spot.status === 'occupied' || spot.status === 'reserved';
                return (
                  <Pressable
                    key={spot.id}
                    style={[
                      styles.gridCell,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      isOccupied && { opacity: 0.4, borderColor: colors.border },
                      isSelected && { backgroundColor: RIHLA.accent + '20', borderColor: RIHLA.accent },
                    ]}
                    onPress={() => handlePress(spot)}
                    disabled={isOccupied}
                  >
                    <Text style={[
                      styles.cellText,
                      { color: colors.text },
                      isOccupied && { color: colors.muted },
                      isSelected && { color: RIHLA.accent },
                    ]}>
                      {spot.col + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        <View style={styles.colLabels}>
          <View style={{ width: 24 }} />
          {Array.from({ length: cols }).map((_, c) => (
            <Text key={c} style={[styles.colLabel, { color: colors.muted }]}>{c + 1}</Text>
          ))}
        </View>
      </View>

      {/* LEGEND */}
      <View style={styles.legend}>
        <LegendItem color={RIHLA.online} label="Available" border />
        <LegendItem color={colors.muted} label="Occupied" />
        <LegendItem color={RIHLA.busy} label="Reserved" border />
        <LegendItem color={RIHLA.accent} label="Selected" border />
      </View>

      {/* SELECTION */}
      {selected && (
        <View style={[styles.selectionCard, { backgroundColor: colors.card, borderColor: RIHLA.accent + '30' }]}>
          <View style={styles.selectionInfo}>
            <Ionicons name="checkmark-circle" size={18} color={RIHLA.online} />
            <Text style={[styles.selectionText, { color: colors.text }]}>
              Spot {String.fromCharCode(65 + parseInt(selected.split('-')[0]))}{parseInt(selected.split('-')[1]) + 1} selected
            </Text>
          </View>
          <Text style={styles.selectionPrice}>{pricePerSpot.toLocaleString()} DA</Text>
        </View>
      )}
    </View>
  );
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }, border && { borderWidth: 1, borderColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  zoneBar: { flexDirection: 'row', gap: 10 },
  zoneChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  zoneText: { fontSize: 13, fontFamily: 'mon-sb' },
  holdChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  holdText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.busy },

  gridCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  gridInner: { gap: 6 },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowLabel: { width: 24, fontSize: 11, fontFamily: 'mon-b', textAlign: 'center' },
  gridCell: { flex: 1, aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  cellText: { fontSize: 10, fontFamily: 'mon-b' },

  colLabels: { flexDirection: 'row', gap: 6, marginTop: 6 },
  colLabel: { flex: 1, fontSize: 10, fontFamily: 'mon-b', textAlign: 'center' },

  legend: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { fontSize: 11, fontFamily: 'mon', color: '#888' },

  selectionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14 },
  selectionInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectionText: { fontSize: 14, fontFamily: 'mon-sb' },
  selectionPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.accent },
});
