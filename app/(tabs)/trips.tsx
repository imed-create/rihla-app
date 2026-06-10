/**
 * RIHLA — Trips Tab (Uber-Style)
 * Merged bookings + trip history with premium design
 */

import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import UberButton from '@/components/shared/UberButton';
import BookingHistoryCard from '@/components/shared/BookingHistoryCard';
import EmptyState from '@/components/shared/EmptyState';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type TabType = 'active' | 'past';

export default function TripsScreen() {
  const { activeBookings, pastBookings } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [refreshing, setRefreshing] = useState(false);
  const displayedBookings = activeTab === 'active' ? activeBookings : pastBookings;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.shell}>
        {/* Header */}
        <LinearGradient colors={[RIHLA.primary + '08', '#FFFFFF']} style={styles.headerGradient}>
          <View style={styles.header}>
            <Text style={styles.title}>Your Trips</Text>
            <Text style={styles.subtitle}>Track active bookings and travel history.</Text>
          </View>
        </LinearGradient>

        {/* Segmented Tabs (Uber-style pill) */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('active')}
              style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, activeTab === 'active' ? styles.tabLabelActive : styles.tabLabelIdle]}>
                Active ({activeBookings.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('past')}
              style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, activeTab === 'past' ? styles.tabLabelActive : styles.tabLabelIdle]}>
                History ({pastBookings.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        <FlatList
          data={displayedBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RIHLA.accent} colors={[RIHLA.accent]} />
          }
          ListEmptyComponent={
            <View style={{ gap: 16, alignItems: 'center', paddingTop: 60 }}>
              <EmptyState
                icon="calendar-outline"
                title={activeTab === 'active' ? 'No active trips' : 'No past trips'}
                subtitle={activeTab === 'active' ? 'Book a service to see trips here.' : 'Completed trips will appear in history.'}
              />
              {activeTab === 'active' && (
                <UberButton
                  title="Explore Services"
                  bgVariant="secondary"
                  onPress={() => router.push('/(tabs)' as any)}
                  style={{ paddingHorizontal: 24 }}
                />
              )}
            </View>
          }
          renderItem={({ item }) => (
            <BookingHistoryCard
              booking={{
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                category: item.type || 'experience',
                destinationAddress: item.subtitle,
                date: new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                price: item.price,
                status: item.status as 'completed' | 'active' | 'cancelled' | 'upcoming',
              }}
              onPress={() => router.push(`/booking/${item.id}` as any)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  shell: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' },
  headerGradient: { paddingTop: 8 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 30, fontFamily: 'mon-b', color: '#0F172A', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#64748B', fontFamily: 'mon', marginTop: 4 },

  // Tabs
  tabContainer: { paddingHorizontal: 20, marginVertical: 12 },
  tabBackground: {
    flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 999, padding: 4, height: 44,
  },
  tabButton: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: {
    backgroundColor: '#FFFFFF', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  tabLabel: { fontSize: 13, fontFamily: 'mon' },
  tabLabelActive: { color: '#0F172A', fontFamily: 'mon-sb' },
  tabLabelIdle: { color: '#94A3B8' },

  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 },
});
