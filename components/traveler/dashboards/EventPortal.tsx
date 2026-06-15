import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function EventPortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();
  const { bookings } = useApp();
  const [selectedCalendar, setSelectedCalendar] = useState<'all' | 'today' | 'weekend'>('all');

  // Find purchased event bookings
  const eventPasses = useMemo(() => {
    return bookings.filter(
      (b) => b.type === 'event' && (b.status === 'confirmed' || b.status === 'active')
    );
  }, [bookings]);

  const events = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'event' && l.is_active);
  }, []);

  const handleEventPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/services/event/${id}` as any);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── TICKETS WALLET ── */}
      {eventPasses.length > 0 && (
        <View style={styles.walletBox}>
          <Text style={styles.walletTitle}>🎫 Digital Ticket Wallet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletScroll}>
            {eventPasses.map((pass) => (
              <View key={pass.id} style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.ticketHeader}>
                  <Ionicons name="qr-code-outline" size={24} color="#A855F7" />
                  <View style={styles.ticketMeta}>
                    <Text style={[styles.ticketName, { color: colors.text }]} numberOfLines={1}>{pass.title}</Text>
                    <Text style={[styles.ticketVenue, { color: colors.muted }]}>{pass.details?.venue || 'Oran Arena'}</Text>
                  </View>
                </View>
                <View style={styles.ticketFooter}>
                  <Text style={styles.ticketTime}>Time: {pass.details?.time || '21:00'} · {pass.details?.date || '15 Jul'}</Text>
                  <TouchableOpacity 
                    style={styles.viewPassBtn}
                    onPress={() => router.push('/(tabs)/trips' as any)}
                  >
                    <Text style={styles.viewPassText}>Open Pass</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── IMMERSIVE EVENT HERO ── */}
      <View style={[styles.heroCard, { backgroundColor: '#A855F7' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Music, Festivals & Cultural Events</Text>
          <Text style={styles.heroSubtitle}>Book tickets to upcoming events, traditional concerts & art shows.</Text>
        </View>
        <Ionicons name="musical-notes" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── CALENDAR FILTER CHIPS ── */}
      <View style={[styles.calendarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { key: 'all', label: 'All Upcoming' },
          { key: 'today', label: 'Tonight' },
          { key: 'weekend', label: 'This Weekend' },
        ].map((item) => (
          <TouchableOpacity 
            key={item.key} 
            style={[styles.calendarTab, selectedCalendar === item.key && [styles.calendarTabActive, { backgroundColor: '#A855F7' }]]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCalendar(item.key as any);
            }}
          >
            <Text style={[styles.calendarLabel, selectedCalendar === item.key ? styles.calendarLabelActive : { color: colors.text }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── EVENTS LIST ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Near You</Text>
          <TouchableOpacity onPress={() => onSearchAll()}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {events.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleEventPress(item.id)}
              activeOpacity={0.88}
            >
              <Image source={{ uri: item.cover_image_url }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={11} color="#FFD166" />
                    <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={1}>{item.description}</Text>
                
                <View style={styles.cardFooter}>
                  <Text style={[styles.cardLoc, { color: colors.muted }]}>
                    <Ionicons name="location-outline" size={12} color={colors.muted} /> {item.wilaya}
                  </Text>
                  <Text style={styles.cardPrice}>
                    From {item.price_dzd.toLocaleString()} DZD
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  walletBox: {
    marginHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  walletTitle: {
    fontSize: 14,
    fontFamily: 'mon-b',
  },
  walletScroll: {
    gap: 10,
  },
  ticketCard: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ticketMeta: {
    flex: 1,
    gap: 2,
  },
  ticketName: {
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  ticketVenue: {
    fontSize: 10,
    fontFamily: 'mon',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  ticketTime: {
    fontSize: 10,
    fontFamily: 'mon-sb',
    color: '#666',
  },
  viewPassBtn: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewPassText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    height: 140,
    justifyContent: 'center',
  },
  heroBgIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  heroContent: {
    maxWidth: '80%',
    zIndex: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'mon-b',
    lineHeight: 26,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'mon',
    marginTop: 6,
    lineHeight: 16,
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
    borderWidth: 1,
  },
  calendarTab: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTabActive: {
    // Dynamic BG applied in render
  },
  calendarLabel: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  calendarLabelActive: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  seeAll: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#A855F7',
  },
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardInfo: {
    padding: 14,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
  cardDesc: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  cardLoc: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  cardPrice: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#A855F7',
  },
});
