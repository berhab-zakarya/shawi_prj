"use client"

import { useState, useEffect } from "react"
import { get, patch } from "@/lib/api"
import { extractErrorMessages } from "@/lib/errorHandler"
import type { ServiceRequest, MarketplaceService } from "@/types/marketplace-lawyer"

export interface ManageRequestData {
  status: "Accepted" | "Rejected" | "Completed"
}

export function useLawyerRequests() {
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([])
  const [myServices, setMyServices] = useState<MarketplaceService[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Get all service requests on the platform
  const getAllRequests = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<ServiceRequest[]>("/marketplace/requests/all/", { isPrivate: true })
      setAllRequests(response.data)
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  // Get lawyer's own services with their requests
  const getMyServicesWithRequests = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<MarketplaceService[]>("/marketplace/services/lawyer/", { isPrivate: true })
      setMyServices(response.data)
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  // Manage request status (Accept, Reject, Complete)
  const manageRequest = async (requestId: number, data: ManageRequestData): Promise<ServiceRequest | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await patch<ServiceRequest, ManageRequestData>(
        `/marketplace/requests/${requestId}/manage/`,
        data,
        { isPrivate: true },
      )

      // Refresh both lists after status update
      await getAllRequests()
      await getMyServicesWithRequests()

      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Get all requests from my services
  const getMyServiceRequests = (): ServiceRequest[] => {
    const requests: ServiceRequest[] = []
    myServices.forEach((service) => {
      if (service.requests && service.requests.length > 0) {
        requests.push(...service.requests)
      }
    })
    return requests
  }

  useEffect(() => {
    getAllRequests()
    getMyServicesWithRequests()
  }, [])

  return {
    allRequests,
    myServices,
    myServiceRequests: getMyServiceRequests(),
    loading,
    errorMessage,
    getAllRequests,
    getMyServicesWithRequests,
    manageRequest,
  }
}
