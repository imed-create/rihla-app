/**
 * RIHLA — Shell 3: Creative Portfolio Matrix
 * Profile deck with media grid, language chips, certifications.
 * Categories: photographer, guide
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RIHLA } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import type { Listing, PhotographerMetadata, GuideMetadata } from '@/types/service';

type Props = { listing: Listing };

export default function CreativePortfolioShell({ listing }: Props) {
  const { colors } = useTheme();
  const m = listing.metadata;
  const isPhoto = m.kind === 'photographer';
  const [selectedPackage, setSelectedPackage] = useState(0);

  if (isPhoto) {
    const meta = m as PhotographerMetadata;
    return (
      <View style={styles.container}>
        <View style={styles.badgeRow}>
          {meta.style.map((s) => (
            <View key={s} style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="color-palette-outline" size={12} color={RIHLA.accent} />
              <Text style={[styles.badgeText, { color: colors.text }]}>{s}</Text>
            </View>
          ))}
          {meta.drone_available && (
            <View style={[styles.badge, { backgroundColor: colors.card, borderColor: RIHLA.highlight + '30' }]}>
              <Ionicons name="airplane-outline" size={12} color={RIHLA.highlight} />
              <Text style={[styles.badgeText, { color: RIHLA.highlight }]}>Drone</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Portfolio</Text>
          <View style={styles.portfolioGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={[styles.portfolioCell, { backgroundColor: colors.card, borderColor: colors.border }, i % 3 === 0 && styles.portfolioCellLarge]}>
                <Ionicons name="image-outline" size={24} color={colors.muted} />
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
          <Text style={[styles.infoLabel, { color: colors.muted }]}>Delivery</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{meta.turnaround_days} days</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Packages</Text>
          {meta.packages.map((pkg, i) => (
            <Pressable
              key={i}
              style={[styles.packageCard, { backgroundColor: colors.card, borderColor: colors.border }, selectedPackage === i && { borderColor: RIHLA.accent, backgroundColor: RIHLA.accent + '08' }]}
              onPress={() => setSelectedPackage(i)}
            >
              <View style={styles.packageHeader}>
                <Text style={[styles.packageName, { color: colors.text }]}>{pkg.name}</Text>
                <Text style={styles.packagePrice}>{pkg.price_dzd.toLocaleString()} DA</Text>
              </View>
              <Text style={[styles.packageDesc, { color: colors.muted }]}>{pkg.description}</Text>
              <Text style={[styles.packageDeliverables, { color: colors.muted }]}>{pkg.deliverables}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const meta = m as GuideMetadata;
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Languages</Text>
        <View style={styles.chipRow}>
          {meta.languages.map((lang) => (
            <View key={lang} style={[styles.langChip, { backgroundColor: colors.card, borderColor: RIHLA.accent + '20' }]}>
              <Ionicons name="globe-outline" size={12} color={RIHLA.accent} />
              <Text style={styles.langText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="compass-outline" size={16} color={RIHLA.accent} />
        <Text style={[styles.infoLabel, { color: colors.muted }]}>Specialization</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{meta.specialization}</Text>
      </View>

      <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="time-outline" size={16} color={RIHLA.accent} />
        <Text style={[styles.infoLabel, { color: colors.muted }]}>Experience</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{meta.experience_years} years</Text>
      </View>

      <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="people-outline" size={16} color={RIHLA.accent} />
        <Text style={[styles.infoLabel, { color: colors.muted }]}>Max Group</Text>
        <Text style={[styles.infoValue, { color: colors.text }]}>{meta.max_group_size} people</Text>
      </View>

      {meta.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Certifications</Text>
          <View style={styles.chipRow}>
            {meta.certifications.map((cert) => (
              <View key={cert} style={[styles.certChip, { backgroundColor: colors.card, borderColor: RIHLA.online + '20' }]}>
                <Ionicons name="checkmark-circle-outline" size={12} color={RIHLA.online} />
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.rateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.rateLabel, { color: colors.muted }]}>Daily Rate</Text>
        <Text style={styles.rateValue}>{meta.daily_rate_dzd.toLocaleString()} DA</Text>
        <Text style={[styles.rateUnit, { color: colors.muted }]}>/day</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'mon-b' },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontFamily: 'mon-sb' },

  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  portfolioCell: { width: '31.5%', aspectRatio: 1, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  portfolioCellLarge: { width: '64.5%', aspectRatio: 2 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  infoLabel: { flex: 1, fontSize: 13, fontFamily: 'mon' },
  infoValue: { fontSize: 13, fontFamily: 'mon-sb' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  langText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },

  certChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  certText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.online },

  packageCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  packageName: { fontSize: 14, fontFamily: 'mon-b' },
  packagePrice: { fontSize: 14, fontFamily: 'mon-b', color: RIHLA.accent },
  packageDesc: { fontSize: 12, fontFamily: 'mon', marginBottom: 4 },
  packageDeliverables: { fontSize: 11, fontFamily: 'mon' },

  rateCard: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  rateLabel: { fontSize: 13, fontFamily: 'mon', marginRight: 'auto' },
  rateValue: { fontSize: 20, fontFamily: 'mon-b', color: RIHLA.accent },
  rateUnit: { fontSize: 12, fontFamily: 'mon' },
});
