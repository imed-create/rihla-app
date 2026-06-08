import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProNavProvider } from '@/components/dashboard/NavProvider';
import { PRO_THEME } from '@/constants/proNavigation';

const theme = PRO_THEME.partner;

export default function PartnerLayout() {
  return (
    <ProNavProvider role="partner">
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
              <Ionicons name={focused ? 'flash' : 'flash-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="services"
          options={{
            title: 'Services',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'cube' : 'cube-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="rentals"
          options={{
            title: 'Rentals',
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

        <Tabs.Screen name="schedule" options={{ href: null }} />
        <Tabs.Screen name="earnings" options={{ href: null }} />
        <Tabs.Screen name="reviews" options={{ href: null }} />
        <Tabs.Screen name="services/new" options={{ href: null }} />
        <Tabs.Screen name="services/[id]" options={{ href: null }} />
      </Tabs>
    </ProNavProvider>
  );
}
