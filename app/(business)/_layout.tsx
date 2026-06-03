import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProNavProvider } from '@/components/pro/ProNavProvider';
import { PRO_THEME } from '@/constants/proNavigation';

const theme = PRO_THEME.business;

export default function BusinessLayout() {
  return (
    <ProNavProvider role="business">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: { fontFamily: 'mon-sb', fontSize: 10, marginTop: -2 },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.5,
            borderTopColor: '#e2e8f0',
            height: 72,
            paddingBottom: 12,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="listings"
          options={{
            title: 'Listings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* Menu-only & nested — hidden from tab bar */}
        <Tabs.Screen name="promotions" options={{ href: null }} />
        <Tabs.Screen name="analytics" options={{ href: null }} />
        <Tabs.Screen name="reviews" options={{ href: null }} />
        <Tabs.Screen name="listings/new" options={{ href: null }} />
        <Tabs.Screen name="listings/[id]" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
      </Tabs>
    </ProNavProvider>
  );
}
