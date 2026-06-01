import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const ASSET_ICONS: Record<string, string> = {
  'jet-ski': 'boat-outline',
  camel: 'paw-outline',
  buggy: 'car-sport-outline',
  quad: 'bicycle-outline',
  kayak: 'water-outline',
  horse: 'logo-buffer',
  paraglider: 'airplane-outline',
  other: 'cube-outline',
};

const STAT_CARDS = [
  { label: 'Active Services', value: '0', icon: 'flash-outline', color: '#059669' },
  { label: 'Rentals Today', value: '0', icon: 'calendar-outline', color: '#0096C7' },
  { label: 'Earnings (DZD)', value: '0', icon: 'cash-outline', color: '#F59E0B' },
  { label: 'Avg. Rating', value: '—', icon: 'star-outline', color: '#7C3AED' },
];

export default function PartnerDashboard() {
  const { user, signOut } = useApp();
  const { signOut: clerkSignOut } = useAuth();

  const assetIcon = ASSET_ICONS[user.kycData.assetType ?? ''] ?? 'cube-outline';
  const assetLabel = user.kycData.assetType
    ? `${user.kycData.assetCount ?? 1}× ${user.kycData.assetType.replace('-', ' ')}`
    : 'No assets listed';

  const handleSignOut = async () => {
    try {
      await clerkSignOut();
    } catch (e) {}
    signOut();
    router.replace('/(modals)/login');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <LinearGradient colors={['#059669', '#064E3B']} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Service Partner 🔧</Text>
          <Text style={styles.name}>{user.name || user.kycData.fullName || 'Partner'}</Text>
          <View style={styles.assetBadge}>
            <Ionicons name={assetIcon as any} size={14} color="#A7F3D0" />
            <Text style={styles.assetBadgeText}>{assetLabel}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: '#059669' }]} />
          <Text style={styles.statusText}>Account Verified · Service Partner</Text>
        </View>

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

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <QuickAction icon="add-circle-outline" label="Add Service" color="#059669" onPress={() => {}} />
          <QuickAction icon="calendar-outline" label="Schedule" color="#0096C7" onPress={() => {}} />
          <QuickAction icon="cash-outline" label="Earnings" color="#F59E0B" onPress={() => {}} />
          <QuickAction icon="chatbubble-outline" label="Reviews" color="#7C3AED" onPress={() => {}} />
        </View>

        <View style={styles.comingSoon}>
          <Ionicons name="construct-outline" size={32} color="#6EE7B7" />
          <Text style={styles.comingSoonTitle}>Partner Tools Coming Soon</Text>
          <Text style={styles.comingSoonSub}>
            Manage your rentals, set availability, track daily earnings, and respond to customers — all here.
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
  assetBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  assetBadgeText: { fontSize: 12, fontFamily: 'mon-sb', color: '#A7F3D0', textTransform: 'capitalize' },
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
  comingSoon: { backgroundColor: '#ECFDF5', borderRadius: 20, padding: 28, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#A7F3D0' },
  comingSoonTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#065F46' },
  comingSoonSub: { fontSize: 13, fontFamily: 'mon', color: '#059669', textAlign: 'center', lineHeight: 19 },
});
