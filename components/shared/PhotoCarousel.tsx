/**
 * RIHLA — Premium Photo Carousel
 * --------------------------------
 * Airbnb/Booking.com-style horizontal image gallery with dot indicators,
 * photo count badge, and smooth snap scrolling.
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

type PhotoCarouselProps = {
  photos: string[];
  height?: number;
  borderRadius?: number;
  showCount?: boolean;
  onPhotoPress?: (index: number) => void;
  topPad?: number;
};

export default function PhotoCarousel({
  photos,
  height = 340,
  borderRadius = 0,
  showCount = true,
  onPhotoPress,
  topPad = 0,
}: PhotoCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const handleScroll = useCallback((e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    setActiveIndex(idx);
  }, []);

  if (!photos || photos.length === 0) {
    return (
      <View style={[styles.placeholder, { height, paddingTop: topPad }]}>
        <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.3)" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: height + topPad }]}>
      {/* Photo scroll */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_W}
        contentContainerStyle={{ paddingTop: topPad }}
      >
        {photos.map((uri, i) => (
          <Pressable
            key={`${uri}-${i}`}
            style={[styles.slide, { width: SCREEN_W, height }]}
            onPress={() => onPhotoPress?.(i)}
          >
            {/* Loading skeleton */}
            {!loaded[i] && !errors[i] && (
              <View style={[styles.skeleton, { height, borderRadius }]}>
                <ActivityIndicator color="rgba(255,255,255,0.3)" />
              </View>
            )}
            {/* Error state */}
            {errors[i] && (
              <View style={[styles.errorSlide, { height, borderRadius }]}>
                <Ionicons name="image-outline" size={36} color="rgba(255,255,255,0.25)" />
              </View>
            )}
            {/* Actual image */}
            <Image
              source={{ uri }}
              style={[
                styles.image,
                { height, borderRadius },
                (!loaded[i] || errors[i]) && styles.imageHidden,
              ]}
              resizeMode="cover"
              onLoad={() => setLoaded((p) => ({ ...p, [i]: true }))}
              onError={() => setErrors((p) => ({ ...p, [i]: true }))}
            />
          </Pressable>
        ))}
      </ScrollView>

      {/* Photo count badge (top-right) */}
      {showCount && photos.length > 1 && (
        <View style={[styles.countBadge, { top: topPad + 14 }]}>
          <Ionicons name="camera-outline" size={13} color="#fff" />
          <Text style={styles.countText}>{activeIndex + 1}/{photos.length}</Text>
        </View>
      )}

      {/* Dot indicators (≤12 photos) */}
      {photos.length > 1 && photos.length <= 12 && (
        <View style={styles.dotsContainer} pointerEvents="none">
          {photos.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Line indicator for many photos */}
      {photos.length > 12 && (
        <View style={styles.lineContainer} pointerEvents="none">
          <View style={styles.lineTrack}>
            <View
              style={[
                styles.lineFill,
                { width: `${((activeIndex + 1) / photos.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
  },
  slide: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    backgroundColor: '#0D0D0D',
  },
  imageHidden: {
    opacity: 0,
    position: 'absolute',
  },
  skeleton: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorSlide: {
    width: '100%',
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Count badge
  countBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  countText: {
    fontSize: 12,
    fontFamily: 'mon-sb',
    color: '#fff',
  },

  // Dots
  dotsContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderRadius: 999,
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  // Line indicator
  lineContainer: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  lineTrack: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  lineFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#fff',
  },
});
