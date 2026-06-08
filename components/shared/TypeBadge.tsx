import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DestinationType, DESTINATION_TYPES } from '@/constants/destinations';
import { categoryColors } from '@/constants/theme';

interface Props {
  type: DestinationType;
}

export default function TypeBadge({ type }: Props) {
  const typeDef = DESTINATION_TYPES.find((t) => t.id === type);
  const color = categoryColors[type] || '#1a1a1a';

  return (
    <View style={styles.badge}>
      <Text style={styles.emoji}>{typeDef?.emoji || 'pin'}</Text>
      <Text style={[styles.text, { color }]}>{typeDef?.label || type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    gap: 5,
    alignSelf: 'flex-start',
  },
  emoji: { fontSize: 13 },
  text: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
