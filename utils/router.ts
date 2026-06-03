import { router, type Href } from 'expo-router';

export function navigateTo(href: Href) {
  router.push(href);
}

export function replaceTo(href: Href) {
  router.replace(href);
}

export function bookingHref(id: string): Href {
  return `/booking/${id}` as Href;
}

export function destinationHref(id: string): Href {
  return `/destination/${id}` as Href;
}

export function orderTrackingHref(orderId: string): Href {
  return `/services/beach/order-tracking?id=${orderId}` as Href;
}

export function comingSoonHref(name: string): Href {
  return `/services/coming-soon?name=${encodeURIComponent(name)}` as Href;
}
