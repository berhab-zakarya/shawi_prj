
import { useState, useEffect } from "react";
import { get } from "../../lib/api"
import { REQUESTS_CLIENTS_ENDPOINT, SERVICES_LAWYERSENDPOINT } from "@/lib/apiConstants";
import { extractErrorMessages } from "@/lib/errorHandler";
import {  MarketplaceOrderList, ServiceList } from "@/types/marketplace";

export function useServicesClient() {
    const [clientServices, setClientServices] = useState<MarketplaceOrderList>([])
    const [loading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("");

    const getClientServicesSubmitted = async () => {
        try {
            setIsLoading(true)
            setErrorMessage("") // Clear previous errors
            const response = await get<MarketplaceOrderList>(
                REQUESTS_CLIENTS_ENDPOINT,
                { isPrivate: true }
            )
            console.log(response.data)
            setClientServices(response.data);


        } catch (e: any) {
            const msg = extractErrorMessages(e);
            setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
        } finally {
            setIsLoading(false);
        }
    }

   

    useEffect(() => {
        getClientServicesSubmitted()
    }, []);

    return {
        errorMessage,
        loading,
        clientServices,
    }
}