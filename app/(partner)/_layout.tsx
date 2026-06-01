import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PartnerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontFamily: 'mon-sb', fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="services" options={{ title: 'My Services', tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="rentals" options={{ title: 'Rentals', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
