interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  fullname: string;
  role: string;
  avatar: string | null;
  time_zone: string;
}

export interface Service {
    id: number;
    title: string;
    price: string;
    category: string;
    description: string;
    lawyer: number;
    lawyer_fullname: string;
}

interface Document {
  id: number;
  request: number;
  file: string;
  file_url: string;
  uploaded_by: number;
  uploaded_by_fullname: string;
  uploaded_at: string; // ISO timestamp
}

interface Review {
  id: number;
  request: number;
  rating: number;
  comment: string;
  client_fullname: string;
  timestamp: string; // ISO timestamp
}

export interface MarketplaceOrder {
    id: number;
    client: User;
    lawyer: User;
    service: Service;
    status: string;
    created_at: string;
    updated_at: string;
    documents: Document[]; // You can define a Document interface if needed
    review: Review | null; // You can define a Review interface if needed
}

export type MarketplaceOrderList = MarketplaceOrder[];


/// Lawyer

export interface Service {
  id: number;
  title: string;
  price: string; // e.g. "150.00"
  category: string;
  description: string;
  lawyer: number; // lawyer ID
  lawyer_fullname: string;
}

export type ServiceList = Service[];
export interface CreateServiceRequest {
  title: string
  price: string
  category: string
  description: string
}

export interface UpdateServiceRequest {
  title: string
  price: string
  category: string
  description: string
}


export const SERVICE_CATEGORIES = [
  { value: "Legal Consultation", label: "استشارة قانونية" },
  { value: "Business Law", label: "قانون الأعمال" },
  { value: "Real Estate Law", label: "قانون العقارات" },
  { value: "Family Law", label: "قانون الأسرة" },
  { value: "Criminal Law", label: "قانون جنائي" },
  { value: "Corporate Law", label: "قانون الشركات" },
]



export interface LawyerProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  fullname: string
  role: string
  bio: string
  avatar: string | null
  avatar_url: string | null
  time_zone: string
  date_joined: string
  phone_number: string | null
}

export interface ClientProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  fullname: string
  role: string
  bio: string
  avatar: string | null
  avatar_url: string | null
  time_zone: string
  date_joined: string
  phone_number: string | null
}

export interface ServiceDocument {
  id: number
  request: number
  file: string
  file_url: string
  uploaded_by: number
  uploaded_by_fullname: string
  uploaded_at: string
}

export interface ServiceReview {
  id: number
  request: number
  rating: number
  comment: string
  client_fullname: string
  timestamp: string
}

export interface ServiceRequest {
  id: number
  client: ClientProfile
  lawyer: LawyerProfile
  service: number
  status: "Pending" | "In Progress" | "Completed" | "Cancelled"
  created_at: string
  updated_at: string
  documents: ServiceDocument[]
  review: ServiceReview | null
}

export interface MarketplaceService {
  id: number
  title: string
  price: string
  category: string
  description: string
  lawyer: LawyerProfile
  lawyer_fullname: string
  created_at: string
  updated_at: string
  request_status:string;
  requests: ServiceRequest[]
}

export type MarketplaceServiceList = MarketplaceService[]
