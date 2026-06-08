import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProTabShell from '@/components/dashboard/TabShell';

export default function PartnerRentals() {
  return (
    <ProTabShell role="partner" title="Active Rentals" subtitle="Live customer sessions">
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={48} color="#6EE7B7" />
        <Text style={styles.emptyText}>No active rentals</Text>
        <Text style={styles.emptySub}>When tourists rent from you, it'll show up here in real-time.</Text>
      </View>
    </ProTabShell>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontFamily: 'mon-sb', color: '#f4a261' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
});
