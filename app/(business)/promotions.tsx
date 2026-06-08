import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';

const PROMOS = [
  {
    id: 'first-week',
    title: 'First week boost',
    desc: 'Get extra visibility for new listings for 7 days.',
    badge: 'Recommended',
    color: '#00a896',
  },
  {
    id: 'weekend-deal',
    title: 'Weekend deal',
    desc: 'Offer a small discount for Friday–Sunday bookings.',
    badge: 'Popular',
    color: '#0a2540',
  },
  {
    id: 'last-minute',
    title: 'Last‑minute offer',
    desc: 'Fill empty nights with time‑limited deals.',
    badge: 'Smart',
    color: '#f4a261',
  },
];

export default function BusinessPromotions() {
  return (
    <ProScreenChrome role="business" title="Promotions" subtitle="Boost visibility & bookings">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Ionicons name="megaphone-outline" size={22} color="#00a896" />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Promotions help you get noticed</Text>
            <Text style={styles.infoSub}>
              Enable offers per listing. Travelers will see the badge on your card.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available promos</Text>
        {PROMOS.map((p) => (
          <TouchableOpacity key={p.id} style={styles.promoCard} activeOpacity={0.9}>
            <View style={[styles.promoIcon, { backgroundColor: p.color + '15' }]}>
              <Ionicons name="sparkles-outline" size={18} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.promoTop}>
                <Text style={styles.promoTitle}>{p.title}</Text>
                <View style={[styles.badge, { backgroundColor: p.color + '15' }]}>
                  <Text style={[styles.badgeText, { color: p.color }]}>{p.badge}</Text>
                </View>
              </View>
              <Text style={styles.promoDesc}>{p.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>
            Next step: we’ll connect these promos to individual listings and pricing rules.
          </Text>
        </View>
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafbfc' },
  content: { padding: 20, paddingBottom: 40, gap: 12 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  infoSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A', marginTop: 6 },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  promoIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  promoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  promoTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  promoDesc: { fontSize: 12, fontFamily: 'mon', color: '#64748B', lineHeight: 16, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 11, fontFamily: 'mon-sb' },
  note: {
    marginTop: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  noteText: { fontSize: 12, fontFamily: 'mon', color: '#6D28D9', lineHeight: 16 },
});

