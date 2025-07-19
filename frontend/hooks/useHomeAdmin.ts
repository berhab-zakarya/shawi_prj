import { useState, useEffect, useCallback, useMemo } from "react";
import { useAdminAnalytics } from "./useAdminAnalytics";
import { useAdminManagement } from "./useAdminManagement";
import { useAdminContracts } from "./useAdminContracts";
import { useAdmin as useAdminBlog } from "./useAdminBlog";
import { useAdminMarketplace } from "./marketplace/useAdminMarketplace";
import type { AdminAnalyticsResponse } from "./useAdminAnalytics";
import type { AdminUser, Notification } from "@/types/admin";
import type { Contract } from "@/types/contracts-admin";
import type { PostStats } from "@/types/admin-blog";
import type { Service, Payment, Document, Review } from "@/types/monitoring";

interface DashboardData {
  analytics: AdminAnalyticsResponse | null;
  users: AdminUser[];
  notifications: Notification[];
  contracts: Contract[];
  postStats: PostStats | null;
  services: Service[];
  payments: Payment[];
  documents: Document[];
  reviews: Review[];
}

interface DashboardLoading {
  analytics: boolean;
  users: boolean;
  notifications: boolean;
  contracts: boolean;
  postStats: boolean;
  services: boolean;
  payments: boolean;
  documents: boolean;
  reviews: boolean;
}

interface DashboardError {
  analytics: string;
  users: string;
  notifications: string;
  contracts: string;
  postStats: string;
  services: string;
  payments: string;
  documents: string;
  reviews: string;
}

export function useAdminDashboardHome() {
  const {
    analytics,
    loading: analyticsLoading,
    errorMessage: analyticsError,
    getAnalytics,
    downloadCSV,
  } = useAdminAnalytics();
  
  const {
    users,
    notifications,
    loading: managementLoading,
    errorMessage: managementError,
    getUsers,
    getNotifications,
  } = useAdminManagement();
  
  const {
    contracts,
    loading: contractsLoading,
    errorMessage: contractsError,
    getContracts,
  } = useAdminContracts();
  
  const {
    loading: blogLoading,
    errorMessage: blogError,
    getPostStats,
  } = useAdminBlog();
  
  const {
    services,
    payments,
    documents,
    reviews,
    loading: marketplaceLoading,
    errorMessage: marketplaceError,
    fetchServices,
    fetchPayments,
    fetchDocuments,
    fetchReviews,
  } = useAdminMarketplace();

  const [postStats, setPostStats] = useState<PostStats | null>(null);
  const [isInitialFetch, setIsInitialFetch] = useState(true);

  // Memoize aggregated loading states to prevent unnecessary re-renders
  const loading = useMemo<DashboardLoading>(() => ({
    analytics: analyticsLoading,
    users: managementLoading,
    notifications: managementLoading,
    contracts: contractsLoading,
    postStats: blogLoading,
    services: marketplaceLoading.services,
    payments: marketplaceLoading.payments,
    documents: marketplaceLoading.documents,
    reviews: marketplaceLoading.reviews,
  }), [
    analyticsLoading,
    managementLoading,
    contractsLoading,
    blogLoading,
    marketplaceLoading.services,
    marketplaceLoading.payments,
    marketplaceLoading.documents,
    marketplaceLoading.reviews,
  ]);

  // Memoize aggregated error messages to prevent unnecessary re-renders
  const error = useMemo<DashboardError>(() => ({
    analytics: analyticsError,
    users: managementError,
    notifications: managementError,
    contracts: contractsError,
    postStats: blogError,
    services: marketplaceError.services,
    payments: marketplaceError.payments,
    documents: marketplaceError.documents,
    reviews: marketplaceError.reviews,
  }), [
    analyticsError,
    managementError,
    contractsError,
    blogError,
    marketplaceError.services,
    marketplaceError.payments,
    marketplaceError.documents,
    marketplaceError.reviews,
  ]);

  // Memoize dashboard data to prevent unnecessary re-renders
  const dashboardData = useMemo<DashboardData>(() => ({
    analytics,
    users,
    notifications,
    contracts,
    postStats,
    services,
    payments,
    documents,
    reviews,
  }), [analytics, users, notifications, contracts, postStats, services, payments, documents, reviews]);

  // Fetch all dashboard data - memoized to prevent recreating on every render
  const fetchDashboardData = useCallback(async (filters?: {
    analytics?: { start_date?: string; end_date?: string };
    contracts?: { status?: string; contract_type?: string; client_email?: string };
  }) => {
    try {
      // Execute all fetch operations concurrently
      const [analyticsData, contractsData, postStatsData] = await Promise.all([
        getAnalytics(filters?.analytics),
        getContracts(filters?.contracts),
        getPostStats(),
        // These functions return void but update state internally
        getUsers(),
        getNotifications(),
        fetchServices(),
        fetchPayments(),
        fetchDocuments(),
        fetchReviews(),
      ]);

      // Only update postStats if we got new data
      if (postStatsData) {
        setPostStats(postStatsData);
      }

      // Mark initial fetch as complete
      if (isInitialFetch) {
        setIsInitialFetch(false);
      }
    } catch (e: any) {
      console.error("Failed to fetch dashboard data:", e);
      // Errors are handled by individual hooks
    }
  }, [
    getAnalytics,
    getUsers,
    getNotifications,
    getContracts,
    getPostStats,
    fetchServices,
    fetchPayments,
    fetchDocuments,
    fetchReviews,
    isInitialFetch,
  ]);

  // Download analytics CSV - memoized to prevent recreating on every render
  const downloadAnalyticsCSV = useCallback(
    async (filters?: { start_date?: string; end_date?: string }) => {
      await downloadCSV(filters);
    },
    [downloadCSV]
  );

  // Initial fetch on mount only
  useEffect(() => {
    if (isInitialFetch) {
      fetchDashboardData();
    }
  }, [isInitialFetch, fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    downloadAnalyticsCSV,
  };
}