export interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  zipcode: string;
  avatar?: string;
  accountstatus: "Activated" | "Deactivated";
  twoFactorEnabled: boolean;
  profileStatus?: boolean;
  emailPreferences?: {
    security: boolean;
    marketing: boolean;
  };
}