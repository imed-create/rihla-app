/**
 * RIHLA — Business Reviews (Upgraded)
 * ─────────────────────────────────────
 * PROMPTFULL §Tab 4: Star Ratings & Guest Reviews Engine
 * Shows rating distribution, review cards, and response functionality.
 * Uses data from AppContext bookings + business assets store.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import { useApp } from '@/context/AppContext';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { showToast } from '@/components/Toast';

const MOCK_REVIEWS = [
  { id: 'r1', name: 'Karim B.', rating: 4, date: '2 days ago', text: 'Excellent location and very clean rooms. The staff was incredibly helpful. Would definitely come back!', avatarColor: '#1A6B3A', responded: false },
  { id: 'r2', name: 'Sara M.', rating: 5, date: '1 week ago', text: 'Amazing experience! The hotel exceeded my expectations. The breakfast was delicious and the view was stunning.', avatarColor: '#6366F1', responded: true, response: 'Thank you Sara! We are thrilled you enjoyed your stay. Hope to welcome you again soon.' },
  { id: 'r3', name: 'Amine K.', rating: 3, date: '2 weeks ago', text: 'Good location but the room was a bit smaller than expected. The WiFi was spotty in the room.', avatarColor: '#F59E0B', responded: false },
  { id: 'r4', name: 'Yasmine L.', rating: 5, date: '3 weeks ago', text: 'Perfect for families! The kids loved the pool and the staff were so friendly and accommodating.', avatarColor: '#A855F7', responded: false },
  { id: 'r5', name: 'Mohamed H.', rating: 4, date: '1 month ago', text: 'Great value for money. Clean, comfortable, and the check-in process was smooth.', avatarColor: '#0a2540', responded: true, response: 'Thank you Mohamed! We appreciate your feedback.' },
];

const FILTERS = ['All', '5 ★', '4 ★', '3 ★', '2 ★', '1 ★', 'Unresponded'] as const;

export default function BusinessReviews() {
  const { user, bookings } = useApp();
  const { getAssetCount } = useBusinessAssets();
  const [filter, setFilter] = useState<string>('All');
  const [responseInput, setResponseInput] = useState<Record<string, string>>({});
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set(['r2', 'r5']));

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as any) : null;
  const color = catDef?.color ?? '#0a2540';
  const hasListings = getAssetCount(businessType) > 0;

  // Calculate stats from mock reviews + real bookings count
  const stats = useMemo(() => {
    const total = MOCK_REVIEWS.length;
    const sum = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0);
    const avg = total > 0 ? (sum / total).toFixed(1) : '—';
    const distribution = [0, 0, 0, 0, 0];
    MOCK_REVIEWS.forEach(r => { if (r.rating >= 1 && r.rating <= 5) distribution[5 - r.rating]++; });
    return { total, avg: Number(avg), distribution, responded: respondedIds.size, pending: total - respondedIds.size };
  }, [respondedIds]);

  const filteredReviews = useMemo(() => {
    if (filter === 'All') return MOCK_REVIEWS;
    if (filter === 'Unresponded') return MOCK_REVIEWS.filter(r => !respondedIds.has(r.id));
    const rating = parseInt(filter);
    return MOCK_REVIEWS.filter(r => r.rating === rating);
  }, [filter, respondedIds]);

  const handleRespond = (id: string) => {
    const text = responseInput[id]?.trim();
    if (!text) {
      Alert.alert('Response required', 'Please write a response before replying.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRespondedIds(prev => new Set([...prev, id]));
    setResponseInput(prev => ({ ...prev, [id]: '' }));
    showToast('Response posted successfully!', 'success');
  };

  if (!hasListings) {
    return (
      <ProScreenChrome role="business" title="Reviews" subtitle="What travelers say">
        <View style={styles.emptyWrap}>
          <Ionicons name="star-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySub}>Once you publish listings and receive bookings, guest reviews will appear here.</Text>
        </View>
      </ProScreenChrome>
    );
  }

  return (
    <ProScreenChrome role="business" title="Reviews" subtitle={`${stats.total} total reviews`}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rating summary */}
        <View style={styles.summary}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.summaryValue, { color }]}>{stats.avg}</Text>
            <Text style={styles.summaryLabel}>Average rating</Text>
            <View style={styles.summaryStars}>
              {[1, 2, 3, 4, 5].map(s => (
                <Ionicons key={s} name={s <= Math.round(stats.avg) ? 'star' : 'star-outline'} size={14} color="#FFD166" />
              ))}
            </View>
            <Text style={styles.summaryTotal}>{stats.total} reviews</Text>
          </View>
          <View style={styles.summaryRight}>
            <StatPill label="Responded" value={String(stats.responded)} color="#10B981" />
            <StatPill label="Pending" value={String(stats.pending)} color="#F59E0B" />
          </View>
        </View>

        {/* Rating distribution */}
        <View style={styles.distCard}>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.distribution[5 - rating];
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <View key={rating} style={styles.distRow}>
                <Text style={styles.distLabel}>{rating} ★</Text>
                <View style={styles.distBar}>
                  <View style={[styles.distFill, { width: `${pct}%`, backgroundColor: rating >= 4 ? '#10B981' : rating === 3 ? '#F59E0B' : '#EF4444' }]} />
                </View>
                <Text style={styles.distCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && { backgroundColor: color }]}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
            >
              <Text style={[styles.filterChipText, filter === f && { color: '#fff' }]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Review cards */}
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyReviews}>
            <Ionicons name="search-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyReviewsText}>No reviews matching this filter</Text>
          </View>
        ) : (
          filteredReviews.map(r => {
            const isResponded = respondedIds.has(r.id);
            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.top}>
                  <View style={[styles.avatar, { backgroundColor: r.avatarColor + '18' }]}>
                    <Text style={[styles.avatarText, { color: r.avatarColor }]}>{r.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{r.name}</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={12} color="#FFD166" />
                      ))}
                      <Text style={styles.date}> · {r.date}</Text>
                    </View>
                  </View>
                  {isResponded && (
                    <View style={styles.respondedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      <Text style={styles.respondedText}>Replied</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.text}>{r.text}</Text>

                {/* Owner response */}
                {isResponded && r.response && (
                  <View style={styles.responseCard}>
                    <View style={styles.responseTop}>
                      <Ionicons name="business-outline" size={14} color={color} />
                      <Text style={[styles.responseLabel, { color }]}>Your response</Text>
                    </View>
                    <Text style={styles.responseText}>{r.response}</Text>
                  </View>
                )}

                {/* Respond input */}
                {!isResponded && (
                  <View style={styles.respondSection}>
                    <TextInput
                      style={styles.respondInput}
                      value={responseInput[r.id] || ''}
                      onChangeText={t => setResponseInput(prev => ({ ...prev, [r.id]: t }))}
                      placeholder="Write a public response..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={2}
                    />
                    <Pressable
                      style={[styles.respondBtn, { backgroundColor: color }]}
                      onPress={() => handleRespond(r.id)}
                    >
                      <Text style={styles.respondBtnText}>Reply</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statPill, { backgroundColor: color + '12' }]}>
      <Text style={[styles.statPillValue, { color }]}>{value}</Text>
      <Text style={[styles.statPillLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 12 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#64748B' },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center', lineHeight: 19 },

  // Summary
  summary: {
    backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0',
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 12,
  },
  summaryLeft: { gap: 4 },
  summaryValue: { fontSize: 36, fontFamily: 'mon-b' },
  summaryLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  summaryStars: { flexDirection: 'row', gap: 1 },
  summaryTotal: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginTop: 2 },
  summaryRight: { gap: 8, justifyContent: 'center' },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  statPillValue: { fontSize: 16, fontFamily: 'mon-b' },
  statPillLabel: { fontSize: 10, fontFamily: 'mon-sb' },

  // Distribution
  distCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, gap: 8 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distLabel: { width: 32, fontSize: 12, fontFamily: 'mon-sb', color: '#0F172A' },
  distBar: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 4 },
  distCount: { width: 24, fontSize: 12, fontFamily: 'mon-sb', color: '#64748B', textAlign: 'right' },

  // Filters
  filterRow: { gap: 8, paddingVertical: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F1F5F9' },
  filterChipText: { fontSize: 12, fontFamily: 'mon-sb', color: '#6B7280' },

  // Empty
  emptyReviews: { alignItems: 'center', padding: 32, gap: 8 },
  emptyReviewsText: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8' },

  // Review cards
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 10,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontFamily: 'mon-b' },
  name: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  date: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8', marginLeft: 4 },
  respondedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F0FDF4' },
  respondedText: { fontSize: 10, fontFamily: 'mon-sb', color: '#059669' },
  text: { fontSize: 12, fontFamily: 'mon', color: '#334155', lineHeight: 17 },

  // Response
  responseCard: {
    backgroundColor: '#F8FAFC', borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#0a2540',
    padding: 12, marginTop: 4, gap: 6,
  },
  responseTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  responseLabel: { fontSize: 11, fontFamily: 'mon-sb' },
  responseText: { fontSize: 12, fontFamily: 'mon', color: '#475569', lineHeight: 16 },

  // Respond section
  respondSection: { gap: 8, marginTop: 4 },
  respondInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 13, fontFamily: 'mon', minHeight: 50, textAlignVertical: 'top' },
  respondBtn: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  respondBtnText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
});
