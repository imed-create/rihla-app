import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PartnerServices() {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>My Services</Text>
      <View style={styles.empty}>
        <Ionicons name="cube-outline" size={48} color="#6EE7B7" />
        <Text style={styles.emptyText}>No services added</Text>
        <Text style={styles.emptySub}>Your rental services will appear here once listed.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A', padding: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontFamily: 'mon-sb', color: '#059669' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
});
