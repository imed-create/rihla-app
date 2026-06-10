import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProTabShell from '@/components/dashboard/TabShell';

export default function PartnerCommunity() {
  return (
    <ProTabShell role="partner" title="Partner Community" subtitle="Forum & local network">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Ionicons name="people-outline" size={48} color="#f4a261" />
          <Text style={styles.title}>Partner Community</Text>
          <Text style={styles.subtitle}>Connect with other RIHLA partners, share tips, and grow your network. Coming soon.</Text>
        </View>
      </ScrollView>
    </ProTabShell>
  );
}
const styles = StyleSheet.create({ content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, placeholder: { alignItems: 'center', gap: 12 }, title: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' }, subtitle: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textAlign: 'center', lineHeight: 20 } });
