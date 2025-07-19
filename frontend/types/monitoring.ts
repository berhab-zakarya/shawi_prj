
// Define TypeScript interfaces based on backend serializers
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  fullname: string;
  role: string;
  bio: string | null;
  avatar: string | null;
  avatar_url: string | null;
  time_zone: string | null;
  date_joined: string;
  phone_number: string | null;
}

export interface Service {
  id: number;
  title: string;
  price: string;
  category: string;
  description: string;
  lawyer: User;
  lawyer_fullname: string;
  created_at: string;
  updated_at: string;
  requests: ServiceRequest[];
}

export interface ServiceRequest {
  id: number;
  client: User;
  lawyer: User;
  service: Service;
  status: string;
  created_at: string;
  updated_at: string;
  documents: Document[];
  review: Review | null;
}

export interface Payment {
  id: number;
  request: ServiceRequest;
  amount: string;
  status: string;
  timestamp: string;
}

export interface Document {
  id: number;
  request: ServiceRequest;
  file: string;
  file_url: string | null;
  uploaded_by: User;
  uploaded_by_fullname: string;
  uploaded_at: string;
}



export interface Review {
  id: number;
  request: ServiceRequest;
  rating: number;
  comment: string;
  client_fullname: string;
  timestamp: string;
}

export interface ServiceData {
  title?: string;
  price?: string;
  category?: string;
  description?: string;
  lawyer_id?: number;
}

export interface PaymentData {
  status?: string;
}

export interface DocumentData {
  file?: File;
  uploaded_by_id?: number;
}

export interface ReviewData {
  rating?: number;
  comment?: string;
}