"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SERVICE_CATEGORIES, type CreateServiceRequest, type Service } from "@/types/marketplace"

interface ServiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateServiceRequest) => Promise<void>
  loading: boolean
  service?: Service | null
  mode: "create" | "edit"
}

export function ServiceFormModal({ open, onOpenChange, onSubmit, loading, service, mode }: ServiceFormModalProps) {
  const [formData, setFormData] = useState<CreateServiceRequest>({
    title: "",
    price: "",
    category: "",
    description: "",
  })

  useEffect(() => {
    if (mode === "edit" && service) {
      setFormData({
        title: service.title,
        price: service.price,
        category: service.category,
        description: service.description,
      })
    } else {
      setFormData({
        title: "",
        price: "",
        category: "",
        description: "",
      })
    }
  }, [mode, service, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    if (!loading) {
      onOpenChange(false)
    }
  }

  const isFormValid = formData.title && formData.price && formData.category && formData.description

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "إضافة خدمة جديدة" : "تعديل الخدمة"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "أضف خدمة جديدة إلى السوق القانوني" : "تعديل تفاصيل الخدمة"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الخدمة *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الخدمة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">السعر (بالدولار) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">فئة الخدمة *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="اختر فئة الخدمة" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف الخدمة *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً مفصلاً للخدمة التي تقدمها..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading || !isFormValid}>
              {loading ? "جاري الحفظ..." : mode === "create" ? "إضافة الخدمة" : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
