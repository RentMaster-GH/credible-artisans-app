// types/index.ts
export type PortalMode = 'artisan' | 'client';

export interface ClientProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}