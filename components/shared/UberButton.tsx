/**
 * RIHLA — Uber-Style Button with Variants
 * ──────────────────────────────────────────
 * Ported from the Uber Clone's CustomButton component design.
 * Supports bgVariant + textVariant + IconLeft/IconRight.
 * Uses RIHLA's theme tokens and mon fonts.
 */

import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

type BgVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
type TextVariant = 'primary' | 'default' | 'secondary' | 'danger' | 'success';

interface UberButtonProps {
  title: string;
  bgVariant?: BgVariant;
  textVariant?: TextVariant;
  IconLeft?: React.ComponentType<{ size?: number; color?: string }>;
  IconRight?: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
  haptic?: boolean;
}

const BG_MAP: Record<BgVariant, string> = {
  primary: RIHLA.primary,
  secondary: RIHLA.accent,
  danger: '#EF4444',
  outline: 'transparent',
  success: '#10B981',
};

const TEXT_COLOR_MAP: Record<TextVariant, string> = {
  primary: '#FFFFFF',
  default: '#FFFFFF',
  secondary: RIHLA.dark,
  danger: '#EF4444',
  success: '#10B981',
};

const BORDER_MAP: Record<BgVariant, string> = {
  primary: RIHLA.primary,
  secondary: RIHLA.accent,
  danger: '#EF4444',
  outline: RIHLA.border,
  success: '#10B981',
};

export default function UberButton({
  title,
  bgVariant = 'primary',
  textVariant = 'default',
  IconLeft,
  IconRight,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  haptic = true,
}: UberButtonProps) {
  const bgColor = BG_MAP[bgVariant];
  const textColor = TEXT_COLOR_MAP[textVariant];
  const borderColor = BORDER_MAP[bgVariant];
  const isOutline = bgVariant === 'outline';

  const handlePress = () => {
    if (haptic && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: isOutline ? 'transparent' : bgColor,
          borderColor: borderColor,
          borderWidth: isOutline ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {IconLeft && (
            <IconLeft size={18} color={textColor} />
          )}
          <Text
            style={[
              styles.text,
              { color: isOutline ? RIHLA.dark : textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {IconRight && (
            <IconRight size={18} color={textColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
    fontFamily: 'mon-b',
  },
});
