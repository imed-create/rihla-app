import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useApp } from '@/context/AppContext';
import { useFavorites } from '@/store/useFavorites';
import { RIHLA } from '@/constants/theme';

export default function TabLayout() {
  const { activeBookings } = useApp();
  const { favoriteIds } = useFavorites();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: RIHLA.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: { fontFamily: 'mon-sb', fontSize: 10, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderRadius: 28,
          paddingBottom: Platform.OS === 'ios' ? 4 : 8,
          paddingTop: 8,
          overflow: 'hidden',
          marginHorizontal: 16,
          marginBottom: 16,
          height: 64,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 16,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
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
    position: 'absolute', top: -4, right: -6,
    minWidth: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0d0d0d',
  },
  badgeText: { fontSize: 9, fontFamily: 'mon-b', color: '#FFFFFF' },
});
