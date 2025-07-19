// types.ts - Type definitions
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'Client' | 'Lawyer' | 'Admin';
  avatar?: string;
  time_zone: string;
  date_joined: string;
}

export interface Case {
  id: string;
  title: string;
  description?: string;
  case_type: 'property' | 'commercial' | 'criminal' | 'family' | 'labor' | 'other';
  status: 'draft' | 'in_review' | 'consultation_requested' | 'analysis_complete' | 'closed';
  priority: 'low' | 'medium' | 'high';
  client: {
    id: string;
    full_name: string;
    email?: string;
  };
  assigned_lawyer?: {
    id: string;
    full_name: string;
  };
  ai_analysis_result?: AIAnalysisResult;
  ai_confidence_score?: number;
  legal_strength?: 'weak' | 'moderate' | 'strong';
  estimated_duration?: string;
  recommended_actions?: string;
  document_count?: number;
  has_ai_analysis?: boolean;
  documents?: Document[];
  notes?: Note[];
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title?: string;
  original_filename?: string;
  file_url: string;
  file_size_mb: number;
  file_type?: string;
  document_type: 'evidence' | 'contract' | 'correspondence' | 'other';
  is_processed: boolean;
  ai_extracted_text?: string;
  ai_keywords?: string[];
  uploaded_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  is_private: boolean;
  author: {
    id: string;
    full_name: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: 'case_status_changed' | 'document_uploaded' | 'ai_analysis_complete' | 'note_added';
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  time_since: string;
  action_url?: string;
}

export interface AIAnalysisResult {
  legal_issues: Array<{
    issue: string;
    confidence: number;
    relevant_laws: string[];
  }>;
  recommended_actions: string[];
  similar_cases: Array<{
    case_id: string;
    outcome: string;
    similarity: number;
  }>;
}

export interface CaseStatistics {
  total_cases: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_cases: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateCaseData {
  title: string;
  description: string;
  case_type: Case['case_type'];
  priority: Case['priority'];
  language: string;
}

export interface UpdateCaseData {
  title?: string;
  description?: string;
  status?: Case['status'];
  priority?: Case['priority'];
  assigned_lawyer?: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  time_zone?: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  is_private: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  is_private?: boolean;
}

// Add this to your types.ts file

export interface RecentActivity {
  id: string;
  type: 'case_created' | 'case_updated' | 'case_status_changed' | 'document_uploaded' | 'document_deleted' | 'note_added' | 'note_updated' | 'ai_analysis_complete' | 'lawyer_assigned' | 'case_closed';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high';
  
  // Related entity IDs (optional based on activity type)
  caseId?: string;
  documentId?: string;
  noteId?: string;
  userId?: string;
  
  // Related entity data for quick access
  case?: {
    id: string;
    title: string;
    case_type: Case['case_type'];
    status: Case['status'];
  };
  
  document?: {
    id: string;
    original_filename?: string;
    document_type: Document['document_type'];
    file_size_mb: number;
  };
  
  note?: {
    id: string;
    title: string;
    is_private: boolean;
  };
  
  user?: {
    id: string;
    full_name: string;
    role: User['role'];
  };
  
  // Additional metadata
  metadata?: {
    previous_status?: Case['status'];
    new_status?: Case['status'];
    ai_confidence_score?: number;
    file_type?: string;
    [key: string]: any;
  };
  
  // UI helpers
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  action_url?: string;
  is_important?: boolean;
}

// Helper type for creating activity entries
export interface CreateActivityData {
  type: RecentActivity['type'];
  title: string;
  description: string;
  caseId?: string;
  documentId?: string;
  noteId?: string;
  userId?: string;
  priority?: RecentActivity['priority'];
  metadata?: RecentActivity['metadata'];
}

// Type for activity filters
export interface ActivityFilters {
  types?: RecentActivity['type'][];
  caseId?: string;
  userId?: string;
  priority?: RecentActivity['priority'];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// Type for activity summary/statistics
export interface ActivityStatistics {
  total_activities: number;
  by_type: Record<RecentActivity['type'], number>;
  by_priority: Record<'low' | 'medium' | 'high', number>;
  today_count: number;
  this_week_count: number;
  this_month_count: number;
}

export interface ClientDashboardData {
  cases: Case[]
  documents: Document[]
  notifications: Notification[]
  statistics: CaseStatistics | null
  recentActivity: RecentActivity[]
  unreadNotifications: number
}
