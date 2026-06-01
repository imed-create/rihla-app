import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DestinationType } from "@/constants/destinations";

export type BookingStatus = "active" | "completed" | "cancelled";
export type UserRole = "traveler" | "business" | "partner";
export type KycStatus = "none" | "submitted" | "approved";

export interface Booking {
  id: string;
  type: string;
  icon: string;
  iconFamily: string;
  color: string;
  title: string;
  subtitle: string;
  price: number;
  status: BookingStatus;
  createdAt: string;
  expiresAt?: string;
  details: Record<string, string | number | boolean>;
}

export interface KycData {
  // Traveler
  fullName?: string;
  phone?: string;
  nationality?: string;
  selfieUri?: string;
  // Business Owner
  businessName?: string;
  businessType?: string;
  tradeRegisterUri?: string;
  // Service Partner
  assetType?: string;
  assetCount?: number;
  assetPhotoUri?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  role: UserRole | null;
  kycStatus: KycStatus;
  kycData: KycData;
  totalVisits: number;
  isOnboarded: boolean;
}

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  setRole: (role: UserRole) => void;
  submitKyc: (data: KycData) => Promise<void>;
  signOut: () => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  getBookingById: (id: string) => Booking | undefined;
  activeBookings: Booking[];
  pastBookings: Booking[];
  activeCategory: DestinationType;
  setActiveCategory: (category: DestinationType) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const BOOKINGS_KEY = "@tourdz_bookings";
const USER_KEY = "@tourdz_user";

const DEFAULT_USER: UserProfile = {
  name: "",
  phone: "",
  email: "",
  role: null,
  kycStatus: "none",
  kycData: {},
  totalVisits: 0,
  isOnboarded: false,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeCategory, setActiveCategory] = useState<DestinationType>("beach");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRaw, userRaw] = await Promise.all([
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (bookingsRaw) setBookings(JSON.parse(bookingsRaw));
        if (userRaw) setUser({ ...DEFAULT_USER, ...JSON.parse(userRaw) });
      } catch {
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

  const saveBookings = useCallback(async (updated: Booking[]) => {
    setBookings(updated);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      const updated = { ...user, ...updates };
      await saveUser(updated);
    },
    [user, saveUser]
  );

  const setRole = useCallback(
    async (role: UserRole) => {
      const updated = { ...user, role };
      await saveUser(updated);
    },
    [user, saveUser]
  );

  const submitKyc = useCallback(
    async (data: KycData) => {
      // Simulate review → auto-approve after 2s
      const submitted = {
        ...user,
        kycData: data,
        kycStatus: "submitted" as KycStatus,
        name: data.fullName ?? user.name,
        phone: data.phone ?? user.phone,
      };
      await saveUser(submitted);
      // Auto-approve (swap for real review logic later)
      await new Promise((r) => setTimeout(r, 2000));
      const approved = {
        ...submitted,
        kycStatus: "approved" as KycStatus,
        isOnboarded: true,
      };
      await saveUser(approved);
    },
    [user, saveUser]
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(DEFAULT_USER);
  }, []);

  const addBooking = useCallback(
    (booking: Omit<Booking, "id" | "createdAt" | "status">): Booking => {
      const newBooking: Booking = {
        ...booking,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
        createdAt: new Date().toISOString(),
        status: "active",
      };
      const updated = [newBooking, ...bookings];
      saveBookings(updated);
      updateUser({ totalVisits: user.totalVisits + 1 });
      return newBooking;
    },
    [bookings, saveBookings, updateUser, user.totalVisits]
  );

  const cancelBooking = useCallback(
    (id: string) => {
      const updated = bookings.map((b) =>
        b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b
      );
      saveBookings(updated);
    },
    [bookings, saveBookings]
  );

  const completeBooking = useCallback(
    (id: string) => {
      const updated = bookings.map((b) =>
        b.id === id ? { ...b, status: "completed" as BookingStatus } : b
      );
      saveBookings(updated);
    },
    [bookings, saveBookings]
  );

  const getBookingById = useCallback(
    (id: string) => bookings.find((b) => b.id === id),
    [bookings]
  );

  const activeBookings = bookings.filter((b) => b.status === "active");
  const pastBookings = bookings.filter((b) => b.status !== "active");

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
        cancelBooking,
        completeBooking,
        getBookingById,
        activeBookings,
        pastBookings,
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
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
