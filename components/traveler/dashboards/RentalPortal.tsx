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

export default function RentalPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();
  const [stayPeriod, setStayPeriod] = useState<'daily' | 'monthly'>('daily');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const rentals = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'rental' && l.is_active);
  }, []);

  const displayedRentals = useMemo(() => {
    if (!selectedType) return rentals;
    return rentals.filter((r) => r.metadata.kind === 'rental' && r.metadata.property_type === selectedType);
  }, [rentals, selectedType]);

  const handleRentalPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/services/rental/${id}` as any);
  };

  const propertyTypes = [
    { key: 'villa', label: 'Villas & Houses', emoji: '🏡' },
    { key: 'apartment', label: 'Apartments', emoji: '🏢' },
    { key: 'riad', label: 'Traditional Dars', emoji: '🕌' },
    { key: 'studio', label: 'Studios & Rooms', emoji: '🛏️' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── IMMERSIVE HERO CARD ── */}
      <View style={[styles.heroCard, { backgroundColor: '#6C63FF' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Private Homes & Vacation Rentals</Text>
          <Text style={styles.heroSubtitle}>Book seaside villas, city apartments, and cozy cabins.</Text>
        </View>
        <Ionicons name="home" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── VACATION VS MONTHLY TOGGLE ── */}
      <View style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable 
          style={[styles.toggleBtn, stayPeriod === 'daily' && styles.toggleBtnActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStayPeriod('daily');
          }}
        >
          <Text style={[styles.toggleLabel, stayPeriod === 'daily' ? styles.toggleLabelActive : { color: colors.text }]}>Short-Term Vacation Stays</Text>
        </Pressable>
        <Pressable 
          style={[styles.toggleBtn, stayPeriod === 'monthly' && styles.toggleBtnActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStayPeriod('monthly');
          }}
        >
          <Text style={[styles.toggleLabel, stayPeriod === 'monthly' ? styles.toggleLabelActive : { color: colors.text }]}>Monthly Rentals</Text>
        </Pressable>
      </View>

      {/* ── PROPERTY TYPE CHIPS ── */}
      <View style={styles.typesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
          <TouchableOpacity 
            style={[styles.typeChip, !selectedType && styles.typeChipActive, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setSelectedType(null)}
          >
            <Text style={[styles.typeText, !selectedType ? styles.typeTextActive : { color: colors.text }]}>All Properties</Text>
          </TouchableOpacity>
          {propertyTypes.map((type) => (
            <TouchableOpacity 
              key={type.key} 
              style={[styles.typeChip, selectedType === type.key && styles.typeChipActive, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(type.key);
              }}
            >
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
              <Text style={[styles.typeText, selectedType === type.key ? styles.typeTextActive : { color: colors.text }]}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── FEATURED LISTINGS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Rental Listings</Text>
          <TouchableOpacity onPress={() => onSearchAll()}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {displayedRentals.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleRentalPress(item.id)}
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
                <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardLoc, { color: colors.muted }]}>
                    <Ionicons name="location-outline" size={12} color={colors.muted} /> {item.wilaya} · {item.region}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {item.price_dzd.toLocaleString()} DZD <Text style={styles.priceSub}>/ {stayPeriod === 'daily' ? 'night' : 'month'}</Text>
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
  toggleCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
    borderWidth: 1,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#6C63FF',
  },
  toggleLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  toggleLabelActive: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  typesContainer: {
    marginTop: 14,
  },
  typeScroll: {
    paddingLeft: 20,
    paddingRight: 12,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeChipActive: {
    backgroundColor: '#6C63FF15',
    borderColor: '#6C63FF',
  },
  typeEmoji: {
    fontSize: 14,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  typeTextActive: {
    color: '#6C63FF',
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
    color: '#6C63FF',
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
    lineHeight: 15,
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
    color: '#6C63FF',
  },
  priceSub: {
    fontSize: 10,
    fontFamily: 'mon',
    color: '#666',
  },
});
