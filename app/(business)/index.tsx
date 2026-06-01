import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const STAT_CARDS = [
  { label: 'Total Listings', value: '0', icon: 'list-outline', color: '#7C3AED' },
  { label: 'Active Bookings', value: '0', icon: 'calendar-outline', color: '#0096C7' },
  { label: 'Revenue (DZD)', value: '0', icon: 'cash-outline', color: '#059669' },
  { label: 'Avg. Rating', value: '—', icon: 'star-outline', color: '#F59E0B' },
];

export default function BusinessDashboard() {
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
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#4C1D95']} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.name}>{user.kycData.businessName || user.name || 'Business Owner'}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: '#059669' }]} />
          <Text style={styles.statusText}>Account Verified · Business Owner</Text>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {STAT_CARDS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction icon="add-circle-outline" label="Add Listing" color="#7C3AED" onPress={() => {}} />
          <QuickAction icon="megaphone-outline" label="Promotions" color="#0096C7" onPress={() => {}} />
          <QuickAction icon="analytics-outline" label="Analytics" color="#059669" onPress={() => {}} />
          <QuickAction icon="chatbubble-outline" label="Reviews" color="#F59E0B" onPress={() => {}} />
        </View>

        {/* Coming soon */}
        <View style={styles.comingSoon}>
          <Ionicons name="construct-outline" size={32} color="#C4B5FD" />
          <Text style={styles.comingSoonTitle}>Business Tools Coming Soon</Text>
          <Text style={styles.comingSoonSub}>
            Listing management, booking calendar, revenue analytics, and customer reviews — all in one place.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.75)' },
  name: { fontSize: 22, fontFamily: 'mon-b', color: '#fff', marginTop: 2 },
  signOutBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: 'mon-sb', color: '#334155' },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'mon-b', color: '#0F172A' },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  actionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 13, fontFamily: 'mon-sb', color: '#334155' },
  comingSoon: { backgroundColor: '#F5F3FF', borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DDD6FE' },
  comingSoonTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#5B21B6' },
  comingSoonSub: { fontSize: 13, fontFamily: 'mon', color: '#7C3AED', textAlign: 'center', lineHeight: 19 },
});
