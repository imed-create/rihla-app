/** Runtime app-context user types (legacy onboarding flow) */
export type UserRole = 'traveler' | 'business' | 'partner';

export type KycStatus = 'none' | 'submitted' | 'approved';

export type KycData = {
  fullName?: string;
  phone?: string;
  nationality?: string;
  selfieUri?: string;
  businessName?: string;
  businessType?: string;
  tradeRegisterUri?: string;
  assetType?: string;
  assetCount?: number;
  assetPhotoUri?: string;
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
};

export type { AppBooking, AppBookingStatus, IconFamily, KycFieldProps } from './booking';
