import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function BusinessProfile() {
  const { user, signOut } = useApp();
  const { signOut: clerkSignOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
    } catch (e) {}
    signOut();
    router.replace('/(modals)/login');
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.avatar}>
          <Text style={styles.avatarLetter}>{(user.kycData.fullName || user.name || 'B')[0].toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.name}>{user.kycData.fullName || user.name || '—'}</Text>
        <Text style={styles.role}>Business Owner</Text>
        {user.kycData.businessName && <Text style={styles.biz}>{user.kycData.businessName}</Text>}
        {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC', padding: 24 },
  title: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarLetter: { fontSize: 32, fontFamily: 'mon-b', color: '#fff' },
  name: { fontSize: 20, fontFamily: 'mon-b', color: '#0F172A' },
  role: { fontSize: 13, fontFamily: 'mon-sb', color: '#7C3AED', backgroundColor: '#F5F3FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  biz: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  phone: { fontSize: 14, fontFamily: 'mon', color: '#64748B' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, padding: 16, backgroundColor: '#FEF2F2', borderRadius: 14, borderWidth: 1, borderColor: '#FECACA' },
  signOutText: { fontSize: 15, fontFamily: 'mon-sb', color: '#EF4444' },
});
