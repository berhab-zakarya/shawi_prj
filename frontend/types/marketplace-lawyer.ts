interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  fullname: string
  role: string
  avatar: string | null
  time_zone: string
}

export interface Service {
  id: number
  title: string
  price: string
  category: string
  description: string
  lawyer: number
  lawyer_fullname: string
}

export interface ServiceDocument {
  id: number
  request: number
  file: string
  file_url: string
  uploaded_by: number
  uploaded_by_fullname: string
  uploaded_at: string // ISO timestamp
}

export interface ServiceReview {
  id: number
  request: number
  rating: number
  comment: string
  client_fullname: string
  timestamp: string // ISO timestamp
}

export interface MarketplaceOrder {
  id: number
  client: User
  lawyer: User
  service: Service
  status: string
  created_at: string
  updated_at: string
  documents: ServiceDocument[]
  review: ServiceReview | null
}

export type MarketplaceOrderList = MarketplaceOrder[]

export type ServiceList = Service[]

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

export interface ServiceRequest {
  id: number
  client: ClientProfile
  lawyer: LawyerProfile
  service: MarketplaceService
  status: "Pending" | "In Progress" | "Completed" | "Cancelled" |"Accepted"  | "Rejected"
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
  requests: ServiceRequest[]
}

export type MarketplaceServiceList = MarketplaceService[]
