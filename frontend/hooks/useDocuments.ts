"use client"

import { useState, useEffect } from "react"
import { get, post, put, del } from "@/lib/api"
import { DOCUMENTS_ENDPOINT } from "@/lib/apiConstants"
import { extractErrorMessages } from "@/lib/errorHandler"
import type { Document, DocumentUploadData, AIAnalysisResult, DocumentUpdateData } from "@/types/documents"

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Get all documents for the authenticated user
  const getDocuments = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<Document[]>(DOCUMENTS_ENDPOINT, { isPrivate: true })
      console.log("getDocuments")
      const data = response.data;
      console.log(data)
      setDocuments(data)
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  // Get a specific document by ID
  const getDocument = async (id: number): Promise<Document | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<Document>(`${DOCUMENTS_ENDPOINT}${id}/`, { isPrivate: true })
         console.log("getDocument"+id)
      const data = response.data;
      console.log(data)
      setCurrentDocument(data)
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Upload a document
  const uploadDocument = async (documentData: DocumentUploadData): Promise<Document | null> => {
    try {
      setUploadLoading(true)
      setErrorMessage("")

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("title", documentData.title)
      formData.append("document_type", documentData.document_type)

      if (documentData.file) {
        formData.append("file", documentData.file)
      } else if (documentData.file_url) {
        formData.append("file_url", documentData.file_url)
      } else if (documentData.file_path) {
        formData.append("file_path", documentData.file_path)
      }

      const response = await post<Document, FormData>(DOCUMENTS_ENDPOINT, formData, {
        isPrivate: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Add to documents list
      setDocuments((prev) => [...prev, response.data])
      setCurrentDocument(response.data)
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setUploadLoading(false)
    }
  }

  // Upload document via URL
  const uploadDocumentFromUrl = async (
    title: string,
    fileUrl: string,
    documentType: "PDF" | "DOCX" | "TXT",
  ): Promise<Document | null> => {
    return uploadDocument({
      title,
      file_url: fileUrl,
      document_type: documentType,
    })
  }

  // Upload document via file
  const uploadDocumentFromFile = async (
    title: string,
    file: File,
    documentType: "PDF" | "DOCX" | "TXT",
  ): Promise<Document | null> => {
    return uploadDocument({
      title,
      file,
      document_type: documentType,
    })
  }

  // Upload document via local path
  const uploadDocumentFromPath = async (
    title: string,
    filePath: string,
    documentType: "PDF" | "DOCX" | "TXT",
  ): Promise<Document | null> => {
    return uploadDocument({
      title,
      file_path: filePath,
      document_type: documentType,
    })
  }

  // Analyze document with AI
  const analyzeDocument = async (documentId: number): Promise<AIAnalysisResult | null> => {
    try {
      setAnalysisLoading(true)
      setErrorMessage("")
      const response = await post<AIAnalysisResult, {}>(
        `${DOCUMENTS_ENDPOINT}${documentId}/analyze/`,
        {},
        { isPrivate: true },
      )
      setAnalysisResult(response.data)
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setAnalysisLoading(false)
    }
  }

  // Update document
  const updateDocument = async (id: number, updateData: DocumentUpdateData): Promise<Document | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await put<Document, DocumentUpdateData>(`${DOCUMENTS_ENDPOINT}${id}/`, updateData, {
        isPrivate: true,
      })

      // Update in documents list
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? response.data : doc)))

      // Update current document if it's the same
      if (currentDocument?.id === id) {
        setCurrentDocument(response.data)
      }

      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete document
  const deleteDocument = async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setErrorMessage("")
      await del(`${DOCUMENTS_ENDPOINT}${id}/`, { isPrivate: true })

      // Remove from documents list
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))

      // Clear current document if it's the deleted one
      if (currentDocument?.id === id) {
        setCurrentDocument(null)
      }

      return true
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return false
    } finally {
      setLoading(false)
    }
  }

  // Get analysis results for a document
  const getDocumentAnalysis = async (documentId: number): Promise<AIAnalysisResult | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<AIAnalysisResult>(`${DOCUMENTS_ENDPOINT}/`, { isPrivate: true })
      console.log("getDocumentAnalysis")
      console.log(response.data)
      setAnalysisResult(response.data)
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Download document
  const downloadDocument = async (document: Document): Promise<Blob | null> => {
    try {
      setLoading(true)
      setErrorMessage("")

      if (!document.file) {
        throw new Error("No file available for download")
      }

      const response = await get<Blob>(document.file, {
        isPrivate: true,
        responseType: "blob",
      })

      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Helper function to trigger download in browser
  const downloadDocumentFile = async (myDocument: Document, filename?: string) => {
    const blob = await downloadDocument(myDocument)
    if (blob) {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename || document.title || "document"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  // Clear error message
  const clearError = () => {
    setErrorMessage("")
  }

  // Clear current document
  const clearCurrentDocument = () => {
    setCurrentDocument(null)
  }

  // Clear analysis result
  const clearAnalysisResult = () => {
    setAnalysisResult(null)
  }

  // Load documents on mount
  useEffect(() => {
    getDocuments()
  }, [])

  return {
    // State
    documents,
    currentDocument,
    analysisResult,
    loading,
    uploadLoading,
    analysisLoading,
    errorMessage,

    // Actions
    getDocuments,
    getDocument,
    uploadDocument,
    uploadDocumentFromUrl,
    uploadDocumentFromFile,
    uploadDocumentFromPath,
    analyzeDocument,
    updateDocument,
    deleteDocument,
    getDocumentAnalysis,
    downloadDocument,
    downloadDocumentFile,

    // Utility functions
    clearError,
    clearCurrentDocument,
    clearAnalysisResult,
    refreshDocuments: getDocuments,
  }
}
