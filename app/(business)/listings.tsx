import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BusinessListings() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>My Listings</Text>
      <View style={styles.empty}>
        <Ionicons name="storefront-outline" size={48} color="#DDD6FE" />
        <Text style={styles.emptyText}>No listings yet</Text>
        <Text style={styles.emptySub}>Your business listings will appear here once you add them.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A', padding: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontFamily: 'mon-sb', color: '#7C3AED' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
});
