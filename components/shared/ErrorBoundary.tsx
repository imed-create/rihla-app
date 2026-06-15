/**
 * RIHLA — Error Boundary
 * Catches render crashes and shows a fallback UI.
 * Used to wrap MapLibre components that crash in Expo Go.
 */

import React, { Component, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[ErrorBoundary] Caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <View style={styles.fallback}>
          <Ionicons name="map-outline" size={48} color="#64748B" />
          <Text style={styles.fallbackTitle}>Map unavailable</Text>
          <Text style={styles.fallbackSub}>Maps require a development build</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
    gap: 8,
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 16,
    fontFamily: 'mon-b',
    color: '#FFFFFF',
  },
  fallbackSub: {
    fontSize: 13,
    fontFamily: 'mon',
    color: '#64748B',
    textAlign: 'center',
  },
});
