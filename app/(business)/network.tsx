/**
 * RIHLA — Partner Network
 * ───────────────────────
 * Discover verified providers across Algeria and build referral
 * partnerships with them. Candidates come from the real marketplace
 * catalogue; connections persist in useNetworkStore.
 */

import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  Field,
  type IonName,
  Panel,
  PRO,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
  StatusPill,
} from '@/components/pro/ProKit';
import { showToast } from '@/components/Toast';
import { getCategoryDef, MARKETPLACE_CATEGORIES } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { useApp } from '@/context/AppContext';
import { hapticLight, hapticSuccess } from '@/utils/haptics';
import { useNetworkStore } from '@/store/useNetworkStore';
import type { MarketplaceCategory } from '@/types/service';

const TABS = ['Discover', 'My network', 'Requests'] as const;
type Tab = (typeof TABS)[number];

export default function BusinessNetwork() {
  const { user } = useApp();
  const { connections, connect, disconnect, isConnected, getByStatus } = useNetworkStore();
  const [tab, setTab] = useState<Tab>('Discover');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MarketplaceCategory | 'all'>('all');

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as MarketplaceCategory) : null;
  const color = catDef?.color ?? PRO.navy;
  const myWilaya = user.kycData?.wilaya ?? user.wilaya ?? '';

  /** Everyone in the catalogue except the owner's own category. */
  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_LISTINGS.filter((l) => {
      if (l.category === businessType) return false;
      if (categoryFilter !== 'all' && l.category !== categoryFilter) return false;
      if (!q) return true;
      return l.title.toLowerCase().includes(q) || l.wilaya.toLowerCase().includes(q);
    })
      // Same-wilaya partners first — they're the ones worth referring to.
      .sort((a, b) => {
        const aLocal = a.wilaya === myWilaya ? 1 : 0;
        const bLocal = b.wilaya === myWilaya ? 1 : 0;
        if (aLocal !== bLocal) return bLocal - aLocal;
        return b.rating - a.rating;
      })
      .slice(0, 24);
  }, [query, categoryFilter, businessType, myWilaya]);

  const accepted = getByStatus('accepted');
  const pending = getByStatus('pending');

  const localPartners = useMemo(
    () => accepted.filter((c) => c.wilaya === myWilaya).length,
    [accepted, myWilaya]
  );

  const handleConnect = (listingId: string) => {
    const listing = MOCK_LISTINGS.find((l) => l.id === listingId);
    if (!listing) return;
    if (isConnected(listingId)) {
      disconnect(listingId);
      showToast(`Removed ${listing.title} from your network`, 'info');
      return;
    }
    connect({
      partnerId: listing.id,
      name: listing.title,
      category: listing.category,
      wilaya: listing.wilaya,
      rating: listing.rating,
      status: 'pending',
    });
    hapticSuccess();
    showToast(`Partnership request sent to ${listing.title}`, 'success');
  };

  return (
    <ProScreenChrome role="business" title="Partner Network" subtitle="Find & collaborate with locals">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StatGrid>
          <StatCard icon="git-network-outline" label="Partners" value={String(accepted.length)} color={color} />
          <StatCard icon="paper-plane-outline" label="Pending" value={String(pending.length)} color={PRO.amber} />
          <StatCard icon="location-outline" label="In your wilaya" value={String(localPartners)} color={PRO.green} hint={myWilaya || 'Set your wilaya'} />
          <StatCard icon="people-outline" label="Total reach" value={String(connections.length)} color={PRO.blue} />
        </StatGrid>

        <Segmented options={TABS} value={tab} onChange={setTab} color={color} />

        {tab === 'Discover' && (
          <>
            <Field label="Search providers" value={query} onChangeText={setQuery} placeholder="Name or wilaya…" icon="search-outline" autoCapitalize="none" />

            <View style={styles.chipWrap}>
              <Pressable
                style={[styles.chip, categoryFilter === 'all' && { backgroundColor: color, borderColor: color }]}
                onPress={() => { hapticLight(); setCategoryFilter('all'); }}
              >
                <Text style={[styles.chipText, categoryFilter === 'all' && styles.chipTextActive]}>All</Text>
              </Pressable>
              {MARKETPLACE_CATEGORIES.filter((c) => c.key !== businessType).map((c) => {
                const active = categoryFilter === c.key;
                return (
                  <Pressable
                    key={c.key}
                    style={[styles.chip, active && { backgroundColor: c.color, borderColor: c.color }]}
                    onPress={() => { hapticLight(); setCategoryFilter(active ? 'all' : c.key); }}
                  >
                    <Ionicons name={c.icon as IonName} size={13} color={active ? '#FFFFFF' : PRO.muted} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionTitle>{`${candidates.length} provider${candidates.length === 1 ? '' : 's'}`}</SectionTitle>

            {candidates.length === 0 ? (
              <Panel><Text style={styles.note}>No providers match your search.</Text></Panel>
            ) : (
              <View style={styles.rows}>
                {candidates.map((listing) => {
                  const def = getCategoryDef(listing.category);
                  const connected = isConnected(listing.id);
                  const isLocal = listing.wilaya === myWilaya;
                  return (
                    <View key={listing.id} style={styles.partnerCard}>
                      <View style={[styles.partnerIcon, { backgroundColor: (def?.color ?? PRO.navy) + '15' }]}>
                        <Ionicons name={(def?.icon ?? 'business-outline') as IonName} size={20} color={def?.color ?? PRO.navy} />
                      </View>
                      <Pressable
                        style={styles.partnerBody}
                        onPress={() => { hapticLight(); router.push(`/listing/${listing.id}`); }}
                      >
                        <Text style={styles.partnerName} numberOfLines={1}>{listing.title}</Text>
                        <View style={styles.partnerMeta}>
                          <Ionicons name="star" size={11} color={PRO.gold} />
                          <Text style={styles.partnerMetaText}>{listing.rating.toFixed(1)}</Text>
                          <Text style={styles.dot}>·</Text>
                          <Text style={styles.partnerMetaText}>{listing.wilaya}</Text>
                          {isLocal ? <View style={styles.localBadge}><Text style={styles.localBadgeText}>Local</Text></View> : null}
                        </View>
                        <Text style={styles.partnerCat}>{def?.label ?? listing.category}</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.connectBtn, connected ? styles.connectBtnOn : { backgroundColor: color }]}
                        onPress={() => { hapticLight(); handleConnect(listing.id); }}
                      >
                        <Ionicons
                          name={connected ? 'checkmark' : 'add'}
                          size={16}
                          color={connected ? PRO.green : '#FFFFFF'}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {tab === 'My network' && (
          accepted.length === 0 ? (
            <EmptyBlock
              icon="git-network-outline"
              title="No partners yet"
              subtitle="Connect with hotels, guides and drivers near you. Referrals between partners earn both sides a share of the booking."
              actionLabel="Discover providers"
              color={color}
              onAction={() => setTab('Discover')}
            />
          ) : (
            <>
              <SectionTitle>Active partnerships</SectionTitle>
              <View style={styles.rows}>
                {accepted.map((c) => {
                  const def = getCategoryDef(c.category as MarketplaceCategory);
                  return (
                    <View key={c.partnerId} style={styles.partnerCard}>
                      <View style={[styles.partnerIcon, { backgroundColor: (def?.color ?? PRO.navy) + '15' }]}>
                        <Ionicons name={(def?.icon ?? 'business-outline') as IonName} size={20} color={def?.color ?? PRO.navy} />
                      </View>
                      <View style={styles.partnerBody}>
                        <Text style={styles.partnerName} numberOfLines={1}>{c.name}</Text>
                        <Text style={styles.partnerCat}>{def?.label ?? c.category} · {c.wilaya}</Text>
                      </View>
                      <StatusPill label="Connected" color={PRO.green} />
                    </View>
                  );
                })}
              </View>
              <Panel title="How referrals work">
                <Text style={styles.note}>
                  When you refer a traveller to a partner, both businesses earn 3% of the resulting booking value.
                  Referral credit settles with your normal monthly payout.
                </Text>
              </Panel>
            </>
          )
        )}

        {tab === 'Requests' && (
          pending.length === 0 ? (
            <EmptyBlock
              icon="paper-plane-outline"
              title="No pending requests"
              subtitle="Partnership requests you send or receive will appear here while they await a response."
              color={color}
            />
          ) : (
            <>
              <SectionTitle>Awaiting response</SectionTitle>
              <View style={styles.rows}>
                {pending.map((c) => {
                  const def = getCategoryDef(c.category as MarketplaceCategory);
                  return (
                    <View key={c.partnerId} style={styles.partnerCard}>
                      <View style={[styles.partnerIcon, { backgroundColor: (def?.color ?? PRO.navy) + '15' }]}>
                        <Ionicons name={(def?.icon ?? 'business-outline') as IonName} size={20} color={def?.color ?? PRO.navy} />
                      </View>
                      <View style={styles.partnerBody}>
                        <Text style={styles.partnerName} numberOfLines={1}>{c.name}</Text>
                        <Text style={styles.partnerCat}>{def?.label ?? c.category} · {c.wilaya}</Text>
                      </View>
                      <Pressable
                        style={styles.cancelBtn}
                        onPress={() => { hapticLight(); disconnect(c.partnerId); showToast('Request withdrawn', 'info'); }}
                      >
                        <Text style={styles.cancelBtnText}>Withdraw</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  rows: { gap: 10 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  chipText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  chipTextActive: { color: '#FFFFFF' },

  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  partnerIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  partnerBody: { flex: 1, gap: 3 },
  partnerName: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  partnerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  partnerMetaText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
  partnerCat: { fontSize: 11, fontFamily: 'mon', color: PRO.subtle },
  dot: { fontSize: 12, color: PRO.subtle },
  localBadge: { marginLeft: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: '#ECFDF5' },
  localBadgeText: { fontSize: 10, fontFamily: 'mon-b', color: PRO.green },

  connectBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  connectBtnOn: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: PRO.sunken },
  cancelBtnText: { fontSize: 12, fontFamily: 'mon-sb', color: PRO.muted },
});
