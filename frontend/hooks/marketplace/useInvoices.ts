"use client";

import { useState, useEffect } from "react";
import { get, post, put } from "@/lib/api";
import { INVOICES_LIST_ENDPOINT, INVOICE_DETAIL_ENDPOINT, INVOICE_DOWNLOAD_ENDPOINT } from "@/lib/apiConstants";
import { extractErrorMessages } from "@/lib/errorHandler";
import { Invoice, InvoiceList } from "@/types/invoices";

export function useInvoicesClient() {
  const [invoices, setInvoices] = useState<InvoiceList>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all invoices, optionally filtered by status or date range
  const getInvoices = async (filters: { status?: string; startDate?: string; endDate?: string } = {}) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.startDate) queryParams.append("start_date", filters.startDate);
      if (filters.endDate) queryParams.append("end_date", filters.endDate);
      const response = await get<InvoiceList>(`${INVOICES_LIST_ENDPOINT}?${queryParams.toString()}`, { isPrivate: true });
      setInvoices(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
    } finally {
      setLoading(false);
    }
  };

  // Search invoices by invoice number or client details
  const searchInvoices = async (searchQuery: string) => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await get<InvoiceList>(`${INVOICES_LIST_ENDPOINT}?search=${encodeURIComponent(searchQuery)}`, { isPrivate: true });
      setInvoices(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
    } finally {
      setLoading(false);
    }
  };

  // Fetch details of a specific invoice
  const getInvoiceDetails = async (invoiceNumber: string): Promise<Invoice | null> => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await get<Invoice>(INVOICE_DETAIL_ENDPOINT(invoiceNumber), { isPrivate: true });
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Download invoice PDF
  const downloadInvoicePDF = async (invoiceNumber: string): Promise<boolean> => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await fetch(INVOICE_DOWNLOAD_ENDPOINT(invoiceNumber), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update invoice status (e.g., mark as paid or cancelled)
  const updateInvoiceStatus = async (invoiceNumber: string, status: string): Promise<boolean> => {
    try {
      setLoading(true);
      setErrorMessage("");
      await put(`${INVOICES_LIST_ENDPOINT}${invoiceNumber}/status/`, { status }, { isPrivate: true });
      await getInvoices(); // Refresh invoice list
      return true;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Send invoice reminder email
  const sendInvoiceReminder = async (invoiceNumber: string): Promise<boolean> => {
    try {
      setLoading(true);
      setErrorMessage("");
      await post(`${INVOICES_LIST_ENDPOINT}${invoiceNumber}/remind/`, {}, { isPrivate: true });
      return true;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a new invoice manually
  const createInvoice = async (invoiceData: {
    clientId: number;
    serviceDescription: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discountAmount?: number;
    language?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setErrorMessage("");
      await post(`${INVOICES_LIST_ENDPOINT}create/`, invoiceData, { isPrivate: true });
      await getInvoices(); // Refresh invoice list
      return true;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInvoices();
  }, []);

  return {
    invoices,
    loading,
    errorMessage,
    getInvoices,
    searchInvoices,
    getInvoiceDetails,
    downloadInvoicePDF,
    updateInvoiceStatus,
    sendInvoiceReminder,
    createInvoice,
  };
}