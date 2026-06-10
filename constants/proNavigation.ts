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
  // ── Primary Tab Bar (4 core tabs) ──
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

  // ── Operations (Menu) ──
  {
    key: 'orders',
    label: 'Orders',
    subtitle: 'Order fulfillment pipeline',
    icon: 'receipt-outline',
    href: '/(business)/orders',
    placement: 'menu',
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
    subtitle: 'Revenue & performance',
    icon: 'analytics-outline',
    href: '/(business)/analytics',
    placement: 'menu',
  },
  {
    key: 'reviews',
    label: 'Reviews',
    subtitle: 'Guest feedback & ratings',
    icon: 'chatbubbles-outline',
    href: '/(business)/reviews',
    placement: 'menu',
  },
  {
    key: 'staff-management',
    label: 'Staff Management',
    subtitle: 'Roster, shifts & payroll',
    icon: 'people-outline',
    href: '/(business)/staff',
    placement: 'menu',
  },
  {
    key: 'inventory',
    label: 'Inventory Control',
    subtitle: 'Asset & stock management',
    icon: 'cube-outline',
    href: '/(business)/inventory',
    placement: 'menu',
  },

  // ── Finance & Reporting ──
  {
    key: 'earnings',
    label: 'Earnings & Payouts',
    subtitle: 'Revenue, invoices, settlements',
    icon: 'cash-outline',
    href: '/(business)/earnings',
    placement: 'menu',
  },
  {
    key: 'reports',
    label: 'Reports',
    subtitle: 'Custom reports & exports',
    icon: 'document-text-outline',
    href: '/(business)/reports',
    placement: 'menu',
  },

  // ── Business Settings ──
  {
    key: 'business-profile',
    label: 'Business Profile',
    subtitle: 'Brand, details & KYC',
    icon: 'business-outline',
    href: '/(business)/settings',
    placement: 'menu',
  },
  {
    key: 'subscription',
    label: 'Subscription & Plan',
    subtitle: 'Billing, limits & upgrades',
    icon: 'card-outline',
    href: '/(modals)/settings',
    placement: 'menu',
  },

  // ── Partner Network ──
  {
    key: 'partner-network',
    label: 'Partner Network',
    subtitle: 'Find & collaborate with locals',
    icon: 'git-network-outline',
    href: '/(business)/network',
    placement: 'menu',
  },
  {
    key: 'marketplace',
    label: 'Marketplace Insights',
    subtitle: 'Trends, demand & competition',
    icon: 'trending-up-outline',
    href: '/(business)/marketplace',
    placement: 'menu',
  },

  // ── Support & Resources ──
  {
    key: 'help-center',
    label: 'Help Center',
    subtitle: 'Guides, FAQ & support',
    icon: 'help-buoy-outline',
    href: '/(business)/help',
    placement: 'menu',
  },
  {
    key: 'whats-new',
    label: "What's New",
    subtitle: 'Updates & changelog',
    icon: 'megaphone-outline',
    href: '/(business)/changelog',
    placement: 'menu',
  },
];

export const PARTNER_NAV: ProNavItem[] = [
  // ── Primary Tab Bar ──
  {
    key: 'dashboard',
    label: 'Dashboard',
    tabLabel: 'Home',
    subtitle: 'Fleet & operations overview',
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
    subtitle: 'Live bookings & contracts',
    icon: 'calendar-outline',
    href: '/(partner)/rentals',
    placement: 'tab',
  },
  {
    key: 'profile',
    label: 'Profile',
    tabLabel: 'Profile',
    subtitle: 'Partner account & KYC',
    icon: 'person-circle-outline',
    href: '/(partner)/profile',
    placement: 'tab',
  },

  // ── Operations ──
  {
    key: 'schedule',
    label: 'Schedule & Availability',
    subtitle: 'Time slots & dispatches',
    icon: 'time-outline',
    href: '/(partner)/schedule',
    placement: 'menu',
  },
  {
    key: 'dispatch',
    label: 'Live Dispatch',
    subtitle: 'Accept / decline incoming jobs',
    icon: 'navigate-outline',
    href: '/(partner)/dispatch',
    placement: 'menu',
  },
  {
    key: 'tasks',
    label: 'My Tasks',
    subtitle: 'Pending & completed jobs',
    icon: 'checkbox-outline',
    href: '/(partner)/tasks',
    placement: 'menu',
  },

  // ── Finance ──
  {
    key: 'earnings',
    label: 'Earnings & Payouts',
    subtitle: 'Revenue history & withdrawals',
    icon: 'cash-outline',
    href: '/(partner)/earnings',
    placement: 'menu',
  },
  {
    key: 'payout-settings',
    label: 'Payout Settings',
    subtitle: 'Bank account & payment methods',
    icon: 'wallet-outline',
    href: '/(partner)/payouts',
    placement: 'menu',
  },
  {
    key: 'tax-documents',
    label: 'Tax Documents',
    subtitle: 'Invoices & fiscal records',
    icon: 'document-text-outline',
    href: '/(partner)/tax',
    placement: 'menu',
  },

  // ── Performance ──
  {
    key: 'reviews',
    label: 'Reviews & Ratings',
    subtitle: 'Customer feedback & scores',
    icon: 'chatbubbles-outline',
    href: '/(partner)/reviews',
    placement: 'menu',
  },
  {
    key: 'analytics',
    label: 'My Analytics',
    subtitle: 'Performance metrics & trends',
    icon: 'analytics-outline',
    href: '/(partner)/analytics',
    placement: 'menu',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    subtitle: 'Alerts & booking requests',
    icon: 'notifications-outline',
    href: '/(partner)/notifications',
    placement: 'menu',
  },

  // ── Account ──
  {
    key: 'partner-profile',
    label: 'Edit Profile',
    subtitle: 'Bio, photos & credentials',
    icon: 'create-outline',
    href: '/(partner)/edit-profile',
    placement: 'menu',
  },
  {
    key: 'verification',
    label: 'Verification',
    subtitle: 'KYC & document uploads',
    icon: 'shield-checkmark-outline',
    href: '/(partner)/verification',
    placement: 'menu',
  },

  // ── Support ──
  {
    key: 'help',
    label: 'Help & Support',
    subtitle: 'FAQ, contact & tutorials',
    icon: 'help-buoy-outline',
    href: '/(partner)/help',
    placement: 'menu',
  },
  {
    key: 'community',
    label: 'Partner Community',
    subtitle: 'Forum & local network',
    icon: 'people-outline',
    href: '/(partner)/community',
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
