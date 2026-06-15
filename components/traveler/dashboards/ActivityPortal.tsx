import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function ActivityPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const activities = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'activity' && l.is_active);
  }, []);

  const displayedActivities = useMemo(() => {
    if (!difficulty) return activities;
    return activities.filter((a) => a.metadata.kind === 'activity' && a.metadata.difficulty === difficulty);
  }, [activities, difficulty]);

  const handleActivityPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Dynamic navigation based on category detail route
    router.push(`/marketplace/activity` as any); // fallback to parent list for activities
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── WEATHER WARNING WIDGET ── */}
      <View style={styles.warningBox}>
        <Ionicons name="warning-outline" size={20} color="#E76F51" />
        <View style={styles.warningDetails}>
          <Text style={styles.warningTitle}>Mountain Flight Caution</Text>
          <Text style={styles.warningText}>Paragliding in Djurdjura subject to wind speeds. Current: 14 km/h (Moderate Winds).</Text>
        </View>
      </View>

      {/* ── IMMERSIVE HERO CARD ── */}
      <View style={[styles.heroCard, { backgroundColor: '#E76F51' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Adventures & Outdoor Activities</Text>
          <Text style={styles.heroSubtitle}>Quad biking in the Sahara, hiking, diving, and paragliding.</Text>
        </View>
        <Ionicons name="bicycle" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── DIFFICULTY CHIPS ── */}
      <View style={styles.difficultyContainer}>
        <Text style={[styles.diffTitle, { color: colors.text }]}>Difficulty Level</Text>
        <View style={styles.diffRow}>
          {[
            { key: null, label: 'All Levels', color: colors.muted },
            { key: 'easy', label: 'Easy 🟢', color: '#10B981' },
            { key: 'moderate', label: 'Moderate 🟡', color: '#F59E0B' },
            { key: 'challenging', label: 'Challenging 🔴', color: '#EF4444' },
          ].map((item) => (
            <TouchableOpacity 
              key={item.key ?? 'all'} 
              style={[styles.diffChip, difficulty === item.key && { borderColor: item.color, backgroundColor: item.color + '10' }, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDifficulty(item.key);
              }}
            >
              <Text style={[styles.diffLabel, { color: difficulty === item.key ? item.color : colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── ACTIVITY LIST ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Activities</Text>
          <TouchableOpacity onPress={() => onSearchAll()}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {displayedActivities.length > 0 ? (
            displayedActivities.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleActivityPress(item.id)}
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
                      <Ionicons name="location-outline" size={12} color={colors.muted} /> {item.wilaya}
                    </Text>
                    <Text style={styles.cardPrice}>
                      {item.price_dzd.toLocaleString()} DZD
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>No activities matching difficulty.</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── BROWSE ALL BUTTON ── */}
      <TouchableOpacity 
        style={[styles.browseAllBtn, { borderColor: '#E76F51' }]}
        onPress={() => onSearchAll()}
      >
        <Text style={[styles.browseAllText, { color: '#E76F51' }]}>Browse All Outdoor Activities</Text>
        <Ionicons name="arrow-forward" size={16} color="#E76F51" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  warningBox: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E76F51',
    backgroundColor: '#E76F5112',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningDetails: {
    flex: 1,
    gap: 2,
  },
  warningTitle: {
    fontSize: 13,
    fontFamily: 'mon-b',
    color: '#E76F51',
  },
  warningText: {
    fontSize: 11,
    fontFamily: 'mon',
    color: '#666',
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
  difficultyContainer: {
    marginHorizontal: 20,
    marginTop: 18,
    gap: 8,
  },
  diffTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  diffRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diffChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  diffLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
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
    color: '#E76F51',
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
    color: '#E76F51',
  },
  empty: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'mon',
  },
  browseAllBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  browseAllText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
  },
});
