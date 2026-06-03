import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type ProRole = 'business' | 'partner';
type IonName = ComponentProps<typeof Ionicons>['name'];

export type ProNavPlacement = 'tab' | 'menu';

export type ProNavItem = {
  key: string;
  label: string;
  subtitle?: string;
  icon: IonName;
  href: string;
  placement: ProNavPlacement;
  /** Tab bar label (shorter) */
  tabLabel?: string;
};

export const BUSINESS_NAV: ProNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    tabLabel: 'Home',
    subtitle: 'Overview & stats',
    icon: 'grid-outline',
    href: '/(business)',
    placement: 'tab',
  },
  {
    key: 'listings',
    label: 'My Listings',
    tabLabel: 'Listings',
    subtitle: 'Places & inventory',
    icon: 'storefront-outline',
    href: '/(business)/listings',
    placement: 'tab',
  },
  {
    key: 'bookings',
    label: 'Bookings',
    tabLabel: 'Bookings',
    subtitle: 'Incoming reservations',
    icon: 'calendar-outline',
    href: '/(business)/bookings',
    placement: 'tab',
  },
  {
    key: 'profile',
    label: 'Profile',
    tabLabel: 'Profile',
    subtitle: 'Account & verification',
    icon: 'person-circle-outline',
    href: '/(business)/profile',
    placement: 'tab',
  },
  {
    key: 'promotions',
    label: 'Promotions',
    subtitle: 'Offers & campaigns',
    icon: 'megaphone-outline',
    href: '/(business)/promotions',
    placement: 'menu',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    subtitle: 'Revenue & trends',
    icon: 'analytics-outline',
    href: '/(business)/analytics',
    placement: 'menu',
  },
  {
    key: 'reviews',
    label: 'Reviews',
    subtitle: 'Guest feedback',
    icon: 'chatbubbles-outline',
    href: '/(business)/reviews',
    placement: 'menu',
  },
];

export const PARTNER_NAV: ProNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    tabLabel: 'Home',
    subtitle: 'Fleet overview',
    icon: 'flash-outline',
    href: '/(partner)',
    placement: 'tab',
  },
  {
    key: 'services',
    label: 'My Services',
    tabLabel: 'Services',
    subtitle: 'Assets you rent out',
    icon: 'cube-outline',
    href: '/(partner)/services',
    placement: 'tab',
  },
  {
    key: 'rentals',
    label: 'Active Rentals',
    tabLabel: 'Rentals',
    subtitle: 'Live bookings',
    icon: 'calendar-outline',
    href: '/(partner)/rentals',
    placement: 'tab',
  },
  {
    key: 'profile',
    label: 'Profile',
    tabLabel: 'Profile',
    subtitle: 'Partner account',
    icon: 'person-circle-outline',
    href: '/(partner)/profile',
    placement: 'tab',
  },
  {
    key: 'schedule',
    label: 'Schedule',
    subtitle: 'Availability windows',
    icon: 'time-outline',
    href: '/(partner)/schedule',
    placement: 'menu',
  },
  {
    key: 'earnings',
    label: 'Earnings',
    subtitle: 'Payouts & performance',
    icon: 'cash-outline',
    href: '/(partner)/earnings',
    placement: 'menu',
  },
  {
    key: 'reviews',
    label: 'Reviews',
    subtitle: 'Customer ratings',
    icon: 'chatbubbles-outline',
    href: '/(partner)/reviews',
    placement: 'menu',
  },
];

export const PRO_THEME: Record<
  ProRole,
  { accent: string; accentDark: string; gradient: [string, string]; label: string }
> = {
  business: {
    accent: '#0a2540',
    accentDark: '#061a2c',
    gradient: ['#0a2540', '#061a2c'],
    label: 'Business Owner',
  },
  partner: {
    accent: '#f4a261',
    accentDark: '#e08f47',
    gradient: ['#f4a261', '#e08f47'],
    label: 'Service Partner',
  },
};

export function getProNavItems(role: ProRole) {
  return role === 'business' ? BUSINESS_NAV : PARTNER_NAV;
}

export function getProTabItems(role: ProRole) {
  return getProNavItems(role).filter((i) => i.placement === 'tab');
}

export function getProMenuItems(role: ProRole) {
  return getProNavItems(role).filter((i) => i.placement === 'menu');
}
