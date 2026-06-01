import 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '@/context/AppContext';
import { useNotifications } from '@/hooks/useNotifications';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_cHJvcGVyLXNwYXJyb3ctMTIuY2xlcmsuYWNjb3VudHMuZGV2JA';

const tokenCache = {
  async getToken(key: string) {
    try { return SecureStore.getItemAsync(key); } catch { return null; }
  },
  async saveToken(key: string, value: string) {
    try { return SecureStore.setItemAsync(key, value); } catch {}
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    mon: require('../assets/fonts/Montserrat-Regular.ttf'),
    'mon-sb': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'mon-b': require('../assets/fonts/Montserrat-Bold.ttf'),
    Inter_400Regular: require('../assets/fonts/Montserrat-Regular.ttf'),
    Inter_500Medium: require('../assets/fonts/Montserrat-SemiBold.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Montserrat-SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useAuth();
  const { user, isLoaded: appLoaded } = useApp();
  const router = useRouter();
  const segments = useSegments();

  const isLoaded = clerkLoaded && appLoaded;
  const isSignedIn = clerkSignedIn || !!user.email;

  // Initialize notifications at the root level
  useNotifications();

  const [hasShownLogin, setHasShownLogin] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inAuth = segments[0] === '(modals)';

    if (!isSignedIn) {
      // Push login modal on first launch, but let them close it to browse
      if (!hasShownLogin && !inAuth) {
        setHasShownLogin(true);
        setTimeout(() => {
          router.push('/(modals)/login');
        }, 100);
      }
      return;
    }

    if (!user.role) {
      if (!inOnboarding) router.replace('/onboarding/role-select');
      return;
    }

    if (user.kycStatus === 'none') {
      if (!inOnboarding) {
        router.replace(`/onboarding/kyc-${user.role}` as any);
      }
      return;
    }

    if (user.kycStatus === 'submitted') {
      if (!inOnboarding) router.replace('/onboarding/kyc-pending');
      return;
    }

    if (user.kycStatus === 'approved') {
      if (user.role === 'business') {
        if (segments[0] !== '(business)' && !inAuth) router.replace('/(business)' as any);
      } else if (user.role === 'partner') {
        if (segments[0] !== '(partner)' && !inAuth) router.replace('/(partner)' as any);
      } else {
        // Traveler can stay on tabs
      }
    }
  }, [isLoaded, isSignedIn, user.role, user.kycStatus, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(business)" options={{ headerShown: false }} />
      <Stack.Screen name="(partner)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/login"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="destination/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="booking/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="services/beach" options={{ headerShown: false }} />
      <Stack.Screen name="services/desert" options={{ headerShown: false }} />
    </Stack>
  );
}
