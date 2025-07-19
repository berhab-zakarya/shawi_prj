export interface Contract {
  id: number
  contract_type: "NDA" | null // Only NDA type
  status:
    | "DRAFT"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "SIGNED_BY_CLIENT"
    | "SIGNED_BY_LAWYER"
    | "COMPLETED"
    | "EXPORTED"
  data: NDAContractData // Use specific NDA data type
  full_text: string
  text_version: string
  needs_review: boolean
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: number
  contract: number
  lawyer: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  review_notes: string
  created_at: string
  updated_at: string
}

export interface ContractSignature {
  id: number
  contract: number
  user: number
  ip_address: string
  signed_at: string
  signature_hash: string
  public_key: string
  barcode_svg: string
  verification_status?: "valid" | "invalid" | "pending"
}

export interface SignatureVerification {
  status: "valid" | "invalid"
  message: string
  signed_by: string
  signed_at: string
  contract_id: number
  signature_id: number
  verification_details: {
    public_key_valid: boolean
    signature_valid: boolean
    content_hash_valid: boolean
    timestamp_valid: boolean
  }
}

// Specific interface for NDA contract data
export interface NDAContractData {
  effective_date: string
  disclosing_party: string
  disclosing_party_address: string
  receiving_party: string
  receiving_party_address: string
  purpose: string
  confidential_info: string
  term: string
  governing_law: string
  signature_date: string
}

export interface CreateContractRequest {
  contract_type: "NDA" // Only NDA type allowed for creation
  data: NDAContractData // Use specific NDA data type
  needs_review?: boolean
}

export interface ExportContractRequest {
  format: "pdf" | "docx"
}

export interface EnhanceContractRequest {
  enhancement_type: "enhance" | "correct" | "translate"
}

export interface EnhanceContractResponse {
  text_version: string
  full_text: string
  enhancement_type: "enhance" | "correct" | "translate"
}

export interface ContractAnalytics {
  type_counts: { contract_type: string; count: number }[]
  status_counts: { status: string; count: number }[]
  average_review_time_days: number
}

export interface SignContractRequest {
  signature_hash: string
  public_key: string
  contract_hash: string
}
export interface AssignReview {
  id: number;
  contract: number;
  lawyer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string | null;
  };
  status: string;
  review_notes: string;
  created_at: string;
  updated_at: string;
}

export interface VerifySignatureRequest {
  signature_id: number
  contract_content?: string
}

export type ContractType = "NDA" // Only NDA type

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [{ value: "NDA", label: "اتفاقية عدم إفشاء" }]
