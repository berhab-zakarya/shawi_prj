
// Document types
export interface Document {
  id: number;
  title: string;
  file: string;
  file_url: string | null;
  file_path: string | null;
  document_type: 'PDF' | 'DOCX' | 'TXT';
  uploaded_by: string;
  uploaded_at: string;
  analyses: any[];
}

// AI Response types
export interface AIResponse {
  id: number;
  user: string;
  question: string;
  answer: string;
  created_at: string;
  rating: number | null;
  context_documents: Document[];
  pdf_export: string | null;
}

// WebSocket message types
export interface WebSocketMessage {
  message: string;
  type: 'status' | 'answer' | 'error';
  response_id?: number;
  error?: string;
}

// Request types
export interface AskQuestionRequest {
  question: string;
  use_context: boolean;
}

export interface RateResponseRequest {
  rating: number; // 1-5
}

// Response types
export interface AIResponseListResponse {
  results: AIResponse[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface DocumentUploadRequest {
  title: string;
  file?: File;
  file_url?: string;
  file_path?: string;
  document_type: 'PDF' | 'DOCX' | 'TXT';
}

// Hook return types
export interface UseAIAssistantReturn {
  // State
  responses: AIResponse[];
  currentResponse: AIResponse | null;
  loading: boolean;
  error: string;
  wsConnected: boolean;
  streamingAnswer: string;
  
  // Actions
  askQuestion: (question: string, useContext?: boolean) => Promise<void>;
  getResponses: () => Promise<void>;
  getResponse: (id: number) => Promise<void>;
  rateResponse: (id: number, rating: number) => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  clearError: () => void;
  clearStreamingAnswer: () => void;
}

// WebSocket hook return types
export interface UseAIWebSocketReturn {
  wsConnected: boolean;
  streamingAnswer: string;
  isStreaming: boolean;
  error: string;
  askQuestion: (question: string, useContext?: boolean) => Promise<number | null>;
  connect: () => void;
  disconnect: () => void;
  clearStreamingAnswer: () => void;
}

// Error types
export interface APIError {
  detail?: string;
  message?: string;
  [key: string]: any;
}