import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useFavorites } from '@/store/useFavorites';
import { DESTINATIONS } from '@/constants/destinations';

export default function WishlistsScreen() {
  const { favoriteIds, toggleFavorite } = useFavorites();

  const savedDestinations = useMemo(
    () => DESTINATIONS.filter((d) => favoriteIds.includes(d.id)),
    [favoriteIds]
  );

  const handleRemove = (id: string, name: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${name}" from your saved places?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => toggleFavorite(id),
        },
      ]
    );
  };

  if (savedDestinations.length === 0) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wishlists</Text>
          <Text style={styles.headerSub}>Your saved destinations</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="heart-outline" size={40} color="#FF385C" />
          </View>
          <Text style={styles.emptyTitle}>Start saving places</Text>
          <Text style={styles.emptySub}>
            Tap the heart ♡ on any destination to save it here. Build your perfect Algeria trip list.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
            <Text style={styles.exploreBtnText}>Explore Destinations</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={savedDestinations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Wishlists</Text>
            <Text style={styles.headerSub}>{savedDestinations.length} saved {savedDestinations.length === 1 ? 'place' : 'places'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.88}
            onPress={() => router.push(`/destination/${item.id}` as any)}
          >
            {/* Color gradient bar */}
            <View style={[styles.cardGradientBar, { backgroundColor: item.gradient[0] }]} />

            <View style={styles.cardBody}>
              <View style={styles.cardLeft}>
                <View style={[styles.cardEmoji, { backgroundColor: item.gradient[0] + '20' }]}>
                  <Text style={styles.cardEmojiText}>
                    {item.type === 'beach' ? '🏖️'
                      : item.type === 'desert' ? '🏜️'
                      : item.type === 'mountain' ? '⛰️'
                      : item.type === 'historical' ? '🏛️'
                      : '🏙️'}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardRegion}>{item.region}</Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={styles.cardRating}>{item.rating}</Text>
                    <Text style={styles.cardDot}>·</Text>
                    <Text style={styles.cardDistance}>{item.distance}</Text>
                  </View>
                  {/* Features */}
                  <View style={styles.featureRow}>
                    {item.features.slice(0, 2).map((f, i) => (
                      <View key={i} style={[styles.featureBadge, { backgroundColor: item.gradient[0] + '18' }]}>
                        <Text style={[styles.featureText, { color: item.gradient[0] }]}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.cardRight}>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id, item.name)}
                  style={styles.heartBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="heart" size={22} color="#FF385C" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewBtn, { backgroundColor: item.gradient[0] }]}
                  onPress={() => router.push(`/destination/${item.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.clearBtn} onPress={() => {
            Alert.alert('Clear Wishlist', 'Remove all saved places?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear All', style: 'destructive', onPress: () => savedDestinations.forEach(d => toggleFavorite(d.id)) },
            ]);
          }}>
            <Ionicons name="trash-outline" size={16} color="#717171" />
            <Text style={styles.clearBtnText}>Clear all</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F7' },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontFamily: 'mon-b', fontSize: 28, color: '#111111', letterSpacing: -0.5 },
  headerSub: { fontFamily: 'mon', fontSize: 14, color: '#717171', marginTop: 4 },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
    paddingBottom: 100,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 22, fontFamily: 'mon-b', color: '#111111', textAlign: 'center' },
  emptySub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#717171',
    textAlign: 'center',
    lineHeight: 21,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  exploreBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'mon-b' },

  // List
  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardGradientBar: { height: 4 },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  cardLeft: { flex: 1, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  cardEmoji: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmojiText: { fontSize: 26 },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontFamily: 'mon-b', color: '#111111' },
  cardRegion: { fontSize: 13, fontFamily: 'mon', color: '#717171' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardRating: { fontSize: 12, fontFamily: 'mon-sb', color: '#111111' },
  cardDot: { fontSize: 12, color: '#CCCCCC' },
  cardDistance: { fontSize: 12, fontFamily: 'mon', color: '#717171' },
  featureRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  featureText: { fontSize: 11, fontFamily: 'mon-sb' },

  // Right side
  cardRight: { alignItems: 'center', gap: 10 },
  heartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  viewBtnText: { fontSize: 13, fontFamily: 'mon-b', color: '#FFFFFF' },

  // Footer
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    marginTop: 8,
  },
  clearBtnText: { fontSize: 13, fontFamily: 'mon-sb', color: '#717171' },
});
