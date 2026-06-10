import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProTabShell from '@/components/dashboard/TabShell';

export default function Changelog() {
  return (
    <ProTabShell role="business" title="What's New" subtitle="Updates & changelog">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Ionicons name="megaphone-outline" size={48} color="#0a2540" />
          <Text style={styles.title}>What's New</Text>
          <Text style={styles.subtitle}>Stay up to date with the latest RIHLA platform updates and features. Coming soon.</Text>
        </View>
      </ScrollView>
    </ProTabShell>
  );
}
const styles = StyleSheet.create({ content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, placeholder: { alignItems: 'center', gap: 12 }, title: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, subtitle: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 20 } });
