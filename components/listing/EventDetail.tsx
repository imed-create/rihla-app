/**
 * RIHLA — Event Detail Screen
 * Concerts, festivals, shows
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { getListingById } from '@/constants/mockListings';
import type { EventMetadata } from '@/types/service';
import { useFavorites } from '@/store/useFavorites';
import { safeGoBack } from '@/utils/safeNavigation';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

function daysUntil(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86400000));
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 67 : insets.top;
  const { favoriteIds, toggleFavorite } = useFavorites();
  const listing = useMemo(() => getListingById(id ?? ''), [id]);
  const isFavorite = favoriteIds.includes(id ?? '');
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [ticketQty, setTicketQty] = useState(1);

  if (!listing || listing.category !== 'event') {
    return (
      <View style={[styles.root, { paddingTop: topPad + 40 }]}>
        <View style={styles.notFound}>
          <Ionicons name="musical-notes-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundText}>Event not found</Text>
          <Pressable onPress={() => safeGoBack()}><Text style={{ fontSize: 14, fontFamily: 'mon-sb', color: RIHLA.accent }}>← Go back</Text></Pressable>
        </View>
      </View>
    );
  }

  const m = listing.metadata as EventMetadata;
  const daysLeft = daysUntil(m.event_date);
  const selectedTicketObj = selectedTicket !== null ? m.ticket_types[selectedTicket] : null;

  return (
    <View style={[styles.root, { backgroundColor: RIHLA.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          <LinearGradient colors={['#7C3AED', RIHLA.primary]} style={styles.hero}>
            <View style={styles.heroNav}>
              <Pressable style={styles.backCircle} onPress={() => safeGoBack()}><Ionicons name="arrow-back" size={22} color="#fff" /></Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.actionCircle}><Ionicons name="share-outline" size={20} color="#fff" /></Pressable>
                <Pressable style={styles.actionCircle} onPress={() => { hapticLight(); toggleFavorite(listing.id); }}>
                  <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? '#FF499E' : '#fff'} />
                </Pressable>
              </View>
            </View>
            <View style={styles.heroContent}>
              <View style={styles.countdownPill}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.countdownText}>{daysLeft} days away</Text>
              </View>
              <Text style={styles.heroTitle}>{listing.title}</Text>
              <Text style={styles.heroLocation}>{listing.wilaya}, Algeria</Text>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color="#FFD166" />
                <Text style={styles.heroRatingText}>{listing.rating}</Text>
                <Text style={styles.heroReviewCount}>({listing.review_count} reviews)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Event info */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={18} color={RIHLA.accent} />
            <View><Text style={styles.infoLabel}>Date</Text><Text style={styles.infoValue}>{m.event_date}</Text></View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={18} color={RIHLA.accent} />
            <View><Text style={styles.infoLabel}>Time</Text><Text style={styles.infoValue}>{m.start_time} – {m.end_time}</Text></View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={18} color={RIHLA.accent} />
            <View><Text style={styles.infoLabel}>Venue</Text><Text style={styles.infoValue}>{m.venue}</Text></View>
          </View>
        </View>

        {m.age_restriction && (
          <View style={styles.agePill}>
            <Ionicons name="alert-circle-outline" size={16} color="#7C3AED" />
            <Text style={styles.ageText}>Age restriction: {m.age_restriction}</Text>
          </View>
        )}

        {/* Tickets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Ticket Type</Text>
          <View style={styles.ticketList}>
            {m.ticket_types.map((ticket, i) => (
              <Pressable key={i}
                style={[styles.ticketCard, selectedTicket === i && styles.ticketSelected]}
                onPress={() => { setSelectedTicket(i); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <View style={styles.ticketLeft}>
                  <Text style={styles.ticketName}>{ticket.name}</Text>
                  <Text style={styles.ticketAvail}>{ticket.quantity} available</Text>
                </View>
                <Text style={styles.ticketPrice}>{ticket.price_dzd.toLocaleString()} DZD</Text>
                {selectedTicket === i && <Ionicons name="checkmark-circle" size={20} color={RIHLA.accent} />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quantity */}
        {selectedTicket !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable style={styles.qtyBtn} onPress={() => setTicketQty(Math.max(1, ticketQty - 1))}><Ionicons name="remove" size={18} color={RIHLA.primary} /></Pressable>
              <Text style={styles.qtyCount}>{ticketQty}</Text>
              <Pressable style={styles.qtyBtn} onPress={() => setTicketQty(Math.min(10, ticketQty + 1))}><Ionicons name="add" size={18} color={RIHLA.primary} /></Pressable>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewHeader}><Ionicons name="star" size={18} color="#FFD166" /><Text style={styles.sectionTitle}>{listing.rating} · {listing.review_count} reviews</Text></View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{selectedTicketObj ? (selectedTicketObj.price_dzd * ticketQty).toLocaleString() + ' DZD' : 'Select ticket'}</Text>
          {selectedTicketObj && <Text style={styles.bottomUnit}>{ticketQty} × {selectedTicketObj.price_dzd.toLocaleString()} DZD</Text>}
        </View>
        <Pressable style={[styles.bookBtn, selectedTicket === null && { opacity: 0.5 }]}
          onPress={() => { if (selectedTicket === null) { showToast('Select a ticket type', 'info'); return; } hapticSuccess(); const t = m.ticket_types[selectedTicket]; router.push(`/checkout/${listing.id}?price=${t.price_dzd}&qty=${ticketQty}` as any); }}>
          <Text style={styles.bookBtnText}>Get Tickets</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: 'mon-sb', color: '#64748B' },
  heroWrap: { overflow: 'hidden' },
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  heroNav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', gap: 10 },
  actionCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heroContent: { gap: 4 },
  countdownPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countdownText: { fontSize: 11, fontFamily: 'mon-sb', color: '#fff' },
  heroTitle: { fontSize: 28, fontFamily: 'mon-b', color: '#fff', letterSpacing: -0.5 },
  heroLocation: { fontSize: 14, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroRatingText: { fontSize: 14, fontFamily: 'mon-b', color: '#fff' },
  heroReviewCount: { fontSize: 12, fontFamily: 'mon', color: 'rgba(255,255,255,0.7)' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 14 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 10, fontFamily: 'mon-sb', color: '#94A3B8' },
  infoValue: { fontSize: 12, fontFamily: 'mon-b', color: RIHLA.dark },
  infoDivider: { width: 1, height: 30, backgroundColor: RIHLA.border, marginHorizontal: 8 },
  agePill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: '#F5F3FF' },
  ageText: { fontSize: 12, fontFamily: 'mon-sb', color: '#7C3AED' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark, marginBottom: 12 },
  description: { fontSize: 14, fontFamily: 'mon', color: '#64748B', lineHeight: 22 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketList: { gap: 10 },
  ticketCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: RIHLA.border, padding: 16 },
  ticketSelected: { borderColor: RIHLA.accent, backgroundColor: '#F0FDFA' },
  ticketLeft: { flex: 1 },
  ticketName: { fontSize: 15, fontFamily: 'mon-b', color: RIHLA.dark },
  ticketAvail: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', marginTop: 2 },
  ticketPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary, marginRight: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: RIHLA.border, padding: 16 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: RIHLA.border, alignItems: 'center', justifyContent: 'center' },
  qtyCount: { fontSize: 22, fontFamily: 'mon-b', color: RIHLA.dark, minWidth: 30, textAlign: 'center' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingHorizontal: 20, paddingTop: 14, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: RIHLA.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 12 },
  bottomPrice: { fontSize: 18, fontFamily: 'mon-b', color: RIHLA.primary },
  bottomUnit: { fontSize: 11, fontFamily: 'mon', color: '#94A3B8' },
  bookBtn: { backgroundColor: '#7C3AED', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  bookBtnText: { fontSize: 15, fontFamily: 'mon-b', color: '#fff' },
});
