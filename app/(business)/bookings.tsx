import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BusinessBookings() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Incoming Bookings</Text>
      <View style={styles.empty}>
        <Ionicons name="calendar-outline" size={48} color="#DDD6FE" />
        <Text style={styles.emptyText}>No bookings yet</Text>
        <Text style={styles.emptySub}>When tourists book your services, they'll appear here.</Text>
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
