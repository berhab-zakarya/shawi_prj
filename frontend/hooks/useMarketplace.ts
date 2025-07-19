"use client"

import { useState, useEffect } from "react"
import { get, post } from "@/lib/api"
import { MARKETPLACE_SERVICES_ENDPOINT, REQUEST_SERVICE_ENDPOINT } from "@/lib/apiConstants"
import { extractErrorMessages } from "@/lib/errorHandler"
import type { MarketplaceServiceList } from "@/types/marketplace"

export function useMarketplace() {
  const [services, setServices] = useState<MarketplaceServiceList>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const getMarketplaceServices = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<MarketplaceServiceList>(MARKETPLACE_SERVICES_ENDPOINT, { isPrivate: true })
      const data = response.data
      console.log(data)
      setServices(data)
     
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  const requestService = async ({
    lawyerId,serviceId
  }: {
    lawyerId:number
    serviceId:number
  }): Promise<boolean> => {
    try {
      console.log("REQUEST")
      console.log(lawyerId)
      console.log(serviceId)
      setLoading(true)
      setErrorMessage("")
      await post(REQUEST_SERVICE_ENDPOINT, 
        { service: serviceId,
            lawyer:lawyerId
         }, { isPrivate: true })
      return true
    } catch (e: any) {
        console.log(e)
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getMarketplaceServices()
  }, [])

  return {
    services,
    loading,
    errorMessage,
    requestService,
    refreshServices: getMarketplaceServices,
  }
}
