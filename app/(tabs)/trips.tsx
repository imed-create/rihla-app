/**
 * RIHLA — Trips Tab
 * Merged bookings + trip history
 */
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import BookingCard from '@/components/shared/BookingCard';
import EmptyState from '@/components/shared/EmptyState';
import { RIHLA } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type TabType = 'active' | 'past';

export default function TripsScreen() {
  const { activeBookings, pastBookings, cancelBooking } = useApp();
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
        <View style={styles.header}>
          <Text style={styles.title}>Your Trips</Text>
          <Text style={styles.subtitle}>Track active bookings and travel history.</Text>
        </View>

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

        <FlatList
          data={displayedBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RIHLA.accent} colors={[RIHLA.accent]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="calendar-outline"
              title={activeTab === 'active' ? 'No active trips' : 'No past trips'}
              subtitle={activeTab === 'active' ? 'Book a service to see trips here.' : 'Completed trips will appear in history.'}
              actionLabel={activeTab === 'active' ? 'Explore' : undefined}
              onAction={activeTab === 'active' ? () => router.push('/(tabs)' as any) : undefined}
            />
          }
          renderItem={({ item }) => <BookingCard booking={item} onCancel={(id) => cancelBooking(id)} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  shell: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 14 },
  title: { fontSize: 30, fontFamily: 'mon-b', color: '#1a1a1a', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#888888', fontFamily: 'mon', marginTop: 6 },
  tabContainer: { paddingHorizontal: 20, marginVertical: 10 },
  tabBackground: { flexDirection: 'row', backgroundColor: '#EBEBEB', borderRadius: 999, padding: 3, height: 46 },
  tabButton: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  tabLabel: { fontSize: 13, fontFamily: 'mon' },
  tabLabelActive: { color: '#1a1a1a', fontFamily: 'mon-sb' },
  tabLabelIdle: { color: '#888888' },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
});
