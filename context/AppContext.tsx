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
  DocStatus,
  KycDocument,
} from '@/types/app';

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  submitKyc: (data: KycData) => Promise<void>;
  simulateKycApproval: () => Promise<void>;
  rejectKyc: (reason: string) => Promise<void>;
  resubmitKyc: (data: Partial<KycData>) => Promise<void>;
  signOut: () => void;
  reviews: AppReview[];
  addReview: (review: Omit<AppReview, 'id' | 'createdAt'>) => void;
  bookings: AppBooking[];
  addBooking: (booking: Omit<AppBooking, 'id' | 'createdAt' | 'status'>) => AppBooking;
  updateBookingStatus: (id: string, status: AppBookingStatus) => void;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  getBookingById: (id: string) => AppBooking | undefined;
  activeBookings: AppBooking[];
  pastBookings: AppBooking[];
  upcomingBookings: AppBooking[];
  completedBookings: AppBooking[];
  cancelledBookings: AppBooking[];
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
const REVIEWS_KEY = '@rihla_reviews';

export interface AppReview {
  id: string;
  bookingId: string;
  providerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

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

/** Seed demo bookings so the Trips tab is never empty on first launch */
function getSeedBookings(): AppBooking[] {
  const now = Date.now();
  const DAY = 86400000;
  return [
    // ── ACTIVE bookings ──
    {
      id: 'seed-1', type: 'hotel', icon: 'bed', iconFamily: 'Ionicons',
      color: '#0a2540', title: 'Hotel El Djazair', subtitle: 'Algiers · Seafront Suite',
      price: 14000, status: 'active', createdAt: new Date(now - 2 * DAY).toISOString(),
      expiresAt: new Date(now + 4 * DAY).toISOString(),
      details: { check_in: '2026-06-10', check_out: '2026-06-14', room_type: 'Seafront Suite', nights: 4, guests: 2, breakfast: 'Included' },
    },
    {
      id: 'seed-2', type: 'beach', icon: 'umbrella', iconFamily: 'Ionicons',
      color: '#00a896', title: 'Sidi Fredj Family Zone', subtitle: 'Tipaza · Spot A3 · Family Zone',
      price: 1500, status: 'active', createdAt: new Date(now - 3 * 3600000).toISOString(),
      expiresAt: new Date(now + 2 * 3600000).toISOString(),
      details: { spot: 'A3', zone: 'Family', rows: '4x6 grid', services: 'Parking, Food, Showers', hold_time: '20 min' },
    },
    {
      id: 'seed-3', type: 'driver', icon: 'car', iconFamily: 'Ionicons',
      color: '#3B82F6', title: 'Youcef — Airport Transfer', subtitle: 'Algiers Airport → City Center',
      price: 3000, status: 'active', createdAt: new Date(now - 25 * 60000).toISOString(),
      expiresAt: new Date(now + 15 * 60000).toISOString(),
      details: { vehicle: 'Toyota Camry 2024', pickup: 'Houari Boumediene Airport', dropoff: 'Algiers City Center', eta: '18 min', driver_rating: '4.7★' },
    },
    // ── UPCOMING (pending/confirmed) bookings ──
    {
      id: 'seed-4', type: 'experience', icon: 'compass', iconFamily: 'Ionicons',
      color: '#8B5CF6', title: '3-Day Sahara Expedition', subtitle: 'Tamanrasset → Hoggar Mountains',
      price: 35000, status: 'confirmed', createdAt: new Date(now - 5 * DAY).toISOString(),
      details: { duration: '3 days', departure: '2026-07-01', group_size: '8 max', includes: 'Transport, Meals, Camp, Guide', difficulty: 'Moderate' },
    },
    {
      id: 'seed-5', type: 'event', icon: 'musical-notes', iconFamily: 'Ionicons',
      color: '#EC4899', title: 'Rai Night Oran', subtitle: 'Oran Arena · 15 Jul 2026',
      price: 3500, status: 'confirmed', createdAt: new Date(now - 3 * DAY).toISOString(),
      details: { venue: 'Oran Arena', date: '15 Jul 2026', time: '21:00', ticket_type: 'General', age_restriction: '16+' },
    },
    {
      id: 'seed-6', type: 'guide', icon: 'map', iconFamily: 'Ionicons',
      color: '#F59E0B', title: 'Karim — Casbah Expert Guide', subtitle: 'Algiers · Full Day Tour',
      price: 4000, status: 'confirmed', createdAt: new Date(now - 2 * DAY).toISOString(),
      details: { guide: 'Karim (15 yrs exp)', languages: 'Arabic, French, English', duration: 'Full day (8h)', group_size: '12 max', includes: 'Walking tour, lunch' },
    },
    // ── COMPLETED bookings ──
    {
      id: 'seed-7', type: 'restaurant', icon: 'restaurant', iconFamily: 'Ionicons',
      color: '#EF4444', title: 'Le Saveur de Constantine', subtitle: 'Constantine · Couscous Royal',
      price: 2500, status: 'completed', createdAt: new Date(now - 7 * DAY).toISOString(),
      details: { cuisine: 'Traditional Algerian', meal: 'Couscous Royal + Mint Tea', guests: 4, total: '10,000 DA', rating: '4.6★' },
    },
    {
      id: 'seed-8', type: 'activity', icon: 'bicycle', iconFamily: 'Ionicons',
      color: '#10B981', title: 'Tandem Paragliding Djurdjura', subtitle: 'Bejaia · Mountain Flight',
      price: 8000, status: 'completed', createdAt: new Date(now - 14 * DAY).toISOString(),
      details: { activity: 'Tandem Paragliding', duration: '45 min', difficulty: 'Moderate', equipment: 'Included', rating: '4.9★' },
    },
    {
      id: 'seed-9', type: 'rental', icon: 'home', iconFamily: 'Ionicons',
      color: '#6366F1', title: 'Algiers Downtown Apartment', subtitle: 'Algiers · 2BR Modern',
      price: 6500, status: 'completed', createdAt: new Date(now - 21 * DAY).toISOString(),
      details: { bedrooms: 2, bathrooms: 1, max_guests: 4, amenities: 'WiFi, AC, Kitchen', nights: 3, property: 'Apartment' },
    },
    {
      id: 'seed-10', type: 'photographer', icon: 'camera', iconFamily: 'Ionicons',
      color: '#F97316', title: 'Amina — Sunset Photography', subtitle: 'Tipaza · Beach Session',
      price: 5000, status: 'completed', createdAt: new Date(now - 10 * DAY).toISOString(),
      details: { package: 'Quick Shoot (30 min)', deliverables: '20 edited photos', style: 'Beach & Sunset', turnaround: '3 days', rating: '4.8★' },
    },
    {
      id: 'seed-11', type: 'guide', icon: 'map', iconFamily: 'Ionicons',
      color: '#F59E0B', title: 'Fatima — Sahara Desert Guide', subtitle: 'Tamanrasset · Desert Trek',
      price: 5500, status: 'completed', createdAt: new Date(now - 30 * DAY).toISOString(),
      details: { guide: 'Fatima (10 yrs exp)', specialization: 'Desert Expeditions', languages: 'Arabic, French, Tamazight', duration: '2 days', rating: '5.0★' },
    },
    {
      id: 'seed-12', type: 'beach', icon: 'umbrella', iconFamily: 'Ionicons',
      color: '#00a896', title: 'Oran VIP Beach Club', subtitle: 'Oran · VIP Cabana B1',
      price: 3500, status: 'completed', createdAt: new Date(now - 18 * DAY).toISOString(),
      details: { spot: 'B1', zone: 'VIP', services: 'Pool, Bar, Towels, Massage', duration: 'Full day', rating: '4.8★' },
    },
    // ── CANCELLED bookings ──
    {
      id: 'seed-13', type: 'hotel', icon: 'bed', iconFamily: 'Ionicons',
      color: '#0a2540', title: 'Tlemcen Palace Hotel', subtitle: 'Tlemcen · Double Room',
      price: 6500, status: 'cancelled', createdAt: new Date(now - 25 * DAY).toISOString(),
      details: { room_type: 'Double', nights: 2, reason: 'Schedule conflict' },
    },
    {
      id: 'seed-14', type: 'event', icon: 'musical-notes', iconFamily: 'Ionicons',
      color: '#EC4899', title: 'Algiers Jazz Festival', subtitle: 'Algiers Opera House',
      price: 5000, status: 'cancelled', createdAt: new Date(now - 20 * DAY).toISOString(),
      details: { venue: 'Algiers Opera House', ticket: '3-Day Pass', reason: 'Travel plans changed' },
    },
    {
      id: 'seed-15', type: 'driver', icon: 'car', iconFamily: 'Ionicons',
      color: '#3B82F6', title: 'Bilal — Inter-City Luxury', subtitle: 'Algiers → Oran · Mercedes E-Class',
      price: 12000, status: 'cancelled', createdAt: new Date(now - 15 * DAY).toISOString(),
      details: { vehicle: 'Mercedes E-Class 2024', from: 'Algiers', to: 'Oran', reason: 'Found alternative transport' },
    },
  ];
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
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [partnerOnline, setPartnerOnlineState] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DestinationType>('beach');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRaw, userRaw, ordersRaw, requestsRaw, onlineRaw, reviewsRaw] = await Promise.all([
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(ORDERS_KEY),
          AsyncStorage.getItem(REQUESTS_KEY),
          AsyncStorage.getItem(PARTNER_ONLINE_KEY),
          AsyncStorage.getItem(REVIEWS_KEY),
        ]);
        if (bookingsRaw) {
          setBookings(JSON.parse(bookingsRaw));
        } else {
          // First launch — seed demo bookings
          const seed = getSeedBookings();
          setBookings(seed);
          await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(seed));
        }
        if (userRaw) setUser({ ...DEFAULT_USER, ...JSON.parse(userRaw) });
        if (ordersRaw) setOrders(JSON.parse(ordersRaw));
        if (requestsRaw) setServiceRequests(JSON.parse(requestsRaw));
        if (onlineRaw != null) setPartnerOnlineState(onlineRaw === 'true');
        if (reviewsRaw) setReviews(JSON.parse(reviewsRaw));
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
      // Set per-document initial status to 'pending'
      const idDoc = data.nationalIdDoc;
      const crDoc = data.commercialRegDoc;
      const txDoc = data.taxInfoDoc;
      const docsData: KycData = {
        ...data,
        nationalIdDoc: idDoc?.uri ? { uri: idDoc.uri, status: 'pending' } : undefined,
        commercialRegDoc: crDoc?.uri ? { uri: crDoc.uri, status: 'pending' } : undefined,
        taxInfoDoc: txDoc?.uri ? { uri: txDoc.uri, status: 'pending' } : undefined,
      };

      const submitted: UserProfile = {
        ...user,
        kycData: docsData,
        kycStatus: 'submitted',
        name: data.fullName ?? user.name,
        phone: data.phone ?? user.phone,
      };
      await saveUser(submitted);
      // NO auto-approve! Documents must be reviewed.
    },
    [user, saveUser]
  );

  /** Simulates an admin approving all KYC documents */
  const simulateKycApproval = useCallback(async () => {
    const approvedDocs: KycData = {
      ...user.kycData,
      nationalIdDoc: user.kycData.nationalIdDoc ? { ...user.kycData.nationalIdDoc, status: 'approved' } : undefined,
      commercialRegDoc: user.kycData.commercialRegDoc ? { ...user.kycData.commercialRegDoc, status: 'approved' } : undefined,
      taxInfoDoc: user.kycData.taxInfoDoc ? { ...user.kycData.taxInfoDoc, status: 'approved' } : undefined,
    };
    await saveUser({
      ...user,
      kycData: approvedDocs,
      kycStatus: 'approved',
      isOnboarded: true,
    });
  }, [user, saveUser]);

  /** Simulates an admin rejecting KYC with a reason */
  const rejectKyc = useCallback(async (reason: string) => {
    const rejectedDocs: KycData = {
      ...user.kycData,
      nationalIdDoc: user.kycData.nationalIdDoc ? { ...user.kycData.nationalIdDoc, status: 'rejected', rejectedReason: 'Document unclear' } : undefined,
      commercialRegDoc: user.kycData.commercialRegDoc ? { ...user.kycData.commercialRegDoc, status: 'rejected', rejectedReason: 'Missing signature' } : undefined,
    };
    await saveUser({
      ...user,
      kycData: rejectedDocs,
      kycStatus: 'rejected',
      kycRejectionReason: reason,
    });
  }, [user, saveUser]);

  /** Resubmit KYC after rejection */
  const resubmitKyc = useCallback(async (data: Partial<KycData>) => {
    const updatedDocs: KycData = {
      ...user.kycData,
      ...data,
      nationalIdDoc: data.nationalIdDoc ? { uri: data.nationalIdDoc.uri ?? user.kycData.nationalIdDoc?.uri ?? '', status: 'pending' } : user.kycData.nationalIdDoc,
      commercialRegDoc: data.commercialRegDoc ? { uri: data.commercialRegDoc.uri ?? user.kycData.commercialRegDoc?.uri ?? '', status: 'pending' } : user.kycData.commercialRegDoc,
      taxInfoDoc: data.taxInfoDoc ? { uri: data.taxInfoDoc.uri ?? user.kycData.taxInfoDoc?.uri ?? '', status: 'pending' } : user.kycData.taxInfoDoc,
    };
    await saveUser({
      ...user,
      kycData: updatedDocs,
      kycStatus: 'submitted',
      kycRejectionReason: undefined,
    });
  }, [user, saveUser]);

  const saveReviews = useCallback(async (updated: AppReview[]) => {
    setReviews(updated);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  }, []);

  const addReview = useCallback(
    (review: Omit<AppReview, 'id' | 'createdAt'>) => {
      const newReview: AppReview = {
        ...review,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      saveReviews([newReview, ...reviews]);
    },
    [reviews, saveReviews]
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
  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        setRole,
        submitKyc,
        simulateKycApproval,
        rejectKyc,
        resubmitKyc,
        signOut,
        reviews,
        addReview,
        bookings,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        completeBooking,
        getBookingById,
        activeBookings,
        pastBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
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
