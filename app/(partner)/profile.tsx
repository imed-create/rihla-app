import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import ProTabShell from '@/components/dashboard/TabShell';

export default function PartnerProfile() {
  const { user } = useApp();

  return (
    <ProTabShell role="partner" title="Profile" subtitle="Partner account">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <LinearGradient colors={['#f4a261', '#e08f47']} style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(user.kycData.fullName || user.name || 'P')[0].toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.name}>{user.kycData.fullName || user.name || '—'}</Text>
          <Text style={styles.role}>Service Partner</Text>
          {user.kycData.assetType && (
            <Text style={styles.asset}>
              {user.kycData.assetCount}× {user.kycData.assetType?.replace('-', ' ')}
            </Text>
          )}
          {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
        </View>
        <Text style={styles.hint}>Sign out from the menu (☰) anytime.</Text>
      </ScrollView>
    </ProTabShell>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarLetter: { fontSize: 32, fontFamily: 'mon-b', color: '#fff' },
  name: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  role: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#f4a261',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  asset: { fontSize: 14, fontFamily: 'mon', color: '#64748B', textTransform: 'capitalize' },
  phone: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  hint: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center', marginTop: 20 },
});
