import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import ProTabShell from '@/components/pro/ProTabShell';

export default function BusinessProfile() {
  const { user } = useApp();

  return (
    <ProTabShell role="business" title="Profile" subtitle="Account & verification">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <LinearGradient colors={['#0a2540', '#061a2c']} style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(user.kycData.fullName || user.name || 'B')[0].toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={styles.name}>{user.kycData.fullName || user.name || '—'}</Text>
          <Text style={styles.role}>Business Owner</Text>
          {user.kycData.businessName && <Text style={styles.biz}>{user.kycData.businessName}</Text>}
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
    color: '#0a2540',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  biz: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  phone: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  hint: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center', marginTop: 20 },
});
