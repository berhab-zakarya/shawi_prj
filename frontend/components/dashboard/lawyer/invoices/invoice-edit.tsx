"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Save, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Invoice } from "@/types/invoices"

interface InvoiceEditProps {
  invoiceNumber: string | null // null for creating new invoice
  onBack: () => void
  onSave: () => void
  getInvoiceDetails: (invoiceNumber: string) => Promise<Invoice | null>
  createInvoice: (invoiceData: {
    clientId: number
    serviceDescription: string
    quantity: number
    unitPrice: number
    taxRate?: number
    discountAmount?: number
    language?: string
  }) => Promise<boolean>
  loading: boolean
  errorMessage: string
}

interface InvoiceFormData {
  clientId: number
  language: "en" | "ar"
  taxRate: number
  discountAmount: number
  items: {
    description: string
    quantity: number
    unitPrice: number
  }[]
}

export function InvoiceEdit({
  invoiceNumber,
  onBack,
  onSave,
  getInvoiceDetails,
  createInvoice,
  loading,
  errorMessage,
}: InvoiceEditProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: 0,
    language: "ar",
    taxRate: 0,
    discountAmount: 0,
    items: [{ description: "", quantity: 1, unitPrice: 0 }],
  })
  const [saving, setSaving] = useState(false)

  const isEditing = !!invoiceNumber

  useEffect(() => {
    if (isEditing && invoiceNumber) {
      const fetchInvoice = async () => {
        const invoiceData = await getInvoiceDetails(invoiceNumber)
        if (invoiceData) {
          setInvoice(invoiceData)
          setFormData({
            clientId: 0, // This would need to be extracted from service_request
            language: invoiceData.language,
            taxRate: Number.parseFloat(invoiceData.tax_rate),
            discountAmount: Number.parseFloat(invoiceData.discount_amount),
            items: invoiceData.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: Number.parseFloat(item.unit_price),
            })),
          })
        }
      }
      fetchInvoice()
    }
  }, [invoiceNumber, isEditing, getInvoiceDetails])

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, unitPrice: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: keyof (typeof formData.items)[0], value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  }

  const calculateTaxAmount = () => {
    return (calculateSubtotal() * formData.taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - formData.discountAmount
  }

  const handleSave = async () => {
    if (!isEditing) {
      // Creating new invoice
      setSaving(true)
      const success = await createInvoice({
        clientId: formData.clientId,
        serviceDescription: formData.items[0]?.description || "",
        quantity: formData.items[0]?.quantity || 1,
        unitPrice: formData.items[0]?.unitPrice || 0,
        taxRate: formData.taxRate,
        discountAmount: formData.discountAmount,
        language: formData.language,
      })
      setSaving(false)

      if (success) {
        onSave()
      }
    } else {
      // For editing existing invoice, you would need an update endpoint
      // This is not provided in the API documentation
      onSave()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? `تعديل فاتورة ${invoiceNumber}` : "فاتورة جديدة"}</h1>
            <p className="text-muted-foreground">{isEditing ? "تعديل تفاصيل الفاتورة" : "إنشاء فاتورة جديدة"}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">معرف العميل</Label>
                  <Input
                    id="clientId"
                    type="number"
                    value={formData.clientId || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientId: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="أدخل معرف العميل"
                  />
                </div>
                <div>
                  <Label htmlFor="language">اللغة</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: "en" | "ar") => setFormData((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">الإنجليزية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>عناصر الفاتورة</CardTitle>
                <Button onClick={addItem} variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  إضافة عنصر
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">العنصر {index + 1}</h4>
                      {formData.items.length > 1 && (
                        <Button
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label>الوصف</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="وصف الخدمة أو المنتج"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>الكمية</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label>سعر الوحدة (ر.س)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm text-muted-foreground">المجموع: </span>
                      <span className="font-semibold">{(item.quantity * item.unitPrice).toFixed(2)} ر.س</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات المالية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxRate">معدل الضريبة (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxRate: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="discountAmount">مبلغ الخصم (ر.س)</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountAmount: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ملخص المبالغ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>المبلغ الفرعي:</span>
                <span className="font-semibold">{calculateSubtotal().toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة ({formData.taxRate}%):</span>
                <span className="font-semibold">{calculateTaxAmount().toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span>الخصم:</span>
                <span className="font-semibold">-{formData.discountAmount.toFixed(2)} ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>المبلغ الإجمالي:</span>
                <span>{calculateTotal().toFixed(2)} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
