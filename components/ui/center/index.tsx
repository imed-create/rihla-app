import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

export function Center({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.center, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
