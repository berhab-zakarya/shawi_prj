interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  avatar: string | null;
  time_zone: string;
}

export interface Case {
  id: string;
  title: string;
  description?: string;
  case_type: string;
  case_type_display: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  client: User;
  assigned_lawyer: User;
  ai_analysis_result?: any;
  ai_analysis_date?: string;
  ai_confidence_score?: number;
  legal_strength?: string;
  estimated_duration?: string;
  recommended_actions?: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  language: string;
  documents?: Document[];
  notes?: Note[];
  document_count: number;
  has_ai_analysis: boolean;
}


export interface Document {
  id: string;
  file: string;
  file_url: string;
  preview_url: string;
  original_filename: string;
  file_size: number;
  file_size_mb: number;
  file_type: string;
  document_type: string;
  title: string;
  description: string;
  is_processed: boolean;
  processing_error: string;
  uploaded_at: string;
  processed_at: string | null;
  ai_analysis_result?: any;
  ai_extracted_text: string;
  ai_keywords: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  is_private: boolean;
  author: User;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
}

export interface CaseStatistics {
  total_cases: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_cases: number;
}

export interface RecentActivity {
  id: string;
  type: 'case_created' | 'case_updated' | 'document_uploaded' | 'note_created' | 'ai_analysis_completed';
  title: string;
  description: string;
  timestamp: string;
  caseId?: string;
  documentId?: string;
  noteId?: string;
}

export interface CaseFilters {
  status?: string;
  case_type?: string;
  priority?: string;
  language?: string;
  search?: string;
  ordering?: string;
  include_archived?: boolean;
}

export interface DocumentUpload {
  file: File;
  document_type: string;
  title: string;
  description?: string;
}

export interface NoteCreate {
  title: string;
  content: string;
  is_private?: boolean;
}

interface DashboardStats {
  total_cases: number;
  active_cases: number;
  pending_reviews: number;
  urgent_cases: number;
  unread_notifications: number;
  last_updated: string;
}
export interface LawyerDashboard {
  stats: DashboardStats;
  recent_cases: Case[];
  recent_documents: Document[];
  recent_notes: Note[];
  unread_notifications_count: number;
}
// Main dashboard data interface
export interface LawyerDashboardData {
  cases: Case[];
  documents: Document[];
  notes: Note[];
  statistics: CaseStatistics | null;
  recentActivity: RecentActivity[];
  currentCase: Case | null;
  currentDocument: Document | null;
  currentNote: Note | null;
}
export type ModalType = "new-case" | "new-message" | "schedule-meeting" | "time-entry" | null
export type DashboardSection =
  | "overview"
  | "caseload"
  | "marketplace"
  | "documents"
  | "communications"
  | "notifications"
  | "workflow"
