import React, { useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DESTINATION_TYPES, DestinationType } from '@/constants/destinations';
import { categoryColors } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';

export default function CategoryBar() {
  const { activeCategory, setActiveCategory } = useApp();
  const scrollRef = useRef<ScrollView>(null);

  const selectCategory = (type: DestinationType) => {
    setActiveCategory(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {DESTINATION_TYPES.map((item) => {
          const isActive = activeCategory === item.id;
          const activeColor = categoryColors[item.id];

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => selectCategory(item.id)}
              style={[
                styles.chip,
                isActive 
                  ? { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' } 
                  : { backgroundColor: '#FFFFFF', borderColor: '#e2e8f0' }
              ]}
            >
              <Text style={[styles.emoji, isActive && { color: activeColor }]}>{item.emoji}</Text>
              <Text style={[
                styles.label, 
                isActive ? styles.labelTextActive : styles.labelTextInactive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    height: 52,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
  },
  emoji: {
    fontSize: 15,
  },
  label: {
    fontSize: 13,
    fontFamily: 'mon-sb',
  },
  labelTextActive: {
    color: '#FFFFFF',
  },
  labelTextInactive: {
    color: '#888888',
  },
});
