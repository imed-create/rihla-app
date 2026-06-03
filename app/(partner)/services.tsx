import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePartnerServices } from '@/store/usePartnerServices';
import { useApp } from '@/context/AppContext';
import ProTabShell from '@/components/pro/ProTabShell';
import { SAHEL } from '@/constants/Colors';
import { showToast } from '@/components/Toast';
import { hapticLight, hapticSuccess } from '@/utils/haptics';

export default function PartnerServices() {
  const { services } = usePartnerServices();
  const { serviceRequests, updateServiceRequestStatus } = useApp();

  const pendingRequests = useMemo(
    () => serviceRequests.filter((r) => r.status === 'pending'),
    [serviceRequests]
  );

  const accept = (id: string) => {
    hapticSuccess();
    updateServiceRequestStatus(id, 'confirmed');
    showToast('Request accepted', 'success');
  };

  const reject = (id: string) => {
    hapticLight();
    updateServiceRequestStatus(id, 'cancelled');
    showToast('Request declined', 'info');
  };

  const addBtn = (
    <TouchableOpacity
      style={styles.addBtn}
      onPress={() => router.push('/(partner)/services/new' as any)}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={18} color="#fff" />
      <Text style={styles.addBtnText}>New</Text>
    </TouchableOpacity>
  );

  const requestsHeader =
    pendingRequests.length > 0 ? (
      <View style={styles.requestsBlock}>
        <Text style={styles.requestsTitle}>Incoming requests</Text>
        {pendingRequests.map((r) => (
          <View key={r.id} style={styles.requestCard}>
            <View style={styles.requestLeft}>
              <Ionicons name="person-circle-outline" size={28} color={SAHEL.highlight} />
              <View style={{ flex: 1 }}>
                <Text style={styles.requestName}>{r.customerName}</Text>
                <Text style={styles.requestSub}>
                  {r.serviceType} · {r.totalDZD.toLocaleString()} DZD
                </Text>
              </View>
            </View>
            <View style={styles.requestActions}>
              <Pressable style={styles.rejectBtn} onPress={() => reject(r.id)}>
                <Ionicons name="close" size={18} color={SAHEL.mutedText} />
              </Pressable>
              <Pressable style={styles.acceptBtn} onPress={() => accept(r.id)}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    ) : null;

  return (
    <ProTabShell role="partner" title="My Services" subtitle="Fleet & availability" headerRight={addBtn}>
      {services.length === 0 ? (
        <View style={styles.empty}>
          {requestsHeader}
          <Ionicons name="cube-outline" size={52} color={SAHEL.accent} />
          <Text style={styles.emptyText}>No services yet</Text>
          <Text style={styles.emptySub}>
            Add what you rent out (jet skis, buggies, camels…) and start earning.
          </Text>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push('/(partner)/services/new' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color={SAHEL.highlight} />
            <Text style={styles.primaryCtaText}>Create a service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={requestsHeader}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/(partner)/services/${item.id}` as any)}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name="flash-outline" size={18} color={SAHEL.highlight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardSub} numberOfLines={1}>
                    {labelCategory(item.category)} · {prettyAsset(item.assetType)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.price}>{item.pricePerHourDzd.toLocaleString()} DA/h</Text>
                <View style={[styles.statusPill, pillStyle(item.status)]}>
                  <Text style={[styles.statusText, pillTextStyle(item.status)]}>
                    {item.status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ProTabShell>
  );
}

function labelCategory(cat: string) {
  const map: Record<string, string> = {
    beach: 'Beach',
    desert: 'Desert',
    mountain: 'Mountain',
    city: 'City',
    historical: 'Historical',
    other: 'Other',
  };
  return map[cat] ?? 'Other';
}

function prettyAsset(s: string) {
  return (s || 'asset').replace(/-/g, ' ');
}

function pillStyle(status: string) {
  if (status === 'published') return { backgroundColor: '#ECFDF5' };
  if (status === 'paused') return { backgroundColor: '#FEF3C7' };
  return { backgroundColor: '#F1F5F9' };
}

function pillTextStyle(status: string) {
  if (status === 'published') return { color: SAHEL.highlight };
  if (status === 'paused') return { color: '#B45309' };
  return { color: '#64748B' };
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SAHEL.highlight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  requestsBlock: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 10 },
  requestsTitle: { fontSize: 15, fontFamily: 'mon-b', color: SAHEL.dark },
  requestCard: {
    backgroundColor: SAHEL.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SAHEL.border,
    padding: 12,
    gap: 10,
  },
  requestLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requestName: { fontSize: 14, fontFamily: 'mon-b', color: SAHEL.dark },
  requestSub: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
  requestActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SAHEL.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    backgroundColor: SAHEL.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  acceptText: { fontSize: 13, fontFamily: 'mon-b', color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 14, fontFamily: 'mon-b', color: '#0F172A' },
  cardSub: { fontSize: 12, fontFamily: 'mon', color: '#64748B', marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 12, fontFamily: 'mon-b', color: '#0F172A' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 11, fontFamily: 'mon-sb', textTransform: 'capitalize' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontFamily: 'mon-sb', color: SAHEL.highlight },
  emptySub: { fontSize: 13, fontFamily: 'mon', color: '#94A3B8', textAlign: 'center' },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  primaryCtaText: { fontSize: 13, fontFamily: 'mon-b', color: SAHEL.highlight },
});
