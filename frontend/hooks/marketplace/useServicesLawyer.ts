"use client"

import { useState, useEffect } from "react"
import { get, post, put, del } from "@/lib/api"
import {  CREATE_SERVICE_ENDPOINT, SERVICE_DELETE_ENDPOINT, SERVICE_DETAIL_ENDPOINT, SERVICE_UPDATE_ENDPOINT, SERVICES_LAWYERSENDPOINT } from "@/lib/apiConstants"
import { extractErrorMessages } from "@/lib/errorHandler"
import type { Service, CreateServiceRequest, UpdateServiceRequest, ServiceList } from "@/types/marketplace"

export function useLawyerServices() {
  const [services, setServices] = useState<ServiceList>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const getServices = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<ServiceList>(SERVICES_LAWYERSENDPOINT, { isPrivate: true })
      setServices(response.data)
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  const createService = async (serviceData: CreateServiceRequest): Promise<Service | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await post<Service, CreateServiceRequest>(CREATE_SERVICE_ENDPOINT, serviceData, {
        isPrivate: true,
      })
      await getServices() // Refresh the list
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateService = async (id: number, serviceData: UpdateServiceRequest): Promise<Service | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await put<Service, UpdateServiceRequest>(SERVICE_UPDATE_ENDPOINT(id), serviceData, {
        isPrivate: true,
      })
      await getServices() // Refresh the list
      return response.data
    } catch (e: any) {
        console.log(e)
        console.log(e.data);
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (id: number): Promise<boolean> => {
    try {
      setLoading(true)
      setErrorMessage("")
      await del(SERVICE_DELETE_ENDPOINT(id), { isPrivate: true })
      await getServices() // Refresh the list
      return true
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return false
    } finally {
      setLoading(false)
    }
  }

  const getServiceDetails = async (id: number): Promise<Service | null> => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<Service>(SERVICE_DETAIL_ENDPOINT(id), { isPrivate: true })
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getServices()
  }, [])

  return {
    services,
    loading,
    errorMessage,
    getServices,
    createService,
    updateService,
    deleteService,
    getServiceDetails,
  }
}
