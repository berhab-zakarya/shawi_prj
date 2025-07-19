export interface Document {
  id: number
  title: string
  file: string
  file_url: string | null
  file_path: string | null
  document_type: "PDF" | "DOCX" | "TXT"
  uploaded_by: string
  uploaded_at: string
  analyses: AnalysisResult[]
}
export interface DocumentUploadData {
  title: string
  file?: File
  file_url?: string
  file_path?: string
  document_type: "PDF" | "DOCX" | "TXT"
}
export interface AnalysisResult {
  id: number
  document_id: number
  analysis_text: string
  created_at: string
  confidence_score: number
  analysis_type: string
}
export interface AIAnalysisResult {
  id: number
  document_id: number
  analysis_text: string
  created_at: string
  confidence_score: number
  analysis_type: string
}

export interface DocumentUpdateData {
  title?: string
  document_type?: "PDF" | "DOCX" | "TXT"
}
export interface ApiError {
  error?: string
  non_field_errors?: string[]
  detail?: string
}
export const DOCUMENT_TYPES = [
  { value: "PDF" as const, label: "PDF", icon: "📄" },
  { value: "DOCX" as const, label: "Word Document", icon: "📝" },
  { value: "TXT" as const, label: "Text File", icon: "📃" },
]
