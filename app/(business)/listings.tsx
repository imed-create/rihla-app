import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBusinessListings } from '@/store/useBusinessListings';
import ProTabShell from '@/components/pro/ProTabShell';

export default function BusinessListings() {
  const { listings } = useBusinessListings();

  const addBtn = (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => router.push('/(business)/listings/new' as any)}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={18} color="#fff" />
      <Text style={styles.addBtnText}>New</Text>
    </TouchableOpacity>
  );

  return (
    <ProTabShell role="business" title="My Listings" subtitle="Create, publish, and manage" headerRight={addBtn}>
      {listings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="storefront-outline" size={52} color="#DDD6FE" />
          <Text style={styles.emptyText}>No listings yet</Text>
          <Text style={styles.emptySub}>
            Add your first listing to start receiving bookings.
          </Text>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push('/(business)/listings/new' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color="#0a2540" />
            <Text style={styles.primaryCtaText}>Create a listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/(business)/listings/${item.id}` as any)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name="business-outline" size={18} color="#0a2540" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {labelBusinessType(item.businessType)} · {item.city}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <View style={[styles.statusPill, pillStyle(item.status)]}>
                  <Text style={[styles.statusText, pillTextStyle(item.status)]}>
                    {item.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ProTabShell>
  );
}

function labelBusinessType(type: string) {
  const map: Record<string, string> = {
    hotel: 'Hotel',
    resort: 'Resort',
    restaurant: 'Restaurant',
    cafe: 'Café',
    'event-venue': 'Venue',
    'tour-office': 'Tour office',
    other: 'Other',
  };
  return map[type] ?? 'Other';
}

function pillStyle(status: string) {
  if (status === 'published') return { backgroundColor: '#ECFDF5' };
  if (status === 'paused') return { backgroundColor: '#FEF3C7' };
  return { backgroundColor: '#F1F5F9' };
}

function pillTextStyle(status: string) {
  if (status === 'published') return { color: '#f4a261' };
  if (status === 'paused') return { color: '#B45309' };
  return { color: '#64748B' };
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0a2540',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#0a2540',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  addBtnText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  cardSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 11, fontFamily: 'mon-sb', textTransform: 'capitalize' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontFamily: 'mon-sb', color: '#0a2540' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  primaryCtaText: { fontSize: 13, fontFamily: 'mon-b', color: '#0a2540' },
});
