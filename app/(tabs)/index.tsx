import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryBar from '@/components/CategoryBar';
import DestinationCard from '@/components/DestinationCard';
import SkeletonCard from '@/components/SkeletonCard';
import { categoryColors, SAHEL } from '@/constants/Colors';
import { getDestinationsByType } from '@/constants/destinations';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { useTranslation } from '@/context/I18nContext';

export default function DiscoverScreen() {
  const { activeCategory, setActiveCategory } = useApp();
  const colors = useColors();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setActiveCategory('beach');
  }, [setActiveCategory]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 900);
  }, []);
  const categoryColor = categoryColors[activeCategory];
  const isWide = Platform.OS === 'web' && width >= 900;

  // Animated header scroll — collapses hero on scroll
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const heroHeight = scrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [230, 0],
    extrapolate: 'clamp',
  });

  const regions = useMemo(() => {
    const allForCat = getDestinationsByType(activeCategory);
    const uniqueRegions = Array.from(new Set(allForCat.map((d) => d.region)));
    return [t('discover.all'), ...uniqueRegions];
  }, [activeCategory, t]);

  const filteredDestinations = useMemo(() => {
    let list = getDestinationsByType(activeCategory);
    const allLabel = t('discover.all');

    if (activeCategory === 'beach') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    if (selectedRegion && selectedRegion !== allLabel) {
      list = list.filter((d) => d.region === selectedRegion);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, selectedRegion, searchQuery, t]);

  // ── Header rendered as ListHeaderComponent so it scrolls away ──
  const ListHeader = (
    <View>
      {/* ── Top Bar ── */}
      <View style={styles.header}>
        <View style={styles.brandLockup}>
          <View style={styles.logoMark}>
            <Ionicons name="home" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>{t('brand.name')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/settings' as any)}
            style={styles.headerIconBtn}
          >
            <Ionicons name="settings-outline" size={20} color="#1a1a1a" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wishlists' as any)} style={styles.headerIconBtn}>
            <Ionicons name="heart-outline" size={20} color="#1a1a1a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBell}>
            <Ionicons name="notifications-outline" size={20} color="#1a1a1a" />
            <View style={[styles.bellDot, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero Panel ── */}
      <Animated.View style={[styles.heroWrap, { opacity: heroOpacity, maxHeight: heroHeight, overflow: 'hidden' }]}>
        <LinearGradient colors={[SAHEL.primary, SAHEL.accent]} style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>{t('discover.kicker')}</Text>
            <Text style={styles.title}>{t('discover.heroTitle')}</Text>
            <Text style={styles.heroAr}>اكتشف أجمل شواطئ الجزائر</Text>
            <Text style={styles.subtitle}>{t('discover.heroSub')}</Text>
            <TouchableOpacity
              style={styles.bookBtn}
              activeOpacity={0.9}
              onPress={() => router.push('/services/beach/spots' as any)}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={16} color={SAHEL.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Search Bar (always visible) ── */}
      <View style={styles.searchPanel}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888888" />
          <TextInput
            placeholder={t('discover.searchPlaceholder')}
            placeholderTextColor="#888888"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.searchAccent, { backgroundColor: categoryColor }]}>
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </View>
      </View>

      {/* ── Category Bar ── */}
      <CategoryBar />

      {/* ── Region Chips ── */}
      {regions.length > 2 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={regions}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.regionList}
          style={styles.regionContainer}
          renderItem={({ item }) => {
            const isSelected =
              selectedRegion === item || (item === t('discover.all') && !selectedRegion);
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedRegion(item === t('discover.all') ? null : item)}
                style={[
                  styles.regionChip,
                  isSelected
                    ? { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#e2e8f0' },
                ]}
              >
                <Text
                  style={[
                    styles.regionLabel,
                    isSelected ? { color: '#FFFFFF', fontFamily: 'mon-sb' } : { color: '#888888' },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('discover.sectionTitle')}</Text>
        <Text style={styles.sectionMeta}>
          {t('discover.options', { count: String(filteredDestinations.length) })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={loading ? [] : filteredDestinations}
        keyExtractor={(item) => item.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        columnWrapperStyle={isWide ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listContent, { maxWidth: 1180, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SAHEL.accent} colors={[SAHEL.accent]} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {ListHeader}
            {loading ? (
              <View style={styles.skeletonWrap}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyContainer}>
              <Ionicons name="map-outline" size={48} color={SAHEL.border} />
              <Text style={styles.emptyText}>No destinations found in this area</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cardSlot}>
            <DestinationCard destination={item} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 8,
  },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0a2540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 18, fontFamily: 'mon-b', color: '#0a2540' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileBell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  heroWrap: { marginHorizontal: 20, marginTop: 6 },
  hero: {
    padding: 22,
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroCopy: { gap: 8 },
  kicker: { fontSize: 12, fontFamily: 'mon-b', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
  title: {
    fontSize: 24,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  heroAr: { fontSize: 15, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.95)', textAlign: 'right' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'mon', lineHeight: 18 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  bookBtnText: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.primary },
  skeletonWrap: { gap: 16, marginTop: 8 },

  // Search
  searchPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchAccent: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'mon', color: '#1a1a1a', height: '100%' },

  // Region chips
  regionContainer: { height: 44, marginBottom: 8 },
  regionList: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  regionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    height: 34,
  },
  regionLabel: { fontSize: 12, fontFamily: 'mon' },

  // Section header
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
  },
  sectionTitle: { flex: 1, fontSize: 19, fontFamily: 'mon-b', color: '#1a1a1a' },
  sectionMeta: { fontSize: 12, fontFamily: 'mon-sb', color: '#888888' },

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  columnWrapper: { gap: 18 },
  cardSlot: { flex: 1 },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#888888', fontFamily: 'mon-sb' },
});
