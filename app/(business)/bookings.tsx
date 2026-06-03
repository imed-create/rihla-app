import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ProTabShell from '@/components/pro/ProTabShell';
import EmptyState from '@/components/EmptyState';
import { showToast } from '@/components/Toast';
import { SAHEL } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';
import type { AppBooking, AppBookingStatus } from '@/types/booking';
import { isBusinessBooking } from '@/lib/dashboardStats';

type Filter = 'pending' | 'confirmed' | 'cancelled';

const CONFIRMED: AppBookingStatus[] = ['confirmed', 'active', 'completed'];

export default function BusinessBookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [filter, setFilter] = useState<Filter>('pending');

  const list = useMemo(() => {
    const biz = bookings.filter(isBusinessBooking);
    if (filter === 'pending') return biz.filter((b) => b.status === 'pending');
    if (filter === 'confirmed') return biz.filter((b) => CONFIRMED.includes(b.status));
    return biz.filter((b) => b.status === 'cancelled');
  }, [bookings, filter]);

  const accept = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateBookingStatus(id, 'confirmed');
    showToast('Booking accepted', 'success');
  };

  const reject = (id: string) => {
    updateBookingStatus(id, 'cancelled');
    showToast('Booking declined', 'info');
  };

  return (
    <ProTabShell role="business" title="Bookings" subtitle="Incoming reservations">
      <View style={styles.tabs}>
        {(['pending', 'confirmed', 'cancelled'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[styles.tab, filter === f && styles.tabOn]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextOn]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={list}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No bookings in this tab"
            subtitle="New spot and service reservations will appear here."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.guest}>{item.title}</Text>
              <View style={[styles.badge, badgeStyle(item.status)]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.sub}>{item.subtitle}</Text>
            <Text style={styles.meta}>
              {new Date(item.createdAt).toLocaleString()} · {item.price.toLocaleString()} DZD
            </Text>
            {item.status === 'pending' && (
              <View style={styles.actions}>
                <Pressable style={styles.rejectBtn} onPress={() => reject(item.id)}>
                  <Text style={styles.rejectText}>Reject</Text>
                </Pressable>
                <Pressable style={styles.acceptBtn} onPress={() => accept(item.id)}>
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />
    </ProTabShell>
  );
}

function badgeStyle(status: AppBookingStatus) {
  if (status === 'pending') return { backgroundColor: '#FEF3C7' };
  if (status === 'cancelled') return { backgroundColor: '#FEE2E2' };
  return { backgroundColor: '#D1FAE5' };
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: SAHEL.muted,
    alignItems: 'center',
  },
  tabOn: { backgroundColor: SAHEL.primary },
  tabText: { fontSize: 12, fontFamily: 'mon-sb', color: SAHEL.mutedText, textTransform: 'capitalize' },
  tabTextOn: { color: '#fff' },
  list: { padding: 16, paddingBottom: 32, flexGrow: 1 },
  card: {
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  guest: { flex: 1, fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: 'mon-b', color: SAHEL.dark, textTransform: 'capitalize' },
  sub: { fontSize: 13, fontFamily: 'mon', color: SAHEL.mutedText },
  meta: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: SAHEL.border,
    alignItems: 'center',
  },
  rejectText: { fontFamily: 'mon-sb', color: SAHEL.mutedText },
  acceptBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: SAHEL.primary,
    alignItems: 'center',
  },
  acceptText: { fontFamily: 'mon-b', color: '#fff' },
});
