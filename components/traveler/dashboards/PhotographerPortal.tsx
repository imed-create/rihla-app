import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function PhotographerPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();
  const { bookings } = useApp();

  // Find completed photography sessions for Locker
  const deliveredShoots = useMemo(() => {
    return bookings.filter(
      (b) => b.type === 'photographer' && b.status === 'completed'
    );
  }, [bookings]);

  const photographers = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'photographer' && l.is_active);
  }, []);

  const handleDownload = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Download Started', `Downloading high-resolution photo archives for ${title}...`);
  };

  const portfolios = [
    { key: 'desert', label: 'Sahara Sand Dunes', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?q=80&w=200&auto=format&fit=crop' },
    { key: 'sunset', label: 'Tipaza Sunsets', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=200&auto=format&fit=crop' },
    { key: 'drone', label: 'Aerial Coastlines', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=200&auto=format&fit=crop' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── DIGITAL PHOTOS LOCKER ── */}
      {deliveredShoots.length > 0 && (
        <View style={styles.lockerBox}>
          <Text style={styles.lockerTitle}>📥 Digital Photo Locker</Text>
          {deliveredShoots.map((shoot) => (
            <View key={shoot.id} style={[styles.lockerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="cloud-download-outline" size={26} color="#FF499E" />
              <View style={styles.lockerDetails}>
                <Text style={[styles.lockerName, { color: colors.text }]}>{shoot.title}</Text>
                <Text style={[styles.lockerFiles, { color: colors.muted }]}>{shoot.details?.deliverables || '20 edited high-res photos'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.downloadBtn}
                onPress={() => handleDownload(shoot.title)}
              >
                <Text style={styles.downloadText}>Download</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ── IMMERSIVE HERO CARD ── */}
      <View style={[styles.heroCard, { backgroundColor: '#FF499E' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Professional Photographers & Videographers</Text>
          <Text style={styles.heroSubtitle}>Capture memories in Algeria: drone shots, desert sessions, and coastlines.</Text>
        </View>
        <Ionicons name="camera" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── PORTFOLIOS GALLERY ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20, marginBottom: 12 }]}>Explore Portfolios</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioScroll}>
          {portfolios.map((item) => (
            <View key={item.key} style={styles.portfolioCard}>
              <Image source={{ uri: item.url }} style={styles.portfolioImage} />
              <View style={styles.portfolioOverlay}>
                <Text style={styles.portfolioLabel}>{item.label}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── LISTINGS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20 }]}>Available Photographers</Text>
          <TouchableOpacity onPress={() => onSearchAll()}>
            <Text style={[styles.seeAll, { color: '#FF499E' }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {photographers.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onSearchAll()}
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
                    <Ionicons name="color-palette-outline" size={12} color={colors.muted} /> {item.metadata.kind === 'photographer' ? item.metadata.style.join(', ') : 'Portraits'}
                  </Text>
                  <Text style={styles.cardPrice}>
                    From {item.price_dzd.toLocaleString()} DZD
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
  lockerBox: {
    marginHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  lockerTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  lockerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  lockerDetails: {
    flex: 1,
    gap: 2,
  },
  lockerName: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  lockerFiles: {
    fontSize: 10,
    fontFamily: 'mon',
  },
  downloadBtn: {
    backgroundColor: '#FF499E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'mon-sb',
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
  section: {
    marginTop: 20,
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
  },
  portfolioScroll: {
    paddingLeft: 20,
    paddingRight: 12,
    gap: 10,
  },
  portfolioCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
  },
  portfolioOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 10,
    justifyContent: 'flex-end',
  },
  portfolioLabel: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  list: {
    paddingHorizontal: 20,
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
    color: '#FF499E',
  },
});
