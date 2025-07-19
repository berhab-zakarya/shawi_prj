import { useState, useCallback } from "react";
import { get } from "../lib/api";
import { extractErrorMessages } from "@/lib/errorHandler";
import { UserAnalytics,ContractAnalytics, DocumentAnalytics, InvoiceAnalytics, MarketplaceAnalytics, ContentAnalytics, NotificationAnalytics } from "@/types/admin-analytics";

// Admin Analytics API endpoint
const ADMIN_ANALYTICS_ENDPOINT = "admin/analytics/";

// Type definitions for the analytics response


export interface AdminAnalyticsResponse {
  users: UserAnalytics;
  documents: DocumentAnalytics;
  invoices: InvoiceAnalytics;
  contracts: ContractAnalytics;
  marketplace: MarketplaceAnalytics;
  content: ContentAnalytics;
  notifications: NotificationAnalytics;
}

interface AnalyticsFilters {
  start_date?: string; // Format: YYYY-MM-DD
  end_date?: string;   // Format: YYYY-MM-DD
  export?: 'csv';
}

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getAnalytics = useCallback(async (filters?: AnalyticsFilters) => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.start_date) params.append("start_date", filters.start_date);
      if (filters?.end_date) params.append("end_date", filters.end_date);
      if (filters?.export) params.append("export", filters.export);

      const queryString = params.toString();
      const endpoint = queryString ? `${ADMIN_ANALYTICS_ENDPOINT}?${queryString}` : ADMIN_ANALYTICS_ENDPOINT;

      const response = await get<AdminAnalyticsResponse>(endpoint, {
        isPrivate: true,
        ...(filters?.export === 'csv' && { responseType: 'blob' })
      });

      if (filters?.export === 'csv') {
        // Handle CSV download
        const blob = new Blob([response.data as any], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `admin_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON response
        setAnalytics(response.data);
        return response.data;
      }
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadCSV = useCallback(async (filters?: Omit<AnalyticsFilters, 'export'>) => {
    return getAnalytics({ ...filters, export: 'csv' });
  }, [getAnalytics]);

  const refreshAnalytics = useCallback(async () => {
    return getAnalytics();
  }, [getAnalytics]);

  return {
    analytics,
    loading,
    errorMessage,
    getAnalytics,
    downloadCSV,
    refreshAnalytics
  };
}