import type { AppBooking } from '@/types/booking';
import type { Order } from '@/types/order';
import type { ServiceRequest } from '@/types/service';

const BUSINESS_ID = 'sahel-beach-1';

export function isBusinessBooking(b: AppBooking) {
  return b.type === 'spots' || b.type === 'food' || b.businessId === BUSINESS_ID;
}

export function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

export function businessBookingsToday(bookings: AppBooking[]) {
  return bookings.filter((b) => isBusinessBooking(b) && isToday(b.createdAt));
}

export function businessRevenueDzd(bookings: AppBooking[], status?: AppBooking['status'][]) {
  const allowed = status ?? ['confirmed', 'active', 'completed'];
  return bookings
    .filter((b) => isBusinessBooking(b) && allowed.includes(b.status))
    .reduce((sum, b) => sum + b.price, 0);
}

export function activeFoodOrders(orders: Order[]) {
  return orders.filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'on_the_way');
}

export function pendingBusinessBookings(bookings: AppBooking[]) {
  return bookings.filter((b) => isBusinessBooking(b) && b.status === 'pending');
}

export function partnerEarningsDzd(requests: ServiceRequest[]) {
  return requests
    .filter((r) => r.status === 'confirmed' || r.status === 'completed')
    .reduce((s, r) => s + r.totalDZD, 0);
}

export function partnerEarningsThisWeek(requests: ServiceRequest[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return requests
    .filter(
      (r) =>
        (r.status === 'confirmed' || r.status === 'completed') &&
        new Date(r.createdAt).getTime() >= weekAgo
    )
    .reduce((s, r) => s + r.totalDZD, 0);
}

export function last7DaysEarnings(requests: ServiceRequest[]): number[] {
  const days: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const total = requests
      .filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return (
          t >= start.getTime() &&
          t < end.getTime() &&
          (r.status === 'confirmed' || r.status === 'completed')
        );
      })
      .reduce((s, r) => s + r.totalDZD, 0);
    days.push(total);
  }
  return days;
}
