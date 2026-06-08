/**
 * RIHLA — Business Layout
 * ────────────────────────
 * Dynamic bottom tab bar: labels & icons change per businessType.
 * Each business owner feels like they have their own dedicated app.
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProNavProvider } from '@/components/dashboard/NavProvider';
import { PRO_THEME } from '@/constants/proNavigation';
import { useApp } from '@/context/AppContext';
// ── Per-business-type tab config ─────────────────────────────
type TabSlot = {
  title: string;
  icon: string;
  iconFocused: string;
  accent: string;
};

type BusinessTabConfig = {
  index:    TabSlot;
  listings: TabSlot;
  bookings: TabSlot;
  profile:  TabSlot;
};

const TAB_CONFIG: Record<string, BusinessTabConfig> = {
  hotel: {
    index:    { title: 'Dashboard', icon: 'grid-outline',        iconFocused: 'grid',          accent: '#1A6B3A' },
    listings: { title: 'Rooms',     icon: 'bed-outline',          iconFocused: 'bed',            accent: '#1A6B3A' },
    bookings: { title: 'Check-ins', icon: 'enter-outline',        iconFocused: 'enter',          accent: '#1A6B3A' },
    profile:  { title: 'Property',  icon: 'business-outline',     iconFocused: 'business',       accent: '#1A6B3A' },
  },
  restaurant: {
    index:    { title: 'Dashboard',    icon: 'grid-outline',       iconFocused: 'grid',           accent: '#C56A39' },
    listings: { title: 'Menu',         icon: 'book-outline',       iconFocused: 'book',           accent: '#C56A39' },
    bookings: { title: 'Orders',       icon: 'receipt-outline',    iconFocused: 'receipt',        accent: '#C56A39' },
    profile:  { title: 'Restaurant',   icon: 'restaurant-outline', iconFocused: 'restaurant',     accent: '#C56A39' },
  },
  photographer: {
    index:    { title: 'Dashboard',    icon: 'grid-outline',       iconFocused: 'grid',           accent: '#FF499E' },
    listings: { title: 'Portfolio',    icon: 'images-outline',     iconFocused: 'images',         accent: '#FF499E' },
    bookings: { title: 'Shoots',       icon: 'camera-outline',     iconFocused: 'camera',         accent: '#FF499E' },
    profile:  { title: 'Studio',       icon: 'aperture-outline',   iconFocused: 'aperture',       accent: '#FF499E' },
  },
  driver: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#0a2540' },
    listings: { title: 'Routes',      icon: 'map-outline',         iconFocused: 'map',            accent: '#0a2540' },
    bookings: { title: 'Trips',       icon: 'car-outline',         iconFocused: 'car',            accent: '#0a2540' },
    profile:  { title: 'Fleet',       icon: 'speedometer-outline', iconFocused: 'speedometer',    accent: '#0a2540' },
  },
  guide: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#8B5E3C' },
    listings: { title: 'Expeditions', icon: 'compass-outline',     iconFocused: 'compass',        accent: '#8B5E3C' },
    bookings: { title: 'Clients',     icon: 'people-outline',      iconFocused: 'people',         accent: '#8B5E3C' },
    profile:  { title: 'Agency',      icon: 'flag-outline',        iconFocused: 'flag',           accent: '#8B5E3C' },
  },
  rental: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#6C63FF' },
    listings: { title: 'Inventory',   icon: 'cube-outline',        iconFocused: 'cube',           accent: '#6C63FF' },
    bookings: { title: 'Rentals',     icon: 'key-outline',         iconFocused: 'key',            accent: '#6C63FF' },
    profile:  { title: 'Depot',       icon: 'storefront-outline',  iconFocused: 'storefront',     accent: '#6C63FF' },
  },
  beach: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#00a896' },
    listings: { title: 'Spots',       icon: 'umbrella-outline',    iconFocused: 'umbrella',       accent: '#00a896' },
    bookings: { title: 'Services',    icon: 'cafe-outline',        iconFocused: 'cafe',           accent: '#00a896' },
    profile:  { title: 'Beach',       icon: 'water-outline',       iconFocused: 'water',          accent: '#00a896' },
  },
  activity: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#E76F51' },
    listings: { title: 'Programs',    icon: 'calendar-outline',    iconFocused: 'calendar',       accent: '#E76F51' },
    bookings: { title: 'Groups',      icon: 'people-outline',      iconFocused: 'people',         accent: '#E76F51' },
    profile:  { title: 'Company',     icon: 'medal-outline',       iconFocused: 'medal',          accent: '#E76F51' },
  },
  event: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#A855F7' },
    listings: { title: 'Events',      icon: 'ticket-outline',      iconFocused: 'ticket',         accent: '#A855F7' },
    bookings: { title: 'Tickets',     icon: 'pricetag-outline',    iconFocused: 'pricetag',       accent: '#A855F7' },
    profile:  { title: 'Venue',       icon: 'business-outline',    iconFocused: 'business',       accent: '#A855F7' },
  },
  experience: {
    index:    { title: 'Dashboard',   icon: 'grid-outline',        iconFocused: 'grid',           accent: '#f4a261' },
    listings: { title: 'Experiences', icon: 'star-outline',        iconFocused: 'star',           accent: '#f4a261' },
    bookings: { title: 'Bookings',    icon: 'calendar-outline',    iconFocused: 'calendar',       accent: '#f4a261' },
    profile:  { title: 'Brand',       icon: 'ribbon-outline',      iconFocused: 'ribbon',         accent: '#f4a261' },
  },
};

const DEFAULT_CONFIG: BusinessTabConfig = {
  index:    { title: 'Dashboard', icon: 'grid-outline',       iconFocused: 'grid',         accent: '#0a2540' },
  listings: { title: 'Listings',  icon: 'list-outline',       iconFocused: 'list',         accent: '#0a2540' },
  bookings: { title: 'Bookings',  icon: 'calendar-outline',   iconFocused: 'calendar',     accent: '#0a2540' },
  profile:  { title: 'Profile',   icon: 'person-circle-outline', iconFocused: 'person-circle', accent: '#0a2540' },
};

export default function BusinessLayout() {
  const { user } = useApp();
  const businessType = (user.kycData?.businessType ?? '').toLowerCase();
  const cfg = TAB_CONFIG[businessType] ?? DEFAULT_CONFIG;
  const accent = cfg.index.accent;

  return (
    <ProNavProvider role="business">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: accent,
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
            title: cfg.index.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={(focused ? cfg.index.iconFocused : cfg.index.icon) as any} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="listings"
          options={{
            title: cfg.listings.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={(focused ? cfg.listings.iconFocused : cfg.listings.icon) as any} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: cfg.bookings.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={(focused ? cfg.bookings.iconFocused : cfg.bookings.icon) as any} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: cfg.profile.title,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={(focused ? cfg.profile.iconFocused : cfg.profile.icon) as any} size={24} color={color} />
            ),
          }}
        />

        {/* Hidden screens */}
        <Tabs.Screen name="promotions"         options={{ href: null }} />
        <Tabs.Screen name="analytics"          options={{ href: null }} />
        <Tabs.Screen name="reviews"            options={{ href: null }} />
        <Tabs.Screen name="orders"             options={{ href: null }} />
        <Tabs.Screen name="listings/new"       options={{ href: null }} />
        <Tabs.Screen name="listings/[id]"      options={{ href: null }} />
        <Tabs.Screen name="manage/[category]"  options={{ href: null }} />
        <Tabs.Screen name="dashboards/driver"       options={{ href: null }} />
        <Tabs.Screen name="dashboards/experience"   options={{ href: null }} />
        <Tabs.Screen name="dashboards/photographer" options={{ href: null }} />
        <Tabs.Screen name="dashboards/rental"       options={{ href: null }} />
      </Tabs>
    </ProNavProvider>
  );
}
