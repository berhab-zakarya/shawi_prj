export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string | null;
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
}

export interface AdminUserResponse extends Array<AdminUser> {}

export interface UserProfile {
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  nationality?: string;
  languages?: string;
  occupation?: string;
  company_name?: string;
  education?: string;
  license_number?: string;
  bar_association?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website?: string;
}

export interface UpdateAdminUserData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  time_zone?: string;
  role?: number;
  avatar?: File | null;
  profile?: UserProfile;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  user: number;
  user_email: string;
  created_by: number;
  created_by_email: string;
  created_at: string;
  read: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface NotificationResponse extends Array<Notification> {}

export interface NotificationCreateData {
  title: string;
  message: string;
  user: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}