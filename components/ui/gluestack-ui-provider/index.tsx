import React from 'react';
import { View } from 'react-native';

export function GluestackUIProvider({ children, mode }: { children: React.ReactNode; mode?: 'light' | 'dark' }) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
