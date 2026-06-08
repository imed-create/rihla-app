import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

interface FleetItem {
  id: string;
  name: string;
  type: string;
  status: 'ready' | 'active' | 'maintenance';
  guest: string | null;
  returnDate: string | null;
  image: string;
}

const INITIAL_FLEET: FleetItem[] = [
  { id: '1', name: 'Yamaha Quad Raptor 700', type: 'Buggy/Quad', status: 'ready', guest: null, returnDate: null, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300' },
  { id: '2', name: 'Land Cruiser V8 Sahara', type: '4x4 Vehicle', status: 'active', guest: 'Mohamed Lakhdar', returnDate: 'June 9, 18:00', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300' },
  { id: '3', name: 'Premium Camping Tent Set x4', type: 'Desert Gear', status: 'ready', guest: null, returnDate: null, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300' },
  { id: '4', name: 'GoPro Hero 11 Black Creator Kit', type: 'Camera Gear', status: 'maintenance', guest: null, returnDate: null, image: 'https://images.unsplash.com/photo-1565849906661-09d665e5e8e4?w=300' },
];

export default function AssetInventoryList() {
  const [fleet, setFleet] = useState<FleetItem[]>(INITIAL_FLEET);

  const activeRentals = fleet.filter(f => f.status === 'active').length;
  const readyFleet = fleet.filter(f => f.status === 'ready').length;
  const maintenanceFleet = fleet.filter(f => f.status === 'maintenance').length;

  const toggleStatus = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFleet(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatusMap: Record<string, 'ready' | 'active' | 'maintenance'> = {
          ready: 'active',
          active: 'maintenance',
          maintenance: 'ready',
        };
        const nextStatus = nextStatusMap[item.status];
        return {
          ...item,
          status: nextStatus,
          guest: nextStatus === 'active' ? 'Demo Guest' : null,
          returnDate: nextStatus === 'active' ? 'Tomorrow 12:00' : null,
        };
      }
      return item;
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── BENTO TOP ROW METRICS ── */}
      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, { flex: 1.5 }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="key-outline" size={20} color={RIHLA.accent} />
            <Text style={styles.metricTitle}>Out on Lease</Text>
          </View>
          <Text style={styles.metricVal}>{activeRentals}</Text>
          <Text style={styles.metricSub}>Active leases</Text>
        </View>

        <View style={[styles.bentoCard, { flex: 1.5 }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text style={styles.metricTitle}>Free Fleet</Text>
          </View>
          <Text style={styles.metricVal}>{readyFleet}</Text>
          <Text style={styles.metricSub}>Ready for pickup</Text>
        </View>

        <View style={[styles.bentoCard, { flex: 2 }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="construct-outline" size={20} color={RIHLA.highlight} />
            <Text style={styles.metricTitle}>In Service</Text>
          </View>
          <Text style={styles.metricVal}>{maintenanceFleet}</Text>
          <Text style={styles.metricSub}>Down for repair</Text>
        </View>
      </View>

      {/* ── FLEET LIST ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Fleet Inventory</Text>
        <Text style={styles.sectionSubtitle}>Tap card badge to manually toggle status checks</Text>

        <View style={styles.fleetList}>
          {fleet.map(item => {
            let badgeColor = '#EF4444';
            let badgeBg = '#FEF2F2';
            let badgeText = 'Maintenance';

            if (item.status === 'ready') {
              badgeColor = '#10B981';
              badgeBg = '#ECFDF5';
              badgeText = 'Ready';
            } else if (item.status === 'active') {
              badgeColor = RIHLA.primary;
              badgeBg = RIHLA.primary + '10';
              badgeText = 'Active Lease';
            }

            return (
              <View key={item.id} style={styles.fleetCard}>
                <Image source={{ uri: item.image }} style={styles.fleetImg} />
                <View style={styles.fleetInfo}>
                  <View style={styles.fleetHeader}>
                    <Text style={styles.fleetType}>{item.type}</Text>
                    <Pressable
                      style={[styles.statusBadge, { backgroundColor: badgeBg }]}
                      onPress={() => toggleStatus(item.id)}
                    >
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{badgeText}</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.fleetName}>{item.name}</Text>
                  
                  {item.status === 'active' && item.guest ? (
                    <View style={styles.leaseBox}>
                      <Ionicons name="person-outline" size={12} color={RIHLA.mutedText} />
                      <Text style={styles.leaseText}>{item.guest} · Return: {item.returnDate}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 24 },
  bentoGrid: { flexDirection: 'row', gap: 10 },
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 8,
  },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricTitle: { fontSize: 11, fontFamily: 'mon-sb', color: RIHLA.mutedText },
  metricVal: { fontSize: 24, fontFamily: 'mon-b', color: RIHLA.dark },
  metricSub: { fontSize: 9, fontFamily: 'mon', color: RIHLA.mutedText },

  section: { gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: RIHLA.dark },
  sectionSubtitle: { fontSize: 12, fontFamily: 'mon', color: RIHLA.mutedText },

  fleetList: { gap: 12, marginTop: 8 },
  fleetCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  fleetImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F1F5F9' },
  fleetInfo: { flex: 1, gap: 4 },
  fleetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fleetType: { fontSize: 10, fontFamily: 'mon-sb', color: RIHLA.mutedText, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontFamily: 'mon-sb' },
  fleetName: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.dark },
  
  leaseBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  leaseText: { fontSize: 10, fontFamily: 'mon', color: RIHLA.mutedText },
});
