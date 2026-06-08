import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RIHLA } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  type: ToastType;
  visible: boolean;
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: RIHLA.accent,
  error: RIHLA.error,
  info: RIHLA.highlight,
};

const TOAST_ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let externalShowToast: ToastContextValue['showToast'] | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  externalShowToast?.(message, type);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  const hide = useCallback(() => {
    translateY.value = withTiming(-120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(setToast)((t) => ({ ...t, visible: false }));
    });
  }, [opacity, translateY]);

  const showToastFn = useCallback(
    (message: string, type: ToastType = 'info') => {
      setToast({ message, type, visible: true });
      translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 200 });
      setTimeout(() => hide(), 3000);
    },
    [hide, opacity, translateY]
  );

  externalShowToast = showToastFn;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const value = useMemo(() => ({ showToast: showToastFn }), [showToastFn]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[styles.wrap, { top: insets.top + 8 }, animStyle]}
          pointerEvents="none"
        >
          <View style={[styles.toast, { backgroundColor: TOAST_COLORS[toast.type] }]}>
            <Ionicons name={TOAST_ICONS[toast.type]} size={20} color="#fff" />
            <Text style={styles.text}>{toast.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast requires ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontFamily: 'mon-sb',
    fontSize: 14,
  },
});
