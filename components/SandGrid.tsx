import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SandZoneId = 'family' | 'vip' | 'free';

export interface SandSpot {
  id: string; // e.g. F-01
  zone: SandZoneId;
  index: number; // 1-based inside zone
}

export function makeZoneSpots(zone: SandZoneId, count: number) {
  const prefix = zone === 'family' ? 'F' : zone === 'vip' ? 'V' : 'G';
  const out: SandSpot[] = [];
  for (let i = 1; i <= count; i++) {
    out.push({
      id: `${prefix}-${String(i).padStart(2, '0')}`,
      zone,
      index: i,
    });
  }
  return out;
}

export default function SandGrid({
  spots,
  selectedId,
  reservedIds,
  onSelect,
  accentColor,
}: {
  spots: SandSpot[];
  selectedId?: string | null;
  reservedIds?: string[];
  onSelect: (spot: SandSpot) => void;
  accentColor: string;
}) {
  const reserved = useMemo(() => new Set(reservedIds ?? []), [reservedIds]);

  return (
    <View style={styles.grid}>
      {spots.map((s) => {
        const isReserved = reserved.has(s.id);
        const isSelected = selectedId === s.id;
        return (
          <Pressable
            key={s.id}
            onPress={() => !isReserved && onSelect(s)}
            style={[
              styles.cell,
              isReserved && styles.cellReserved,
              isSelected && { borderColor: accentColor, borderWidth: 2, backgroundColor: accentColor + '10' },
            ]}
            disabled={isReserved}
          >
            <View style={styles.cellTop}>
              <Ionicons
                name="umbrella-outline"
                size={14}
                color={isReserved ? '#CBD5E1' : isSelected ? accentColor : '#64748B'}
              />
              {isReserved && (
                <View style={styles.lockPill}>
                  <Ionicons name="lock-closed-outline" size={10} color="#94A3B8" />
                  <Text style={styles.lockText}>Taken</Text>
                </View>
              )}
            </View>
            <Text style={[styles.cellId, isReserved && { color: '#94A3B8' }]}>{s.id}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '22%',
    minWidth: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 6,
  },
  cellReserved: {
    backgroundColor: '#fafbfc',
    borderColor: '#E2E8F0',
  },
  cellTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lockText: { fontSize: 10, fontFamily: 'mon-sb', color: '#94A3B8' },
  cellId: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#0F172A' },
});

