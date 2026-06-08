import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import EmptyState from '@/components/shared/EmptyState';

const CATEGORY_COLORS: Record<string, string> = { starters: '#10B981', mains: '#F59E0B', desserts: '#EC4899', drinks: '#3B82F6' };
const CATEGORY_ICONS: Record<string, string> = { starters: 'leaf-outline', mains: 'restaurant-outline', desserts: 'ice-cream-outline', drinks: 'cafe-outline' };

export default function RestaurantListings() {
  const { assets, getMyAssets } = useBusinessAssets();
  const menuItems = useMemo(() => getMyAssets('restaurant', 'menu-item'), [assets]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...new Set(menuItems.map(i => i.fields.category as string))];
  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter(i => i.fields.category === activeCategory);

  if (menuItems.length === 0) {
    return (
      <View style={{ flex: 1, paddingTop: 12 }}>
        <EmptyState icon="restaurant-outline" title="No menu items yet" subtitle="Add your first menu item to start taking orders." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}><Text style={styles.statValue}>{menuItems.length}</Text><Text style={styles.statLabel}>Items</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={[styles.statValue, { color: '#10B981' }]}>{menuItems.filter(i => i.available).length}</Text><Text style={styles.statLabel}>Available</Text></View>
        <View style={styles.statDiv} />
        <View style={styles.statItem}><Text style={styles.statValue}>{menuItems.reduce((s, i) => s + i.priceDZD, 0).toLocaleString()}</Text><Text style={styles.statLabel}>Total DZD</Text></View>
      </View>

      <FlatList horizontal showsHorizontalScrollIndicator={false} data={categories} keyExtractor={c => c}
        contentContainerStyle={styles.catRow}
        renderItem={({ item: cat }) => (
          <TouchableOpacity style={[styles.catTab, activeCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] || RIHLA.primary, borderColor: CATEGORY_COLORS[cat] || RIHLA.primary }]}
            onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat); }}>
            <Ionicons name={CATEGORY_ICONS[cat] as any || 'grid-outline'} size={14} color={activeCategory === cat ? '#fff' : RIHLA.mutedText} />
            <Text style={[styles.catText, activeCategory === cat && { color: '#fff' }]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList data={filtered} keyExtractor={i => i.id} showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={[styles.itemIcon, { backgroundColor: (CATEGORY_COLORS[item.fields.category] || '#94A3B8') + '18' }]}>
                <Ionicons name={CATEGORY_ICONS[item.fields.category] as any || 'restaurant-outline'} size={18} color={CATEGORY_COLORS[item.fields.category] || '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.nameAr && <Text style={styles.itemNameAr}>{item.nameAr}</Text>}
                <Text style={styles.prepTime}>{item.fields.prepTime || '10'} min prep</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemPrice}>{item.priceDZD.toLocaleString()}</Text>
                <Text style={styles.priceUnit}>DZD</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  statLabel: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText, textAlign: 'center' },
  statDiv: { width: 1, height: 32, backgroundColor: RIHLA.border, marginHorizontal: 4 },
  catRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  catTab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: RIHLA.border },
  catText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  itemCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: RIHLA.border },
  itemRow: { flexDirection: 'row', gap: 12 },
  itemIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  itemNameAr: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 1 },
  prepTime: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText, marginTop: 2 },
  itemRight: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.primary },
  priceUnit: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },
});
