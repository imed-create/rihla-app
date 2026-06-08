import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { RIHLA } from '@/constants/theme';

export function Spinner({ color = RIHLA.primary, size = 'small', ...props }: ActivityIndicatorProps) {
  return <ActivityIndicator color={color} size={size} {...props} />;
}
