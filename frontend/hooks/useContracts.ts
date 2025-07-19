"use client"

import { useState, useEffect } from "react"
import { get, post } from "@/lib/api"
import {
  CONTRACTS_ENDPOINT,
  CONTRACT_DETAIL_ENDPOINT,
  CONTRACT_GENERATE_ENDPOINT,
  CONTRACT_SIGN_ENDPOINT,
  CONTRACT_EXPORT_ENDPOINT,
  CONTRACT_ANALYZE_ENDPOINT,
  CONTRACT_ANALYTICS_ENDPOINT,
  CONTRACT_ENHANCE_ENDPOINT,
  SIGNATURE_VERIFY_ENDPOINT,
  CONTRACT_SIGNATURES_ENDPOINT,
  CONTRACT_ASSIGN_LAWYER_ENDPOINT,
  ADMIN_USER_LIST_ENDPOINT,
  CONTRACT_REVIEW_ENDPOINT,
} from "@/lib/apiConstants"
import { extractErrorMessages } from "@/lib/errorHandler"
import type {
  Contract,
  CreateContractRequest,
  ContractSignature,
  ExportContractRequest,
  EnhanceContractRequest,
  EnhanceContractResponse,
  ContractAnalytics,
  SignatureVerification,
  SignContractRequest,
  VerifySignatureRequest,
  AssignReview,
  Review,
} from "@/types/contracts"
import type { AxiosResponse, ResponseType } from "axios"
import { AdminUserResponse } from "@/types/admin"

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [analytics, setAnalytics] = useState<ContractAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [users, setUsers] = useState<AdminUserResponse>([]);
  // Enhanced WebCrypto utilities
  const generateKeyPair = async (): Promise<CryptoKeyPair> => {
    try {
      return await crypto.subtle.generateKey(
        {
          name: "RSA-PSS",
          modulusLength: 2048,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
      )
    } catch (e: any) {
      throw new Error(`Failed to generate key pair: ${e.message}`)
    }
  }

  // Convert key to PEM format
  const keyToPem = async (key: CryptoKey, type: "public" | "private"): Promise<string> => {
    try {
      const exported = await crypto.subtle.exportKey(type === "public" ? "spki" : "pkcs8", key)
      const exportedAsString = Buffer.from(exported).toString("base64")
      const pemPrefix = type === "public" ? "PUBLIC KEY" : "PRIVATE KEY"
      return `-----BEGIN ${pemPrefix}-----\n${exportedAsString}\n-----END ${pemPrefix}-----`
    } catch (e: any) {
      throw new Error(`Failed to export ${type} key: ${e.message}`)
    }
  }

  // Convert PEM to CryptoKey
  const pemToKey = async (pem: string, type: "public" | "private"): Promise<CryptoKey> => {
    try {
      const pemHeader = `-----BEGIN ${type.toUpperCase()} KEY-----`
      const pemFooter = `-----END ${type.toUpperCase()} KEY-----`
      const pemContents = pem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "")
      const binaryDer = Buffer.from(pemContents, "base64")

      return await crypto.subtle.importKey(
        type === "public" ? "spki" : "pkcs8",
        binaryDer,
        {
          name: "RSA-PSS",
          hash: "SHA-256",
        },
        false,
        type === "public" ? ["verify"] : ["sign"],
      )
    } catch (e: any) {
      throw new Error(`Failed to import ${type} key: ${e.message}`)
    }
  }

  // Generate content hash
  const generateContentHash = async (content: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hash = await crypto.subtle.digest("SHA-256", data)
    return Buffer.from(hash).toString("base64")
  }

  // Sign content with private key
  const signContent = async (content: string, privateKey: CryptoKey): Promise<string> => {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hash = await crypto.subtle.digest("SHA-256", data)
      const signature = await crypto.subtle.sign({ name: "RSA-PSS", saltLength: 32 }, privateKey, hash)
      return Buffer.from(signature).toString("base64")
    } catch (e: any) {
      throw new Error(`Failed to sign content: ${e.message}`)
    }
  }

  // Verify signature with public key
  const verifySignatureLocal = async (content: string, signature: string, publicKey: CryptoKey): Promise<boolean> => {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hash = await crypto.subtle.digest("SHA-256", data)
      const signatureBuffer = Buffer.from(signature, "base64")

      return await crypto.subtle.verify({ name: "RSA-PSS", saltLength: 32 }, publicKey, signatureBuffer, hash)
    } catch (e: any) {
      console.error("Signature verification failed:", e.message)
      return false
    }
  }

  const getContracts = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<Contract[]> = await get<Contract[]>(CONTRACTS_ENDPOINT, { isPrivate: true })
      const data = response.data
      console.log(data)
      setContracts(data)
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  const createContract = async (contractData: CreateContractRequest): Promise<Contract | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<Contract> = await post<Contract, CreateContractRequest>(
        CONTRACTS_ENDPOINT,
        contractData,
        {
          isPrivate: true,
        },
      )
      console.log("Contract created successfully:", response.data)
      await getContracts()
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const getContractDetails = async (id: number): Promise<Contract | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<Contract> = await get<Contract>(CONTRACT_DETAIL_ENDPOINT(id), { isPrivate: true })
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateContractText = async (id: number): Promise<{ full_text: string; text_version: string } | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<{ full_text: string; text_version: string }> = await post<
        { full_text: string; text_version: string },
        {}
      >(CONTRACT_GENERATE_ENDPOINT(id), {}, { isPrivate: true })
      await getContracts()
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const enhanceContract = async (
    id: number,
    enhancementType: "enhance" | "correct" | "translate",
  ): Promise<EnhanceContractResponse | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<EnhanceContractResponse> = await post<
        EnhanceContractResponse,
        EnhanceContractRequest
      >(CONTRACT_ENHANCE_ENDPOINT(id), { enhancement_type: enhancementType }, { isPrivate: true })
      await getContracts()
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const signContract = async (id: number): Promise<ContractSignature | null> => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Get contract details
      const contract = await getContractDetails(id);
      if (!contract) {
        throw new Error("Contract not found");
      }

      // Generate key pair
      const keyPair = await generateKeyPair();
      const privateKeyPem = await keyToPem(keyPair.privateKey, 'private');
      const publicKeyPem = await keyToPem(keyPair.publicKey, 'public');

      // Create contract metadata without created_at
      const contractMetadata = {
        id: contract.id,
        contract_type: contract.contract_type,
        status: contract.status,
        data: contract.data,
        needs_review: contract.needs_review,
        is_locked: contract.is_locked
      };

      // Sort keys recursively for consistent JSON serialization
      const contractMetadataStr = JSON.stringify(contractMetadata, (key, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return Object.keys(value)
            .sort()
            .reduce((obj: any, k) => {
              obj[k] = value[k];
              return obj;
            }, {} as any);
        }
        return value;
      }, 0);

      console.log('Frontend contractMetadataStr:', contractMetadataStr); // Debug log

      // Generate signature
      const encoder = new TextEncoder();
      const data = encoder.encode(contractMetadataStr);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const signature = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 },
        keyPair.privateKey,
        hash
      );
      const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

      // Send signature to backend
      const response: AxiosResponse<ContractSignature> = await post<ContractSignature, { private_key: string, signature_hash: string, public_key: string }>(
        CONTRACT_SIGN_ENDPOINT(id),
        {
          private_key: privateKeyPem,
          signature_hash: signatureB64,
          public_key: publicKeyPem
        },
        { isPrivate: true }
      );

      // Store private key securely (consider more secure storage in production)
      localStorage.setItem(`contract_${id}_private_key`, privateKeyPem);

      await getContracts();
      return response.data;
    } catch (e: any) {
      console.error('Signature error:', e);
      if (e.response.data) {
        const data = e.response.data;
        setErrorMessage(data.error);
      } else {
        const msg = e.error || extractErrorMessages(e);
        setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      }
      return null;

    } finally {
      setLoading(false);
    }
  };
  const verifySignature = async (
    signatureId: number,
    contractContent?: string,
  ): Promise<SignatureVerification | null> => {
    try {
      setLoading(true)
      setErrorMessage("")

      const requestData: VerifySignatureRequest = {
        signature_id: signatureId,
        ...(contractContent && { contract_content: contractContent }),
      }

      const response: AxiosResponse<SignatureVerification> = await post<SignatureVerification, VerifySignatureRequest>(
        SIGNATURE_VERIFY_ENDPOINT(signatureId),
        requestData,
        { isPrivate: false },
      )
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const verifySignatureLocally = async (
    contractId: number,
    contractContent: string,
  ): Promise<{ isValid: boolean; details: string } | null> => {
    try {
      // Get stored signature data
      const storedData = localStorage.getItem(`contract_${contractId}_signature_data`)
      if (!storedData) {
        return { isValid: false, details: "No local signature data found" }
      }

      const signatureData = JSON.parse(storedData)

      // Import public key
      const publicKey = await pemToKey(signatureData.publicKey, "public")

      // Verify signature
      const isValid = await verifySignatureLocal(contractContent, signatureData.signature, publicKey)

      // Verify content hash
      const currentHash = await generateContentHash(contractContent)
      const hashValid = currentHash === signatureData.contentHash

      return {
        isValid: isValid && hashValid,
        details: `Signature: ${isValid ? "Valid" : "Invalid"}, Content: ${hashValid ? "Unchanged" : "Modified"}`,
      }
    } catch (e: any) {
      return { isValid: false, details: `Verification failed: ${e.message}` }
    }
  }

  const getContractSignatures = async (contractId: number): Promise<ContractSignature[]> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<ContractSignature[]> = await get<ContractSignature[]>(
        CONTRACT_SIGNATURES_ENDPOINT(contractId),
        { isPrivate: true },
      )
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return []
    } finally {
      setLoading(false)
    }
  }

  const exportContract = async (id: number, format: "pdf" | "docx"): Promise<boolean> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<Blob> = await post<Blob, ExportContractRequest>(
        CONTRACT_EXPORT_ENDPOINT(id),
        { format },
        {
          isPrivate: true,
          responseType: "blob",
        },
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `contract_${id}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      await getContracts()
      return true
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return false
    } finally {
      setLoading(false)
    }
  }

  const analyzeContract = async (id: number): Promise<{ analysis: string } | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response: AxiosResponse<{ analysis: string }> = await post<{ analysis: string }, {}>(
        CONTRACT_ANALYZE_ENDPOINT(id),
        {},
        { isPrivate: true },
      )
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const getContractAnalytics = async (exportCsv = false): Promise<ContractAnalytics | boolean | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const config: { isPrivate: boolean; params?: { export: string }; responseType?: ResponseType } = {
        isPrivate: true,
      }

      if (exportCsv) {
        config.params = { export: "csv" }
        config.responseType = "blob"
      }

      const response: AxiosResponse<ContractAnalytics | Blob> = await get<ContractAnalytics | Blob>(
        CONTRACT_ANALYTICS_ENDPOINT,
        config,
      )

      if (exportCsv) {
        const url = window.URL.createObjectURL(new Blob([response.data as Blob]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `contract_analytics_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        return true
      } else {
        setAnalytics(response.data as ContractAnalytics)
        return response.data as ContractAnalytics
      }
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const assignLawyer = async (contractId: number, lawyerId: number): Promise<AssignReview | null> => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response: AxiosResponse<AssignReview> = await post<AssignReview, { lawyer_id: number }>(
        CONTRACT_ASSIGN_LAWYER_ENDPOINT(contractId),
        { lawyer_id: lawyerId },
        { isPrivate: true }
      );
      await getContracts(); // Refresh contracts to reflect updated status
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await get<AdminUserResponse>(ADMIN_USER_LIST_ENDPOINT, {
        isPrivate: true,
      });
      const data = response.data;

      setUsers(data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
    } finally {
      setLoading(false);
    }
  };
  const reviewContract = async (contractId: number, status: string, reviewNotes: string = ''): Promise<Review | null> => {
    try {
      setLoading(true);
      setErrorMessage("");
      const response: AxiosResponse<Review> = await post<Review, { status: string; review_notes: string }>(
        CONTRACT_REVIEW_ENDPOINT(contractId),
        { status, review_notes: reviewNotes },
        { isPrivate: true }
      );
      await getContracts(); // Refresh contracts to reflect updated status
      return response.data;
    } catch (e: any) {
      console.log(e)
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async (contractId: number): Promise<boolean> => {
    try {
      setLoading(true);
      setErrorMessage("");
      await post<null, {}>(`/admin/contracts/${contractId}/delete/`, {}, { isPrivate: true });
      await getContracts();
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
    getContracts()
  }, [])

  return {
    contracts,
    analytics,
    loading,
    users,
    deleteContract,
    assignLawyer,
    getUsers,
    reviewContract,
    errorMessage,
    getContracts,
    createContract,
    getContractDetails,
    generateContractText,
    enhanceContract,
    signContract,
    verifySignature,
    verifySignatureLocally,
    getContractSignatures,
    exportContract,
    analyzeContract,
    getContractAnalytics,
  }
}
