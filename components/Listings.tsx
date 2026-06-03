import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { defaultStyles } from '@/constants/Styles';
import type { AirbnbListing } from '@/types/airbnb-listing';

interface Props {
  listings: AirbnbListing[];
  refresh: number;
  category: string;
}

const Listings = ({ listings: items, refresh, category }: Props) => {
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (refresh) listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [refresh]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 200);
  }, [category]);

  const renderRow: ListRenderItem<AirbnbListing> = ({ item }) => (
    <Link href={`/listing/${item.id}`} asChild>
      <TouchableOpacity activeOpacity={0.92}>
        <Animated.View style={styles.listing} entering={FadeInRight} exiting={FadeOutLeft}>
          <Animated.Image source={{ uri: item.medium_url }} style={styles.image} />
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={15} color="#1a1a1a" />
              <Text style={styles.rating}>{item.review_scores_rating / 20}</Text>
            </View>
          </View>
          <Text style={styles.meta}>{item.room_type}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>EUR {item.price}</Text>
            <Text style={styles.night}>night</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={defaultStyles.container}>
      <BottomSheetFlatList
        renderItem={renderRow}
        data={loading ? [] : items}
        ref={listRef}
        ListHeaderComponent={<Text style={styles.info}>{items.length} homes</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listing: {
    padding: 10,
    gap: 8,
    marginVertical: 10,
    marginHorizontal: 8,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  image: { width: '100%', height: 300, borderRadius: 18 },
  heartBtn: {
    position: 'absolute',
    right: 24,
    top: 24,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  name: { flex: 1, fontSize: 16, fontFamily: 'mon-sb', color: '#1a1a1a' },
  ratingRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  rating: { fontFamily: 'mon-sb', color: '#1a1a1a' },
  meta: { fontFamily: 'mon', color: '#888888' },
  priceRow: { flexDirection: 'row', gap: 4 },
  price: { fontFamily: 'mon-sb', color: '#1a1a1a' },
  night: { fontFamily: 'mon', color: '#888888' },
  info: { textAlign: 'center', fontFamily: 'mon-sb', fontSize: 16, marginTop: 4, color: '#1a1a1a' },
});

export default Listings;
