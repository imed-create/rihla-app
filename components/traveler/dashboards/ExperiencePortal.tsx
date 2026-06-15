import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function ExperiencePortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();

  // Packing list state
  const [packingList, setPackingList] = useState([
    { id: '1', item: 'Valid Passport / ID Card', checked: true },
    { id: '2', item: 'Desert Hiking Boots', checked: false },
    { id: '3', item: 'Sun Protection & Sunglasses', checked: false },
    { id: '4', item: 'Portable Power Bank', checked: false },
    { id: '5', item: 'Windbreaker Jacket', checked: false },
  ]);

  const experiences = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'experience' && l.is_active);
  }, []);

  const handleTogglePack = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPackingList(prev =>
      prev.map(p => (p.id === id ? { ...p, checked: !p.checked } : p))
    );
  };

  const handleExpeditionPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/services/experience/${id}` as any);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── IMMERSIVE EXPEDITIONS HERO ── */}
      <View style={[styles.heroCard, { backgroundColor: '#f4a261' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Multi-Day expeditions & Desert Treks</Text>
          <Text style={styles.heroSubtitle}>Explore Algeria's deepest landscapes in curated small group expeditions.</Text>
        </View>
        <Ionicons name="sparkles" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── INTERACTIVE PACKING CHECKLIST ── */}
      <View style={[styles.checklistCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.checklistTitle, { color: colors.text }]}>🎒 Sahara Expedition Packing List</Text>
        <Text style={[styles.checklistSubtitle, { color: colors.muted }]}>Make sure you pack these essentials before setting off.</Text>
        
        <View style={styles.checklist}>
          {packingList.map((item) => (
            <Pressable 
              key={item.id}
              style={styles.itemRow}
              onPress={() => handleTogglePack(item.id)}
            >
              <Ionicons 
                name={item.checked ? 'checkbox' : 'square-outline'} 
                size={18} 
                color={item.checked ? '#f4a261' : colors.muted} 
              />
              <Text style={[styles.itemLabel, { color: colors.text }, item.checked && [styles.itemLabelChecked, { color: colors.muted }]]}>
                {item.item}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── EXPEDITIONS LIST ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Curated Expeditions</Text>
          <TouchableOpacity onPress={() => onSearchAll()}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {experiences.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleExpeditionPress(item.id)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: item.cover_image_url }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color="#FFD166" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={1}>{item.description}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardLoc, { color: colors.muted }]}>
                    <Ionicons name="calendar-outline" size={12} color={colors.muted} /> {item.metadata.kind === 'experience' ? `${item.metadata.duration_days} days` : 'Multi-day'}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {item.price_dzd.toLocaleString()} DZD
                  </Text>
                </View>
              </View>
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
  heroCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    height: 140,
    justifyContent: 'center',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  heroContent: {
    maxWidth: '80%',
    zIndex: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'mon-b',
    lineHeight: 26,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'mon',
    marginTop: 6,
    lineHeight: 16,
  },
  checklistCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  checklistTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  checklistSubtitle: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  checklist: {
    gap: 8,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  itemLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  itemLabelChecked: {
    textDecorationLine: 'line-through',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#f4a261',
  },
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardInfo: {
    padding: 14,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  cardDesc: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  cardLoc: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  cardPrice: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#f4a261',
  },
});
