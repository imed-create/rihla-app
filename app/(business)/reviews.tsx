import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/pro/ProScreenChrome';

const MOCK_REVIEWS = [
  {
    id: 'r1',
    name: 'Amine',
    rating: 5,
    date: '2 days ago',
    text: 'Great place, super clean and the host was responsive. Would book again.',
  },
  {
    id: 'r2',
    name: 'Sara',
    rating: 4,
    date: '1 week ago',
    text: 'Nice location and comfy beds. Check‑in was smooth.',
  },
];

export default function BusinessReviews() {
  return (
    <ProScreenChrome role="business" title="Reviews" subtitle="What travelers say">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryValue}>—</Text>
            <Text style={styles.summaryLabel}>Average rating</Text>
          </View>
          <View style={styles.summaryRight}>
            <View style={styles.smallPill}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color="#0a2540" />
              <Text style={styles.smallPillText}>Replying soon</Text>
            </View>
            <Text style={styles.muted}>Connect real review data later.</Text>
          </View>
        </View>

        {MOCK_REVIEWS.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.top}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{r.name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={styles.meta}>
                  {stars(r.rating)} · {r.date}
                </Text>
              </View>
            </View>
            <Text style={styles.text}>{r.text}</Text>
          </View>
        ))}
      </ScrollView>
    </ProScreenChrome>
  );
}

function stars(n: number) {
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, Math.max(0, 5 - n));
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLeft: { gap: 2 },
  summaryValue: { fontSize: 26, fontFamily: 'mon-b', color: '#0F172A' },
  summaryLabel: { fontSize: 12, fontFamily: 'mon', color: '#64748B' },
  summaryRight: { alignItems: 'flex-end', gap: 6 },
  smallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  smallPillText: { fontSize: 11, fontFamily: 'mon-sb', color: '#0a2540' },
  muted: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: 'mon-b', color: '#0a2540' },
  name: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  meta: { fontSize: 11, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  text: { fontSize: 12, fontFamily: 'mon', color: '#334155', lineHeight: 17 },
});

