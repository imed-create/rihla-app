/**
 * RIHLA — Saved Tab (Uber Style)
 * ──────────────────────────────
 * Clean Uber-style saved places list.
 * White card layout with image thumbnails, category badge, and heart toggle.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useFavorites } from '@/store/useFavorites';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';

export default function FavoritesScreen() {
  const { colors, isDark } = useTheme();
  const { favoriteIds, clearFavorites } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const favoriteListings = useMemo(
    () => MOCK_LISTINGS.filter((l) => favoriteIds.includes(l.id)),
    [favoriteIds]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bg },

        headerSection: {
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 12,
        },
        headerTitle: {
          fontSize: 28,
          fontFamily: 'mon-b',
          color: colors.text,
          letterSpacing: -0.3,
        },
        headerMeta: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 6,
        },
        headerCount: {
          fontSize: 14,
          fontFamily: 'mon',
          color: colors.muted,
        },
        clearBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 8,
          backgroundColor: isDark ? colors.card : '#FEF2F2',
        },
        clearText: {
          fontSize: 12,
          fontFamily: 'mon-sb',
          color: '#EF4444',
        },

        listContent: {
          paddingBottom: 100,
        },

        card: {
          flexDirection: 'row',
          marginHorizontal: 20,
          marginBottom: 10,
          backgroundColor: colors.card,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
          position: 'relative',
        },
        cardImageWrap: {
          width: 90,
          height: 90,
          position: 'relative',
        },
        cardImage: {
          width: 90,
          height: 90,
        },
        cardImagePlaceholder: {
          width: 90,
          height: 90,
          alignItems: 'center',
          justifyContent: 'center',
        },
        cardBadge: {
          position: 'absolute',
          top: 6,
          left: 6,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        },
        cardBadgeText: {
          fontSize: 8,
          fontFamily: 'mon-b',
          color: '#FFFFFF',
          textTransform: 'uppercase',
        },
        cardInfo: {
          flex: 1,
          padding: 12,
          gap: 3,
          justifyContent: 'center',
        },
        cardTitle: {
          fontSize: 14,
          fontFamily: 'mon-b',
          color: colors.text,
        },
        cardSub: {
          fontSize: 12,
          fontFamily: 'mon',
          color: colors.muted,
        },
        cardPrice: {
          fontSize: 14,
          fontFamily: 'mon-b',
          color: RIHLA.primary,
        },
        cardPriceUnit: {
          fontSize: 10,
          fontFamily: 'mon',
          color: colors.muted,
        },
        heartBtn: {
          position: 'absolute',
          top: 8,
          right: 8,
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        },

        emptyState: {
          alignItems: 'center',
          paddingTop: 80,
          paddingHorizontal: 40,
          gap: 8,
        },
        emptyIconWrap: {
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        },
        emptyTitle: {
          fontSize: 18,
          fontFamily: 'mon-b',
          color: colors.text,
        },
        emptySub: {
          fontSize: 14,
          fontFamily: 'mon',
          color: colors.muted,
          textAlign: 'center',
          lineHeight: 20,
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={favoriteListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={RIHLA.primary}
            colors={[RIHLA.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Saved</Text>
            {favoriteListings.length > 0 && (
              <View style={styles.headerMeta}>
                <Text style={styles.headerCount}>
                  {favoriteListings.length} {favoriteListings.length === 1 ? 'place' : 'places'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert(
                      'Clear All Saved',
                      `Remove all ${favoriteListings.length} saved places?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear All', style: 'destructive', onPress: () => clearFavorites() },
                      ]
                    );
                  }}
                  style={styles.clearBtn}
                >
                  <Ionicons name="trash-outline" size={13} color="#EF4444" />
                  <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="heart-outline" size={36} color={colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No saved places yet</Text>
            <Text style={styles.emptySub}>
              Tap the heart icon on any listing to save it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const catDef = getCategoryDef(item.category as any);
          const catColor = catDef?.color || RIHLA.primary;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/listing/${item.id}` as any);
              }}
            >
              <View style={styles.cardImageWrap}>
                {item.cover_image_url ? (
                  <Image source={{ uri: item.cover_image_url }} style={styles.cardImage} />
                ) : (
                  <View style={[styles.cardImagePlaceholder, { backgroundColor: catColor + '20' }]}>
                    <Ionicons name={(catDef?.icon || 'image-outline') as any} size={22} color={catColor} />
                  </View>
                )}
                <View style={[styles.cardBadge, { backgroundColor: catColor }]}>
                  <Text style={styles.cardBadgeText}>{catDef?.label || item.category}</Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  {item.wilaya} · ⭐ {item.rating}
                </Text>
                <Text style={styles.cardPrice}>
                  {item.price_dzd.toLocaleString()} <Text style={styles.cardPriceUnit}>DZD</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.heartBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  useFavorites.getState().toggleFavorite(item.id);
                }}
              >
                <Ionicons name="heart" size={18} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
