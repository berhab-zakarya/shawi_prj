
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, Search, Users, Check } from "lucide-react"
import { User } from "@/types"
import { ChatRoom } from "@/types/notification"



interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRoom: (data: any) => Promise<ChatRoom>
  onGetActiveUsers: (search?: string) => Promise<User[]>
}

export default function CreateRoomModal({ open, onOpenChange, onCreateRoom, onGetActiveUsers }: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    room_type: "GROUP" as "ONE_TO_ONE" | "GROUP" | "SUPPORT",
    participants: [] as string[],
  })
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState("")

  // Load active users when modal opens
  useEffect(() => {
    if (open) {
      loadActiveUsers()
    }
  }, [open])

  const loadActiveUsers = async (search?: string) => {
    try {
      setLoadingUsers(true)
      const users = await onGetActiveUsers(search)
      setAvailableUsers(users)
    } catch (err: any) {
      console.error("Failed to load users:", err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleUserSearch = async (search: string) => {
    setUserSearch(search)
    if (search.length > 2) {
      await loadActiveUsers(search)
    } else if (search.length === 0) {
      await loadActiveUsers()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError("اسم الغرفة مطلوب")
      return
    }

    if (selectedUsers.length === 0) {
      setError("يجب إضافة مشارك واحد على الأقل")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onCreateRoom({
        ...formData,
        participants: selectedUsers.map((user) => user.email),
      })

      // Reset form
      setFormData({
        name: "",
        room_type: "GROUP",
        participants: [],
      })
      setSelectedUsers([])
      setUserSearch("")
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الغرفة")
    } finally {
      setLoading(false)
    }
  }

  const addUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user])
    }
    setUserSearchOpen(false)
  }

  const removeUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">إنشاء غرفة دردشة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              اسم الغرفة *
            </Label>
            <Input
              id="name"
              placeholder="أدخل اسم الغرفة"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="text-right"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room_type" className="text-sm font-medium">
              نوع الغرفة
            </Label>
            <Select
              value={formData.room_type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  room_type: value as "ONE_TO_ONE" | "GROUP" | "SUPPORT",
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ONE_TO_ONE">واحد لواحد</SelectItem>
                <SelectItem value="GROUP">مجموعة</SelectItem>
                <SelectItem value="SUPPORT">دعم</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">المشاركون *</Label>

            {/* User Search */}
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={userSearchOpen}
                  className="w-full justify-between text-right bg-transparent"
                >
                  <span className="text-gray-500">البحث عن المستخدمين...</span>
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="البحث عن المستخدمين..."
                    value={userSearch}
                    onValueChange={handleUserSearch}
                    className="text-right"
                  />
                  <CommandList>
                    <CommandEmpty>{loadingUsers ? "جاري البحث..." : "لا توجد نتائج"}</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => addUser(user)}
                          className="flex items-center gap-3 p-3"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>
                              {user.first_name.charAt(0)}
                              {user.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-right">
                            <p className="font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          {selectedUsers.find((u) => u.id === user.id) && <Check className="w-4 h-4 text-green-600" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">المشاركون المحددون:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {user.first_name.charAt(0)}
                          {user.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {user.first_name} {user.last_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUser(Number(user.id))}
                        className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || selectedUsers.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإنشاء...
                </div>
              ) : (
                <>
                  <Users className="w-4 h-4 ml-2" />
                  إنشاء الغرفة
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
