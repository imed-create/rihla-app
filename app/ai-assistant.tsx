/**
 * RIHLA — AI Travel Assistant Screen
 * ────────────────────────────────────
 * Smart suggestions based on user location, preferences, past bookings.
 * Chat-like interface with personalized recommendations.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { useApp } from '@/context/AppContext';
import { useLocationStore } from '@/store/useLocationStore';
import { safeGoBack } from '@/utils/safeNavigation';
import * as Haptics from 'expo-haptics';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestions?: { label: string; listingId?: string; route?: string }[];
  cards?: { id: string; title: string; subtitle: string; category: string; price: number; rating: number; icon: string }[];
};

// AI suggestion logic — generates contextual recommendations
function generateSuggestions(
  userLocation: { latitude: number; longitude: number } | null,
  userName: string,
  pastBookings: number,
  query: string,
): Message {
  const q = query.toLowerCase();
  const hour = new Date().getHours();
  const isEvening = hour >= 18;
  const isMorning = hour < 12;

  // Beach suggestion
  if (q.includes('beach') || q.includes('plage') || q.includes('sea') || q.includes('sun')) {
    const beaches = MOCK_LISTINGS.filter(l => l.category === 'beach' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `🏖️ I found ${beaches.length} beaches near you! Here are the top picks for today:`,
      cards: beaches.map(b => ({ id: b.id, title: b.title, subtitle: b.wilaya, category: 'beach', price: b.price_dzd, rating: b.rating, icon: 'umbrella' })),
    };
  }

  // Hotel suggestion
  if (q.includes('hotel') || q.includes('stay') || q.includes('sleep') || q.includes('room') || q.includes('nuit')) {
    const hotels = MOCK_LISTINGS.filter(l => l.category === 'hotel' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `🏨 Here are some great hotels I recommend:`,
      cards: hotels.map(h => ({ id: h.id, title: h.title, subtitle: h.wilaya, category: 'hotel', price: h.price_dzd, rating: h.rating, icon: 'bed' })),
    };
  }

  // Food suggestion
  if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('hungry') || q.includes('manger')) {
    const restaurants = MOCK_LISTINGS.filter(l => l.category === 'restaurant' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: isEvening ? '🍽️ Dinner time! Check out these restaurants:' : '🍽️ Here are some great places to eat:',
      cards: restaurants.map(r => ({ id: r.id, title: r.title, subtitle: r.wilaya, category: 'restaurant', price: r.price_dzd, rating: r.rating, icon: 'restaurant' })),
    };
  }

  // Ride suggestion
  if (q.includes('ride') || q.includes('driver') || q.includes('car') || q.includes('transport') || q.includes('voiture')) {
    const drivers = MOCK_LISTINGS.filter(l => l.category === 'driver' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `🚗 I found ${drivers.length} drivers nearby:`,
      cards: drivers.map(d => ({ id: d.id, title: d.title, subtitle: d.wilaya, category: 'driver', price: d.price_dzd, rating: d.rating, icon: 'car' })),
    };
  }

  // Adventure / activity
  if (q.includes('activity') || q.includes('adventure') || q.includes('fun') || q.includes('do') || q.includes('activity')) {
    const activities = MOCK_LISTINGS.filter(l => l.category === 'activity' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `🎯 Here are some exciting activities:`,
      cards: activities.map(a => ({ id: a.id, title: a.title, subtitle: a.wilaya, category: 'activity', price: a.price_dzd, rating: a.rating, icon: 'bicycle' })),
    };
  }

  // Guide suggestion
  if (q.includes('guide') || q.includes('tour') || q.includes('visit') || q.includes('explore') || q.includes('visite')) {
    const guides = MOCK_LISTINGS.filter(l => l.category === 'guide' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `🧭 Here are top-rated guides:`,
      cards: guides.map(g => ({ id: g.id, title: g.title, subtitle: g.wilaya, category: 'guide', price: g.price_dzd, rating: g.rating, icon: 'map' })),
    };
  }

  // Default smart suggestions
  const featured = MOCK_LISTINGS.filter(l => l.is_active && l.is_featured);
  const randomPicks = featured.sort(() => Math.random() - 0.5).slice(0, 4);

  const greeting = isEvening ? 'Evening' : isMorning ? 'Morning' : 'Afternoon';

  return {
    id: Date.now().toString(),
    role: 'assistant',
    text: `Good ${greeting}, ${userName || 'traveler'}! 👋\n\nI'm your RIHLA travel assistant. I can help you find:\n\n🏨 Hotels & stays\n🍽️ Restaurants\n🏖️ Beaches\n🚗 Rides\n🧭 Guides & tours\n📸 Photographers\n🎯 Activities\n🎪 Events\n\nJust tell me what you're looking for!`,
    cards: randomPicks.map(c => ({ id: c.id, title: c.title, subtitle: c.wilaya, category: c.category, price: c.price_dzd, rating: c.rating, icon: getCategoryDef(c.category as any)?.icon || 'location' })),
  };
}

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? insets.top + 8 : insets.top;
  const { user, bookings } = useApp();
  const userLocation = useLocationStore((s) => ({ lat: s.userLatitude, lng: s.userLongitude }));
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const userName = user.name?.split(' ')[0] || null;

  // Send initial greeting on mount (useEffect, not render-time mutation)
  React.useEffect(() => {
    const greeting = generateSuggestions(
      userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
      userName || '',
      bookings.length,
      '',
    );
    setMessages([greeting]);
  }, []);

  const handleSend = useCallback(() => {
    const q = input.trim();
    if (!q) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate AI response
    setTimeout(() => {
      const response = generateSuggestions(
        userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
        userName || '',
        bookings.length,
        q,
      );
      setMessages(prev => [...prev, response]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 500);
  }, [input, userLocation, userName, bookings.length]);

  const quickActions = [
    { label: '🏨 Hotels', query: 'Find me a hotel to stay' },
    { label: '🍽️ Restaurants', query: 'Where can I eat?' },
    { label: '🏖️ Beaches', query: 'Show me beaches nearby' },
    { label: '🚗 Rides', query: 'I need a ride' },
    { label: '🧭 Guides', query: 'Find me a local guide' },
    { label: '🎯 Activities', query: 'What activities can I do?' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: '#F8FAFC' }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => safeGoBack()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="sparkles" size={16} color={RIHLA.accent} />
            <Text style={styles.headerTitle}>RIHLA AI</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={msg.role === 'user' ? styles.userMsgWrap : styles.aiMsgWrap}>
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
              )}
              <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={msg.role === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
              </View>
            </View>
          ))}

          {/* Recommendation cards */}
          {messages.length > 0 && messages[messages.length - 1].cards && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {messages[messages.length - 1].cards!.map((card) => {
                const catDef = getCategoryDef(card.category as any);
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={styles.recCard}
                    activeOpacity={0.8}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(`/listing/${card.id}` as any); }}
                  >
                    <View style={[styles.recCardIcon, { backgroundColor: (catDef?.color || RIHLA.primary) + '15' }]}>
                      <Ionicons name={card.icon as any} size={20} color={catDef?.color || RIHLA.primary} />
                    </View>
                    <Text style={styles.recCardTitle} numberOfLines={1}>{card.title}</Text>
                    <Text style={styles.recCardSub} numberOfLines={1}>{card.subtitle}</Text>
                    <View style={styles.recCardBottom}>
                      <View style={styles.recCardRating}>
                        <Ionicons name="star" size={10} color="#FFD166" />
                        <Text style={styles.recCardRatingText}>{card.rating}</Text>
                      </View>
                      <Text style={styles.recCardPrice}>{card.price.toLocaleString()} DZD</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </ScrollView>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {quickActions.map((qa) => (
              <TouchableOpacity
                key={qa.label}
                style={styles.quickChip}
                onPress={() => handleSendWithQuery(qa.query)}
              >
                <Text style={styles.quickChipText}>{qa.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  function handleSendWithQuery(q: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const response = generateSuggestions(
        userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
        userName || '',
        bookings.length,
        q,
      );
      setMessages(prev => [...prev, response]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 500);
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 16, fontFamily: 'mon-b', color: '#0F172A' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: '#DCFCE7' },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' },
  liveText: { fontSize: 9, fontFamily: 'mon-b', color: '#10B981' },

  // Chat
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 8, gap: 12 },

  // Messages
  userMsgWrap: { flexDirection: 'row', justifyContent: 'flex-end' },
  aiMsgWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  messageBubble: { maxWidth: '80%', borderRadius: 16, padding: 14 },
  userBubble: { backgroundColor: RIHLA.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderBottomLeftRadius: 4 },
  userText: { fontSize: 14, fontFamily: 'mon', color: '#FFFFFF', lineHeight: 20 },
  aiText: { fontSize: 14, fontFamily: 'mon', color: '#0F172A', lineHeight: 20 },

  // Recommendation cards
  cardsRow: { paddingLeft: 36, gap: 10, paddingVertical: 4 },
  recCard: { width: 160, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, gap: 6 },
  recCardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recCardTitle: { fontSize: 13, fontFamily: 'mon-b', color: '#0F172A' },
  recCardSub: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },
  recCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  recCardRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  recCardRatingText: { fontSize: 11, fontFamily: 'mon-b', color: '#0F172A' },
  recCardPrice: { fontSize: 12, fontFamily: 'mon-b', color: RIHLA.primary },

  // Quick actions
  quickRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  quickChipText: { fontSize: 13, fontFamily: 'mon-sb', color: '#475569' },

  // Input
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 8, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  input: { flex: 1, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', paddingHorizontal: 16, fontSize: 14, fontFamily: 'mon', color: '#0F172A' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center' },
});
