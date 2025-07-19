export interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  language: "en" | "ar";
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  status: "draft" | "sent" | "paid" | "cancelled";
  status_display: string;
  is_sent: boolean;
  sent_at: string | null;
  is_overdue: boolean;
  pdf_file: string | null;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
  service_request: number;
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  service: number;
  service_title: string;
}

export type InvoiceList = Invoice[];