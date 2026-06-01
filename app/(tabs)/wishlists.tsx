import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function WishlistsScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlists</Text>
      </View>

      <View style={styles.empty}>
        <View style={styles.iconWrap}>
          <Ionicons name="heart-outline" size={36} color="#94A3B8" />
        </View>
        <Text style={styles.emptyTitle}>Nothing saved yet</Text>
        <Text style={styles.emptySub}>
          Tap the heart on any destination to save it here for later.
        </Text>
        <TouchableOpacity style={styles.exploreBtn}>
          <Text style={styles.exploreBtnText}>Start exploring</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontFamily: 'mon-b', fontSize: 24, color: '#000000' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#000000' },
  emptySub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  exploreBtnText: { fontFamily: 'mon-sb', fontSize: 14, color: '#0F172A' },
});
