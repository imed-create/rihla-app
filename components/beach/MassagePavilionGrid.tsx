import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BEACH_ACCENT, SLOT_AVAILABLE, SLOT_OCCUPIED, SLOT_SELECTED } from '@/constants/beachLayout';
import { MiniCabana } from './BeachSvgIcons';

const CABANAS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const TIME_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

const CabanaCell = memo(
  ({
    id,
    selected,
    onPress,
  }: {
    id: string;
    selected: boolean;
    onPress: (id: string) => void;
  }) => (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress(id);
      }}
      style={[
        styles.cabana,
        {
          backgroundColor: selected ? '#F5F3FF' : '#FFFFFF',
          borderColor: selected ? '#845EC2' : '#E2E8F0',
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <MiniCabana size={28} color={selected ? '#845EC2' : '#94A3B8'} />
      <Text style={[styles.cabanaText, { color: selected ? '#845EC2' : '#0F172A' }]}>{id}</Text>
    </Pressable>
  )
);

CabanaCell.displayName = 'CabanaCell';

const TimelineSlot = memo(
  ({
    time,
    cabanaId,
    occupied,
    selected,
    onPress,
  }: {
    time: string;
    cabanaId: string;
    occupied: boolean;
    selected: boolean;
    onPress: (cabana: string, time: string) => void;
  }) => {
    const palette = occupied ? SLOT_OCCUPIED : selected ? SLOT_SELECTED : SLOT_AVAILABLE;
    return (
      <Pressable
        disabled={occupied}
        onPress={() => {
          Haptics.selectionAsync();
          onPress(cabanaId, time);
        }}
        style={[styles.timeCell, { backgroundColor: palette.bg, borderColor: palette.border }]}
      >
        <Text style={[styles.timeText, { color: palette.label }]}>{time}</Text>
      </Pressable>
    );
  }
);

TimelineSlot.displayName = 'TimelineSlot';

export default function MassagePavilionGrid({
  selectedCabana,
  selectedSlot,
  occupiedSlots,
  onSelectCabana,
  onSelectTime,
}: {
  selectedCabana: string;
  selectedSlot: string | null;
  occupiedSlots: string[];
  onSelectCabana: (id: string) => void;
  onSelectTime: (cabana: string, time: string) => void;
}) {
  const occupied = useMemo(() => new Set(occupiedSlots), [occupiedSlots]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionLabel}>PAVILION LAYOUT</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cabanaRow}>
        {CABANAS.map((c) => (
          <CabanaCell key={c} id={c} selected={selectedCabana === c} onPress={onSelectCabana} />
        ))}
      </ScrollView>

      <Text style={styles.sectionLabel}>TIME MATRIX · {selectedCabana}</Text>
      <View style={styles.timelineCard}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Today</Text>
          <Text style={styles.timelineSub}>Premium cabana slots</Text>
        </View>
        <View style={styles.matrix}>
          {TIME_SLOTS.map((time) => {
            const key = `${selectedCabana}-${time}`;
            const isOccupied = occupied.has(key);
            const isSelected = selectedSlot === time;
            return (
              <TimelineSlot
                key={key}
                time={time}
                cabanaId={selectedCabana}
                occupied={isOccupied}
                selected={isSelected}
                onPress={onSelectTime}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    letterSpacing: 1,
    color: '#64748B',
  },
  cabanaRow: { gap: 10, paddingVertical: 4 },
  cabana: {
    width: 72,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 8,
  },
  cabanaText: { fontSize: 12, fontFamily: 'mon-b' },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  timelineHeader: { gap: 2 },
  timelineTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  timelineSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  matrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCell: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  timeText: { fontSize: 13, fontFamily: 'mon-sb' },
});
