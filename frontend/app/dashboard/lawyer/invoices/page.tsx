"use client"

import { useState } from "react"
import { InvoicesList } from "@/components/dashboard/lawyer/invoices/invoices-list"
import { InvoiceView } from "@/components/dashboard/lawyer/invoices/invoice-view"
import { InvoiceEdit } from "@/components/dashboard/lawyer/invoices/invoice-edit"
import { useInvoicesClient } from "@/hooks/marketplace/useInvoices"

type ViewMode = "list" | "view" | "edit"

export default function InvoicesPage() {
  const [currentView, setCurrentView] = useState<ViewMode>("list")
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string | null>(null)
  const invoiceHook = useInvoicesClient()

  const handleViewInvoice = (invoiceNumber: string) => {
    setSelectedInvoiceNumber(invoiceNumber)
    setCurrentView("view")
  }

  const handleEditInvoice = (invoiceNumber: string) => {
    setSelectedInvoiceNumber(invoiceNumber)
    setCurrentView("edit")
  }

  const handleCreateInvoice = () => {
    setSelectedInvoiceNumber(null)
    setCurrentView("edit")
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedInvoiceNumber(null)
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-6">
        {currentView === "list" && (
          <InvoicesList
            {...invoiceHook}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onCreateInvoice={handleCreateInvoice}
          />
        )}
        
        {currentView === "view" && selectedInvoiceNumber && (
          <InvoiceView
            invoiceNumber={selectedInvoiceNumber}
            onBack={handleBackToList}
            onEdit={() => handleEditInvoice(selectedInvoiceNumber)}
            {...invoiceHook}
          />
        )}
        
        {currentView === "edit" && (
          <InvoiceEdit
            invoiceNumber={selectedInvoiceNumber}
            onBack={handleBackToList}
            onSave={handleBackToList}
            {...invoiceHook}
          />
        )}
      </div>
    </div>
  )
}
