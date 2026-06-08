import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RIHLA } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  loading?: boolean;
  variant?: 'solid' | 'outline' | 'link';
}

export function Button({ title, children, style, loading, variant = 'solid', onPress, ...props }: ButtonProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'outline' && styles.outlineButton,
        variant === 'link' && styles.linkButton,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? RIHLA.primary : '#FFFFFF'} size="small" />
      ) : title ? (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText, variant === 'link' && styles.linkText]}>
          {title}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: RIHLA.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: RIHLA.primary,
  },
  linkButton: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  text: {
    color: '#FFFFFF',
    fontFamily: 'mon-sb',
    fontSize: 14,
  },
  outlineText: {
    color: RIHLA.primary,
  },
  linkText: {
    color: RIHLA.accent,
    textDecorationLine: 'underline',
  },
});
