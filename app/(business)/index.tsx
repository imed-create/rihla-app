import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '@/context/AppContext';
import * as Haptics from 'expo-haptics';
import ProTabShell from '@/components/pro/ProTabShell';
import ProMenuShortcuts from '@/components/pro/ProMenuShortcuts';
import ProQRScanner from '@/components/pro/ProQRScanner';
import { PRO_THEME } from '@/constants/proNavigation';
import { SAHEL } from '@/constants/Colors';
import { useTranslation } from '@/context/I18nContext';
import { showToast } from '@/components/Toast';
import {
  activeFoodOrders,
  businessBookingsToday,
  businessRevenueDzd,
  pendingBusinessBookings,
} from '@/lib/dashboardStats';

export default function BusinessDashboard() {
  const { user, bookings, orders } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const theme = PRO_THEME.business;
  const { t } = useTranslation();
  const name = user.kycData.businessName || user.name || 'Business';

  const stats = useMemo(() => {
    const today = businessBookingsToday(bookings);
    const revenue = businessRevenueDzd(bookings, ['confirmed', 'active', 'completed']);
    const foodOrders = activeFoodOrders(orders);
    const pending = pendingBusinessBookings(bookings);
    return [
      { label: "Today's Bookings", value: String(today.length), icon: 'calendar-outline' as const, color: SAHEL.accent },
      { label: 'Revenue (DZD)', value: revenue.toLocaleString(), icon: 'cash-outline' as const, color: SAHEL.highlight },
      { label: 'Active Orders', value: String(foodOrders.length), icon: 'restaurant-outline' as const, color: SAHEL.primary },
      { label: 'Pending', value: String(pending.length), icon: 'time-outline' as const, color: '#94A3B8' },
    ];
  }, [bookings, orders]);

  const settingsBtn = (
    <Pressable onPress={() => router.push('/(modals)/settings' as any)} style={{ padding: 8 }}>
      <Ionicons name="settings-outline" size={22} color={theme.accent} />
    </Pressable>
  );

  return (
    <ProTabShell
      role="business"
      title={t('pro.saheelPro')}
      subtitle={t('roles.business')}
      headerRight={settingsBtn}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradient} style={styles.hero}>
          <Text style={styles.heroGreeting}>Welcome back</Text>
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedDot} />
            <Text style={styles.verifiedText}>Verified · Business Owner</Text>
          </View>
        </LinearGradient>

        <View style={styles.quickLinks}>
          <Pressable style={styles.quickLink} onPress={() => router.push('/(business)/orders' as any)}>
            <Ionicons name="fast-food-outline" size={20} color={SAHEL.accent} />
            <Text style={styles.quickLinkText}>Live food orders →</Text>
          </Pressable>
          <Pressable
            style={styles.quickLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setScannerOpen(true);
            }}
          >
            <Ionicons name="qr-code-outline" size={20} color={SAHEL.primary} />
            <Text style={styles.quickLinkText}>Scan ticket QR →</Text>
          </Pressable>
        </View>

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

        <ProMenuShortcuts role="business" />
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
  heroGreeting: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.8)' },
  heroName: { fontSize: 24, fontFamily: 'mon-b', color: '#FFFFFF' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  verifiedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: SAHEL.accent },
  verifiedText: { fontSize: 12, fontFamily: 'mon-sb', color: 'rgba(255,255,255,0.9)' },
  quickLinks: { flexDirection: 'row', gap: 10 },
  quickLink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SAHEL.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SAHEL.border,
  },
  quickLinkText: { fontFamily: 'mon-sb', fontSize: 13, color: SAHEL.primary, flexShrink: 1 },
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
  statValue: { fontSize: 22, fontFamily: 'mon-b', color: SAHEL.dark },
  statLabel: { fontSize: 12, fontFamily: 'mon', color: SAHEL.mutedText },
});
