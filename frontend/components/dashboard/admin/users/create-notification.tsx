/* eslint-disable */

"use client"

import type React from "react"

import { useState } from "react"
import type { AdminUser, NotificationCreateData } from "@/types/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Send, Bell, User, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateNotificationProps {
  users: AdminUser[]
  loading: boolean
  onCreateNotification: (data: NotificationCreateData) => Promise<any>
  onBack: () => void
}

export default function CreateNotification({ users, loading, onCreateNotification, onBack }: CreateNotificationProps) {
  const [formData, setFormData] = useState<NotificationCreateData>({
    title: "",
    message: "",
    user: 0,
    priority: "MEDIUM",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleInputChange = (field: keyof NotificationCreateData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.message || !formData.user) {
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateNotification(formData)
      setSuccessMessage("تم إرسال الإشعار بنجاح!")
      setFormData({
        title: "",
        message: "",
        user: 0,
        priority: "MEDIUM",
      })
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("خطأ في إرسال الإشعار:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedUser = users.find((user) => user.id === formData.user)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "MEDIUM":
        return <Info className="h-4 w-4 text-yellow-500" />
      case "LOW":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "border-red-200 bg-red-50"
      case "MEDIUM":
        return "border-yellow-200 bg-yellow-50"
      case "LOW":
        return "border-green-200 bg-green-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-6 w-6" />
          إنشاء إشعار جديد
        </h2>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>تفاصيل الإشعار</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Selection */}
              <div>
                <Label htmlFor="user">المستخدم المستهدف *</Label>
                <Select
                  value={formData.user.toString()}
                  onValueChange={(value) => handleInputChange("user", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{user.full_name}</span>
                          <span className="text-gray-500 text-sm">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">عنوان الإشعار *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="أدخل عنوان الإشعار"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message">محتوى الإشعار *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="أدخل محتوى الإشعار"
                  rows={5}
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <Label htmlFor="priority">مستوى الأولوية</Label>
                <Select value={formData.priority} onValueChange={(value: any) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        منخفض
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-yellow-500" />
                        متوسط
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        عالي
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || loading || !formData.title || !formData.message || !formData.user}
                className="w-full flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "جاري الإرسال..." : "إرسال الإشعار"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>معاينة الإشعار</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.title || formData.message || selectedUser ? (
              <div className={`p-4 rounded-lg border-2 ${getPriorityColor(formData.priority || "")}`}>
                <div className="flex items-center gap-2 mb-3">
                  {getPriorityIcon(formData.priority || "")}
                  <span className="font-semibold">{formData.title || "عنوان الإشعار"}</span>
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <User className="h-3 w-3" />
                    <span>إلى: {selectedUser.full_name}</span>
                  </div>
                )}

                <p className="text-gray-700 text-sm leading-relaxed">
                  {formData.message || "محتوى الإشعار سيظهر هنا..."}
                </p>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      الأولوية:{" "}
                      {formData.priority === "HIGH" ? "عالية" : formData.priority === "MEDIUM" ? "متوسطة" : "منخفضة"}
                    </span>
                    <span>{new Date().toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>املأ النموذج لمعاينة الإشعار</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
