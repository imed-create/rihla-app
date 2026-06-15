import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProNavProvider } from '@/components/dashboard/NavProvider';
import { PRO_THEME } from '@/constants/proNavigation';
import { useTheme } from '@/context/ThemeContext';

const theme = PRO_THEME.partner;

export default function PartnerLayout() {
  const { colors } = useTheme();
  return (
    <ProNavProvider role="partner">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontFamily: 'mon-sb', fontSize: 10, marginTop: -2 },
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0.5,
            borderTopColor: colors.border,
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

        <Tabs.Screen name="schedule"              options={{ href: null }} />
        <Tabs.Screen name="earnings"               options={{ href: null }} />
        <Tabs.Screen name="reviews"                options={{ href: null }} />
        <Tabs.Screen name="services/new"           options={{ href: null }} />
        <Tabs.Screen name="services/[id]"          options={{ href: null }} />
        {/* ── Expanded menu routes ── */}
        <Tabs.Screen name="dispatch"               options={{ href: null }} />
        <Tabs.Screen name="tasks"                  options={{ href: null }} />
        <Tabs.Screen name="payouts"                options={{ href: null }} />
        <Tabs.Screen name="tax"                    options={{ href: null }} />
        <Tabs.Screen name="analytics"              options={{ href: null }} />
        <Tabs.Screen name="notifications"          options={{ href: null }} />
        <Tabs.Screen name="edit-profile"           options={{ href: null }} />
        <Tabs.Screen name="verification"           options={{ href: null }} />
        <Tabs.Screen name="help"                   options={{ href: null }} />
        <Tabs.Screen name="community"              options={{ href: null }} />
      </Tabs>
    </ProNavProvider>
  );
}
