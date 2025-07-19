export type UserRole = "Client" | "Lawyer" | "Admin"

export type CaseStatus = "draft" | "submitted" | "in_review" | "in_progress" | "completed" | "cancelled"

export type Priority = "low" | "medium" | "high" | "urgent"

export type CaseType =
  | "civil"
  | "criminal"
  | "commercial"
  | "family"
  | "labor"
  | "property"
  | "tax"
  | "administrative"
  | "other"

export interface FilterOptions {
  search?: string
  status?: string
  priority?: string
  case_type?: string
  assigned_lawyer?: string
  client?: string
  date_from?: string
  date_to?: string
  is_archived?: boolean
  include_archived?: boolean
  is_read?: boolean
  notification_type?: string
  document_type?: string
  is_processed?: boolean
  page?: number
  page_size?: number
  ordering?: string
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// export interface User {
//   id: string
//   email: string
//   first_name: string
//   last_name: string
//   role: UserRole
//   is_active: boolean
//   created_at: string
//   updated_at: string
// }
