import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

export default function TabLayout() {
  const colors = useColors();
  const { activeBookings } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#222222',
        tabBarInactiveTintColor: '#717171',
        headerShown: false,
        tabBarLabelStyle: {
          fontFamily: 'mon-sb',
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#DDDDDD',
          height: 66,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Algeria Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarBadge: activeBookings.length > 0 ? activeBookings.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: '#FFFFFF',
            fontSize: 10,
            fontFamily: 'mon-b',
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Hide the old legacy tabs */}
      <Tabs.Screen name="wishlists" options={{ href: null }} />
      <Tabs.Screen name="trips" options={{ href: null }} />
      <Tabs.Screen name="inbox" options={{ href: null }} />
    </Tabs>
  );
}
