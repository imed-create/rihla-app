import { router } from 'expo-router';

export function safeGoBack(fallbackRoute: string = '/(tabs)') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
}
