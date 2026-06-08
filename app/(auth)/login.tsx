/**
 * RIHLA — Premium Login / Sign Up Screen
 * ─────────────────────────────────────────
 * Dark gradient hero • Glassmorphism inputs • Smooth tab transitions
 */

import Colors, { RIHLA } from '@/constants/theme';
import { useOAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useApp } from '@/context/AppContext';

enum Strategy {
  Google = 'oauth_google',
  Apple = 'oauth_apple',
  Facebook = 'oauth_facebook',
}

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUser } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tabAnim = useRef(new Animated.Value(0)).current;

  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' });

  const switchTab = (tab: 'signin' | 'signup') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  const onSelectAuth = async (strategy: Strategy) => {
    const selectedAuth = {
      [Strategy.Google]: googleAuth,
      [Strategy.Apple]: appleAuth,
      [Strategy.Facebook]: googleAuth, // fallback
    }[strategy];

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { createdSessionId, setActive } = await selectedAuth();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      }
      router.replace('/');
    } catch {
      updateUser({
        email: `${strategy.split('_')[1]}@demo.com`,
        name: strategy.split('_')[1] === 'google' ? 'Google User' : 'Apple User',
      });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address.');
      return;
    }
    if (activeTab === 'signup' && !fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setTimeout(() => {
      updateUser({
        email: email.trim(),
        name: activeTab === 'signup' ? fullName.trim() : email.split('@')[0],
      });
      setLoading(false);
      router.replace('/');
    }, 800);
  };

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, (width - 48) / 2 + 4],
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      {/* ── HERO GRADIENT HEADER ── */}
      <LinearGradient
        colors={['#061422', '#0a2540', '#0d3b6e']}
        style={[styles.hero, { paddingTop: insets.top + 12 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="airplane" size={22} color="#fff" />
          </View>
          <Text style={styles.brandName}>RIHLA</Text>
        </View>

        <Text style={styles.heroTitle}>
          {activeTab === 'signin' ? 'Welcome back 👋' : 'Join Rihla 🇩🇿'}
        </Text>
        <Text style={styles.heroSub}>
          {activeTab === 'signin'
            ? 'Sign in to access your bookings and favorites'
            : 'Discover Algeria — book stays, tours & experiences'}
        </Text>
      </LinearGradient>

      {/* ── FORM CARD ── */}
      <ScrollView
        contentContainerStyle={[styles.formScroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>

          {/* Tab Switcher */}
          <View style={styles.tabTrack}>
            <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft, width: (width - 96) / 2 }]} />
            <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('signin')} activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, activeTab === 'signin' && styles.tabBtnTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('signup')} activeOpacity={0.8}>
              <Text style={[styles.tabBtnText, activeTab === 'signup' && styles.tabBtnTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <View style={styles.inputsWrap}>
            {activeTab === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ahmed Bouzid"
                    placeholderTextColor="#CBD5E1"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                {activeTab === 'signin' && (
                  <TouchableOpacity><Text style={styles.forgotText}>Forgot?</Text></TouchableOpacity>
                )}
              </View>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={activeTab === 'signup' ? 'Min 8 characters' : '••••••••'}
                  placeholderTextColor="#CBD5E1"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.ctaBtn, loading && { opacity: 0.75 }]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0a2540', '#1a4a7a']}
              style={styles.ctaBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>{activeTab === 'signin' ? 'Sign In' : 'Create Account'}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Auth */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => onSelectAuth(Strategy.Google)} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => onSelectAuth(Strategy.Apple)} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={20} color="#1F2937" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Quick demo */}
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => {
              Haptics.selectionAsync();
              updateUser({ email: 'demo@rihla.dz', name: 'Demo User' });
              router.replace('/');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="flash-outline" size={16} color={RIHLA.accent} />
            <Text style={styles.quickBtnText}>Quick Demo Access</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink}>Terms of Service</Text> &{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F4F8' },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'mon-b',
    color: '#fff',
    letterSpacing: 3,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'mon-b',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'mon',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
  },

  // Form
  formScroll: { paddingTop: 0, paddingHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    marginTop: -20,
    shadowColor: '#0a2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    gap: 0,
  },

  // Tabs
  tabTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tabBtn: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabBtnText: { fontSize: 14, fontFamily: 'mon-sb', color: '#94A3B8' },
  tabBtnTextActive: { color: '#0a2540' },

  // Inputs
  inputsWrap: { gap: 16, marginBottom: 20 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontFamily: 'mon-sb', color: '#374151', letterSpacing: 0.3 },
  inputLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 12, fontFamily: 'mon-sb', color: RIHLA.accent },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'mon',
    color: '#1F2937',
  },

  // CTA
  ctaBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  ctaBtnGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaBtnText: { fontSize: 16, fontFamily: 'mon-sb', color: '#fff' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#F1F5F9' },
  dividerText: { fontSize: 12, fontFamily: 'mon', color: '#94A3B8', paddingHorizontal: 12 },

  // Social
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialBtnText: { fontSize: 14, fontFamily: 'mon-sb', color: '#374151' },

  // Quick
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  quickBtnText: { fontSize: 13, fontFamily: 'mon-sb', color: RIHLA.accent },

  // Legal
  legalText: {
    marginTop: 20,
    fontSize: 11,
    fontFamily: 'mon',
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: { color: RIHLA.primary, fontFamily: 'mon-sb' },
});
