import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SLOT_AVAILABLE, SLOT_OCCUPIED, SLOT_SELECTED, BEACH_ACCENT } from '@/constants/beachLayout';
import { BeachAssetIcon, MiniJetSki, MiniPedalo, MiniVolleyballCourt } from './BeachSvgIcons';

export type VisualSlot = {
  id: string;
  label: string;
  sublabel?: string;
};

const SlotCell = memo(
  ({
    slot,
    state,
    onPress,
    renderIcon,
  }: {
    slot: VisualSlot;
    state: 'available' | 'occupied' | 'selected';
    onPress: (id: string) => void;
    renderIcon?: () => React.ReactNode;
  }) => {
    const palette =
      state === 'selected' ? SLOT_SELECTED : state === 'occupied' ? SLOT_OCCUPIED : SLOT_AVAILABLE;
    const disabled = state === 'occupied';

    return (
      <Pressable
        onPress={() => {
          if (!disabled) {
            Haptics.selectionAsync();
            onPress(slot.id);
          }
        }}
        disabled={disabled}
        style={[styles.slot, { backgroundColor: palette.bg, borderColor: palette.border }]}
      >
        {renderIcon?.()}
        <Text style={[styles.slotLabel, { color: palette.label }]}>{slot.label}</Text>
        {slot.sublabel ? (
          <Text style={[styles.slotSub, { color: palette.label }]}>{slot.sublabel}</Text>
        ) : null}
        <Text style={[styles.slotState, { color: palette.label }]}>
          {state === 'occupied' ? 'Rented' : state === 'selected' ? 'Yours' : 'Open'}
        </Text>
      </Pressable>
    );
  }
);

SlotCell.displayName = 'SlotCell';

export default function VisualSlotGrid({
  title,
  subtitle,
  layout = 'dock',
  slots,
  selectedId,
  occupiedIds,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  layout?: 'dock' | 'court' | 'gear';
  slots: VisualSlot[];
  selectedId: string | null;
  occupiedIds: string[];
  onSelect: (id: string) => void;
}) {
  const occupied = new Set(occupiedIds);

  const renderIcon = useCallback(() => {
    if (layout === 'court') return <MiniVolleyballCourt size={40} color="#20C997" />;
    if (layout === 'dock') return <MiniJetSki size={36} color="#0a2540" />;
    return <BeachAssetIcon kind="umbrella" size={28} color={BEACH_ACCENT} />;
  }, [layout]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {slots.map((slot) => {
          const state = occupied.has(slot.id)
            ? 'occupied'
            : selectedId === slot.id
              ? 'selected'
              : 'available';
          return (
            <SlotCell key={slot.id} slot={slot} state={state} onPress={onSelect} renderIcon={renderIcon} />
          );
        })}
      </ScrollView>
      <View style={styles.dockRow}>
        {layout === 'dock' && (
          <>
            <MiniJetSki size={24} color="#0a2540" />
            <MiniPedalo size={24} color="#48CAE4" />
            <Text style={styles.dockHint}>Tap an open dock slot — green available, red rented</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  title: { fontSize: 11, fontFamily: 'mon-sb', letterSpacing: 1, color: '#64748B' },
  sub: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', lineHeight: 16 },
  scroll: { gap: 10, paddingVertical: 4 },
  slot: {
    width: 100,
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginRight: 10,
  },
  slotLabel: { fontSize: 13, fontFamily: 'mon-b' },
  slotSub: { fontSize: 10, fontFamily: 'mon', textAlign: 'center' },
  slotState: { fontSize: 10, fontFamily: 'mon-sb', marginTop: 4 },
  dockRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  dockHint: { flex: 1, fontSize: 11, fontFamily: 'mon', color: '#64748B' },
});
