export type IconFamily = 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';

export type AppBookingStatus = 'active' | 'completed' | 'cancelled' | 'pending' | 'confirmed';

/** Booking = service reservations (hotel, guide, event…), Order = transactional (ride, food, beach) */
export type BookingLane = 'booking' | 'order';

/** Traveler booking stored in AppContext (UI ticket) */
export type AppBooking = {
  id: string;
  type: string;
  icon: string;
  iconFamily: IconFamily;
  color: string;
  title: string;
  subtitle: string;
  price: number;
  status: AppBookingStatus;
  createdAt: string;
  expiresAt?: string;
  businessId?: string;
  beachId?: string;
  lane?: BookingLane;
  details: Record<string, string | number | boolean>;
};

export type KycFieldProps = {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  icon?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
};
