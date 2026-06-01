import React from 'react';
import { ImageBackground, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Destination } from '@/constants/destinations';
import TypeBadge from './TypeBadge';
import { useColors } from '@/hooks/useColors';

interface Props {
  destination: Destination;
}

export default function DestinationCard({ destination }: Props) {
  const colors = useColors();
  const image = DESTINATION_IMAGES[destination.type];

  const handlePress = () => {
    // Navigate to destination/[id] details screen
    router.push(`/destination/${destination.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[styles.card, { borderColor: colors.border }]}
    >
      <ImageBackground source={{ uri: image }} style={styles.image} imageStyle={styles.imageRadius}>
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.72)']}
          locations={[0, 0.45, 1]}
          style={styles.gradient}
        >
        <View style={styles.header}>
          <TypeBadge type={destination.type} />
          
          {destination.flag && (
            <View style={[styles.flagPill, { 
              backgroundColor: destination.flag === 'green' ? '#06D6A0' : destination.flag === 'yellow' ? '#FFD166' : '#EF4444' 
            }]}>
              <View style={styles.flagDot} />
              <Text style={styles.flagText}>
                {destination.flag === 'green' ? 'Safe Swim' : destination.flag === 'yellow' ? 'Caution' : 'Closed'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{destination.name}</Text>
          <Text style={styles.region}>{destination.region}</Text>
          <Text style={styles.tagline} numberOfLines={2}>{destination.tagline}</Text>

          {/* Features pills */}
          <View style={styles.featuresContainer}>
            {destination.features.slice(0, 3).map((feat, i) => (
              <View key={i} style={styles.featureChip}>
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Bar inside gradient card */}
        <View style={styles.footer}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color="#FFD166" />
            <Text style={styles.ratingVal}>{destination.rating}</Text>
            <Text style={styles.reviewsCount}>({destination.reviews} reviews)</Text>
          </View>
          
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Explore</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </View>
        </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const DESTINATION_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  desert: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=80',
  mountain: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  historical: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80',
  city: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
};

const styles = StyleSheet.create({
  card: {
    height: 292,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  image: { flex: 1 },
  imageRadius: { borderRadius: 22 },
  gradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  flagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'mon-sb',
    textTransform: 'uppercase',
  },
  body: {
    marginTop: 'auto',
    marginBottom: 10,
    gap: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: 'mon-b',
    letterSpacing: -0.5,
  },
  region: {
    color: 'rgba(255, 255, 255, 0.84)',
    fontSize: 13,
    fontFamily: 'mon',
    marginTop: -2,
  },
  tagline: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontFamily: 'mon',
    marginTop: 4,
    lineHeight: 18,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  featureChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'mon-sb',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'mon-b',
  },
  reviewsCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontFamily: 'mon',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'mon-sb',
  },
});
