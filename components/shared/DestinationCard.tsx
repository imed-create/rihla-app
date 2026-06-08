import React from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Destination } from '@/constants/destinations';
import TypeBadge from './TypeBadge';
import { useColors } from '@/hooks/useColors';
import { RIHLA } from '@/constants/theme';

interface Props {
  destination: Destination;
}

export default function DestinationCard({ destination }: Props) {
  const colors = useColors();
  const image = DESTINATION_IMAGES[destination.type];

  const handlePress = () => {
    router.push(`/destination/${destination.id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.heartButton}>
          <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
        </View>
        
        {destination.flag && (
          <View style={[styles.flagPill, { 
            backgroundColor: destination.flag === 'green' ? '#00A896' : destination.flag === 'yellow' ? '#FFD166' : '#EF4444' 
          }]}>
            <Text style={styles.flagText}>
              {destination.flag === 'green' ? 'Safe Swim' : destination.flag === 'yellow' ? 'Caution' : 'Closed'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{destination.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{destination.region} · {destination.type}</Text>
          <Text style={styles.tagline} numberOfLines={1}>{destination.tagline}</Text>
          <Text style={styles.priceContainer}>
            <Text style={styles.priceVal}>{destination.price_dzd ? `${destination.price_dzd.toLocaleString()} DZD` : 'Free entry'}</Text>
            <Text style={styles.priceUnit}> / day</Text>
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={13} color="#FFD166" style={{ marginTop: -1 }} />
          <Text style={styles.ratingText}>{destination.rating.toFixed(1)}</Text>
        </View>
      </View>
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
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 230,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  flagPill: {
    position: 'absolute',
    left: 14,
    top: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  flagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'mon-sb',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: 'mon-b',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#64748B',
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#94A3B8',
  },
  priceContainer: {
    marginTop: 2,
  },
  priceVal: {
    fontSize: 14,
    fontFamily: 'mon-b',
    color: '#1A1A1A',
  },
  priceUnit: {
    fontSize: 14,
    fontFamily: 'mon',
    color: '#64748B',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 1,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'mon-sb',
    color: '#1A1A1A',
  },
});
