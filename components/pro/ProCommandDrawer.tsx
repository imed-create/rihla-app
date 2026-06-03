import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@clerk/clerk-expo';
import { getProMenuItems, PRO_THEME, ProNavItem } from '@/constants/proNavigation';
import { useProNav } from './ProNavProvider';
import { useTranslation } from '@/context/I18nContext';

const PANEL_WIDTH = Math.min(Dimensions.get('window').width * 0.86, 340);

export default function ProCommandDrawer() {
  const { role, isOpen, closeMenu } = useProNav();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { user, signOut } = useApp();
  const { signOut: clerkSignOut } = useAuth();
  const theme = PRO_THEME[role];
  const items = getProMenuItems(role);
  const { t } = useTranslation();
  const slide = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, friction: 9 }),
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: -PANEL_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen, slide, fade]);

  const navigate = (href: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeMenu();
    setTimeout(() => router.push(href as any), 120);
  };

  const handleSignOut = async () => {
    closeMenu();
    try {
      await clerkSignOut();
    } catch {
      /* noop */
    }
    signOut();
    router.replace('/(modals)/login');
  };

  const displayName =
    role === 'business'
      ? user.kycData.businessName || user.name || 'Business Owner'
      : user.name || user.kycData.fullName || 'Partner';

  const isActive = (item: ProNavItem) => pathname.includes(item.key);

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={closeMenu}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: PANEL_WIDTH,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateX: slide }],
            },
          ]}
        >
          <View style={[styles.panelHeader, { backgroundColor: theme.accent }]}>
            <Pressable onPress={closeMenu} hitSlop={12} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.panelBrand}>Saheel Pro</Text>
            <Text style={styles.panelRole}>{theme.label}</Text>
            <Text style={styles.panelName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>{t('pro.moreTools')}</Text>
            <Text style={styles.sectionHint}>{t('pro.menuHint')}</Text>
            {items.map((item) => {
              const active = isActive(item);
              return (
                <Pressable
                  key={item.key}
                  onPress={() => navigate(item.href)}
                  style={[
                    styles.menuRow,
                    active && {
                      backgroundColor: theme.accent + '12',
                      borderColor: theme.accent + '40',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: active ? theme.accent + '22' : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? theme.accent : '#64748B'}
                    />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={[styles.menuLabel, active && { color: theme.accentDark }]}>
                      {item.label}
                    </Text>
                    {item.subtitle ? <Text style={styles.menuSub}>{item.subtitle}</Text> : null}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={active ? theme.accent : '#CBD5E1'}
                  />
                </Pressable>
              );
            })}

            <Pressable onPress={handleSignOut} style={styles.signOutRow}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.signOutText}>{t('pro.signOut')}</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  panel: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  panelHeader: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    gap: 4,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelBrand: {
    fontSize: 11,
    fontFamily: 'mon-sb',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  panelRole: { fontSize: 13, fontFamily: 'mon', color: 'rgba(255,255,255,0.85)' },
  panelName: { fontSize: 20, fontFamily: 'mon-b', color: '#FFFFFF', marginTop: 4, paddingRight: 36 },
  menuScroll: { flex: 1, marginTop: 12 },
  menuContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  section: { gap: 6, marginBottom: 8 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'mon-sb',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginTop: 4,
  },
  sectionHint: {
    fontSize: 12,
    fontFamily: 'mon',
    color: '#94A3B8',
    marginLeft: 4,
    marginBottom: 8,
    lineHeight: 17,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 14, fontFamily: 'mon-sb', color: '#0F172A' },
  menuSub: { fontSize: 11, fontFamily: 'mon', color: '#64748B' },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: { fontSize: 14, fontFamily: 'mon-sb', color: '#EF4444' },
});
