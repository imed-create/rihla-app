import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { MOCK_LISTINGS } from '@/constants/mockListings';

interface PortalProps {
  onSearchAll: () => void;
}

export default function GuidePortal({ onSearchAll }: PortalProps) {
  const { colors } = useTheme();
  
  // State for matchmaker quiz
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [selectedInterest, setSelectedInterest] = useState<string>('Historical');
  const [quizResults, setQuizResults] = useState<any[] | null>(null);

  const guides = useMemo(() => {
    return MOCK_LISTINGS.filter((l) => l.category === 'guide' && l.is_active);
  }, []);

  const handleMatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Filter guides by tags matching interest/language
    const matches = guides.filter((g) => {
      const gMeta = g.metadata.kind === 'guide' ? g.metadata : null;
      const langMatch = gMeta ? gMeta.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase()) : true;
      const tagMatch = g.tags.some(t => t.toLowerCase().includes(selectedInterest.toLowerCase()));
      return langMatch && tagMatch;
    });
    setQuizResults(matches.length > 0 ? matches : guides.slice(0, 2));
  };

  const handleGuidePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/services/guide/${id}` as any);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {/* ── IMMERSIVE HERO CARD ── */}
      <View style={[styles.heroCard, { backgroundColor: '#8B5E3C' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Local Guides & Tour Experts</Text>
          <Text style={styles.heroSubtitle}>Explore Casbah of Algiers, Roman ruins, and Sahara desert with experts.</Text>
        </View>
        <Ionicons name="compass" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBgIcon} />
      </View>

      {/* ── MATCHMAKER WIDGET ── */}
      <View style={[styles.quizBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.quizTitle, { color: colors.text }]}>🎯 Match Me with a Guide</Text>
        <Text style={[styles.quizSubtitle, { color: colors.muted }]}>Choose preferences for instant matching.</Text>

        <View style={styles.quizRow}>
          <View style={styles.quizField}>
            <Text style={[styles.label, { color: colors.text }]}>Preferred Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceScroll}>
              {['English', 'Arabic', 'French'].map((lang) => (
                <TouchableOpacity 
                  key={lang} 
                  style={[styles.choiceChip, selectedLanguage === lang && [styles.choiceChipActive, { backgroundColor: '#8B5E3C' }], { backgroundColor: colors.bg, borderColor: colors.border }]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text style={[styles.choiceText, selectedLanguage === lang ? styles.choiceTextActive : { color: colors.text }]}>{lang}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.quizRow}>
          <View style={styles.quizField}>
            <Text style={[styles.label, { color: colors.text }]}>Primary Interest</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceScroll}>
              {['Historical', 'Sahara', 'Hiking', 'Adventure'].map((interest) => (
                <TouchableOpacity 
                  key={interest} 
                  style={[styles.choiceChip, selectedInterest === interest && [styles.choiceChipActive, { backgroundColor: '#8B5E3C' }], { backgroundColor: colors.bg, borderColor: colors.border }]}
                  onPress={() => setSelectedInterest(interest)}
                >
                  <Text style={[styles.choiceText, selectedInterest === interest ? styles.choiceTextActive : { color: colors.text }]}>{interest}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.matchBtn, { backgroundColor: '#8B5E3C' }]}
          onPress={handleMatch}
        >
          <Text style={styles.matchText}>Find Matched Guides</Text>
          <Ionicons name="sparkles" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ── LISTINGS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {quizResults ? 'Your Matched Experts' : 'Verified Casbah & Desert Guides'}
          </Text>
          {quizResults && (
            <TouchableOpacity onPress={() => setQuizResults(null)}>
              <Text style={[styles.seeAll, { color: '#8B5E3C' }]}>Reset Match</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.list}>
          {(quizResults || guides).map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleGuidePress(item.id)}
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
                    <Ionicons name="language-outline" size={12} color={colors.muted} /> {item.metadata.kind === 'guide' ? item.metadata.languages.join(', ') : 'Arabic, French'}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {item.price_dzd.toLocaleString()} DZD <Text style={styles.priceSub}>/ day</Text>
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
  quizBox: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  quizTitle: {
    fontSize: 15,
    fontFamily: 'mon-b',
  },
  quizSubtitle: {
    fontSize: 11,
    fontFamily: 'mon',
  },
  quizRow: {
    gap: 6,
  },
  quizField: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  choiceScroll: {
    gap: 6,
  },
  choiceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  choiceChipActive: {
    // Applied in render
  },
  choiceText: {
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  choiceTextActive: {
    color: '#FFF',
  },
  matchBtn: {
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  matchText: {
    color: '#FFF',
    fontSize: 13,
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
    color: '#8B5E3C',
  },
  priceSub: {
    fontSize: 10,
    fontFamily: 'mon',
    color: '#666',
  },
});
