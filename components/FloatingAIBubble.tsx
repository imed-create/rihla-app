/**
 * RIHLA — Floating AI Bubble
 * ──────────────────────────
 * Draggable intercom-style floating chat bubble.
 * Grab and move anywhere on screen. Tap to open chat panel.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Pressable, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  withTiming, runOnJS, interpolate, Extrapolate,
  useAnimatedReaction, cancelAnimation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RIHLA } from '@/constants/theme';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLocationStore } from '@/store/useLocationStore';
import { useAIBubbleStore } from '@/store/useAIBubbleStore';
import { useShallow } from 'zustand/shallow';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BUBBLE_SIZE = 56;
const DRAG_THRESHOLD = 10;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  cards?: { id: string; title: string; subtitle: string; category: string; price: number; rating: number; icon: string }[];
};

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

  if (q.includes('beach') || q.includes('plage') || q.includes('sea') || q.includes('sun')) {
    const beaches = MOCK_LISTINGS.filter(l => l.category === 'beach' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Found ${beaches.length} beaches near you!`,
      cards: beaches.map(b => ({ id: b.id, title: b.title, subtitle: b.wilaya, category: 'beach', price: b.price_dzd, rating: b.rating, icon: 'umbrella' })),
    };
  }

  if (q.includes('hotel') || q.includes('stay') || q.includes('sleep') || q.includes('room') || q.includes('nuit')) {
    const hotels = MOCK_LISTINGS.filter(l => l.category === 'hotel' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Here are some great hotels:`,
      cards: hotels.map(h => ({ id: h.id, title: h.title, subtitle: h.wilaya, category: 'hotel', price: h.price_dzd, rating: h.rating, icon: 'bed' })),
    };
  }

  if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('hungry') || q.includes('manger')) {
    const restaurants = MOCK_LISTINGS.filter(l => l.category === 'restaurant' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: isEvening ? 'Dinner time! Check these out:' : 'Great places to eat:',
      cards: restaurants.map(r => ({ id: r.id, title: r.title, subtitle: r.wilaya, category: 'restaurant', price: r.price_dzd, rating: r.rating, icon: 'restaurant' })),
    };
  }

  if (q.includes('ride') || q.includes('driver') || q.includes('car') || q.includes('transport') || q.includes('voiture')) {
    const drivers = MOCK_LISTINGS.filter(l => l.category === 'driver' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Found ${drivers.length} drivers nearby:`,
      cards: drivers.map(d => ({ id: d.id, title: d.title, subtitle: d.wilaya, category: 'driver', price: d.price_dzd, rating: d.rating, icon: 'car' })),
    };
  }

  if (q.includes('activity') || q.includes('adventure') || q.includes('fun') || q.includes('do')) {
    const activities = MOCK_LISTINGS.filter(l => l.category === 'activity' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Exciting activities near you:`,
      cards: activities.map(a => ({ id: a.id, title: a.title, subtitle: a.wilaya, category: 'activity', price: a.price_dzd, rating: a.rating, icon: 'bicycle' })),
    };
  }

  if (q.includes('guide') || q.includes('tour') || q.includes('visit') || q.includes('explore') || q.includes('visite')) {
    const guides = MOCK_LISTINGS.filter(l => l.category === 'guide' && l.is_active).slice(0, 3);
    return {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Top-rated guides:`,
      cards: guides.map(g => ({ id: g.id, title: g.title, subtitle: g.wilaya, category: 'guide', price: g.price_dzd, rating: g.rating, icon: 'map' })),
    };
  }

  const featured = MOCK_LISTINGS.filter(l => l.is_active && l.is_featured);
  const randomPicks = featured.sort(() => Math.random() - 0.5).slice(0, 3);

  return {
    id: Date.now().toString(),
    role: 'assistant',
    text: `Bonjour, traveler! 🗺️ How can I help you explore Algeria today?`,
    cards: randomPicks.map(c => ({ id: c.id, title: c.title, subtitle: c.wilaya, category: c.category, price: c.price_dzd, rating: c.rating, icon: getCategoryDef(c.category as any)?.icon || 'location' })),
  };
}

export default function FloatingAIBubble() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, bookings } = useApp();
  const userLocation = useLocationStore(useShallow((s) => ({ lat: s.userLatitude, lng: s.userLongitude })));
  const shouldOpen = useAIBubbleStore((s) => s.shouldOpen);
  const consumeTrigger = useAIBubbleStore((s) => s.consumeTrigger);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const userName = user.name?.split(' ')[0] || null;

  const { colors } = useTheme();

  const dyn = useMemo(() => ({
    chatPanel: { backgroundColor: colors.card },
    chatHeader: { borderBottomColor: colors.border },
    chatHeaderTitle: { color: colors.text },
    closeBtn: { backgroundColor: colors.bg },
    aiBubble: { backgroundColor: colors.bg, borderColor: colors.border },
    aiMsgText: { color: colors.text },
    recCard: { backgroundColor: colors.card, borderColor: colors.border },
    recCardTitle: { color: colors.text },
    recCardSub: { color: colors.muted },
    quickChip: { backgroundColor: colors.bg, borderColor: colors.border },
    quickChipText: { color: colors.text },
    inputRow: { borderTopColor: colors.border },
    chatInput: { backgroundColor: colors.bg, color: colors.text },
  }), [colors]);

  // Drag position shared values
  const translateX = useSharedValue(SCREEN_W - BUBBLE_SIZE - 20);
  const translateY = useSharedValue(SCREEN_H - BUBBLE_SIZE - insets.bottom - 100);
  const prevX = useSharedValue(SCREEN_W - BUBBLE_SIZE - 20);
  const prevY = useSharedValue(SCREEN_H - BUBBLE_SIZE - insets.bottom - 100);
  const isDragging = useSharedValue(false);

  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Show bubble with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Listen for external open triggers (e.g. from quick action button)
  useEffect(() => {
    if (shouldOpen && !isOpen) {
      consumeTrigger();
      handleOpen();
    }
  }, [shouldOpen]);

  const snapToEdge = useCallback(() => {
    'worklet';
    const midpoint = SCREEN_W / 2;
    const snappedX = translateX.value < midpoint
      ? 12  // snap left
      : SCREEN_W - BUBBLE_SIZE - 12;  // snap right
    translateX.value = withSpring(snappedX, { damping: 20, stiffness: 200 });
    prevX.value = snappedX;
  }, []);

  const handleOpen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOpen(true);
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 200 });

    if (messages.length === 0) {
      const greeting = generateSuggestions(
        userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
        userName || '',
        bookings.length,
        '',
      );
      setMessages([greeting]);
    }
  }, [messages.length, userLocation, userName, bookings.length]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.8, { damping: 15 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setIsOpen)(false);
      scale.value = withSpring(1, { damping: 12 });
    });
  }, []);

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      isDragging.value = true;
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      prevX.value = translateX.value;
      prevY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newX = prevX.value + e.translationX;
      const newY = prevY.value + e.translationY;
      // Clamp to screen bounds
      translateX.value = Math.max(4, Math.min(SCREEN_W - BUBBLE_SIZE - 4, newX));
      translateY.value = Math.max(insets.top + 4, Math.min(SCREEN_H - BUBBLE_SIZE - insets.bottom - 4, newY));
    })
    .onEnd((e) => {
      isDragging.value = false;
      const distance = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      if (distance < 8) {
        runOnJS(handleOpen)();
      } else {
        const midpoint = SCREEN_W / 2;
        const snappedX = translateX.value < midpoint
          ? 12
          : SCREEN_W - BUBBLE_SIZE - 12;
        translateX.value = withSpring(snappedX, { damping: 20, stiffness: 200 });
        prevX.value = snappedX;
        prevY.value = translateY.value;
      }
    });

  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (opacity.value === 0 && !isOpen) return null;

  return (
    <>
      {/* Chat Panel Overlay */}
      {isOpen && (
        <Animated.View style={[styles.overlay, { opacity: interpolate(opacity.value, [0, 1], [0, 1], Extrapolate.CLAMP) }]}>
          <Pressable style={styles.overlayBackdrop} onPress={handleClose} />
          <KeyboardAvoidingView
            style={[styles.chatPanel, dyn.chatPanel, { paddingBottom: insets.bottom + 8 }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Header */}
            <View style={[styles.chatHeader, dyn.chatHeader]}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.aiAvatarSmall}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.chatHeaderTitle, dyn.chatHeaderTitle]}>RIHLA AI</Text>
                  <View style={styles.chatHeaderBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, dyn.closeBtn]}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((msg) => (
                <View key={msg.id} style={msg.role === 'user' ? styles.userMsgWrap : styles.aiMsgWrap}>
                  {msg.role === 'assistant' && (
                    <View style={styles.aiAvatarTiny}>
                      <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                    </View>
                  )}
                  <View style={[styles.msgBubble, msg.role === 'user' ? styles.userBubble : [styles.aiBubble, dyn.aiBubble]]}>
                    <Text style={msg.role === 'user' ? styles.userMsgText : [styles.aiMsgText, dyn.aiMsgText]}>{msg.text}</Text>
                  </View>
                </View>
              ))}

              {messages.length > 0 && messages[messages.length - 1].cards && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
                  {messages[messages.length - 1].cards!.map((card) => {
                    const catDef = getCategoryDef(card.category as any);
                    return (
                      <TouchableOpacity
                        key={card.id}
                        style={[styles.recCard, dyn.recCard]}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          handleClose();
                          let routePath = `/services/${card.category}/${card.id}`;
                          if (card.category === 'ride') {
                            routePath = '/services/ride';
                          } else if (card.category === 'driver') {
                            routePath = '/services/coming-soon?name=Driver';
                          } else if (card.category === 'activity') {
                            routePath = '/services/coming-soon?name=Activity';
                          }
                          setTimeout(() => router.push(routePath as any), 300);
                        }}
                      >
                        <View style={[styles.recCardIcon, { backgroundColor: (catDef?.color || RIHLA.primary) + '15' }]}>
                          <Ionicons name={card.icon as any} size={13} color={catDef?.color || RIHLA.primary} />
                        </View>
                        <Text style={[styles.recCardTitle, dyn.recCardTitle]} numberOfLines={1}>{card.title}</Text>
                        <Text style={[styles.recCardSub, dyn.recCardSub]} numberOfLines={1}>{card.subtitle}</Text>
                        <Text style={styles.recCardPrice}>{card.price.toLocaleString()} DZD</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </ScrollView>

            {messages.length <= 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
                {[
                  { label: 'Hotels', query: 'Find me a hotel to stay' },
                  { label: 'Restaurants', query: 'Where can I eat?' },
                  { label: 'Beaches', query: 'Show me beaches nearby' },
                  { label: 'Rides', query: 'I need a ride' },
                  { label: 'Guides', query: 'Find me a local guide' },
                ].map((qa) => (
                  <TouchableOpacity
                    key={qa.label}
                    style={[styles.quickChip, dyn.quickChip]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const userMsg: Message = { id: Date.now().toString(), role: 'user', text: qa.query };
                      setMessages(prev => [...prev, userMsg]);
                      setTimeout(() => {
                        const response = generateSuggestions(
                          userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
                          userName || '', bookings.length, qa.query,
                        );
                        setMessages(prev => [...prev, response]);
                        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                      }, 500);
                    }}
                  >
                    <Text style={[styles.quickChipText, dyn.quickChipText]}>{qa.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={[styles.inputRow, dyn.inputRow]}>
              <TextInput
                style={[styles.chatInput, dyn.chatInput]}
                placeholder="Ask me anything..."
                placeholderTextColor={colors.muted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => {
                  const q = input.trim();
                  if (!q) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
                  setMessages(prev => [...prev, userMsg]);
                  setInput('');
                  setTimeout(() => {
                    const response = generateSuggestions(
                      userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
                      userName || '', bookings.length, q,
                    );
                    setMessages(prev => [...prev, response]);
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                  }, 500);
                }}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, !input.trim() && { opacity: 0.4 }]}
                onPress={() => {
                  const q = input.trim();
                  if (!q) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
                  setMessages(prev => [...prev, userMsg]);
                  setInput('');
                  setTimeout(() => {
                    const response = generateSuggestions(
                      userLocation.lat && userLocation.lng ? { latitude: userLocation.lat, longitude: userLocation.lng } : null,
                      userName || '', bookings.length, q,
                    );
                    setMessages(prev => [...prev, response]);
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                  }, 500);
                }}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* Draggable Floating Bubble */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.bubble, bubbleAnimStyle]}>
          <View style={styles.bubbleBtn}>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 9999,
  },
  bubbleBtn: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: RIHLA.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
    elevation: 9998,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  chatPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatarSmall: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center',
  },
  chatHeaderTitle: { fontSize: 15, fontFamily: 'mon-b', color: '#0F172A' },
  chatHeaderBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#10B981' },
  liveText: { fontSize: 9, fontFamily: 'mon-b', color: '#10B981' },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },

  chatScroll: { flex: 1 },
  chatScrollContent: { padding: 14, paddingBottom: 4, gap: 10 },

  userMsgWrap: { flexDirection: 'row', justifyContent: 'flex-end' },
  aiMsgWrap: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  aiAvatarTiny: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: RIHLA.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  msgBubble: { maxWidth: '78%', borderRadius: 14, padding: 12 },
  userBubble: { backgroundColor: RIHLA.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderBottomLeftRadius: 4 },
  userMsgText: { fontSize: 13, fontFamily: 'mon', color: '#FFFFFF', lineHeight: 18 },
  aiMsgText: { fontSize: 13, fontFamily: 'mon', color: '#0F172A', lineHeight: 18 },

  cardsRow: { paddingLeft: 28, gap: 8, paddingVertical: 4 },
  recCard: {
    width: 120, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#E2E8F0', padding: 8, gap: 3,
  },
  recCardIcon: { width: 26, height: 26, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  recCardTitle: { fontSize: 10, fontFamily: 'mon-b', color: '#0F172A' },
  recCardSub: { fontSize: 9, fontFamily: 'mon', color: '#64748B' },
  recCardPrice: { fontSize: 10, fontFamily: 'mon-b', color: RIHLA.primary, marginTop: 1 },

  quickRow: { paddingHorizontal: 14, gap: 6, paddingVertical: 6 },
  quickChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0',
  },
  quickChipText: { fontSize: 12, fontFamily: 'mon-sb', color: '#475569' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4,
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  chatInput: {
    flex: 1, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9',
    paddingHorizontal: 14, fontSize: 13, fontFamily: 'mon', color: '#0F172A',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: RIHLA.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
