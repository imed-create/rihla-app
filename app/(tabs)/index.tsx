import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Platform,
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
import { categoryColors } from '@/constants/Colors';
import { getDestinationsByType } from '@/constants/destinations';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';

export default function DiscoverScreen() {
  const { activeCategory } = useApp();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
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
    return ['All', ...uniqueRegions];
  }, [activeCategory]);

  const filteredDestinations = useMemo(() => {
    let list = getDestinationsByType(activeCategory);

    if (selectedRegion && selectedRegion !== 'All') {
      list = list.filter((d) => d.region === selectedRegion);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.region.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, selectedRegion, searchQuery]);

  // ── Header rendered as ListHeaderComponent so it scrolls away ──
  const ListHeader = (
    <View>
      {/* ── Top Bar ── */}
      <View style={styles.header}>
        <View style={styles.brandLockup}>
          <View style={styles.logoMark}>
            <Ionicons name="home" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>TourDZ</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/wishlists' as any)} style={styles.headerIconBtn}>
            <Ionicons name="heart-outline" size={20} color="#222222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBell}>
            <Ionicons name="notifications-outline" size={20} color="#222222" />
            <View style={[styles.bellDot, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero Panel ── */}
      <Animated.View style={[styles.hero, { opacity: heroOpacity, maxHeight: heroHeight, overflow: 'hidden' }]}>
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>Explore Algeria</Text>
          <Text style={styles.title}>Find stays, places, and local services that feel handpicked.</Text>
          <Text style={styles.subtitle}>
            Beach days, Sahara nights, mountain escapes — all in one polished booking flow.
          </Text>
        </View>
      </Animated.View>

      {/* ── Search Bar (always visible) ── */}
      <View style={styles.searchPanel}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#717171" />
          <TextInput
            placeholder="Search destinations or regions"
            placeholderTextColor="#717171"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#717171" />
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
            const isSelected = selectedRegion === item || (item === 'All' && !selectedRegion);
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedRegion(item === 'All' ? null : item)}
                style={[
                  styles.regionChip,
                  isSelected
                    ? { backgroundColor: '#222222', borderColor: '#222222' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#DDDDDD' },
                ]}
              >
                <Text
                  style={[
                    styles.regionLabel,
                    isSelected ? { color: '#FFFFFF', fontFamily: 'mon-sb' } : { color: '#717171' },
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
        <Text style={styles.sectionTitle}>Places guests are loving</Text>
        <Text style={styles.sectionMeta}>{filteredDestinations.length} options</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={filteredDestinations}
        keyExtractor={(item) => item.id}
        numColumns={isWide ? 2 : 1}
        key={isWide ? 'wide' : 'narrow'}
        columnWrapperStyle={isWide ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listContent, { maxWidth: 1180, alignSelf: 'center', width: '100%' }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={48} color="#DDDDDD" />
            <Text style={styles.emptyText}>No destinations found in this area</Text>
          </View>
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
  root: { flex: 1, backgroundColor: '#F7F7F7' },

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
    backgroundColor: '#FF385C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 18, fontFamily: 'mon-b', color: '#FF385C' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileBell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#DDDDDD',
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

  // Hero
  hero: {
    marginHorizontal: 20,
    marginTop: 6,
    padding: 22,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroCopy: { gap: 8 },
  kicker: { fontSize: 12, fontFamily: 'mon-b', color: '#FF385C', textTransform: 'uppercase' },
  title: {
    fontSize: 26,
    fontFamily: 'mon-b',
    color: '#222222',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subtitle: { fontSize: 13, color: '#717171', fontFamily: 'mon', lineHeight: 18 },

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
    borderColor: '#DDDDDD',
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
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'mon', color: '#222222', height: '100%' },

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
  sectionTitle: { flex: 1, fontSize: 19, fontFamily: 'mon-b', color: '#222222' },
  sectionMeta: { fontSize: 12, fontFamily: 'mon-sb', color: '#717171' },

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  columnWrapper: { gap: 18 },
  cardSlot: { flex: 1 },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#717171', fontFamily: 'mon-sb' },
});
