"use client"

import { useState, useCallback, useEffect } from "react"
import { get, post, put, del } from "@/lib/api"
import { DOCUMENTS_ENDPOINT } from "@/lib/apiConstants"
import type { Document, AnalysisResult, DocumentUploadData, ApiError } from "@/types/documents"

interface UseDocumentsAPIReturn {
  // State
  documents: Document[]
  currentDocument: Document | null
  analyses: AnalysisResult[]
  loading: boolean
  errorGlobal: ApiError | null
  errors:string;
  loadingAnalyze:boolean;

  // Document operations
  uploadDocument: (data: DocumentUploadData) => Promise<Document | null>
  getDocuments: () => Promise<Document[] | null>
  getDocument: (id: number) => Promise<Document | null>
  updateDocument: (id: number, data: Partial<DocumentUploadData>) => Promise<Document | null>
  deleteDocument: (id: number) => Promise<boolean>

  // Analysis operations
  analyzeDocument: (id: number) => Promise<AnalysisResult | null>
  getDocumentAnalyses: (id: number) => Promise<AnalysisResult[] | null>

  // Utility functions
  clearError: () => void
  clearCurrentDocument: () => void
}

export const useDocumentsAPI = (): UseDocumentsAPIReturn => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingAnalyze,setLoadingAnalyze] = useState(false);
  const [errorGlobal, setError] = useState<ApiError | null>(null)
  const [errors,setMessageErrors] = useState("");

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearCurrentDocument = useCallback(() => {
    setCurrentDocument(null)
  }, [])

  const handleError = useCallback((err: any,global=false) => {
    console.error("API Error:", err)
    if (err.response?.data) {
      global ? setError(err.response.data) : setMessageErrors(err.response.data)
    } else {
      global ? setError(err.message || "An unexpected error occurred" )  : setMessageErrors(err.message || "An unexpected error occurred" );
    }
    
  }, [])

  // Upload document via file, URL, or local path
  const uploadDocument = useCallback(
    async (data: DocumentUploadData): Promise<Document | null> => {
      setLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("title", data.title)
        formData.append("document_type", data.document_type)

        if (data.file) {
          formData.append("file", data.file)
        } else if (data.file_url) {
          formData.append("file_url", data.file_url)
        } else if (data.file_path) {
          formData.append("file_path", data.file_path)
        }

        const response = await post<Document, FormData>(DOCUMENTS_ENDPOINT, formData, {
          isPrivate: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        const newDocument = response.data
        setDocuments((prev) => [...prev, newDocument])
        setCurrentDocument(newDocument)
        return newDocument
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Get all documents for the authenticated user
  const getDocuments = useCallback(async (): Promise<Document[] | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await get<Document[]>(DOCUMENTS_ENDPOINT, {
        isPrivate: true,
      })
      const fetchedDocuments = response.data
      setDocuments(fetchedDocuments)
      return fetchedDocuments
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [handleError])

  // Get a specific document by ID
  const getDocument = useCallback(
    async (id: number): Promise<Document | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await get<Document>(`${DOCUMENTS_ENDPOINT}${id}/`, {
          isPrivate: true,
        })
        const document = response.data
        setCurrentDocument(document)
        return document
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Update a document
  const updateDocument = useCallback(
    async (id: number, data: Partial<DocumentUploadData>): Promise<Document | null> => {
      setLoading(true)
      setError(null)

      try {
        const formData = new FormData()

        if (data.title) formData.append("title", data.title)
        if (data.document_type) formData.append("document_type", data.document_type)
        if (data.file) formData.append("file", data.file)
        if (data.file_url) formData.append("file_url", data.file_url)
        if (data.file_path) formData.append("file_path", data.file_path)

        const response = await put<Document, FormData>(`${DOCUMENTS_ENDPOINT}${id}/`, formData, {
          isPrivate: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        const updatedDocument = response.data
        setDocuments((prev) => prev.map((doc) => (doc.id === id ? updatedDocument : doc)))
        setCurrentDocument(updatedDocument)
        return updatedDocument
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Delete a document
  const deleteDocument = useCallback(
    async (id: number): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        await del(`${DOCUMENTS_ENDPOINT}${id}/`, {
          isPrivate: true,
        })
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        if (currentDocument?.id === id) {
          setCurrentDocument(null)
        }
        return true
      } catch (err) {
        handleError(err)
        return false
      } finally {
        setLoading(false)
      }
    },
    [handleError, currentDocument],
  )

  // Analyze a document
  const analyzeDocument = useCallback(
    async (id: number): Promise<AnalysisResult | null> => {
      setLoadingAnalyze(true)
      setError(null)

      try {
        const response = await post<AnalysisResult, {}>(
          `${DOCUMENTS_ENDPOINT}${id}/analyze/`,
          {},
          {
            isPrivate: true,
          },
        )
        const analysis = response.data

        // Update the current document with the new analysis
        setCurrentDocument((prev) => {
          if (prev && prev.id === id) {
            return {
              ...prev,
              analyses: [...prev.analyses, analysis],
            }
          }
          return prev
        })

        // Update the documents list
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? { ...doc, analyses: [...doc.analyses, analysis] } : doc)),
        )

        return analysis
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoadingAnalyze(false)
      }
    },
    [handleError],
  )

  // Get all analyses for a specific document
  const getDocumentAnalyses = useCallback(
    async (id: number): Promise<AnalysisResult[] | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await get<AnalysisResult[]>(`${DOCUMENTS_ENDPOINT}${id}/analyses/`, {
          isPrivate: true,
        })
        const fetchedAnalyses = response.data
        setAnalyses(fetchedAnalyses)
        return fetchedAnalyses
      } catch (err) {
        handleError(err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [handleError],
  )

  // Load documents on mount
  useEffect(() => {
    getDocuments()
  }, [getDocuments])

  return {
    // State
    documents,
    currentDocument,
    analyses,
    loading,
    loadingAnalyze,
    errorGlobal,
    errors,

    // Document operations
    uploadDocument,
    getDocuments,
    getDocument,
    updateDocument,
    deleteDocument,

    // Analysis operations
    analyzeDocument,
    getDocumentAnalyses,

    // Utility functions
    clearError,
    clearCurrentDocument,
  }
}
