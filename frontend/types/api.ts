
export interface User {
  id: string | number;
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
export interface Case {
  id: string
  title: string
  description: string
  case_type: string
  case_type_display: string
  status: "draft" | "submitted" | "in_review" | "in_progress" | "completed" | "cancelled" | "open" | "pending"
  priority: "low" | "medium" | "high" | "urgent"
  client: string | User
  assigned_lawyer?: string | User
  created_at: string
  updated_at: string
  due_date?: string
  is_archived: boolean
  document_count: number
  documents_count?: number
  notes_count?: number
  has_ai_analysis: boolean
  legal_strength?: "weak" | "moderate" | "strong"
}

export interface CreateCaseRequest {
  title: string
  description: string
  case_type: string
  priority: "low" | "medium" | "high" | "urgent"
  client: string
  assigned_lawyer?: string
  due_date?: string
  documents?: File[]
}

export interface UpdateCaseRequest {
  title?: string
  description?: string
  case_type?: string
  status?: "draft" | "submitted" | "in_review" | "in_progress" | "completed" | "cancelled" | "open" | "pending"
  priority?: "low" | "medium" | "high" | "urgent"
  assigned_lawyer?: string
  due_date?: string
  is_archived?: boolean
}

export interface Document {
  id: string
  title: string
  description: string
  document_type: string
  file_path: string
  file_url: string
  file_name: string
  file_size: number
  original_filename: string
  case?: string
  case_id?: string
  uploaded_by: string | User
  created_at: string
  updated_at: string
  is_processed: boolean
}

export interface UploadDocumentRequest {
  title: string
  description: string
  document_type: string
  file: File
  case?: string
  case_id?: string
}

export interface UpdateDocumentRequest {
  title?: string
  description?: string
  document_type?: string
  is_processed?: boolean
}

export interface Note {
  id: string
  content: string
  case: string
  case_id: string
  created_by: string | User
  created_at: string
  updated_at: string
  is_private: boolean
}

export interface CreateNoteRequest {
  content: string
  case: string
  case_id: string
  is_private?: boolean
}

export interface UpdateNoteRequest {
  content?: string
  is_private?: boolean
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  notification_type: "case_update" | "document_upload" | "assignment" | "deadline" | "system"
  is_read: boolean
  created_at: string
  related_case?: Case
  recipient: string | User
  case_id?: string
  document_id?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  role: "Client" | "Lawyer" | "Admin"
}

type UserRole = "Client" | "Lawyer" | "Admin"
