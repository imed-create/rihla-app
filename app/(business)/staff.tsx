import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProTabShell from '@/components/dashboard/TabShell';

export default function StaffManagement() {
  return (
    <ProTabShell role="business" title="Staff Management" subtitle="Roster, shifts & payroll">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Ionicons name="people-outline" size={48} color="#0a2540" />
          <Text style={styles.title}>Staff Management</Text>
          <Text style={styles.subtitle}>Manage your team rosters, shifts, and payroll. Coming soon.</Text>
        </View>
      </ScrollView>
    </ProTabShell>
  );
}
const styles = StyleSheet.create({ content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, placeholder: { alignItems: 'center', gap: 12 }, title: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, subtitle: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 20 } });
