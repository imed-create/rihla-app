import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { DestinationType } from '@/constants/destinations';
import type { Order, OrderStatus } from '@/types/order';
import type { ServiceRequest, ServiceRequestStatus, ServiceType } from '@/types/service';
import type {
  AppBooking,
  AppBookingStatus,
  KycData,
  KycStatus,
  UserProfile,
  UserRole,
} from '@/types/app';

export type {
  AppBooking as Booking,
  AppBookingStatus as BookingStatus,
  UserRole,
  KycStatus,
  KycData,
  UserProfile,
} from '@/types/app';

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  submitKyc: (data: KycData) => Promise<void>;
  signOut: () => void;
  bookings: AppBooking[];
  addBooking: (booking: Omit<AppBooking, 'id' | 'createdAt' | 'status'>) => AppBooking;
  updateBookingStatus: (id: string, status: AppBookingStatus) => void;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  getBookingById: (id: string) => AppBooking | undefined;
  activeBookings: AppBooking[];
  pastBookings: AppBooking[];
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  serviceRequests: ServiceRequest[];
  addServiceRequest: (req: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>) => ServiceRequest;
  updateServiceRequestStatus: (id: string, status: ServiceRequestStatus) => void;
  partnerOnline: boolean;
  setPartnerOnline: (online: boolean) => void;
  activeCategory: DestinationType;
  setActiveCategory: (category: DestinationType) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const BOOKINGS_KEY = '@tourdz_bookings';
const USER_KEY = '@tourdz_user';
const ORDERS_KEY = '@sahel_orders';
const REQUESTS_KEY = '@sahel_service_requests';
const PARTNER_ONLINE_KEY = '@sahel_partner_online';

const DEFAULT_USER: UserProfile = {
  name: '',
  phone: '',
  email: '',
  role: null,
  kycStatus: 'none',
  kycData: {},
  totalVisits: 0,
  isOnboarded: false,
};

function uid() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

function mapPartnerType(type: string): ServiceType {
  const map: Record<string, ServiceType> = {
    massage: 'massage',
    games: 'games',
    'beach-items': 'jetski',
    parking: 'parking',
    photos: 'photos',
    powerbank: 'powerbank',
    showers: 'showers',
  };
  return map[type] ?? 'games';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [bookings, setBookings] = useState<AppBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [partnerOnline, setPartnerOnlineState] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DestinationType>('beach');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRaw, userRaw, ordersRaw, requestsRaw, onlineRaw] = await Promise.all([
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ORDERS_KEY),
          AsyncStorage.getItem(REQUESTS_KEY),
          AsyncStorage.getItem(PARTNER_ONLINE_KEY),
        ]);
        if (bookingsRaw) setBookings(JSON.parse(bookingsRaw));
        if (userRaw) setUser({ ...DEFAULT_USER, ...JSON.parse(userRaw) });
        if (ordersRaw) setOrders(JSON.parse(ordersRaw));
        if (requestsRaw) setServiceRequests(JSON.parse(requestsRaw));
        if (onlineRaw != null) setPartnerOnlineState(onlineRaw === 'true');
      } catch {
        /* ignore */
      } finally {
        setIsLoaded(true);
      }
    };
    load();
  }, []);

  const saveUser = useCallback(async (updated: UserProfile) => {
    setUser(updated);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
  }, []);

  const saveBookings = useCallback(async (updated: AppBooking[]) => {
    setBookings(updated);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }, []);

  const saveOrders = useCallback(async (updated: Order[]) => {
    setOrders(updated);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }, []);

  const saveRequests = useCallback(async (updated: ServiceRequest[]) => {
    setServiceRequests(updated);
    await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  }, []);

  const setPartnerOnline = useCallback(async (online: boolean) => {
    setPartnerOnlineState(online);
    await AsyncStorage.setItem(PARTNER_ONLINE_KEY, String(online));
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      await saveUser({ ...user, ...updates });
    },
    [user, saveUser]
  );

  const setRole = useCallback(
    async (role: UserRole) => {
      await saveUser({ ...user, role });
    },
    [user, saveUser]
  );

  const submitKyc = useCallback(
    async (data: KycData) => {
      const submitted: UserProfile = {
        ...user,
        kycData: data,
        kycStatus: 'submitted',
        name: data.fullName ?? user.name,
        phone: data.phone ?? user.phone,
      };
      await saveUser(submitted);
      await new Promise((r) => setTimeout(r, 2000));
      await saveUser({ ...submitted, kycStatus: 'approved', isOnboarded: true });
    },
    [user, saveUser]
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(DEFAULT_USER);
  }, []);

  const addBooking = useCallback(
    (booking: Omit<AppBooking, 'id' | 'createdAt' | 'status'>): AppBooking => {
      const newBooking: AppBooking = {
        ...booking,
        id: uid(),
        createdAt: new Date().toISOString(),
        status: booking.type === 'spots' ? 'pending' : 'active',
        businessId:
          booking.type === 'spots' || booking.type === 'food'
            ? 'sahel-beach-1'
            : booking.businessId,
      };
      const updated = [newBooking, ...bookings];
      saveBookings(updated);
      updateUser({ totalVisits: user.totalVisits + 1 });

      const partnerTypes = ['massage', 'games', 'beach-items', 'parking', 'photos', 'powerbank', 'showers'];
      if (partnerTypes.includes(booking.type)) {
        const req: ServiceRequest = {
          id: uid(),
          userId: user.email || 'guest',
          serviceId: booking.type,
          serviceType: mapPartnerType(booking.type),
          customerName: user.name || 'Guest',
          status: 'pending',
          date: new Date().toISOString(),
          totalDZD: booking.price,
          createdAt: new Date().toISOString(),
        };
        saveRequests([req, ...serviceRequests]);
      }

      return newBooking;
    },
    [bookings, saveBookings, updateUser, user, serviceRequests, saveRequests]
  );

  const updateBookingStatus = useCallback(
    (id: string, status: AppBookingStatus) => {
      saveBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
    },
    [bookings, saveBookings]
  );

  const cancelBooking = useCallback(
    (id: string) => updateBookingStatus(id, 'cancelled'),
    [updateBookingStatus]
  );

  const completeBooking = useCallback(
    (id: string) => updateBookingStatus(id, 'completed'),
    [updateBookingStatus]
  );

  const getBookingById = useCallback((id: string) => bookings.find((b) => b.id === id), [bookings]);

  const addOrder = useCallback(
    (order: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
      const newOrder: Order = {
        ...order,
        id: uid(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        service_variant: order.service_variant ?? 'restaurant',
        variant_fields: order.variant_fields ?? {
          variant: 'restaurant',
          items: (order.items ?? []).map((item) => ({
            item_id: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unit_price_dzd: item.priceDZD,
            line_total_dzd: item.priceDZD * item.quantity,
          })),
          delivery_spot_label: order.spotLabel ?? 'Desk',
          estimated_prep_minutes: 15,
        },
      };
      saveOrders([newOrder, ...orders]);
      return newOrder;
    },
    [orders, saveOrders]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      saveOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    },
    [orders, saveOrders]
  );

  const addServiceRequest = useCallback(
    (req: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>): ServiceRequest => {
      const newReq: ServiceRequest = {
        ...req,
        id: uid(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      saveRequests([newReq, ...serviceRequests]);
      return newReq;
    },
    [serviceRequests, saveRequests]
  );

  const updateServiceRequestStatus = useCallback(
    (id: string, status: ServiceRequestStatus) => {
      saveRequests(serviceRequests.map((r) => (r.id === id ? { ...r, status } : r)));
    },
    [serviceRequests, saveRequests]
  );

  const activeBookings = bookings.filter(
    (b) => b.status === 'active' || b.status === 'confirmed' || b.status === 'pending'
  );
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        setRole,
        submitKyc,
        signOut,
        bookings,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        completeBooking,
        getBookingById,
        activeBookings,
        pastBookings,
        orders,
        addOrder,
        updateOrderStatus,
        serviceRequests,
        addServiceRequest,
        updateServiceRequestStatus,
        partnerOnline,
        setPartnerOnline,
        activeCategory,
        setActiveCategory,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
