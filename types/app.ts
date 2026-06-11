/** Runtime app-context user types (legacy onboarding flow) */

export type UserRole = 'traveler' | 'business' | 'partner';

export type KycStatus = 'none' | 'submitted' | 'approved' | 'rejected';

export type DocStatus = 'pending' | 'approved' | 'rejected';

export type KycDocument = {
  uri: string;
  status: DocStatus;
  rejectedReason?: string;
};

export type KycData = {
  fullName?: string;
  phone?: string;
  nationality?: string;
  selfieUri?: string;
  businessName?: string;
  businessType?: string;
  tradeRegisterUri?: string;
  /** Per-document verification status */
  nationalIdDoc?: KycDocument;
  commercialRegDoc?: KycDocument;
  taxInfoDoc?: KycDocument;
  logoUri?: string;
  coverUri?: string;
  wilaya?: string;
  city?: string;
  street?: string;
  gpsLat?: string;
  gpsLng?: string;
  /** Legacy fields kept for backward compatibility */
  assetType?: string;
  assetCount?: number;
  assetPhotoUri?: string;
};

export type TravelPreferences = {
  budget?: 'budget' | 'mid-range' | 'premium' | 'luxury';
  accommodation?: 'hotel' | 'hostel' | 'rental' | 'camping' | 'any';
  interests?: string[];
  dietaryRestrictions?: string[];
  languagesSpoken?: string[];
  travelStyle?: 'solo' | 'couple' | 'family' | 'group' | 'any';
};

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

export type UserProfile = {
  name: string;
  phone: string;
  email: string;
  role: UserRole | null;
  kycStatus: KycStatus;
  kycData: KycData;
  totalVisits: number;
  isOnboarded: boolean;
  /** When KYC was rejected, store admin reason */
  kycRejectionReason?: string;
  /** Extended traveler profile */
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  address?: string;
  wilaya?: string;
  bio?: string;
  avatarUrl?: string;
  emergencyContact?: EmergencyContact;
  travelPreferences?: TravelPreferences;
  notificationPrefs?: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    bookingUpdates: boolean;
    promotions: boolean;
  };
};

export type { AppBooking, AppBookingStatus, IconFamily, KycFieldProps } from './booking';
