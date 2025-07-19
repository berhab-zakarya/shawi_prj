
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
}

export interface Signature {
  id: number;
  contract: number;
  user: User;
  ip_address: string;
  signed_at: string;
  barcode_svg: string;
}

export interface Review {
  id: number;
  contract: number;
  lawyer: User;
  status: string;
  review_notes: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  client: User | null;
  contract_type: string;
  status: string;
  data: Record<string, any>;
  text_version: string;
  full_text: string;
  needs_review: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  reviews: Review[];
  signatures: Signature[];
}

export interface ContractResponse {
  data: Contract | Contract[];
  message?: string;
}

export interface ReviewResponse {
  data: Review;
  message?: string;
}

export interface SignatureResponse {
  data: Signature;
  message?: string;
}

export interface UpdateContractData {
  contract_type?: string;
  status?: string;
  data?: Record<string, any>;
  text_version?: string;
  full_text?: string;
  needs_review?: boolean;
  is_locked?: boolean;
}

export interface AssignLawyerData {
  lawyer_id: number;
}

export interface StatusData {
  status: string;
}

export interface ForceSignData {
  user_id: number;
}

export interface ExportAllData {
  format: "pdf" | "docx";
}