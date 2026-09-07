/**
 * RIHLA — Marketplace Insights
 * ────────────────────────────
 * Where the owner sits against the rest of the RIHLA catalogue: price
 * position in their category, demand by wilaya, competitor pricing and
 * what travellers are searching for.
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProScreenChrome from '@/components/dashboard/ScreenChrome';
import {
  EmptyBlock,
  HeroStat,
  type IonName,
  Panel,
  PRO,
  ProgressBar,
  SectionTitle,
  Segmented,
  StatCard,
  StatGrid,
  StatusPill,
} from '@/components/pro/ProKit';
import { getCategoryDef } from '@/constants/marketplaceCategories';
import { MOCK_LISTINGS } from '@/constants/mockListings';
import { useApp } from '@/context/AppContext';
import { useBusinessAssets } from '@/store/useBusinessAssets';
import type { MarketplaceCategory } from '@/types/service';

const LENSES = ['Pricing', 'Demand', 'Competitors'] as const;
type Lens = (typeof LENSES)[number];

/** Seasonal demand weighting for Algerian travel — coast peaks in summer. */
const SEASON_DEMAND: { month: string; index: number }[] = [
  { month: 'Jan', index: 32 },
  { month: 'Feb', index: 30 },
  { month: 'Mar', index: 41 },
  { month: 'Apr', index: 55 },
  { month: 'May', index: 68 },
  { month: 'Jun', index: 88 },
  { month: 'Jul', index: 100 },
  { month: 'Aug', index: 97 },
  { month: 'Sep', index: 72 },
  { month: 'Oct', index: 52 },
  { month: 'Nov', index: 38 },
  { month: 'Dec', index: 44 },
];

const TOP_SEARCHES: { term: string; growth: number }[] = [
  { term: 'beach spot Tipaza', growth: 34 },
  { term: 'riad Constantine', growth: 21 },
  { term: 'sahara 3 days', growth: 18 },
  { term: 'airport transfer Algiers', growth: 12 },
  { term: 'seafood Bejaia', growth: 9 },
  { term: 'paragliding Djurdjura', growth: -4 },
];

function formatDZD(value: number): string {
  return `${Math.round(value).toLocaleString('en-US')} DZD`;
}

export default function MarketplaceInsights() {
  const { user } = useApp();
  const { assets, getMyAssets } = useBusinessAssets();
  const [lens, setLens] = useState<Lens>('Pricing');

  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const catDef = businessType ? getCategoryDef(businessType as MarketplaceCategory) : null;
  const color = catDef?.color ?? PRO.navy;
  const myWilaya = user.kycData?.wilaya ?? user.wilaya ?? '';

  const myAssets = useMemo(() => getMyAssets(businessType), [businessType, assets, getMyAssets]);

  const myAvgPrice = useMemo(
    () => (myAssets.length > 0 ? myAssets.reduce((s, a) => s + a.priceDZD, 0) / myAssets.length : 0),
    [myAssets]
  );

  /** The rest of the catalogue in the same category — the real comparison set. */
  const peers = useMemo(
    () => MOCK_LISTINGS.filter((l) => l.category === businessType),
    [businessType]
  );

  const market = useMemo(() => {
    if (peers.length === 0) {
      return { avg: 0, min: 0, max: 0, avgRating: 0, position: 0, cheaperThan: 0 };
    }
    const prices = peers.map((p) => p.price_dzd);
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    const cheaperThan = myAvgPrice > 0 ? prices.filter((p) => p > myAvgPrice).length : 0;
    return {
      avg,
      min: Math.min(...prices),
      max: Math.max(...prices),
      avgRating: peers.reduce((s, p) => s + p.rating, 0) / peers.length,
      position: myAvgPrice > 0 ? Math.round((myAvgPrice / avg) * 100) : 0,
      cheaperThan,
    };
  }, [peers, myAvgPrice]);

  /** How many listings each wilaya has in this category — a proxy for supply. */
  const wilayaSupply = useMemo(() => {
    const counts = new Map<string, { count: number; avgPrice: number; total: number }>();
    peers.forEach((p) => {
      const entry = counts.get(p.wilaya) ?? { count: 0, avgPrice: 0, total: 0 };
      entry.count += 1;
      entry.total += p.price_dzd;
      entry.avgPrice = entry.total / entry.count;
      counts.set(p.wilaya, entry);
    });
    return [...counts.entries()]
      .map(([wilaya, data]) => ({ wilaya, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [peers]);

  const maxSupply = wilayaSupply.length > 0 ? wilayaSupply[0].count : 1;
  const peakMonth = SEASON_DEMAND.reduce((best, m) => (m.index > best.index ? m : best), SEASON_DEMAND[0]);

  const pricePosition: { label: string; color: string } = useMemo(() => {
    if (myAvgPrice === 0) return { label: 'Not priced', color: PRO.subtle };
    if (market.position > 120) return { label: 'Premium', color: PRO.violet };
    if (market.position > 95) return { label: 'Above market', color: PRO.blue };
    if (market.position > 75) return { label: 'Competitive', color: PRO.green };
    return { label: 'Budget', color: PRO.amber };
  }, [market.position, myAvgPrice]);

  if (!catDef) {
    return (
      <ProScreenChrome role="business" title="Marketplace Insights" subtitle="Trends, demand & competition">
        <ScrollView contentContainerStyle={styles.content}>
          <EmptyBlock
            icon="trending-up-outline"
            title="Set your business category"
            subtitle="Insights compare you against other providers in your category. Complete your business profile to unlock them."
          />
        </ScrollView>
      </ProScreenChrome>
    );
  }

  return (
    <ProScreenChrome role="business" title="Marketplace Insights" subtitle="Trends, demand & competition">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Category header ── */}
        <HeroStat
          label={`${catDef.label} market`}
          value={formatDZD(market.avg)}
          caption={`Average price across ${peers.length} ${catDef.labelPlural.toLowerCase()} on RIHLA · range ${formatDZD(market.min)} – ${formatDZD(market.max)}`}
          color={color}
          icon={catDef.icon as IonName}
        />

        <StatGrid>
          <StatCard
            icon="pricetag-outline"
            label="Your average"
            value={myAvgPrice > 0 ? formatDZD(myAvgPrice) : '—'}
            color={color}
            hint={myAvgPrice > 0 ? `${market.position}% of market` : 'Add inventory'}
          />
          <StatCard
            icon="star-outline"
            label="Category rating"
            value={market.avgRating.toFixed(1)}
            color={PRO.gold}
            hint="average across providers"
          />
          <StatCard
            icon="business-outline"
            label="Competitors"
            value={String(peers.length)}
            color={PRO.blue}
            hint={`${wilayaSupply.length} wilayas`}
          />
          <StatCard
            icon="flame-outline"
            label="Peak month"
            value={peakMonth.month}
            color={PRO.red}
            hint={`${peakMonth.index}% demand index`}
          />
        </StatGrid>

        <Segmented options={LENSES} value={lens} onChange={setLens} color={color} />

        {/* ── Pricing ── */}
        {lens === 'Pricing' && (
          <>
            <Panel title="Your price position" badge={pricePosition.label} accent={pricePosition.color}>
              {myAvgPrice === 0 ? (
                <Text style={styles.note}>Add inventory with prices to see where you sit against the market.</Text>
              ) : (
                <>
                  <View style={styles.scaleRow}>
                    <Text style={styles.scaleEdge}>{formatDZD(market.min)}</Text>
                    <Text style={styles.scaleEdge}>{formatDZD(market.max)}</Text>
                  </View>
                  <View style={styles.scaleTrack}>
                    <View
                      style={[
                        styles.scaleMarker,
                        {
                          left: `${Math.max(0, Math.min(96, ((myAvgPrice - market.min) / Math.max(market.max - market.min, 1)) * 100))}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.scaleAvg,
                        { left: `${Math.max(0, Math.min(98, ((market.avg - market.min) / Math.max(market.max - market.min, 1)) * 100))}%` },
                      ]}
                    />
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: color }]} />
                      <Text style={styles.note}>You · {formatDZD(myAvgPrice)}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: PRO.subtle }]} />
                      <Text style={styles.note}>Market · {formatDZD(market.avg)}</Text>
                    </View>
                  </View>
                  <Text style={styles.note}>
                    You price below {market.cheaperThan} of {peers.length} providers in your category.
                    {market.position > 110
                      ? ' Premium positioning works when your rating stays above the category average.'
                      : market.position < 80
                        ? ' There is room to raise prices without leaving the competitive band.'
                        : ' This sits comfortably in the competitive band.'}
                  </Text>
                </>
              )}
            </Panel>

            <Panel title="What travellers are searching">
              {TOP_SEARCHES.map((s) => (
                <View key={s.term} style={styles.searchRow}>
                  <Ionicons name="search-outline" size={14} color={PRO.subtle} />
                  <Text style={styles.searchTerm} numberOfLines={1}>{s.term}</Text>
                  <View style={[styles.growthPill, { backgroundColor: (s.growth >= 0 ? PRO.green : PRO.red) + '15' }]}>
                    <Ionicons
                      name={s.growth >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={10}
                      color={s.growth >= 0 ? PRO.green : PRO.red}
                    />
                    <Text style={[styles.growthText, { color: s.growth >= 0 ? PRO.green : PRO.red }]}>
                      {Math.abs(s.growth)}%
                    </Text>
                  </View>
                </View>
              ))}
            </Panel>
          </>
        )}

        {/* ── Demand ── */}
        {lens === 'Demand' && (
          <>
            <Panel title="Seasonal demand index" badge="12 months">
              <View style={styles.chart}>
                {SEASON_DEMAND.map((m) => {
                  const isPeak = m.month === peakMonth.month;
                  return (
                    <View key={m.month} style={styles.chartCol}>
                      <View style={styles.chartBarWrap}>
                        <View
                          style={[
                            styles.chartBar,
                            { height: `${m.index}%`, backgroundColor: isPeak ? color : color + '45' },
                          ]}
                        />
                      </View>
                      <Text style={[styles.chartLabel, isPeak && { color: PRO.text, fontFamily: 'mon-b' }]}>
                        {m.month}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text style={styles.note}>
                Demand peaks in {peakMonth.month}. Open your calendar and raise prices 3–4 weeks before the peak,
                when travellers start booking.
              </Text>
            </Panel>

            <SectionTitle>Supply by wilaya</SectionTitle>
            <Panel>
              {wilayaSupply.map((w) => {
                const isMine = w.wilaya === myWilaya;
                return (
                  <View key={w.wilaya} style={styles.supplyRow}>
                    <View style={styles.supplyHead}>
                      <View style={styles.supplyNameWrap}>
                        <Text style={[styles.supplyName, isMine && { color, fontFamily: 'mon-b' }]}>{w.wilaya}</Text>
                        {isMine ? <StatusPill label="You" color={color} /> : null}
                      </View>
                      <Text style={styles.supplyValue}>
                        {w.count} · {formatDZD(w.avgPrice)}
                      </Text>
                    </View>
                    <ProgressBar pct={(w.count / maxSupply) * 100} color={isMine ? color : PRO.subtle} height={6} />
                  </View>
                );
              })}
              <Text style={styles.note}>
                Fewer providers means less competition — but also thinner traveller traffic. The sweet spot is a
                wilaya with high demand and mid supply.
              </Text>
            </Panel>
          </>
        )}

        {/* ── Competitors ── */}
        {lens === 'Competitors' && (
          <>
            <SectionTitle>Top rated in your category</SectionTitle>
            <View style={styles.rows}>
              {[...peers]
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 8)
                .map((p, index) => {
                  const cheaper = myAvgPrice > 0 && p.price_dzd > myAvgPrice;
                  return (
                    <View key={p.id} style={styles.compCard}>
                      <View style={[styles.rankBadge, { backgroundColor: index < 3 ? color : PRO.sunken }]}>
                        <Text style={[styles.rankText, index < 3 && { color: '#FFFFFF' }]}>{index + 1}</Text>
                      </View>
                      <View style={styles.compBody}>
                        <Text style={styles.compName} numberOfLines={1}>{p.title}</Text>
                        <View style={styles.compMeta}>
                          <Ionicons name="star" size={11} color={PRO.gold} />
                          <Text style={styles.compMetaText}>{p.rating.toFixed(1)}</Text>
                          <Text style={styles.dot}>·</Text>
                          <Text style={styles.compMetaText}>{p.review_count} reviews</Text>
                          <Text style={styles.dot}>·</Text>
                          <Text style={styles.compMetaText}>{p.wilaya}</Text>
                        </View>
                      </View>
                      <View style={styles.compPriceWrap}>
                        <Text style={styles.compPrice}>{p.price_dzd.toLocaleString('en-US')}</Text>
                        <Text style={styles.compPriceUnit}>DZD</Text>
                        {myAvgPrice > 0 ? (
                          <Text style={[styles.compDelta, { color: cheaper ? PRO.green : PRO.red }]}>
                            {cheaper ? 'above you' : 'below you'}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
            </View>
          </>
        )}
      </ScrollView>
    </ProScreenChrome>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48, gap: 14 },
  note: { fontSize: 12, fontFamily: 'mon', color: PRO.muted, lineHeight: 18 },
  rows: { gap: 10 },
  dot: { fontSize: 12, color: PRO.subtle },

  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleEdge: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.subtle },
  scaleTrack: { height: 10, borderRadius: 5, backgroundColor: PRO.sunken, marginVertical: 6 },
  scaleMarker: { position: 'absolute', top: -3, width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#FFFFFF' },
  scaleAvg: { position: 'absolute', top: -2, width: 2, height: 14, backgroundColor: PRO.subtle, borderRadius: 1 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  searchTerm: { flex: 1, fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  growthPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  growthText: { fontSize: 11, fontFamily: 'mon-b' },

  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 130, marginVertical: 6 },
  chartCol: { flex: 1, alignItems: 'center', gap: 6 },
  chartBarWrap: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 4, minHeight: 4 },
  chartLabel: { fontSize: 9, fontFamily: 'mon-sb', color: PRO.subtle },

  supplyRow: { gap: 6, paddingVertical: 5 },
  supplyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  supplyNameWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  supplyName: { fontSize: 13, fontFamily: 'mon-sb', color: PRO.text },
  supplyValue: { fontSize: 11, fontFamily: 'mon-sb', color: PRO.muted },

  compCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRO.border,
    backgroundColor: PRO.surface,
  },
  rankBadge: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 12, fontFamily: 'mon-b', color: PRO.muted },
  compBody: { flex: 1, gap: 3 },
  compName: { fontSize: 13, fontFamily: 'mon-b', color: PRO.text },
  compMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compMetaText: { fontSize: 11, fontFamily: 'mon', color: PRO.muted },
  compPriceWrap: { alignItems: 'flex-end' },
  compPrice: { fontSize: 14, fontFamily: 'mon-b', color: PRO.text },
  compPriceUnit: { fontSize: 10, fontFamily: 'mon', color: PRO.subtle },
  compDelta: { fontSize: 10, fontFamily: 'mon-sb', marginTop: 2 },
});
