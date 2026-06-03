/** SAHEL auth roles (Supabase-aligned) */
export type Role = 'client' | 'provider';

export type KYCStatus = 'approved' | 'pending_upload' | 'under_review' | 'rejected';

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  wilaya: string;
  avatarUrl?: string;
  kycStatus: KYCStatus;
  createdAt: string;
  updatedAt: string;
};

/** Maps legacy in-app roles to SAHEL domain roles */
export type LegacyAppRole = 'traveler' | 'business' | 'partner';

export function toSahelRole(legacy: LegacyAppRole | null): Role {
  if (legacy === 'business' || legacy === 'partner') return 'provider';
  return 'client';
}
