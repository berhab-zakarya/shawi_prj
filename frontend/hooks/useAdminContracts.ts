import { useState, useEffect } from "react";
import { get, post, put, del } from "../lib/api";
import {
  ADMIN_CONTRACT_LIST_ENDPOINT,
  ADMIN_CONTRACT_UPDATE_ENDPOINT,
  ADMIN_CONTRACT_DELETE_ENDPOINT,
  ADMIN_CONTRACT_ASSIGN_LAWYER_ENDPOINT,
  ADMIN_CONTRACT_STATUS_ENDPOINT,
  ADMIN_CONTRACT_FORCE_SIGN_ENDPOINT,
  ADMIN_CONTRACT_EXPORT_ALL_ENDPOINT,
} from "../lib/apiConstants";
import { extractErrorMessages } from "../lib/errorHandler";
import type {
  Contract,
  ContractResponse,
  UpdateContractData,
  AssignLawyerData,
  StatusData,
  ForceSignData,
  ExportAllData,
  ReviewResponse,
  SignatureResponse,
} from "@/types/contracts-admin";

export function useAdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all contracts with optional filters
  const getContracts = async (filters: { status?: string; contract_type?: string; client_email?: string } = {}) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await get<Contract[]>(ADMIN_CONTRACT_LIST_ENDPOINT, {
        isPrivate: true,
        params: filters,
      });
      const data = Array.isArray(response.data) ? response.data : [response.data];
      setContracts(data);
      return data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch contracts when the hook is first used
  useEffect(() => {
    getContracts();
  }, []);

  // Update a contract
  const updateContract = async (id: number, data: UpdateContractData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await put<ContractResponse, UpdateContractData>(
        ADMIN_CONTRACT_UPDATE_ENDPOINT(id),
        data,
        { isPrivate: true }
      );
      const updatedContract = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      setContracts((prev) =>
        prev.map((contract) => (contract.id === id ? updatedContract : contract))
      );
      return updatedContract;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a contract
  const deleteContract = async (id: number) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      await del<ContractResponse>(ADMIN_CONTRACT_DELETE_ENDPOINT(id), { isPrivate: true });
      setContracts((prev) => prev.filter((contract) => contract.id !== id));
      return true;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Assign a lawyer to a contract
  const assignLawyer = async (id: number, data: AssignLawyerData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await post<ReviewResponse, AssignLawyerData>(
        ADMIN_CONTRACT_ASSIGN_LAWYER_ENDPOINT(id),
        data,
        { isPrivate: true }
      );
      const updatedContract = contracts.find((contract) => contract.id === id);
      if (updatedContract) {
        setContracts((prev) =>
          prev.map((contract) =>
            contract.id === id
              ? {
                  ...contract,
                  status: "UNDER_REVIEW",
                  needs_review: true,
                  reviews: [...contract.reviews, response.data.data],
                }
              : contract
          )
        );
      }
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Change contract status
  const changeStatus = async (id: number, data: StatusData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await post<ContractResponse, StatusData>(
        ADMIN_CONTRACT_STATUS_ENDPOINT(id),
        data,
        { isPrivate: true }
      );
      const updatedContract = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      setContracts((prev) =>
        prev.map((contract) => (contract.id === id ? updatedContract : contract))
      );
      return updatedContract;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Force sign a contract
  const forceSign = async (id: number, data: ForceSignData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await post<SignatureResponse, ForceSignData>(
        ADMIN_CONTRACT_FORCE_SIGN_ENDPOINT(id),
        data,
        { isPrivate: true }
      );
      const updatedContract = contracts.find((contract) => contract.id === id);
      if (updatedContract) {
        setContracts((prev) =>
          prev.map((contract) =>
            contract.id === id
              ? {
                  ...contract,
                  status:
                    response.data.data.user.role === "Lawyer"
                      ? "SIGNED_BY_LAWYER"
                      : "SIGNED_BY_CLIENT",
                  is_locked: contract.signatures.length + 1 >= 2 ? true : contract.is_locked,
                  signatures: [...contract.signatures, response.data.data],
                }
              : contract
          )
        );
      }
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Export all contracts
  const exportAllContracts = async (data: ExportAllData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await post<Blob, ExportAllData>(
        ADMIN_CONTRACT_EXPORT_ALL_ENDPOINT,
        data,
        {
          isPrivate: true,
          responseType: "blob",
        }
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    errorMessage,
    loading,
    contracts,
    getContracts,
    updateContract,
    deleteContract,
    assignLawyer,
    changeStatus,
    forceSign,
    exportAllContracts,
  };
}