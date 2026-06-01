import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BookingCard from '@/components/BookingCard';
import { useApp } from '@/context/AppContext';

type TabType = 'active' | 'past';

export default function BookingsScreen() {
  const { activeBookings, pastBookings, cancelBooking } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const displayedBookings = activeTab === 'active' ? activeBookings : pastBookings;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Trips</Text>
          <Text style={styles.title}>Your bookings</Text>
          <Text style={styles.subtitle}>Track active experiences, QR passes, and travel history.</Text>
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={56} color="#DDDDDD" />
              <Text style={styles.emptyText}>
                {activeTab === 'active' ? 'No active bookings right now' : "You don't have any past bookings"}
              </Text>
              {activeTab === 'active' && (
                <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(tabs)' as any)} style={styles.exploreBtn}>
                  <Text style={styles.exploreText}>Explore Services</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => <BookingCard booking={item} onCancel={(id) => cancelBooking(id)} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7F7' },
  shell: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 22 : 16,
    paddingBottom: 14,
  },
  eyebrow: { fontSize: 12, fontFamily: 'mon-b', color: '#FF385C', textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 30, fontFamily: 'mon-b', color: '#222222', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#717171', fontFamily: 'mon', marginTop: 6 },
  tabContainer: { paddingHorizontal: 20, marginVertical: 10 },
  tabBackground: { flexDirection: 'row', backgroundColor: '#EBEBEB', borderRadius: 999, padding: 3, height: 46 },
  tabButton: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabLabel: { fontSize: 13, fontFamily: 'mon' },
  tabLabelActive: { color: '#222222', fontFamily: 'mon-sb' },
  tabLabelIdle: { color: '#717171' },
  listContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 14, color: '#717171', fontFamily: 'mon-sb' },
  exploreBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, marginTop: 8, backgroundColor: '#FF385C' },
  exploreText: { color: '#FFFFFF', fontSize: 13, fontFamily: 'mon-b' },
});
