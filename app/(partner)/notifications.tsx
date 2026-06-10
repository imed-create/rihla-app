import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProTabShell from '@/components/dashboard/TabShell';

export default function Notifications() {
  return (
    <ProTabShell role="partner" title="Notifications" subtitle="Alerts & booking requests">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Ionicons name="notifications-outline" size={48} color="#f4a261" />
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>View your alerts, booking requests, and important updates. Coming soon.</Text>
        </View>
      </ScrollView>
    </ProTabShell>
  );
}
const styles = StyleSheet.create({ content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, placeholder: { alignItems: 'center', gap: 12 }, title: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, subtitle: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 20 } });
