import { useState, useEffect } from "react";
import { get, post, put, patch, del } from "@/lib/api";
import { extractErrorMessages } from "@/lib/errorHandler";
import {
  ADMIN_SERVICES_ENDPOINT,
  ADMIN_SERVICE_CREATE_ENDPOINT,
  ADMIN_SERVICE_UPDATE_ENDPOINT,
  ADMIN_SERVICE_DELETE_ENDPOINT,
  ADMIN_PAYMENTS_ENDPOINT,
  ADMIN_PAYMENT_UPDATE_ENDPOINT,
  ADMIN_PAYMENT_DELETE_ENDPOINT,
  ADMIN_DOCUMENTS_ENDPOINT,
  ADMIN_DOCUMENT_UPDATE_ENDPOINT,
  ADMIN_DOCUMENT_DELETE_ENDPOINT,
  ADMIN_REVIEWS_ENDPOINT,
  ADMIN_REVIEW_UPDATE_ENDPOINT,
  ADMIN_REVIEW_DELETE_ENDPOINT,
} from "@/lib/apiConstants";
import { Service, Payment, Document, Review, ServiceData, PaymentData, DocumentData, ReviewData, ServiceRequest, User } from "@/types/monitoring";

export function useAdminMarketplace() {
  const [services, setServices] = useState<Service[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setIsLoading] = useState({
    services: false,
    payments: false,
    documents: false,
    reviews: false,
    createService: false,
    updateService: false,
    deleteService: false,
    updatePayment: false,
    deletePayment: false,
    updateDocument: false,
    deleteDocument: false,
    updateReview: false,
    deleteReview: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    services: "",
    payments: "",
    documents: "",
    reviews: "",
    createService: "",
    updateService: "",
    deleteService: "",
    updatePayment: "",
    deletePayment: "",
    updateDocument: "",
    deleteDocument: "",
    updateReview: "",
    deleteReview: "",
  });

  const fetchServices = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, services: true }));
      setErrorMessage((prev) => ({ ...prev, services: "" }));
      const response = await get<Service[]>(ADMIN_SERVICES_ENDPOINT, {
        isPrivate: true,
      });
      setServices(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        services: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, services: false }));
    }
  };

  const createService = async (data: ServiceData) => {
    try {
      setIsLoading((prev) => ({ ...prev, createService: true }));
      setErrorMessage((prev) => ({ ...prev, createService: "" }));
      const response = await post<Service, ServiceData>(ADMIN_SERVICE_CREATE_ENDPOINT, data, {
        isPrivate: true,
      });
      setServices((prev) => [...prev, response.data]);
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        createService: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, createService: false }));
    }
  };

  const updateService = async (id: number, data: ServiceData) => {
    try {
      setIsLoading((prev) => ({ ...prev, updateService: true }));
      setErrorMessage((prev) => ({ ...prev, updateService: "" }));
      const response = await put<Service, ServiceData>(ADMIN_SERVICE_UPDATE_ENDPOINT(id), data, {
        isPrivate: true,
      });
      setServices((prev) =>
        prev.map((service) => (service.id === id ? response.data : service))
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        updateService: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateService: false }));
    }
  };

  const deleteService = async (id: number) => {
    try {
      setIsLoading((prev) => ({ ...prev, deleteService: true }));
      setErrorMessage((prev) => ({ ...prev, deleteService: "" }));
      await del<null>(ADMIN_SERVICE_DELETE_ENDPOINT(id), {
        isPrivate: true,
      });
      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        deleteService: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteService: false }));
    }
  };

  const fetchPayments = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, payments: true }));
      setErrorMessage((prev) => ({ ...prev, payments: "" }));
      const response = await get<Payment[]>(ADMIN_PAYMENTS_ENDPOINT, {
        isPrivate: true,
      });
      setPayments(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        payments: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, payments: false }));
    }
  };

  const updatePayment = async (id: number, data: PaymentData) => {
    try {
      setIsLoading((prev) => ({ ...prev, updatePayment: true }));
      setErrorMessage((prev) => ({ ...prev, updatePayment: "" }));
      const response = await patch<Payment, PaymentData>(ADMIN_PAYMENT_UPDATE_ENDPOINT(id), data, {
        isPrivate: true,
      });
      setPayments((prev) =>
        prev.map((payment) => (payment.id === id ? response.data : payment))
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        updatePayment: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, updatePayment: false }));
    }
  };

  const deletePayment = async (id: number) => {
    try {
      setIsLoading((prev) => ({ ...prev, deletePayment: true }));
      setErrorMessage((prev) => ({ ...prev, deletePayment: "" }));
      await del<null>(ADMIN_PAYMENT_DELETE_ENDPOINT(id), {
        isPrivate: true,
      });
      setPayments((prev) => prev.filter((payment) => payment.id !== id));
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        deletePayment: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, deletePayment: false }));
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, documents: true }));
      setErrorMessage((prev) => ({ ...prev, documents: "" }));
      const response = await get<Document[]>(ADMIN_DOCUMENTS_ENDPOINT, {
        isPrivate: true,
      });
      setDocuments(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        documents: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, documents: false }));
    }
  };

  const updateDocument = async (id: number, data: DocumentData) => {
    try {
      setIsLoading((prev) => ({ ...prev, updateDocument: true }));
      setErrorMessage((prev) => ({ ...prev, updateDocument: "" }));
      const formData = new FormData();
      if (data.file) formData.append("file", data.file);
      if (data.uploaded_by_id) formData.append("uploaded_by_id", data.uploaded_by_id.toString());
      const response = await put<Document, FormData>(ADMIN_DOCUMENT_UPDATE_ENDPOINT(id), formData, {
        isPrivate: true,
      });
      setDocuments((prev) =>
        prev.map((document) => (document.id === id ? response.data : document))
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        updateDocument: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateDocument: false }));
    }
  };

  const deleteDocument = async (id: number) => {
    try {
      setIsLoading((prev) => ({ ...prev, deleteDocument: true }));
      setErrorMessage((prev) => ({ ...prev, deleteDocument: "" }));
      await del<null>(ADMIN_DOCUMENT_DELETE_ENDPOINT(id), {
        isPrivate: true,
      });
      setDocuments((prev) => prev.filter((document) => document.id !== id));
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        deleteDocument: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteDocument: false }));
    }
  };

  const fetchReviews = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, reviews: true }));
      setErrorMessage((prev) => ({ ...prev, reviews: "" }));
      const response = await get<Review[]>(ADMIN_REVIEWS_ENDPOINT, {
        isPrivate: true,
      });
      setReviews(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        reviews: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, reviews: false }));
    }
  };

  const updateReview = async (id: number, data: ReviewData) => {
    try {
      setIsLoading((prev) => ({ ...prev, updateReview: true }));
      setErrorMessage((prev) => ({ ...prev, updateReview: "" }));
      const response = await patch<Review, ReviewData>(ADMIN_REVIEW_UPDATE_ENDPOINT(id), data, {
        isPrivate: true,
      });
      setReviews((prev) =>
        prev.map((review) => (review.id === id ? response.data : review))
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        updateReview: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, updateReview: false }));
    }
  };

  const deleteReview = async (id: number) => {
    try {
      setIsLoading((prev) => ({ ...prev, deleteReview: true }));
      setErrorMessage((prev) => ({ ...prev, deleteReview: "" }));
      await del<null>(ADMIN_REVIEW_DELETE_ENDPOINT(id), {
        isPrivate: true,
      });
      setReviews((prev) => prev.filter((review) => review.id !== id));
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage((prev) => ({
        ...prev,
        deleteReview: Array.isArray(msg) ? msg.join(", ") : (msg ?? ""),
      }));
      throw e;
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteReview: false }));
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPayments();
    fetchDocuments();
    fetchReviews();
  }, []);

  return {
    services,
    payments,
    documents,
    reviews,
    loading,
    errorMessage,
    fetchServices,
    createService,
    updateService,
    deleteService,
    fetchPayments,
    updatePayment,
    deletePayment,
    fetchDocuments,
    updateDocument,
    deleteDocument,
    fetchReviews,
    updateReview,
    deleteReview,
  };
}