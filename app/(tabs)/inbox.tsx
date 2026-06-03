import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { SAHEL } from '@/constants/Colors';

// ── Static notification data (in a real app this would come from a notifications service) ──
const NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'promo',
    icon: 'pricetag-outline' as const,
    iconColor: '#0a2540',
    iconBg: '#FFF0F3',
    title: 'Special Offer — Djanet Package 🏜️',
    body: 'Book a Sahara experience this month and get 15% off your stay. Limited spots available.',
    time: '2h ago',
    isRead: false,
  },
  {
    id: 'n2',
    type: 'tip',
    icon: 'information-circle-outline' as const,
    iconColor: '#00a896',
    iconBg: '#E0F7FA',
    title: 'Travel tip: Best time for Tipaza',
    body: 'April to June is peak season for Tipaza Beach — mild weather and calm Mediterranean waters.',
    time: '5h ago',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'update',
    icon: 'checkmark-circle-outline' as const,
    iconColor: '#f4a261',
    iconBg: '#D1FAE5',
    title: 'New: Hammam Service in Tlemcen',
    body: 'We added a traditional hammam & wellness experience at Tlemcen heritage site.',
    time: '1d ago',
    isRead: true,
  },
  {
    id: 'n4',
    type: 'reminder',
    icon: 'calendar-outline' as const,
    iconColor: '#0a2540',
    iconBg: '#EDE9FE',
    title: 'Algeria Tourism Week',
    body: 'The national tourism expo is happening in Algiers next weekend. Discover new routes & hotels.',
    time: '2d ago',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'promo',
    icon: 'star-outline' as const,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    title: 'Top Pick: Djurdjura Mountain',
    body: 'Spring is the perfect time to hike the cedar forests of Djurdjura. Book your guide today.',
    time: '3d ago',
    isRead: true,
  },
  {
    id: 'n6',
    type: 'tip',
    icon: 'shield-checkmark-outline' as const,
    iconColor: '#f4a261',
    iconBg: '#D1FAE5',
    title: 'Your profile is verified ✓',
    body: 'Your KYC verification was approved. You can now book any service on TourDZ.',
    time: '1w ago',
    isRead: true,
  },
];

type TabType = 'all' | 'unread';

export default function InboxScreen() {
  const { activeBookings } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(
    NOTIFICATIONS.filter((n) => n.isRead).map((n) => n.id)
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const markAllRead = () => {
    setReadIds(NOTIFICATIONS.map((n) => n.id));
  };

  const markRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const notifications = NOTIFICATIONS.filter((n) =>
    activeTab === 'unread' ? !readIds.includes(n.id) : true
  );

  const unreadCount = NOTIFICATIONS.filter((n) => !readIds.includes(n.id)).length;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SAHEL.accent} colors={[SAHEL.accent]} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Inbox</Text>
                {unreadCount > 0 && (
                  <Text style={styles.headerSub}>{unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}</Text>
                )}
              </View>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Active booking alert */}
            {activeBookings.length > 0 && (
              <TouchableOpacity
                style={styles.bookingAlert}
                activeOpacity={0.88}
                onPress={() => router.push('/(tabs)/bookings' as any)}
              >
                <View style={styles.bookingAlertIcon}>
                  <Ionicons name="flash" size={18} color="#0a2540" />
                </View>
                <View style={styles.bookingAlertInfo}>
                  <Text style={styles.bookingAlertTitle}>
                    {activeBookings.length} Active {activeBookings.length === 1 ? 'Booking' : 'Bookings'}
                  </Text>
                  <Text style={styles.bookingAlertSub}>Tap to manage your trips →</Text>
                </View>
                <View style={styles.bookingBadge}>
                  <Text style={styles.bookingBadgeText}>{activeBookings.length}</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Tab Pills */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'all' && styles.tabPillActive]}
                onPress={() => setActiveTab('all')}
              >
                <Text style={[styles.tabPillText, activeTab === 'all' && styles.tabPillTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabPill, activeTab === 'unread' && styles.tabPillActive]}
                onPress={() => setActiveTab('unread')}
              >
                <Text style={[styles.tabPillText, activeTab === 'unread' && styles.tabPillTextActive]}>
                  Unread {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="mail-open-outline" size={36} color="#888888" />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No unread notifications.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isRead = readIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.notifCard, isRead && styles.notifCardRead]}
              activeOpacity={0.85}
              onPress={() => markRead(item.id)}
            >
              {/* Unread dot */}
              {!isRead && <View style={styles.unreadDot} />}

              <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={22} color={item.iconColor} />
              </View>

              <View style={styles.notifBody}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, isRead && styles.notifTitleRead]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
                <Text style={[styles.notifText, isRead && styles.notifTextRead]} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: { fontFamily: 'mon-b', fontSize: 28, color: '#111111', letterSpacing: -0.5 },
  headerSub: { fontFamily: 'mon', fontSize: 13, color: '#888888', marginTop: 2 },
  markAllBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
  },
  markAllText: { fontSize: 12, fontFamily: 'mon-sb', color: '#888888' },

  // Active booking alert banner
  bookingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD0D8',
  },
  bookingAlertIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD0D8',
  },
  bookingAlertInfo: { flex: 1 },
  bookingAlertTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#111111' },
  bookingAlertSub: { fontSize: 12, fontFamily: 'mon', color: '#0a2540', marginTop: 2 },
  bookingBadge: {
    backgroundColor: '#0a2540',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingBadgeText: { fontSize: 13, fontFamily: 'mon-b', color: '#FFFFFF' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#FFFFFF',
  },
  tabPillActive: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  tabPillText: { fontSize: 13, fontFamily: 'mon-sb', color: '#888888' },
  tabPillTextActive: { color: '#FFFFFF' },

  // Notification card
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: 'relative',
  },
  notifCardRead: {
    backgroundColor: '#FAFAFA',
    shadowOpacity: 0.02,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a2540',
  },
  notifIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifBody: { flex: 1 },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notifTitle: { flex: 1, fontSize: 14, fontFamily: 'mon-b', color: '#111111', lineHeight: 19 },
  notifTitleRead: { color: '#444444', fontFamily: 'mon-sb' },
  notifTime: { fontSize: 11, fontFamily: 'mon', color: '#AAAAAA', flexShrink: 0 },
  notifText: { fontSize: 13, fontFamily: 'mon', color: '#444444', lineHeight: 18 },
  notifTextRead: { color: '#888888' },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'mon-b', color: '#111111' },
  emptySub: { fontSize: 14, fontFamily: 'mon', color: '#888888' },
});
