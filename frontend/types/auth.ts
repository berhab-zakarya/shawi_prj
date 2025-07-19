/* LOGIN */
export type LoginResponse = {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
    refresh: string;
    access: string;
    role:string;
};

export type LoginResponseFailed = {
    email?: string[];
    password?: string[];
};


/* REGISTER */
export type RegisterErrorDetails = {
    email?: string[];
    first_name?: string[];
    last_name?: string[];
    role?: string[];
    [key: string]: string[] | undefined;
};

export type RegisterError = {
    errors: string;
    details: RegisterErrorDetails;
};


/* PROFILE */
export interface ProfileResponse {
  user_id?:string|number;
  avatar: string | null;
  date_joined: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  bio?: string;
  time_zone?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
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

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  time_zone?: string;
  role?: number;
  avatar?: File | null;
  profile?: {
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    date_of_birth?: string;
    gender?: string;
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
  };
}