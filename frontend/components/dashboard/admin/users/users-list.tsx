/* eslint-disable */

"use client"

import { useState } from "react"
import type { AdminUser } from "@/types/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, UserCheck, UserX, Trash2, RefreshCw, Mail, Calendar, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UsersListProps {
  users: AdminUser[]
  loading: boolean
  onViewUser: (userId: number) => void
  onToggleActive: (userId: number) => Promise<any>
  onDeleteUser: (userId: number) => Promise<void>
  onRefresh: () => Promise<void>
}

export default function UsersList({
  users,
  loading,
  onViewUser,
  onToggleActive,
  onDeleteUser,
  onRefresh,
}: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active)

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const uniqueRoles = Array.from(new Set(users.map((user) => user.role).filter(Boolean)))

  const handleToggleActive = async (userId: number) => {
    try {
      await onToggleActive(userId)
    } catch (error) {
      console.error("خطأ في تغيير حالة المستخدم:", error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      try {
        await onDeleteUser(userId)
      } catch (error) {
        console.error("خطأ في حذف المستخدم:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">قائمة المستخدمين ({filteredUsers.length})</h2>
        <Button onClick={onRefresh} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role || ""}>
                    {role || "غير محدد"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="mr-2 text-gray-600">جاري التحميل...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">لا توجد مستخدمين مطابقين للبحث</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{user.full_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                    {user.email_verified && (
                      <Badge variant="outline" className="text-xs">
                        مؤكد
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  {user.role && (
                    <div className="text-sm">
                      <span className="font-medium">الدور:</span> {user.role}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    انضم في: {new Date(user.date_joined).toLocaleDateString("ar-SA")}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewUser(user.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    عرض
                  </Button>
                  <Button
                    size="sm"
                    variant={user.is_active ? "destructive" : "default"}
                    onClick={() => handleToggleActive(user.id)}
                    className="flex items-center gap-1"
                  >
                    {user.is_active ? (
                      <>
                        <UserX className="h-3 w-3" />
                        إلغاء تفعيل
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3" />
                        تفعيل
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
