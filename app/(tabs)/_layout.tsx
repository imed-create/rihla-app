import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useApp } from '@/context/AppContext';
import { useFavorites } from '@/store/useFavorites';
import { useTheme } from '@/context/ThemeContext';
import { RIHLA } from '@/constants/theme';

export default function TabLayout() {
  const { activeBookings } = useApp();
  const { favoriteIds } = useFavorites();
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: RIHLA.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: 'mon-sb', fontSize: 10, marginTop: 3 },
        tabBarStyle: {
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          borderRadius: 28,
          paddingBottom: Platform.OS === 'ios' ? 4 : 8,
          paddingTop: 10,
          overflow: 'hidden',
          marginHorizontal: 16,
          marginBottom: 16,
          height: 68,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 20,
          shadowColor: isDark ? RIHLA.accent : '#000',
          shadowOpacity: isDark ? 0.15 : 0.2,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          borderTopWidth: 1,
          borderTopColor: isDark ? RIHLA.accent + '15' : '#E2E8F010',
          borderWidth: 1,
          borderColor: isDark ? '#222222' : '#E2E8F0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={20} color={color} />
              {favoriteIds.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {favoriteIds.length > 9 ? '9+' : favoriteIds.length}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={20} color={color} />
              {activeBookings.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {activeBookings.length > 9 ? '9+' : activeBookings.length}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -5, right: -7,
    minWidth: 17, height: 17, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#121212',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  badgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#FFFFFF' },
});

