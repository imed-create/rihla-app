import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import ProTabShell from '@/components/pro/ProTabShell';
import ProMenuShortcuts from '@/components/pro/ProMenuShortcuts';
import ProQRScanner from '@/components/pro/ProQRScanner';
import { PRO_THEME } from '@/constants/proNavigation';
import { SAHEL } from '@/constants/Colors';
import { useTranslation } from '@/context/I18nContext';
import { showToast } from '@/components/Toast';
import {
  partnerEarningsDzd,
  partnerEarningsThisWeek,
} from '@/lib/dashboardStats';

export default function PartnerDashboard() {
  const { user, serviceRequests, partnerOnline, setPartnerOnline } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const theme = PRO_THEME.partner;
  const { t } = useTranslation();

  const todayRequests = useMemo(
    () => serviceRequests.filter((r) => {
      const d = new Date(r.createdAt);
      const n = new Date();
      return d.toDateString() === n.toDateString();
    }),
    [serviceRequests]
  );

  const stats = useMemo(
    () => [
      {
        label: "Today's Requests",
        value: String(todayRequests.length),
        icon: 'mail-outline' as const,
        color: SAHEL.accent,
      },
      {
        label: 'Week Earnings (DZD)',
        value: partnerEarningsThisWeek(serviceRequests).toLocaleString(),
        icon: 'cash-outline' as const,
        color: SAHEL.highlight,
      },
      {
        label: 'Total Earnings',
        value: partnerEarningsDzd(serviceRequests).toLocaleString(),
        icon: 'wallet-outline' as const,
        color: SAHEL.primary,
      },
      {
        label: 'Pending',
        value: String(serviceRequests.filter((r) => r.status === 'pending').length),
        icon: 'time-outline' as const,
        color: '#94A3B8',
      },
    ],
    [serviceRequests, todayRequests]
  );

  const toggleOnline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPartnerOnline(!partnerOnline);
  };

  const settingsBtn = (
    <Pressable onPress={() => router.push('/(modals)/settings' as any)} style={{ padding: 8 }}>
      <Ionicons name="settings-outline" size={22} color={theme.accent} />
    </Pressable>
  );

  return (
    <ProTabShell
      role="partner"
      title={t('pro.saheelPro')}
      subtitle={t('roles.partner')}
      headerRight={settingsBtn}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradient} style={styles.hero}>
          <Text style={styles.heroGreeting}>Service Partner</Text>
          <Text style={styles.heroName}>{user.name || user.kycData.fullName || 'Partner'}</Text>
        </LinearGradient>

        <Pressable
          style={[styles.onlinePill, partnerOnline ? styles.onlineOn : styles.onlineOff]}
          onPress={toggleOnline}
        >
          <View style={[styles.onlineDot, { backgroundColor: partnerOnline ? SAHEL.accent : SAHEL.mutedText }]} />
          <Text style={[styles.onlineText, partnerOnline ? styles.onlineTextOn : styles.onlineTextOff]}>
            {partnerOnline ? 'Online — accepting requests' : 'Offline'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.scanLink}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setScannerOpen(true);
          }}
        >
          <Ionicons name="qr-code-outline" size={20} color={SAHEL.highlight} />
          <Text style={styles.scanLinkText}>Scan traveler ticket →</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '15' }]}>
                <Ionicons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <ProMenuShortcuts role="partner" />
      </ScrollView>
      <Modal visible={scannerOpen} animationType="slide" onRequestClose={() => setScannerOpen(false)}>
        <ProQRScanner
          onScanned={(data) => {
            setScannerOpen(false);
            showToast(`Ticket verified: ${data}`, 'success');
          }}
          onClose={() => setScannerOpen(false)}
          title="Scan Traveler Ticket"
        />
      </Modal>
    </ProTabShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, paddingBottom: 32 },
  hero: { borderRadius: 20, padding: 22, gap: 6 },
  heroGreeting: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  heroName: { fontSize: 24, fontFamily: 'mon-b', color: '#FFFFFF' },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  onlineOn: { backgroundColor: '#E6FAF7', borderColor: SAHEL.accent },
  onlineOff: { backgroundColor: SAHEL.muted, borderColor: SAHEL.border },
  onlineDot: { width: 12, height: 12, borderRadius: 6 },
  onlineText: { fontSize: 15, fontFamily: 'mon-b' },
  onlineTextOn: { color: SAHEL.primary },
  onlineTextOff: { color: SAHEL.mutedText },
  sectionTitle: { fontSize: 16, fontFamily: 'mon-b', color: SAHEL.dark },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%',
    backgroundColor: SAHEL.card,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 11, fontFamily: 'mon', color: SAHEL.mutedText },
  scanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SAHEL.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  scanLinkText: { fontFamily: 'mon-sb', fontSize: 14, color: SAHEL.highlight },
});
